import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapViewResultsComponent } from './map-view-results.component';

describe('MapViewResultsComponent', () => {
  let component: MapViewResultsComponent;
  let fixture: ComponentFixture<MapViewResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapViewResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapViewResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
