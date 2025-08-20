// src/app/services/document.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentData, DocumentStatus, DocumentReview } from '../models/document.models';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documentsSubject = new BehaviorSubject<DocumentData[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  private reviewsSubject = new BehaviorSubject<DocumentReview[]>([]);
  public reviews$ = this.reviewsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const documents: DocumentData[] = [
      {
        id: '1',
        name: 'Investigation Closure Letter - C1130',
        type: 'Letter',
        dateCreated: new Date('2025-08-15T10:30:00'),
        versionNo: 'v1.0',
        status: 'Completed',
        createdBy: 'John Smith',
        reviewedBy: 'Sarah Johnson',
        content: this.getLetterTemplate(),
        caseId: 'C1130'
      },
      {
        id: '2',
        name: 'Weekly Investigation Update Memo',
        type: 'Memo',
        dateCreated: new Date('2025-08-18T14:20:00'),
        versionNo: 'v2.1',
        status: 'InReview',
        createdBy: 'Mike Davis',
        content: this.getMemoTemplate()
      },
      {
        id: '3',
        name: 'Q3 Compliance Summary Report',
        type: 'Summary',
        dateCreated: new Date('2025-08-20T09:15:00'),
        versionNo: 'v1.0',
        status: 'Draft',
        createdBy: 'Emily Wilson',
        content: this.getSummaryTemplate()
      },
      {
        id: '4',
        name: 'Regulatory Response Letter - Market Manipulation',
        type: 'Letter',
        dateCreated: new Date('2025-08-12T16:45:00'),
        versionNo: 'v1.2',
        status: 'Rejected',
        createdBy: 'David Brown',
        reviewedBy: 'Sarah Johnson',
        content: this.getLetterTemplate()
      },
      {
        id: '5',
        name: 'Internal Investigation Memo - Insider Trading',
        type: 'Memo',
        dateCreated: new Date('2025-08-19T11:30:00'),
        versionNo: 'v1.0',
        status: 'Accepted',
        createdBy: 'Lisa Anderson',
        reviewedBy: 'Michael Roberts',
        content: this.getMemoTemplate()
      },
      {
        id: '6',
        name: 'Annual Enforcement Summary',
        type: 'Summary',
        dateCreated: new Date('2025-08-14T13:20:00'),
        versionNo: 'v3.0',
        status: 'Completed',
        createdBy: 'Robert Taylor',
        reviewedBy: 'Sarah Johnson',
        content: this.getSummaryTemplate()
      }
    ];

    this.documentsSubject.next(documents);
  }

  // Get all documents
  getDocuments(): Observable<DocumentData[]> {
    return this.documents$;
  }

  // Get document by ID
  getDocumentById(id: string): Observable<DocumentData | undefined> {
    const documents = this.documentsSubject.value;
    const document = documents.find(doc => doc.id === id);
    return of(document);
  }

  // Create new document
  createDocument(documentData: Partial<DocumentData>): Observable<DocumentData> {
    const documents = this.documentsSubject.value;
    const newDocument: DocumentData = {
      id: this.generateId(),
      name: documentData.name || '',
      type: documentData.type || 'Letter',
      dateCreated: new Date(),
      versionNo: 'v1.0',
      status: 'Draft',
      createdBy: 'Current User',
      content: this.getTemplateByType(documentData.type || 'Letter'),
      ...documentData
    };

    const updatedDocuments = [newDocument, ...documents];
    this.documentsSubject.next(updatedDocuments);
    return of(newDocument);
  }

  // Update document
  updateDocument(id: string, updates: Partial<DocumentData>): Observable<DocumentData | null> {
    const documents = this.documentsSubject.value;
    const index = documents.findIndex(doc => doc.id === id);
    
    if (index !== -1) {
      const updatedDocument = { ...documents[index], ...updates };
      documents[index] = updatedDocument;
      this.documentsSubject.next([...documents]);
      return of(updatedDocument);
    }
    
    return of(null);
  }

  // Update document status
  updateDocumentStatus(id: string, status: DocumentStatus, reviewedBy?: string): Observable<DocumentData | null> {
    const updates: Partial<DocumentData> = { status };
    if (reviewedBy) {
      updates.reviewedBy = reviewedBy;
    }
    return this.updateDocument(id, updates);
  }

  // Submit document for review
  submitForReview(id: string): Observable<DocumentData | null> {
    return this.updateDocumentStatus(id, 'InReview');
  }

  // Review document
  reviewDocument(id: string, action: 'Accept' | 'Reject', reviewerName: string, comments?: string): Observable<DocumentData | null> {
    const status: DocumentStatus = action === 'Accept' ? 'Accepted' : 'Rejected';
    
    // Create review record
    const review: DocumentReview = {
      id: this.generateId(),
      documentId: id,
      reviewerId: 'current-user-id',
      reviewerName,
      action,
      comments,
      reviewDate: new Date()
    };

    const reviews = this.reviewsSubject.value;
    this.reviewsSubject.next([...reviews, review]);

    return this.updateDocumentStatus(id, status, reviewerName);
  }

  // Mark document as completed
  markAsCompleted(id: string): Observable<DocumentData | null> {
    return this.updateDocumentStatus(id, 'Completed');
  }

  // Get reviews for a document
  getDocumentReviews(documentId: string): Observable<DocumentReview[]> {
    const reviews = this.reviewsSubject.value;
    const documentReviews = reviews.filter(review => review.documentId === documentId);
    return of(documentReviews);
  }

  // Delete document
  deleteDocument(id: string): Observable<boolean> {
    const documents = this.documentsSubject.value;
    const filteredDocuments = documents.filter(doc => doc.id !== id);
    this.documentsSubject.next(filteredDocuments);
    return of(true);
  }

  // Get documents by status
  getDocumentsByStatus(status: DocumentStatus): Observable<DocumentData[]> {
    const documents = this.documentsSubject.value;
    const filteredDocuments = documents.filter(doc => doc.status === status);
    return of(filteredDocuments);
  }

  // Get documents by type
  getDocumentsByType(type: 'Letter' | 'Memo' | 'Summary'): Observable<DocumentData[]> {
    const documents = this.documentsSubject.value;
    const filteredDocuments = documents.filter(doc => doc.type === type);
    return of(filteredDocuments);
  }

  // Version control methods
  createNewVersion(id: string, content: string): Observable<DocumentData | null> {
    const documents = this.documentsSubject.value;
    const document = documents.find(doc => doc.id === id);
    
    if (document) {
      const versionParts = document.versionNo.replace('v', '').split('.');
      const majorVersion = parseInt(versionParts[0]);
      const minorVersion = parseInt(versionParts[1] || '0');
      const newVersionNo = `v${majorVersion}.${minorVersion + 1}`;
      
      return this.updateDocument(id, {
        versionNo: newVersionNo,
        content,
        status: 'Draft'
      });
    }
    
    return of(null);
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private getTemplateByType(type: 'Letter' | 'Memo' | 'Summary'): string {
    switch (type) {
      case 'Letter':
        return this.getLetterTemplate();
      case 'Memo':
        return this.getMemoTemplate();
      case 'Summary':
        return this.getSummaryTemplate();
      default:
        return this.getLetterTemplate();
    }
  }

  private getLetterTemplate(): string {
    return `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: right; margin-bottom: 40px;">
          <div>[Your Organization Name]</div>
          <div>[Address Line 1]</div>
          <div>[Address Line 2]</div>
          <div>[City, State, ZIP Code]</div>
          <div style="margin-top: 20px;">[Date]</div>
        </div>
        
        <div style="margin-bottom: 40px;">
          <div>[Recipient Name]</div>
          <div>[Recipient Title]</div>
          <div>[Company Name]</div>
          <div>[Address Line 1]</div>
          <div>[Address Line 2]</div>
          <div>[City, State, ZIP Code]</div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <strong>Subject: [Subject Line]</strong>
        </div>
        
        <div style="margin-bottom: 20px;">
          Dear [Recipient Name],
        </div>
        
        <div style="line-height: 1.6; margin-bottom: 20px;">
          [Your message content goes here. This is the main body of your letter where you can include all relevant information, details, and any specific points you need to communicate.]
        </div>
        
        <div style="line-height: 1.6; margin-bottom: 20px;">
          [Additional paragraphs as needed.]
        </div>
        
        <div style="margin-bottom: 20px;">
          Thank you for your attention to this matter.
        </div>
        
        <div style="margin-bottom: 40px;">
          Sincerely,
        </div>
        
        <div>
          <div>[Your Name]</div>
          <div>[Your Title]</div>
          <div>[Your Contact Information]</div>
        </div>
      </div>`;
  }

  private getMemoTemplate(): string {
    return `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">MEMORANDUM</h1>
        </div>
        
        <div style="border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 20px 0; margin-bottom: 30px;">
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 10px;">
            <strong>TO:</strong>
            <span>[Recipient Name/Department]</span>
          </div>
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 10px;">
            <strong>FROM:</strong>
            <span>[Your Name/Department]</span>
          </div>
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px; margin-bottom: 10px;">
            <strong>DATE:</strong>
            <span>[Date]</span>
          </div>
          <div style="display: grid; grid-template-columns: 100px 1fr; gap: 10px;">
            <strong>SUBJECT:</strong>
            <span>[Subject Line]</span>
          </div>
        </div>
        
        <div style="line-height: 1.6; margin-bottom: 20px;">
          <strong>Purpose:</strong> [Brief statement of the memo's purpose]
        </div>
        
        <div style="line-height: 1.6; margin-bottom: 20px;">
          <strong>Background:</strong> [Relevant background information]
        </div>
        
        <div style="line-height: 1.6; margin-bottom: 20px;">
          <strong>Discussion:</strong> [Main content and analysis]
        </div>
        
        <div style="line-height: 1.6; margin-bottom: 20px;">
          <strong>Recommendations:</strong>
          <ul>
            <li>[Recommendation 1]</li>
            <li>[Recommendation 2]</li>
            <li>[Recommendation 3]</li>
          </ul>
        </div>
        
        <div style="line-height: 1.6;">
          <strong>Next Steps:</strong> [Action items and timeline]
        </div>
      </div>`;
  }

  private getSummaryTemplate(): string {
    return `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="margin: 0; font-size: 24px; color: #2d3748;">EXECUTIVE SUMMARY</h1>
          <div style="color: #718096; margin-top: 10px;">[Document Title/Case Reference]</div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 15px; margin-bottom: 15px;">
            <strong>Case ID:</strong>
            <span>[Case ID]</span>
          </div>
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 15px; margin-bottom: 15px;">
            <strong>Date Prepared:</strong>
            <span>[Date]</span>
          </div>
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 15px; margin-bottom: 15px;">
            <strong>Prepared By:</strong>
            <span>[Preparer Name]</span>
          </div>
          <div style="display: grid; grid-template-columns: 150px 1fr; gap: 15px;">
            <strong>Status:</strong>
            <span>[Current Status]</span>
          </div>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Overview</h3>
          <p style="line-height: 1.6;">[Brief overview of the matter/case/situation]</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Key Findings</h3>
          <ul style="line-height: 1.6;">
            <li>[Key finding 1]</li>
            <li>[Key finding 2]</li>
            <li>[Key finding 3]</li>
          </ul>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Recommendations</h3>
          <ol style="line-height: 1.6;">
            <li>[Recommendation 1]</li>
            <li>[Recommendation 2]</li>
            <li>[Recommendation 3]</li>
          </ol>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #2d3748; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Conclusion</h3>
          <p style="line-height: 1.6;">[Summary conclusion and next steps]</p>
        </div>
        
        <div style="border-top: 2px solid #e2e8f0; padding-top: 20px; margin-top: 40px;">
          <div style="text-align: center; color: #718096; font-size: 14px;">
            This summary was prepared for [Intended Audience] on [Date]
          </div>
        </div>
      </div>`;
  }
}