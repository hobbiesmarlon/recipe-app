import pytest
import requests

@pytest.mark.asyncio
async def test_presigned_upload(client):
    resp = await client.post(
        "/media/presigned-posts",
        json=[
            {
                "filename": "test.jpg",
                "content_type": "image/jpeg",
                "type": "image"
            }
        ],
    )

    assert resp.status_code == 200
    data = resp.json()[0]

    assert "url" in data
    assert "key" in data
    # Based on app/api/v1/media.py, the key format is f"recipes/{uuid}_{filename}"
    assert data["key"].startswith("recipes/")

@pytest.mark.asyncio
async def test_upload_to_minio(client):
    # 1. Get Presigned URL
    resp = await client.post("/media/presigned-posts", json=[{
        "filename": "test.jpg",
        "content_type": "image/jpeg",
        "type": "image"
    }])
    
    assert resp.status_code == 200
    data = resp.json()[0]
    
    upload_url = data["url"]
    fields = data["fields"]
    
    # 2. Upload actual content to the MinIO/S3 URL
    # POST upload for presigned posts requires multipart/form-data
    
    files = {'file': ('test.jpg', b"fake-image-bytes", 'image/jpeg')}
    
    try:
        # requests.post for presigned POST
        upload_resp = requests.post(
            upload_url,
            data=fields,
            files=files,
            timeout=5
        )
        assert upload_resp.status_code in (200, 204)
    except requests.exceptions.ConnectionError:
        pytest.skip("MinIO not accessible at generated URL - check network config")