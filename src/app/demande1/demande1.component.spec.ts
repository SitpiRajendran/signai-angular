import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Demande1Component } from './demande1.component';

describe('Demande1Component', () => {
  let component: Demande1Component;
  let fixture: ComponentFixture<Demande1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Demande1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Demande1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
