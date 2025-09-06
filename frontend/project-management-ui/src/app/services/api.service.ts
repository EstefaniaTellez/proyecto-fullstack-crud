import { Injectable, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { NotificationService } from './notification.service';
import { LoaderService } from './loader.service';

export interface Developer {
  developerId: number;
  fullName: string;
  email: string;
  seniority: string;
  isActive: boolean;
}

export interface Project {
  projectId: number;
  name: string;
  client: string;
  startDate: string;
  endDate: string;
  status: string;
  isDeleted: boolean;
}

export interface AssignmentInfo {
  developerId: number;
  fullName: string;
  email: string;
  seniority: string;
  role: string;
  weeklyHours?: number;      
  weekly_hours?: number;    
  assignmentDate?: string;  
  assignment_date?: string; 
  [key: string]: any;
}

export interface Assignment {
  projectId: number;
  developerId: number;
  role: string;
  weeklyHours: number;
  assignmentDate: string;
  isDeleted?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private notificationService = inject(NotificationService);
  private loaderService = inject(LoaderService);
  private apiUrl = 'http://localhost:5261/api';

  // Effect para monitoreo y analytics
  private requestCounter = 0;

  constructor() {
    // Effect para monitorear actividad de la API
    effect(() => {
      const currentLoaderState = this.loaderService.loading;
      console.log('📊 ApiService - Loader state:', currentLoaderState);
      
      if (currentLoaderState) {
        console.log('🔄 Request en progreso...');
      }
    });

    // Effect para analytics de uso
    effect(() => {
      console.log('📈 Total requests realizadas:', this.requestCounter);
    });
  }

  // ==================== PROJECTS ====================
  getProjects(): Observable<Project[]> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.get<Project[]>(`${this.apiUrl}/Projects`).pipe(
      finalize(() => this.loaderService.hide())
    );
  }

  getProject(id: number): Observable<Project> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.get<Project>(`${this.apiUrl}/Projects/${id}`).pipe(
      finalize(() => this.loaderService.hide())
    );
  }

  createProject(project: Project): Observable<Project> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.post<Project>(`${this.apiUrl}/Projects`, project).pipe(
      finalize(() => {
        this.loaderService.hide();
        this.notificationService.show('success', 'Proyecto creado', 'El proyecto se creó correctamente');
      })
    );
  }

  updateProject(id: number, project: Project): Observable<any> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.put(`${this.apiUrl}/Projects/${id}`, project).pipe(
      finalize(() => {
        this.loaderService.hide();
        this.notificationService.show('success', 'Proyecto actualizado', 'El proyecto se actualizó correctamente');
      })
    );
  }

  deleteProject(id: number): Observable<any> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.delete(`${this.apiUrl}/Projects/${id}`).pipe(
      finalize(() => {
        this.loaderService.hide();
        this.notificationService.show('success', 'Proyecto eliminado', 'El proyecto se eliminó correctamente');
      })
    );
  }

  getProjectAssignments(projectId: number): Observable<AssignmentInfo[]> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.get<AssignmentInfo[]>(`${this.apiUrl}/Projects/${projectId}/assignments`).pipe(
      finalize(() => this.loaderService.hide())
    );
  }

  createAssignment(assignment: Assignment): Observable<any> {
  this.loaderService.show();
  console.log('🌐 Enviando POST a:', `${this.apiUrl}/Assignments`);
  console.log('🌐 Datos:', assignment);
  
  return this.http.post(`${this.apiUrl}/Assignments`, assignment).pipe(
    finalize(() => {
      this.loaderService.hide();
      this.notificationService.show('success', 'Asignación creada', 'Desarrollador asignado al proyecto');
    })
  );
}

deleteAssignment(projectId: number, developerId: number): Observable<any> {
  this.loaderService.show();
  console.log('🌐 Enviando DELETE a:', `${this.apiUrl}/Assignments/${projectId}/${developerId}`);
  
  return this.http.delete(`${this.apiUrl}/Assignments/${projectId}/${developerId}`).pipe(
    finalize(() => {
      this.loaderService.hide();
    })
  );
}



  // ==================== DEVELOPERS ====================
  getDevelopers(): Observable<Developer[]> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.get<Developer[]>(`${this.apiUrl}/Developers`).pipe(
      finalize(() => this.loaderService.hide())
    );
  }

  getDeveloper(id: number): Observable<Developer> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.get<Developer>(`${this.apiUrl}/Developers/${id}`).pipe(
      finalize(() => this.loaderService.hide())
    );
  }

  createDeveloper(developer: Developer): Observable<Developer> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.post<Developer>(`${this.apiUrl}/Developers`, developer).pipe(
      finalize(() => {
        this.loaderService.hide();
        this.notificationService.show('success', 'Desarrollador creado', 'El desarrollador se creó correctamente');
      })
    );
  }

  updateDeveloper(id: number, developer: Developer): Observable<any> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.put(`${this.apiUrl}/Developers/${id}`, developer).pipe(
      finalize(() => {
        this.loaderService.hide();
        this.notificationService.show('success', 'Desarrollador actualizado', 'El desarrollador se actualizó correctamente');
      })
    );
  }

  

  deleteDeveloper(id: number): Observable<any> {
    this.requestCounter++;
    this.loaderService.show();
    
    return this.http.delete(`${this.apiUrl}/Developers/${id}`).pipe(
      finalize(() => {
        this.loaderService.hide();
        this.notificationService.show('success', 'Desarrollador eliminado', 'El desarrollador se eliminó correctamente');
      })
    );
  }

  // ==================== UTILITY METHODS ====================
  getRequestCount(): number {
    return this.requestCounter;
  }

  resetRequestCounter(): void {
    this.requestCounter = 0;
    console.log('🔄 Contador de requests reiniciado');
  }

  // Effect para auto-log de errores (ejemplo avanzado)
  private setupErrorMonitoring() {
    effect((onCleanup) => {
      // Simulación: monitorear errores de red
      const errorHandler = (event: ErrorEvent) => {
        console.error('🌐 Error de red detectado:', event.error);
        this.notificationService.show('error', 'Error de conexión', 'Verifica tu conexión a internet');
      };

      window.addEventListener('error', errorHandler);
      
      // Cleanup function del effect
      onCleanup(() => {
        window.removeEventListener('error', errorHandler);
        console.log('🧹 Event listener de errores limpiado');
      });
    });
  }
}