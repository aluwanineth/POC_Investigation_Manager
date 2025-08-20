// src/app/components/document-status-tracker/document-status-tracker.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentData, DocumentStageData } from '../../models/document.models';

@Component({
  selector: 'app-document-status-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="document-stages-container">
      <div class="stages-header">
        <h3>Document Progress Tracker</h3>
        <p class="stages-subtitle" *ngIf="!selectedDocument">
          Select a document to track its progress through the review process
        </p>
        <p class="stages-subtitle" *ngIf="selectedDocument">
          Tracking progress for: <strong>{{ selectedDocument.name }}</strong> - 
          <span [innerHTML]="formatStatus(selectedDocument.status)"></span>
        </p>
      </div>
      <div class="stages-track">
        <div *ngFor="let stage of documentStages; let i = index" 
             class="stage-item"
             [class.active]="stage.isActive"
             [class.completed]="stage.isCompleted"
             [class.rejected]="selectedDocument?.status === 'Rejected' && stage.statusType === 'Rejected'">
          <div class="stage-circle">
            <i *ngIf="stage.isCompleted" class="dx-icon-check"></i>
            <i *ngIf="selectedDocument?.status === 'Rejected' && stage.statusType === 'Rejected'" class="dx-icon-close"></i>
            <span *ngIf="!stage.isCompleted && !(selectedDocument?.status === 'Rejected' && stage.statusType === 'Rejected')">{{ i + 1 }}</span>
          </div>
          <div class="stage-content">
            <div class="stage-label">{{ stage.name }}</div>
            <div class="stage-description">{{ stage.description }}</div>
          </div>
          <div *ngIf="i < documentStages.length - 1" class="stage-connector"
               [class.rejected-connector]="selectedDocument?.status === 'Rejected' && stage.statusType === 'InReview'"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .document-stages-container {
      background: white;
      margin: 0 0 30px 0;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
    }

    .stages-header {
      margin-bottom: 24px;
      text-align: center;
    }

    .stages-header h3 {
      margin: 0 0 6px 0;
      color: #2d3748;
      font-weight: 600;
      font-size: 18px;
    }

    .stages-subtitle {
      color: #718096;
      font-size: 13px;
      margin: 0;
    }

    .stages-track {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
      max-width: 800px;
      margin: 0 auto;
    }

    .stage-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      flex: 1;
      min-width: 120px;
    }

    .stage-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 10px;
      z-index: 2;
      transition: all 0.3s ease;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .stage-item.active .stage-circle {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
      transform: scale(1.05);
    }

    .stage-item.completed .stage-circle {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      box-shadow: 0 4px 16px rgba(72, 187, 120, 0.4);
    }

    .stage-item.rejected .stage-circle {
      background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
      box-shadow: 0 4px 16px rgba(245, 101, 101, 0.4);
    }

    .stage-content {
      text-align: center;
      max-width: 120px;
    }

    .stage-label {
      font-weight: 600;
      color: #2d3748;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .stage-description {
      font-size: 11px;
      color: #718096;
      line-height: 1.3;
    }

    .stage-connector {
      position: absolute;
      top: 20px;
      left: calc(50% + 20px);
      right: calc(-50% + 20px);
      height: 2px;
      background: #e2e8f0;
      z-index: 1;
      border-radius: 2px;
    }

    .stage-connector.rejected-connector {
      background: #f56565;
    }

    @media (max-width: 768px) {
      .stages-track {
        flex-wrap: wrap;
        gap: 16px;
        justify-content: center;
      }
      
      .stage-connector {
        display: none;
      }
    }
  `]
})
export class DocumentStatusTrackerComponent implements OnChanges {
  @Input() selectedDocument: DocumentData | null = null;

  documentStages: DocumentStageData[] = [
    {
      id: '1',
      name: 'Draft',
      description: 'Document created and being edited',
      isActive: false,
      isCompleted: false,
      statusType: 'Draft'
    },
    {
      id: '2',
      name: 'In Review',
      description: 'Document submitted for review',
      isActive: false,
      isCompleted: false,
      statusType: 'InReview'
    },
    {
      id: '3',
      name: 'Accepted',
      description: 'Document approved by reviewer',
      isActive: false,
      isCompleted: false,
      statusType: 'Accepted'
    },
    {
      id: '4',
      name: 'Completed',
      description: 'Document finalized and published',
      isActive: false,
      isCompleted: false,
      statusType: 'Completed'
    }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedDocument'] && this.selectedDocument) {
      this.updateStagesForDocument(this.selectedDocument);
    }
  }

  private updateStagesForDocument(document: DocumentData) {
    // Reset all stages first
    this.documentStages = this.documentStages.map(stage => ({
      ...stage,
      isActive: false,
      isCompleted: false
    }));

    // Update stages based on current document status
    switch (document.status) {
      case 'Draft':
        this.setStageActive(0);
        break;
      case 'InReview':
        this.setStageCompleted(0);
        this.setStageActive(1);
        break;
      case 'Accepted':
        this.setStageCompleted(0);
        this.setStageCompleted(1);
        this.setStageActive(2);
        break;
      case 'Rejected':
        this.setStageCompleted(0);
        this.setStageActive(1);
        // For rejected documents, we show a different visual state
        break;
      case 'Completed':
        this.setStageCompleted(0);
        this.setStageCompleted(1);
        this.setStageCompleted(2);
        this.setStageActive(3);
        break;
    }
  }

  private setStageActive(index: number) {
    if (this.documentStages[index]) {
      this.documentStages[index].isActive = true;
    }
  }

  private setStageCompleted(index: number) {
    if (this.documentStages[index]) {
      this.documentStages[index].isCompleted = true;
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
}