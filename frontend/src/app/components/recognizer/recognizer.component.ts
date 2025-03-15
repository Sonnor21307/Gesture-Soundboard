import { Component, ElementRef, ViewChild } from '@angular/core';
import { Camera } from '@mediapipe/camera_utils';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision'

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
  recognizedGesture = "none";

  landmarkNames = [
    "palmBase", "thumbStart", "thumbMid1", "thumbMid2", "thumbTip",
    "indexStart", "indexMid1", "indexMid2", "indexTip",
    "middleStart", "middleMid1", "middleMid2", "middleTip",
    "ringStart", "ringMid1", "ringMid2", "ringTip",
    "pinkyStart", "pinkyMid1", "pinkyMid2", "pinkyTip"
  ];

  ngOnInit(): void {
    this.initMediaPipe();
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
  debounceTime = 1000;
  private async initCamera() {
    this.camera = new Camera(this.videoElement.nativeElement, {
      onFrame: async () => {
        const now = performance.now();
        if (now - this.lastProcessedTime >= this.debounceTime) {
          this.lastProcessedTime = now;
          const gestureRecognitionResult = this.gestureRecognizer.recognize(this.videoElement.nativeElement);
          let gestureFound = false;

          for (let gesture of gestureRecognitionResult.gestures) {
            if (gesture[0].score > 0.5 && gesture[0].categoryName != "None") {
              console.log(gesture[0].categoryName)
              gestureFound = true;
              this.recognizedGesture = gesture[0].categoryName;
            }
          }

          if (!gestureFound && gestureRecognitionResult.landmarks.length > 0) {
            this.recognizedGesture = "none";
            const truncatedLandmarks = gestureRecognitionResult.landmarks[0].map((landmark, index) => ({
              part: this.landmarkNames[index],
              x: parseFloat(landmark.x.toFixed(2)),
              y: parseFloat(landmark.y.toFixed(2)),
              z: parseFloat(landmark.z.toFixed(2))
            }));

            // console.log(truncatedLandmarks[8].y, truncatedLandmarks[0].y)
            // console.log(truncatedLandmarks);

            if (this.isThumbsUpHorizontal(gestureRecognitionResult.landmarks[0], gestureRecognitionResult.handedness)) {
              this.recognizedGesture = 'horizontal thumbs up';
            }
            // console.log(this.isThumbsUpHorizontal(gestureRecognitionResult.landmarks[0]))
          } else {
            console.log("what happened");
            // try faster again
            this.lastProcessedTime = 0;
          }

        }
      },
    });

    this.camera.start();
    this.cameraOn = true;
  }


}
