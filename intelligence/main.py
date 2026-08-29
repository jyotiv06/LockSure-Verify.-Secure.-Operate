from risk_engine import calculate_risk
from suspicious_engine import detect_suspicious_activity


# ============================================================
# INTELLIGENCE PROCESSING FUNCTION
# This function receives actual verification data
# ============================================================

def process_intelligence(data):

    # Run Risk Engine
    risk_result = calculate_risk(data)

    # Run Suspicious Activity Engine
    suspicious_result = detect_suspicious_activity(data)

    # ========================================================
    # FINAL DECISION
    # ========================================================

    if suspicious_result["recommended_action"] == "BLOCK":
        final_decision = "BLOCK"

    elif risk_result["decision"] == "BLOCK":
        final_decision = "BLOCK"

    elif suspicious_result["recommended_action"] == "ALERT":
        final_decision = "ALERT"

    else:
        final_decision = risk_result["decision"]

    # ========================================================
    # OFFICER ALERT
    # ========================================================

    if final_decision == "BLOCK":

        officer_alert = {
            "alert": True,
            "message": "HIGH RISK CUSTOMER DETECTED",
            "recommended_action": "BLOCK OPERATION"
        }

    elif final_decision == "ALERT":

        officer_alert = {
            "alert": True,
            "message": "SUSPICIOUS ACTIVITY DETECTED",
            "recommended_action": "OFFICER REVIEW REQUIRED"
        }

    else:

        officer_alert = {
            "alert": False,
            "message": "NO OFFICER ACTION REQUIRED",
            "recommended_action": "ALLOW OPERATION"
        }

    # ========================================================
    # FINAL COMBINED RESULT
    # ========================================================

    return {
        "customer_id": data.get("customer_id", "UNKNOWN"),
        "risk": risk_result,
        "suspicious_activity": suspicious_result,
        "final_decision": final_decision,
        "officer_alert": officer_alert
    }


# ============================================================
# TESTING
# This section runs only when main.py is executed directly
# ============================================================

if __name__ == "__main__":

    mock_data = {
        "customer_id": "CUST003",

        "face_match": True,

        "document_match": True,

        "account_status": "ACTIVE",

        "failed_attempts": 3,

        "previous_history": {
            "total_attempts": 10,
            "failed_attempts": 3
        },

        "access_attempts_last_hour": 12
    }

    # Run Intelligence Engine
    result = process_intelligence(mock_data)

    # ========================================================
    # DISPLAY RESULT
    # ========================================================

    print("\n" + "=" * 60)
    print("           🔐 LOCKER INTELLIGENCE ENGINE")
    print("=" * 60)

    print("\nCUSTOMER ID:", result["customer_id"])

    # Risk Result
    print("\n" + "-" * 60)
    print("⚠️ RISK ASSESSMENT")
    print("-" * 60)

    print("Risk Score :", result["risk"]["risk_score"], "/ 100")
    print("Risk Level :", result["risk"]["risk_level"])
    print("Decision   :", result["risk"]["decision"])

    print("\nReasons:")

    if result["risk"]["reasons"]:
        for reason in result["risk"]["reasons"]:
            print("•", reason)
    else:
        print("• No risk factors detected")

    # Suspicious Activity
    print("\n" + "-" * 60)
    print("🚨 SUSPICIOUS ACTIVITY")
    print("-" * 60)

    print("Suspicious :", result["suspicious_activity"]["suspicious"])
    print("Severity   :", result["suspicious_activity"]["severity"])
    print("Action     :", result["suspicious_activity"]["recommended_action"])

    print("\nReasons:")

    if result["suspicious_activity"]["reasons"]:
        for reason in result["suspicious_activity"]["reasons"]:
            print("•", reason)
    else:
        print("• No suspicious activity detected")

    # Final Decision
    print("\n" + "-" * 60)
    print("🔒 FINAL DECISION")
    print("-" * 60)

    print("\n>>>", result["final_decision"], "<<<")

    # Officer Alert
    print("\n" + "-" * 60)
    print("🚨 OFFICER ALERT")
    print("-" * 60)

    print("Alert Status       :", result["officer_alert"]["alert"])
    print("Message            :", result["officer_alert"]["message"])
    print("Recommended Action :", result["officer_alert"]["recommended_action"])

    print("\n" + "=" * 60)
    print("         Intelligence Engine Complete")
    print("=" * 60)