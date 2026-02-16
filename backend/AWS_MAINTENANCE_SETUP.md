# AWS Maintenance Task Setup (EventBridge + Lambda)

This document explains how to set up automated maintenance tasks for your Recipe App using AWS Serverless infrastructure. This approach replaces `celery beat` and saves RAM on your server.

---

## 1. The AWS Lambda Function

This function sends a message to your SQS queue that your Celery worker understands.

### Setup Steps:
1. Create a Lambda function named `RecipeApp_TaskTrigger` (Python 3.12+).
2. Give the Lambda's role `sqs:SendMessage` permission for your Celery queue.

### Lambda Code (`lambda_function.py`):

```python
import boto3
import json
import base64
import os

def lambda_handler(event, context):
    sqs = boto3.client('sqs')
    
    # ⚠️ Environment Variable or hardcoded
    queue_url = os.environ.get("SQS_QUEUE_URL", "https://sqs.us-east-1.amazonaws.com/your-id/celery")
    
    # Determine which task to run based on the EventBridge input
    # Expected input: {"task": "maintenance"} or {"task": "user_sync"}
    task_type = event.get("task", "maintenance")
    
    task_map = {
        "maintenance": "app.tasks.maintenance.run_all_maintenance",
        "user_sync": "app.tasks.user_sync.sync_oauth_details"
    }
    
    task_name = task_map.get(task_type)
    
    # Celery Protocol Format
    message_body = [[], {}, {"callbacks": None, "errbacks": None, "chain": None, "chord": None}]
    body_json = json.dumps(message_body)
    body_b64 = base64.b64encode(body_json.encode('utf-8')).decode('utf-8')
    
    celery_message = {
        "body": body_b64,
        "content-encoding": "utf-8",
        "content-type": "application/json",
        "headers": {"task": task_name},
        "properties": {
            "delivery_mode": 2,
            "delivery_info": {"exchange": "", "routing_key": "celery"},
            "body_encoding": "base64"
        }
    }
    
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(celery_message))
    return {"statusCode": 200, "body": f"Enqueued: {task_name}"}
```

---

## 2. EventBridge Rules (The Schedules)

You should now create **two** rules in EventBridge, both pointing to the same Lambda function but with different "Constant JSON" inputs.

### Rule A: Hourly Maintenance
- **Schedule**: Cron `0 * * * ? *` (Every hour)
- **Target**: Lambda `RecipeApp_TaskTrigger`
- **Configure Input**: Select **Constant (JSON text)** and enter: `{"task": "maintenance"}`

### Rule B: Nightly User Sync
- **Schedule**: Cron `0 2 * * ? *` (Daily at 2 AM UTC)
- **Target**: Lambda `RecipeApp_TaskTrigger`
- **Configure Input**: Select **Constant (JSON text)** and enter: `{"task": "user_sync"}`

---

## 3. Local Development Note
If you want to test these schedules locally without AWS, you can still run `celery beat` using the schedule I added to `celery_app.py`. However, for your production EC2 instance, you can safely ignore `celery beat` entirely.
