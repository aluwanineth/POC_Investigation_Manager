import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

import { CaseDataService } from './services/case-data.service';
import { CaseData, StageData, InvestigationData } from './models/case.models';

import { HeaderComponent } from './components/header/header.component';
import { CaseStatusTrackerComponent } from './components/case-status-tracker/case-status-tracker.component';
import { CaseListComponent } from './components/case-list/case-list.component';
import { CaseDetailsComponent } from './components/case-details/case-details.component';
import { CaseCreationDialogComponent } from './components/case-creation-dialog/case-creation-dialog.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    CaseStatusTrackerComponent,
    CaseListComponent,
    CaseDetailsComponent,
    CaseCreationDialogComponent
  ],
  template: `
    <div class="case-management-container">
      <!-- Header Component -->
      <app-header 
        [title]="title"
        [currentUser]="currentUser">
      </app-header>

      <!-- Case Status Tracker Component -->
      <app-case-status-tracker 
        [selectedCase]="selectedCase"
        [stages]="stages">
      </app-case-status-tracker>

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Left Panel - Case List -->
        <div class="left-panel">
          <app-case-list
            [cases]="allCases"
            [selectedCaseId]="selectedCase?.id || null"
            (caseSelected)="onCaseSelected($event)"
            (createCaseClicked)="showCreateCaseDialog()">
          </app-case-list>
        </div>

        <!-- Right Panel - Case Details -->
        <div class="right-panel">
          <app-case-details
            [selectedCase]="selectedCase"
            [selectedInvestigation]="selectedInvestigation">
          </app-case-details>
        </div>
      </div>

      <!-- Case Creation Dialog -->
      <app-case-creation-dialog
        [visible]="createCaseDialogVisible"
        (dialogClosed)="onCreateCaseDialogClosed()"
        (caseSaved)="onCaseSaved($event)">
      </app-case-creation-dialog>
    </div>
  `,
  styles: [`
    .case-management-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 0;
    }

    .main-content {
      display: grid;
      grid-template-columns: 0.6fr 1.4fr;
      gap: 30px;
      padding: 0 30px 30px 30px;
      min-height: calc(100vh - 300px);
    }

    .left-panel, .right-panel {
      display: flex;
      flex-direction: column;
    }

    @media (max-width: 768px) {
      .main-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }
  `]
})

export class App implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();
  
  // Application state
  title = 'Case Management System';
  currentUser = 'Aluwani Nethavhakone';
  createCaseDialogVisible = false;
  
  selectedCase: CaseData | null = null;
  selectedInvestigation: InvestigationData | null = null;
  
  // Data
  allCases: CaseData[] = [];

  // Stages configuration
  stages: StageData[] = [
    { id: 1, name: 'New', isActive: false, isCompleted: false, description: 'Case creation and initial setup' },
    { id: 2, name: 'Enquiry', isActive: false, isCompleted: false, description: 'Initial investigation and enquiry' },
    { id: 3, name: 'Allegations', isActive: false, isCompleted: false, description: 'Formal allegations assessment' },
    { id: 4, name: 'Objection', isActive: false, isCompleted: false, description: 'Objection review and response' },
    { id: 5, name: 'Sanction', isActive: false, isCompleted: false, description: 'Final sanction determination' }
  ];

  constructor(private caseDataService: CaseDataService) {}

  ngOnInit() {
    this.loadCases();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCases() {
    this.caseDataService.cases$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cases => {
        this.allCases = cases;
      });
  }

  onCaseSelected(caseData: CaseData) {
    this.selectedCase = caseData;
    this.loadCaseInvestigation(caseData.id);
    
    Swal.fire({
      title: 'Case Selected',
      text: `Selected case: ${caseData.caseNo}`,
      icon: 'info',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  private loadCaseInvestigation(caseId: string) {
    const investigations = this.caseDataService.getInvestigationsByCaseId(caseId);
    this.selectedInvestigation = investigations.length > 0 ? investigations[0] : null;
  }

  showCreateCaseDialog() {
    this.createCaseDialogVisible = true;
    
    Swal.fire({
      title: 'Create Case Dialog Opened',
      text: 'Fill in the required information to create a new case.',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  onCreateCaseDialogClosed() {
    this.createCaseDialogVisible = false;
  }

  onCaseSaved(caseData: CaseData) {
    this.createCaseDialogVisible = false;
    
    // Reload cases to include the new one
    this.loadCases();
    
    // Automatically select the new case
    this.selectedCase = caseData;
    this.loadCaseInvestigation(caseData.id);
    
    Swal.fire({
      title: 'Case Created Successfully!',
      text: `Case ${caseData.caseNo} has been created and assigned.`,
      icon: 'success',
      confirmButtonColor: '#28a745',
      timer: 3000,
      timerProgressBar: true
    });
  }
}