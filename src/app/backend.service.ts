import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  login(mail:string, password:string) {
   return this.http.post("http://localhost:3001/auth/login", {email: mail, password: password});
  }

  getProjectList() {
    let token = "Bearer " + this.cookieService.get('token');
    console.log(token)
    return this.http.get("https://jsonplaceholder.typicode.com/posts/1/comments", {headers: new HttpHeaders({'authorization' : token})})
  }
}
