
import * as L from 'leaflet';

declare module 'leaflet' {
  interface HeatLayerOptions {
    minOpacity?: number;
    maxZoom?: number;
    max?: number;
    radius?: number;
    blur?: number;
    gradient?: { [key: number]: string };
  }

  type LatLngTuple = [number, number];
  type LatLngTupleWithIntensity = [number, number, number];
  
  function heatLayer(
    latlngs: (LatLng | LatLngTuple | LatLngTupleWithIntensity)[],
    options?: HeatLayerOptions
  ): HeatLayer;

  class HeatLayer extends Layer {
    constructor(
      latlngs: (LatLng | LatLngTuple | LatLngTupleWithIntensity)[],
      options?: HeatLayerOptions
    );
    setLatLngs(
      latlngs: (LatLng | LatLngTuple | LatLngTupleWithIntensity)[]
    ): this;
    addLatLng(latlng: LatLng | LatLngTuple | LatLngTupleWithIntensity): this;
    setOptions(options: HeatLayerOptions): this;
    redraw(): this;
  }
}
