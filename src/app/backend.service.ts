import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
    providedIn: 'root',
})


export class BackendService {

    public BACKEND_URL = "https://backend.signai.fr";
    //public BACKEND_URL = "https://167.172.100.15";
    //public BACKEND_URL = "http://localhost:3001"
    constructor(private http: HttpClient, private cookieService: CookieService) { }

    register(mail: string, password: string, firstname: string, name: string, phone: string) {
        return this.http.post(this.BACKEND_URL + '/auth/register', {
            email: mail,
            password: password,
            firstname: firstname,
            name: name,
            type: "manager",
            phone: phone,
            company: "TestCompany",
        });
    }

    login(mail: string, password: string) {
        return this.http.post(this.BACKEND_URL + '/auth/login', {
            email: mail,
            password: password,
        });
    }

    getUserInfo() {
        let token = 'Bearer ' + this.cookieService.get('token');
        console.log(token);
        return this.http.get(this.BACKEND_URL + '/user/info/me', {
            headers: new HttpHeaders({ authorization: token }),
        });
    }

    getProjectList() {
        let token = 'Bearer ' + this.cookieService.get('token');
        return this.http.get(this.BACKEND_URL + '/project/list', {
            headers: new HttpHeaders({ authorization: token }),
        });
    }

    getProjectbyId(id: string) {
        let token = 'Bearer ' + this.cookieService.get('token');
        return this.http.get(this.BACKEND_URL + '/project?id=' + id, {
            headers: new HttpHeaders({ authorization: token }),
        });
    }

    getProjectListMyCompany(company: string) {
        let token = 'Bearer ' + this.cookieService.get('token');
        return this.http.get(
            this.BACKEND_URL + '/project/list?company=' + company,
            { headers: new HttpHeaders({ authorization: token }) }
        );
    }

    getProjectbyIdMap(id: string) {
      let token = 'Bearer ' + '0703f2e13a760df45d5be069a1dc83fe75260919c2105974da47d0148d2173fb82e4e9affdccf26f06dcf093e2099440a3f950cac15d60f2f37a89f003391ac4';
      return this.http.get(this.BACKEND_URL + '/project?id=' + id, {
        headers: new HttpHeaders({ authorization: token }),
      });
    }

    createProject(name: string, description: string, departPositionLong: number, departPositionLat: number, departAddress: string, radius: number, contraints: Array<any>, company: string, observators: string) {
        let token = 'Bearer ' + this.cookieService.get('token');
        return this.http.post(this.BACKEND_URL + '/project', {
            name: name,
            description: description,
            departPositionLong: departPositionLong,
            departPositionLat: departPositionLat,
            departAddress: departAddress,
            radius: radius,
            contraints: contraints,
            company: company,
            observators: observators.split(','),
        }, { headers: new HttpHeaders({ authorization: token }) });
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

    getGraphicsTrip(projectID: string) {
        let token = 'Bearer ' + this.cookieService.get('token');
        return this.http.get(
            this.BACKEND_URL + '/graphic/trip/' + projectID,
            {headers: new HttpHeaders({ authorization: token })
        });
    }

    getGraphicsRoad(projectID: string) {
        let token = 'Bearer ' + this.cookieService.get('token');
        return this.http.get(
            this.BACKEND_URL + '/graphic/road/' + projectID,
            {headers: new HttpHeaders({ authorization: token })
        });
    }

}
