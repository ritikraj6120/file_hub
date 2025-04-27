import hashlib
from django.shortcuts import render
from django.utils.dateparse import parse_date
from django.db.models import Sum, Count
from django.db import transaction
from django.core.paginator import Paginator
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import File, StorageMetadata
from .serializers import FileSerializer, StorageMetadataSerializer


# Create your views here.

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB in bytes

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
    
        if file_obj.size > self.MAX_FILE_SIZE:
            return Response(
                {'error': f'File size cannot exceed 10 MB'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        print("come till here")
        with transaction.atomic():
            file_hash = hashlib.sha256(file_obj.read()).hexdigest()
            file_obj.seek(0)  # Reset file pointer after reading
            existing_file = File.objects.filter(hash=file_hash).first()
            metadata = StorageMetadata.get_instance()
            if existing_file:
                # Update reference count and metadata for duplicate file
                existing_file.reference_count += 1
                existing_file.save()
                # Update metadata
                metadata.total_files_referenced += 1
                metadata.duplicates_prevented += 1
                metadata.storage_saved_mb += existing_file.size / (1024 * 1024)
                metadata.save()
                return Response(FileSerializer(existing_file).data, status=status.HTTP_200_OK)
            # Create new file
            data = {
                'file': file_obj,
                'original_filename': file_obj.name,
                'file_type': file_obj.content_type,
                'size': file_obj.size,
                'hash': file_hash,
                'reference_count': 1
            }
        
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            # Update metadata for new file
            metadata.total_files_referenced += 1
            metadata.unique_files_stored += 1
            metadata.save()

            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        # Apply filters conditionally
        if search := request.query_params.get('search'):
            queryset = queryset.filter(original_filename__icontains=search)
            
        if file_type := request.query_params.get('file_type'):
            queryset = queryset.filter(file_type=file_type)
            
        if min_size := request.query_params.get('min_size'):
            queryset = queryset.filter(size__gte=int(min_size))
            
        if max_size := request.query_params.get('max_size'):
            queryset = queryset.filter(size__lte=int(max_size))
            
        if upload_date := request.query_params.get('upload_date'):
            queryset = queryset.filter(uploaded_at__date=parse_date(upload_date))
        
        # Add pagination
        page_size = int(request.query_params.get('page_size', 5))
        page = int(request.query_params.get('page', 1))
        
        paginator = Paginator(queryset, page_size)
        results = paginator.get_page(page)

        serializer = self.get_serializer(results, many=True)
        
        return Response({
            'results': serializer.data,
            'total': paginator.count,
            'pages': paginator.num_pages,
            'current_page': page
        })
    
        # page = self.paginate_queryset(queryset)
        # if page is not None:
        #     serializer = self.get_serializer(page, many=True)
        #     return self.get_paginated_response(serializer.data)
    
        # serializer = self.get_serializer(queryset, many=True)
        # return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        with transaction.atomic():
            metadata = StorageMetadata.get_instance()
            
            # Delete the physical file first
            instance.file.delete(save=False)  # Delete from media storage
            
            metadata.unique_files_stored -= 1  # Decrease unique files since we're deleting the actual file
            metadata.save()
            
            # Delete the database record
            instance.delete()
            
            return Response(status=status.HTTP_204_NO_CONTENT)
    
class StorageMetadataViewSet(mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """
    ViewSet for retrieving storage metadata.
    Allows only GET operations since we maintain a single instance.
    """
    queryset = StorageMetadata.objects.all()
    serializer_class = StorageMetadataSerializer

    def get_object(self):
        """Always return the singleton instance"""
        return StorageMetadata.get_instance()