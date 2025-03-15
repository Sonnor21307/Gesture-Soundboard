import { Component } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

  constructor(private fb: FormBuilder) {}

  audios: Audio[] = [];
  gestures: GestureInfo[]  = [
    {
      gesture: "OpenPalm",
      audio: "Fart",
    }
  ];

  ngOnInit() {
    this.createForm();
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
    if (this.uploadForm.valid) {
      const formData = new FormData();
      formData.append('name', this.uploadForm.value.name);
      formData.append('audioFile', this.uploadForm.value.audioFile);
      console.log(formData);
      // this.uploadService.uploadAudio(formData).subscribe(response => {
      //   console.log('Upload successful', response);
      // }, error => {
      //   console.error('Upload failed', error);
      // });
    }
  }
}
