import pytest

@pytest.mark.asyncio
async def test_create_recipe_with_media(client, auth_headers):
    # 1. Get URL
    presigned_resp = await client.post("/media/presigned-posts", json=[{
        "filename": "recipe.jpg", 
        "content_type": "image/jpeg", 
        "type": "image"
    }])
    upload_data = presigned_resp.json()[0]
    key = upload_data["key"]
    
    # 2. Upload
    import requests
    try:
        files = {'file': ('recipe.jpg', b"real-content", 'image/jpeg')}
        requests.post(upload_data["url"], data=upload_data["fields"], files=files, timeout=5)
    except:
        pass

    payload = {
        "name": "Test Recipe",
        "ingredients": [{"name_text": "Salt", "quantity_text": "1 tsp"}],
        "steps": [{"step_number": 1, "instruction": "Mix"}],
        "media": [{
            "key": key,
            "type": "image",
            "is_primary": True,
        }]
    }

    resp = await client.post(
        "/recipes/with-media",
        json=payload,
        headers=auth_headers,
    )
    
    if resp.status_code != 200:
        print(f"Response: {resp.text}")

    assert resp.status_code == 200
    body = resp.json()
    assert body["media_count"] == 1


@pytest.mark.asyncio
async def test_publish_requires_image(client, auth_headers):
    payload = {
        "name": "No Image",
        "ingredients": [{"name_text": "Salt", "quantity_text": "1 tsp"}],
        "steps": [{"step_number": 1, "instruction": "Mix"}],
        "media": [],
        "is_public": True,
    }

    resp = await client.post("/recipes/with-media", json=payload, headers=auth_headers)

    assert resp.status_code in (400, 422)

@pytest.mark.asyncio
async def test_media_urls_present(client, auth_headers):
    # 1. Upload Media
    presigned_resp = await client.post("/media/presigned-posts", json=[{
        "filename": "url_test.jpg", 
        "content_type": "image/jpeg", 
        "type": "image"
    }])
    upload_data = presigned_resp.json()[0]
    key = upload_data["key"]
    
    import requests
    try:
        files = {'file': ('url_test.jpg', b"real-content", 'image/jpeg')}
        requests.post(upload_data["url"], data=upload_data["fields"], files=files, timeout=5)
    except:
        pass

    # 2. Create Recipe
    payload = {
        "name": "Url Test Recipe",
        "ingredients": [{"name_text": "Salt", "quantity_text": "1 tsp"}],
        "steps": [{"step_number": 1, "instruction": "Mix"}],
        "media": [{
            "key": key,
            "type": "image",
            "is_primary": True,
        }]
    }
    create_resp = await client.post("/recipes/with-media", json=payload, headers=auth_headers)
    if create_resp.status_code != 200:
        print(f"Response: {create_resp.text}")
    assert create_resp.status_code == 200
    recipe_id = create_resp.json()["id"]

    # 3. Fetch Recipe
    get_resp = await client.get(f"/recipes/{recipe_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    data = get_resp.json()
    
    assert "media" in data
    assert len(data["media"]) > 0
    media_item = data["media"][0]
    
    assert media_item["url"] is not None
    assert media_item["url"].startswith("http")
    assert "thumbnail_small_url" in media_item
