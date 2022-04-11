import { fromLonLat } from "ol/proj";
import { Coordinate } from "ol/coordinate";
import { Point, Circle } from "ol/geom";
import "ol/ol.css";

import { RMap, ROSM, RLayerVector, RFeature, ROverlay, RStyle } from "rlayers";
import { Store, UniversalInfoDisplayItem } from "./Shell";
import locationIcon from "./marker.svg";

export default function Overlays({
  lng,
  lat,
  items,
  stores,
  miles,
  selectedStore,
  setSelectedStore,
  map,
  toggleMap,
}: {
  lng: number;
  lat: number;
  items: UniversalInfoDisplayItem[];
  stores: Store[];
  miles: number;
  selectedStore?: Store;
  setSelectedStore: (store?: Store) => any;
  map: boolean;
  toggleMap: () => any;
}): JSX.Element {
  return (
    <RMap
      className="map"
      initial={{
        center: selectedStore
          ? fromLonLat([selectedStore.l[1], selectedStore.l[0]])
          : fromLonLat([lng, lat]),
        zoom: selectedStore ? 12 : 8,
      }}
    >
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
                onClick={(e) => {
                  // @ts-ignore
                  e.map.getView().fit(e.target?.getGeometry().getExtent(), {
                    duration: 250,
                    maxZoom: selectedStore ? 8 : 12,
                  });

                  setTimeout(() => {
                    setSelectedStore(selectedStore ? undefined : store);
                    if (!selectedStore) {
                      toggleMap();
                    }
                  }, 500);
                }}
              >
                <RStyle.RStyle>
                  <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
                </RStyle.RStyle>

                <ROverlay className="map-loc">
                  {items.filter((item) => item.s === store.n).length}
                </ROverlay>
              </RFeature>
            </>
          );
        })}
      </RLayerVector>
    </RMap>
  );
}
