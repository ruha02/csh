"""Celery application instance."""

from celery import Celery

from ..core.config import settings

celery = Celery("csh", broker=settings.redis_url, backend=settings.redis_url)
celery.conf.task_serializer = "json"
celery.conf.result_serializer = "json"
celery.conf.accept_content = ["json"]
celery.conf.task_track_started = True
