// src/app/components/document-management/document-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  DxDataGridModule, 
  DxButtonModule,
  DxPopupModule,
  DxTextAreaModule,
  DxTextBoxModule,
  DxSelectBoxModule
} from 'devextreme-angular';
import { DocumentStatusTrackerComponent } from '../document-status-tracker/document-status-tracker.component';

interface DocumentData {
  id: string;
  name: string;
  type: 'Letter' | 'Memo' | 'Summary';
  dateCreated: Date;
  versionNo: string;
  status: 'Draft' | 'InReview' | 'Accepted' | 'Rejected' | 'Completed';
  createdBy: string;
  reviewedBy?: string;
  content?: string;
}

@Component({
  selector: 'app-document-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxTextAreaModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DocumentStatusTrackerComponent
  ],
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.css']
})
export class DocumentManagementComponent implements OnInit {
  documents: DocumentData[] = [];
  selectedDocument: DocumentData | null = null;
  
  // Popup controls
  showNewDocumentPopup = false;
  showReviewPopup = false;
  showDocumentViewer = false;
  
  // Form data
  newDocumentForm = {
    name: '',
    type: 'Letter' as 'Letter' | 'Memo' | 'Summary'
  };
  
  reviewForm = {
    action: 'Accept' as 'Accept' | 'Reject',
    comments: ''
  };

  documentTypes = [
    { value: 'Letter', text: 'Letter' },
    { value: 'Memo', text: 'Memo' },
    { value: 'Summary', text: 'Summary' }
  ];

  reviewActions = [
    { value: 'Accept', text: 'Accept' },
    { value: 'Reject', text: 'Reject' }
  ];

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    // Static data for testing
    this.documents = [
      {
        id: '1',
        name: 'Investigation Closure Letter - C1130',
        type: 'Letter',
        dateCreated: new Date('2025-08-15T10:30:00'),
        versionNo: 'v1.0',
        status: 'Completed',
        createdBy: 'John Smith',
        reviewedBy: 'Sarah Johnson',
        content: this.getLetterTemplate()
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
        versionNo: 'v1.0',
        status: 'Rejected',
        createdBy: 'David Brown',
        reviewedBy: 'Sarah Johnson',
        content: this.getLetterTemplate()
      },
       {
        id: '5',
        name: 'Regulatory Response Letter - Market Manipulation',
        type: 'Letter',
        dateCreated: new Date('2025-08-12T16:45:00'),
        versionNo: 'v1.1',
        status: 'Rejected',
        createdBy: 'David Brown',
        reviewedBy: 'Sarah Johnson',
        content: this.getLetterTemplate()
      },
       {
        id: '6',
        name: 'Regulatory Response Letter - Market Manipulation',
        type: 'Letter',
        dateCreated: new Date('2025-08-12T16:45:00'),
        versionNo: 'v1.2',
        status: 'InReview',
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
    
    console.log('Documents loaded:', this.documents);
  }

  onDocumentSelectionChanged(event: any) {
    const selectedRowKeys = event.selectedRowKeys;
    if (selectedRowKeys && selectedRowKeys.length > 0) {
      this.selectedDocument = selectedRowKeys[0];
      console.log('Selected document:', this.selectedDocument);
    } else {
      this.selectedDocument = null;
    }
  }

  openNewDocumentDialog() {
    this.newDocumentForm = {
      name: '',
      type: 'Letter'
    };
    this.showNewDocumentPopup = true;
  }

  createNewDocument() {
    if (this.newDocumentForm.name && this.newDocumentForm.type) {
      const newDocument: DocumentData = {
        id: (this.documents.length + 1).toString(),
        name: this.newDocumentForm.name,
        type: this.newDocumentForm.type,
        dateCreated: new Date(),
        versionNo: 'v1.0',
        status: 'Draft',
        createdBy: 'Current User',
        content: this.getTemplateByType(this.newDocumentForm.type)
      };
      
      this.documents = [newDocument, ...this.documents];
      this.showNewDocumentPopup = false;
      
      // Open the document for editing
      this.selectedDocument = newDocument;
      this.showDocumentViewer = true;
    }
  }

  openDocumentViewer(document: DocumentData) {
    this.selectedDocument = document;
    this.showDocumentViewer = true;
  }

  submitForReview(document: DocumentData) {
    const index = this.documents.findIndex(d => d.id === document.id);
    if (index !== -1) {
      this.documents[index] = {
        ...this.documents[index],
        status: 'InReview'
      };
      this.selectedDocument = this.documents[index];
      this.documents = [...this.documents]; // Trigger change detection
    }
  }

  openReviewDialog(document: DocumentData) {
    this.selectedDocument = document;
    this.reviewForm = {
      action: 'Accept',
      comments: ''
    };
    this.showReviewPopup = true;
  }

  submitReview() {
    if (this.selectedDocument) {
      const index = this.documents.findIndex(d => d.id === this.selectedDocument!.id);
      if (index !== -1) {
        const newStatus = this.reviewForm.action === 'Accept' ? 'Accepted' : 'Rejected';
        this.documents[index] = {
          ...this.documents[index],
          status: newStatus,
          reviewedBy: 'Current Reviewer'
        };
        this.selectedDocument = this.documents[index];
        this.documents = [...this.documents]; // Trigger change detection
      }
    }
    this.showReviewPopup = false;
  }

  markAsCompleted(document: DocumentData) {
    const index = this.documents.findIndex(d => d.id === document.id);
    if (index !== -1) {
      this.documents[index] = {
        ...this.documents[index],
        status: 'Completed'
      };
      this.selectedDocument = this.documents[index];
      this.documents = [...this.documents]; // Trigger change detection
    }
  }

  formatStatus(status: string) {
    const statusColors: any = {
      'Draft': '#6c757d',
      'InReview': '#17a2b8',
      'Accepted': '#28a745',
      'Rejected': '#dc3545',
      'Completed': '#667eea'
    };
    
    const color = statusColors[status] || '#000';
    
    return `<span style="color: ${color}; font-weight: 500; padding: 4px 8px; background: ${color}15; border-radius: 4px;">
              ${status}
            </span>`;
  }

  getDocumentActions(document: DocumentData): string[] {
    switch (document.status) {
      case 'Draft':
        return ['Edit', 'Submit for Review'];
      case 'InReview':
        return ['View', 'Review'];
      case 'Accepted':
        return ['View', 'Mark as Completed'];
      case 'Rejected':
        return ['Edit', 'Submit for Review'];
      case 'Completed':
        return ['View'];
      default:
        return ['View'];
    }
  }

  onDocumentAction(action: string, document: DocumentData) {
    switch (action) {
      case 'Edit':
      case 'View':
        this.openDocumentViewer(document);
        break;
      case 'Submit for Review':
        this.submitForReview(document);
        break;
      case 'Review':
        this.openReviewDialog(document);
        break;
      case 'Mark as Completed':
        this.markAsCompleted(document);
        break;
    }
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
          <div>[City, State, ZIP Code]</div>
          <div style="margin-top: 20px;">[Date]</div>
        </div>
        <div style="margin-bottom: 40px;">
          <div>[Recipient Name]</div>
          <div>[Company Name]</div>
          <div>[Address]</div>
        </div>
        <div style="margin-bottom: 20px;">
          <strong>Subject: [Subject Line]</strong>
        </div>
        <div style="margin-bottom: 20px;">Dear [Recipient Name],</div>
        <div style="line-height: 1.6; margin-bottom: 20px;">
          [Your message content goes here.]
        </div>
        <div style="margin-bottom: 40px;">Sincerely,</div>
        <div>
          <div>[Your Name]</div>
          <div>[Your Title]</div>
        </div>
      </div>`;
  }

  private getMemoTemplate(): string {
    return `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="margin: 0; font-size: 24px;">MEMORANDUM</h1>
        </div>
        <div style="border: 2px solid #000; padding: 20px; margin-bottom: 30px;">
          <div><strong>TO:</strong> [Recipient]</div>
          <div><strong>FROM:</strong> [Your Name]</div>
          <div><strong>DATE:</strong> [Date]</div>
          <div><strong>SUBJECT:</strong> [Subject]</div>
        </div>
        <div style="line-height: 1.6;">
          [Memo content goes here]
        </div>
      </div>`;
  }

  private getSummaryTemplate(): string {
    return `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="margin: 0; font-size: 24px;">EXECUTIVE SUMMARY</h1>
        </div>
        <div style="background: #f8f9fa; padding: 20px; margin-bottom: 30px;">
          <div><strong>Case ID:</strong> [Case ID]</div>
          <div><strong>Date:</strong> [Date]</div>
          <div><strong>Prepared By:</strong> [Name]</div>
        </div>
        <div style="margin-bottom: 25px;">
          <h3>Overview</h3>
          <p>[Overview content]</p>
        </div>
        <div style="margin-bottom: 25px;">
          <h3>Key Findings</h3>
          <ul>
            <li>[Finding 1]</li>
            <li>[Finding 2]</li>
          </ul>
        </div>
        <div>
          <h3>Recommendations</h3>
          <ol>
            <li>[Recommendation 1]</li>
            <li>[Recommendation 2]</li>
          </ol>
        </div>
      </div>`;
  }
}