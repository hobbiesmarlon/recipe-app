# AWS Scheduled Tasks Setup (EventBridge + Lambda)

This guide explains how to set up serverless scheduling for your Recipe App's background jobs. This architecture allows you to run periodic maintenance and synchronization tasks without paying for a dedicated scheduler server (saving ~80MB RAM on your main instance).

---

## Architecture Overview

1.  **Amazon EventBridge**: Acts as the "Clock". It triggers on a schedule (Cron).
2.  **AWS Lambda**: Acts as the "Bridge". It takes the trigger and pushes a message to SQS.
3.  **Amazon SQS**: The queue where your Celery workers are listening.
4.  **Celery Worker**: Picks up the message and executes the Python code.

---

## 1. The Generic Lambda Function

We will create **one single Lambda function** that can trigger *any* Celery task. The specific task to run will be passed in the event payload.

### Setup Steps:
1.  Go to the **AWS Lambda Console**.
2.  Click **Create function** -> **Author from scratch**.
3.  **Function name**: `RecipeApp_CeleryTrigger`.
4.  **Runtime**: `Python 3.12` (or latest).
5.  **Permissions**:
    *   Go to **Configuration** -> **Permissions** -> **Role name**.
    *   Attach a policy that allows `sqs:SendMessage` to your production SQS queue.

### Lambda Code (`lambda_function.py`):

```python
import boto3
import json
import base64
import os

def lambda_handler(event, context):
    """
    Generic Celery Trigger.
    Expects 'event' to contain: {"task": "app.tasks.path.to.task"}
    """
    sqs = boto3.client('sqs')
    
    # 1. Configuration
    # Replace with your actual SQS Queue URL
    QUEUE_URL = os.environ.get('SQS_QUEUE_URL', "https://sqs.us-east-1.amazonaws.com/123456789012/recipefy")
    
    # 2. Extract Task Name from Event
    # Default to maintenance if not specified, but better to be explicit
    task_name = event.get("task", "app.tasks.maintenance.run_all_maintenance")
    
    print(f"Triggering Celery task: {task_name}")

    # 3. Celery Message Protocol
    # Body structure: [args, kwargs, embed_metadata]
    message_body = [
        [], # args
        {}, # kwargs
        {"callbacks": None, "errbacks": None, "chain": None, "chord": None}
    ]
    
    # Base64 encode the body (Celery standard requirement for SQS transport)
    body_json = json.dumps(message_body)
    body_b64 = base64.b64encode(body_json.encode('utf-8')).decode('utf-8')
    
    # 4. Construct SQS Message
    celery_message = {
        "body": body_b64,
        "content-encoding": "utf-8",
        "content-type": "application/json",
        "headers": {
            "task": task_name,
            # Optional: Add other Celery headers like 'id', 'timelimit' if needed
        },
        "properties": {
            "delivery_mode": 2, # Persistent
            "delivery_info": {"exchange": "", "routing_key": "celery"},
            "body_encoding": "base64"
        }
    }
    
    # 5. Send to Queue
    response = sqs.send_message(
        QueueUrl=QUEUE_URL, 
        MessageBody=json.dumps(celery_message)
    )
    
    return {
        "statusCode": 200,
        "body": json.dumps(f"Triggered {task_name}"),
        "messageId": response.get("MessageId")
    }
```

---

## 2. Setting Up Schedules (EventBridge)

You will create separate rules for each task, all targeting the same Lambda function but with different payloads.

### Task A: Master Maintenance (Daily)
*Cleans up orphaned files, retries stuck jobs, deletes expired drafts.*

1.  Go to **Amazon EventBridge** -> **Rules** -> **Create rule**.
2.  **Name**: `RecipeApp_DailyMaintenance`.
3.  **Schedule**: Cron expression `0 0 * * ? *` (Midnight UTC daily).
4.  **Target**: Select **Lambda function** -> `RecipeApp_CeleryTrigger`.
5.  **Target Input**: Select **Constant (JSON text)**.
6.  **JSON Payload**:
    ```json
    { "task": "app.tasks.maintenance.run_all_maintenance" }
    ```

### Task B: User Profile Sync (Weekly/Daily)
*Syncs usernames and profile pictures from social providers (e.g., X/Twitter).*

1.  Create another rule.
2.  **Name**: `RecipeApp_UserProfileSync`.
3.  **Schedule**: Cron expression `0 3 * * ? *` (3 AM UTC daily).
    *   *Note: This API is rate-limited by X/Twitter, so running it once a day or week is safer than hourly.*
4.  **Target**: Select **Lambda function** -> `RecipeApp_CeleryTrigger`.
5.  **Target Input**: Select **Constant (JSON text)**.
6.  **JSON Payload**:
    ```json
    { "task": "app.tasks.user_sync.sync_oauth_details" }
    ```

---

## 3. Deployment Checklist

- [ ] **Lambda Created**: Function code pasted and saved.
- [ ] **Permissions Set**: Lambda execution role has `sqs:SendMessage` allowed.
- [ ] **Environment Variable**: `SQS_QUEUE_URL` set in Lambda configuration (or hardcoded).
- [ ] **EventBridge Rules**: Both rules created with correct JSON payloads.
- [ ] **Testing**: You can manually trigger the Lambda with the "Test" button in the AWS console using the JSON payloads above to verify it enqueues messages.
