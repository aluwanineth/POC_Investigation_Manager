// src/app/components/case-creation-dialog/case-creation-dialog.component.ts
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  DxPopupModule, 
  DxTabPanelModule,
  DxSelectBoxModule, 
  DxCheckBoxModule, 
  DxFileUploaderModule,
  DxTextBoxModule, 
  DxTextAreaModule,
  DxButtonModule
} from 'devextreme-angular';
import { CaseData } from '../../models/case.models';
import { CaseDataService } from '../../services/case-data.service';
import Swal from 'sweetalert2';

interface CaseFormData {
  area: string;
  part: string | null;
  roleType: string | null;
  regulatedParty: string | null;
  investigateRegulatedParty: boolean;
}

interface InvestigationFormData {
  area: string;
  part: string | null;
  roleType: string | null;
  regulatedParty: string | null;
  eventType: string | null;
  complainantName: string;
  complainantSurname: string;
  complainantEmail: string;
  relationshipType: string | null;
  contactCode: string;
  contactNumber: string;
  entity: string;
}

@Component({
  selector: 'app-case-creation-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxPopupModule,
    DxTabPanelModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxFileUploaderModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxButtonModule
  ],
  template: `
    <dx-popup
      [(visible)]="visible"
      [width]="900"
      [height]="700"
      title="Create New Case"
      [showCloseButton]="true"
      [dragEnabled]="true"
      [resizeEnabled]="true"
      (onHiding)="onDialogClose()">
      
      <div *dxTemplate="let data of 'content'">
        <dx-tab-panel
          [dataSource]="tabPanelItems"
          [selectedIndex]="0"
          [animationEnabled]="true"
          [swipeEnabled]="false"
          class="case-tabs">
          
          <!-- Case Tab Template -->
          <div *dxTemplate="let tabData of 'caseTab'">
            <div class="tab-content">
              <!-- Area Description Card -->
              <div class="form-card">
                <div class="form-card-header">
                  <h4><i class="dx-icon-doc"></i> Area</h4>
                  <span class="required">*</span>
                </div>
                <dx-text-area
                  placeholder="Enter area description..."
                  [(value)]="caseForm.area"
                  [height]="100"
                  class="form-control">
                </dx-text-area>
              </div>

              <!-- Regulated Party Card -->
              <div class="form-card">
                <div class="form-card-header">
                  <h4><i class="dx-icon-group"></i> Regulated Party</h4>
                  <span class="required">*</span>
                </div>
                
                <div class="form-grid">
                  <div class="form-row">
                    <label class="form-label">Part:</label>
                    <dx-select-box
                      [dataSource]="partOptions"
                      displayExpr="text"
                      valueExpr="value"
                      placeholder="Select Part..."
                      [(value)]="caseForm.part"
                      class="form-control">
                    </dx-select-box>
                  </div>
                  
                  <div class="form-row">
                    <label class="form-label">Role Type:</label>
                    <dx-select-box
                      [dataSource]="roleTypeOptions"
                      displayExpr="text"
                      valueExpr="value"
                      placeholder="Select Role Type..."
                      [(value)]="caseForm.roleType"
                      class="form-control">
                    </dx-select-box>
                  </div>
                  
                  <div class="form-row">
                    <label class="form-label">Regulated Party:</label>
                    <dx-select-box
                      [dataSource]="regulatedPartyOptions"
                      displayExpr="text"
                      valueExpr="value"
                      placeholder="Select Regulated Party..."
                      [(value)]="caseForm.regulatedParty"
                      class="form-control">
                    </dx-select-box>
                  </div>
                </div>
              </div>

              <!-- Documents Card -->
              <div class="form-card">
                <div class="form-card-header">
                  <h4><i class="dx-icon-attach"></i> Documents</h4>
                </div>
                <dx-file-uploader
                  [multiple]="true"
                  accept=".pdf,.doc,.docx,.jpg,.png,.xlsx"
                  uploadMode="useButtons"
                  [showFileList]="true"
                  (onValueChanged)="onFileUploaded($event)"
                  class="file-uploader">
                </dx-file-uploader>
                <div class="upload-help">
                  <span>Add Supporting document(s)</span>
                </div>
              </div>

              <!-- Investigation Checkbox -->
              <div class="form-card">
                <dx-check-box
                  text="Investigate this Regulated party?"
                  [(value)]="caseForm.investigateRegulatedParty"
                  class="investigate-checkbox">
                </dx-check-box>
              </div>
            </div>
          </div>

          <!-- Investigation Tab Template -->
          <div *dxTemplate="let tabData of 'investigationTab'">
            <div class="tab-content">
              <!-- Area Description -->
              <div class="form-card">
                <div class="form-card-header">
                  <h4><i class="dx-icon-search"></i> Area</h4>
                </div>
                <dx-text-area
                  placeholder="Enter area description..."
                  [(value)]="investigationForm.area"
                  [height]="80"
                  class="form-control">
                </dx-text-area>
              </div>

              <!-- Complainant -->
              <div class="form-card">
                <div class="form-card-header">
                  <h4><i class="dx-icon-user"></i> Complainant</h4>
                </div>
                
                <div class="form-grid">
                  <div class="form-row">
                    <label class="form-label">Name:</label>
                    <dx-text-box
                      placeholder="Enter name"
                      [(value)]="investigationForm.complainantName"
                      class="form-control">
                    </dx-text-box>
                  </div>
                  
                  <div class="form-row">
                    <label class="form-label">Surname:</label>
                    <dx-text-box
                      placeholder="Enter surname"
                      [(value)]="investigationForm.complainantSurname"
                      class="form-control">
                    </dx-text-box>
                  </div>
                  
                  <div class="form-row">
                    <label class="form-label">Email:</label>
                    <dx-text-box
                      placeholder="Enter email"
                      [(value)]="investigationForm.complainantEmail"
                      class="form-control">
                    </dx-text-box>
                  </div>
                  
                  <div class="form-row">
                    <label class="form-label">Contact Number:</label>
                    <div class="contact-number-container">
                      <dx-text-box
                        placeholder="Code"
                        [(value)]="investigationForm.contactCode"
                        class="contact-code">
                      </dx-text-box>
                      <dx-text-box
                        placeholder="Phone number"
                        [(value)]="investigationForm.contactNumber"
                        class="contact-number">
                      </dx-text-box>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </dx-tab-panel>

        <!-- Popup Actions -->
        <div class="popup-actions">
          <div class="action-buttons">
            <dx-button
              text="Cancel"
              type="normal"
              icon="close"
              (onClick)="onCancel()"
              class="action-btn cancel-btn">
            </dx-button>
            <dx-button
              text="Save Case"
              type="success"
              icon="save"
              (onClick)="onSave()"
              class="action-btn save-btn">
            </dx-button>
          </div>
        </div>
      </div>
    </dx-popup>
  `,
  styles: [`
    .tab-content {
      padding: 24px;
      max-height: 480px;
      overflow-y: auto;
    }

    .form-card {
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .form-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .form-card-header h4 {
      margin: 0;
      color: #2d3748;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .required {
      color: #e53e3e;
      font-weight: 700;
      font-size: 18px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-weight: 500;
      color: #4a5568;
      font-size: 14px;
      margin: 0;
    }

    .contact-number-container {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .contact-code {
      width: 100px;
      flex-shrink: 0;
    }

    .contact-number {
      flex: 1;
    }

    .upload-help {
      margin: 12px 0 0 0;
      font-size: 12px;
      color: #718096;
    }

    .popup-actions {
      padding: 24px;
      border-top: 2px solid #e9ecef;
      background: #f8f9fa;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .action-btn {
      min-width: 120px;
      height: 44px;
      border-radius: 8px;
      font-weight: 600;
    }
  `]
})
export class CaseCreationDialogComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Output() dialogClosed = new EventEmitter<void>();
  @Output() caseSaved = new EventEmitter<CaseData>();

  // Tab panel configuration
  tabPanelItems = [
    { title: 'Case', template: 'caseTab' },
    { title: 'Investigation', template: 'investigationTab' }
  ];

  // Form data
  caseForm: CaseFormData = {
    area: '',
    part: null,
    roleType: null,
    regulatedParty: null,
    investigateRegulatedParty: false
  };

  investigationForm: InvestigationFormData = {
    area: '',
    part: null,
    roleType: null,
    regulatedParty: null,
    eventType: null,
    complainantName: '',
    complainantSurname: '',
    complainantEmail: '',
    relationshipType: null,
    contactCode: '+27',
    contactNumber: '',
    entity: ''
  };

  // Dropdown options
  partOptions: any[] = [];
  roleTypeOptions: any[] = [];
  regulatedPartyOptions: any[] = [];

  constructor(private caseDataService: CaseDataService) {}

  ngOnChanges() {
    if (this.visible) {
      this.loadDropdownOptions();
      this.resetForms();
    }
  }

  private loadDropdownOptions() {
    this.partOptions = this.caseDataService.getPartOptions();
    this.roleTypeOptions = this.caseDataService.getRoleTypeOptions();
    this.regulatedPartyOptions = this.caseDataService.getRegulatedPartyOptions();
  }

  private resetForms() {
    this.caseForm = {
      area: '',
      part: null,
      roleType: null,
      regulatedParty: null,
      investigateRegulatedParty: false
    };

    this.investigationForm = {
      area: '',
      part: null,
      roleType: null,
      regulatedParty: null,
      eventType: null,
      complainantName: '',
      complainantSurname: '',
      complainantEmail: '',
      relationshipType: null,
      contactCode: '+27',
      contactNumber: '',
      entity: ''
    };
  }

  onDialogClose() {
    this.dialogClosed.emit();
  }

  onCancel() {
    Swal.fire({
      title: 'Discard Changes?',
      text: 'Are you sure you want to close without saving?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, discard',
      cancelButtonText: 'Continue editing'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialogClosed.emit();
      }
    });
  }

  onSave() {
    if (!this.validateForm()) {
      return;
    }

    Swal.fire({
      title: 'Save Case?',
      text: 'Are you sure you want to save this case?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, save case',
      cancelButtonText: 'Continue editing'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performSave();
      }
    });
  }

  private validateForm(): boolean {
    if (!this.caseForm.area || !this.caseForm.part || !this.caseForm.roleType) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields in the Case tab.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
      return false;
    }

    if (this.caseForm.investigateRegulatedParty) {
      if (!this.investigationForm.complainantName || !this.investigationForm.complainantEmail) {
        Swal.fire({
          title: 'Investigation Required',
          text: 'Since you selected to investigate the regulated party, please complete the Investigation tab.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
        return false;
      }
    }

    return true;
  }

  private performSave() {
    const caseData = {
      investigateParty: `${this.investigationForm.complainantName} ${this.investigationForm.complainantSurname}`.trim() || 'New Investigation',
      roleType: this.roleTypeOptions.find(opt => opt.value === this.caseForm.roleType)?.text,
      regulatedParty: this.regulatedPartyOptions.find(opt => opt.value === this.caseForm.regulatedParty)?.text,
      description: this.caseForm.area
    };

    this.caseDataService.addCase(caseData).subscribe(newCase => {
      this.caseSaved.emit(newCase);
    });
  }

  onFileUploaded(e: any) {
    if (e.value && e.value.length > 0) {
      Swal.fire({
        title: 'Files Uploaded',
        text: `${e.value.length} file(s) uploaded successfully.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  }
}