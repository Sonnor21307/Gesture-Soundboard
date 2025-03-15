import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GesturesService {
  apiUrl = "https://gesture-soundboard.vercel.app/"

  constructor(private http: HttpClient) {
  }

  public register(username: string, password: string) {
    console.log(username, password, this.apiUrl);
    return this.http.post(
      `${this.apiUrl}accounts/create`,
      {"username": username, "password": password}
    )
  }

  public addGesture(username : string, audio_file: any){
    var fd = new FormData()
    fd.append('audio',audio_file)

    return this.http.post<string>(
      `${this.apiUrl}gesture/${username}/create`, fd
    )
  }

  public getGesture(username : string, gesture : string)

}
