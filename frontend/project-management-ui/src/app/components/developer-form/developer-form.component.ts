import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Developer } from '../../services/api.service';
import { LoaderService } from '../../services/loader.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem; max-width: 600px; margin: 0 auto;">
      <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #1F2937; margin-bottom: 2rem;">
          {{ isEditMode() ? '✏️ Editar Desarrollador' : '👥 Crear Nuevo Desarrollador' }}
        </h2>
        
        @if (loading()) {
          <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 2rem; color: #8B5CF6;">⏳</div>
            <p style="color: #6B7280;">Cargando...</p>
          </div>
        } @else {
          <form (submit)="saveDeveloper(); $event.preventDefault()" style="display: grid; gap: 1.5rem;">
            
            <div>
              <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
                Nombre Completo *
              </label>
              <input [value]="developer().fullName" 
                     (input)="updateDeveloper('fullName', $event)" 
                     required
                     style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem;">
            </div>

            <div>
              <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
                Email *
              </label>
              <input type="email" [value]="developer().email" 
                     (input)="updateDeveloper('email', $event)"
                     required
                     style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
                  Seniority *
                </label>
                <select [value]="developer().seniority" 
                        (change)="updateDeveloper('seniority', $event)"
                        required
                        style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem;">
                  <option value="">Seleccionar seniority</option>
                  <option value="JR">Junior (JR)</option>
                  <option value="SSR">Semi-Senior (SSR)</option>
                  <option value="SR">Senior (SR)</option>
                </select>
              </div>
              
              <div>
                <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
                  Estado *
                </label>
                <select [value]="developer().isActive ? 'true' : 'false'" 
                        (change)="updateDeveloper('isActive', $event)"
                        required
                        style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem;">
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
              <button type="button" (click)="goBack()"
                      style="padding: 0.75rem 1.5rem; background: #6B7280; color: white; border: none; border-radius: 8px; cursor: pointer;">
                ↩️ Cancelar
              </button>
              
              <button type="submit"
                      style="padding: 0.75rem 1.5rem; background: #8B5CF6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                💾 {{ isEditMode() ? 'Actualizar' : 'Crear' }} Desarrollador
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class DeveloperFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private loaderService = inject(LoaderService);
  private notificationService = inject(NotificationService);

  developer = signal<Developer>({
    developerId: 0,
    fullName: '',
    email: '',
    seniority: 'JR',
    isActive: true
  });

  loading = signal(false);
  isEditMode = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.isEditMode.set(true);
      this.loadDeveloper(Number(id));
    } else {
      this.isEditMode.set(false);
    }
  }

  loadDeveloper(id: number) {
    this.loading.set(true);
    this.apiService.getDeveloper(id).subscribe({
      next: (data) => {
        this.developer.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading developer:', error);
        this.loading.set(false);
        this.notificationService.show('error', 'Error', 'No se pudo cargar el desarrollador');
      }
    });
  }

  updateDeveloper(field: keyof Developer, event: any) {
    let value: any = event.target.value;
    
    if (field === 'isActive') {
      value = value === 'true';
    }
    
    this.developer.update(prev => ({
      ...prev,
      [field]: value
    }));
  }

  saveDeveloper() {
    if (!this.developer().fullName || !this.developer().email || !this.developer().seniority) {
      this.notificationService.show('error', 'Error', 'Complete los campos obligatorios');
      return;
    }

    this.loading.set(true);
    
    if (this.isEditMode()) {
      this.apiService.updateDeveloper(this.developer().developerId, this.developer()).subscribe({
        next: () => {
          this.goBack();
        },
        error: (error) => {
          console.error('Error updating developer:', error);
          this.loading.set(false);
          this.notificationService.show('error', 'Error', 'No se pudo actualizar el desarrollador');
        }
      });
    } else {
      this.apiService.createDeveloper(this.developer()).subscribe({
        next: () => {
          this.goBack();
        },
        error: (error) => {
          console.error('Error creating developer:', error);
          this.loading.set(false);
          this.notificationService.show('error', 'Error', 'No se pudo crear el desarrollador');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/desarrolladores']);
  }
}