import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Audio, Gesture } from "../models/models";

@Injectable({
  providedIn: 'root'
})
export class GesturesService {
  apiUrl = "https://gesture-soundboard.vercel.app/"

  constructor(private http: HttpClient) {
  }
  public addGesture(username : string, audio_file: string, gesture : string) {
    var fd = new FormData()
    fd.append('audio_name',audio_file)
    fd.append('gesture', gesture)
    return this.http.post<Gesture>(
      `${this.apiUrl}gesture/${username}/create`, fd
    )
  }

  public updateGesture(username: string, audio_file: string, gesture: string) {
    var fd = new FormData()
    fd.append('audio_name',audio_file)
    fd.append('gesture', gesture)
    return this.http.put<Gesture>(
      `${this.apiUrl}gesture/${username}/update`, fd
    )
  }

  public getGestures(username : string){
    return this.http.get<Gesture[]>(
      `${this.apiUrl}gesture/${username}/all`
    )
  }

  public deleteGesture(username : string, gesture : string){
    return this.http.delete(
      `${this.apiUrl}gesture/${username}/${gesture}/delete`
    )
  }

  public addAudio(username : string,audio_name : string, audio_file: any){
    var fd = new FormData()
    fd.append('audio',audio_file)
    fd.append('audio_name', audio_name)
    return this.http.post<Audio>(
      `${this.apiUrl}gesture/audio/${username}/create`, fd
    )
  }

  public getAudios(username : string) {
    return this.http.get<Audio[]>(
        `${this.apiUrl}gesture/audio/${username}`
    )
  }

  public deleteAudio(username : string, audio_name : string){
    return this.http.delete(
        `${this.apiUrl}gesture/audio/${username}/${audio_name}/delete`
    )
  }
}
