from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.exceptions import ValidationError
from files.models import File, StorageMetadata

class FileModelTests(TestCase):
    def setUp(self):
        self.test_file_content = b'Test file content'
        self.test_file = SimpleUploadedFile(
            "test.pdf",
            self.test_file_content,
            content_type="application/pdf"
        )

    def test_file_creation(self):
        """Test creating a new file"""
        file = File.objects.create(
            file=self.test_file,
            original_filename="test.pdf",
            file_type="application/pdf",
            size=len(self.test_file_content),
            hash="123456"
        )
        self.assertEqual(file.original_filename, "test.pdf")
        self.assertEqual(file.file_type, "application/pdf")
        self.assertEqual(file.size, len(self.test_file_content))
        self.assertEqual(file.reference_count, 1)

    def test_file_validation(self):
        """Test file validation rules"""
        # Test invalid file extension
        invalid_file = SimpleUploadedFile(
            "test.txt",
            b"Invalid file type",
            content_type="text/plain"
        )
        with self.assertRaises(ValidationError):
            File.objects.create(
                file=invalid_file,
                original_filename="test.txt",
                file_type="text/plain",
                size=len(b"Invalid file type"),
                hash="123456"
            )

class StorageMetadataTests(TestCase):
    def setUp(self):
        self.metadata = StorageMetadata.objects.create(id=1)
        
    def test_singleton_constraint(self):
        """Test that only one StorageMetadata instance can exist"""
        with self.assertRaises(Exception):
            StorageMetadata.objects.create(id=2)
            
    def test_get_instance(self):
        """Test get_instance class method"""
        instance1 = StorageMetadata.get_instance()
        instance2 = StorageMetadata.get_instance()
        self.assertEqual(instance1.id, instance2.id)
        self.assertEqual(StorageMetadata.objects.count(), 1)