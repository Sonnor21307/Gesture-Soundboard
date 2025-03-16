import { Component } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GesturesService } from '../../services/gestures.service';
import { AuthService } from '../../services/auth.service';
import  { Audio, Gesture } from '../../models/models'
import { AudioService } from '../../services/audio.service';


@Component({
  selector: 'app-gesture-editor',
  standalone: true,
  imports: [ModalComponent, ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './gesture-editor.component.html',
  styleUrl: './gesture-editor.component.css'
})
export class GestureEditorComponent {
  uploadAudioModalOpen = false;
  uploadForm!: FormGroup;

  constructor(private fb: FormBuilder, private gestureService: GesturesService, private authService: AuthService, private audioService: AudioService) {}

  audios: Audio[] = [];
  gestures: Gesture[]  = [];
  possibleGestures = [
    "Closed_Fist",
    "ILoveYou",
    "Open_Palm",
    "Pointing_Up",
    "Thumb_Down",
    "Thumb_Up",
    "Victory",
    "Horizontal_Thumbs_Up"
  ]

  updateGestureAudio(event: Event, gestureInfo: Gesture) {
    const username = this.authService.getUsername();
    if (!username) return;

    const target = event.target as HTMLSelectElement;
    const selectedAudio = target.value;
    console.log('Selected audio:', selectedAudio);
    console.log('Gesture Info:', gestureInfo);
  
    if (selectedAudio === "") {
      this.gestureService.deleteGesture(username, gestureInfo.gesture).subscribe(response => {
        console.log('Deleted', response);
        this.fetchGestures();
      }, error => {
        alert('Failed to delete gesture, check console for more information.');
        console.error('Failed to delete gesture', error);
      });
    } else {
      let oldValue: string | undefined = undefined;
      let existingObject: Gesture;
      for (const existingGesture of this.gestures) {
        if (existingGesture.gesture === gestureInfo.gesture) {
          oldValue = existingGesture.audio_name;
          existingObject = existingGesture;
        }
      }

      if (oldValue !== undefined && oldValue.length > 0) {
        this.gestureService.updateGesture(username, selectedAudio, gestureInfo.gesture).subscribe(response => {
          console.log('Updated', response);
          existingObject.gesture = gestureInfo.gesture;
        }, error => {
          alert('Failed to update gesture, check console for more information.');
          console.error('Failed to update gesture', error);
        });
      } else {
        this.gestureService.addGesture(username, selectedAudio, gestureInfo.gesture).subscribe(response => {
          console.log('Added', response);
          this.fetchGestures();
        }, error => {
          alert('Failed to add gesture audio, check console for more information.');
          console.error('Failed to add gesture', error);
        });
      }
      

    }
    
    
  }
  

  playAudio(url: string) {
    this.audioService.playAudio(url);
  }

  fetchGestures() {
    const username = this.authService.getUsername();
    if (!username) return;

    this.gestureService.getGestures(username).subscribe(response => {
      this.gestures = response;
      console.log(response);

      // add missing gestures
      for (const gesture of this.possibleGestures) {
        let found = false;

        for (const gestureInfo of this.gestures) {
          if (gestureInfo.gesture === gesture) {
            found = true;
          }
        }

        if (!found) {
          this.gestures.push({
            gesture: gesture,
            url: '',
            audio_name: '',
          })
        }
      }
    }, error => {
      console.error('Failed to get gestures', error);
    });
  }

  ngOnInit() {
    const username = this.authService.getUsername();
    if (!username) {
      console.log("no user");
      return;
    }

    this.createForm();
    this.gestureService.getAudios(username).subscribe(response => {
      this.audios = response;
      console.log('Got', response);
    }, error => {
      console.error('Failed to get audios', error);
    });

    this.fetchGestures();
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
