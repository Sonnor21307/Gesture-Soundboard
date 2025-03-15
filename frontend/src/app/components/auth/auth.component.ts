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
  authForm!: FormGroup;

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
      console.log('Logging in:', { username, password });
      // this.authService.loginUser({ username, password }).subscribe(
      //   (response) => {
          
      //     localStorage.setItem('access_token', response.access);
      //     localStorage.setItem('refresh_token', response.refresh);
      //     localStorage.setItem('username', username); 

      //     console.log('Login successful');
      //     this.router.navigate(['/profile']);
      //     window.location.reload();

      //   },
      //   (error) => {
      //     // TODO: display incorrect credentials notification
      //     console.error('Login failed', error);
      //   }
      // );
    } else {
      console.log('Signing up:', { username, password });
      // this.authService.registerUser({ username, password }).subscribe(
      //   (response) => {
      //     console.log('Registration successful', response);
      //     alert('Registration successful!');
      //     this.toggleAuth();
      //   },
      //   (error) => {
      //     alert('Registration failed. Check console for errors.');
      //     console.error('Registration failed', error);
      //   }
      // );
    }
  }
}
