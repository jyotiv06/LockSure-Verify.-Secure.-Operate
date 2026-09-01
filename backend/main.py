from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth.router import router as auth_router
from .customers.router import router as customer_router
from .accounts.router import router as account_router

from verification.routes import router as verification_router
from audit.routes import router as audit_router


app = FastAPI(
    title="LockSure API",
    description="Intelligent Bank Locker Operating System",
    version="1.0.0",
)


# Allow React frontend to communicate with FastAPI
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


# Authentication
app.include_router(auth_router)

# Customer APIs
app.include_router(customer_router)

# Account APIs
app.include_router(account_router)

# Verification APIs
app.include_router(verification_router)

# Audit APIs
app.include_router(audit_router)


@app.get("/")
def root():
    return {
        "message": "LockSure API running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }