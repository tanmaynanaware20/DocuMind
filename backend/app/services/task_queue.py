import uuid
import time
from typing import Dict, Any, Optional
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"

class TaskQueueDispatcher:
    """
    Asynchronous task queue dispatcher scaffolding.
    Provides Celery/Redis background worker compatibility with an in-memory fallback.
    """
    def __init__(self):
        # task_id -> task dict
        self._tasks: Dict[str, Dict[str, Any]] = {}

    def enqueue_document_ingestion(self, document_id: str, file_name: str, file_size: int) -> str:
        task_id = f"task_ingest_{uuid.uuid4().hex[:10]}"
        self._tasks[task_id] = {
            "task_id": task_id,
            "task_type": "document_ingestion",
            "document_id": document_id,
            "file_name": file_name,
            "file_size": file_size,
            "status": TaskStatus.PENDING,
            "progress": 0,
            "enqueued_at": time.time(),
            "completed_at": None,
            "result": None,
            "error": None
        }
        return task_id

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        return self._tasks.get(task_id)

    def update_progress(self, task_id: str, progress: int, status: TaskStatus = TaskStatus.PROCESSING):
        if task_id in self._tasks:
            self._tasks[task_id]["progress"] = min(100, max(0, progress))
            self._tasks[task_id]["status"] = status
            if progress >= 100:
                self._tasks[task_id]["status"] = TaskStatus.SUCCESS
                self._tasks[task_id]["completed_at"] = time.time()

    def fail_task(self, task_id: str, error_message: str):
        if task_id in self._tasks:
            self._tasks[task_id]["status"] = TaskStatus.FAILED
            self._tasks[task_id]["error"] = error_message
            self._tasks[task_id]["completed_at"] = time.time()

task_dispatcher = TaskQueueDispatcher()
