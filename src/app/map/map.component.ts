import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import { MapService } from './map.service';
import { OSM, ImageArcGISRest } from 'ol/source';
import { Tile as TileLayer, Image as ImageLayer, Vector as VectorLayer } from 'ol/layer';
import { Translate, defaults as defaultInteractions, Pointer as PointerInteraction, Interaction } from 'ol/interaction';
import { Feature, MapBrowserPointerEvent } from 'ol';
import { LineString, Point, Polygon } from 'ol/geom';
import { TileJSON, Vector as VectorSource } from 'ol/source';
import { Fill, Icon, Stroke, Style } from 'ol/style';
import IconAnchorUnits from 'ol/style/IconAnchorUnits';
import Collection from 'ol/Collection';
import { Options as TranslateOptions } from 'ol/interaction/Translate';
import { Options as PointerInteractionOptions } from 'ol/interaction/Pointer';
import { containsExtent, boundingExtent, Extent } from 'ol/extent';


export class PolygonTranslateInteraction extends Translate {
  constructor( opt_options?: TranslateOptions ) {
    super(opt_options);
  }
}

export class LonLatLocation {
  static london = fromLonLat([-0.12755, 51.507222]);
}

export class ViewPortBox {

  private _feature: Feature;
  private _collection = new Collection<Feature>();
  private _interactions = new Array<Interaction>();

  constructor() {
    this._feature = new Feature(
      new Polygon([[
        [-3e6, -1e6], [-3e6, 1e6],
        [-1e6, 1e6], [-1e6, -1e6], 
        [-3e6, -1e6]
      ]])
    );

    this._collection = new Collection<Feature>();
    this._collection.push(this.feature);
    
    this.addInteractions();
  }

  get feature(): Feature {
    return this._feature;
  }

  get featureCollection(): Collection<Feature> {
    return this._collection;
  }

  get interactions(): Array<Interaction> {
    return this._interactions;
  }

  get viewPortBoxExtend(): Extent {
    return this.feature.getGeometry().getExtent();
  }

  private addInteractions() {
    const translateInteraction = new PolygonTranslateInteraction(
      <TranslateOptions>{
        features: this.featureCollection,
      }
    );

    const pointerInteraction = new PointerInteraction(
      <PointerInteractionOptions>{
        handleDownEvent: this.handleDownEvent.bind(this),
        handleMoveEvent: this.handleMoveEvent.bind(this)
      }
    )

    this._interactions.push(pointerInteraction);
    this._interactions.push(translateInteraction);
  }
  
  private handleDownEvent(evt: MapBrowserPointerEvent): boolean {
    return false;
  }

  private handleMoveEvent(mapBrowserEvent: MapBrowserPointerEvent): void {
    console.log('mapBrowserEvent: mapBrowserEvent', mapBrowserEvent);
    console.log('handleMoveEvent: getGeometry:', this.feature.getGeometry().getExtent());
    const mouseExtend = boundingExtent([mapBrowserEvent.coordinate]);
    console.log('isMouse inside viewport box', containsExtent(this.viewPortBoxExtend, mouseExtend));
  }
}

const polygonFeature2 = new Feature(
  new Polygon([[
    [-5e6, 2e6], [-5e6, 4e6],
    [-3e6, 4e6], [-3e6, 2e6], 
    [-5e6, 2e6]
  ]])
);



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent implements OnInit {
  imageLayerUrl = 'https://sampleserver1.arcgisonline.com/ArcGIS/rest/services/' +
  'Specialty/ESRI_StateCityHighway_USA/MapServer';
  map: Map;
  view: View;

  viewPortBox: ViewPortBox;

  constructor(
    private mapService: MapService
  ) {
  }

  ngOnInit() {
    this.viewPortBox = new ViewPortBox();
    this.initializeMap();
  }

  panToLondon() {
    this.view.animate({
      center: LonLatLocation.london
    });
  }

  getVectorLayer(): VectorLayer {
    return new VectorLayer({
      source: new VectorSource({
        features: [this.viewPortBox.feature, polygonFeature2]
      }),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 46],
          anchorXUnits: IconAnchorUnits.FRACTION,
          anchorYUnits: IconAnchorUnits.PIXELS,
          opacity: 0.95,
          src: 'data/icon.png'
        }),
        stroke: new Stroke({
          width: 3,
          color: [255, 0, 0, 1]
        }),
        fill: new Fill({
          color: [0, 0, 255, 0.6]
        })
      })
    })
  }

  initializeMap() {
    this.view = new View({
      center: fromLonLat([37.41, 8.82]),
      zoom: 4
    });

    const vectorLayer = this.getVectorLayer();

    this.map = new Map({
      interactions: defaultInteractions().extend(this.viewPortBox.interactions),
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM()
        }),
        // not sure if it's working
        new ImageLayer({
          source: new ImageArcGISRest({
            ratio: 1,
            params: {},
            url: this.imageLayerUrl
          })
        }),
        vectorLayer
      ],
      view: this.view
    });

    // this.mapService.load(this.view, this.map);
  }
}
