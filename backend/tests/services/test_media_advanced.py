import pytest
from app.services.media_service import upload_bytes, list_objects, delete_object
from app.services.media_cleanup import cleanup_media_files
from app.core.config import settings

@pytest.mark.asyncio
async def test_upload_and_list_s3_objects():
    # 1. Upload
    test_key = "test/integration_file.txt"
    upload_bytes(test_key, b"test content", "text/plain")

    # 2. List
    objects = list_objects(prefix="test/")
    assert any(obj["Key"] == test_key for obj in objects)

    # 3. Delete
    delete_object(test_key)
    objects_after = list_objects(prefix="test/")
    assert not any(obj["Key"] == test_key for obj in objects_after)

@pytest.mark.asyncio
async def test_cleanup_media_files_graceful():
    # Test that cleanup doesn't crash on non-existent files
    # Should just handle it and continue
    cleanup_media_files(["non_existent_1.jpg", "non_existent_2.jpg"])
    assert True

@pytest.mark.asyncio
async def test_media_service_presigned_urls():
    from app.services.media_service import generate_presigned_upload_url, generate_presigned_download_url
    
    upload_url = generate_presigned_upload_url("test.jpg", "image/jpeg")
    assert upload_url.startswith("http")
    assert "/recipe-media/test.jpg" in upload_url or "/test.jpg" in upload_url

    download_url = generate_presigned_download_url("test.jpg")
    assert download_url.startswith("http")
    assert "test.jpg" in download_url
