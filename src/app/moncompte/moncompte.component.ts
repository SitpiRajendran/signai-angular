import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { CookieService } from 'ngx-cookie-service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-moncompte',
  templateUrl: './moncompte.component.html',
  styleUrls: ['./moncompte.component.sass']
})
export class MoncompteComponent implements OnInit {

  public userinfo: any = [];
  public errormsg: string = "";
  title = "Mon Compte - Signai"
  constructor(private router: Router, private backend:BackendService, private cookieService: CookieService, private titleService:Title) { }
 

  ngOnInit(): void {
    this.titleService.setTitle(this.title)
    if (!this.cookieService.check('token'))
    this.router.navigate(['/login'])

    this.backend.getUserInfo().subscribe({
     next: (res) => {
        this.userinfo = JSON.parse(JSON.stringify(res));
     },
     error: (error) => {
        console.error(error.error, error)
        this.errormsg = error.error;
     }})
  }

}
