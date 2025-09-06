import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'proyectos', pathMatch: 'full' },
  { 
    path: 'proyectos', 
    loadComponent: () => import('./components/projects-list/projects-list.component').then(m => m.ProjectsListComponent)
  },
  { 
    path: 'proyectos/nuevo',
    loadComponent: () => import('./components/project-form/project-form.component').then(m => m.ProjectFormComponent)
  },
  { 
    path: 'proyectos/:id', 
    loadComponent: () => import('./components/project-form/project-form.component').then(m => m.ProjectFormComponent)
  },
  { 
    path: 'proyectos/:id/asignaciones',
    loadComponent: () => import('./components/assignment-form/assignment-form.component').then(m => m.AssignmentFormComponent)
  },
  { 
    path: 'desarrolladores', 
    loadComponent: () => import('./components/developers-list/developers-list.component').then(m => m.DevelopersListComponent)
  },
  { 
    path: 'desarrolladores/nuevo',
    loadComponent: () => import('./components/developer-form/developer-form.component').then(m => m.DeveloperFormComponent)
  },
  { 
    path: 'desarrolladores/:id', 
    loadComponent: () => import('./components/developer-form/developer-form.component').then(m => m.DeveloperFormComponent)
  }
];