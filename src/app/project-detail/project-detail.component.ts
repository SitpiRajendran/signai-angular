import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BackendService } from '../backend.service';
import { Title } from '@angular/platform-browser';

declare var ol: any;

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.sass'],
})
export class ProjectDetailComponent implements OnInit {
  projectId: string = '';
  project: any = {}
  map: any;

  constructor(private route: ActivatedRoute, private backend:BackendService, private titleService:Title) {}

  ngOnInit() {
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    this.backend.getProjectbyId(this.projectId).subscribe ({
      next: (res) => {
        this.project = JSON.parse(JSON.stringify(res))
        console.log(this.project)
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
                      ol.proj.fromLonLat([+this.project.longitude, +this.project.latitude]),
                      this.project.radius
                    ),
                  }),
                ],
              }),
            }),
          ],
          view: new ol.View({
            center: ol.proj.fromLonLat([+this.project.longitude, +this.project.latitude]),
            zoom: 16,
          }),
        });
        if (this.project.status != "finished") {
            this.project.contraints.forEach((point: { latitude: string; longitude: string ; type: string;}) => {
              console.log(point)
              this.addPoint(+point.latitude, +point.longitude, point.type);
            });
        }
        if (this.project.status == "finished") {
            this.project.results.forEach((point: { coordonateX: string; coordonateY: string ; type: string; value: string}) => {
              console.log(point)
                if (point.type == "sign") {
                  console.log(point.value);
                  this.addPoint(+point.coordonateX, +point.coordonateY, point.type + "_" + point.value);
                }
                if (point.type == "speed") {
                  var speed = Math.round(Number(point.value) * 3.6);
                  console.log(speed)
                  this.addPoint(+point.coordonateX, +point.coordonateY, point.type + "_" + speed.toString());
                }
                if (point.type == "priority_up") {
                  var newValue = point.value.replace(/'/g, "\"")
                  const valueJson = JSON.parse(newValue)
                  for (let i = 0; i < valueJson.length; i++) {
                    this.addPoint(+valueJson[i]["coordonateX"], +valueJson[i]["coordonateY"], "priority_" + valueJson[i]["priorityValue"])
                  }
                  this.addPoint(+point.coordonateX, +point.coordonateY, point.type);
                }
                if (point.type == "priority_down") {
                  var newValue = point.value.replace(/'/g, "\"")
                  const valueJson = JSON.parse(newValue)
                  for (let i = 0; i < valueJson.length; i++) {
                    this.addPoint(+valueJson[i]["coordonateX"], +valueJson[i]["coordonateY"], "priority_" + valueJson[i]["priorityValue"])
                  }
                  this.addPoint(+point.coordonateX, +point.coordonateY, point.type);
                }
            });
        }

      this.titleService.setTitle("Projet " + this.project.name + " - Signai")

      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  addPoint(lat: number, lng: number, types: string) {
    console.log(types)
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
            scale: (types == "priority_1" || types == "priority_2" || types == "priority_3" || types == "priority_4" || types == "priority_5") ? 0.030: 0.055,
            src: '/assets/' + types + '.png',
          }),
        }),
      });
    this.map.addLayer(vectorLayer);
  }
}
