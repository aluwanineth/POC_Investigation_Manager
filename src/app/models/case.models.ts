// Updated case.models.ts with new status values

export interface CaseData {
  id: string;
  caseNo: string;
  investigateParty: string;
  roleType?: string;
  regulatedParty?: string;
  status: CaseStatus;
  priority: Priority;
  createdDate: Date;
  assignedTo?: string;
  description?: string;
  // Additional case details fields
  listingType?: string;
  board?: string;
  issuer?: string;
  exchange?: string;
  sponsor?: string;
  secondReader?: string;
  contactOfficer?: string;
  closedDate?: Date;
}

export interface InvestigationData {
  id: string;
  caseId: string;
  investigationType: string;
  eventType: string;
  complainant: ComplainantData;
  documents: DocumentData[];
  status: InvestigationStatus;
  createdDate: Date;
  area?: string;
  part?: string;
}

export interface ComplainantData {
  id: string;
  name: string;
  surname: string;
  email: string;
  contactCode: string;
  contactNumber: string;
  relationshipType: string;
  entity: string;
}

export interface DocumentData {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: Date;
  size: number;
  documentType?: string;
  documentNumber?: string;
  uploadedBy?: string;
  stage?: string;
}

export interface StageData {
  id: number;
  name: string;
  isActive: boolean;
  isCompleted: boolean;
  description: string;
}

export interface CommentData {
  id: string;
  text: string;
  author: string;
  date: Date;
  stage: string;
}

// Updated enum with new status values
export enum CaseStatus {
  NEW = 'new',
  ENQUIRY = 'enquiry', 
  ALLEGATIONS = 'allegations',
  OBJECTION = 'objection',
  SANCTION = 'sanction'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum InvestigationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SUSPENDED = 'suspended'
}