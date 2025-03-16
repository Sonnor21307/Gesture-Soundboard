import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  isLogin = true;
  loggedIn = false;
  authForm!: FormGroup;

  ngOnInit() {
    this.loggedIn = this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
  }

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.createForm();
  }

  private createForm() {
    this.authForm = this.fb.group(
      {
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(3)]],
      },
    );
  }

  get username() {
    return this.authForm.get('username');
  }
  get password() {
    return this.authForm.get('password');
  }

  get usernameInvalid() {
    const control = this.authForm.get('username');
    return control && control.invalid && (control.dirty || control.touched);
  }

  get passwordInvalid() {
    const control = this.authForm.get('password');
    return control && control.invalid && (control.dirty || control.touched);
  }


  toggleAuth() {
    this.isLogin = !this.isLogin;

    // if (this.isLogin) {
    //   this.email?.clearValidators();
    // } else {
    //   this.email?.setValidators([Validators.required, Validators.email]);
    // }

    // this.email?.updateValueAndValidity();
    this.authForm.reset();
  }

  onSubmit() {
    if (this.authForm.invalid) {
      console.log('Form is invalid');
      // (Optional) log current errors for debugging:
      console.log(this.authForm.errors, this.authForm.value);
      return;
    }

    const { username, password } = this.authForm.value;

    if (this.isLogin) {
      this.authService.login(username, password).subscribe(
        (response) => {
          localStorage.setItem('username', username); 
          console.log('Login successful');
          window.location.reload();
        },
        (error) => {
          alert('Your username or password is incorrect.');
          console.error('Login failed', error);
        }
      );
    } else {
      this.authService.register(username, password).subscribe(
        (response) => {
          console.log('Registration successful', response);
          alert('Registration successful!');
          this.toggleAuth();
        },
        (error) => {
          alert('Username is already in use.');
          console.error('Registration failed', error);
        }
      );
    }
  }
}
