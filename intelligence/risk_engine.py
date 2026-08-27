def calculate_risk(data):

    risk_score = 0
    reasons = []

    # 1. Face Match
    if not data["face_match"]:
        risk_score += 40
        reasons.append("Face mismatch")

    # 2. Document Match
    if not data["document_match"]:
        risk_score += 30
        reasons.append("Document mismatch")

    # 3. Account Status
    if data["account_status"] != "ACTIVE":
        risk_score += 20
        reasons.append("Inactive account")

    # 4. Failed Attempts
    if data["failed_attempts"] > 0:
        risk_score += 20
        reasons.append("Repeated failed attempts")

    # Maximum risk score is 100
    risk_score = min(risk_score, 100)

    # 5. Risk Level and Decision
    if risk_score <= 30:
        risk_level = "LOW"
        decision = "APPROVE"

    elif risk_score <= 60:
        risk_level = "MEDIUM"
        decision = "REVIEW"

    else:
        risk_level = "HIGH"
        decision = "BLOCK"

    # Structured result
    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "decision": decision,
        "reasons": reasons
    }