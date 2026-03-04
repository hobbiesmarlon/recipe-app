# AWS EventBridge & Lambda Maintenance Setup

This document outlines the background jobs in the RecipeApp and the serverless infrastructure required to trigger periodic maintenance tasks.

## 1. List of Background Jobs (Celery Tasks)

These tasks are defined in the `backend/app/tasks/` directory and are executed by the Celery worker.

| Task Name | Trigger | Purpose |
| :--- | :--- | :--- |
| `app.tasks.media.process_recipe_media_task` | API (Post-Publish) | Processes uploaded images/videos (thumbnails, metadata). |
| `app.tasks.media.cleanup_media_files_task` | API (Post-Delete) | Deletes physical files from storage (S3/MinIO). |
| **`app.tasks.maintenance.run_all_maintenance`** | **EventBridge** | Scans for and removes orphaned files in storage. |
| `app.tasks.user_sync.sync_oauth_details` | API (Login) | Syncs profile data from social providers (X/Google). |

---

## 2. Maintenance Bridge Lambda

Because we do not use a persistent scheduler (Celery Beat), we use an AWS Lambda function to "bridge" EventBridge triggers into our SQS queue.

### Lambda Configuration
*   **Runtime**: Python 3.12+
*   **IAM Role Permissions**: Must have `sqs:SendMessage` for the `recipefy` queue.
*   **Environment Variables**: `SQS_QUEUE_URL` (Optional if hardcoded).

### Lambda Function Code
```python
import boto3
import json
import base64
import os

def lambda_handler(event, context):
    sqs = boto3.client('sqs')
    # Cape Town SQS URL
    queue_url = "https://sqs.af-south-1.amazonaws.com/811734573504/recipefy"
    
    # specialized format Celery expects
    message_body = [
        [], # args
        {}, # kwargs
        {"callbacks": None, "errbacks": None, "chain": None, "chord": None}
    ]
    
    body_json = json.dumps(message_body)
    body_b64 = base64.b64encode(body_json.encode('utf-8')).decode('utf-8')
    
    celery_message = {
        "body": body_b64,
        "content-encoding": "utf-8",
        "content-type": "application/json",
        "headers": {"task": "app.tasks.maintenance.run_all_maintenance"},
        "properties": {
            "delivery_mode": 2,
            "delivery_info": {"exchange": "", "routing_key": "recipefy"},
            "body_encoding": "base64"
        }
    }
    
    sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps(celery_message))
    return {"statusCode": 200, "body": "Maintenance Task Enqueued"}
```

---

## 3. EventBridge Rule
Create a rule in Amazon EventBridge to trigger the Lambda above on a schedule.

*   **Rule Type**: Schedule
*   **Schedule Expression**: `cron(0 0 * * ? *)` (Runs every day at midnight UTC).
*   **Target**: The Lambda function created in Step 2.

---

## 4. Deployment Strategy

### Should I deploy EC2 first?
**No.** You can set up the Lambda and EventBridge trigger anytime from your local computer using the AWS Console or CLI.

**Why?**
*   **The Queue is a Buffer**: When the trigger fires, the Lambda puts a message in SQS.
*   **Persistence**: The message stays in the queue for up to 4 days.
*   **Decoupled Startup**: As soon as you eventually start your EC2 instance and run the Celery worker, it will automatically pull the waiting message and run the maintenance task.
