import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ValidationService {

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  validateCaseForm(form: any): string[] {
    const errors: string[] = [];

    if (!form.area || form.area.trim() === '') {
      errors.push('Area description is required');
    }

    if (!form.part) {
      errors.push('Please select a Part');
    }

    if (!form.roleType) {
      errors.push('Please select a Role Type');
    }

    if (!form.regulatedParty) {
      errors.push('Please select a Regulated Party');
    }

    return errors;
  }

  validateInvestigationForm(form: any): string[] {
    const errors: string[] = [];

    if (!form.complainantName || form.complainantName.trim() === '') {
      errors.push('Complainant first name is required');
    }

    if (!form.complainantSurname || form.complainantSurname.trim() === '') {
      errors.push('Complainant surname is required');
    }

    if (!form.complainantEmail || form.complainantEmail.trim() === '') {
      errors.push('Complainant email is required');
    } else if (!this.validateEmail(form.complainantEmail)) {
      errors.push('Please enter a valid email address');
    }

    if (form.contactNumber && !this.validatePhoneNumber(form.contactNumber)) {
      errors.push('Please enter a valid phone number');
    }

    return errors;
  }
}