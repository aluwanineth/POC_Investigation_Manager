// src/app/components/header/header.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="app-header">
      <h1>{{ title }}</h1>
      <div class="header-actions">
        <span class="user-info">Welcome, {{ currentUser }}</span>
      </div>
    </div>
  `,
  styles: [`
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
  `]
})
export class HeaderComponent {
  @Input() title: string = 'Case Management System';
  @Input() currentUser: string = 'Aluwani Nethavhakone';
}