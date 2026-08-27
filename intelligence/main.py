from risk_engine import calculate_risk
from suspicious_engine import detect_suspicious_activity


# ============================================================
# MOCK VERIFICATION / HISTORY DATA
# ============================================================

mock_data = {
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


# ============================================================
# RUN ENGINES
# ============================================================

risk_result = calculate_risk(mock_data)

suspicious_result = detect_suspicious_activity(mock_data)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 60)
print("              🔐 LOCKER INTELLIGENCE ENGINE")
print("=" * 60)

print("\n📋 MOCK INPUT")
print("-" * 60)
print(f"Face Match                    : {mock_data['face_match']}")
print(f"Document Match                : {mock_data['document_match']}")
print(f"Account Status                : {mock_data['account_status']}")
print(f"Failed Attempts               : {mock_data['failed_attempts']}")
print(f"Previous Total Attempts      : {mock_data['previous_history']['total_attempts']}")
print(f"Previous Failed Attempts     : {mock_data['previous_history']['failed_attempts']}")
print(f"Access Attempts (Last Hour)  : {mock_data['access_attempts_last_hour']}")


# ============================================================
# RISK RESULT
# ============================================================

print("\n" + "=" * 60)
print("                    ⚠️ RISK ASSESSMENT")
print("=" * 60)

print(f"\nRisk Score   : {risk_result['risk_score']} / 100")
print(f"Risk Level   : {risk_result['risk_level']}")
print(f"Decision     : {risk_result['decision']}")

print("\nReasons:")
if risk_result["reasons"]:
    for reason in risk_result["reasons"]:
        print(f"  • {reason}")
else:
    print("  • No risk factors detected")


# ============================================================
# SUSPICIOUS ACTIVITY RESULT
# ============================================================

print("\n" + "=" * 60)
print("               🚨 SUSPICIOUS ACTIVITY")
print("=" * 60)

print(f"\nSuspicious   : {suspicious_result['suspicious']}")
print(f"Severity     : {suspicious_result['severity']}")
print(f"Action       : {suspicious_result['recommended_action']}")

print("\nReasons:")
if suspicious_result["reasons"]:
    for reason in suspicious_result["reasons"]:
        print(f"  • {reason}")
else:
    print("  • No suspicious activity detected")


# ============================================================
# FINAL DECISION
# ============================================================

print("\n" + "=" * 60)
print("                    🔒 FINAL DECISION")
print("=" * 60)

if suspicious_result["recommended_action"] == "BLOCK":
    final_decision = "BLOCK"
elif risk_result["decision"] == "BLOCK":
    final_decision = "BLOCK"
elif suspicious_result["recommended_action"] == "ALERT":
    final_decision = "ALERT"
else:
    final_decision = risk_result["decision"]

print(f"\n              >>> {final_decision} <<<")

print("=" * 60)
print("                 Intelligence Engine Complete")
print("=" * 60)