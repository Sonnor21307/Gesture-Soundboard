import { Component, ElementRef, ViewChild } from '@angular/core';
import { Camera } from '@mediapipe/camera_utils';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'
import { Gesture } from '../../models/models';
import { AudioService } from '../../services/audio.service';
import { GesturesService } from '../../services/gestures.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recognizer',
  standalone: true,
  imports: [],
  templateUrl: './recognizer.component.html',
  styleUrl: './recognizer.component.css'
})
export class RecognizerComponent {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  private camera!: Camera;
  private gestureRecognizer!: GestureRecognizer;
  cameraOn = false;
  gestures: Gesture[] = [];

  constructor(private gestureService: GesturesService, private audioService: AudioService, private authService: AuthService) {}


  landmarkNames = [
    "palmBase", "thumbStart", "thumbMid1", "thumbMid2", "thumbTip",
    "indexStart", "indexMid1", "indexMid2", "indexTip",
    "middleStart", "middleMid1", "middleMid2", "middleTip",
    "ringStart", "ringMid1", "ringMid2", "ringTip",
    "pinkyStart", "pinkyMid1", "pinkyMid2", "pinkyTip"
  ];

  ngOnInit(): void {
    const username = this.authService.getUsername();
    if (!username) return;

    this.initMediaPipe();

    this.gestureService.getGestures(username).subscribe(response => {
      this.gestures = response;
      console.log(response);
    }, error => {
      console.error('Failed to get gestures', error);
    });
  }

  private async initMediaPipe() {
    const vision = await FilesetResolver.forVisionTasks(
      // path/to/wasm/root
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
     this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task"
      },
      numHands: 2,
      runningMode: 'IMAGE',

    });
  }

  toggle() {
    console.log('toggle');
    if (this.cameraOn) {
      this.videoElement.nativeElement.srcObject = null;
      this.cameraOn = false;
    } else {
      this.initCamera();
    }
  }



  isThumbsUpHorizontal(landmarks: { x: number; y: number; z: number }[], handedness : any): boolean {
    if (!landmarks || landmarks.length < 21) return false;

    const hand_position = handedness[0][0].categoryName

    const thumbStart = landmarks[1];
    const thumbTip = landmarks[4];

    const thumbHorizontal =
      Math.abs(thumbTip.y - thumbStart.y) < 0.2;

    var thumbExtended = false
    var fingersCurled = true

    var fingers = this.getFingerMap(landmarks, hand_position)
    if(fingers.get("thumb") == "extended") thumbExtended = true
    if(fingers.get("index") != "folded") fingersCurled = false
    if(fingers.get("middle") != "folded") fingersCurled = false
    if(fingers.get("ring") != "folded") fingersCurled = false
    if(fingers.get("pinky") != "folded") fingersCurled = false

    return thumbExtended && thumbHorizontal && fingersCurled;
  }

  getFingerMap(landmarks: { x: number; y: number; z: number }[], handedness : string): Map<string,string> {
    const fingers = new Map<string,string>()
    fingers.set("thumb", this.isThumbFolded(landmarks.slice(1,5), handedness))
    fingers.set("index", this.fingerFolded(landmarks[6].y, landmarks[8].y))
    fingers.set("middle", this.fingerFolded(landmarks[10].y, landmarks[12].y))
    fingers.set("ring", this.fingerFolded(landmarks[14].y, landmarks[16].y))
    fingers.set("pinky", this.fingerFolded(landmarks[18].y, landmarks[20].y))
    console.log(fingers)
    return fingers
  }

  isThumbFolded(landmarks: { x: number; y: number; z: number }[], handedness : string): string {
    if(handedness == "Right"){
      if(
      landmarks[3].x < landmarks[2].x &&
      landmarks[2].x < landmarks[1].x &&
      landmarks[1].x < landmarks[0].x)
      {
        return "folded"
      }else{
        return "extended"
      }
    }else{
      if(
      landmarks[3].x > landmarks[2].x &&
      landmarks[2].x > landmarks[1].x &&
      landmarks[1].x > landmarks[0].x)
      {
        return "folded"
      }else{
        return "extended"
      }
    }

  }

  fingerFolded(knuckle: number, tip: number): string{
    if(tip < knuckle) return "extended"
    return "folded"
  }


lastProcessedTime = 0;
lastGesture = "none";
debounceTime = 1000;
lastPlayTime = 0;
currentPlayingGesture = "none";

private async initCamera() {
  this.camera = new Camera(this.videoElement.nativeElement, {
    onFrame: async () => {
      const now = performance.now();
      if (now - this.lastProcessedTime >= this.debounceTime) {
        this.lastProcessedTime = now;
        const gestureRecognitionResult = this.gestureRecognizer.recognize(this.videoElement.nativeElement);
        let gestureFound = false;
        let newGesture = "none";

        for (let gesture of gestureRecognitionResult.gestures) {
          if (gesture[0].score > 0.5 && gesture[0].categoryName !== "None") {
            console.log(gesture[0].categoryName);
            gestureFound = true;
            newGesture = gesture[0].categoryName;
            break;
          }
        }

        if (!gestureFound && gestureRecognitionResult.landmarks.length > 0) {
          if (this.isThumbsUpHorizontal(gestureRecognitionResult.landmarks[0], gestureRecognitionResult.handedness)) {
            newGesture = 'Horizontal_Thumbs_Up';
          }
        }

        if (newGesture !== this.lastGesture) {
          if (newGesture === "none") {
            this.audioService.pauseAudio();
            this.currentPlayingGesture = "none";
          } else {
            const gestureAudio = this.gestures.find(g => g.gesture === newGesture);
            if (gestureAudio) {
              this.audioService.playAudio(gestureAudio.url);
              this.currentPlayingGesture = newGesture;
            }
          }
          console.log('Gesture changed:', this.lastGesture, '->', newGesture);
          this.lastGesture = newGesture;
        }
      }
    },
  });

  this.camera.start();
  this.cameraOn = true;

  this.audioService.onAudioEnded(() => {
    if (this.currentPlayingGesture !== "none" && this.currentPlayingGesture === this.lastGesture) {
      const gestureAudio = this.gestures.find(g => g.gesture === this.currentPlayingGesture);
      if (gestureAudio) {
        this.audioService.playAudio(gestureAudio.url);
      }
    }
  });
}



}
