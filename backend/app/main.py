from fastapi import FastAPI

from .auth.router import router as auth_router
from .customers.router import router as customer_router
from .accounts.router import router as account_router

app = FastAPI(
    title="LockSure API",
    description="Intelligent Bank Locker Operating System",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "message": "LockSure API running"
    }


app.include_router(auth_router)
app.include_router(customer_router)
app.include_router(account_router)