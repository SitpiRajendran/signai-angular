import { Component, OnInit } from "@angular/core";

declare var ol: any;
element: HTMLElement;

@Component({
  selector: "app-demande2",
  templateUrl: "./demande2.component.html",
  styleUrls: ["./demande2.component.sass"],
})
export class Demande2Component implements OnInit {
  latitude: number = 48.8153;
  longitude: number = 2.3629;
  map: any;
  contstraintlat: number = 0;
  contstraintlong: number = 0;

  ngOnInit() {
    this.map = new ol.Map({
      target: "map",
      controls: ol.control
        .defaults({
          attributionOptions: {
            collapsible: false,
          },
        })
/*         .extend([mousePositionControl]) */,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
        new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [
              new ol.Feature({
                geometry: new ol.geom.Circle( ol.proj.fromLonLat([this.longitude, this.latitude]), 200 ),
              }),
            ],
          }),
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([this.longitude, this.latitude]),
        zoom: 16,
      }),
    });
    
    
    this.map.on("click", this.getCoordinates)
  }

  getCoordinates(args: any) {
    console.log(args.coordinate);
    var lonlat = ol.proj.transform(args.coordinate, "EPSG:3857", "EPSG:4326");
    console.log(lonlat);
    
    this.contstraintlong = lonlat[0];
    this.contstraintlat = lonlat[1];
    (<HTMLInputElement>document.getElementById("contstraintlat")).value = String(this.contstraintlat);
    (<HTMLInputElement>document.getElementById("contstraintlong")).value = String(this.contstraintlong);
  }

  setCenter() {
    var view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude]));
    view.setZoom(8);
  }
}
