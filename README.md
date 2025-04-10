# Gesture-Controlled Soundboard

[**Devpost Link**](https://devpost.com/software/gesture-controlled-soundboard?ref_content=my-projects-tab&ref_feature=my_projects)  
[**Deployed Project**](https://gesture-soundboard-dusky.vercel.app/)

## Inspiration
We wanted a way for us to play sounds without having to tab out of our current browser or application.

## What It Does
Uses MediaPipe's hand gesture recognition model to analyze video from the webcam, determine hand gestures, and then play corresponding audio files. Allows users to sign up, log in, upload audio files, and customize their gestures to their own liking.

## How We Built It
- **Frontend:** Angular (with Capacitor for Mobile)
- **Backend:** Django
- **Database:** MongoDB to hold user information
- **Storage:** Google Cloud to store audio files

## Challenges We Ran Into
- Hosting frontend on Vercel  
- Working with `hand_landmarks` in MediaPipe to build custom gestures  
- Deploying on mobile  

## Accomplishments That We're Proud Of
- Deploying  
- Working with MP3 files  
- Dipping our toes into hardware  

## What We Learned
- Working with MP3 files  
- Working with video/images  
- Integrating Google Cloud  
- Using Capacitor  

## What's Next for Gesture Controlled Soundboard
- Expanding on custom hand gestures  
- Double hand gestures  
- Combination gestures  
- Implementing face landmarks to expand user control of the soundboard  

## Screenshots

<img width="1792" alt="original" src="https://github.com/user-attachments/assets/f866a523-521d-4ff7-9c22-4f933c81da65" />
<img width="1717" alt="original (1)" src="https://github.com/user-attachments/assets/3761a5f0-abff-4304-87a7-ce4eb9be27af" />
