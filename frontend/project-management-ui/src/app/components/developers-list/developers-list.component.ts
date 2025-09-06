import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Developer } from '../../services/api.service';
import { LoaderService } from '../../services/loader.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-developers-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <h1 style="color: #7C3AED; margin: 0;">👥 Gestión de Desarrolladores</h1>
        <button (click)="navigateToCreate()" 
                style="background: #10B981; border: none; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 500; cursor: pointer;">
          ➕ Nuevo Desarrollador
        </button>
      </div>

      @if (loading()) {
        <div style="text-align: center; padding: 3rem; background: #F9FAFB; border-radius: 12px;">
          <div style="font-size: 2rem; color: #8B5CF6;">⏳</div>
          <p style="color: #6B7280; margin-top: 1rem;">Cargando desarrolladores...</p>
        </div>
      } @else {
        <div style="display: grid; gap: 1.5rem;">
          @for (developer of developers(); track developer.developerId) {
            <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid {{getSeniorityColor(developer.seniority)}};">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                  <h3 style="color: #1F2937; margin: 0 0 0.5rem 0;">{{ developer.fullName }}</h3>
                  <p style="color: #6B7280; margin: 0.25rem 0;">
                    <strong>Email:</strong> 
                    <a [href]="'mailto:' + developer.email" style="color: #3B82F6; text-decoration: none;">
                      {{ developer.email }}
                    </a>
                  </p>
                  
                  <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: {{getSeniorityColor(developer.seniority)}};"></span>
                      <span style="color: {{getSeniorityColor(developer.seniority)}}; font-weight: 500;">
                        {{ getSeniorityLabel(developer.seniority) }}
                      </span>
                    </div>
                    
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: {{developer.isActive ? '#10B981' : '#EF4444'}};"></span>
                      <span style="color: {{developer.isActive ? '#10B981' : '#EF4444'}}; font-weight: 500;">
                        {{ developer.isActive ? 'Activo' : 'Inactivo' }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div style="display: flex; gap: 0.5rem;">
                  <button (click)="editDeveloper(developer.developerId)"
                          style="background: #3B82F6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                    ✏️ Editar
                  </button>
                  
                  <button (click)="deleteDeveloper(developer.developerId)"
                        style="background: #EF4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px;">
                  🗑️ {{ developer.isActive ? 'Desactivar' : 'Inactivo' }}
                </button>
                </div>
              </div>
            </div>
          }
          
          @if (developers().length === 0) {
            <div style="text-align: center; padding: 3rem; background: #F9FAFB; border-radius: 12px;">
              <div style="font-size: 2rem; color: #9CA3AF;">👨‍💻</div>
              <p style="color: #6B7280; margin-top: 1rem;">No hay desarrolladores registrados</p>
              <button (click)="navigateToCreate()"
                      style="background: #8B5CF6; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; cursor: pointer; margin-top: 1rem;">
                Agregar primer desarrollador
              </button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DevelopersListComponent {
  private apiService = inject(ApiService);
  private loaderService = inject(LoaderService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  
  developers = signal<Developer[]>([]);
  loading = signal(false);

  constructor() {
    this.loadDevelopers();
  }

  updateDeveloper(developer: Developer) {
  console.log('📤 Intentando actualizar desarrollador:', developer);

  this.apiService.updateDeveloper(developer.developerId, developer).subscribe({
    next: (response) => {
      console.log('✅ Desarrollador actualizado exitosamente:', response);
      this.notificationService.show('success', 'Éxito', 'Desarrollador actualizado correctamente');
      this.loadDevelopers();
    },
    error: (error) => {
      console.error('❌ Error completo al actualizar:', error);
      console.error('❌ Status:', error.status);
      console.error('❌ Error response:', error.error);
      
      // Manejo específico de errores
      if (error.status === 409) {
        this.notificationService.show('error', 'Error de conflicto', 
          'Ya existe un desarrollador con este email. Por favor, use un email diferente.');
      } 
      else if (error.status === 404) {
        this.notificationService.show('error', 'No encontrado', 
          'El desarrollador no existe o fue eliminado.');
      }
      else if (error.status === 400) {
        const errorMessage = error.error?.message || error.error || 'Datos inválidos';
        this.notificationService.show('error', 'Error de validación', errorMessage);
      }
      else if (error.status === 500) {
        this.notificationService.show('error', 'Error del servidor', 
          'Error interno del servidor. Por favor, intente más tarde.');
      }
      else {
        this.notificationService.show('error', 'Error', 
          'Error inesperado al actualizar desarrollador: ' + (error.message || 'Desconocido'));
      }
    }
  });
}

  loadDevelopers() {
    this.loading.set(true);
    this.apiService.getDevelopers().subscribe({
      next: (data) => {
        this.developers.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading developers:', error);
        this.loading.set(false);
        this.notificationService.show('error', 'Error', 'No se pudieron cargar los desarrolladores');
      }
    });
  }

  navigateToCreate() {
    this.router.navigate(['/desarrolladores/nuevo']);
  }

  editDeveloper(id: number) {
    this.router.navigate(['/desarrolladores', id]);
  }

  deleteDeveloper(id: number) {
  const developer = this.developers().find(d => d.developerId === id);
  if (!developer) return;

  const action = developer.isActive ? 'desactivar' : 'activar';

  if (confirm(`¿Estás seguro de que quieres ${action} este desarrollador?`)) {
    // Crear copia y cambiar estado
    const updatedDeveloper = { ...developer, isActive: !developer.isActive };

    this.apiService.updateDeveloper(id, updatedDeveloper).subscribe({
      next: () => {
        this.notificationService.show(
          'success',
          'Éxito',
          `El desarrollador fue ${action} correctamente`
        );
        this.loadDevelopers();
      },
      error: (error) => {
        console.error('Error actualizando estado:', error);
        this.notificationService.show(
          'error',
          'Error',
          `No se pudo ${action} el desarrollador`
        );
      }
    });
  }
}


  getSeniorityLabel(seniority: string): string {
    const seniorityMap: { [key: string]: string } = {
      'JR': 'Junior',
      'SSR': 'Semi-Senior', 
      'SR': 'Senior'
    };
    return seniorityMap[seniority] || seniority;
  }

  getSeniorityColor(seniority: string): string {
    const colorMap: { [key: string]: string } = {
      'JR': '#3B82F6',     // Azul - Junior
      'SSR': '#8B5CF6',    // Violeta - Semi-Senior
      'SR': '#10B981'      // Verde - Senior
    };
    return colorMap[seniority] || '#9CA3AF';
  }
}