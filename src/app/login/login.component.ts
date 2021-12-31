import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent implements OnInit {
  public errormsg: string = '';

  constructor(
    private router: Router,
    private backend: BackendService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {}

  verifyconnection(mail: string, password: string) {
    if (!mail || !password) {
      console.log('vide');
      this.errormsg = 'Veuillez remplir tous les champs';
    } else {
      this.backend.login(mail, password).subscribe({
        next: (res) => {
          console.log(res);
          this.cookieService.set(
            'token',
            JSON.parse(JSON.stringify(res)).accessToken
          );
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error(error.error, error);
          this.errormsg = error.error;
        },
      });
    }

    //   this.router.navigate(['/dashboard'])
  }
}
