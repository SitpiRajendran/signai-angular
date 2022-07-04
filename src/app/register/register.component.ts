import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { CookieService } from 'ngx-cookie-service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements OnInit {
    public errormsg: string = '';
    public cookiesaccepted: boolean = false;
    title = "Inscription - Signai"
  
  constructor(
    private router: Router,
    private backend: BackendService,
    private cookieService: CookieService,
    private titleService:Title
) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
  }

  registeruser(mail: string, password: string, password2: string, firstname: string, name: string, phone: string) {
    if (!mail || !password || !password2 || !firstname || !name || !phone ) {
      console.log('vide');
      this.errormsg = 'Veuillez remplir tous les champs';
    } else if (password != password2){
        console.log('mot de passe différents');
        this.errormsg = 'Les deux mots de passe sont différents';  
    } else {
      this.backend.register(mail, password, firstname, name, phone).subscribe({
        next: (res) => {
          console.log(res);
          this.cookieService.set(
            'token',
            JSON.parse(JSON.stringify(res)).accessToken
          );
          this.cookieService.set(
            'email',
            mail
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
