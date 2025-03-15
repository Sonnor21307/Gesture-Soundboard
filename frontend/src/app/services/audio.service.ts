import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio = new Audio();

  playAudio(url: string) {
    this.audio.src = url;
    this.audio.load();
    this.audio.play().catch(error => console.error('Playback error:', error));
  }

  pauseAudio() {
    this.audio.pause();
  }
}
