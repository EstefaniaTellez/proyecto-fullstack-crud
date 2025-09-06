import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Project } from '../../services/api.service';
import { LoaderService } from '../../services/loader.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem; max-width: 600px; margin: 0 auto;">
      <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #1F2937; margin-bottom: 2rem;">
          {{ isEditMode() ? '✏️ Editar Proyecto' : '🚀 Crear Nuevo Proyecto' }}
        </h2>
        
        @if (loading()) {
          <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 2rem; color: #3B82F6;">⏳</div>
            <p style="color: #6B7280;">Cargando...</p>
          </div>
        } @else {
          <form (submit)="saveProject(); $event.preventDefault()" style="display: grid; gap: 1.5rem;">
            
            <div>
              <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
                Nombre del Proyecto *
              </label>
              <input [value]="project().name" 
                     (input)="updateProject('name', $event)" 
                     required
                     style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem;">
            </div>

            <div>
              <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
                Cliente
              </label>
              <input [value]="project().client" 
                     (input)="updateProject('client', $event)"
                     style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
                  Fecha Inicio *
                </label>
                <input type="date" [value]="project().startDate" 
                       (input)="updateProject('startDate', $event)" 
                       required
                       style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem;">
              </div>
              
              <div>
                <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
                  Fecha Fin
                </label>
                <input type="date" [value]="project().endDate" 
                       (input)="updateProject('endDate', $event)"
                       style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem;">
              </div>
            </div>

            <div>
              <label style="display: block; color: #374151; font-weight: 500; margin-bottom: 0.5rem;">
                Estado *
              </label>
              <select [value]="project().status" 
                      (change)="updateProject('status', $event)"
                      required
                      style="width: 100%; padding: 0.75rem; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 1rem;">
                <option value="">Seleccionar estado</option>
                <option value="planned">Planificado</option>
                <option value="in_progress">En Progreso</option>
                <option value="paused">Pausado</option>
                <option value="closed">Cerrado</option>
              </select>
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
              <button type="button" (click)="goBack()"
                      style="padding: 0.75rem 1.5rem; background: #6B7280; color: white; border: none; border-radius: 8px; cursor: pointer;">
                ↩️ Cancelar
              </button>
              
              <button type="submit"
                      style="padding: 0.75rem 1.5rem; background: #10B981; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                💾 {{ isEditMode() ? 'Actualizar' : 'Crear' }} Proyecto
              </button>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class ProjectFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private loaderService = inject(LoaderService);
  private notificationService = inject(NotificationService);

  project = signal<Project>({
    projectId: 0,
    name: '',
    client: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'planned',
    isDeleted: false
  });

  loading = signal(false);
  isEditMode = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.isEditMode.set(true);
      this.loadProject(Number(id));
    } else {
      this.isEditMode.set(false);
    }
  }

  loadProject(id: number) {
    this.loading.set(true);
    this.apiService.getProject(id).subscribe({
      next: (data) => {
        this.project.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.loading.set(false);
        this.notificationService.show('error', 'Error', 'No se pudo cargar el proyecto');
      }
    });
  }

  updateProject(field: keyof Project, event: any) {
    this.project.update(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  }

  saveProject() {
    if (!this.project().name || !this.project().startDate || !this.project().status) {
      this.notificationService.show('error', 'Error', 'Complete los campos obligatorios');
      return;
    }

    this.loading.set(true);
    
    if (this.isEditMode()) {
      this.apiService.updateProject(this.project().projectId, this.project()).subscribe({
        next: () => {
          this.goBack();
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.loading.set(false);
          this.notificationService.show('error', 'Error', 'No se pudo actualizar el proyecto');
        }
      });
    } else {
      this.apiService.createProject(this.project()).subscribe({
        next: () => {
          this.goBack();
        },
        error: (error) => {
          console.error('Error creating project:', error);
          this.loading.set(false);
          this.notificationService.show('error', 'Error', 'No se pudo crear el proyecto');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/proyectos']);
  }
}