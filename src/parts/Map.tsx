import "./Map.css";

import { fromLonLat } from "ol/proj";
import { Point, Circle } from "ol/geom";
import "ol/ol.css";

import {
  RMap,
  ROSM,
  RLayerVector,
  RFeature,
  ROverlay,
  RStyle,
  RControl,
} from "rlayers";
import { Store, UniversalInfoDisplayItem } from "./Shell";
import locationIcon from "./marker.svg";
import { useEffect, useState } from "react";

export default function Overlays({
  lng,
  lat,
  items,
  stores,
  miles,
  selectedStore,
  setSelectedStore,
  setSelectedFilterIdx,
  map,
  toggleMap,
  goToPage,
}: {
  lng: number;
  lat: number;
  items: UniversalInfoDisplayItem[];
  stores: Store[];
  miles: number;
  selectedStore?: Store;
  setSelectedStore: (store?: Store) => any;
  setSelectedFilterIdx: (val: number) => any;
  map: boolean;
  toggleMap: () => any;
  goToPage: (idx: number) => void;
}): JSX.Element {
  const [view, setView] = useState({
    center: selectedStore
      ? fromLonLat([selectedStore.l[1], selectedStore.l[0]])
      : fromLonLat([lng, lat]),
    zoom: selectedStore ? 13 : 8,
  });

  useEffect(() => {
    if (!selectedStore) {
      setView({ center: fromLonLat([lng, lat]), zoom: 8 });
    }
  }, [selectedStore]);

  const getLabelText = (store: Store, numItems: number) => {
    let text = "";
    text = store.n.replaceAll("-", " ");

    if (selectedStore) {
      if (selectedStore === store) {
        text = text + " (" + numItems + ")";
      }
    } else {
      text = text + " (" + numItems + ")";
    }

    if (store === selectedStore) {
      text = text + " (SELECTED)";
    }

    return text;
  };

  return (
    <RMap
      className="map"
      noDefaultControls={true}
      initial={{
        center: selectedStore
          ? fromLonLat([selectedStore.l[1], selectedStore.l[0]])
          : fromLonLat([lng, lat]),
        zoom: selectedStore ? 13 : 8,
      }}
      view={[view, setView]}
    >
      <ROSM />
      <RControl.RZoom className="zoom" />

      <RLayerVector zIndex={10}>
        <RFeature
          // add extra distance to circle to compensate precision
          geometry={new Circle(fromLonLat([lng, lat]), miles * 1.4 * 1609.344)}
        >
          <RStyle.RStyle>
            <RStyle.RStroke color="gold" width={4} />
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
              maxZoom: 13,
            })
          }
        >
          <ROverlay className={`map-loc ${!selectedStore ? "selected" : ""}`}>
            {"YOU"}
          </ROverlay>
        </RFeature>

        {stores.map((store) => {
          const numItems = items.filter((item) => item.s === store.n).length;
          return numItems ? (
            <RFeature
              geometry={new Point(fromLonLat([store.l[1], store.l[0]]))}
              onClick={(e) => {
                // @ts-ignore
                e.map.getView().fit(e.target?.getGeometry().getExtent(), {
                  duration: 250,
                  maxZoom: store === selectedStore ? 8 : 13,
                });

                setTimeout(() => {
                  // show store items
                  if (!selectedStore || selectedStore !== store) {
                    setSelectedFilterIdx(-1);
                    toggleMap();
                  }

                  setSelectedStore(selectedStore === store ? undefined : store);
                }, 500);
              }}
            >
              <RStyle.RStyle>
                <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
              </RStyle.RStyle>

              <ROverlay
                className={`map-loc ${
                  selectedStore === store ? "selected" : ""
                } ${view.zoom <= 10 && !selectedStore ? "hide" : ""}`}
              >
                {getLabelText(store, numItems)}
              </ROverlay>
            </RFeature>
          ) : null;
        })}
      </RLayerVector>
    </RMap>
  );
}
