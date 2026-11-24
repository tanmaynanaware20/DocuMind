import pytest
from backend.app.services.task_queue import TaskQueueDispatcher, TaskStatus

def test_task_queue_lifecycle():
    dispatcher = TaskQueueDispatcher()

    # 1. Enqueue task
    task_id = dispatcher.enqueue_document_ingestion("doc_101", "q3_report.pdf", 5242880)
    assert task_id.startswith("task_ingest_")

    task = dispatcher.get_task(task_id)
    assert task is not None
    assert task["status"] == TaskStatus.PENDING
    assert task["progress"] == 0

    # 2. Update progress
    dispatcher.update_progress(task_id, 50, TaskStatus.PROCESSING)
    task = dispatcher.get_task(task_id)
    assert task["progress"] == 50
    assert task["status"] == TaskStatus.PROCESSING

    # 3. Complete task
    dispatcher.update_progress(task_id, 100)
    task = dispatcher.get_task(task_id)
    assert task["status"] == TaskStatus.SUCCESS
    assert task["progress"] == 100
    assert task["completed_at"] is not None

def test_task_queue_failure():
    dispatcher = TaskQueueDispatcher()
    task_id = dispatcher.enqueue_document_ingestion("doc_bad", "corrupted.docx", 1024)
    dispatcher.fail_task(task_id, "File header corrupted")

    task = dispatcher.get_task(task_id)
    assert task["status"] == TaskStatus.FAILED
    assert task["error"] == "File header corrupted"
