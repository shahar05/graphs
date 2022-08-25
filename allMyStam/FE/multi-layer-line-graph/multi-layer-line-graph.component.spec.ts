import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiLayerLineGraphComponent } from './multi-layer-line-graph.component';

describe('MultiLayerLineGraphComponent', () => {
  let component: MultiLayerLineGraphComponent;
  let fixture: ComponentFixture<MultiLayerLineGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiLayerLineGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiLayerLineGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
