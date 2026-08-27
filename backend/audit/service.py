from datetime import datetime


# Temporary in-memory audit storage.
# Database integration will be added later.
audit_logs = []


def create_audit_log(
    customer_id: int,
    locker_id: int,
    action: str,
    details: str = ""
):

    log = {
        "customer_id": customer_id,
        "locker_id": locker_id,
        "action": action,
        "details": details,
        "timestamp": datetime.now().isoformat()
    }

    audit_logs.append(log)

    return log


def get_customer_logs(customer_id: int):

    return [
        log
        for log in audit_logs
        if log["customer_id"] == customer_id
    ]


def get_locker_logs(locker_id: int):

    return [
        log
        for log in audit_logs
        if log["locker_id"] == locker_id
    ]