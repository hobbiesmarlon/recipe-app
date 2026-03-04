from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "recipe_app",
    broker=settings.CELERY_BROKER_URL,
    include=[
        "app.tasks.media",
        "app.tasks.maintenance",
        "app.tasks.user_sync",
    ]
)

# SQS transport options
transport_options = {
    "region": settings.AWS_REGION,
    "visibility_timeout": 3600,
    "polling_interval": 10,
}

# Only apply local/custom endpoint settings if an override URL is provided
# This ensures production (real AWS SQS) uses default secure connections
if settings.AWS_SQS_ENDPOINT_URL:
    transport_options.update({
        "is_secure": False,
        "port": 9324,
    })

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_transport_options=transport_options,
    task_default_queue="recipefy", # Match your SQS queue name
    worker_max_tasks_per_child=10,
    worker_prefetch_multiplier=1,
)
