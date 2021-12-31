import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.sass']
})
export class MenuComponent implements OnInit {

  @Input() accountid: string = "";
  @Input() contact_name: string = "";
  @Input() contact_mail: string = "";
  @Input() contact_telephone: string = "";

  constructor() { }

  ngOnInit(): void {
  }

}
