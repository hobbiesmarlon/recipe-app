import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_recipes(client: AsyncClient):
    response = await client.get("/recipes")
    assert response.status_code == 200
    data = response.json()
    assert "recipes" in data
    assert isinstance(data["recipes"], list)

@pytest.mark.asyncio
async def test_create_and_get_recipe(client: AsyncClient, auth_headers: dict):
    # Create
    payload = {
        "name": "Full CRUD Recipe",
        "description": "Delicious test recipe",
        "cook_time_minutes": 30,
        "servings": 4,
        "ingredients": [{"name_text": "Salt", "quantity_text": "1 tsp"}],
        "steps": [{"step_number": 1, "instruction": "Add salt"}],
        "is_public": False
    }
    create_resp = await client.post("/recipes", json=payload, headers=auth_headers)
    assert create_resp.status_code == 200
    recipe_id = create_resp.json()["id"]

    # Get
    get_resp = await client.get(f"/recipes/{recipe_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    data = get_resp.json()
    assert data["name"] == "Full CRUD Recipe"
    assert data["is_public"] is False

@pytest.mark.asyncio
async def test_update_recipe(client: AsyncClient, auth_headers: dict):
    # 1. Create
    payload = {
        "name": "Update Me",
        "ingredients": [{"name_text": "Water", "quantity_text": "1 cup"}],
        "steps": [{"step_number": 1, "instruction": "Boil"}],
    }
    create_resp = await client.post("/recipes", json=payload, headers=auth_headers)
    recipe_id = create_resp.json()["id"]

    # 2. Update
    update_payload = {
        "name": "Updated Name",
        "cook_time_minutes": 45
    }
    update_resp = await client.patch(f"/recipes/{recipe_id}", json=update_payload, headers=auth_headers)
    assert update_resp.status_code == 200
    
    # 3. Verify
    get_resp = await client.get(f"/recipes/{recipe_id}", headers=auth_headers)
    assert get_resp.json()["name"] == "Updated Name"

@pytest.mark.asyncio
async def test_delete_recipe(client: AsyncClient, auth_headers: dict):
    # 1. Create
    payload = {
        "name": "Delete Me",
        "ingredients": [{"name_text": "Air", "quantity_text": "all"}],
        "steps": [{"step_number": 1, "instruction": "Breathe"}],
    }
    create_resp = await client.post("/recipes", json=payload, headers=auth_headers)
    recipe_id = create_resp.json()["id"]

    # 2. Delete
    del_resp = await client.delete(f"/recipes/{recipe_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # 3. Verify
    get_resp = await client.get(f"/recipes/{recipe_id}", headers=auth_headers)
    assert get_resp.status_code == 404

@pytest.mark.asyncio
async def test_other_user_cannot_delete_my_recipe(client: AsyncClient, auth_headers: dict, other_auth_headers: dict):
    # 1. User A creates recipe
    payload = {
        "name": "User A Recipe", 
        "ingredients": [{"name_text": "Secret", "quantity_text": "1"}], 
        "steps": [{"step_number": 1, "instruction": "Hide"}]
    }
    create_resp = await client.post("/recipes", json=payload, headers=auth_headers)
    recipe_id = create_resp.json()["id"]

    # 2. User B tries to delete User A's recipe
    del_resp = await client.delete(f"/recipes/{recipe_id}", headers=other_auth_headers)
    assert del_resp.status_code == 403

@pytest.mark.asyncio
async def test_create_recipe_with_media(client, auth_headers):
    # Mocking the media upload post
    presigned_resp = await client.post("/media/presigned-posts", json=[{
        "filename": "recipe.jpg", 
        "content_type": "image/jpeg", 
        "type": "image"
    }])
    assert presigned_resp.status_code == 200
    upload_data = presigned_resp.json()[0]
    key = upload_data["key"]
    
    # Actually upload a dummy file to the mock S3
    import requests
    files = {'file': ('recipe.jpg', b"dummy-content", 'image/jpeg')}
    requests.post(upload_data["url"], data=upload_data["fields"], files=files, timeout=5)
    
    payload = {
        "name": "Test Recipe Media",
        "ingredients": [{"name_text": "Salt", "quantity_text": "1 tsp"}],
        "steps": [{"step_number": 1, "instruction": "Mix"}],
        "media": [{
            "key": key,
            "type": "image",
            "is_primary": True,
        }]
    }

    # This should pass now because s3_client is patched to localhost:9000
    resp = await client.post("/recipes/with-media", json=payload, headers=auth_headers)
    assert resp.status_code == 200

@pytest.mark.asyncio
async def test_search_recipes_by_name(client: AsyncClient, auth_headers: dict):
    # 1. Create a searchable recipe
    payload = {
        "name": "Unique Searchable Name",
        "description": "Special Keyword",
        "ingredients": [{"name_text": "Salt", "quantity_text": "1 tsp"}],
        "steps": [{"step_number": 1, "instruction": "Mix"}]
    }
    await client.post("/recipes", json=payload, headers=auth_headers)

    # 2. Search by name
    response = await client.get("/recipes?search=Unique")
    assert response.status_code == 200
    data = response.json()
    assert any("Unique" in r["name"] for r in data["recipes"])

    # 3. Search by description
    response = await client.get("/recipes?search=Special")
    assert response.status_code == 200
    data = response.json()
    assert any("Unique" in r["name"] for r in data["recipes"])

@pytest.mark.asyncio
async def test_filter_recipes_by_category(client: AsyncClient, auth_headers: dict):
    # 1. Create recipe with category 57 (Fruit-Based)
    payload = {
        "name": "Fruity Recipe",
        "categories": [57],
        "ingredients": [{"name_text": "Fruit", "quantity_text": "1"}],
        "steps": [{"step_number": 1, "instruction": "Eat"}]
    }
    await client.post("/recipes", json=payload, headers=auth_headers)

    # 2. Filter by category
    response = await client.get("/recipes?category_ids=57")
    assert response.status_code == 200
    data = response.json()
    assert len(data["recipes"]) >= 1
    # Schema returns category names as strings
    assert any("Fruit-Based" in r.get("categories", []) for r in data["recipes"])
    assert any("Fruity" in r["name"] for r in data["recipes"])

@pytest.mark.asyncio
async def test_combined_search_and_filter(client: AsyncClient, auth_headers: dict):
    # Create recipe
    payload = {
        "name": "Complex Search",
        "categories": [1], # Breakfast
        "ingredients": [{"name_text": "Egg", "quantity_text": "1"}],
        "steps": [{"step_number": 1, "instruction": "Cook"}]
    }
    await client.post("/recipes", json=payload, headers=auth_headers)

    # Search + Filter
    response = await client.get("/recipes?search=Complex&category_ids=1")
    assert response.status_code == 200
    data = response.json()
    assert any("Complex" in r["name"] for r in data["recipes"])
