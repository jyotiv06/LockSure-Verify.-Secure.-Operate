from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models

from .auth.router import router as auth_router
from .customers.router import router as customer_router
from .accounts.router import router as account_router

from locker.routes import router as locker_router
from verification.routes import router as verification_router
from audit.routes import router as audit_router
from security_alerts.routes import router as security_alerts_router


app = FastAPI(
    title="LockSure API",
    description="Intelligent Bank Locker Operating System",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(account_router)
app.include_router(verification_router)
app.include_router(audit_router)
app.include_router(locker_router)
app.include_router(security_alerts_router)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "LockSure API running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }