export const APP_CONSTANTS = {
  CASE_STATUS: {
    DRAFT: 'draft',
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    UNDER_REVIEW: 'under_review',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
  },
  
  PRIORITY_LEVELS: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },

  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.xlsx', '.xls'],
    MAX_FILES: 10
  },

  VALIDATION_MESSAGES: {
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    FILE_TOO_LARGE: 'File size must be less than 10MB',
    INVALID_FILE_TYPE: 'File type not supported'
  },

  DATE_FORMATS: {
    DISPLAY: 'MMM dd, yyyy',
    FULL: 'MMMM dd, yyyy HH:mm',
    SHORT: 'MM/dd/yyyy'
  }
};

export const DUMMY_DATA = {
  INVESTIGATORS: [
    'Sarah Johnson',
    'Michael Chen', 
    'Lisa Anderson',
    'David Wilson',
    'Emma Thompson',
    'Robert Garcia',
    'Jennifer Lee',
    'Christopher Brown'
  ],

  CASE_TYPES: [
    'Consumer Complaint',
    'Market Misconduct',
    'Regulatory Breach',
    'Compliance Audit',
    'Whistleblower Report',
    'Operational Review'
  ],

  SAMPLE_ENTITIES: [
    'ABC Banking Corporation',
    'XYZ Insurance Ltd',
    'SecureInvest Holdings',
    'CreditPro Financial',
    'TrustGuard Insurance',
    'WealthMax Advisors'
  ]
};