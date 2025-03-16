import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio = new Audio();
  private onEndedCallback: (() => void) | null = null;

  constructor() {
    this.audio.addEventListener('ended', () => {
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });
  }

  playAudio(url: string) {
    if (this.audio.src !== url) {
      this.audio.src = url;
      this.audio.load();
    }
    this.audio.play().catch(error => console.error('Playback error:', error));
  }

  pauseAudio() {
    this.audio.pause();
  }

  onAudioEnded(callback: () => void) {
    this.onEndedCallback = callback;
  }
}
