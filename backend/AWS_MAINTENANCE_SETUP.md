# AWS Maintenance Task Setup (EventBridge + Lambda)

This document explains how to set up automated maintenance tasks (like orphaned media cleanup) for your Recipe App using AWS Serverless infrastructure. This approach saves ~80MB of RAM on your EC2 instance by avoiding the need for a local `celery beat` process.

---

## 1. The AWS Lambda Function

This function acts as the "bridge." It is triggered by a timer and sends a correctly formatted message to your SQS queue that your Celery worker understands.

### Setup Steps:
1. Go to the **AWS Lambda Console**.
2. Click **Create function** -> **Author from scratch**.
3. **Function name**: `RecipeApp_MaintenanceTrigger`.
4. **Runtime**: `Python 3.12` (or latest).
5. **Permissions**: Ensure the Lambda's execution role has `sqs:SendMessage` permission for your Celery queue.

### Lambda Code (`lambda_function.py`):

```python
import boto3
import json
import base64

def lambda_handler(event, context):
    sqs = boto3.client('sqs')
    
    #  UPDATE THIS to your production SQS URL
    queue_url = "https://sqs.us-east-1.amazonaws.com/123456789012/celery"
    
    # 1. The Task Payload (Arguments for the function)
    # Our cleanup task takes no arguments.
    task_args = []
    task_kwargs = {}
    
    # 2. Celery Protocol Format
    # The message body must be: [args, kwargs, embed_metadata]
    message_body = [
        task_args, 
        task_kwargs, 
        {"callbacks": None, "errbacks": None, "chain": None, "chord": None}
    ]
    
    # Base64 encode the body (Celery standard for SQS)
    body_json = json.dumps(message_body)
    body_b64 = base64.b64encode(body_json.encode('utf-8')).decode('utf-8')
    
    # 3. Construct the Full SQS Message
    celery_message = {
        "body": body_b64,
        "content-encoding": "utf-8",
        "content-type": "application/json",
        "headers": {
            "task": "app.tasks.maintenance.run_all_maintenance"
        },
        "properties": {
            "delivery_mode": 2,
            "delivery_info": {"exchange": "", "routing_key": "celery"},
            "body_encoding": "base64"
        }
    }
    
    # 4. Send to SQS
    sqs.send_message(
        QueueUrl=queue_url, 
        MessageBody=json.dumps(celery_message)
    )
    
    return {
        "statusCode": 200,
        "body": json.dumps("Maintenance Task Enqueued Successfully")
    }
```

---

## 2. The EventBridge Rule (The Alarm)

This service will trigger the Lambda function on a schedule.

### Setup Steps:
1. Go to the **Amazon EventBridge Console**.
2. Select **Rules** -> **Create rule**.
3. **Name**: `DailyOrphanedMediaCleanup`.
4. **Rule type**: `Schedule`.
5. **Schedule pattern**:
   - Select **A schedule that runs at a regular rate or on a specific time**.
   - Use **Cron expression**: `0 0 * * ? *` (This runs every day at 00:00 UTC).
6. **Target types**: `AWS service`.
7. **Select a target**: `Lambda function`.
8. **Function**: Select `RecipeApp_MaintenanceTrigger`.
9. Click **Create**.

---

## 3. Benefits for your t3.micro (1GB RAM)

1. **Memory Efficiency**: Your EC2 instance only runs the API and the Worker. It doesn't waste RAM waiting for a clock to tick.
2. **Cost**: Both EventBridge and Lambda have massive free tiers (1 Million events/month). You will likely pay $0.00 for this.
3. **Reliability**: If your EC2 instance is down for maintenance, the tasks stay in SQS and will be processed immediately once the instance comes back up.
