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



  isThumbsUpHorizontal(landmarks: { x: number; y: number; z: number }[]): boolean {
    if (!landmarks || landmarks.length < 21) return false;


    const thumbBase = landmarks[0];
    const thumbStart = landmarks[1];
    const thumbMid1 = landmarks[2];
    const thumbMid2 = landmarks[3];
    const thumbTip = landmarks[4];

    const indexJoint1 = landmarks[6]
    const middleJoint1 = landmarks[10]
    const ringJoint1 = landmarks[14]
    const pinkyJoint1 = landmarks[18]

    const indexKnuckle = landmarks[5]
    const middleKnuckle = landmarks[9]
    const ringKnuckle = landmarks[13]
    const pinkyKnuckle = landmarks[17]

    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const thumbExtended =
      thumbTip.x < thumbMid2.x &&
      thumbMid2.x < thumbMid1.x &&
      thumbMid1.x < thumbStart.x;

    const thumbHorizontal =
      Math.abs(thumbTip.y - thumbStart.y) < 0.2;

    // check if first joint is lower than second knuckle
    const fingersCurled =
        indexJoint1.y > indexKnuckle.y &&
        middleJoint1.y > middleKnuckle.y &&
        ringJoint1.y > ringKnuckle.y &&
        pinkyJoint1.y > pinkyKnuckle.y

    return thumbExtended && thumbHorizontal && fingersCurled;
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

            if (this.isThumbsUpHorizontal(gestureRecognitionResult.landmarks[0])) {
              this.recognizedGesture = 'horizontal thumbs up';
            }
            console.log(this.isThumbsUpHorizontal(gestureRecognitionResult.landmarks[0]))
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
