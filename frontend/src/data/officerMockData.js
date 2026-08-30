export const officerCustomers = [
  {
    id: "CUST023",
    name: "Anisha Sharma",
    account: "XXXX XXXX 4821",
    accountStatus: "Active",
    locker: "L-108",
    branch: "Pune Central",
    verificationStatus: "Requires Review",
    riskScore: 8,
    riskLevel: "LOW",
    faceMatch: 98.4,
    documents: "Verified",
    history: "Normal",
    suspiciousActivity: true,
    failedAttempts: 4,
  },

  {
    id: "CUST102",
    name: "Rahul Sharma",
    account: "XXXX XXXX 1042",
    accountStatus: "Active",
    locker: "L-204",
    branch: "Pune Central",
    verificationStatus: "Verified",
    riskScore: 12,
    riskLevel: "LOW",
    faceMatch: 96.4,
    documents: "Verified",
    history: "Normal",
    suspiciousActivity: false,
    failedAttempts: 0,
  },

  {
    id: "CUST108",
    name: "Priya Shah",
    account: "XXXX XXXX 3918",
    accountStatus: "Active",
    locker: "L-102",
    branch: "Mumbai Central",
    verificationStatus: "Pending",
    riskScore: 34,
    riskLevel: "MEDIUM",
    faceMatch: 91.8,
    documents: "Verified",
    history: "Normal",
    suspiciousActivity: false,
    failedAttempts: 1,
  },
];


export const officerAlerts = [
  {
    id: "ALT-001",
    customer: "Anisha Sharma",
    customerId: "CUST023",
    locker: "L-108",
    reason: "4 failed verification attempts",
    risk: "HIGH",
    time: "08:41 PM",
    status: "Active",
  },

  {
    id: "ALT-002",
    customer: "Priya Shah",
    customerId: "CUST108",
    locker: "L-102",
    reason: "Face match below recommended threshold",
    risk: "MEDIUM",
    time: "08:17 PM",
    status: "Under Review",
  },

  {
    id: "ALT-003",
    customer: "Amit Kumar",
    customerId: "CUST114",
    locker: "L-311",
    reason: "Multiple access attempts",
    risk: "MEDIUM",
    time: "07:54 PM",
    status: "Active",
  },
];


export const auditLogs = [
  {
    id: "AUD-001",
    time: "08:42 PM",
    customer: "Rahul Sharma",
    customerId: "CUST102",
    locker: "L-204",
    action: "Operation Approved",
    status: "Approved",
    officer: "OF-2041",
  },

  {
    id: "AUD-002",
    time: "08:37 PM",
    customer: "Priya Shah",
    customerId: "CUST108",
    locker: "L-102",
    action: "Sent for Review",
    status: "Review",
    officer: "OF-2041",
  },

  {
    id: "AUD-003",
    time: "08:29 PM",
    customer: "Amit Kumar",
    customerId: "CUST114",
    locker: "L-311",
    action: "Operation Blocked",
    status: "Blocked",
    officer: "OF-2041",
  },

  {
    id: "AUD-004",
    time: "08:18 PM",
    customer: "Neha Patil",
    customerId: "CUST119",
    locker: "L-087",
    action: "Locker Closed",
    status: "Approved",
    officer: "OF-2041",
  },

  {
    id: "AUD-005",
    time: "08:02 PM",
    customer: "Vikram Joshi",
    customerId: "CUST121",
    locker: "L-055",
    action: "Verification Completed",
    status: "Approved",
    officer: "OF-2041",
  },
];