from database import engine
from sqlalchemy import text
from datetime import datetime, timedelta
import random


def seed_database():

    with engine.begin() as conn:

        print("Starting demo data generation...")

        # --------------------------------------------------
        # 1. GET EXISTING CUSTOMERS
        # --------------------------------------------------

        customers = conn.execute(
            text("""
                SELECT customer_id
                FROM customers
                ORDER BY customer_id
                LIMIT 100
            """)
        ).fetchall()

        if not customers:
            print("ERROR: No customers found.")
            print("Please insert customers first.")
            return

        customer_ids = [row[0] for row in customers]

        print(f"Found {len(customer_ids)} existing customers.")

        # --------------------------------------------------
        # 2. CREATE 50 LOCKERS
        # --------------------------------------------------

        existing_lockers = conn.execute(
            text("SELECT COUNT(*) FROM lockers")
        ).scalar()

        if existing_lockers == 0:

            print("Creating 50 lockers...")

            for i in range(1, 51):

                locker_number = f"L{i:03d}"

                # First 30 lockers available
                # Remaining 20 assigned to customers

                if i <= 30:
                    status = "AVAILABLE"
                    customer_id = None
                else:
                    status = "OCCUPIED"
                    customer_id = customer_ids[(i - 31) % len(customer_ids)]

                conn.execute(
                    text("""
                        INSERT INTO lockers
                        (locker_number, customer_id, status)
                        VALUES
                        (:locker_number, :customer_id, :status)
                    """),
                    {
                        "locker_number": locker_number,
                        "customer_id": customer_id,
                        "status": status
                    }
                )

            print("50 lockers created.")

        else:
            print(f"Lockers already exist: {existing_lockers}")

        # --------------------------------------------------
        # 3. CREATE ACCOUNTS
        # --------------------------------------------------

        existing_accounts = conn.execute(
            text("SELECT COUNT(*) FROM accounts")
        ).scalar()

        if existing_accounts == 0:

            print("Creating customer accounts...")

            for index, customer_id in enumerate(customer_ids):

                account_number = f"ACC{index + 1:06d}"

                conn.execute(
                    text("""
                        INSERT INTO accounts
                        (customer_id, account_number, account_type, status)
                        VALUES
                        (:customer_id, :account_number, :account_type, :status)
                    """),
                    {
                        "customer_id": customer_id,
                        "account_number": account_number,
                        "account_type": "SAVINGS",
                        "status": "ACTIVE"
                    }
                )

            print("Customer accounts created.")

        else:
            print(f"Accounts already exist: {existing_accounts}")

        # --------------------------------------------------
        # 4. CREATE DOCUMENTS
        # --------------------------------------------------

        existing_documents = conn.execute(
            text("SELECT COUNT(*) FROM documents")
        ).scalar()

        if existing_documents == 0:

            print("Creating documents...")

            document_types = [
                "AADHAAR",
                "PAN",
                "PASSPORT"
            ]

            for index, customer_id in enumerate(customer_ids):

                document_type = document_types[index % 3]

                document_number = (
                    f"DEMO{document_type}{index + 1001}"
                )

                conn.execute(
                    text("""
                        INSERT INTO documents
                        (customer_id, document_type, document_number)
                        VALUES
                        (:customer_id, :document_type, :document_number)
                    """),
                    {
                        "customer_id": customer_id,
                        "document_type": document_type,
                        "document_number": document_number
                    }
                )

            print("Documents created.")

        else:
            print(f"Documents already exist: {existing_documents}")

        # --------------------------------------------------
        # 5. CREATE VERIFICATION SESSIONS
        # --------------------------------------------------

        existing_sessions = conn.execute(
            text("SELECT COUNT(*) FROM verification_sessions")
        ).scalar()

        if existing_sessions == 0:

            print("Creating verification sessions...")

            for index, customer_id in enumerate(customer_ids):

                # Most successful
                if index % 10 != 0:
                    status = "VERIFIED"
                else:
                    status = "FAILED"

                conn.execute(
                    text("""
                        INSERT INTO verification_sessions
                        (customer_id, status)
                        VALUES
                        (:customer_id, :status)
                    """),
                    {
                        "customer_id": customer_id,
                        "status": status
                    }
                )

            print("Verification sessions created.")

        else:
            print(
                f"Verification sessions already exist: "
                f"{existing_sessions}"
            )

        # --------------------------------------------------
        # 6. FACE VERIFICATIONS
        # --------------------------------------------------

        sessions = conn.execute(
            text("""
                SELECT session_id, customer_id
                FROM verification_sessions
                ORDER BY session_id
            """)
        ).fetchall()

        existing_face = conn.execute(
            text("SELECT COUNT(*) FROM face_verifications")
        ).scalar()

        if existing_face == 0:

            print("Creating face verification records...")

            for index, session in enumerate(sessions):

                session_id = session[0]

                if index % 10 == 0:
                    match_score = round(
                        random.uniform(35, 60), 2
                    )
                    result = "FAILED"
                else:
                    match_score = round(
                        random.uniform(90, 99.9), 2
                    )
                    result = "PASSED"

                conn.execute(
                    text("""
                        INSERT INTO face_verifications
                        (session_id, match_score, result)
                        VALUES
                        (:session_id, :match_score, :result)
                    """),
                    {
                        "session_id": session_id,
                        "match_score": match_score,
                        "result": result
                    }
                )

            print("Face verification records created.")

        # --------------------------------------------------
        # 7. DOCUMENT VERIFICATIONS
        # --------------------------------------------------

        existing_doc_verification = conn.execute(
            text("SELECT COUNT(*) FROM document_verifications")
        ).scalar()

        if existing_doc_verification == 0:

            print("Creating document verification records...")

            for index, session in enumerate(sessions):

                session_id = session[0]

                if index % 10 == 0:
                    match_score = round(
                        random.uniform(40, 65), 2
                    )
                    result = "FAILED"
                else:
                    match_score = round(
                        random.uniform(92, 99.9), 2
                    )
                    result = "PASSED"

                conn.execute(
                    text("""
                        INSERT INTO document_verifications
                        (session_id, match_score, result)
                        VALUES
                        (:session_id, :match_score, :result)
                    """),
                    {
                        "session_id": session_id,
                        "match_score": match_score,
                        "result": result
                    }
                )

            print("Document verification records created.")

        # --------------------------------------------------
        # 8. RISK ASSESSMENTS
        # --------------------------------------------------

        existing_risk = conn.execute(
            text("SELECT COUNT(*) FROM risk_assessments")
        ).scalar()

        if existing_risk == 0:

            print("Creating risk assessments...")

            for index, session in enumerate(sessions):

                session_id = session[0]

                if index % 10 == 0:
                    risk_level = "HIGH"
                    risk_score = round(
                        random.uniform(70, 95), 2
                    )
                elif index % 7 == 0:
                    risk_level = "MEDIUM"
                    risk_score = round(
                        random.uniform(40, 69), 2
                    )
                else:
                    risk_level = "LOW"
                    risk_score = round(
                        random.uniform(5, 39), 2
                    )

                conn.execute(
                    text("""
                        INSERT INTO risk_assessments
                        (session_id, risk_score, risk_level)
                        VALUES
                        (:session_id, :risk_score, :risk_level)
                    """),
                    {
                        "session_id": session_id,
                        "risk_score": risk_score,
                        "risk_level": risk_level
                    }
                )

            print("Risk assessments created.")

        # --------------------------------------------------
        # 9. LOCKER OPERATIONS
        # --------------------------------------------------

        existing_operations = conn.execute(
            text("SELECT COUNT(*) FROM locker_operations")
        ).scalar()

        if existing_operations == 0:

            print("Creating locker operation history...")

            occupied_lockers = conn.execute(
                text("""
                    SELECT locker_id, customer_id
                    FROM lockers
                    WHERE customer_id IS NOT NULL
                    LIMIT 20
                """)
            ).fetchall()

            for index, locker in enumerate(occupied_lockers):

                locker_id = locker[0]
                customer_id = locker[1]

                operation = (
                    "ACCESS_GRANTED"
                    if index % 5 != 0
                    else "ACCESS_DENIED"
                )

                conn.execute(
                    text("""
                        INSERT INTO locker_operations
                        (locker_id, customer_id, operation)
                        VALUES
                        (:locker_id, :customer_id, :operation)
                    """),
                    {
                        "locker_id": locker_id,
                        "customer_id": customer_id,
                        "operation": operation
                    }
                )

            print("Locker operation history created.")

        # --------------------------------------------------
        # 10. SECURITY INCIDENTS
        # --------------------------------------------------

        existing_incidents = conn.execute(
            text("SELECT COUNT(*) FROM security_incidents")
        ).scalar()

        if existing_incidents == 0:

            print("Creating security incidents...")

            failed_customers = customer_ids[::10]

            for customer_id in failed_customers:

                conn.execute(
                    text("""
                        INSERT INTO security_incidents
                        (customer_id, incident_type, severity, description)
                        VALUES
                        (
                            :customer_id,
                            'VERIFICATION_FAILURE',
                            'HIGH',
                            'Face or document verification failed'
                        )
                    """),
                    {
                        "customer_id": customer_id
                    }
                )

            print("Security incidents created.")

        # --------------------------------------------------
        # 11. AUDIT LOGS
        # --------------------------------------------------

        existing_logs = conn.execute(
            text("SELECT COUNT(*) FROM audit_logs")
        ).scalar()

        if existing_logs == 0:

            print("Creating audit logs...")

            users = conn.execute(
                text("""
                    SELECT user_id
                    FROM users
                    LIMIT 10
                """)
            ).fetchall()

            for index, user in enumerate(users):

                user_id = user[0]

                conn.execute(
                    text("""
                        INSERT INTO audit_logs
                        (user_id, action)
                        VALUES
                        (:user_id, :action)
                    """),
                    {
                        "user_id": user_id,
                        "action": "DEMO_LOGIN"
                    }
                )

            print("Audit logs created.")

        # --------------------------------------------------
        # FINISHED
        # --------------------------------------------------

        print()
        print("=" * 50)
        print("DEMO DATABASE CREATED SUCCESSFULLY")
        print("=" * 50)


if __name__ == "__main__":
    seed_database()