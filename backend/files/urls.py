from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FileViewSet, StorageMetadataViewSet

router = DefaultRouter()
router.register(r'files', FileViewSet)
router.register(r'storage-metadata', StorageMetadataViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 