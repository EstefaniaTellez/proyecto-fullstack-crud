import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevelopersListComponent } from './developers-list.component';

describe('DevelopersListComponent', () => {
  let component: DevelopersListComponent;
  let fixture: ComponentFixture<DevelopersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevelopersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
