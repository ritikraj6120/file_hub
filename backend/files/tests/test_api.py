from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from files.models import File, StorageMetadata

class FileAPITests(APITestCase):
    def setUp(self):
        self.test_file_content = b'Test file content'
        self.test_file = SimpleUploadedFile(
            "test.pdf",
            self.test_file_content,
            content_type="application/pdf"
        )
        StorageMetadata.objects.create(id=1)

    def test_upload_file(self):
        """Test file upload endpoint"""
        url = '/api/files/'
        data = {'file': self.test_file}
        response = self.client.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(File.objects.count(), 1)
        self.assertEqual(response.data['original_filename'], 'test.pdf')

    def test_duplicate_file_upload(self):
        """Test uploading duplicate file"""
        url = '/api/files/'
        data = {'file': SimpleUploadedFile(
            "test1.pdf",
            self.test_file_content,
            content_type="application/pdf"
        )}
        response1 = self.client.post(url, data, format='multipart')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        data = {'file': SimpleUploadedFile(
            "test2.pdf",
            self.test_file_content,
            content_type="application/pdf"
        )}
        response2 = self.client.post(url, data, format='multipart')
        self.assertEqual(response2.status_code, status.HTTP_200_OK)
        
        metadata = StorageMetadata.get_instance()
        self.assertEqual(metadata.total_files_referenced, 2)
        self.assertEqual(metadata.unique_files_stored, 1)
        self.assertEqual(metadata.duplicates_prevented, 1)

    def test_list_files(self):
        """Test file listing with filters"""
        # Create test files
        File.objects.create(
            file=self.test_file,
            original_filename="test1.pdf",
            file_type="application/pdf",
            size=100,
            hash="123"
        )
        File.objects.create(
            file=self.test_file,
            original_filename="test2.pdf",
            file_type="application/pdf",
            size=200,
            hash="456"
        )

        # Test basic listing
        response = self.client.get('/api/files/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

        # Test search filter
        response = self.client.get('/api/files/?search=test1')
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['original_filename'], 'test1.pdf')

        # Test size filter
        response = self.client.get('/api/files/?min_size=150')
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['original_filename'], 'test2.pdf')

    def test_delete_file(self):
        """Test file deletion and metadata updates"""
        metadata = StorageMetadata.get_instance()
        initial_unique_files = metadata.unique_files_stored

        upload_url = '/api/files/'
        upload_data = {
            'file': SimpleUploadedFile(
                "test_delete.pdf",
                self.test_file_content,
                content_type="application/pdf"
            )
        }
        upload_response = self.client.post(upload_url, upload_data, format='multipart')
        self.assertEqual(upload_response.status_code, status.HTTP_201_CREATED)
        file_id = upload_response.data['id']
        
        metadata.refresh_from_db()
        self.assertEqual(metadata.unique_files_stored, initial_unique_files + 1)
        
        delete_url = f'/api/files/{file_id}/'
        delete_response = self.client.delete(delete_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(File.objects.count(), 0)
        
        metadata.refresh_from_db()
        self.assertEqual(metadata.unique_files_stored, initial_unique_files)