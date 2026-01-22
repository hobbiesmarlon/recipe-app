# Critical SQS & Celery Production Settings

To ensure your backend runs safely on a **t3.micro (1GB RAM)** instance without crashing or double-processing videos, you must apply these specific limits in both your code and the AWS Console.

---

## 1. SQS Visibility Timeout (The Most Important)
When SQS hands a task to your worker, it "hides" it from others. If the timeout is too short, SQS will release the task while the worker is still running, causing a second worker to start and triggering an **Out of Memory (OOM) crash**.

*   **Recommended Value**: **300 seconds (5 minutes)**.
*   **Where to set it**: 
    1.  **AWS Console**: In the SQS Queue configuration -> "Visibility Timeout".
    2.  **Code (`celery_app.py`)**: `broker_transport_options = {"visibility_timeout": 300}`.

---

## 2. Celery Task Time Limits
Prevent a single corrupted or massive file from hanging your worker process indefinitely.

*   **Soft Time Limit**: **120 seconds** (Allows the task to catch an exception and clean up).
*   **Hard Time Limit**: **150 seconds** (Forcibly kills the task process).
*   **Where to set it**: `celery_app.conf.update(task_soft_time_limit=120, task_time_limit=150)`.

---

## 3. Concurrency & Pool Type
On 1GB RAM, you cannot run multiple workers. You must use the `solo` pool for stability with `asyncio`.

*   **Pool Type**: `solo`
*   **Concurrency**: `1`
*   **Startup Command**: `celery -A app.celery_app worker -P solo --loglevel=info`

---

## 4. Worker Recycling (Memory Leaks)
Small instances are vulnerable to memory leaks in libraries like Pillow or FFmpeg.

*   **Max Tasks Per Child**: **10** (Restarts the worker process after every 10 tasks to clear RAM).
*   **Where to set it**: `celery_app.conf.update(worker_max_tasks_per_child=10)`.

---

## Summary Checklist for Deployment:
- [ ] SQS Visibility Timeout set to **5m** in AWS.
- [ ] SQS Queue created as a **Standard** queue (unless you specifically need FIFO).
- [ ] EC2 Instance has `ffmpeg` installed (`sudo apt install ffmpeg`).
- [ ] Environment variable `USE_COGNITO` set to `True`.
