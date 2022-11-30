import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '../backend.service';
import { Title } from '@angular/platform-browser';
import jsPDF from "jspdf";

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
  layerId: number = 0;
  constraints: any = {};
  streetName:string = '';
  valueJson: { id: string, oldTlCycle: string, tlCycle: string, oldOrPrev: boolean }[] = [];
  prevAndNewState: { id: string, type: string, state: string, oldState: string, oldOrPrev: boolean }[] = [];

  constructor(private route: ActivatedRoute, private backend: BackendService, private titleService: Title) { }

  ngOnInit() {
    this.constraints.displayed = false;
    this.constraints.id = [];
    this.projectId = this.route.snapshot.paramMap.get('projectId')!;
    this.backend.getProjectbyId(this.projectId).subscribe({
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
          this.project.results.forEach((point: { coordonateX: string; coordonateY: string; type: string; value: string; oldValue: string, id: string; }) => {
            if (point.type == "sign") {
              this.addPoint(+point.coordonateX, +point.coordonateY, point.type + "_" + point.value, "sign_" + point.id);
              this.prevAndNewState.push({ "id": point.id, "type": "sign", "state": point.value, "oldState": point.oldValue, "oldOrPrev": true })
            }
            if (point.type == "speed") {
              var speed = Math.round(Number(point.value) * 3.6);
              var oldSpeed = Math.round(Number(point.oldValue) * 3.6);
              this.addPoint(+point.coordonateX, +point.coordonateY, point.type + "_" + speed.toString(), "speed_" + point.id);
              this.prevAndNewState.push({ "id": point.id, "type": "speed", "state": speed.toString(), "oldState": oldSpeed.toString(), "oldOrPrev": true })
            }
            if (point.type == "priority_up") {
              var newValue = point.value.replace(/'/g, "\"")
              var oldValue = point.oldValue.replace(/'/g, "\"")
              const valueJson = JSON.parse(newValue)
              const oldValueJson = JSON.parse(oldValue)
              for (let i = 0; i < valueJson["edgesPriority"].length; i++) {
                this.addPoint(+valueJson["edgesPriority"][i]["coordonateX"], +valueJson["edgesPriority"][i]["coordonateY"], "priority_" + valueJson["edgesPriority"][i]["priorityValue"], "priorityValue_" + point.id)
              }
              this.addPoint(+Number(valueJson["nodeCooX"]), +Number(valueJson["nodeCooY"]), "intersection", "priorityInt_" + point.id)
              this.addPoint(+point.coordonateX, +point.coordonateY, point.type, "priority_" + point.id);
              this.prevAndNewState.push({ "id": point.id, "type": "priority_up", "state": JSON.stringify(valueJson), "oldState": JSON.stringify(oldValueJson), "oldOrPrev": true })
            }
            if (point.type == "priority_down") {
              var newValue = point.value.replace(/'/g, "\"")
              var oldValue = point.oldValue.replace(/'/g, "\"")
              const valueJson = JSON.parse(newValue)
              const oldValueJson = JSON.parse(oldValue)
              for (let i = 0; i < valueJson["edgesPriority"].length; i++) {
                this.addPoint(+valueJson["edgesPriority"][i]["coordonateX"], +valueJson["edgesPriority"][i]["coordonateY"], "priority_" + valueJson["edgesPriority"][i]["priorityValue"], "priorityValue_" + point.id)
              }
              this.addPoint(+Number(valueJson["nodeCooX"]), +Number(valueJson["nodeCooY"]), "intersection", "priorityInt_" + point.id)
              this.addPoint(+point.coordonateX, +point.coordonateY, point.type, "priority_" + point.id);
              this.prevAndNewState.push({ "id": point.id, "type": "priority_down", "state": JSON.stringify(valueJson), "oldState": JSON.stringify(oldValueJson), "oldOrPrev": true })
            }
            if (point.type == "traffic_light") {
              var newValue = point.value.replace(/'/g, "\"")
              var oldValueString = point.oldValue.replace(/'/g, "\"")
              const valueJson = JSON.parse(newValue)
              const oldValueJson = JSON.parse(oldValueString)

              point.value = valueJson;
              point.oldValue = oldValueJson
              for (let i = 0; i < valueJson["sortedNode"].length; i++) {
                this.addPoint(+valueJson["sortedNode"][i]["closePoint"]["x"], +valueJson["sortedNode"][i]["closePoint"]["y"], "priority_" + String(i + 1), "tlPoint_" + point.id)
              }
              for (let i = 0; i < valueJson["newTlCycle"].length; i++)
                valueJson["newTlCycle"][i]["dispBool"] = 0;
              for (let i = 0; i < oldValueJson["newTlCycle"].length; i++)
                oldValueJson["newTlCycle"][i]["dispBool"] = 0;
              this.valueJson.push({
                id: point.id,
                oldTlCycle: JSON.stringify(oldValueJson["newTlCycle"]),
                tlCycle: JSON.stringify(valueJson["newTlCycle"]),
                oldOrPrev: true
              })

              this.addPoint(+point.coordonateX, +point.coordonateY, "trafficlight", "tl_" + point.id);
              this.prevAndNewState.push({ "id": point.id, "type": "traffic_light", "state": JSON.stringify(valueJson["newTlCycle"]), "oldState": JSON.stringify(oldValueJson["newTlCycle"]), "oldOrPrev": true })
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

  addPoint(lat: number, lng: number, types: string, id: string) {
    var vectorLayer = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [
          new ol.Feature({
            geometry: new ol.geom.Point(
              ol.proj.transform([lng, lat], 'EPSG:4326', 'EPSG:3857')
            ),
            name: id,
          }),
        ],
      }),
      layerID: this.layerId,
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 0.5],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          scale: (types == "priority_1" || types == "priority_2" || types == "priority_3" || types == "priority_4" || types == "priority_5") ? 0.030 : 0.055,
          src: '/assets/' + types + '.png',
        }),
      }),
      name: "Point",
    });
    this.map.addLayer(vectorLayer);
    this.layerId += 1;
  }

  getArrow(start_point: [Number, Number], end_point: [Number, Number], id: string) {
    var lonlat = ol.proj.fromLonLat(start_point);
    var location2 = ol.proj.fromLonLat(end_point);

    var layers = this.map.getLayers().getArray();

    for (var i = 0; i < layers.length; i++) {
      if (layers[i].get("name") == "Line") {
        var features = layers[i].getSource().getFeatures();
        if (features != undefined) {
          for (var y = 0; y < features.length; y++) {
            if (features[y].get("name") == id) {
              this.map.removeLayer(layers[i]);
            }
          }
        }
      }
    }
  }

  addArrow(start_point: [Number, Number], end_point: [Number, Number], color: String, id: string) {
    var location1 = ol.proj.fromLonLat(start_point);
    var location2 = ol.proj.fromLonLat(end_point);

    const dx = Number(end_point[0]) - Number(start_point[0]);
    const dy = Number(end_point[1]) - Number(start_point[1]);
    const rotation = Math.atan2(dy, dx);

    const styles = [
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: color == "vert" ? "green" : "yellow",
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
        color: color == "vert" ? "green" : "yellow",
      }),
    }))

    var linie = new ol.layer.Vector({
      source: new ol.source.Vector({
        features: [new ol.Feature({
          geometry: new ol.geom.LineString([location1, location2]),
          name: id,
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
    if (this.constraints.displayed == true) {
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
    else {
      this.constraints.displayed = true;
      this.project.contraints.forEach((point: { latitude: string; longitude: string; type: string, streetName: string }) => {
        this.addPoint(+point.latitude, +point.longitude, point.type, "constraint");
        this.constraints.id.push(this.layerId - 1);
        console.log(this.project.contraints.streetName);
        //this.project.contraints.streetName = point.streetName;
      });
    }
  }

  removeLayerByFeatureID(id: string, type: string) {
    var layers = this.map.getLayers().getArray();
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].get("name") == "Point") {
        var features = layers[i].getSource().getFeatures();
        if (features != undefined) {
          for (var y = 0; y < features.length; y++) {
            if (features[y].get("name") == type + id) {
              console.log("here")
              this.map.removeLayer(layers[i]);
              i = 0
            }
          }
        }
      }
    }
  }

  speedSetPointStateAndOldState(id: string, lat: number, lng: number) {
    this.removeLayerByFeatureID(id, "speed_")

    for (var i = 0; i < this.prevAndNewState.length; i++) {
      if (this.prevAndNewState[i].id == id && this.prevAndNewState[i].type == "speed") {
        if (this.prevAndNewState[i].oldOrPrev == true) {
          this.addPoint(lat, lng, "speed_" + this.prevAndNewState[i].oldState, "speed_" + id)
          this.prevAndNewState[i].oldOrPrev = !this.prevAndNewState[i].oldOrPrev
        }
        else {
          this.addPoint(lat, lng, "speed_" + this.prevAndNewState[i].state, "speed_" + id)
          this.prevAndNewState[i].oldOrPrev = !this.prevAndNewState[i].oldOrPrev
        }
      }
    }
  }

  signSetPointStateAndOldState(id: string, lat: number, lng: number) {
    this.removeLayerByFeatureID(id, "sign_")

    for (var i = 0; i < this.prevAndNewState.length; i++) {
      if (this.prevAndNewState[i].id == id && this.prevAndNewState[i].type == "sign") {
        if (this.prevAndNewState[i].oldOrPrev == true) {
          this.addPoint(lat, lng, "sign_" + this.prevAndNewState[i].oldState, "sign_" + id)
          this.prevAndNewState[i].oldOrPrev = !this.prevAndNewState[i].oldOrPrev
        }
        else {
          this.addPoint(lat, lng, "sign_" + this.prevAndNewState[i].state, "sign_" + id)
          this.prevAndNewState[i].oldOrPrev = !this.prevAndNewState[i].oldOrPrev
        }
      }
    }
  }

  setPriorityIntPoint(id: string, state: string) {
    const valueJson = JSON.parse(state)
    for (let i = 0; i < valueJson["edgesPriority"].length; i++) {
      this.addPoint(+valueJson["edgesPriority"][i]["coordonateX"], +valueJson["edgesPriority"][i]["coordonateY"], "priority_" + valueJson["edgesPriority"][i]["priorityValue"], "priorityValue_" + id)
    }
  }

  priorityUpSetPointStageAndOldState(id: string, lat: number, lng: number) {
    this.removeLayerByFeatureID(id, "priorityValue_")

    for (var i = 0; i < this.prevAndNewState.length; i++) {
      if (this.prevAndNewState[i].id == id && this.prevAndNewState[i].type == "priority_up") {
        if (this.prevAndNewState[i].oldOrPrev == true) {
          this.removeLayerByFeatureID(id, "priority_")
          this.setPriorityIntPoint(id, this.prevAndNewState[i].oldState)
          this.prevAndNewState[i].oldOrPrev = !this.prevAndNewState[i].oldOrPrev
        }
        else {
          this.addPoint(lat, lng, "priority_up", "priority_" + id);
          this.setPriorityIntPoint(id, this.prevAndNewState[i].state)
          this.prevAndNewState[i].oldOrPrev = !this.prevAndNewState[i].oldOrPrev
        }
      }
    }
  }

  priorityDownSetPointStageAndOldState(id: string, lat: number, lng: number) {
    this.removeLayerByFeatureID(id, "priorityValue_")

    for (var i = 0; i < this.prevAndNewState.length; i++) {
      if (this.prevAndNewState[i].id == id && this.prevAndNewState[i].type == "priority_down") {
        if (this.prevAndNewState[i].oldOrPrev == true) {
          this.removeLayerByFeatureID(id, "priority_")
          this.setPriorityIntPoint(id, this.prevAndNewState[i].oldState)
          this.prevAndNewState[i].oldOrPrev = !this.prevAndNewState[i].oldOrPrev
        }
        else {
          this.addPoint(lat, lng, "priority_down", "priority_" + id);
          this.setPriorityIntPoint(id, this.prevAndNewState[i].state)
          this.prevAndNewState[i].oldOrPrev = !this.prevAndNewState[i].oldOrPrev
        }
      }
    }
  }

  tlSetPointStageAndOldState(id: string, lat: number, lng: number) {

    for (var i = 0; i < this.prevAndNewState.length; i++) {
      if (this.prevAndNewState[i].id == id && this.prevAndNewState[i].type == "traffic_light") {
        this.prevAndNewState[i].oldOrPrev = !this.prevAndNewState[i].oldOrPrev
        for (let i = 0; i < this.valueJson.length; i++) {
          if (this.valueJson[i]["id"] == id)
            this.valueJson[i]["oldOrPrev"] = !this.valueJson[i]["oldOrPrev"]
        }
      }
    }
  }

  getSignOldModif(id: string): string {
    for (var i = 0; i < this.prevAndNewState.length; i++) {
      if (this.prevAndNewState[i].id == id) {
        if (this.prevAndNewState[i].oldState == "priority")
          return ("Panneau priorité")
        if (this.prevAndNewState[i].oldState == "priority_stop")
          return ("Panneau Stop")
        if (this.prevAndNewState[i].oldState == "right_before_left")
          return ("Panneau priorité à droite")
      }
    }
    return ("")
  }

  getPrevState(id: string): string {
    for (var i = 0; i < this.prevAndNewState.length; i++) {
      if (this.prevAndNewState[i].id == id)
        return (this.prevAndNewState[i].oldState)
    }
    return ("")
  }

  getModifState(id: string, type: string): boolean {
    for (var i = 0; i < this.prevAndNewState.length; i++) {
      if (this.prevAndNewState[i].id == id && type == this.prevAndNewState[i].type)
        return (this.prevAndNewState[i].oldOrPrev)
    }
    return (false)
  }

  getCycleDispValue(id: string, cycleNB: number): number {
    let cycleIndex: number = this.getCycleIndex(id)
    let cycleJson: any = {}

    if (this.valueJson[cycleIndex]["oldOrPrev"] == true) {
      cycleJson = JSON.parse(this.valueJson[cycleIndex]["tlCycle"])
    }
    else {
      cycleJson = JSON.parse(this.valueJson[cycleIndex]["oldTlCycle"])
    }
    return (cycleJson[cycleNB]["dispBool"])
  }

  getCycleIndex(id: string): number{
    let cycleID: number = 0

    for (let i = 0; i < this.valueJson.length; i++) {
      if (this.valueJson[i]["id"] == id)
        cycleID = i
    }
    return (cycleID)
  }

  setActualTl(id: string, cycleNB: Number, cycleJson: any): any {
    for (let i = 0; i < cycleJson.length; i++) {
      if (cycleJson[i]["cycleNb"] == cycleNB) {
        if (cycleJson[i]["dispBool"] == 1) {
          cycleJson[i]["dispBool"] = 0
          for (let y = 0; y < cycleJson[i]["detail"].length; y++) {
            var fromNodeY = Number(cycleJson[i]["detail"][y]["fromNodeY"])
            var fromNodeX = Number(cycleJson[i]["detail"][y]["fromNodeX"])
            var toNodeY = Number(cycleJson[i]["detail"][y]["toNodeY"])
            var toNodeX = Number(cycleJson[i]["detail"][y]["toNodeX"])

            this.getArrow([fromNodeY, fromNodeX], [toNodeY, toNodeX], "arrow_" + id)
          }
        } else {
          this.closeAllCycle(cycleJson, id)
          cycleJson[i]["dispBool"] = 1
          for (let y = 0; y < cycleJson[i]["detail"].length; y++) {
            var fromNodeY = Number(cycleJson[i]["detail"][y]["fromNodeY"])
            var fromNodeX = Number(cycleJson[i]["detail"][y]["fromNodeX"])
            var toNodeY = Number(cycleJson[i]["detail"][y]["toNodeY"])
            var toNodeX = Number(cycleJson[i]["detail"][y]["toNodeX"])

            this.addArrow([fromNodeY, fromNodeX], [toNodeY, toNodeX], cycleJson[i]["detail"][y]["color"], "arrow_" + id)
          }
        }
      }
    }
    return (cycleJson)
  }


  changeCycle(id: string, cycleNB: Number) {
    let cycleIndex: number = this.getCycleIndex(id)
    if (this.valueJson[cycleIndex]["oldOrPrev"] == true) {
      let cycleJson = JSON.parse(this.valueJson[cycleIndex]["tlCycle"])
      cycleJson = this.setActualTl(id, cycleNB, cycleJson)
      this.valueJson[cycleIndex]["tlCycle"] = JSON.stringify(cycleJson)
    }
    else {
      let cycleJson = JSON.parse(this.valueJson[cycleIndex]["oldTlCycle"])
      cycleJson = this.setActualTl(id, cycleNB, cycleJson)
      this.valueJson[cycleIndex]["oldTlCycle"] = JSON.stringify(cycleJson)
    }
  }
  closeAllCycle(cycle: any, id: string) {
    for (let i = 0; i < cycle.length; i++) {
      cycle[i]["dispBool"] = 0
      for (let y = 0; y < cycle[i]["detail"].length; y++) {
        var fromNodeY = Number(cycle[i]["detail"][y]["fromNodeY"])
        var fromNodeX = Number(cycle[i]["detail"][y]["fromNodeX"])
        var toNodeY = Number(cycle[i]["detail"][y]["toNodeY"])
        var toNodeX = Number(cycle[i]["detail"][y]["toNodeX"])

        this.getArrow([fromNodeY, fromNodeX], [toNodeY, toNodeX], "arrow_" + id)
      }
    }
  }

  downloadPDF() {
    let doc = new jsPDF();
    doc.text("Signai", 10, 10)
    doc.save("signai-rapport-" + this.project.name.split(' ').join('_') + ".pdf");
    console.log("remove layer")
  }

  doCopy () {
/*     var target = this.dataset.target;
    var fromElement = document.querySelector(target);
    if(!fromElement) return;

    var range = document.createRange();
    var selection = window.getSelection();
    range.selectNode(fromElement);
    selection.removeAllRanges();
    selection.addRange(range);
 */
  }
}
