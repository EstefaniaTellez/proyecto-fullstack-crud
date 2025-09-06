import { Component, effect } from '@angular/core'; // ← Agregar effect import
import { RouterModule, Router } from '@angular/router';
import { ToastComponent } from './components/toast/toast.component';
import { NotificationService } from './services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, ToastComponent],
  template: `
    <nav style="
  background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
  padding: 1.25rem 2rem;
  color: white;
  margin-bottom: 2rem;
  border-radius: 0px;
  box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.1), 0 10px 10px -5px rgba(59, 130, 246, 0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  overflow: hidden;
">
  <!-- Efecto de brillo sutil -->
  <div style="
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
    pointer-events: none;
  "></div>

  <span style="
    font-weight: 700;
    font-size: 1.9rem;
    margin-right: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 2;
    position: relative;
  ">
    <span style="font-size: 1.5rem;">🚀</span>
    Gestión de Proyectos
  </span>
  
  <div style="display: flex; gap: 1rem; z-index: 2; position: relative;">
    <button (click)="navigateTo('proyectos')" 
            style="
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: white;
              padding: 0.75rem 1.5rem;
              margin: 0;
              border-radius: 12px;
              font-weight: 600;
              font-size: 1rem;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
              overflow: hidden;
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(0, 0, 0, 0.1)'; this.style.borderColor='rgba(255, 255, 255, 0.4)'; this.style.background='rgba(255, 255, 255, 0.15)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'; this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.background='rgba(255, 255, 255, 0.1)';">
      <span style="font-size: 1.1rem;">📋</span>
      Proyectos
    </button>
    
    <button (click)="navigateTo('desarrolladores')" 
            style="
              background: rgba(255, 255, 255, 0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: white;
              padding: 0.75rem 1.5rem;
              margin: 0;
              border-radius: 12px;
              font-weight: 600;
              font-size: 0.875rem;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              position: relative;
              overflow: hidden;
            "
            onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(0, 0, 0, 0.1)'; this.style.borderColor='rgba(255, 255, 255, 0.4)'; this.style.background='rgba(255, 255, 255, 0.15)';"
            onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'; this.style.borderColor='rgba(255, 255, 255, 0.2)'; this.style.background='rgba(255, 255, 255, 0.1)';">
      <span style="font-size: 1.1rem;">👥</span>
      Desarrolladores
    </button>
  </div>
</nav>

    <div style="padding: 0 2rem;">
      <router-outlet></router-outlet>
    </div>

    <app-toast></app-toast>
  `
})
export class AppComponent {
  constructor(private router: Router, private notificationService: NotificationService) {
    // Effect para demo automática - CORREGIDO con import
    effect(() => {
      console.log('🏠 AppComponent effect ejecutado');
    });

    // Test inicial con delay
    setTimeout(() => {
      this.notificationService.show('success', '¡Effects Activados!', 'Angular Signals y Effects funcionando');
    }, 1000);
  }


  navigateTo(route: string) {
    this.router.navigate([`/${route}`]);
  }
}