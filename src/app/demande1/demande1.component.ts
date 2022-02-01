import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-demande1',
  templateUrl: './demande1.component.html',
  styleUrls: ['./demande1.component.sass']
})
export class Demande1Component implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  createProject1(name: string, postalcode: string, city: string, address: string, radius: string, description : string): void {
    this.router.navigate(['/demande2', {name: name, postalcode: postalcode, city: city, address: address, radius: radius, description:description}])
  }
}
