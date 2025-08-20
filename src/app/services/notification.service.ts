import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // Success notifications
  showSuccess(title: string, message?: string, timer: number = 3000): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
      showClass: {
        popup: 'animate__animated animate__fadeInRight'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutRight'
      }
    });
  }

  // Error notifications
  showError(title: string, message?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Close',
      customClass: {
        popup: 'error-popup'
      }
    });
  }

  // Warning notifications
  showWarning(title: string, message?: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      confirmButtonColor: '#ffc107',
      confirmButtonText: 'Understood'
    });
  }

  // Info notifications
  showInfo(title: string, message?: string, timer: number = 2000): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      timer,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  }

  // Confirmation dialogs
  showConfirmation(
    title: string, 
    message?: string, 
    confirmText: string = 'Yes, proceed!',
    cancelText: string = 'Cancel'
  ): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      reverseButtons: true
    });
  }

  // Custom loading dialog
  showLoading(title: string = 'Processing...', message?: string): void {
    Swal.fire({
      title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Close any open dialogs
  close(): void {
    Swal.close();
  }

  // File upload success with preview
  showFileUploadSuccess(files: File[]): Promise<SweetAlertResult> {
    const fileList = files.map(file => `• ${file.name} (${this.formatFileSize(file.size)})`).join('\n');
    
    return Swal.fire({
      title: 'Files Uploaded Successfully!',
      html: `
        <div style="text-align: left; margin-top: 20px;">
          <strong>Uploaded files:</strong><br>
          <pre style="background: #f8f9fa; padding: 10px; border-radius: 4px; font-size: 12px;">${fileList}</pre>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#28a745'
    });
  }

  // Case creation success with actions
  showCaseCreatedSuccess(caseNo: string): Promise<SweetAlertResult> {
    return Swal.fire({
      title: 'Case Created Successfully!',
      html: `
        <div style="text-align: center;">
          <div style="font-size: 24px; margin: 20px 0; color: #28a745;">
            <i class="dx-icon-check" style="font-size: 48px;"></i>
          </div>
          <p>Case <strong>${caseNo}</strong> has been created and is ready for processing.</p>
          <p style="color: #6c757d; font-size: 14px;">You can now proceed with the investigation or assign it to team members.</p>
        </div>
      `,
      icon: 'success',
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Continue',
      showCancelButton: true,
      cancelButtonText: 'View Case',
      cancelButtonColor: '#007bff'
    });
  }

  // Validation error with field highlighting
  showValidationError(errors: string[]): Promise<SweetAlertResult> {
    const errorList = errors.map(error => `• ${error}`).join('\n');
    
    return Swal.fire({
      title: 'Please Complete Required Fields',
      html: `
        <div style="text-align: left; margin-top: 15px;">
          <p style="margin-bottom: 15px; color: #dc3545;">The following fields need attention:</p>
          <pre style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 4px; font-size: 13px; border-left: 4px solid #dc3545;">${errorList}</pre>
        </div>
      `,
      icon: 'error',
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Fix Issues'
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}