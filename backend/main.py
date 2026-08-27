from fastapi import FastAPI

from verification.routes import router as verification_router
from audit.routes import router as audit_router


app = FastAPI(
    title="LockSure Backend",
    description="Verification and Audit APIs",
    version="1.0.0"
)


app.include_router(verification_router)
app.include_router(audit_router)


@app.get("/")
def root():
    return {
        "message": "LockSure Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }