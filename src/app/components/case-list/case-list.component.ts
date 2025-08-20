// src/app/components/case-list/case-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxDataGridModule, DxButtonModule, DxTextBoxModule } from 'devextreme-angular';
import { CaseData } from '../../models/case.models';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxDataGridModule,
    DxButtonModule,
    DxTextBoxModule
  ],
  template: `
    <div class="case-list-container">
      <div class="panel-card">
        <div class="panel-header">
          <h3>Case Management</h3>
        </div>
        
        <!-- Create Case Button -->
        <dx-button 
          text="Create Case" 
          type="success" 
          icon="plus"
          (onClick)="onCreateCase()"
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
            <h4>All Cases ({{ filteredCases.length }})</h4>
            <span class="grid-subtitle">Select a case to view details</span>
          </div>
          
          <dx-data-grid
            [dataSource]="filteredCases"
            [showBorders]="true"
            [rowAlternationEnabled]="true"
            [columnAutoWidth]="true"
            [allowColumnReordering]="true"
            [showRowLines]="true"
            [showColumnLines]="false"
            [selectedRowKeys]="selectedCaseId ? [selectedCaseId] : []"
            keyExpr="id"
            [selection]="{ mode: 'single' }"
            [hoverStateEnabled]="true"
            [focusedRowEnabled]="true"
            (onSelectionChanged)="onSelectionChanged($event)"
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
  `,
  styles: [`
    .case-list-container {
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
  `]
})
export class CaseListComponent {
  @Input() cases: CaseData[] = [];
  @Input() selectedCaseId: string | null = null;
  @Output() caseSelected = new EventEmitter<CaseData>();
  @Output() createCaseClicked = new EventEmitter<void>();

  searchValue = '';
  filteredCases: CaseData[] = [];

  ngOnInit() {
    this.filteredCases = [...this.cases];
  }

  ngOnChanges() {
    this.filterCases();
  }

  onSearchValueChanged(e: any) {
    this.searchValue = e.value || '';
    this.filterCases();
  }

  private filterCases() {
    const searchTerm = this.searchValue.toLowerCase();
    
    if (searchTerm) {
      this.filteredCases = this.cases.filter(case_ =>
        case_.caseNo.toLowerCase().includes(searchTerm) ||
        case_.investigateParty.toLowerCase().includes(searchTerm)
      );
    } else {
      this.filteredCases = [...this.cases];
    }
  }

  onSelectionChanged(e: any) {
    const selectedData = e.selectedRowsData[0];
    if (selectedData) {
      this.caseSelected.emit(selectedData);
    }
  }

  onRowClick(e: any) {
    const clickedCase = e.data;
    if (clickedCase) {
      this.caseSelected.emit(clickedCase);
    }
  }

  onCreateCase() {
    this.createCaseClicked.emit();
  }
}