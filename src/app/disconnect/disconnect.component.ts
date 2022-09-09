import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { CookieService } from 'ngx-cookie-service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-disconnect',
  templateUrl: './disconnect.component.html',
  styleUrls: ['./disconnect.component.sass']
})
export class DisconnectComponent implements OnInit {
    public errormsg: string = '';
    public cookiesaccepted: boolean = false;
    title = "Déconnexion - Signai"
  
    constructor(
        private router: Router,
        private backend: BackendService,
        private cookieService: CookieService,
        private titleService:Title
      ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.cookieService.delete('token')
    this.router.navigate(['/login'])
  }

}
