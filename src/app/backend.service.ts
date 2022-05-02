import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(mail: string, password: string) {
    return this.http.post('http://localhost:3001/auth/login', {
      email: mail,
      password: password,
    });
  }

  getUserInfo() {
    let token = 'Bearer ' + this.cookieService.get('token');
    console.log(token);
    return this.http.get('http://localhost:3001/user/info/me', {
      headers: new HttpHeaders({ authorization: token }),
    });
  }

  getProjectList() {
    let token = 'Bearer ' + this.cookieService.get('token');
    return this.http.get('http://localhost:3001/project/list', {
      headers: new HttpHeaders({ authorization: token }),
    });
  }

  getProjectbyId(id: string) {
    let token = 'Bearer ' + this.cookieService.get('token');
    return this.http.get('http://localhost:3001/project?id=' + id, {
      headers: new HttpHeaders({ authorization: token }),
    });
  }

  getProjectListMyCompany(company: string) {
    let token = 'Bearer ' + this.cookieService.get('token');
    return this.http.get(
      'http://localhost:3001/project/list?company=' + company,
      { headers: new HttpHeaders({ authorization: token }) }
    );
  }


  createProject(name: string, description: string, departPositionLong: number, departPositionLat: number, departAddress: string, radius: number, contraints: Array<any>, company: string) {
    let token = 'Bearer ' + this.cookieService.get('token');
    return this.http.post('http://localhost:3001/project', {
      name: name,
      description: description,
      departPositionLong: departPositionLong,
      departPositionLat: departPositionLat,
      departAddress: departAddress,
      radius: radius,
      contraints: contraints,
      company: company,
    },{ headers: new HttpHeaders({ authorization: token }) });
  }



  getCoordinatesOSM(address: string, city: string, postalcode: string) {
    console.log(
      'https://nominatim.openstreetmap.org/search.php?street=' +
        address +
        '&city=' +
        city +
        '&format=json'
    );
    return this.http.get(
      'https://nominatim.openstreetmap.org/search.php?street=' +
        address +
        '&city=' +
        city +
        '&format=json'
    );
  }

}
