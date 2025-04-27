from django.db import models
import uuid
import os
import hashlib

def file_upload_path(instance, filename):
    """Generate file path for new file upload"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads', filename)

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4,null=False, editable=False)
    file = models.FileField(upload_to=file_upload_path,null=False)
    original_filename = models.CharField(max_length=255,null=False,blank=False,db_index=True)
    hash = models.CharField(max_length=64, unique=True, null=False,db_index=True)
    file_type = models.CharField(max_length=100,null=False,  blank=False, db_index=True)
    size = models.BigIntegerField(null=False, db_index=True)
    uploaded_at = models.DateTimeField(auto_now_add=True,null=False, db_index=True)
    reference_count = models.BigIntegerField(default=1,null=False)
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            # Add composite index
            models.Index(
                fields=['file_type', 'size', 'uploaded_at'],
                name='idx_file_composite'
            ),
        ]
    
    def save(self, *args, **kwargs):
        if not self.hash:
            self.hash = hashlib.sha256(self.file.read()).hexdigest()
            self.file.seek(0)  # Reset file pointer after reading
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.original_filename

class StorageMetadata(models.Model):
    total_files_referenced = models.IntegerField(default=0)
    unique_files_stored = models.IntegerField(default=0)
    duplicates_prevented = models.IntegerField(default=0)
    # storage_saved_bytes = models.BigIntegerField(default=0)
    storage_saved_mb = models.FloatField(default=0)

    class Meta:
        # Ensure only one row exists
        constraints = [
            models.CheckConstraint(check=models.Q(id=1), name='singleton_metadata')
        ]

    @classmethod
    def get_instance(cls):
        obj, _ = cls.objects.get_or_create(id=1)
        return obj