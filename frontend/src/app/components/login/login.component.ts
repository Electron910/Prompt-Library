import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitting = false;
  error: string | null = null;
  returnUrl = '/add-prompt';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/add-prompt';

    if (this.authService.isAuthenticated) {
      this.router.navigate([this.returnUrl]);
    }

    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  get username(): FormControl { return this.loginForm.get('username') as FormControl; }
  get password(): FormControl { return this.loginForm.get('password') as FormControl; }

  isFieldInvalid(control: FormControl): boolean {
    return control.invalid && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate([this.returnUrl]);
      },
      error: err => {
        this.submitting = false;
        this.error = err.error?.error ?? 'Login failed. Please try again.';
      },
    });
  }
}