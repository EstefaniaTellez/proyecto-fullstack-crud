import { Component, inject, signal, effect, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Project, Developer, AssignmentInfo } from '../../services/api.service';
import { LoaderService } from '../../services/loader.service';
import { NotificationService } from '../../services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assignment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignment-form.component.html',  styles: `
    .container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .card {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .back-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background-color 0.2s;
    }

    .back-button:hover {
      background-color: #f3f4f6;
    }

    .title {
      color: #1f2937;
      margin: 0;
      font-size: 1.8rem;
    }

    .loading-state {
      text-align: center;
      padding: 3rem;
    }

    .loading-icon {
      font-size: 3rem;
      color: #3b82f6;
      margin-bottom: 1rem;
    }

    .loading-text {
      color: #6b7280;
      font-size: 1.1rem;
    }

    .project-info {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      border-left: 4px solid #3b82f6;
    }

    .project-name {
      color: #1e40af;
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
    }

    .project-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.5rem;
    }

    .project-details p {
      color: #4b5563;
      margin: 0.25rem 0;
      padding: 0.5rem;
      background: white;
      border-radius: 6px;
    }

    .section-title {
      color: #374151;
      margin-bottom: 1.5rem;
      font-size: 1.3rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #e5e7eb;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      align-items: end;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      display: block;
      color: #374151;
      font-weight: 600;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .invisible {
      opacity: 0;
    }

    .form-select,
    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #d1d5db;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .form-select:focus,
    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .assign-button {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .assign-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .assign-button:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      background: #f9fafb;
      border-radius: 12px;
      color: #6b7280;
    }

    .assignments-grid {
      display: grid;
      gap: 1rem;
    }

    .assignment-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      transition: transform 0.2s;
    }

    .assignment-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    .assignment-info {
      flex: 1;
    }

    .developer-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .seniority-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .seniority-badge.jr {
      background: #dbeafe;
      color: #1e40af;
    }

    .seniority-badge.ssr {
      background: #fef3c7;
      color: #92400e;
    }

    .seniority-badge.sr {
      background: #dcfce7;
      color: #166534;
    }

    .assignment-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.5rem;
    }

    .assignment-details p {
      margin: 0.25rem 0;
      font-size: 1.1rem;
      color: #6b7280;
    }

    .email {
      grid-column: 1 / -1;
      color: #3b82f6 !important;
      font-weight: 500;
    }

    .remove-button {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      border: none;
      padding: 0.75rem 1.25rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.2s;
    }

    .remove-button:hover {
      transform: scale(1.05);
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .card {
        padding: 1.5rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .assignment-card {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .developer-header {
        justify-content: center;
      }

      .assignment-details {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class AssignmentFormComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private loaderService = inject(LoaderService);
  private notificationService = inject(NotificationService);
  private cdRef = inject(ChangeDetectorRef);

  project = signal<Project | null>(null);
  developers = signal<Developer[]>([]);
  assignments = signal<AssignmentInfo[]>([]);
  loading = signal(false);

  selectedDeveloperId = 0;
  newAssignment = {
    role: '',
    weeklyHours: 0,
    assignmentDate: new Date().toISOString().split('T')[0] // Fecha actual por defecto
  };

  constructor() {
    effect(() => {
      const projectId = this.route.snapshot.paramMap.get('id');
      if (projectId) {
        this.loadData(Number(projectId));
      }
    });
  }

  loadData(projectId: number) {
    this.loading.set(true);
    
   
    this.apiService.getProject(projectId).subscribe({
      next: (project) => {
        this.project.set(project);
        
        this.apiService.getDevelopers().subscribe({
          next: (developers) => {
            this.developers.set(developers);
            
            this.apiService.getProjectAssignments(projectId).subscribe({
              next: (assignments) => {
                console.log('📋 Assignments recibidos:', assignments);
                if (assignments.length > 0) {
                  console.log('📋 Primer assignment:', assignments[0]);
                  console.log('📋 Keys del primer assignment:', Object.keys(assignments[0]));
                }
                this.assignments.set(assignments);
                this.loading.set(false);
              },
              error: (error) => {
                console.error('Error loading assignments:', error);
                this.loading.set(false);
              }
            });
          },
          error: (error) => {
            console.error('Error loading developers:', error);
            this.loading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.loading.set(false);
      }
    });
  }

  availableDevelopers() {
    const assignedDeveloperIds = this.assignments().map(a => a.developerId);
    return this.developers().filter(dev => 
      !assignedDeveloperIds.includes(dev.developerId) && dev.isActive
    );
  }

  isFormValid(): boolean {
    return !!this.selectedDeveloperId && 
           !!this.newAssignment.role && 
           !!this.newAssignment.weeklyHours &&
           !!this.newAssignment.assignmentDate;
  }

  assignDeveloper() {
    if (!this.isFormValid()) {
      this.notificationService.show('error', 'Error', 'Complete todos los campos');
      return;
    }

    if (this.newAssignment.weeklyHours < 1 || this.newAssignment.weeklyHours > 40) {
      this.notificationService.show('error', 'Error', 'Las horas deben estar entre 1 y 40');
      return;
    }

    const assignment = {
      projectId: this.project()?.projectId || 0,
      developerId: this.selectedDeveloperId,
      role: this.newAssignment.role,
      weeklyHours: this.newAssignment.weeklyHours,
      assignmentDate: this.newAssignment.assignmentDate,
      isDeleted: false
    };

    console.log('📤 Enviando asignación:', assignment);

    this.apiService.createAssignment(assignment).subscribe({
      next: () => {
        this.selectedDeveloperId = 0;
        this.newAssignment = { 
          role: '', 
          weeklyHours: 0, 
          assignmentDate: new Date().toISOString().split('T')[0] 
        };
        
        if (this.project()?.projectId) {
          this.loadAssignments(this.project()!.projectId);
        }
        
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error creating assignment:', error);
        this.notificationService.show('error', 'Error', 'No se pudo crear la asignación');
      }
    });
  }

  removeAssignment(assignment: any) {
  console.log('🔍 Assignment completo recibido:', assignment);
  
  const developerId = assignment.developerId || assignment.developer_id;
  
  console.log('🔍 developerId extraído:', developerId);
  
  if (!developerId || isNaN(developerId) || developerId === 0) {
    console.error('❌ developerId inválido o undefined:', developerId);
    console.error('❌ Assignment object:', assignment);
    this.notificationService.show('error', 'Error', 'ID de desarrollador inválido');
    return;
  }

  if (confirm('¿Estás seguro de que quieres remover este desarrollador del proyecto?')) {
    if (this.project()?.projectId) {
      const projectId = this.project()!.projectId;
      console.log('🗑️ Intentando eliminar asignación:', { projectId, developerId });
      
      this.apiService.deleteAssignment(projectId, developerId).subscribe({
        next: (response) => {
          console.log('✅ Eliminación exitosa:', response);
          this.notificationService.show('success', 'Asignación removida', 'Desarrollador removido del proyecto');
          
          setTimeout(() => {
            this.loadAssignments(projectId);
          });
        },
        error: (error) => {
          console.error('❌ Error eliminando asignación:', error);
          this.notificationService.show('error', 'Error', 'No se pudo remover la asignación');
        }
      });
    }
  }
}

  
loadAssignments(projectId: number) {
  this.apiService.getProjectAssignments(projectId).subscribe({
    next: (assignments) => {
      console.log('📋 Datos crudos del backend:', assignments);
      
      const normalizedAssignments = assignments.map((assignment: any) => {
        return {
          developerId: assignment.developer_id || assignment.developerId,
          fullName: assignment.full_name || assignment.fullName,
          email: assignment.email,
          seniority: assignment.seniority,
          role: assignment.role,
          weeklyHours: assignment.weekly_hours || assignment.weeklyHours,
          assignmentDate: assignment.assignment_date || assignment.assignmentDate
        };
      });
      
      console.log('📋 Datos normalizados:', normalizedAssignments);
      this.assignments.set(normalizedAssignments);
    },
    error: (error) => {
      console.error('Error loading assignments:', error);
    }
  });
}

getWeeklyHours(assignment: any): number {
  return assignment.weeklyHours || assignment.weekly_hours || 0;
}

getAssignmentDate(assignment: any): string {
  return assignment.assignmentDate || assignment.assignment_date || new Date().toISOString().split('T')[0];
}

getFullName(assignment: any): string {
  return assignment.fullName || assignment.full_name || 'Nombre no disponible';
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

  getSeniorityLabel(seniority: string): string {
    const seniorityMap: { [key: string]: string } = {
      'JR': 'Junior',
      'SSR': 'Semi-Senior',
      'SR': 'Senior'
    };
    return seniorityMap[seniority] || seniority;
  }

  goBack() {
    this.router.navigate(['/proyectos']);
  }
}
