def detect_suspicious_activity(data):

    suspicious = False
    severity = "LOW"
    reasons = []

    # Rule 1: 3 or more failed attempts
    if data.get("failed_attempts", 0) >= 3:
        suspicious = True
        severity = "HIGH"
        reasons.append("Multiple failed verification attempts")

    # Rule 2: Face mismatch + Document mismatch
    if not data.get("face_match", False) and not data.get("document_match", False):
        suspicious = True
        severity = "HIGH"
        reasons.append("Face and document mismatch")

    # Rule 3: Abnormally frequent access attempts
    if data.get("access_attempts_last_hour", 0) >= 10:
        suspicious = True

        if severity != "HIGH":
            severity = "MEDIUM"

        reasons.append("Abnormally frequent access attempts")

    # Recommended Action
    if severity == "HIGH":
        recommended_action = "BLOCK"

    elif severity == "MEDIUM":
        recommended_action = "ALERT"

    else:
        recommended_action = "ALLOW"

    return {
        "suspicious": suspicious,
        "severity": severity,
        "reasons": reasons,
        "recommended_action": recommended_action
    }