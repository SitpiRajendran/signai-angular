import { NgModule } from '@angular/core';
import { BrowserModule , Title } from '@angular/platform-browser';
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';

import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http'
import { CookieService } from 'ngx-cookie-service';

import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MenuComponent } from './menu/menu.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { Demande1Component } from './demande1/demande1.component';
import { Demande2Component } from './demande2/demande2.component';
import { NocookiesComponent } from './nocookies/nocookies.component';
import { MoncompteComponent } from './moncompte/moncompte.component';
import { RegisterComponent } from './register/register.component';
import { DisconnectComponent } from './disconnect/disconnect.component';
import { MapViewComponent } from './map-view/map-view.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'nocookies', component: NocookiesComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'details/:projectId', component: ProjectDetailComponent },
  { path: 'map/:projectId', component: MapViewComponent },
  { path: 'demande1', component: Demande1Component },
  { path: 'demande2', component: Demande2Component },
  { path: 'moncompte', component: MoncompteComponent },
  { path: 'disconnect', component: DisconnectComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    MenuComponent,
    ProjectDetailComponent,
    Demande1Component,
    Demande2Component,
    NocookiesComponent,
    MoncompteComponent,
    RegisterComponent,
    DisconnectComponent,
    MapViewComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    HttpClientModule,
    NgxGoogleAnalyticsModule.forRoot('G-E7E3GFLG7G'),
    NgxGoogleAnalyticsRouterModule
  ],
  providers: [CookieService, Title],
  bootstrap: [AppComponent]
})
export class AppModule { }
