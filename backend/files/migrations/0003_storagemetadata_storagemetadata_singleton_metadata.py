# Generated by Django 4.2.20 on 2025-04-26 22:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0002_file_reference_count_alter_file_hash_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='StorageMetadata',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total_files_referenced', models.IntegerField(default=0)),
                ('unique_files_stored', models.IntegerField(default=0)),
                ('duplicates_prevented', models.IntegerField(default=0)),
                ('storage_saved_bytes', models.BigIntegerField(default=0)),
                ('storage_saved_mb', models.FloatField(default=0)),
            ],
        ),
        migrations.AddConstraint(
            model_name='storagemetadata',
            constraint=models.CheckConstraint(check=models.Q(('id', 1)), name='singleton_metadata'),
        ),
    ]
