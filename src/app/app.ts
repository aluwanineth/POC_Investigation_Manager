import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';


// DevExtreme imports
import { 
  DxDataGridModule, 
  DxButtonModule, 
  DxPopupModule, 
  DxTabPanelModule,
  DxSelectBoxModule, 
  DxCheckBoxModule, 
  DxFileUploaderModule,
  DxTextBoxModule, 
  DxTextAreaModule,
  DxSchedulerModule
} from 'devextreme-angular';

import { CaseDataService } from './services/case-data.service';
import { CaseData, StageData, InvestigationData, DocumentData, CommentData } from './models/case.models';
import { MeetingSchedulerComponent } from './components/meeting/meeting.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxDataGridModule,
    DxButtonModule,
    DxPopupModule,
    DxTabPanelModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxFileUploaderModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxSchedulerModule,
    MeetingSchedulerComponent
  ],
  template: `
    <div class="case-management-container">
      <!-- Header -->
      <div class="app-header">
        <h1>{{ title }}</h1>
        <div class="header-actions">
          <span class="user-info">Welcome, Current User</span>
        </div>
      </div>

      <!-- Stages Header -->
      <div class="stages-container">
        <div class="stages-header">
          <h2>Case Management Process</h2>
          <p class="stages-subtitle" *ngIf="!selectedCase">Select a case to track its progress through each stage</p>
          <p class="stages-subtitle" *ngIf="selectedCase">
            Tracking progress for: <strong>{{ selectedCase.caseNo }}</strong> - 
            <span [innerHTML]="formatStatus({value: selectedCase.status})"></span>
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

      <!-- Main Content Area -->
      <div class="main-content">
        <!-- Left Panel -->
        <div class="left-panel">
          <div class="panel-card">
            <div class="panel-header">
              <h3>Case Management</h3>
            </div>
            
            <!-- Create Case Button -->
            <dx-button 
              text="Create Case" 
              type="success" 
              icon="plus"
              (onClick)="showCreateCasePopup()"
              class="create-case-btn">
            </dx-button>
            
            <!-- Search Box -->
            <div class="search-container">
              <dx-text-box
                placeholder="Search by case number or party name..."
                [(value)]="searchValue"
                (onValueChanged)="onSearchValueChanged($event)"
                class="search-input">
                <dxi-button 
                  name="search"
                  location="after"
                  options="{
                    icon: 'search',
                    type: 'default'
                  }">
                </dxi-button>
              </dx-text-box>
            </div>

            <!-- Cases Grid -->
            <div class="grid-container">
              <div class="grid-header">
                <h4>All Cases ({{ leftGridData.length }})</h4>
                <span class="grid-subtitle">Select a case to view details</span>
              </div>
              
              <dx-data-grid
                [dataSource]="leftGridData"
                [showBorders]="true"
                [rowAlternationEnabled]="true"
                [columnAutoWidth]="true"
                [allowColumnReordering]="true"
                [showRowLines]="true"
                [showColumnLines]="false"
                [selectedRowKeys]="selectedCase ? [selectedCase.id] : []"
                keyExpr="id"
                [selection]="{ mode: 'single' }"
                [hoverStateEnabled]="true"
                [focusedRowEnabled]="true"
                (onSelectionChanged)="onLeftGridSelectionChanged($event)"
                (onRowClick)="onRowClick($event)"
                class="cases-grid">
                
                <dxi-column dataField="caseNo" caption="Case No" [width]="130">
                  <div *dxTemplate="let data of 'cellTemplate'">
                    <span class="case-number clickable">{{ data.value }}</span>
                  </div>
                </dxi-column>
                
                <dxi-column dataField="investigateParty" caption="Investigate Party">
                  <div *dxTemplate="let data of 'cellTemplate'">
                    <span class="party-name clickable">{{ data.value }}</span>
                  </div>
                </dxi-column>
              </dx-data-grid>
            </div>
          </div>
        </div>

        <!-- Right Panel -->
        <div class="right-panel">
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
              <!-- Case Details Tab Panel -->
              <dx-tab-panel
                [dataSource]="caseDetailTabs"
                [selectedIndex]="0"
                [animationEnabled]="true"
                [swipeEnabled]="false"
                class="case-detail-tabs">
                
                <!-- Case Tab Template -->
                <div *dxTemplate="let tabData of 'caseDetailsTab'">
                  <div class="case-details-content">
                    <!-- Case Information Grid -->
                    <div class="case-info-grid">
                      <div class="case-info-row">
                        <div class="case-info-item">
                          <label>Investigated Party:</label>
                          <span class="value">{{ selectedCase.investigateParty }}</span>
                        </div>
                        <div class="case-info-item">
                          <label>Listing Type:</label>
                          <span class="value">{{ selectedCase.listingType || 'Standard Listing' }}</span>
                        </div>
                        <div class="case-info-item">
                          <label>Created By:</label>
                          <span class="value">{{ selectedCase.assignedTo || 'Current User' }}</span>
                        </div>
                      </div>
                      
                      <div class="case-info-row">
                        <div class="case-info-item">
                          <label>Role Type:</label>
                          <span class="value">{{ selectedCase.roleType }}</span>
                        </div>
                        <div class="case-info-item">
                          <label>Board:</label>
                          <span class="value">{{ selectedCase.board || 'Main Board' }}</span>
                        </div>
                        <div class="case-info-item">
                          <label>Allocated To:</label>
                          <span class="value">{{ selectedCase.assignedTo }}</span>
                        </div>
                      </div>
                      
                      <div class="case-info-row">
                        <div class="case-info-item">
                          <label>Issuer:</label>
                          <span class="value">{{ selectedCase.issuer }}</span>
                        </div>
                        <div class="case-info-item">
                          <label>Exchange:</label>
                          <span class="value">{{ selectedCase.exchange }}</span>
                        </div>
                        <div class="case-info-item">
                          <label>Second Reader:</label>
                          <span class="value">{{ selectedCase.secondReader }}</span>
                        </div>
                      </div>
                      
                      <div class="case-info-row">
                        <div class="case-info-item">
                          <label>Sponsor:</label>
                          <span class="value">{{ selectedCase.sponsor }}</span>
                        </div>
                        <div class="case-info-item">
                          <label>Status:</label>
                          <span class="value" [innerHTML]="formatStatus({value: selectedCase.status})"></span>
                        </div>
                        <div class="case-info-item">
                          <label>Created Date:</label>
                          <span class="value">{{ selectedCase.createdDate | date:'yyyy-MM-dd HH:mm' }}</span>
                        </div>
                      </div>
                      
                      <div class="case-info-row">
                        <div class="case-info-item">
                          <label>Contact/Officer/Sub:</label>
                          <span class="value">{{ selectedCase.contactOfficer }}</span>
                        </div>
                        <div class="case-info-item">
                          <label>Closed Date:</label>
                          <span class="value">{{ selectedCase.closedDate ? (selectedCase.closedDate | date:'yyyy-MM-dd HH:mm') : '' }}</span>
                        </div>
                        <div class="case-info-item">
                          <!-- Empty for layout -->
                        </div>
                      </div>
                      
                      <div class="case-info-row full-width">
                        <div class="case-info-item description">
                          <label>Description:</label>
                          <span class="value">{{ selectedCase.description }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Supporting Documents Section -->
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
                        [dataSource]="caseDocuments"
                        [showBorders]="true"
                        [rowAlternationEnabled]="true"
                        [columnAutoWidth]="true"
                        [showRowLines]="true"
                        [showColumnLines]="false"
                        class="documents-grid">
                        
                        <dxi-column dataField="name" caption="Name" [width]="200"></dxi-column>
                        <dxi-column dataField="documentType" caption="Document Type" [width]="150"></dxi-column>
                        <dxi-column dataField="documentNumber" caption="Document Number" [width]="150"></dxi-column>
                        <dxi-column dataField="uploadedBy" caption="Uploaded By" [width]="120"></dxi-column>
                        <dxi-column dataField="dateUploaded" caption="Date Uploaded" [width]="140" dataType="datetime" format="yyyy-MM-dd HH:mm"></dxi-column>
                        <dxi-column dataField="stage" caption="Stage" [width]="100"></dxi-column>
                        <dxi-column type="buttons" [width]="80">
                          <dxi-button icon="edit" (onClick)="editDocument($event)"></dxi-button>
                        </dxi-column>
                      </dx-data-grid>
                    </div>

                    <!-- Comments Section -->
                    <div class="comments-section">
                      <h4>Comments</h4>
                      
                      <!-- Add Comment Form -->
                      <div class="add-comment-form">
                        <div class="comment-input-row">
                          <div class="comment-field">
                            <label>Comment</label>
                            <dx-text-area
                              placeholder="Enter your comment..."
                              [(value)]="newComment"
                              [height]="80">
                            </dx-text-area>
                          </div>
                          <div class="stage-field">
                            <label>Stage</label>
                            <dx-select-box
                              [dataSource]="stageOptions"
                              displayExpr="text"
                              valueExpr="value"
                              placeholder="Please Select Stage"
                              [(value)]="selectedStageForComment">
                            </dx-select-box>
                          </div>
                          <div class="add-button-field">
                            <dx-button
                              text="Add"
                              type="default"
                              icon="plus"
                              (onClick)="addComment()"
                              class="add-comment-btn">
                            </dx-button>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Comments List -->
                      <div class="comments-list">
                        <div *ngIf="caseComments.length === 0" class="no-comments">
                          No comments have been captured yet
                        </div>
                        <div *ngFor="let comment of caseComments" class="comment-item">
                          <div class="comment-header">
                            <span class="comment-author">{{ comment.author }}</span>
                            <span class="comment-stage">{{ comment.stage }}</span>
                            <span class="comment-date">{{ comment.date | date:'yyyy-MM-dd HH:mm' }}</span>
                          </div>
                          <div class="comment-text">{{ comment.text }}</div>
                        </div>
                      </div>
                    </div>

                    <!-- Investigation Question -->
                    <div class="investigation-question">
                      <span>Investigate this Regulated Party?</span>
                    </div>
                  </div>
                </div>

                <!-- Investigation Tab Template -->
                <div *dxTemplate="let tabData of 'investigationDetailsTab'">
                  <div class="investigation-details-content">
                    <div *ngIf="selectedInvestigation" class="investigation-info">
                      <h4>Investigation Details</h4>
                      <dx-data-grid
                        [dataSource]="[selectedInvestigation]"
                        [showBorders]="true"
                        [rowAlternationEnabled]="true"
                        [columnAutoWidth]="true"
                        [showRowLines]="true"
                        class="investigation-grid">
                        
                        <dxi-column dataField="investigationType" caption="Investigation Type"></dxi-column>
                        <dxi-column dataField="eventType" caption="Event Type"></dxi-column>
                        <dxi-column dataField="status" caption="Status"></dxi-column>
                        <dxi-column dataField="createdDate" caption="Created Date" dataType="datetime" format="yyyy-MM-dd"></dxi-column>
                      </dx-data-grid>

                      <!-- Complainant Details -->
                      <div class="complainant-details">
                        <h4>Complainant Information</h4>
                        <div class="complainant-grid">
                          <div class="complainant-row">
                            <div class="complainant-item">
                              <label>Name:</label>
                              <span class="value">{{ selectedInvestigation.complainant.name }}</span>
                            </div>
                            <div class="complainant-item">
                              <label>Surname:</label>
                              <span class="value">{{ selectedInvestigation.complainant.surname }}</span>
                            </div>
                            <div class="complainant-item">
                              <label>Email:</label>
                              <span class="value">{{ selectedInvestigation.complainant.email }}</span>
                            </div>
                          </div>
                          <div class="complainant-row">
                            <div class="complainant-item">
                              <label>Contact Number:</label>
                              <span class="value">{{ selectedInvestigation.complainant.contactCode }} {{ selectedInvestigation.complainant.contactNumber }}</span>
                            </div>
                            <div class="complainant-item">
                              <label>Relationship Type:</label>
                              <span class="value">{{ selectedInvestigation.complainant.relationshipType }}</span>
                            </div>
                            <div class="complainant-item">
                              <label>Entity:</label>
                              <span class="value">{{ selectedInvestigation.complainant.entity }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div *ngIf="!selectedInvestigation" class="no-investigation">
                      <div class="no-investigation-icon">
                        <i class="dx-icon-search"></i>
                      </div>
                      <h4>No Investigation Data</h4>
                      <p>No investigation information available for this case</p>
                    </div>
                  </div>
                </div>

                <!-- Meeting Scheduler Tab Template -->
                <div *dxTemplate="let tabData of 'meetingsTab'">
                  <div class="meeting-scheduler-content">
                    <app-meeting-scheduler
                       [selectedCaseNo]="selectedCase?.caseNo || ''"
                       [selectedCaseId]="selectedCase?.id || ''">
                    </app-meeting-scheduler>
                  </div>
                </div>
              </dx-tab-panel>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Case Popup -->
      <dx-popup
        [(visible)]="createCasePopupVisible"
        [width]="900"
        [height]="700"
        title="Create New Case"
        [showCloseButton]="true"
        [dragEnabled]="true"
        [resizeEnabled]="true">
        
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

                <!-- Regulated Party -->
                <div class="form-card">
                  <div class="form-card-header">
                    <h4><i class="dx-icon-group"></i> Regulated Party</h4>
                  </div>
                  
                  <div class="form-grid">
                    <div class="form-row">
                      <label class="form-label">Part:</label>
                      <dx-select-box
                        [dataSource]="partOptions"
                        displayExpr="text"
                        valueExpr="value"
                        placeholder="Select Part..."
                        [(value)]="investigationForm.part"
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
                        [(value)]="investigationForm.roleType"
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
                        [(value)]="investigationForm.regulatedParty"
                        class="form-control">
                      </dx-select-box>
                    </div>
                  </div>
                </div>

                <!-- Investigation Type -->
                <div class="form-card">
                  <div class="form-card-header">
                    <h4><i class="dx-icon-event"></i> Investigation Type</h4>
                  </div>
                  
                  <div class="form-row-with-button">
                    <div class="form-field-group">
                      <label class="form-label">Event Type:</label>
                      <dx-select-box
                        [dataSource]="eventTypeOptions"
                        displayExpr="text"
                        valueExpr="value"
                        placeholder="Select Event Type..."
                        [(value)]="investigationForm.eventType"
                        class="form-control-flex">
                      </dx-select-box>
                    </div>
                    <dx-button
                      text="Add"
                      type="default"
                      icon="plus"
                      (onClick)="addEventType()"
                      class="add-btn">
                    </dx-button>
                  </div>
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
                      <label class="form-label">Relationship Type:</label>
                      <dx-select-box
                        [dataSource]="relationshipTypeOptions"
                        displayExpr="text"
                        valueExpr="value"
                        placeholder="Select Relationship Type..."
                        [(value)]="investigationForm.relationshipType"
                        class="form-control">
                      </dx-select-box>
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
                    
                    <div class="form-row-with-button">
                      <div class="form-field-group">
                        <label class="form-label">Entity:</label>
                        <dx-text-box
                          placeholder="Enter entity"
                          [(value)]="investigationForm.entity"
                          class="form-control-flex">
                        </dx-text-box>
                      </div>
                      <dx-button
                        text="Add"
                        type="default"
                        icon="plus"
                        (onClick)="addEntity()"
                        class="add-btn">
                      </dx-button>
                    </div>
                  </div>
                </div>

                <!-- Documents -->
                <div class="form-card">
                  <div class="form-card-header">
                    <h4><i class="dx-icon-attach"></i> Documents</h4>
                  </div>
                  <dx-file-uploader
                    [multiple]="true"
                    accept=".pdf,.doc,.docx,.jpg,.png,.xlsx"
                    uploadMode="useButtons"
                    [showFileList]="true"
                    (onValueChanged)="onInvestigationFileUploaded($event)"
                    class="file-uploader">
                  </dx-file-uploader>
                  <div class="upload-help">
                    <span>Add Supporting document(s)</span>
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
                (onClick)="closeCreateCasePopup()"
                class="action-btn cancel-btn">
              </dx-button>
              <dx-button
                text="Save Case"
                type="success"
                icon="save"
                (onClick)="saveCase()"
                class="action-btn save-btn">
              </dx-button>
            </div>
          </div>fv
        </div>
      </dx-popup>
    </div>
  `,
  styles: [`
    .case-management-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      padding: 0;
    }

    .app-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .app-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }

    .user-info {
      font-size: 14px;
      opacity: 0.9;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
    }

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

    .main-content {
      display: grid;
      grid-template-columns: 0.6fr 1.4fr;
      gap: 30px;
      padding: 0 30px 30px 30px;
      min-height: calc(100vh - 300px);
    }

    .left-panel, .right-panel {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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

    .create-case-btn {
      margin-bottom: 24px;
      width: 100%;
      height: 48px;
      border-radius: 12px;
      font-weight: 600;
    }

    .search-container {
      margin-bottom: 24px;
    }

    .grid-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .grid-header {
      margin-bottom: 16px;
    }

    .grid-header h4 {
      margin: 0 0 4px 0;
      color: #2d3748;
      font-weight: 600;
      font-size: 16px;
    }

    .grid-subtitle {
      color: #718096;
      font-size: 14px;
    }

    .cases-grid {
      flex: 1;
      border-radius: 12px;
      overflow: hidden;
    }

    .cases-grid ::ng-deep .dx-datagrid {
      border: none;
      border-radius: 12px;
    }

    .cases-grid ::ng-deep .dx-datagrid-headers {
      background: #f7fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    .cases-grid ::ng-deep .dx-header-row {
      font-weight: 600;
      color: #4a5568;
    }

    .cases-grid ::ng-deep .dx-row {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .cases-grid ::ng-deep .dx-row:hover {
      background-color: #f1f5f9 !important;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .cases-grid ::ng-deep .dx-row-alt {
      background-color: #f8f9fa;
    }

    .cases-grid ::ng-deep .dx-selection {
      background-color: rgba(102, 126, 234, 0.1) !important;
      border-left: 4px solid #667eea;
    }

    .cases-grid ::ng-deep .dx-selection:hover {
      background-color: rgba(102, 126, 234, 0.15) !important;
    }

    .cases-grid ::ng-deep .dx-focused {
      background-color: rgba(102, 126, 234, 0.05) !important;
    }

    .clickable {
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .clickable:hover {
      color: #667eea;
      font-weight: 500;
    }

    .case-number {
      font-weight: 600;
      color: #667eea;
      font-family: 'Monaco', monospace;
    }

    .party-name {
      font-weight: 500;
      color: #2d3748;
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
    }

    .case-detail-tabs {
      height: 100%;
    }

    .case-details-content {
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

    .comments-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #e9ecef;
    }

    .comments-section h4 {
      margin: 0 0 16px 0;
      color: #2d3748;
      font-weight: 600;
      font-size: 16px;
    }

    .add-comment-form {
      margin-bottom: 20px;
    }

    .comment-input-row {
      display: grid;
      grid-template-columns: 2fr 1fr auto;
      gap: 16px;
      align-items: end;
    }

    .comment-field, .stage-field, .add-button-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .comment-field label, .stage-field label {
      font-weight: 500;
      color: #4a5568;
      font-size: 14px;
    }

    .add-comment-btn {
      height: 48px;
      min-width: 80px;
      border-radius: 8px;
    }

    .comments-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .no-comments {
      color: #718096;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }

    .comment-item {
      background: white;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      border: 1px solid #e2e8f0;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
    }

    .comment-author {
      font-weight: 600;
      color: #2d3748;
    }

    .comment-stage {
      background: #667eea;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }

    .comment-date {
      color: #718096;
    }

    .comment-text {
      color: #4a5568;
      font-size: 14px;
      line-height: 1.4;
    }

    .investigation-question {
      background: #e6fffa;
      border: 1px solid #81e6d9;
      border-radius: 8px;
      padding: 12px 16px;
      color: #234e52;
      font-weight: 500;
    }

    .investigation-details-content {
      padding: 20px;
    }

    .investigation-info h4 {
      margin: 0 0 16px 0;
      color: #2d3748;
      font-weight: 600;
      font-size: 16px;
    }

    .investigation-grid {
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
    }

    .complainant-details {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid #e9ecef;
    }

    .complainant-details h4 {
      margin: 0 0 16px 0;
      color: #2d3748;
      font-weight: 600;
      font-size: 16px;
    }

    .complainant-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .complainant-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
    }

    .complainant-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .complainant-item label {
      font-weight: 600;
      color: #4a5568;
      font-size: 14px;
    }

    .complainant-item .value {
      color: #2d3748;
      font-size: 14px;
    }

    .no-investigation {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      text-align: center;
      color: #a0aec0;
    }

    .no-investigation-icon {
      font-size: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .no-investigation h4 {
      margin: 0 0 8px 0;
      color: #718096;
      font-weight: 600;
    }

    .no-investigation p {
      margin: 0;
      font-size: 14px;
    }

    /* Form styles remain the same */
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

    .form-row-with-button {
      display: flex;
      gap: 12px;
      align-items: flex-end;
      margin-bottom: 16px;
    }

    .form-field-group {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .add-btn {
      flex-shrink: 0;
      height: 48px;
      min-width: 80px;
      border-radius: 8px;
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

    @media (max-width: 768px) {
      .main-content {
        grid-template-columns: 1fr;
        gap: 20px;
      }
      
      .stages-track {
        flex-wrap: wrap;
        gap: 20px;
        justify-content: center;
      }
      
      .stage-connector {
        display: none;
      }

      .case-info-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .complainant-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .comment-input-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  `]
})
export class App implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  title = 'Case Management System';
  createCasePopupVisible = false;
  searchValue = '';
  selectedCase: CaseData | null = null;
  selectedInvestigation: InvestigationData | null = null;
  
  // Form data
  caseForm: any = {
    area: '',
    part: null,
    roleType: null,
    regulatedParty: null,
    investigateRegulatedParty: false
  };

  investigationForm: any = {
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

  // Data
  allCases: CaseData[] = [];
  leftGridData: CaseData[] = [];
  rightGridData: CaseData[] = [];

  // Updated stages data with new status values
  stages: StageData[] = [
    { id: 1, name: 'New', isActive: false, isCompleted: false, description: 'Case creation and initial setup' },
    { id: 2, name: 'Enquiry', isActive: false, isCompleted: false, description: 'Initial investigation and enquiry' },
    { id: 3, name: 'Allegations', isActive: false, isCompleted: false, description: 'Formal allegations assessment' },
    { id: 4, name: 'Objection', isActive: false, isCompleted: false, description: 'Objection review and response' },
    { id: 5, name: 'Sanction', isActive: false, isCompleted: false, description: 'Final sanction determination' }
  ];

  // Tab panel configuration for Create Case popup
  tabPanelItems = [
    { title: 'Case', template: 'caseTab' },
    { title: 'Investigation', template: 'investigationTab' }
  ];

  // Tab panel configuration for Case Details
caseDetailTabs = [
    { title: 'Case', template: 'caseDetailsTab' },
    { title: 'Investigation', template: 'investigationDetailsTab' },
    { title: 'Meetings', template: 'meetingsTab' }
  ];

  // Data for case details
  caseDocuments: DocumentData[] = [];
  caseComments: CommentData[] = [];
  newComment: string = '';
  selectedStageForComment: string = '';

  // Stage options for comments with updated values
  stageOptions = [
    { value: 'new', text: 'New' },
    { value: 'enquiry', text: 'Enquiry' },
    { value: 'allegations', text: 'Allegations' },
    { value: 'objection', text: 'Objection' },
    { value: 'sanction', text: 'Sanction' }
  ];

  // Dropdown options
  partOptions: any[] = [];
  roleTypeOptions: any[] = [];
  regulatedPartyOptions: any[] = [];
  eventTypeOptions: any[] = [];
  relationshipTypeOptions: any[] = [];

   meetingData: any[] = [];
  selectedMeeting: any = null;
  editMeetingPopupVisible = false;
  currentDate: Date = new Date();
  
  // Meeting form data
  meetingForm: any = {
    id: null,
    text: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 3600000), // 1 hour later
    description: '',
    location: '',
    attendees: '',
    meetingType: 'case_review',
    priority: 'medium',
    allDay: false,
    recurrenceRule: ''
  };

  // Meeting type options
  meetingTypeOptions = [
    { value: 'case_review', text: 'Case Review' },
    { value: 'investigation', text: 'Investigation Meeting' },
    { value: 'client_meeting', text: 'Client Meeting' },
    { value: 'team_meeting', text: 'Team Meeting' },
    { value: 'hearing', text: 'Hearing' },
    { value: 'consultation', text: 'Consultation' }
  ];

  // Priority options
  meetingPriorityOptions = [
    { value: 'low', text: 'Low' },
    { value: 'medium', text: 'Medium' },
    { value: 'high', text: 'High' },
    { value: 'urgent', text: 'Urgent' }
  ];


  constructor(private caseDataService: CaseDataService) {}

  ngOnInit() {
    this.loadData();
    this.loadDropdownOptions();
    
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData() {
    this.caseDataService.cases$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cases => {
        this.allCases = cases;
        this.leftGridData = [...cases];
      });
  }

  private loadDropdownOptions() {
    this.partOptions = this.caseDataService.getPartOptions();
    this.roleTypeOptions = this.caseDataService.getRoleTypeOptions();
    this.regulatedPartyOptions = this.caseDataService.getRegulatedPartyOptions();
    this.eventTypeOptions = this.caseDataService.getEventTypeOptions();
    this.relationshipTypeOptions = this.caseDataService.getRelationshipTypeOptions();
    this.stageOptions = this.caseDataService.getStageOptions();
  }

  showCreateCasePopup() {
    this.createCasePopupVisible = true;
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

  closeCreateCasePopup() {
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
        this.createCasePopupVisible = false;
        this.resetForms();
      }
    });
  }

  resetForms() {
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

  onSearchValueChanged(e: any) {
    const searchTerm = e.value?.toLowerCase() || '';
    
    if (searchTerm) {
      this.leftGridData = this.allCases.filter(case_ =>
        case_.caseNo.toLowerCase().includes(searchTerm) ||
        case_.investigateParty.toLowerCase().includes(searchTerm)
      );
    } else {
      this.leftGridData = [...this.allCases];
    }
  }

  onLeftGridSelectionChanged(e: any) {
    const selectedData = e.selectedRowsData[0];
    if (selectedData) {
      this.selectedCase = selectedData;
      this.rightGridData = [selectedData];
      this.updateStagesForCase(selectedData);
      this.loadCaseInvestigation(selectedData.id);
      
      Swal.fire({
        title: 'Case Selected',
        text: `Selected case: ${selectedData.caseNo}`,
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  }

  onRowClick(e: any) {
    const clickedCase = e.data;
    if (clickedCase) {
      this.selectedCase = clickedCase;
      this.rightGridData = [clickedCase];
      this.updateStagesForCase(clickedCase);
      this.loadCaseInvestigation(clickedCase.id);
      
      Swal.fire({
        title: 'Case Selected',
        text: `Viewing details for: ${clickedCase.caseNo}`,
        icon: 'info',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  }

  // Update stages based on the selected case status
  updateStagesForCase(caseData: CaseData) {
    // Reset all stages first
    this.stages = this.stages.map(stage => ({
      ...stage,
      isActive: false,
      isCompleted: false
    }));

    // Define the stage order and mapping for new status values
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
        // Previous stages are completed
        return { ...stage, isCompleted: true, isActive: false };
      } else if (stageNumber === currentStageIndex) {
        // Current stage is active
        return { ...stage, isCompleted: false, isActive: true };
      } else {
        // Future stages are inactive
        return { ...stage, isCompleted: false, isActive: false };
      }
    });

    // Load case-specific documents and comments
    this.loadCaseDocuments(caseData.id);
    this.loadCaseComments(caseData.id);
  }

  private loadCaseInvestigation(caseId: string) {
    const investigations = this.caseDataService.getInvestigationsByCaseId(caseId);
    this.selectedInvestigation = investigations.length > 0 ? investigations[0] : null;
  }

  onFileUploaded(e: any) {
    if (e.value && e.value.length > 0) {
      Swal.fire({
        title: 'Files Uploaded',
        text: `${e.value.length} file(s) uploaded successfully for case documentation.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  }

  onInvestigationFileUploaded(e: any) {
    if (e.value && e.value.length > 0) {
      Swal.fire({
        title: 'Investigation Files Uploaded',
        text: `${e.value.length} file(s) uploaded successfully for investigation.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    }
  }

  addEventType() {
    if (this.investigationForm.eventType) {
      const eventTypeText = this.eventTypeOptions.find(opt => opt.value === this.investigationForm.eventType)?.text || '';
      Swal.fire({
        title: 'Event Type Added',
        text: `Event type "${eventTypeText}" has been added to the investigation.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } else {
      Swal.fire({
        title: 'No Event Type Selected',
        text: 'Please select an event type before adding.',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
    }
  }

  addEntity() {
    if (this.investigationForm.entity && this.investigationForm.entity.trim()) {
      Swal.fire({
        title: 'Entity Added',
        text: `Entity "${this.investigationForm.entity}" has been added to the investigation.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      this.investigationForm.entity = ''; // Clear the field
    } else {
      Swal.fire({
        title: 'No Entity Specified',
        text: 'Please enter an entity name before adding.',
        icon: 'warning',
        confirmButtonColor: '#ffc107'
      });
    }
  }

  saveCase() {
    // Validation
    if (!this.caseForm.area || !this.caseForm.part || !this.caseForm.roleType) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill in all required fields in the Case tab.',
        icon: 'error',
        confirmButtonColor: '#dc3545'
      });
      return;
    }

    if (this.caseForm.investigateRegulatedParty) {
      if (!this.investigationForm.complainantName || !this.investigationForm.complainantEmail) {
        Swal.fire({
          title: 'Investigation Required',
          text: 'Since you selected to investigate the regulated party, please complete the Investigation tab.',
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
        return;
      }
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
        this.performSaveCase();
      }
    });
  }

  private performSaveCase() {
    const caseData = {
      investigateParty: `${this.investigationForm.complainantName} ${this.investigationForm.complainantSurname}`.trim() || 'New Investigation',
      roleType: this.roleTypeOptions.find(opt => opt.value === this.caseForm.roleType)?.text,
      regulatedParty: this.regulatedPartyOptions.find(opt => opt.value === this.caseForm.regulatedParty)?.text,
      description: this.caseForm.area
    };

    this.caseDataService.addCase(caseData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(newCase => {
        // Update stages
        this.stages[0].isCompleted = true;
        this.stages[1].isActive = true;

        this.createCasePopupVisible = false;
        this.resetForms();

        // Success notification
        Swal.fire({
          title: 'Case Created Successfully!',
          text: `Case ${newCase.caseNo} has been created and assigned.`,
          icon: 'success',
          confirmButtonColor: '#28a745',
          timer: 3000,
          timerProgressBar: true
        });
      });
  }

  // Helper methods for case details
  loadCaseDocuments(caseId: string) {
    // Simulate loading documents for the case
    this.caseDocuments = [
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
  }

  loadCaseComments(caseId: string) {
    // Simulate loading comments for the case
    this.caseComments = [];
  }

  addSupportingDocument() {
    Swal.fire({
      title: 'Add Supporting Document',
      text: 'Document upload functionality would be implemented here',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  editDocument(e: any) {
    Swal.fire({
      title: 'Edit Document',
      text: `Edit document: ${e.row.data.fileName}`,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  addComment() {
    if (this.newComment.trim() && this.selectedStageForComment) {
      const newCommentObj: CommentData = {
        id: Date.now().toString(),
        text: this.newComment,
        author: 'Current User',
        date: new Date(),
        stage: this.stageOptions.find(s => s.value === this.selectedStageForComment)?.text || this.selectedStageForComment
      };
      
      this.caseComments.unshift(newCommentObj);
      this.newComment = '';
      this.selectedStageForComment = '';
      
      Swal.fire({
        title: 'Comment Added',
        text: 'Your comment has been added successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
    } else {
      Swal.fire({
        title: 'Missing Information',
        text: 'Please enter a comment and select a stage',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }

  // Formatting methods for status display with updated status values
  formatStatus(data: any) {
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
    
    const color = statusColors[data.value] || '#000';
    const label = statusLabels[data.value] || data.value.replace('_', ' ').toUpperCase();
    
    return `<span style="color: ${color}; font-weight: 500; padding: 4px 8px; background: ${color}15; border-radius: 4px;">
              ${label}
            </span>`;
  }
}