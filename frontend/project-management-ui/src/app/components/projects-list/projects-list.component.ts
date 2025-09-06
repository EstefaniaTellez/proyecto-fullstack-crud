import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Project } from '../../services/api.service';
import { LoaderService } from '../../services/loader.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1 style="color: #2563EB; margin: 0;">🚀 Gestión de Proyectos</h1>
        <button (click)="navigateToCreate()" 
                style="background: #10B981; border: none; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer;">
          ➕ Nuevo Proyecto
        </button>
      </div>

      @if (loading()) {
        <div style="text-align: center; padding: 3rem; background: #F9FAFB; border-radius: 12px;">
          <div style="font-size: 2rem; color: #3B82F6;">⏳</div>
          <p style="color: #6B7280; margin-top: 1rem;">Cargando proyectos...</p>
        </div>
      } @else {
        <div style="display: grid; gap: 1.5rem;">
          @for (project of projects(); track project.projectId) {
            <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid {{getStatusColor(project.status)}};">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                  <h3 style="color: #1F2937; margin: 0 0 0.5rem 0;">{{ project.name }}</h3>
                  <p style="color: #6B7280; margin: 0.25rem 0;"><strong>Cliente:</strong> {{ project.client || 'Sin cliente' }}</p>
                  <p style="color: #6B7280; margin: 0.25rem 0;">
                    <strong>Fechas:</strong> 
                    {{ project.startDate | date:'dd/MM/yyyy' }} - 
                    {{ project.endDate ? (project.endDate | date:'dd/MM/yyyy') : 'Sin fecha fin' }}
                  </p>
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: {{getStatusColor(project.status)}};"></span>
                    <span style="color: {{getStatusColor(project.status)}}; font-weight: 500;">
                      {{ getStatusLabel(project.status) }}
                    </span>
                  </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem;">
                  <button (click)="editProject(project.projectId)"
                          style="background: #3B82F6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                    ✏️ Editar
                  </button>
                  
                   <button (click)="manageAssignments(project.projectId)"
                          style="background: #8B5CF6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                    👥 Asignar
                  </button>

                  <button (click)="deleteProject(project.projectId)"
                          style="background: #EF4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            </div>
          }
          
          @if (projects().length === 0) {
            <div style="text-align: center; padding: 3rem; background: #F9FAFB; border-radius: 12px;">
              <div style="font-size: 2rem; color: #9CA3AF;">📋</div>
              <p style="color: #6B7280; margin-top: 1rem;">No hay proyectos registrados</p>
              <button (click)="navigateToCreate()"
                      style="background: #3B82F6; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; margin-top: 1rem;">
                Crear primer proyecto
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ProjectsListComponent {
  private apiService = inject(ApiService);
  private loaderService = inject(LoaderService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  
  projects = signal<Project[]>([]);
  loading = signal(false);

  constructor() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading.set(true);
    this.apiService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.loading.set(false);
        this.notificationService.show('error', 'Error', 'No se pudieron cargar los proyectos');
      }
    });
  }

  manageAssignments(projectId: number) {
    this.router.navigate(['/proyectos', projectId, 'asignaciones']);
  }

  navigateToCreate() {
    this.router.navigate(['/proyectos/nuevo']);
  }

  editProject(id: number) {
    this.router.navigate(['/proyectos', id]);
  }

  deleteProject(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este proyecto?\n\nEsta acción marcará el proyecto como eliminado, pero podrá ser restaurado.')) {
      this.apiService.deleteProject(id).subscribe({
        next: () => {
          this.loadProjects();
        },
        error: (error) => {
          console.error('Error deleting project:', error);
          this.notificationService.show('error', 'Error', 'No se pudo eliminar el proyecto');
        }
      });
    }
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'planned': 'Planificado',
      'in_progress': 'En Progreso',
      'paused': 'Pausado',
      'closed': 'Cerrado'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'planned': '#3B82F6',     // Azul - Planificado
      'in_progress': '#10B981', // Verde - En progreso
      'paused': '#F59E0B',      // Amarillo - Pausado
      'closed': '#6B7280'       // Gris - Cerrado
    };
    return colorMap[status] || '#9CA3AF'; // Gris por defecto
  }
}