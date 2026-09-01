from fastapi import FastAPI

from verification.routes import router as verification_router
from audit.routes import router as audit_router
from locker.routes import router as locker_router


app = FastAPI(
    title="LockSure Backend",
    description="Verification, Audit and Locker Operations APIs",
    version="1.0.0"
)


# ============================================================
# VERIFICATION
# ============================================================

app.include_router(verification_router)


# ============================================================
# AUDIT
# ============================================================

app.include_router(audit_router)


# ============================================================
# LOCKER OPERATIONS
# ============================================================

app.include_router(locker_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "LockSure Backend is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }