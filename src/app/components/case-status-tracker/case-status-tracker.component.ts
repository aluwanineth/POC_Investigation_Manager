// src/app/components/case-status-tracker/case-status-tracker.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StageData, CaseData } from '../../models/case.models';

@Component({
  selector: 'app-case-status-tracker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stages-container">
      <div class="stages-header">
        <h2>Case Management Process</h2>
        <p class="stages-subtitle" *ngIf="!selectedCase">
          Select a case to track its progress through each stage
        </p>
        <p class="stages-subtitle" *ngIf="selectedCase">
          Tracking progress for: <strong>{{ selectedCase.caseNo }}</strong> - 
          <span [innerHTML]="formatStatus(selectedCase.status)"></span>
        </p>
      </div>
      <div class="stages-track">
        <div *ngFor="let stage of stages; let i = index" 
             class="stage-item"
             [class.active]="stage.isActive"
             [class.completed]="stage.isCompleted">
          <div class="stage-circle">
            <i *ngIf="stage.isCompleted" class="dx-icon-check"></i>
            <span *ngIf="!stage.isCompleted">{{ i + 1 }}</span>
          </div>
          <div class="stage-content">
            <div class="stage-label">{{ stage.name }}</div>
            <div class="stage-description">{{ stage.description }}</div>
          </div>
          <div *ngIf="i < stages.length - 1" class="stage-connector"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stages-container {
      background: white;
      margin: 0 30px 30px 30px;
      border-radius: 16px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .stages-header {
      margin-bottom: 30px;
      text-align: center;
    }

    .stages-header h2 {
      margin: 0 0 8px 0;
      color: #2d3748;
      font-weight: 700;
      font-size: 24px;
    }

    .stages-subtitle {
      color: #718096;
      font-size: 14px;
      margin: 0;
    }

    .stages-track {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      position: relative;
      max-width: 1000px;
      margin: 0 auto;
    }

    .stage-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      flex: 1;
      min-width: 140px;
    }

    .stage-circle {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 18px;
      margin-bottom: 12px;
      z-index: 2;
      transition: all 0.3s ease;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stage-item.active .stage-circle {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      transform: scale(1.1);
    }

    .stage-item.completed .stage-circle {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
      box-shadow: 0 4px 20px rgba(72, 187, 120, 0.4);
    }

    .stage-content {
      text-align: center;
      max-width: 140px;
    }

    .stage-label {
      font-weight: 600;
      color: #2d3748;
      font-size: 14px;
      margin-bottom: 4px;
    }

    .stage-description {
      font-size: 12px;
      color: #718096;
      line-height: 1.3;
    }

    .stage-connector {
      position: absolute;
      top: 25px;
      left: calc(50% + 25px);
      right: calc(-50% + 25px);
      height: 3px;
      background: #e2e8f0;
      z-index: 1;
      border-radius: 2px;
    }

    @media (max-width: 768px) {
      .stages-track {
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
      }
      
      .stage-connector {
        display: none;
      }
    }
  `]
})
export class CaseStatusTrackerComponent implements OnChanges {
  @Input() selectedCase: CaseData | null = null;
  @Input() stages: StageData[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCase'] && this.selectedCase) {
      this.updateStagesForCase(this.selectedCase);
    }
  }

  private updateStagesForCase(caseData: CaseData) {
    // Reset all stages first
    this.stages = this.stages.map(stage => ({
      ...stage,
      isActive: false,
      isCompleted: false
    }));

    // Define the stage order and mapping
    const stageMapping: { [key: string]: number } = {
      'new': 1,
      'enquiry': 2,
      'allegations': 3,
      'objection': 4,
      'sanction': 5
    };

    const currentStageIndex = stageMapping[caseData.status] || 1;

    // Update stages based on current case status
    this.stages = this.stages.map((stage, index) => {
      const stageNumber = index + 1;
      
      if (stageNumber < currentStageIndex) {
        return { ...stage, isCompleted: true, isActive: false };
      } else if (stageNumber === currentStageIndex) {
        return { ...stage, isCompleted: false, isActive: true };
      } else {
        return { ...stage, isCompleted: false, isActive: false };
      }
    });
  }

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