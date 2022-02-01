import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.sass']
})
export class DashboardComponent implements OnInit {

  public projectlist: any = [];
  public errormsg: string = "";

  constructor(private router: Router, private backend:BackendService, private cookieService: CookieService,) { }

  ngOnInit(): void {
    if (!this.cookieService.check('token'))
    this.router.navigate(['/login'])

    this.backend.getUserInfo().subscribe({
      next: (res) => {
        let type = JSON.parse(JSON.stringify(res)).type;
        let company = JSON.parse(JSON.stringify(res)).company;
        console.log(type +" " + company)
        if (type == 'admin') {
        this.backend.getProjectList().subscribe({
          next: (res) => {
             this.projectlist = JSON.parse(JSON.stringify(res));
          },
          error: (error) => {
             console.error(error.error, error)
             this.errormsg = error.error;
          }})
        }
        this.backend.getProjectListMyCompany(company).subscribe({
          next: (res) => {
             this.projectlist = JSON.parse(JSON.stringify(res));
    console.log(this.projectlist)

          },
          error: (error) => {
             console.error(error.error, error)
             this.errormsg = error.error;
          }})
    }
    })
  }

  routewithData(projectId: string) {
    this.router.navigate(['/details', {projectid: projectId}])
  }
//https://jsonplaceholder.typicode.com/posts/1/comments

}
