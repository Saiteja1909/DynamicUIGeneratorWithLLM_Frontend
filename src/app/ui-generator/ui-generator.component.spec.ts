import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiGeneratorComponent } from './ui-generator.component';

describe('UiGeneratorComponent', () => {
  let component: UiGeneratorComponent;
  let fixture: ComponentFixture<UiGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UiGeneratorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
