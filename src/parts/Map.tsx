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
}: {
  lng: number;
  lat: number;
  stores: Store[];
}): JSX.Element {
  return (
    <RMap className="map" initial={{ center: fromLonLat([lng, lat]), zoom: 8 }}>
      <ROSM />
      <RLayerVector zIndex={10}>
        <RFeature geometry={new Circle(fromLonLat([lng, lat]), 80467.2)}>
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
              maxZoom: 15,
            })
          }
        >
          <ROverlay className="map-loc">{"YOU ARE HERE"}</ROverlay>
        </RFeature>

        {stores.map((store) => {
          console.log(store);
          return (
            <>
              <RStyle.RStyle>
                <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
              </RStyle.RStyle>

              <RFeature
                geometry={new Point(fromLonLat([store.l[1], store.l[0]]))}
                onClick={(e) =>
                  // @ts-ignore
                  e.map.getView().fit(e.target?.getGeometry().getExtent(), {
                    duration: 250,
                    maxZoom: 15,
                  })
                }
              >
                <ROverlay className="map-loc">{store.numItems}</ROverlay>
              </RFeature>
            </>
          );
        })}
      </RLayerVector>
    </RMap>
  );
}
