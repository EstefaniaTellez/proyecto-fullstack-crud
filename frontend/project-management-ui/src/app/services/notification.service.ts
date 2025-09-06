import { Injectable, signal, effect } from '@angular/core';

export interface Toast {
  id: number;
  severity: 'success' | 'error' | 'info' | 'warn';
  summary: string;
  detail: string;
  life?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSignal = signal<Toast[]>([]);
  private nextId = 0;

  // Signal pública readonly
  toasts = this.toastsSignal.asReadonly();

  constructor() {
    // Effect para log automático de nuevos toasts
    effect(() => {
      const currentToasts = this.toastsSignal();
      console.log('🔔 Toasts actualizados:', currentToasts.length);
      
      currentToasts.forEach(toast => {
        console.log(`   - ${toast.severity}: ${toast.summary}`);
      });
    });
  }

  show(severity: Toast['severity'], summary: string, detail: string = '', life: number = 3000) {
    const toast: Toast = { 
      id: this.nextId++, 
      severity, 
      summary, 
      detail, 
      life 
    };
    
    this.toastsSignal.update(toasts => [...toasts, toast]);
    
    // Effect para auto-remover
    if (life > 0) {
      setTimeout(() => this.remove(toast.id), life);
    }
  }

  remove(id: number) {
    this.toastsSignal.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear() {
    this.toastsSignal.set([]);
  }
}