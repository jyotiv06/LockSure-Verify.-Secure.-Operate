def calculate_risk(data):

    risk_score = 0
    reasons = []

    # 1. Face Match
    if not data.get("face_match", False):
        risk_score += 40
        reasons.append("Face mismatch")

    # 2. Document Match
    if not data.get("document_match", False):
        risk_score += 30
        reasons.append("Document mismatch")

    # 3. Account Status
    if data.get("account_status") != "ACTIVE":
        risk_score += 20
        reasons.append("Inactive account")

    # 4. Failed Attempts
    if data.get("failed_attempts", 0) >= 3:
        risk_score += 20
        reasons.append("Multiple failed attempts")

    # 5. Previous History
    history = data.get("previous_history", {})

    if history.get("failed_attempts", 0) >= 3:
        risk_score += 20
        reasons.append("Suspicious previous history")

    # Maximum score
    risk_score = min(risk_score, 100)

    # Risk Level and Decision
    if risk_score <= 30:
        risk_level = "LOW"
        decision = "APPROVE"

    elif risk_score <= 60:
        risk_level = "MEDIUM"
        decision = "REVIEW"

    else:
        risk_level = "HIGH"
        decision = "BLOCK"

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "decision": decision,
        "reasons": reasons
    }