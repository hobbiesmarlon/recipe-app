import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_like_and_unlike_recipe(client: AsyncClient, auth_headers: dict):
    # 1. Create recipe
    payload = {"name": "Like Me", "ingredients": [{"name_text": "Salt", "quantity_text": "1"}], "steps": []}
    create_resp = await client.post("/recipes", json=payload, headers=auth_headers)
    recipe_id = create_resp.json()["id"]

    # 2. Like
    like_resp = await client.post(f"/recipes/{recipe_id}/like", headers=auth_headers)
    assert like_resp.status_code == 201
    assert like_resp.json()["status"] == "liked"

    # 3. Unlike
    unlike_resp = await client.delete(f"/recipes/{recipe_id}/like", headers=auth_headers)
    assert unlike_resp.status_code == 204

@pytest.mark.asyncio
async def test_save_and_unsave_recipe(client: AsyncClient, auth_headers: dict):
    # 1. Create recipe
    payload = {"name": "Save Me", "ingredients": [{"name_text": "Pepper", "quantity_text": "1"}], "steps": []}
    create_resp = await client.post("/recipes", json=payload, headers=auth_headers)
    recipe_id = create_resp.json()["id"]

    # 2. Save
    save_resp = await client.post(f"/recipes/{recipe_id}/save", headers=auth_headers)
    assert save_resp.status_code == 201

    # 3. List Saved (Verify it's there)
    list_resp = await client.get("/recipes/saved", headers=auth_headers)
    assert list_resp.status_code == 200
    assert any(r["id"] == recipe_id for r in list_resp.json()["recipes"])

    # 4. Unsave
    unsave_resp = await client.delete(f"/recipes/{recipe_id}/save", headers=auth_headers)
    assert unsave_resp.status_code == 204

@pytest.mark.asyncio
async def test_share_user_og_tags(client: AsyncClient, test_user_id: int):
    response = await client.get(f"/share/user/{test_user_id}")
    assert response.status_code == 200
    assert response.headers["content-type"] == "text/html; charset=utf-8"
    html = response.text
    assert '<meta property="og:type" content="profile"' in html
    # Just verify it ends with /u/{id} to be flexible with host
    assert f'/u/{test_user_id}"' in html

@pytest.mark.asyncio
async def test_share_recipe_og_tags(client: AsyncClient, auth_headers: dict):
    # 1. Create recipe
    payload = {"name": "Share Me Recipe", "ingredients": [], "steps": []}
    create_resp = await client.post("/recipes", json=payload, headers=auth_headers)
    recipe_id = create_resp.json()["id"]

    # 2. Get share page
    response = await client.get(f"/share/recipe/{recipe_id}")
    assert response.status_code == 200
    html = response.text
    assert '<meta property="og:type" content="article"' in html
    assert "Share Me Recipe" in html
    assert 'content="https://via.placeholder.com/1200x630?text=No+Image"' in html
