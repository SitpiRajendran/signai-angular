import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { CookieService } from 'ngx-cookie-service';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.sass'],
})
export class LoginComponent implements OnInit {
    public errormsg: string = '';
    public cookiesaccepted: boolean = false;
    title = "Connexion - Signai"

    constructor(
        private router: Router,
        private backend: BackendService,
        private cookieService: CookieService,
        private titleService: Title
    ) { }

    ngOnInit(): void {
        this.titleService.setTitle(this.title);
        this.cookiesaccepted = this.cookieService.check('cookiesaccepted')
        if (this.cookieService.check('token'))
            this.router.navigate(['/dashboard'])
    }

    acceptcookies(): void {
        this.cookiesaccepted = true;
        this.cookieService.set('cookiesaccepted', 'true')
    }

    verifyconnection(mail: string, password: string) {
        let button = document.getElementById("seconnecter")

        if (button)
            button.innerHTML = "<div class='loader'></div>"
        if (!mail || !password) {
            console.log('vide');
            this.errormsg = 'Veuillez remplir tous les champs';
            if (button)
                button.innerHTML = "SE CONNECTER"
        } else {
            this.backend.login(mail, password).subscribe({
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
                    if (button)
                        button.innerHTML = "SE CONNECTER"
                },
            });
        }

        //   this.router.navigate(['/dashboard'])
    }
}
