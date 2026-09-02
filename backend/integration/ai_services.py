from pathlib import Path
import importlib.util


# ============================================================
# PROJECT ROOT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]


# ============================================================
# DYNAMIC MODULE LOADER
# ============================================================

def _load_module(module_name: str, file_path: Path):
    """
    Dynamically load an AI/intelligence module from the project.
    """

    if not file_path.exists():
        raise FileNotFoundError(
            f"Module file not found: {file_path}"
        )

    spec = importlib.util.spec_from_file_location(
        module_name,
        str(file_path)
    )

    if spec is None or spec.loader is None:
        raise ImportError(
            f"Cannot load module: {file_path}"
        )

    module = importlib.util.module_from_spec(spec)

    spec.loader.exec_module(module)

    return module


# ============================================================
# SAMIKSHA - DOCUMENT VERIFICATION
# ============================================================

def verify_document_real(
    image_path: str,
    customer_data: dict
):
    """
    Call Samiksha's real PaddleOCR document verification.

    Expected function:

        verify_document(document, customer_data)

    customer_data:
        name
        dob
        id_number
        address
    """

    file_path = (
        PROJECT_ROOT
        / "ai"
        / "ocr"
        / "document_verification.py"
    )

    module = _load_module(
        "locksure_document_ai",
        file_path
    )

    if not hasattr(module, "verify_document"):
        raise AttributeError(
            "Samiksha's document_verification.py "
            "does not contain verify_document()"
        )

    return module.verify_document(
        image_path,
        customer_data
    )


# ============================================================
# DHANASHREE - FACE VERIFICATION
# ============================================================

def verify_face_real(
    reference_image: str,
    live_image: str
):
    """
    Call Dhanashree's real DeepFace face verification.

    Expected function:

        verify_face(reference_image, live_image)

    Dhanashree's function returns a dictionary such as:

        {
            "matched": True,
            "confidence": 0.95,
            "status": "VERIFIED",
            "model": "ArcFace",
            "distance": ...,
            "threshold": ...
        }
    """

    file_path = (
        PROJECT_ROOT
        / "ai"
        / "face-rego"
        / "face_verify.py"
    )

    module = _load_module(
        "locksure_face_ai",
        file_path
    )

    if not hasattr(module, "verify_face"):
        raise AttributeError(
            "Dhanashree's face_verify.py "
            "does not contain verify_face()"
        )

    # Call Dhanashree's real DeepFace implementation
    result = module.verify_face(
        reference_image,
        live_image
    )

    # Dhanashree's function MUST return a dictionary.
    if result is None:
        raise RuntimeError(
            "Dhanashree's verify_face() returned None. "
            "Make sure face_verify.py returns the "
            "verification result dictionary."
        )

    if not isinstance(result, dict):
        raise RuntimeError(
            "Dhanashree's verify_face() returned an invalid "
            "result. Expected a dictionary."
        )

    # --------------------------------------------------------
    # Normalize the result for the backend.
    #
    # Dhanashree uses:
    #
    #     matched
    #
    # Our backend uses:
    #
    #     matched
    #
    # Therefore no conversion is required.
    # --------------------------------------------------------

    return result


# ============================================================
# ANISHA - RISK ENGINE
# ============================================================

def calculate_risk_real(data: dict):
    """
    Call Anisha's real risk engine.

    Expected function:

        calculate_risk(data)
    """

    file_path = (
        PROJECT_ROOT
        / "intelligence"
        / "risk_engine.py"
    )

    module = _load_module(
        "locksure_risk_engine",
        file_path
    )

    if not hasattr(module, "calculate_risk"):
        raise AttributeError(
            "risk_engine.py does not contain "
            "calculate_risk()"
        )

    return module.calculate_risk(data)


# ============================================================
# SUSPICIOUS ACTIVITY ENGINE
# ============================================================

def detect_suspicious_real(data: dict):
    """
    Call suspicious activity engine.
    """

    file_path = (
        PROJECT_ROOT
        / "intelligence"
        / "suspicious_engine.py"
    )

    module = _load_module(
        "locksure_suspicious_engine",
        file_path
    )

    if not hasattr(
        module,
        "detect_suspicious_activity"
    ):
        raise AttributeError(
            "suspicious_engine.py does not contain "
            "detect_suspicious_activity()"
        )

    return module.detect_suspicious_activity(data)