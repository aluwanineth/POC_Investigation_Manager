// src/app/components/investigation-details/investigation-details.component.ts (Updated)
import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  DxDataGridModule, 
  DxTabPanelModule,
  DxTextBoxModule,
  DxSelectBoxModule,
  DxTextAreaModule,
  DxButtonModule
} from 'devextreme-angular';
import { CaseData, InvestigationData } from '../../models/case.models';
import { DocumentManagementComponent } from '../document-management/document-management.component';
import { MeetingSchedulerComponent } from '../meeting/meeting.component';

@Component({
  selector: 'app-investigation-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxDataGridModule,
    DxTabPanelModule,
    DxTextBoxModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxButtonModule,
    DocumentManagementComponent,
    MeetingSchedulerComponent
  ],
  templateUrl: './investigation-details.component.html',
  styleUrls: ['./investigation-details.component.css']
})
export class InvestigationDetailsComponent implements OnChanges {
  @Input() investigation: InvestigationData | null = null;

  selectedInvestigation: any = null;

  @Input() selectedCase: CaseData | null = null;

  
  // Tab configuration - Updated to include Documents tab
  investigationTabs = [
    { title: 'Details', template: 'detailsTab' },
    { title: 'Communications', template: 'communicationTab' },
    { title: 'Meetings', template: 'meetingsTab' },
    { title: 'List Requirements', template: 'listRequirementsTab' }
  ];

  // Investigation grid data matching the screenshot
  investigationGridData = [
    {
      filingNumber: '25081130-A',
      investigatedParty: 'Contact',
      roleType: 'Contact',
      regulatedParty: 'Andre Potgieter',
      sponsor: '',
      investigationType: 'Additional listing - New listing - AltX',
      dateCreated: new Date('2025-08-14T15:20:00'),
      allocatedTo: '',
      stage: 'New Process',
      status: 'New',
      dateClosed: null
    },
    {
      filingNumber: '25081131-B',
      investigatedParty: 'Contact',
      roleType: 'Contact',
      regulatedParty: 'Aluwani Potgieter',
      sponsor: '',
      investigationType: 'Additional listing - New listing - AltX',
      dateCreated: new Date('2025-08-14T15:20:00'),
      allocatedTo: '',
      stage: 'New Process',
      status: 'New',
      dateClosed: null
    }
  ];

  // Form properties for the details section
  description = 'Testing';
  priority = 'High';

  // Form data
  selectedEventType = '';
  complainantForm = {
    name: '',
    surname: '',
    email: '',
    relationshipType: '',
    contactCode: '+27',
    contactNumber: '',
    entity: ''
  };

  // Data arrays
  eventTypes: any[] = [
    { name: 'Additional listing - New listing - AltX' }
  ];
  complainants: any[] = [];
  
  // Updated documents array with different statuses
  documents: any[] = [
    {
      name: 'Investigation Report - C1130',
      documentType: 'SENS Announcement',
      documentNumber: 'RPT-001',
      uploadedBy: 'John Smith',
      dateUploaded: '2025-08-20 15:04',
      stage: 'Completed',
      status: 'Completed'
    },
    {
      name: 'Preliminary Findings Memo',
      documentType: 'Internal Memo',
      documentNumber: 'MEMO-002',
      uploadedBy: 'Sarah Johnson',
      dateUploaded: '2025-08-19 10:30',
      stage: 'Review',
      status: 'InReview'
    },
    {
      name: 'Response Letter Draft',
      documentType: 'Official Letter',
      documentNumber: 'LTR-003',
      uploadedBy: 'Mike Davis',
      dateUploaded: '2025-08-18 14:15',
      stage: 'Draft',
      status: 'Draft'
    },
    {
      name: 'Compliance Summary Q3',
      documentType: 'Summary Report',
      documentNumber: 'SUM-004',
      uploadedBy: 'Emily Wilson',
      dateUploaded: '2025-08-17 09:45',
      stage: 'Rejected',
      status: 'Rejected'
    }
  ];

  // Dropdown options
  priorityOptions = [
    { value: 'Low', text: 'Low' },
    { value: 'Medium', text: 'Medium' },
    { value: 'High', text: 'High' },
    { value: 'Critical', text: 'Critical' }
  ];

  eventTypeOptions = [
    { value: 'additional_listing_new_altx', text: 'Additional listing - New listing - AltX' },
    { value: 'compliance_review', text: 'Compliance Review' },
    { value: 'financial_disclosure', text: 'Financial Disclosure' },
    { value: 'market_manipulation', text: 'Market Manipulation' },
    { value: 'insider_trading', text: 'Insider Trading' },
    { value: 'corporate_governance', text: 'Corporate Governance' }
  ];

  relationshipTypeOptions = [
    { value: 'complainant', text: 'Complainant' },
    { value: 'whistleblower', text: 'Whistleblower' },
    { value: 'third_party', text: 'Third Party' },
    { value: 'regulator', text: 'Regulator' },
    { value: 'internal', text: 'Internal' }
  ];

  ngOnChanges() {
    if (this.investigation) {
      this.loadInvestigationData();
    }
  }

  private loadInvestigationData() {
    // Load investigation-specific data
    // This would typically come from the investigation object or service
  }

  addEventType() {
    if (this.selectedEventType) {
      const eventTypeText = this.eventTypeOptions.find(opt => opt.value === this.selectedEventType)?.text;
      if (eventTypeText && !this.eventTypes.find(et => et.name === eventTypeText)) {
        this.eventTypes.push({ name: eventTypeText });
        this.selectedEventType = '';
      }
    }
  }

  deleteSelectedEventTypes() {
    // Implementation would depend on the grid's selection
    console.log('Delete selected event types');
  }

  addComplainant() {
    if (this.complainantForm.name && this.complainantForm.email) {
      this.complainants.push({
        name: this.complainantForm.name,
        surname: this.complainantForm.surname,
        email: this.complainantForm.email,
        relationshipType: this.relationshipTypeOptions.find(opt => opt.value === this.complainantForm.relationshipType)?.text || '',
        contactNumber: `${this.complainantForm.contactCode}${this.complainantForm.contactNumber}`,
        entity: this.complainantForm.entity
      });

      // Reset form
      this.complainantForm = {
        name: '',
        surname: '',
        email: '',
        relationshipType: '',
        contactCode: '+',
        contactNumber: '',
        entity: ''
      };
    }
  }

  addDocument() {
    // This will now be handled by the document management component
    console.log('Add document - handled by document management component');
  }

  getSelectedInvestigationValue(property: string): string {
    return this.selectedInvestigation ? (this.selectedInvestigation[property] || '') : '';
  }

  getSelectedInvestigationDate(property: string): string {
    if (!this.selectedInvestigation || !this.selectedInvestigation[property]) {
      return '';
    }
    const date = new Date(this.selectedInvestigation[property]);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }

  formatStatus(status: string) {
    const statusColors: any = {
      'New': '#28a745',
      'active': '#28a745',
      'pending': '#ffc107',
      'completed': '#17a2b8',
      'cancelled': '#dc3545',
      'on_hold': '#6c757d',
      'Draft': '#6c757d',
      'InReview': '#17a2b8',
      'Accepted': '#28a745',
      'Rejected': '#dc3545',
      'Completed': '#667eea'
    };
    
    const statusLabels: any = {
      'New': 'New',
      'active': 'Active',
      'pending': 'Pending',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'on_hold': 'On Hold',
      'Draft': 'Draft',
      'InReview': 'In Review',
      'Accepted': 'Accepted',
      'Rejected': 'Rejected',
      'Completed': 'Completed'
    };
    
    const color = statusColors[status] || '#000';
    const label = statusLabels[status] || status.replace('_', ' ').toUpperCase();
    
    return `<span style="color: ${color}; font-weight: 500; padding: 4px 8px; background: ${color}15; border-radius: 4px;">
              ${label}
            </span>`;
  }
}