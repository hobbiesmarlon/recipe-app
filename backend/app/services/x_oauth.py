import httpx
from app.core.config import settings

X_AUTHORIZE_URL = "https://twitter.com/i/oauth2/authorize"
X_TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
X_USER_URL = "https://api.twitter.com/2/users/me"

SCOPES = "tweet.read users.read offline.access"

async def get_authorization_url(code_challenge: str, state: str) -> str:
    return (
        f"{X_AUTHORIZE_URL}"
        f"?response_type=code"
        f"&client_id={settings.X_CLIENT_ID}"
        f"&redirect_uri={settings.X_REDIRECT_URI}"
        f"&scope={SCOPES}"
        f"&state={state}"
        f"&code_challenge={code_challenge}"
        f"&code_challenge_method=S256"
    )

async def exchange_code_for_token(code: str, code_verifier: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            X_TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": settings.X_REDIRECT_URI,
                "client_id": settings.X_CLIENT_ID,
                "code_verifier": code_verifier,
            },
            auth=(settings.X_CLIENT_ID, settings.X_CLIENT_SECRET),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        response.raise_for_status()
        return response.json()

async def fetch_x_user(access_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(
            X_USER_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            params={"user.fields": "profile_image_url,username,name"},
        )
        response.raise_for_status()
        return response.json()["data"]
