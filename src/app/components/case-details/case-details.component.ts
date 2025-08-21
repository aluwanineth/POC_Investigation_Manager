// src/app/components/case-details/case-details.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxTabPanelModule } from 'devextreme-angular';
import { CaseData, InvestigationData } from '../../models/case.models';
import { CaseInformationComponent } from '../case-information/case-information.component';
import { InvestigationDetailsComponent } from '../investigation-details/investigation-details.component';
import { MeetingSchedulerComponent } from '../meeting/meeting.component';

@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [
    CommonModule,
    DxTabPanelModule,
    CaseInformationComponent,
    InvestigationDetailsComponent,
    MeetingSchedulerComponent
  ],
  template: `
    <div class="case-details-container">
      <div class="panel-card">
        <div class="panel-header">
          <h3>Case Details</h3>
          <span *ngIf="selectedCase" class="selected-case">{{ selectedCase.caseNo }}</span>
        </div>
        
        <div *ngIf="!selectedCase" class="no-selection">
          <div class="no-selection-icon">
            <i class="dx-icon-folder"></i>
          </div>
          <h4>No Case Selected</h4>
          <p>Select a case from the left panel to view detailed information</p>
        </div>

        <div *ngIf="selectedCase" class="case-details">
          <dx-tab-panel
            [dataSource]="caseDetailTabs"
            [selectedIndex]="0"
            [animationEnabled]="true"
            [swipeEnabled]="false"
            class="case-detail-tabs">
            
            <!-- Case Information Tab -->
            <div *dxTemplate="let tabData of 'caseDetailsTab'">
              <app-case-information 
                [caseData]="selectedCase">
              </app-case-information>
            </div>

            <!-- Investigation Tab -->
            <div *dxTemplate="let tabData of 'investigationDetailsTab'">
              <app-investigation-details 
                [investigation]="selectedInvestigation">
              </app-investigation-details>
            </div>
          </dx-tab-panel>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .case-details-container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      height: 100%;
    }

    .panel-card {
      padding: 24px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f7fafc;
    }

    .panel-header h3 {
      margin: 0;
      color: #2d3748;
      font-weight: 700;
      font-size: 20px;
    }

    .selected-case {
      background: #667eea;
      color: white;
      padding: 4px 12px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 14px;
    }

    .no-selection {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-align: center;
      color: #a0aec0;
    }

    .no-selection-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-selection h4 {
      margin: 0 0 8px 0;
      color: #718096;
      font-weight: 600;
    }

    .no-selection p {
      margin: 0;
      font-size: 14px;
    }

    .case-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .case-detail-tabs {
      flex: 1;
    }

    .case-detail-tabs ::ng-deep .dx-tabpanel-tabs {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 4px;
    }

    .case-detail-tabs ::ng-deep .dx-tab {
      border-radius: 6px;
      font-weight: 500;
    }

    .case-detail-tabs ::ng-deep .dx-tab-selected {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class CaseDetailsComponent implements OnChanges {
  @Input() selectedCase: CaseData | null = null;
  @Input() selectedInvestigation: InvestigationData | null = null;

  caseDetailTabs = [
    { title: 'Case', template: 'caseDetailsTab' },
    { title: 'Investigation', template: 'investigationDetailsTab' }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedCase'] && this.selectedCase) {
      // Handle case selection change
      console.log('Case details updated for:', this.selectedCase.caseNo);
    }
  }

  onInvestigationSelected(investigation: any) {
    console.log('Investigation selected:', investigation);
    // Handle investigation selection if needed
  }
}