import os
import shutil
import tempfile

from fastapi import (
    FastAPI,
    UploadFile,
    File,
    HTTPException
)

from fastapi.middleware.cors import CORSMiddleware

from document_verification import (
    extract_document_photo
)

from face_verify import (
    verify_face
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(

    title="LockSure Face Verification API",

    description=(
        "Dynamic document-face to live-face "
        "verification service"
    ),

    version="2.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():

    return {

        "service":
            "face-verification",

        "status":
            "running"
    }


# ============================================================
# DYNAMIC FACE VERIFICATION
# ============================================================
#
# INPUT:
#
# document_image
#       +
# live_image
#
# PROCESS:
#
# document image
#       ↓
# extract_document_photo()
#       ↓
# document_photo_path
#       ↓
# verify_face()
#       ↑
# live_image
#
# ============================================================

@app.post("/ai/face/verify")
async def verify_face_api(

    document_image: UploadFile = File(...),

    live_image: UploadFile = File(...)
):

    document_temp = None

    live_temp = None

    document_photo_path = None

    try:

        # ====================================================
        # VALIDATE FILE TYPES
        # ====================================================

        allowed_types = {

            "image/jpeg",

            "image/png",

            "image/jpg"
        }

        if (
            document_image.content_type
            not in allowed_types
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Document must be JPG or PNG."
                )
            )

        if (
            live_image.content_type
            not in allowed_types
        ):

            raise HTTPException(

                status_code=400,

                detail=(
                    "Live image must be JPG or PNG."
                )
            )

        # ====================================================
        # SAVE DOCUMENT TEMPORARILY
        # ====================================================

        document_file = tempfile.NamedTemporaryFile(

            delete=False,

            suffix=".jpg"
        )

        document_temp = (
            document_file.name
        )

        document_file.close()

        # ====================================================
        # SAVE LIVE IMAGE TEMPORARILY
        # ====================================================

        live_file = tempfile.NamedTemporaryFile(

            delete=False,

            suffix=".jpg"
        )

        live_temp = (
            live_file.name
        )

        live_file.close()

        # ====================================================
        # COPY UPLOADED DOCUMENT
        # ====================================================

        with open(

            document_temp,

            "wb"

        ) as buffer:

            shutil.copyfileobj(

                document_image.file,

                buffer
            )

        # ====================================================
        # COPY LIVE IMAGE
        # ====================================================

        with open(

            live_temp,

            "wb"

        ) as buffer:

            shutil.copyfileobj(

                live_image.file,

                buffer
            )

        # ====================================================
        # EXTRACT PHOTO FROM DOCUMENT
        # ====================================================

        photo_result = (
            extract_document_photo(
                document_temp
            )
        )

        if not photo_result:

            return {

                "matched":
                    False,

                "confidence":
                    0.0,

                "status":
                    "DOCUMENT_PHOTO_EXTRACTION_FAILED"
            }

        if not photo_result.get(
            "success",
            False
        ):

            return {

                "matched":
                    False,

                "confidence":
                    0.0,

                "status":
                    "DOCUMENT_PHOTO_EXTRACTION_FAILED",

                "error":
                    photo_result.get(
                        "error"
                    )
            }

        document_photo_path = (
            photo_result.get(
                "photo_path"
            )
        )

        if not document_photo_path:

            return {

                "matched":
                    False,

                "confidence":
                    0.0,

                "status":
                    "DOCUMENT_PHOTO_NOT_FOUND"
            }

        # ====================================================
        # FACE VERIFICATION
        # ====================================================

        result = verify_face(

            reference_image=
                document_photo_path,

            live_image=
                live_temp
        )

        # ====================================================
        # ADD SOURCE INFORMATION
        # ====================================================

        result["reference_source"] = (
            "document_photo"
        )

        result["live_source"] = (
            "camera_or_live_capture"
        )

        return result

    except HTTPException:

        raise

    except Exception as error:

        return {

            "matched":
                False,

            "confidence":
                0.0,

            "status":
                "FACE_SERVICE_ERROR",

            "error":
                str(error)
        }

    finally:

        # ====================================================
        # DELETE TEMPORARY DOCUMENT
        # ====================================================

        if (
            document_temp
            and os.path.exists(
                document_temp
            )
        ):

            os.remove(
                document_temp
            )

        # ====================================================
        # DELETE TEMPORARY LIVE IMAGE
        # ====================================================

        if (
            live_temp
            and os.path.exists(
                live_temp
            )
        ):

            os.remove(
                live_temp
            )

        # ====================================================
        # DELETE EXTRACTED DOCUMENT FACE
        # ====================================================

        if (
            document_photo_path
            and os.path.exists(
                document_photo_path
            )
        ):

            os.remove(
                document_photo_path
            )