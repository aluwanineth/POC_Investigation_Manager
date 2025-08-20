// src/app/components/case-information/case-information.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseData } from '../../models/case.models';
import { CaseDocumentsComponent } from '../case-documents/case-documents.component';
import { CaseCommentsComponent } from '../case-comments/case-comments.component';

@Component({
  selector: 'app-case-information',
  standalone: true,
  imports: [
    CommonModule,
    CaseDocumentsComponent,
    CaseCommentsComponent
  ],
  template: `
    <div class="case-information-content" *ngIf="caseData">
      <!-- Case Information Grid -->
      <div class="case-info-grid">
        <div class="case-info-row">
          <div class="case-info-item">
            <label>Investigated Party:</label>
            <span class="value">{{ caseData.investigateParty }}</span>
          </div>
          <div class="case-info-item">
            <label>Listing Type:</label>
            <span class="value">{{ caseData.listingType || 'Standard Listing' }}</span>
          </div>
          <div class="case-info-item">
            <label>Created By:</label>
            <span class="value">{{ caseData.assignedTo || 'Current User' }}</span>
          </div>
        </div>
        
        <div class="case-info-row">
          <div class="case-info-item">
            <label>Role Type:</label>
            <span class="value">{{ caseData.roleType }}</span>
          </div>
          <div class="case-info-item">
            <label>Board:</label>
            <span class="value">{{ caseData.board || 'Main Board' }}</span>
          </div>
          <div class="case-info-item">
            <label>Allocated To:</label>
            <span class="value">{{ caseData.assignedTo }}</span>
          </div>
        </div>
        
        <div class="case-info-row">
          <div class="case-info-item">
            <label>Issuer:</label>
            <span class="value">{{ caseData.issuer }}</span>
          </div>
          <div class="case-info-item">
            <label>Exchange:</label>
            <span class="value">{{ caseData.exchange }}</span>
          </div>
          <div class="case-info-item">
            <label>Second Reader:</label>
            <span class="value">{{ caseData.secondReader }}</span>
          </div>
        </div>
        
        <div class="case-info-row">
          <div class="case-info-item">
            <label>Sponsor:</label>
            <span class="value">{{ caseData.sponsor }}</span>
          </div>
          <div class="case-info-item">
            <label>Status:</label>
            <span class="value" [innerHTML]="formatStatus(caseData.status)"></span>
          </div>
          <div class="case-info-item">
            <label>Created Date:</label>
            <span class="value">{{ caseData.createdDate | date:'yyyy-MM-dd HH:mm' }}</span>
          </div>
        </div>
        
        <div class="case-info-row">
          <div class="case-info-item">
            <label>Contact/Officer/Sub:</label>
            <span class="value">{{ caseData.contactOfficer }}</span>
          </div>
          <div class="case-info-item">
            <label>Closed Date:</label>
            <span class="value">{{ caseData.closedDate ? (caseData.closedDate | date:'yyyy-MM-dd HH:mm') : '' }}</span>
          </div>
          <div class="case-info-item">
            <!-- Empty for layout -->
          </div>
        </div>
        
        <div class="case-info-row full-width">
          <div class="case-info-item description">
            <label>Description:</label>
            <span class="value">{{ caseData.description }}</span>
          </div>
        </div>
      </div>

      <!-- Supporting Documents Section -->
      <app-case-documents 
        [caseId]="caseData.id">
      </app-case-documents>

      <!-- Comments Section -->
      <app-case-comments 
        [caseId]="caseData.id">
      </app-case-comments>

      <!-- Investigation Question -->
      <div class="investigation-question">
        <span>Investigate this Regulated Party?</span>
      </div>
    </div>
  `,
  styles: [`
    .case-information-content {
      padding: 20px;
      max-height: 600px;
      overflow-y: auto;
    }

    .case-info-grid {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #e9ecef;
    }

    .case-info-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-bottom: 15px;
    }

    .case-info-row.full-width {
      grid-template-columns: 1fr;
    }

    .case-info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .case-info-item.description {
      grid-column: span 3;
    }

    .case-info-item label {
      font-weight: 600;
      color: #4a5568;
      font-size: 14px;
    }

    .case-info-item .value {
      color: #2d3748;
      font-size: 14px;
    }

    .investigation-question {
      background: #e6fffa;
      border: 1px solid #81e6d9;
      border-radius: 8px;
      padding: 12px 16px;
      color: #234e52;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .case-info-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .case-info-item.description {
        grid-column: span 1;
      }
    }
  `]
})
export class CaseInformationComponent {
  @Input() caseData: CaseData | null = null;

  formatStatus(status: string) {
    const statusColors: any = {
      'new': '#28a745',
      'enquiry': '#17a2b8',
      'allegations': '#ffc107',
      'objection': '#fd7e14',
      'sanction': '#dc3545'
    };
    
    const statusLabels: any = {
      'new': 'New',
      'enquiry': 'Enquiry',
      'allegations': 'Allegations',
      'objection': 'Objection',
      'sanction': 'Sanction'
    };
    
    const color = statusColors[status] || '#000';
    const label = statusLabels[status] || status.replace('_', ' ').toUpperCase();
    
    return `<span style="color: ${color}; font-weight: 500; padding: 4px 8px; background: ${color}15; border-radius: 4px;">
              ${label}
            </span>`;
  }
}