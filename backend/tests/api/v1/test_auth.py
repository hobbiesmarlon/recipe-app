import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_current_user(client: AsyncClient, auth_headers: dict):
    response = await client.get("/users/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"

@pytest.mark.asyncio
async def test_get_current_user_unauthorized(client: AsyncClient):
    response = await client.get("/users/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_update_user_profile(client: AsyncClient, auth_headers: dict):
    update_data = {
        "display_name": "New Display Name",
        "username": "newusername"
    }
    response = await client.patch("/users/me", json=update_data, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["display_name"] == "New Display Name"
    assert data["username"] == "newusername"

@pytest.mark.asyncio
async def test_get_user_by_id(client: AsyncClient, test_user_id: int):
    response = await client.get(f"/users/{test_user_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_user_id

@pytest.mark.asyncio
async def test_get_user_not_found(client: AsyncClient):
    response = await client.get("/users/99999")
    assert response.status_code == 404
