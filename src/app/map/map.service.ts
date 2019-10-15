import { Injectable } from '@angular/core';
import View from 'ol/View';
import Map from 'ol/Map';

@Injectable()
export class MapService {

  private map: Map;
  private view: View;

  constructor() { }

  load(view: View, map: Map): void {
    this.view = view;
    this.map = map;
  }

}
