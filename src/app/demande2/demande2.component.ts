import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from '../backend.service';
import { Title } from '@angular/platform-browser';

declare var ol: any;
element: HTMLElement;

@Component({
  selector: 'app-demande2',
  templateUrl: './demande2.component.html',
  styleUrls: ['./demande2.component.sass'],
})
export class Demande2Component implements OnInit {
  name: string = '';
  description: string = '';
  postalcode: string = '';
  city: string = '';
  address: string = '';
  radius: number = 0;

  latitude: number = 0;
  longitude: number = 0;
  LonLat: [number, number] = [0, 0];
  map: any;
  contstraintlat: number = 0;
  contstraintlong: number = 0;
  contstrainttype: string = "trafficlight";

  contraintList: Array<any> = [];
  title = "Création de Projet (2/2) - Signai"

  constructor(
    private route: ActivatedRoute,
    private backend: BackendService,
    private router: Router,
    private titleService:Title
  ) {}

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.name = this.route.snapshot.paramMap.get('name')!;
    this.description = this.route.snapshot.paramMap.get('description')!;
    this.postalcode = this.route.snapshot.paramMap.get('postalcode')!;
    this.city = this.route.snapshot.paramMap.get('city')!;
    this.address = this.route.snapshot.paramMap.get('address')!;
    this.radius = +this.route.snapshot.paramMap.get('radius')!;

    this.backend
      .getCoordinatesOSM(this.address, this.city, this.postalcode)
      .subscribe({
        next: (res) => {
          this.latitude = JSON.parse(JSON.stringify(res))[0].lat;
          this.longitude = JSON.parse(JSON.stringify(res))[0].lon;
          this.map = new ol.Map({
            target: 'map',
            controls: ol.control.defaults({
              attributionOptions: {
                collapsible: false,
              },
            }),
            layers: [
              new ol.layer.Tile({
                source: new ol.source.OSM(),
              }),
              new ol.layer.Vector({
                source: new ol.source.Vector({
                  features: [
                    new ol.Feature({
                      geometry: new ol.geom.Circle(
                        ol.proj.fromLonLat([+this.longitude, +this.latitude]),
                        this.radius
                      ),
                    }),
                  ],
                }),
              }),
            ],
            view: new ol.View({
              center: ol.proj.fromLonLat([+this.longitude, +this.latitude]),
              zoom: 16,
            }),
          });
          this.map.on('click', this.getCoordinates);
          this.contraintList.forEach((res) => {
            this.addPoint(+res.latitude, +res.longitude, res.type);
          });
        },
      });
  }

  getCoordinates(args: any) {
    console.log(args.coordinate);
    var lonlat = ol.proj.transform(args.coordinate, 'EPSG:3857', 'EPSG:4326');

    this.contstraintlong = lonlat[0];
    this.contstraintlat = lonlat[1];
    (<HTMLInputElement>document.getElementById('contstraintlat')).value =
      String(this.contstraintlat);
    (<HTMLInputElement>document.getElementById('contstraintlong')).value =
      String(this.contstraintlong);
  }

  changeSelect() {
    this.contstrainttype = (<HTMLInputElement>document.getElementById('contstrainttype'))
    .value;
  }

  addInList() {
    let type = (<HTMLInputElement>document.getElementById('contstrainttype'))
      .value;
    let latitude = (<HTMLInputElement>document.getElementById('contstraintlat'))
      .value;
    let longitude = (<HTMLInputElement>(
      document.getElementById('contstraintlong')
    )).value;

    let description = ""
    if (type == "trafficlight") {
      let vert = (<HTMLInputElement>(
        document.getElementById('contstraintdesc-vert')
      )).value;
      let orange = (<HTMLInputElement>(
        document.getElementById('contstraintdesc-orange')
      )).value;
      let rouge = (<HTMLInputElement>(
        document.getElementById('contstraintdesc-rouge')
      )).value;
      description = vert + '/' + orange + '/' + rouge;
    } else {
      description = (<HTMLInputElement>(
        document.getElementById('contstraintdesc')
      )).value;
    }
    var object = { type, longitude, latitude, description };
    console.log(object);
    this.contraintList.push(object);
    this.addPoint(+latitude, +longitude, type);
  }

  addPoint(lat: number, lng: number, types: string) {
    var vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [
          new ol.Feature({
            geometry: new ol.geom.Point(
              ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857')
            ),
          }),
        ],
      }),
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          scale: 0.055,
          src: '/assets/' + types + '.png',
        }),
      }),
    });
    this.map.addLayer(vectorLayer);
  }

  sendCreation() {
    this.backend.getUserInfo().subscribe({
      next: (res) => {
        let company = JSON.parse(JSON.stringify(res)).company;
        this.backend
          .createProject(
            this.name,
            this.description,
            this.longitude,
            this.latitude,
            this.address + ' ' + this.postalcode + ' ' + this.city,
            this.radius,
            this.contraintList,
            company
          )
          .subscribe({
            next: (res) => {
              let id = JSON.parse(JSON.stringify(res))._id;
              this.router.navigate(['/details/'+ id])
            },
            error: (error) => {
              console.error(error.error, error);
            },
          });
      },
    });
  }

  changeRadius(radius: string) {
    if (radius == "" || parseInt(radius) < 20) {
      return;
    }
    this.router.navigate(['/demande2', {name: this.name, postalcode: this.postalcode, city: this.city, address: this.address, radius: parseInt(radius), description: this.description}])
      .then(() =>
        window.location.reload()
      );
  }

  redirectTo(uri:string){
    this.router.navigateByUrl('', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
 }
}
