import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-demande1',
  templateUrl: './demande1.component.html',
  styleUrls: ['./demande1.component.sass']
})
export class Demande1Component implements OnInit {
  title = "Création de Projet (1/2) - Signai"
  constructor(private router: Router, private titleService:Title) { }

  ngOnInit(): void {
    this.titleService.setTitle(this.title)
  }

  createProject1(name: string, postalcode: string, city: string, address: string, radius: string, description : string, observators : string): void {
    this.router.navigate(['/demande2', {name: name, postalcode: postalcode, city: city, address: address, radius: radius, description:description, observators: observators}])
  }
}
