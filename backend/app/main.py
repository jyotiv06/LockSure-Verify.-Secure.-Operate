from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth.router import router as auth_router
from .customers.router import router as customer_router
from .accounts.router import router as account_router

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


@app.get("/")
def root():
    return {
        "message": "LockSure API running"
    }


app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(account_router)