import { Component } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GesturesService } from '../../services/gestures.service';
import { AuthService } from '../../services/auth.service';

interface GestureInfo {
  gesture: string,
  audio: string,
}

interface Audio {
  name: string,
  link: string,
}

@Component({
  selector: 'app-gesture-editor',
  standalone: true,
  imports: [ModalComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './gesture-editor.component.html',
  styleUrl: './gesture-editor.component.css'
})
export class GestureEditorComponent {
  uploadAudioModalOpen = false;
  uploadForm!: FormGroup;

  constructor(private fb: FormBuilder, private gestureService: GesturesService, private authService: AuthService) {}

  audios: Audio[] = [];
  gestures: GestureInfo[]  = [
    {
      gesture: "OpenPalm",
      audio: "Fart",
    }
  ];

  ngOnInit() {
    const username = this.authService.getUsername();
    if (!username) {
      console.log("no user");
      return;
    }

    this.createForm();
    this.gestureService.getAudios(username).subscribe(response => {
      console.log('Got', response);
    }, error => {
      console.error('Failed to get audios', error);
    });
  }

  private createForm() {
    this.uploadForm = this.fb.group(
      {
        name: ['', [Validators.required]],
        audioFile: [null, [Validators.required]],
      },
    );
  }


  get username() {
    return this.uploadForm.get('name');
  }

  get usernameInvalid() {
    const control = this.uploadForm.get('name');
    return control && control.invalid && (control.dirty || control.touched);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.uploadForm.patchValue({ audioFile: file });
      this.uploadForm.get('audioFile')?.updateValueAndValidity();
    }
  }  

  uploadAudio() {
    const username = this.authService.getUsername();
    if (!username) return;

    if (this.uploadForm.valid) {
      this.gestureService.addAudio(username, this.uploadForm.value.name, this.uploadForm.value.audioFile).subscribe(response => {
        console.log('Upload successful', response);
        alert("Upload successful!");
        window.location.reload();
      }, error => {
        console.error('Upload failed', error);
      });
    }
  }
}
