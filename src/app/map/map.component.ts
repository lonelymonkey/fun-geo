import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import Tile from 'ol/layer/Tile';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';



export class LonLatLocation {
  static london = fromLonLat([-0.12755, 51.507222]);
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  map: Map;
  view: View;

  constructor() { }

  ngOnInit() {
    this.initializeMap();
  }

  panToLondon() {
    this.view.animate({
      center: LonLatLocation.london
    });
  }

  initializeMap() {
    this.view = new View({
      center: fromLonLat([37.41, 8.82]),
      zoom: 4
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new Tile({
          source: new OSM()
        })
      ],
      view: this.view
    });
  }
}
