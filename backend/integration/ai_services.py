from pathlib import Path
import importlib.util


PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _load_module(module_name: str, file_path: Path):
    """Dynamically load an AI/intelligence module from the project."""

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


def verify_document_real(
    image_path: str,
    customer_data: dict
):
    """Call Samiksha's real PaddleOCR document verification."""

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


def extract_document_photo_real(image_path: str):
    """Extract the photo region from the verified identity document."""

    file_path = (
        PROJECT_ROOT
        / "ai"
        / "ocr"
        / "document_verification.py"
    )

    module = _load_module(
        "locksure_document_photo_ai",
        file_path
    )

    if not hasattr(module, "extract_document_photo"):
        raise AttributeError(
            "Samiksha's document_verification.py "
            "does not contain extract_document_photo()"
        )

    result = module.extract_document_photo(image_path)

    if not isinstance(result, dict):
        raise RuntimeError(
            "extract_document_photo() returned an invalid result."
        )

    return result


def verify_face_real(
    reference_image: str,
    live_image: str
):
    """Call Dhanashree's real DeepFace face verification."""

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

    result = module.verify_face(
        reference_image,
        live_image
    )

    if result is None:
        raise RuntimeError(
            "Dhanashree's verify_face() returned None. "
            "Make sure face_verify.py returns the verification result dictionary."
        )

    if not isinstance(result, dict):
        raise RuntimeError(
            "Dhanashree's verify_face() returned an invalid result. "
            "Expected a dictionary."
        )

    return result


def calculate_risk_real(data: dict):
    """Call Anisha's real risk engine."""

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
            "risk_engine.py does not contain calculate_risk()"
        )

    return module.calculate_risk(data)


def detect_suspicious_real(data: dict):
    """Call suspicious activity engine."""

    file_path = (
        PROJECT_ROOT
        / "intelligence"
        / "suspicious_engine.py"
    )

    module = _load_module(
        "locksure_suspicious_engine",
        file_path
    )

    if not hasattr(module, "detect_suspicious_activity"):
        raise AttributeError(
            "suspicious_engine.py does not contain "
            "detect_suspicious_activity()"
        )

    return module.detect_suspicious_activity(data)
