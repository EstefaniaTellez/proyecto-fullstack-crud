import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of visibleToasts()" class="toast" [class]="toast.severity">
        <div class="toast-content">
          <strong>{{ toast.summary }}</strong>
          <span>{{ toast.detail }}</span>
        </div>
        <button class="toast-close" (click)="remove(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      padding: 16px;
      border-radius: 8px;
      color: white;
      min-width: 300px;
      display: flex;
      justify-content: between;
      align-items: center;
      animation: slideIn 0.3s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .toast-content {
      flex: 1;
    }

    .toast.success { background: #10B981; }
    .toast.error { background: #EF4444; }
    .toast.warn { background: #F59E0B; }
    .toast.info { background: #3B82F6; }

    .toast-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      margin-left: 10px;
    }

    @keyframes slideIn {
      from { 
        transform: translateX(100%); 
        opacity: 0; 
      }
      to { 
        transform: translateX(0); 
        opacity: 1; 
      }
    }
  `]
})
export class ToastComponent {
  private notificationService = inject(NotificationService);
  visibleToasts = signal<any[]>([]);

  constructor() {
    effect(() => {
      this.visibleToasts.set(this.notificationService.toasts());
    });
  }

  remove(id: number) {
    this.notificationService.remove(id);
  }
}