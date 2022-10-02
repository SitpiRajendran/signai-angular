import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { BackendService } from '../backend.service';
import { Title } from '@angular/platform-browser';
import { range } from 'rxjs';

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
  graphicTrip: string = '';
  graphicRoad: string = '';
  valueJson: any;
  layerId: number = 0;
  constraints: any = {};

  constructor(private route: ActivatedRoute, private backend:BackendService, private titleService:Title) {}

  ngOnInit() {
    this.constraints.displayed = false;
    this.constraints.id = [];
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    this.backend.getProjectbyId(this.projectId).subscribe ({
      next: (res) => {
        this.project = JSON.parse(JSON.stringify(res))
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
        if (this.project.status == "finished") {
            this.project.results.forEach((point: { coordonateX: string; coordonateY: string ; type: string; value: string}) => {
                if (point.type == "sign") {
                  this.addPoint(+point.coordonateX, +point.coordonateY, point.type + "_" + point.value);
                }
                if (point.type == "speed") {
                  var speed = Math.round(Number(point.value) * 3.6);
                  this.addPoint(+point.coordonateX, +point.coordonateY, point.type + "_" + speed.toString());
                }
                if (point.type == "priority_up") {
                  var newValue = point.value.replace(/'/g, "\"")
                  const valueJson = JSON.parse(newValue)
                  for (let i = 0; i < valueJson["edgesPriority"].length; i++) {
                    this.addPoint(+valueJson["edgesPriority"][i]["coordonateX"], +valueJson["edgesPriority"][i]["coordonateY"], "priority_" + valueJson["edgesPriority"][i]["priorityValue"])
                  }
                  this.addPoint(+Number(valueJson["nodeCooX"]), +Number(valueJson["nodeCooY"]), "intersection")
                  this.addPoint(+point.coordonateX, +point.coordonateY, point.type);
                }
                if (point.type == "priority_down") {
                  var newValue = point.value.replace(/'/g, "\"")
                  const valueJson = JSON.parse(newValue)
                  for (let i = 0; i < valueJson["edgesPriority"].length; i++) {
                    this.addPoint(+valueJson["edgesPriority"][i]["coordonateX"], +valueJson["edgesPriority"][i]["coordonateY"], "priority_" + valueJson["edgesPriority"][i]["priorityValue"])
                  }
                  this.addPoint(+Number(valueJson["nodeCooX"]), +Number(valueJson["nodeCooY"]), "intersection")
                  this.addPoint(+point.coordonateX, +point.coordonateY, point.type);
                }
              if (point.type == "traffic_light") {
                var newValue = point.value.replace(/'/g, "\"")
                var valueJson = JSON.parse(newValue)
                point.value = valueJson;
                for (let i = 0; i < valueJson["sortedNode"].length; i++) {
                  this.addPoint(+valueJson["sortedNode"][i]["closePoint"]["x"], +valueJson["sortedNode"][i]["closePoint"]["y"], "priority_" + String(i + 1))
                }
                for (let i = 0; i < valueJson["newTlCycle"].length; i++) {
                  valueJson["newTlCycle"][i]["dispBool"] = 0;
                }
                this.valueJson = valueJson;
                this.addPoint(+point.coordonateX, +point.coordonateY, "trafficlight");
              }
            });
            this.getGraphicTrip();
            this.getGraphicRoad();
        }
      this.titleService.setTitle("Projet " + this.project.name + " - Signai")

      },
      error: (err) => {
        console.error(err);
      }
    })
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
        layerID: this.layerId,
        style: new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            scale: (types == "priority_1" || types == "priority_2" || types == "priority_3" || types == "priority_4" || types == "priority_5") ? 0.030: 0.055,
            src: '/assets/' + types + '.png',
          }),
        }),
        name: "Point",
      });
    this.map.addLayer(vectorLayer);
    this.layerId += 1;
  }

  getArrow(start_point: [Number, Number], end_point: [Number, Number]) {
    var lonlat = ol.proj.fromLonLat(start_point);
    var location2 = ol.proj.fromLonLat(end_point);

    var layers = this.map.getLayers().getArray();

    for (var i = 0; i < layers.length; i++) {
      if (layers[i].get("name") == "Line") {
        var features = layers[i].getSource().getFeatures();
        if (features != undefined) {
          for (var y = 0; y < features.length; y++) {
            if (features[y].get("name") == "Line") {
              var checkGeo = new ol.geom.LineString([lonlat, location2]).getCoordinates();
              var lineCoordinates = features[y].get("geometry").getCoordinates();
              if (checkGeo[0][0] == lineCoordinates[0][0] &&
                  checkGeo[0][1] == lineCoordinates[0][1] &&
                  checkGeo[1][0] == lineCoordinates[1][0] &&
                  checkGeo[1][1] == lineCoordinates[1][1]) {
                this.map.removeLayer(layers[i]);
              }
            }
          }
        }
      }
    }
  }
  addArrow(start_point: [Number, Number], end_point: [Number, Number], color: String) {
    var location1 = ol.proj.fromLonLat(start_point);
    var location2 = ol.proj.fromLonLat(end_point);

    const dx = Number(end_point[0]) - Number(start_point[0]);
    const dy = Number(end_point[1]) - Number(start_point[1]);
    const rotation = Math.atan2(dy, dx);

    const styles = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: color == "vert" ? "green": "yellow",
          width: 2,
        }),
      }),
    ];

    styles.push(new ol.style.Style({
      geometry: new ol.geom.Point(ol.proj.transform(end_point, 'EPSG:4326', 'EPSG:3857')),
      image: new ol.style.Icon({
        src: '/assets/arrow.png',
        anchor: [0.75, 0.5],
        scale: 1,
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        rotateWithView: true,
        rotation: -rotation,
        color: color == "vert" ? "green": "yellow",
      }),
    }))

    var linie = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [new ol.Feature({
            geometry: new ol.geom.LineString([location1, location2]),
            name: 'Line',
        })]
      }),
      name: "Line",
    });

    linie.setStyle(styles)

    this.map.addLayer(linie);
  }

  zoomToPoint(lat: number, lng: number) {
    var features = new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857')
      ),
    });
    this.map.getView().fit(features.getGeometry(), this.map.getSize());
    this.map.getView().setZoom(18);
  }

  getGraphicTrip() {
    this.backend.getGraphicsTrip(this.projectId).subscribe({
      next: (res) => {
        let data = JSON.parse(JSON.stringify(res))
        this.graphicTrip = "data:image/png;base64," + data.data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  getGraphicRoad() {
    this.backend.getGraphicsRoad(this.projectId).subscribe({
      next: (res) => {
        let data = JSON.parse(JSON.stringify(res))
        this.graphicRoad = "data:image/png;base64," + data.data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  displayConstraints() {
    this.constraints.displayed = true;
    this.project.contraints.forEach((point: { latitude: string; longitude: string ; type: string;}) => {
      this.addPoint(+point.latitude, +point.longitude, point.type);
      this.constraints.id.push(this.layerId - 1)
    });
  }

  hideConstraints() {
    this.constraints.displayed = false;
    var layers = this.map.getLayers().getArray();

    for (var i = 0; i < layers.length; i++) {
      for (var y = 0; y < this.constraints.id.length; y++) {
        var id = layers[i].get("layerID");
        if (id != undefined && layers[i].get("layerID") == this.constraints.id[y]) {
          this.map.removeLayer(layers[i]);
        }
      }
    }
    this.constraints.id = [];
  }

  changeCycle(cycleNB: Number) {
    for (let i = 0; i < this.valueJson["newTlCycle"].length; i++) {
      if (this.valueJson["newTlCycle"][i]["cycleNb"] == cycleNB) {
        console.log(this.valueJson["newTlCycle"][i])
        if (this.valueJson["newTlCycle"][i]["dispBool"] == 1) {
          this.valueJson["newTlCycle"][i]["dispBool"] = 0
          for (let y = 0; y < this.valueJson["newTlCycle"][i]["detail"].length; y++) {
            var fromNodeY = Number(this.valueJson["newTlCycle"][i]["detail"][y]["fromNodeY"])
            var fromNodeX = Number(this.valueJson["newTlCycle"][i]["detail"][y]["fromNodeX"])
            var toNodeY = Number(this.valueJson["newTlCycle"][i]["detail"][y]["toNodeY"])
            var toNodeX = Number(this.valueJson["newTlCycle"][i]["detail"][y]["toNodeX"])

            this.getArrow([fromNodeY, fromNodeX], [toNodeY, toNodeX])
          }
        }
        else {
          this.closeAllCycle()
          this.valueJson["newTlCycle"][i]["dispBool"] = 1
          for (let y = 0; y < this.valueJson["newTlCycle"][i]["detail"].length; y++) {
            var fromNodeY = Number(this.valueJson["newTlCycle"][i]["detail"][y]["fromNodeY"])
            var fromNodeX = Number(this.valueJson["newTlCycle"][i]["detail"][y]["fromNodeX"])
            var toNodeY = Number(this.valueJson["newTlCycle"][i]["detail"][y]["toNodeY"])
            var toNodeX = Number(this.valueJson["newTlCycle"][i]["detail"][y]["toNodeX"])

            this.addArrow([fromNodeY, fromNodeX], [toNodeY, toNodeX], this.valueJson["newTlCycle"][i]["detail"][y]["color"])
          }
        }
      }
    }
  }
  closeAllCycle() {
    for (let i = 0; i < this.valueJson["newTlCycle"].length; i++) {
      this.valueJson["newTlCycle"][i]["dispBool"] = 0
      for (let y = 0; y < this.valueJson["newTlCycle"][i]["detail"].length; y++) {
        var fromNodeY = Number(this.valueJson["newTlCycle"][i]["detail"][y]["fromNodeY"])
        var fromNodeX = Number(this.valueJson["newTlCycle"][i]["detail"][y]["fromNodeX"])
        var toNodeY = Number(this.valueJson["newTlCycle"][i]["detail"][y]["toNodeY"])
        var toNodeX = Number(this.valueJson["newTlCycle"][i]["detail"][y]["toNodeX"])

        this.getArrow([fromNodeY, fromNodeX], [toNodeY, toNodeX])
      }
    }
  }
}
