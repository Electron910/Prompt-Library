import redis
from django.conf import settings

_client = None


def get_redis_client():
    global _client
    if _client is None:
        redis_url = getattr(settings, "REDIS_URL", None)
        if redis_url:
            _client = redis.from_url(
                redis_url,
                decode_responses=True,
                ssl_cert_reqs=None,
            )
        else:
            _client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                db=settings.REDIS_DB,
                decode_responses=True,
            )
    return _client


def increment_view_count(prompt_id: int) -> int:
    try:
        client = get_redis_client()
        key = f"prompt:{prompt_id}:views"
        return client.incr(key)
    except Exception:
        return 0


def get_view_count(prompt_id: int) -> int:
    try:
        client = get_redis_client()
        key = f"prompt:{prompt_id}:views"
        value = client.get(key)
        return int(value) if value is not None else 0
    except Exception:
        return 0


def get_all_view_counts(prompt_ids: list) -> dict:
    if not prompt_ids:
        return {}
    try:
        client = get_redis_client()
        pipe = client.pipeline()
        for pid in prompt_ids:
            pipe.get(f"prompt:{pid}:views")
        results = pipe.execute()
        return {
            pid: int(val) if val is not None else 0
            for pid, val in zip(prompt_ids, results)
        }
    except Exception:
        return {pid: 0 for pid in prompt_ids}