import pytest
from app.services.media_cleanup import cleanup_orphaned_uploads

@pytest.mark.asyncio
async def test_cleanup_orphaned_media(db):
    # This just ensures the function runs without error. 
    # Validating actual deletion requires setting up old objects in MinIO.
    
    try:
        # We can just run it. It returns nothing or None.
        cleanup_orphaned_uploads(hours=0) # Cleanup everything older than 0 hours
        assert True
    except Exception as e:
        pytest.fail(f"Cleanup failed: {e}")
