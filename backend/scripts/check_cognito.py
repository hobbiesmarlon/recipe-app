import httpx
import asyncio
import os
from pydantic_settings import BaseSettings

class CognitoSettings(BaseSettings):
    COGNITO_USER_POOL_ID: str | None = None
    COGNITO_APP_CLIENT_ID: str | None = None
    COGNITO_REGION: str = "us-east-1"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

async def check_cognito():
    settings = CognitoSettings()
    print("🔍 Checking Cognito Configuration...")
    
    missing = []
    if not settings.COGNITO_USER_POOL_ID: missing.append("COGNITO_USER_POOL_ID")
    if not settings.COGNITO_APP_CLIENT_ID: missing.append("COGNITO_APP_CLIENT_ID")
    
    if missing:
        print(f"❌ MISSING CONFIG: {', '.join(missing)}")
        print("\nTo test, you must create a User Pool in AWS and add these to your .env")
        return

    print(f"✅ Config found for Region: {settings.COGNITO_REGION}")
    
    # Test Connectivity to AWS Public Keys (JWKS)
    jwks_url = f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{settings.COGNITO_USER_POOL_ID}/.well-known/jwks.json"
    print(f"🌐 Testing connectivity to: {jwks_url}")
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(jwks_url)
            if resp.status_code == 200:
                print("✅ SUCCESS: Backend can reach AWS Cognito and fetch Public Keys.")
                keys = resp.json().get("keys", [])
                print(f"🔑 Found {len(keys)} active security keys in your User Pool.")
            else:
                print(f"❌ FAILED: AWS returned {resp.status_code}. Check your Pool ID and Region.")
    except Exception as e:
        print(f"❌ NETWORK ERROR: Could not reach AWS. {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_cognito())
