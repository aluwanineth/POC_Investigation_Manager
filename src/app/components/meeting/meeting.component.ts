import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

// DevExtreme imports
import { 
  DxSchedulerModule,
  DxButtonModule, 
  DxPopupModule,
  DxTextBoxModule, 
  DxTextAreaModule,
  DxSelectBoxModule,
  DxDateBoxModule,
  DxCheckBoxModule,
  DxDataGridModule
} from 'devextreme-angular';

interface Meeting {
  id: string;
  text: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  location?: string;
  attendees?: string[];
  meetingType: string;
  priority: string;
  caseId?: string;
  createdBy: string;
  createdDate: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-meeting-scheduler',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxSchedulerModule,
    DxButtonModule,
    DxPopupModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxCheckBoxModule,
    DxDataGridModule
  ],
  template: `
    <div class="meeting-scheduler-container">
      <!-- Meeting Scheduler Header -->
      <div class="scheduler-header">
        <div class="header-left">
          <h3>Case Meetings & Schedule</h3>
          <p class="header-subtitle" *ngIf="selectedCaseNo">
            Managing meetings for case: <strong>{{ selectedCaseNo }}</strong>
          </p>
        </div>
        <div class="header-actions">
          <dx-button
            text="New Meeting"
            type="success"
            icon="plus"
            (onClick)="showCreateMeetingPopup()"
            class="new-meeting-btn">
          </dx-button>
          <dx-button
            text="Meeting History"
            type="default"
            icon="clock"
            (onClick)="showMeetingHistory()"
            class="history-btn">
          </dx-button>
        </div>
      </div>

      <!-- Meeting Statistics Cards -->
      <div class="meeting-stats">
        <div class="stat-card">
          <div class="stat-icon scheduled">
            <i class="dx-icon-event"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getScheduledMeetingsCount() }}</div>
            <div class="stat-label">Scheduled</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon completed">
            <i class="dx-icon-check"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getCompletedMeetingsCount() }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon upcoming">
            <i class="dx-icon-clock"></i>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getUpcomingMeetingsCount() }}</div>
            <div class="stat-label">This Week</div>
          </div>
        </div>
      </div>

      <!-- Scheduler Component -->
      <div class="scheduler-container">
        <dx-scheduler
          [dataSource]="meetings"
          [views]="schedulerViews"
          [currentView]="currentView"
          [currentDate]="currentDate"
          [startDayHour]="8"
          [endDayHour]="18"
          [showAllDayPanel]="false"
          [height]="600"
          (onAppointmentAdding)="onAppointmentAdding($event)"
          (onAppointmentUpdating)="onAppointmentUpdating($event)"
          (onAppointmentDeleting)="onAppointmentDeleting($event)"
          (onAppointmentClick)="onAppointmentClick($event)"
          (onAppointmentDblClick)="onAppointmentDblClick($event)"
          class="case-scheduler">
          
          <dxi-view type="day" name="Day"></dxi-view>
          <dxi-view type="week" name="Week"></dxi-view>
          <dxi-view type="month" name="Month"></dxi-view>
          <dxi-view type="agenda" name="Agenda" [maxAppointmentsPerCell]="2"></dxi-view>
        </dx-scheduler>
      </div>

      <!-- Create/Edit Meeting Popup -->
      <dx-popup
        [(visible)]="meetingPopupVisible"
        [width]="700"
        [height]="650"
        [title]="isEditMode ? 'Edit Meeting' : 'Schedule New Meeting'"
        [showCloseButton]="true"
        [dragEnabled]="true"
        [resizeEnabled]="true">
        
        <div *dxTemplate="let data of 'content'">
          <div class="meeting-form">
            <!-- Meeting Title -->
            <div class="form-group">
              <label class="form-label required">Meeting Title</label>
              <dx-text-box
                placeholder="Enter meeting title..."
                [(value)]="meetingForm.text"
                class="form-control">
              </dx-text-box>
            </div>

            <!-- Date and Time Row -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Start Date & Time</label>
                <dx-date-box
                  type="datetime"
                  [(value)]="meetingForm.startDate"
                  [showClearButton]="false"
                  class="form-control">
                </dx-date-box>
              </div>
              <div class="form-group">
                <label class="form-label required">End Date & Time</label>
                <dx-date-box
                  type="datetime"
                  [(value)]="meetingForm.endDate"
                  [showClearButton]="false"
                  class="form-control">
                </dx-date-box>
              </div>
            </div>

            <!-- Meeting Type and Priority -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Meeting Type</label>
                <dx-select-box
                  [dataSource]="meetingTypes"
                  displayExpr="text"
                  valueExpr="value"
                  placeholder="Select meeting type..."
                  [(value)]="meetingForm.meetingType"
                  class="form-control">
                </dx-select-box>
              </div>
              <div class="form-group">
                <label class="form-label">Priority</label>
                <dx-select-box
                  [dataSource]="priorityOptions"
                  displayExpr="text"
                  valueExpr="value"
                  placeholder="Select priority..."
                  [(value)]="meetingForm.priority"
                  class="form-control">
                </dx-select-box>
              </div>
            </div>

            <!-- Location -->
            <div class="form-group">
              <label class="form-label">Location</label>
              <dx-text-box
                placeholder="Enter meeting location or virtual link..."
                [(value)]="meetingForm.location"
                class="form-control">
              </dx-text-box>
            </div>

            <!-- Description -->
            <div class="form-group">
              <label class="form-label">Meeting Description</label>
              <dx-text-area
                placeholder="Enter meeting agenda, discussion points, etc..."
                [(value)]="meetingForm.description"
                [height]="100"
                class="form-control">
              </dx-text-area>
            </div>

            <!-- Attendees Section -->
            <div class="attendees-section">
              <div class="section-header">
                <label class="form-label">Meeting Attendees</label>
                <dx-button
                  text="Add Attendee"
                  type="default"
                  icon="plus"
                  (onClick)="showAddAttendeePopup()"
                  class="add-attendee-btn">
                </dx-button>
              </div>
              
              <div class="attendees-list" *ngIf="selectedAttendees.length > 0">
                <div *ngFor="let attendee of selectedAttendees; let i = index" class="attendee-item">
                  <div class="attendee-info">
                    <div class="attendee-name">{{ attendee.name }}</div>
                    <div class="attendee-role">{{ attendee.role }} - {{ attendee.email }}</div>
                  </div>
                  <dx-button
                    icon="remove"
                    type="default"
                    (onClick)="removeAttendee(i)"
                    class="remove-attendee-btn">
                  </dx-button>
                </div>
              </div>
              
              <div *ngIf="selectedAttendees.length === 0" class="no-attendees">
                No attendees added yet. Click "Add Attendee" to invite participants.
              </div>
            </div>

            <!-- Additional Options -->
            <div class="additional-options">
              <dx-check-box
                text="Send calendar invitations to attendees"
                [(value)]="meetingForm.sendInvitations"
                class="option-checkbox">
              </dx-check-box>
              <dx-check-box
                text="Set reminder notifications"
                [(value)]="meetingForm.setReminders"
                class="option-checkbox">
              </dx-check-box>
            </div>
          </div>

          <!-- Meeting Form Actions -->
          <div class="meeting-form-actions">
            <dx-button
              text="Cancel"
              type="normal"
              icon="close"
              (onClick)="closeMeetingPopup()"
              class="action-btn cancel-btn">
            </dx-button>
            <dx-button
              [text]="isEditMode ? 'Update Meeting' : 'Schedule Meeting'"
              type="success"
              icon="save"
              (onClick)="saveMeeting()"
              class="action-btn save-btn">
            </dx-button>
          </div>
        </div>
      </dx-popup>

      <!-- Add Attendee Popup -->
      <dx-popup
        [(visible)]="attendeePopupVisible"
        [width]="500"
        [height]="400"
        title="Add Meeting Attendee"
        [showCloseButton]="true"
        [dragEnabled]="true">
        
        <div *dxTemplate="let data of 'content'">
          <div class="attendee-form">
            <div class="form-group">
              <label class="form-label required">Name</label>
              <dx-text-box
                placeholder="Enter attendee name..."
                [(value)]="attendeeForm.name"
                class="form-control">
              </dx-text-box>
            </div>

            <div class="form-group">
              <label class="form-label required">Email</label>
              <dx-text-box
                placeholder="Enter email address..."
                [(value)]="attendeeForm.email"
                class="form-control">
              </dx-text-box>
            </div>

            <div class="form-group">
              <label class="form-label">Role</label>
              <dx-select-box
                [dataSource]="attendeeRoles"
                displayExpr="text"
                valueExpr="value"
                placeholder="Select role..."
                [(value)]="attendeeForm.role"
                class="form-control">
              </dx-select-box>
            </div>

            <div class="attendee-form-actions">
              <dx-button
                text="Cancel"
                type="normal"
                (onClick)="closeAttendeePopup()"
                class="action-btn">
              </dx-button>
              <dx-button
                text="Add Attendee"
                type="success"
                (onClick)="addAttendee()"
                class="action-btn">
              </dx-button>
            </div>
          </div>
        </div>
      </dx-popup>

      <!-- Meeting History Popup -->
      <dx-popup
        [(visible)]="historyPopupVisible"
        [width]="900"
        [height]="600"
        title="Meeting History"
        [showCloseButton]="true"
        [dragEnabled]="true"
        [resizeEnabled]="true">
        
        <div *dxTemplate="let data of 'content'">
          <dx-data-grid
            [dataSource]="meetingHistory"
            [showBorders]="true"
            [rowAlternationEnabled]="true"
            [columnAutoWidth]="true"
            [showRowLines]="true"
            [allowColumnReordering]="true"
          
            class="history-grid">
            
            <dxi-column dataField="text" caption="Meeting Title" [width]="200"></dxi-column>
            <dxi-column dataField="meetingType" caption="Type" [width]="120">
              <div *dxTemplate="let data of 'cellTemplate'">
                <span class="meeting-type-badge" [ngClass]="'type-' + data.value">
                  {{ getMeetingTypeLabel(data.value) }}
                </span>
              </div>
            </dxi-column>
            <dxi-column dataField="startDate" caption="Date & Time" [width]="160" dataType="datetime" format="MM/dd/yyyy HH:mm"></dxi-column>
            <dxi-column dataField="status" caption="Status" [width]="100">
              <div *dxTemplate="let data of 'cellTemplate'">
                <span class="status-badge" [ngClass]="'status-' + data.value">
                  {{ getStatusLabel(data.value) }}
                </span>
              </div>
            </dxi-column>
            <dxi-column dataField="location" caption="Location" [width]="150"></dxi-column>
            <dxi-column dataField="attendees" caption="Attendees" [width]="80" [calculateCellValue]="getAttendeesCount"></dxi-column>
            <dxi-column type="buttons" [width]="100">
              <dxi-button icon="edit" [visible]="canEditMeeting" (onClick)="editMeetingFromHistory($event)"></dxi-button>
              <dxi-button icon="remove" [visible]="canDeleteMeeting" (onClick)="deleteMeetingFromHistory($event)"></dxi-button>
            </dxi-column>
          </dx-data-grid>
        </div>
      </dx-popup>
    </div>
  `,
  styles: [`
    .meeting-scheduler-container {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100%;
    }

    .scheduler-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-left h3 {
      margin: 0 0 4px 0;
      color: #2d3748;
      font-weight: 700;
      font-size: 20px;
    }

    .header-subtitle {
      margin: 0;
      color: #718096;
      font-size: 14px;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .new-meeting-btn, .history-btn {
      height: 40px;
      border-radius: 8px;
      font-weight: 500;
    }

    .meeting-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
    }

    .stat-icon.scheduled {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .stat-icon.completed {
      background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    }

    .stat-icon.upcoming {
      background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #718096;
      font-weight: 500;
    }

    .scheduler-container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .case-scheduler ::ng-deep .dx-scheduler {
      border: none;
      border-radius: 8px;
    }

    .case-scheduler ::ng-deep .dx-scheduler-header {
      background: #f7fafc;
      border-bottom: 2px solid #e2e8f0;
    }

    .case-scheduler ::ng-deep .dx-scheduler-appointment {
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .meeting-form {
      padding: 24px;
      max-height: 500px;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-weight: 600;
      color: #4a5568;
      font-size: 14px;
      margin-bottom: 6px;
    }

    .form-label.required::after {
      content: " *";
      color: #e53e3e;
      font-weight: 700;
    }

    .attendees-section {
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      background: #f7fafc;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .add-attendee-btn {
      height: 32px;
      border-radius: 6px;
    }

    .attendees-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .attendee-item {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .attendee-info {
      flex: 1;
    }

    .attendee-name {
      font-weight: 600;
      color: #2d3748;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .attendee-role {
      font-size: 12px;
      color: #718096;
    }

    .remove-attendee-btn {
      height: 28px;
      width: 28px;
      border-radius: 4px;
    }

    .no-attendees {
      color: #718096;
      font-style: italic;
      text-align: center;
      padding: 20px;
    }

    .additional-options {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      margin-top: 20px;
    }

    .option-checkbox {
      margin-bottom: 8px;
    }

    .meeting-form-actions, .attendee-form-actions {
      padding: 20px 24px;
      border-top: 2px solid #e9ecef;
      background: #f8f9fa;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .action-btn {
      min-width: 120px;
      height: 40px;
      border-radius: 8px;
      font-weight: 600;
    }

    .attendee-form {
      padding: 24px;
    }

    .history-grid {
      border-radius: 8px;
      overflow: hidden;
    }

    .meeting-type-badge, .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .type-investigation {
      background: #e6fffa;
      color: #234e52;
    }

    .type-review {
      background: #fef5e7;
      color: #744210;
    }

    .type-hearing {
      background: #fed7d7;
      color: #742a2a;
    }

    .type-consultation {
      background: #e9d8fd;
      color: #553c9a;
    }

    .status-scheduled {
      background: #e6fffa;
      color: #234e52;
    }

    .status-completed {
      background: #d4edda;
      color: #155724;
    }

    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }

    .status-rescheduled {
      background: #fff3cd;
      color: #856404;
    }

    @media (max-width: 768px) {
      .scheduler-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: stretch;
      }

      .new-meeting-btn, .history-btn {
        flex: 1;
      }

      .meeting-stats {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MeetingSchedulerComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() selectedCaseNo: string = '';
  @Input() selectedCaseId: string = '';

  // Popup visibility flags
  meetingPopupVisible = false;
  attendeePopupVisible = false;
  historyPopupVisible = false;
  isEditMode = false;
  editingMeetingId: string = '';

  // Scheduler configuration
  currentView = 'week';
  currentDate = new Date();
  schedulerViews = ['day', 'week', 'month', 'agenda'];

  // Meeting data
  meetings: Meeting[] = [];
  meetingHistory: Meeting[] = [];

  // Form data
  meetingForm: any = {
    text: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    description: '',
    location: '',
    meetingType: '',
    priority: 'medium',
    sendInvitations: true,
    setReminders: true
  };

  attendeeForm: any = {
    name: '',
    email: '',
    role: ''
  };

  selectedAttendees: Attendee[] = [];

  // Dropdown options
  meetingTypes = [
    { value: 'investigation', text: 'Investigation Meeting' },
    { value: 'review', text: 'Case Review' },
    { value: 'hearing', text: 'Formal Hearing' },
    { value: 'consultation', text: 'Stakeholder Consultation' },
    { value: 'planning', text: 'Planning Session' },
    { value: 'followup', text: 'Follow-up Meeting' },
    { value: 'presentation', text: 'Presentation' },
    { value: 'other', text: 'Other' }
  ];

  priorityOptions = [
    { value: 'low', text: 'Low' },
    { value: 'medium', text: 'Medium' },
    { value: 'high', text: 'High' },
    { value: 'urgent', text: 'Urgent' }
  ];

  attendeeRoles = [
    { value: 'investigator', text: 'Lead Investigator' },
    { value: 'analyst', text: 'Case Analyst' },
    { value: 'manager', text: 'Case Manager' },
    { value: 'legal', text: 'Legal Counsel' },
    { value: 'compliance', text: 'Compliance Officer' },
    { value: 'external', text: 'External Party' },
    { value: 'witness', text: 'Witness' },
    { value: 'stakeholder', text: 'Stakeholder' },
    { value: 'other', text: 'Other' }
  ];

  constructor() {}

  ngOnInit() {
    this.loadMeetings();
    this.loadMeetingHistory();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMeetings() {
    // Simulate loading meetings for the case
    this.meetings = [
      {
        id: '1',
        text: 'Initial Investigation Review',
        startDate: new Date(2025, 7, 20, 10, 0), // August 20, 2025, 10:00 AM
        endDate: new Date(2025, 7, 20, 11, 30),   // August 20, 2025, 11:30 AM
        description: 'Review initial findings and plan next steps',
        location: 'Conference Room A',
        meetingType: 'investigation',
        priority: 'high',
        caseId: this.selectedCaseId,
        createdBy: 'Current User',
        createdDate: new Date(),
        status: 'scheduled',
        attendees: ['sarah.johnson@company.com', 'michael.chen@company.com']
      },
      {
        id: '2',
        text: 'Stakeholder Consultation',
        startDate: new Date(2025, 7, 22, 14, 0), // August 22, 2025, 2:00 PM
        endDate: new Date(2025, 7, 22, 15, 30),  // August 22, 2025, 3:30 PM
        description: 'Consultation with external stakeholders regarding case findings',
        location: 'Virtual Meeting - Teams',
        meetingType: 'consultation',
        priority: 'medium',
        caseId: this.selectedCaseId,
        createdBy: 'Current User',
        createdDate: new Date(),
        status: 'scheduled',
        attendees: ['external.party@client.com', 'legal.counsel@company.com']
      }
    ];
  }

  private loadMeetingHistory() {
    // Load historical meetings
    this.meetingHistory = [
      ...this.meetings,
      {
        id: '3',
        text: 'Case Planning Session',
        startDate: new Date(2025, 7, 15, 9, 0),
        endDate: new Date(2025, 7, 15, 10, 0),
        description: 'Initial case planning and resource allocation',
        location: 'Conference Room B',
        meetingType: 'planning',
        priority: 'high',
        caseId: this.selectedCaseId,
        createdBy: 'Current User',
        createdDate: new Date(2025, 7, 14),
        status: 'completed',
        attendees: ['team.lead@company.com', 'project.manager@company.com']
      }
    ];
  }

  // Statistics methods
  getScheduledMeetingsCount(): number {
    return this.meetings.filter(m => m.status === 'scheduled').length;
  }

  getCompletedMeetingsCount(): number {
    return this.meetingHistory.filter(m => m.status === 'completed').length;
  }

  getUpcomingMeetingsCount(): number {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return this.meetings.filter(m => 
      m.status === 'scheduled' && 
      m.startDate <= nextWeek
    ).length;
  }

  // Popup management
  showCreateMeetingPopup() {
    this.isEditMode = false;
    this.resetMeetingForm();
    this.selectedAttendees = [];
    this.meetingPopupVisible = true;

    Swal.fire({
      title: 'Schedule New Meeting',
      text: 'Fill in the meeting details to schedule a new meeting.',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  closeMeetingPopup() {
    this.meetingPopupVisible = false;
    this.resetMeetingForm();
    this.selectedAttendees = [];
  }

  showMeetingHistory() {
    this.historyPopupVisible = true;
  }

  // Add these missing methods to your MeetingSchedulerComponent class:

// Attendee management methods
showAddAttendeePopup() {
  this.resetAttendeeForm();
  this.attendeePopupVisible = true;
}

closeAttendeePopup() {
  this.attendeePopupVisible = false;
  this.resetAttendeeForm();
}

addAttendee() {
  if (!this.attendeeForm.name || !this.attendeeForm.email) {
    Swal.fire({
      title: 'Validation Error',
      text: 'Please fill in required fields (Name and Email)',
      icon: 'error',
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    return;
  }

  const newAttendee: Attendee = {
    id: this.generateId(),
    name: this.attendeeForm.name,
    email: this.attendeeForm.email,
    role: this.attendeeForm.role || 'other'
  };

  this.selectedAttendees.push(newAttendee);
  this.closeAttendeePopup();

  Swal.fire({
    title: 'Attendee Added',
    text: `${newAttendee.name} has been added to the meeting`,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
}

removeAttendee(index: number) {
  if (index >= 0 && index < this.selectedAttendees.length) {
    const removedAttendee = this.selectedAttendees.splice(index, 1)[0];
    
    Swal.fire({
      title: 'Attendee Removed',
      text: `${removedAttendee.name} has been removed from the meeting`,
      icon: 'info',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }
}

// Meeting form management
resetMeetingForm() {
  this.meetingForm = {
    text: '',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
    description: '',
    location: '',
    meetingType: '',
    priority: 'medium',
    sendInvitations: true,
    setReminders: true
  };
}

resetAttendeeForm() {
  this.attendeeForm = {
    name: '',
    email: '',
    role: ''
  };
}

// Meeting CRUD operations
saveMeeting() {
  if (!this.validateMeetingForm()) {
    return;
  }

  if (this.isEditMode) {
    this.updateExistingMeeting();
  } else {
    this.createNewMeeting();
  }
}

private validateMeetingForm(): boolean {
  if (!this.meetingForm.text || !this.meetingForm.startDate || !this.meetingForm.endDate || !this.meetingForm.meetingType) {
    Swal.fire({
      title: 'Validation Error',
      text: 'Please fill in all required fields',
      icon: 'error',
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    return false;
  }

  if (this.meetingForm.startDate >= this.meetingForm.endDate) {
    Swal.fire({
      title: 'Validation Error',
      text: 'End time must be after start time',
      icon: 'error',
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
    return false;
  }

  return true;
}

private createNewMeeting() {
  const newMeeting: Meeting = {
    id: this.generateId(),
    text: this.meetingForm.text,
    startDate: new Date(this.meetingForm.startDate),
    endDate: new Date(this.meetingForm.endDate),
    description: this.meetingForm.description,
    location: this.meetingForm.location,
    meetingType: this.meetingForm.meetingType,
    priority: this.meetingForm.priority,
    caseId: this.selectedCaseId,
    createdBy: 'Current User', // Replace with actual user
    createdDate: new Date(),
    status: 'scheduled',
    attendees: this.selectedAttendees.map(a => a.email)
  };

  this.meetings.push(newMeeting);
  this.meetingHistory.push(newMeeting);
  this.closeMeetingPopup();

  Swal.fire({
    title: 'Meeting Scheduled',
    text: 'The meeting has been successfully scheduled',
    icon: 'success',
    timer: 3000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
}

private updateExistingMeeting() {
  const meetingIndex = this.meetings.findIndex(m => m.id === this.editingMeetingId);
  if (meetingIndex !== -1) {
    this.meetings[meetingIndex] = {
      ...this.meetings[meetingIndex],
      text: this.meetingForm.text,
      startDate: new Date(this.meetingForm.startDate),
      endDate: new Date(this.meetingForm.endDate),
      description: this.meetingForm.description,
      location: this.meetingForm.location,
      meetingType: this.meetingForm.meetingType,
      priority: this.meetingForm.priority,
      attendees: this.selectedAttendees.map(a => a.email)
    };

    // Update in history as well
    const historyIndex = this.meetingHistory.findIndex(m => m.id === this.editingMeetingId);
    if (historyIndex !== -1) {
      this.meetingHistory[historyIndex] = { ...this.meetings[meetingIndex] };
    }
  }

  this.closeMeetingPopup();

  Swal.fire({
    title: 'Meeting Updated',
    text: 'The meeting has been successfully updated',
    icon: 'success',
    timer: 3000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
}

// Scheduler event handlers
onAppointmentAdding(e: any) {
  e.cancel = true; // Cancel default behavior
  this.showCreateMeetingPopup();
  
  // Pre-fill with clicked date/time
  if (e.appointmentData.startDate) {
    this.meetingForm.startDate = e.appointmentData.startDate;
    this.meetingForm.endDate = new Date(e.appointmentData.startDate.getTime() + 60 * 60 * 1000);
  }
}

onAppointmentUpdating(e: any) {
  // Handle appointment updates
  const meeting = e.oldData;
  const updatedMeeting = { ...meeting, ...e.newData };
  
  // Update the meeting in your data source
  const index = this.meetings.findIndex(m => m.id === meeting.id);
  if (index !== -1) {
    this.meetings[index] = updatedMeeting;
  }
}

onAppointmentDeleting(e: any) {
  e.cancel = true; // Cancel default behavior
  
  Swal.fire({
    title: 'Delete Meeting',
    text: 'Are you sure you want to delete this meeting?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.deleteMeeting(e.appointmentData.id);
    }
  });
}

onAppointmentClick(e: any) {
  // Handle single click - maybe show details
  console.log('Appointment clicked:', e.appointmentData);
}

onAppointmentDblClick(e: any) {
  // Handle double click - open edit popup
  this.editMeeting(e.appointmentData);
}

// Meeting history methods
editMeetingFromHistory(e: any) {
  this.editMeeting(e.row.data);
}

deleteMeetingFromHistory(e: any) {
  Swal.fire({
    title: 'Delete Meeting',
    text: 'Are you sure you want to delete this meeting?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      this.deleteMeeting(e.row.data.id);
    }
  });
}

private editMeeting(meetingData: Meeting) {
  this.isEditMode = true;
  this.editingMeetingId = meetingData.id;
  
  // Populate form with existing data
  this.meetingForm = {
    text: meetingData.text,
    startDate: meetingData.startDate,
    endDate: meetingData.endDate,
    description: meetingData.description || '',
    location: meetingData.location || '',
    meetingType: meetingData.meetingType,
    priority: meetingData.priority,
    sendInvitations: true,
    setReminders: true
  };

  // Load attendees if any
  this.selectedAttendees = meetingData.attendees ? 
    meetingData.attendees.map((email, index) => ({
      id: this.generateId(),
      name: email.split('@')[0], // Simple name extraction
      email: email,
      role: 'other'
    })) : [];

  this.meetingPopupVisible = true;
}

private deleteMeeting(meetingId: string) {
  // Remove from meetings array
  this.meetings = this.meetings.filter(m => m.id !== meetingId);
  
  // Update status in history instead of removing
  const historyIndex = this.meetingHistory.findIndex(m => m.id === meetingId);
  if (historyIndex !== -1) {
    this.meetingHistory[historyIndex].status = 'cancelled';
  }

  Swal.fire({
    title: 'Meeting Deleted',
    text: 'The meeting has been successfully deleted',
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    toast: true,
    position: 'top-end'
  });
}

// Grid helper methods
getMeetingTypeLabel(value: string): string {
  const type = this.meetingTypes.find(t => t.value === value);
  return type ? type.text : value;
}

getStatusLabel(value: string): string {
  const statusLabels: { [key: string]: string } = {
    'scheduled': 'Scheduled',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
    'rescheduled': 'Rescheduled'
  };
  return statusLabels[value] || value;
}

getAttendeesCount = (data: any) => {
  return data.attendees ? data.attendees.length : 0;
}

// Permission methods
canEditMeeting = (e: any) => {
  // Add your permission logic here
  return e.row.data.status !== 'completed';
}

canDeleteMeeting = (e: any) => {
  // Add your permission logic here
  return e.row.data.status !== 'completed';
}

// Utility methods
private generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
}