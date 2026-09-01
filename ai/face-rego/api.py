import os
import shutil
import tempfile

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from face_verify import verify_face


# ============================================================
# FastAPI Application
# ============================================================

app = FastAPI(
    title="LockSure Face Verification API",
    description="AI/CV face verification service for LockSure locker system",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Health Check
# ============================================================

@app.get("/health")
def health_check():

    return {
        "service": "face-verification",
        "status": "running"
    }


# ============================================================
# Face Verification Endpoint
# ============================================================

@app.post("/ai/face/verify")
async def verify_face_api(
    reference_image: UploadFile = File(...),
    live_image: UploadFile = File(...)
):

    reference_temp = None
    live_temp = None

    try:

        # ----------------------------------------------------
        # Validate file types
        # ----------------------------------------------------

        allowed_types = {
            "image/jpeg",
            "image/png",
            "image/jpg"
        }

        if reference_image.content_type not in allowed_types:

            raise HTTPException(
                status_code=400,
                detail="Reference image must be JPG or PNG."
            )

        if live_image.content_type not in allowed_types:

            raise HTTPException(
                status_code=400,
                detail="Live image must be JPG or PNG."
            )

        # ----------------------------------------------------
        # Create temporary files
        # ----------------------------------------------------

        reference_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".jpg"
        )

        live_file = tempfile.NamedTemporaryFile(
            delete=False,
            suffix=".jpg"
        )

        reference_temp = reference_file.name
        live_temp = live_file.name

        reference_file.close()
        live_file.close()

        # ----------------------------------------------------
        # Save uploaded files
        # ----------------------------------------------------

        with open(reference_temp, "wb") as buffer:

            shutil.copyfileobj(
                reference_image.file,
                buffer
            )

        with open(live_temp, "wb") as buffer:

            shutil.copyfileobj(
                live_image.file,
                buffer
            )

        # ----------------------------------------------------
        # Run AI verification
        # ----------------------------------------------------

        result = verify_face(
            reference_temp,
            live_temp
        )

        # ----------------------------------------------------
        # Return standard response
        # ----------------------------------------------------

        return {
            "matched": result.get("matched", False),
            "confidence": result.get("confidence", 0.0),
            "status": result.get("status", "ERROR")
        }

    except HTTPException:
        raise

    except Exception as error:

        return {
            "matched": False,
            "confidence": 0.0,
            "status": "ERROR",
            "error": "FACE_SERVICE_ERROR",
            "message": str(error)
        }

    finally:

        # ----------------------------------------------------
        # Delete temporary files
        # ----------------------------------------------------

        if reference_temp and os.path.exists(reference_temp):

            os.remove(reference_temp)

        if live_temp and os.path.exists(live_temp):

            os.remove(live_temp)