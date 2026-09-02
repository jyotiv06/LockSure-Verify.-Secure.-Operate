from pathlib import Path
import importlib.util

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def _load_module(module_name: str, file_path: Path):
    if not file_path.exists():
        raise FileNotFoundError(f"Module file not found: {file_path}")

    spec = importlib.util.spec_from_file_location(module_name, str(file_path))
    if spec is None or spec.loader is None:
        raise ImportError(f"Cannot load module: {file_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def verify_document_real(image_path: str, customer_data: dict):
    file_path = PROJECT_ROOT / "ai" / "ocr" / "document_verification.py"
    module = _load_module("locksure_document_ai", file_path)

    if not hasattr(module, "verify_document"):
        raise AttributeError(
            "document_verification.py does not contain verify_document()"
        )

    return module.verify_document(image_path, customer_data)


def extract_document_photo_real(image_path: str):
    file_path = PROJECT_ROOT / "ai" / "ocr" / "document_verification.py"
    module = _load_module("locksure_document_photo_ai", file_path)

    if not hasattr(module, "extract_document_photo"):
        raise AttributeError(
            "document_verification.py does not contain extract_document_photo()"
        )

    result = module.extract_document_photo(image_path)
    if not isinstance(result, dict):
        raise RuntimeError("extract_document_photo() returned an invalid result.")

    return result


def verify_face_real(reference_image: str, live_image: str):
    """
    Real DeepFace verification.

    IMPORTANT:
    Do not import face_verify.py here. The current face_verify.py imports a
    missing `config` module, which is the exact error shown by the frontend.
    DeepFace is already installed and working, so call it directly.
    """
    from deepface import DeepFace

    reference_path = str(Path(reference_image).resolve())
    live_path = str(Path(live_image).resolve())

    if not Path(reference_path).is_file():
        raise FileNotFoundError(
            f"Reference face image not found: {reference_path}"
        )

    if not Path(live_path).is_file():
        raise FileNotFoundError(
            f"Live face image not found: {live_path}"
        )

    result = DeepFace.verify(
        img1_path=reference_path,
        img2_path=live_path,
        model_name="VGG-Face",
        detector_backend="opencv",
        distance_metric="cosine",
        enforce_detection=True,
    )

    if not isinstance(result, dict):
        raise RuntimeError("DeepFace.verify() returned an invalid result.")

    result["matched"] = bool(result.get("verified", False))
    result["status"] = "VERIFIED" if result["matched"] else "FAILED"

    return result


def calculate_risk_real(data: dict):
    file_path = PROJECT_ROOT / "intelligence" / "risk_engine.py"
    module = _load_module("locksure_risk_engine", file_path)

    if not hasattr(module, "calculate_risk"):
        raise AttributeError("risk_engine.py does not contain calculate_risk()")

    return module.calculate_risk(data)


def detect_suspicious_real(data: dict):
    file_path = PROJECT_ROOT / "intelligence" / "suspicious_engine.py"
    module = _load_module("locksure_suspicious_engine", file_path)

    if not hasattr(module, "detect_suspicious_activity"):
        raise AttributeError(
            "suspicious_engine.py does not contain detect_suspicious_activity()"
        )

    return module.detect_suspicious_activity(data)
