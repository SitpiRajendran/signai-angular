import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { CookieService } from 'ngx-cookie-service';
import { Title } from '@angular/platform-browser';
import {formatDate} from '@angular/common';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

    title = 'Dashboard - Signai';

    public projectlisttemp: any = [];
    public projectlist: any = [];
    public finishedproject: any = [];
    public errormsg: string = "";
    public todayDate: string = "";

    constructor(private router: Router, private backend: BackendService, private cookieService: CookieService, private titleService: Title) { }

    ngOnInit(): void {
        if (!this.cookieService.check('token'))
            this.router.navigate(['/login'])

        this.todayDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
        this.titleService.setTitle(this.title);
        this.backend.getUserInfo().subscribe({
            next: (res) => {
                let type = JSON.parse(JSON.stringify(res)).type;
                let company = JSON.parse(JSON.stringify(res)).company;
                console.log(type + " " + company)
                if (type == 'admin') {
                    this.backend.getProjectList().subscribe({
                        next: (res) => {
                            this.projectlisttemp = JSON.parse(JSON.stringify(res));
                        },
                        error: (error) => {
                            console.error(error.error, error)
                            this.errormsg = error.error;
                        }
                    })
                }
                this.backend.getProjectListMyCompany(company).subscribe({
                    next: (res) => {
                        this.projectlisttemp = JSON.parse(JSON.stringify(res));
                        this.projectlisttemp.forEach((i: { status: string; }) => {
                            if (i.status != 'finished')
                                this.projectlist.push(i)
                            else {
                                this.finishedproject.push(i)
                                console.error(i)
                            }
                        });
                        console.error(this.finishedproject)
                    },
                    error: (error) => {
                        console.error(error.error, error)
                        this.errormsg = error.error;
                    }
                })
            }
        })
    }

    parseDate(str: string) {
        var mdy: any = str.split('-');
        return new Date(mdy[0], mdy[1], mdy[2]);
    }

    datediff(first: any, second: any) {
        // Take the difference between the dates and divide by milliseconds per day.
        // Round to nearest whole number to deal with DST.
        return Math.round((second - first) / (1000 * 60 * 60 * 24))*-1;
    }
    routewithData(projectId: string) {
        this.router.navigate(['/details', { projectid: projectId }])
    }

    //https://jsonplaceholder.typicode.com/posts/1/comments

}
