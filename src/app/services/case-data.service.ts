import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CaseData, InvestigationData, CaseStatus, Priority, InvestigationStatus } from '../models/case.models';

@Injectable({
  providedIn: 'root'
})
export class CaseDataService {
  private casesSubject = new BehaviorSubject<CaseData[]>(this.getDummyCases());
  private investigationsSubject = new BehaviorSubject<InvestigationData[]>(this.getDummyInvestigations());

  cases$ = this.casesSubject.asObservable();
  investigations$ = this.investigationsSubject.asObservable();

  getDummyCases(): CaseData[] {
    return [
      {
        id: '1',
        caseNo: 'CASE-2025-001',
        investigateParty: 'FirstBank Holdings Ltd',
        roleType: 'Primary Regulated Entity',
        regulatedParty: 'Banking Institution',
        status: CaseStatus.SANCTION,
        priority: Priority.HIGH,
        createdDate: new Date('2025-01-15'),
        assignedTo: 'Sarah Johnson',
        description: 'Consumer complaint regarding unauthorized transactions',
        listingType: 'Standard Listing',
        board: 'Main Board',
        issuer: 'J P Morgan Equities SA (Pty) Ltd',
        exchange: 'JSE Limited',
        sponsor: 'PSG Capital',
        secondReader: 'John Smith',
        contactOfficer: 'Andre Potgieter'
      },
      {
        id: '2',
        caseNo: 'CASE-2025-002',
        investigateParty: 'SecureLife Insurance Co',
        roleType: 'Secondary Entity',
        regulatedParty: 'Insurance Company',
        status: CaseStatus.ALLEGATIONS,
        priority: Priority.MEDIUM,
        createdDate: new Date('2025-01-18'),
        assignedTo: 'Michael Chen',
        description: 'Policy claim processing delays investigation',
        listingType: 'Standard Listing',
        board: 'Main Board',
        issuer: 'Goldman Sachs International',
        exchange: 'JSE Limited',
        sponsor: 'Rand Merchant Bank',
        secondReader: 'Sarah Wilson',
        contactOfficer: 'Michelle Roberts'
      },
      {
        id: '3',
        caseNo: 'CASE-2025-003',
        investigateParty: 'InvestPro Securities',
        roleType: 'Primary Regulated Entity',
        regulatedParty: 'Investment Firm',
        status: CaseStatus.OBJECTION,
        priority: Priority.HIGH,
        createdDate: new Date('2025-01-20'),
        assignedTo: 'Lisa Anderson',
        description: 'Market manipulation allegations',
        listingType: 'Standard Listing',
        board: 'Main Board',
        issuer: 'Barclays Bank PLC',
        exchange: 'JSE Limited',
        sponsor: 'Investec Bank',
        secondReader: 'Michael Brown',
        contactOfficer: 'David Thompson'
      },
      {
        id: '4',
        caseNo: 'CASE-2025-004',
        investigateParty: 'CreditMax Financial',
        roleType: 'Primary Regulated Entity',
        regulatedParty: 'Credit Provider',
        status: CaseStatus.ENQUIRY,
        priority: Priority.LOW,
        createdDate: new Date('2025-01-12'),
        assignedTo: 'David Wilson',
        description: 'Responsible lending practices review',
        listingType: 'Standard Listing',
        board: 'Main Board',
        issuer: 'Standard Bank Securities',
        exchange: 'JSE Limited',
        sponsor: 'Nedbank CIB',
        secondReader: 'Lisa Davis',
        contactOfficer: 'Sarah Mitchell'
      },
      {
        id: '5',
        caseNo: 'CASE-2025-005',
        investigateParty: 'John Smith (Individual)',
        roleType: 'Individual Trader',
        regulatedParty: 'Licensed Representative',
        status: CaseStatus.NEW,
        priority: Priority.MEDIUM,
        createdDate: new Date('2025-01-22'),
        assignedTo: 'Emma Thompson',
        description: 'Unlicensed financial advice allegations',
        listingType: 'Standard Listing',
        board: 'Main Board',
        issuer: 'J P Morgan Equities SA (Pty) Ltd',
        exchange: 'JSE Limited',
        sponsor: 'PSG Capital',
        secondReader: 'Robert Garcia',
        contactOfficer: 'Andre Potgieter'
      }
    ];
  }

  getDummyInvestigations(): InvestigationData[] {
    return [
      {
        id: '1',
        caseId: '1',
        investigationType: 'Consumer Complaint',
        eventType: 'Unauthorized Transaction',
        complainant: {
          id: '1',
          name: 'Robert',
          surname: 'Martinez',
          email: 'robert.martinez@email.com',
          contactCode: '+27',
          contactNumber: '823456789',
          relationshipType: 'Customer',
          entity: 'Individual Consumer'
        },
        documents: [],
        status: InvestigationStatus.ACTIVE,
        createdDate: new Date('2025-01-15'),
        area: 'Banking and Financial Services - Unauthorized Transaction Investigation',
        part: 'part2'
      },
      {
        id: '2',
        caseId: '2',
        investigationType: 'Operational Review',
        eventType: 'Process Failure',
        complainant: {
          id: '2',
          name: 'Patricia',
          surname: 'Williams',
          email: 'patricia.williams@email.com',
          contactCode: '+27',
          contactNumber: '834567890',
          relationshipType: 'Policyholder',
          entity: 'Individual Consumer'
        },
        documents: [],
        status: InvestigationStatus.ACTIVE,
        createdDate: new Date('2025-01-18'),
        area: 'Insurance Services - Claims Processing Review',
        part: 'part3'
      }
    ];
  }

  // Dropdown options
  getPartOptions() {
    return [
      { value: 'part1', text: 'Part 1 - General Provisions' },
      { value: 'part2', text: 'Part 2 - Regulatory Framework' },
      { value: 'part3', text: 'Part 3 - Compliance Requirements' },
      { value: 'part4', text: 'Part 4 - Enforcement Actions' },
      { value: 'part5', text: 'Part 5 - Appeals Process' }
    ];
  }

  getRoleTypeOptions() {
    return [
      { value: 'primary', text: 'Primary Regulated Entity' },
      { value: 'secondary', text: 'Secondary Entity' },
      { value: 'witness', text: 'Witness' },
      { value: 'complainant', text: 'Complainant' },
      { value: 'third_party', text: 'Third Party' },
      { value: 'representative', text: 'Licensed Representative' }
    ];
  }

  getRegulatedPartyOptions() {
    return [
      { value: 'bank', text: 'Banking Institution' },
      { value: 'insurance', text: 'Insurance Company' },
      { value: 'investment', text: 'Investment Firm' },
      { value: 'credit', text: 'Credit Provider' },
      { value: 'retirement', text: 'Retirement Fund' },
      { value: 'advisor', text: 'Financial Advisor' }
    ];
  }

  getEventTypeOptions() {
    return [
      { value: 'complaint', text: 'Consumer Complaint' },
      { value: 'investigation', text: 'Regulatory Investigation' },
      { value: 'audit', text: 'Compliance Audit' },
      { value: 'review', text: 'Supervisory Review' },
      { value: 'breach', text: 'Regulatory Breach' },
      { value: 'misconduct', text: 'Market Misconduct' }
    ];
  }

  getRelationshipTypeOptions() {
    return [
      { value: 'customer', text: 'Customer/Client' },
      { value: 'employee', text: 'Employee' },
      { value: 'contractor', text: 'Contractor' },
      { value: 'third_party', text: 'Third Party' },
      { value: 'whistleblower', text: 'Whistleblower' },
      { value: 'competitor', text: 'Competitor' }
    ];
  }

  // Stage options for comments
  getStageOptions() {
    return [
      { value: 'new', text: 'New' },
      { value: 'enquiry', text: 'Enquiry' },
      { value: 'allegations', text: 'Allegations' },
      { value: 'objection', text: 'Objection' },
      { value: 'sanction', text: 'Sanction' }
    ];
  }

  addCase(caseData: Partial<CaseData>): Observable<CaseData> {
    const newCase: CaseData = {
      id: Date.now().toString(),
      caseNo: `CASE-2025-${String(this.casesSubject.value.length + 1).padStart(3, '0')}`,
      investigateParty: caseData.investigateParty || '',
      roleType: caseData.roleType,
      regulatedParty: caseData.regulatedParty,
      status: CaseStatus.NEW,
      priority: Priority.MEDIUM,
      createdDate: new Date(),
      assignedTo: 'Current User',
      description: caseData.description,
      listingType: 'Standard Listing',
      board: 'Main Board',
      exchange: 'JSE Limited'
    };

    const currentCases = this.casesSubject.value;
    this.casesSubject.next([...currentCases, newCase]);
    
    return of(newCase);
  }

  searchCases(searchTerm: string): Observable<CaseData[]> {
    const filtered = this.casesSubject.value.filter(case_ =>
      case_.caseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.investigateParty.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return of(filtered);
  }

  getCaseById(id: string): CaseData | undefined {
    return this.casesSubject.value.find(case_ => case_.id === id);
  }

  getInvestigationsByCaseId(caseId: string): InvestigationData[] {
    return this.investigationsSubject.value.filter(inv => inv.caseId === caseId);
  }
}