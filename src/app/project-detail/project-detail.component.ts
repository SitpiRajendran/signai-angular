import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

declare var ol: any;

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.sass'],
})
export class ProjectDetailComponent implements OnInit {
  projectId: string = '';
  latitude: number = 48.8153;
  longitude: number = 2.3629;
  trafficlight: string =
    'https://www.pinclipart.com/picdir/big/283-2832896_traffic-light-clipart-emoji-png-download.png';
  stop: string =
    'https://cdn-0.emojis.wiki/emoji-pics/twitter/stop-sign-twitter.png';
  map: any;
  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
        new ol.layer.Vector({
          source: new ol.source.Vector({
            features: [
              new ol.Feature({
                geometry: new ol.geom.Circle(
                  ol.proj.fromLonLat([this.longitude, this.latitude]),
                  200
                ),
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
    this.addPoint(
      this.latitude + 0.00025,
      this.longitude + 0.0008,
      this.trafficlight,
      0.05
    );
    this.addPoint(
      this.latitude - 0.0003,
      this.longitude + 0.00105,
      this.stop,
      0.1
    );
    this.addPoint(
      this.latitude - 0.00035,
      this.longitude + 0.00105,
      this.stop,
      0.1
    );
  }
  addPoint(lat: number, lng: number, types: string, scale: number) {
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
          scale: scale,
          src: types,
        }),
      }),
    });
    this.map.addLayer(vectorLayer);
  }
  setCenter() {
    var view = this.map.getView();
    view.setCenter(ol.proj.fromLonLat([this.longitude, this.latitude]));
    view.setZoom(8);
  }
}
