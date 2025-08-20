// src/app/models/document.models.ts

export interface DocumentData {
  id: string;
  name: string;
  type: 'Letter' | 'Memo' | 'Summary';
  dateCreated: Date;
  versionNo: string;
  status: DocumentStatus;
  createdBy: string;
  reviewedBy?: string;
  content?: string;
  caseId?: string;
  investigationId?: string;
}

export type DocumentStatus = 'Draft' | 'InReview' | 'Accepted' | 'Rejected' | 'Completed';

export interface DocumentStageData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  statusType: DocumentStatus;
}

export interface DocumentReview {
  id: string;
  documentId: string;
  reviewerId: string;
  reviewerName: string;
  action: 'Accept' | 'Reject';
  comments?: string;
  reviewDate: Date;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'Letter' | 'Memo' | 'Summary';
  template: string;
  isDefault: boolean;
}