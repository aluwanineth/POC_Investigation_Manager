// src/app/components/case-comments/case-comments.component.ts
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DxTextAreaModule, DxSelectBoxModule, DxButtonModule } from 'devextreme-angular';
import { CommentData } from '../../models/case.models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-case-comments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxTextAreaModule,
    DxSelectBoxModule,
    DxButtonModule
  ],
  template: `
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
        <div *ngIf="comments.length === 0" class="no-comments">
          No comments have been captured yet
        </div>
        <div *ngFor="let comment of comments" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-stage">{{ comment.stage }}</span>
            <span class="comment-date">{{ comment.date | date:'yyyy-MM-dd HH:mm' }}</span>
          </div>
          <div class="comment-text">{{ comment.text }}</div>
          <div class="comment-actions">
            <dx-button
              icon="edit"
              hint="Edit Comment"
              (onClick)="editComment(comment)"
              class="comment-action-btn">
            </dx-button>
            <dx-button
              icon="trash"
              hint="Delete Comment"
              (onClick)="deleteComment(comment)"
              class="comment-action-btn delete-btn">
            </dx-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
      max-height: 300px;
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
      position: relative;
      transition: all 0.2s ease;
    }

    .comment-item:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }

    .comment-item:hover .comment-actions {
      opacity: 1;
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
      margin-bottom: 8px;
    }

    .comment-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .comment-action-btn {
      height: 24px;
      width: 24px;
      min-width: 24px;
      border-radius: 4px;
    }

    .comment-action-btn.delete-btn {
      background-color: #dc3545;
      border-color: #dc3545;
    }

    .comment-action-btn.delete-btn:hover {
      background-color: #c82333;
      border-color: #bd2130;
    }

    @media (max-width: 768px) {
      .comment-input-row {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .comment-actions {
        opacity: 1;
        position: static;
        justify-content: flex-end;
        margin-top: 8px;
      }
    }
  `]
})
export class CaseCommentsComponent implements OnInit {
  @Input() caseId: string = '';
  @Output() commentAdded = new EventEmitter<CommentData>();
  @Output() commentEdited = new EventEmitter<CommentData>();
  @Output() commentDeleted = new EventEmitter<string>();

  comments: CommentData[] = [];
  newComment: string = '';
  selectedStageForComment: string = '';

  stageOptions = [
    { value: 'new', text: 'New' },
    { value: 'enquiry', text: 'Enquiry' },
    { value: 'allegations', text: 'Allegations' },
    { value: 'objection', text: 'Objection' },
    { value: 'sanction', text: 'Sanction' }
  ];

  ngOnInit() {
    this.loadComments();
  }

  ngOnChanges() {
    if (this.caseId) {
      this.loadComments();
    }
  }

  private loadComments() {
    // Simulate loading comments for the case
    this.comments = [];
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
      
      this.comments.unshift(newCommentObj);
      this.commentAdded.emit(newCommentObj);
      
      // Reset form
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

  editComment(comment: CommentData) {
    Swal.fire({
      title: 'Edit Comment',
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Comment:</label>
          <textarea id="swal-edit-comment" class="swal2-textarea" style="margin-bottom: 15px;">${comment.text}</textarea>
          
          <label style="display: block; margin-bottom: 5px; font-weight: 500;">Stage:</label>
          <select id="swal-edit-stage" class="swal2-input">
            ${this.stageOptions.map(option => 
              `<option value="${option.value}" ${option.text === comment.stage ? 'selected' : ''}>${option.text}</option>`
            ).join('')}
          </select>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Update Comment',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#28a745',
      preConfirm: () => {
        const text = (document.getElementById('swal-edit-comment') as HTMLTextAreaElement)?.value;
        const stageValue = (document.getElementById('swal-edit-stage') as HTMLSelectElement)?.value;
        const stage = this.stageOptions.find(s => s.value === stageValue)?.text || stageValue;
        
        if (!text.trim()) {
          Swal.showValidationMessage('Please enter a comment');
          return false;
        }
        
        return { text, stage };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.comments.findIndex(c => c.id === comment.id);
        if (index !== -1) {
          this.comments[index] = {
            ...this.comments[index],
            text: result.value.text,
            stage: result.value.stage
          };
          
          this.commentEdited.emit(this.comments[index]);
          
          Swal.fire({
            title: 'Comment Updated',
            text: 'The comment has been successfully updated',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        }
      }
    });
  }

  deleteComment(comment: CommentData) {
    Swal.fire({
      title: 'Delete Comment',
      text: 'Are you sure you want to delete this comment? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        this.comments = this.comments.filter(c => c.id !== comment.id);
        this.commentDeleted.emit(comment.id);
        
        Swal.fire({
          title: 'Comment Deleted',
          text: 'The comment has been successfully deleted',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end'
        });
      }
    });
  }
}