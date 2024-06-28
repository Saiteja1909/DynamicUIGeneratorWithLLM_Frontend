import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let httpMock: HttpTestingController;
  let dialog: MatDialog;
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeComponent ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        MatDialogModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        MatSnackBar,
        { provide: MatDialog, useValue: mockDialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load definitions on init', () => {
    const req = httpMock.expectOne(`${component.API_BASE_URL}/api/definitions`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Test Definition', code: '<p>Test</p>' }]);
    expect(component.definitions.length).toBe(1);
  });

  it('should handle API errors on definitions load', () => {
    const spy = spyOn(component, 'showError').and.callThrough();
    const req = httpMock.expectOne(`${component.API_BASE_URL}/api/definitions`);
    req.flush('Something went wrong', { status: 500, statusText: 'Server Error' });
    expect(spy).toHaveBeenCalledWith('Failed to fetch saved definitions: Server Error');
  });

  it('should call generate and display results', () => {
    let spy = spyOn(component, 'showError').and.callThrough();
    component.command = 'Generate something';
    component.generate();
    const req = httpMock.expectOne(`${component.API_BASE_URL}/api/ui-generation/generate-ui`);
    const expectedHtml = '<div>Generated Content</div>';
    req.flush({ uiComponentCode: expectedHtml });
    expect(component.generatedCode).toBeTruthy();
    expect(spy).not.toHaveBeenCalled();
  });
  
  it('should render generated content correctly', () => {
    component.generatedCode = sanitizer.bypassSecurityTrustHtml('<div>Generated Content</div>');
    fixture.detectChanges(); // Trigger change detection
    const contentElement = fixture.nativeElement.querySelector('div');
    expect(contentElement.innerHTML).toContain('Generated Content');
  });
  

  it('should display error if generation fails', () => {
    let spy = spyOn(component, 'showError').and.callThrough();
    component.command = 'Generate something';
    component.generate();
    const req = httpMock.expectOne(`${component.API_BASE_URL}/api/ui-generation/generate-ui`);
    req.flush('Error', { status: 400, statusText: 'Bad Request' });
    expect(spy).toHaveBeenCalledWith('Failed to generate UI component: Bad Request');
  });

  it('should open dialog on delete and call API if confirmed', fakeAsync(() => {
    const mockDialogRef = {
      afterClosed: () => of(true) // Simulating user clicking 'Delete' in the dialog
    };
    spyOn(dialog, 'open').and.returnValue(mockDialogRef as any);
    spyOn(component, 'fetchDefinitions').and.callThrough();

    component.deleteDefinition('123', 'Test Def');
    tick();
    expect(dialog.open).toHaveBeenCalled();
    const req = httpMock.expectOne(`${component.API_BASE_URL}/api/definitions/123`);
    req.flush(null); // Simulate successful delete
    expect(component.fetchDefinitions).toHaveBeenCalled();
  }));
});

// Mocks
const mockDialog = {
  open: () => {
    return {
      afterClosed: () => of(true) // Always simulate 'confirm'
    };
  }
};
