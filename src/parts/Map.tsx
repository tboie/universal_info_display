import { fromLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import { Point, Circle } from "ol/geom";
import "ol/ol.css";

import {
  RMap,
  ROSM,
  RLayerVector,
  RFeature,
  ROverlay,
  RStyle,
  RPopup,
} from "rlayers";
import { Store } from "./Shell";
import locationIcon from "./marker.svg";

export default function Overlays({
  lng,
  lat,
  stores,
  miles,
  selectedAddress,
  setSelectedAddress,
}: {
  lng: number;
  lat: number;
  stores: Store[];
  miles: number;
  selectedAddress: string;
  setSelectedAddress: (val: string) => any;
}): JSX.Element {
  return (
    <RMap className="map" initial={{ center: fromLonLat([lng, lat]), zoom: 8 }}>
      <ROSM />
      <RLayerVector zIndex={10}>
        <RFeature
          geometry={new Circle(fromLonLat([lng, lat]), miles * 1609.34)}
        >
          <RStyle.RStyle>
            <RStyle.RStroke color="yellow" width={4} />
            <RStyle.RFill color="transparent" />
          </RStyle.RStyle>
        </RFeature>

        <RStyle.RStyle>
          <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
        </RStyle.RStyle>

        <RFeature
          geometry={new Point(fromLonLat([lng, lat]))}
          onClick={(e) =>
            // @ts-ignore
            e.map.getView().fit(e.target?.getGeometry().getExtent(), {
              duration: 250,
              maxZoom: 12,
            })
          }
        >
          <ROverlay className="map-loc">{"YOU"}</ROverlay>
        </RFeature>

        {stores.map((store) => {
          return (
            <>
              <RFeature
                geometry={new Point(fromLonLat([store.l[1], store.l[0]]))}
                onClick={(e) =>
                  // @ts-ignore
                  e.map.getView().fit(e.target?.getGeometry().getExtent(), {
                    duration: 250,
                    maxZoom: 12,
                  })
                }
              >
                <RStyle.RStyle>
                  <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
                </RStyle.RStyle>

                <ROverlay className="map-loc">{store.numItems}</ROverlay>
              </RFeature>
            </>
          );
        })}
      </RLayerVector>
    </RMap>
  );
}
