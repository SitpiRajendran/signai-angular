import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Demande2Component } from './demande2.component';

describe('Demande2Component', () => {
  let component: Demande2Component;
  let fixture: ComponentFixture<Demande2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Demande2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Demande2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
