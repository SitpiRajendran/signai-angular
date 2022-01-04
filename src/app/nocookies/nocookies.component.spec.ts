import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NocookiesComponent } from './nocookies.component';

describe('NocookiesComponent', () => {
  let component: NocookiesComponent;
  let fixture: ComponentFixture<NocookiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NocookiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NocookiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
