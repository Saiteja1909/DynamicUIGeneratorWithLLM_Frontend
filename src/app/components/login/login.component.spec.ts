import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [HttpClientTestingModule, RouterTestingModule, FormsModule],
      providers: [AuthService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.stub(); // Mock the navigate method
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable login button when form is invalid', () => {
    component.email = ''; // invalid state
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTruthy();
  });

  it('should call login on submit with valid data', fakeAsync(() => {
    let spy = spyOn(authService, 'login').and.returnValue(of(true));
    component.email = 'test@example.com';
    component.password = '123456';
    component.onSubmit();
    tick(); // Simulate passage of time
    expect(spy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));
});
