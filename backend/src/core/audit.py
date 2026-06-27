import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("tastemap.audit")

class AuditLoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that records structured audit trace logs for every HTTP request.
    Generates an X-Request-ID (trace ID) if not provided by the client.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        trace_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        start_time = time.perf_counter()
        
        # Attach trace_id to request state so downstream routers/services can log or report it
        request.state.trace_id = trace_id
        
        method = request.method
        url = request.url.path
        client_host = request.client.host if request.client else "unknown"
        
        try:
            response = await call_next(request)
            process_time = (time.perf_counter() - start_time) * 1000.0
            response.headers["X-Request-ID"] = trace_id
            
            log_level = logging.INFO if response.status_code < 400 else logging.WARNING
            logger.log(
                log_level,
                f"[AUDIT] TraceID={trace_id} | {method} {url} | Status={response.status_code} | Latency={process_time:.2f}ms | Client={client_host}"
            )
            return response
        except Exception as exc:
            process_time = (time.perf_counter() - start_time) * 1000.0
            logger.error(
                f"[AUDIT-CRITICAL] TraceID={trace_id} | {method} {url} | Unhandled Exception={exc.__class__.__name__} | Latency={process_time:.2f}ms | Client={client_host}",
                exc_info=True
            )
            raise
