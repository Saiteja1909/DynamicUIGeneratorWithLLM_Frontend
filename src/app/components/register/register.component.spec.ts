import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterComponent ],
      imports: [HttpClientTestingModule, RouterTestingModule, FormsModule],
      providers: [AuthService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.stub(); // Mock the navigate method
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable register button when form is invalid', () => {
    component.email = ''; // invalid state
    component.username = ''; // also invalid due to empty username
    component.password = ''; // also invalid due to empty password
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTruthy();
  });

  it('should call register on submit with valid data', fakeAsync(() => {
    let spy = spyOn(authService, 'register').and.returnValue(of(true));
    component.username = 'newuser';
    component.email = 'new@example.com';
    component.password = 'password';
    component.onSubmit();
    tick(); // Simulate passage of time
    expect(spy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  }));
});
