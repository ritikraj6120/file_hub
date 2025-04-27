from rest_framework import serializers
from .models import File, StorageMetadata

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file', 'original_filename', 'file_type', 'size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at'] 

class StorageMetadataSerializer(serializers.ModelSerializer):

    class Meta:
        model = StorageMetadata
        fields = [
            'total_files_referenced',
            'unique_files_stored',
            'duplicates_prevented',
            'storage_saved_mb',
        ]
