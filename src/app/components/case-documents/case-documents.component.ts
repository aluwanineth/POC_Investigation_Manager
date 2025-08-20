// src/app/components/case-documents/case-documents.component.ts
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule, DxButtonModule } from 'devextreme-angular';
import { DocumentData } from '../../models/case.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-case-documents',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    DxButtonModule
  ],
  template: `
    <div class="documents-section">
      <div class="section-header">
        <h4>Supporting Documents</h4>
        <dx-button
          text="Add Supporting Document(s)"
          type="default"
          icon="plus"
          (onClick)="addSupportingDocument()"
          class="add-document-btn">
        </dx-button>
      </div>
      
      <dx-data-grid
        [dataSource]="documents"
        [showBorders]="true"
        [rowAlternationEnabled]="true"
        [columnAutoWidth]="true"
        [showRowLines]="true"
        [showColumnLines]="false"
        class="documents-grid">
        
        <dxi-column dataField="fileName" caption="Name" [width]="200"></dxi-column>
        <dxi-column dataField="documentType" caption="Document Type" [width]="150"></dxi-column>
        <dxi-column dataField="documentNumber" caption="Document Number" [width]="150"></dxi-column>
        <dxi-column dataField="uploadedBy" caption="Uploaded By" [width]="120"></dxi-column>
        <dxi-column dataField="uploadDate" caption="Date Uploaded" [width]="140" dataType="datetime" format="yyyy-MM-dd HH:mm"></dxi-column>
        <dxi-column dataField="stage" caption="Stage" [width]="100"></dxi-column>
        <dxi-column type="buttons" [width]="120">
          <dxi-button icon="edit" (onClick)="editDocument($event)" hint="Edit Document"></dxi-button>
          <dxi-button icon="download" (onClick)="downloadDocument($event)" hint="Download Document"></dxi-button>
        </dxi-column>
      </dx-data-grid>

      <div *ngIf="documents.length === 0" class="no-documents">
        <div class="no-documents-icon">
          <i class="dx-icon-doc"></i>
        </div>
        <h5>No Documents</h5>
        <p>No supporting documents have been uploaded for this case yet.</p>
      </div>
    </div>
  `,
  styles: [`
    .documents-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #e9ecef;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h4 {
      margin: 0;
      color: #2d3748;
      font-weight: 600;
      font-size: 16px;
    }

    .add-document-btn {
      height: 36px;
      border-radius: 8px;
    }

    .documents-grid {
      border-radius: 8px;
      overflow: hidden;
    }

    .documents-grid ::ng-deep .dx-datagrid {
      border: none;
    }

    .documents-grid ::ng-deep .dx-datagrid-headers {
      background: #f1f3f4;
    }

    .documents-grid ::ng-deep .dx-row:hover {
      background-color: #e8f4fd;
    }

    .no-documents {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      color: #718096;
    }

    .no-documents-icon {
      font-size: 48px;
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .no-documents h5 {
      margin: 0 0 8px 0;
      font-weight: 600;
    }

    .no-documents p {
      margin: 0;
      font-size: 14px;
    }
  `]
})
export class CaseDocumentsComponent implements OnInit {
  @Input() caseId: string = '';
  @Output() documentAdded = new EventEmitter<void>();
  @Output() documentEdited = new EventEmitter<DocumentData>();

  documents: DocumentData[] = [];

  ngOnInit() {
    this.loadDocuments();
  }

  ngOnChanges() {
    if (this.caseId) {
      this.loadDocuments();
    }
  }

  private loadDocuments() {
    // Simulate loading documents for the case
    if (this.caseId) {
      this.documents = [
        {
          id: '1',
          fileName: '20250605157003ASIEMOI.docx',
          fileType: 'docx',
          uploadDate: new Date('2025-08-14T15:20:00'),
          size: 1024000,
          documentType: 'SENS Announcement',
          documentNumber: 'DOC-2025-001',
          uploadedBy: 'Current User',
          stage: 'New'
        }
      ];
    } else {
      this.documents = [];
    }
  }

  addSupportingDocument() {
    Swal.fire({
      title: 'Add Supporting Document',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Document Type:</label>
          <select id="swal-document-type" class="swal2-input" style="margin-bottom: 15px;">
            <option value="">Select Document Type</option>
            <option value="SENS Announcement">SENS Announcement</option>
            <option value="Financial Statement">Financial Statement</option>
            <option value="Legal Document">Legal Document</option>
            <option value="Correspondence">Correspondence</option>
            <option value="Evidence">Evidence</option>
          </select>
          
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Document Number:</label>
          <input id="swal-document-number" class="swal2-input" placeholder="Enter document number" style="margin-bottom: 15px;">
          
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Stage:</label>
          <select id="swal-stage" class="swal2-input">
            <option value="">Select Stage</option>
            <option value="New">New</option>
            <option value="Enquiry">Enquiry</option>
            <option value="Allegations">Allegations</option>
            <option value="Objection">Objection</option>
            <option value="Sanction">Sanction</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Upload Document',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',
      preConfirm: () => {
        const documentType = (document.getElementById('swal-document-type') as HTMLSelectElement)?.value;
        const documentNumber = (document.getElementById('swal-document-number') as HTMLInputElement)?.value;
        const stage = (document.getElementById('swal-stage') as HTMLSelectElement)?.value;
        
        if (!documentType || !documentNumber || !stage) {
          Swal.showValidationMessage('Please fill in all fields');
          return false;
        }
        
        return { documentType, documentNumber, stage };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const newDocument: DocumentData = {
          id: Date.now().toString(),
          fileName: `uploaded_document_${Date.now()}.pdf`,
          fileType: 'pdf',
          uploadDate: new Date(),
          size: 2048000,
          documentType: result.value.documentType,
          documentNumber: result.value.documentNumber,
          uploadedBy: 'Current User',
          stage: result.value.stage
        };
        
        this.documents.push(newDocument);
        this.documentAdded.emit();
        
        Swal.fire({
          title: 'Document Added',
          text: 'The document has been successfully uploaded',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    });
  }

  editDocument(e: any) {
    const document = e.row.data;
    
    Swal.fire({
      title: 'Edit Document',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Document Type:</label>
          <select id="swal-edit-document-type" class="swal2-input" style="margin-bottom: 15px;">
            <option value="SENS Announcement" ${document.documentType === 'SENS Announcement' ? 'selected' : ''}>SENS Announcement</option>
            <option value="Financial Statement" ${document.documentType === 'Financial Statement' ? 'selected' : ''}>Financial Statement</option>
            <option value="Legal Document" ${document.documentType === 'Legal Document' ? 'selected' : ''}>Legal Document</option>
            <option value="Correspondence" ${document.documentType === 'Correspondence' ? 'selected' : ''}>Correspondence</option>
            <option value="Evidence" ${document.documentType === 'Evidence' ? 'selected' : ''}>Evidence</option>
          </select>
          
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Document Number:</label>
          <input id="swal-edit-document-number" class="swal2-input" value="${document.documentNumber}" style="margin-bottom: 15px;">
          
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Stage:</label>
          <select id="swal-edit-stage" class="swal2-input">
            <option value="New" ${document.stage === 'New' ? 'selected' : ''}>New</option>
            <option value="Enquiry" ${document.stage === 'Enquiry' ? 'selected' : ''}>Enquiry</option>
            <option value="Allegations" ${document.stage === 'Allegations' ? 'selected' : ''}>Allegations</option>
            <option value="Objection" ${document.stage === 'Objection' ? 'selected' : ''}>Objection</option>
            <option value="Sanction" ${document.stage === 'Sanction' ? 'selected' : ''}>Sanction</option>
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Document',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',
      preConfirm: () => {
        const documentType = (document.getElementById('swal-edit-document-type') as HTMLSelectElement)?.value;
        const documentNumber = (document.getElementById('swal-edit-document-number') as HTMLInputElement)?.value;
        const stage = (document.getElementById('swal-edit-stage') as HTMLSelectElement)?.value;
        
        return { documentType, documentNumber, stage };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.documents.findIndex(doc => doc.id === document.id);
        if (index !== -1) {
          this.documents[index] = {
            ...this.documents[index],
            documentType: result.value.documentType,
            documentNumber: result.value.documentNumber,
            stage: result.value.stage
          };
          
          this.documentEdited.emit(this.documents[index]);
          
          Swal.fire({
            title: 'Document Updated',
            text: 'The document has been successfully updated',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      }
    });
  }

  downloadDocument(e: any) {
    const document = e.row.data;
    
    Swal.fire({
      title: 'Download Document',
      text: `Download ${document.fileName}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Download',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#17a2b8'
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulate download
        Swal.fire({
          title: 'Download Started',
          text: 'The document download has been initiated',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    });
  }
}