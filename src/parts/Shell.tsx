// ***
// Universal Info Display
// [Coded using purpose-oriented-programming]
// ***

import { useState, useEffect, useMemo } from "react";
import ContentSlider from "./ContentSlider";
import StatusBar from "./StatusBar";
import { filtersOn } from "./ButtonBar";
import MapWrapper from "./Map";
import Range from "./Range";
import Item from "./Item";
import Slider, { T_SLIDER_TYPE } from "./Slider";
import TitleBar from "./TitleBar";
import { getDistance } from "geolib";
import groupFilterData from "./config/groups.json";
import itemAliasData from "./config/item_aliases.json";
import filterDefaultData from "./config/filter_defaults.json";

// globals
declare global {
  var contentSliderPressed: boolean;
  var pageSliderPressed: boolean;
  var groupSliderPressed: boolean;
  var choiceSliderPressed: boolean;
  var scrollSpeed: number;
  var scrollDirection: "left" | "right" | "stopped";
}

globalThis.contentSliderPressed = false;
globalThis.pageSliderPressed = false;
globalThis.groupSliderPressed = false;
globalThis.choiceSliderPressed = false;
globalThis.scrollSpeed = 0;
globalThis.scrollDirection = "stopped";

// utils
export function chunkArr(arr: any[], size: number) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function chunkString(str: string, len: number) {
  const size = Math.ceil(str.length / len);
  const r = Array(size);
  let offset = 0;
  for (let i = 0; i < size; i++) {
    r[i] = str.substr(offset, len);
    offset += len;
  }
  return r;
}

// serious
export type UniversalInfoDisplayItem = any;

export type Store = {
  a: string; // address
  n: string; // name
  l: [number, number]; // location
  dist: number;
  numItems: number;
};

export type Slider = {
  type: "group" | "page" | "choice";
};

// filters
export type FilterType = "choice" | "range";

export type Choice = {
  field?: string;
  values: string[];
};

export type Filter = {
  name: string;
  alias?: string;
  type: FilterType;
  props: Choice[] | [number, number];
  val: Choice[] | number;
  sort: "asc" | "desc" | undefined;
};

// main
const UniversalInfoDisplay = (props: {
  contentType: "text" | "item";
  items: UniversalInfoDisplayItem[];
}) => {
  const [selectedPageIdx, setSelectedPageIdx] = useState(1);
  const [pagesBool, setPagesBool] = useState([true]);

  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupFilters, setGroupFilters] = useState<any>(groupFilterData);

  const [filterDefaults, setFilterDefaults] = useState<any>(filterDefaultData);
  const [selectedFilterIdx, setSelectedFilterIdx] = useState(0);
  const [filter1, setFilter1] = useState<Filter>();
  const [filter2, setFilter2] = useState<Filter>();
  const [filter3, setFilter3] = useState<Filter>();
  const [filter4, setFilter4] = useState<Filter>();
  const [filter5, setFilter5] = useState<Filter>();

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | undefined>();

  const [items, setItems] = useState<UniversalInfoDisplayItem[]>([]);
  const [selectedItemIdx, setSelectedItemIdx] = useState(-1);
  const [itemAliases, setItemAliases] = useState<any>(itemAliasData);

  const [map, toggleMap] = useState(false);
  const [miles, setMiles] = useState(50);

  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [key, setKey] = useState([]);

  const [fetching, setFetching] = useState(false);

  const getFilterChoiceValues = (
    key: string,
    items: UniversalInfoDisplayItem[]
  ) =>
    [
      ...new Set(
        Array.prototype.concat.apply(
          [],
          items.map((item) => item[key])
        )
      ),
    ] as string[];

  const getFilterRange = (key: string, items: UniversalInfoDisplayItem[]) => {
    const vals = items.map((item) => item[key]);
    return [
      Math.floor(Math.min(...vals) - 1),
      Math.ceil(Math.max(...vals)) + 1,
    ] as [number, number];
  };

  // TODO: Design
  const keyPath = "/data/keys";
  const getData = (group: string) => {
    setFetching(true);
    fetch(`${keyPath}/${group}.json`)
      .then((r) => r.json())
      .then((key) => {
        setKey(key);
        setSelectedGroup(group);
        getLocation();
      });
  };

  const filterItems = () => {
    let filteredItems: UniversalInfoDisplayItem[] = [...items];

    // store
    if (selectedStore) {
      filteredItems = filteredItems.filter(
        (item) => item.s === selectedStore.n
      );
    }

    // distance
    filteredItems = filteredItems.filter((item) => item.dist < miles);

    // choice
    [filter1, filter2, filter3, filter4, filter5]
      .filter((f) => f?.type === "choice")
      .forEach((f) => {
        if (f) {
          (f.val as Choice[]).forEach((c) => {
            const choiceItems: UniversalInfoDisplayItem = [];
            let choiceOn = false;
            const cVals = c.values as string[];

            cVals.forEach((val) => {
              choiceOn = true;
              choiceItems.push(
                ...filteredItems.filter(
                  (item) => c.field && item[c.field].includes(val)
                )
              );
            });

            if (choiceOn) {
              filteredItems = [...choiceItems];
            }
          });
        }
      });

    // ranges
    let rF = [filter1, filter2, filter3, filter4, filter5].filter(
      (f) => f && f.type === "range" && f.name !== "mi"
    ) as Filter[];

    rF.forEach((f) => {
      if (f) {
        filteredItems = [
          ...filteredItems.filter((item) =>
            !f.sort || f.sort === "asc"
              ? item[f.name] > f.val
              : item[f.name] < f.val
          ),
        ];
      }
    });

    // multi column range sort
    // more dependable than any algs tried

    // sort by ppu if no sort on all ranges
    if (!rF.some((f) => (f.sort ? true : false))) {
      filteredItems.sort((a, b) => a.ppu - b.ppu);
    } else {
      if (rF.length === 1) {
        rF[0].sort &&
          filteredItems.sort((a, b) =>
            rF[0].sort === "asc"
              ? a[rF[0].name] - b[rF[0].name]
              : b[rF[0].name] - a[rF[0].name]
          );
      } else if (rF.length === 2) {
        rF[0].sort &&
          rF[1].sort &&
          filteredItems.sort(
            (a, b) =>
              (rF[0].sort === "asc"
                ? a[rF[0].name] - b[rF[0].name]
                : b[rF[0].name] - a[rF[0].name]) ||
              (rF[1].sort === "asc"
                ? a[rF[1].name] - b[rF[1].name]
                : b[rF[1].name] - a[rF[1].name])
          );
      } else if (rF.length === 3) {
        rF[0].sort &&
          rF[1].sort &&
          rF[2].sort &&
          filteredItems.sort(
            (a, b) =>
              (rF[0].sort === "asc"
                ? a[rF[0].name] - b[rF[0].name]
                : b[rF[0].name] - a[rF[0].name]) ||
              (rF[1].sort === "asc"
                ? a[rF[1].name] - b[rF[1].name]
                : b[rF[1].name] - a[rF[1].name]) ||
              (rF[2].sort === "asc"
                ? a[rF[2].name] - b[rF[2].name]
                : b[rF[2].name] - a[rF[2].name])
          );
      } else if (rF.length === 4) {
        rF[0].sort &&
          rF[1].sort &&
          rF[2].sort &&
          rF[3].sort &&
          filteredItems.sort(
            (a, b) =>
              (rF[0].sort === "asc"
                ? a[rF[0].name] - b[rF[0].name]
                : b[rF[0].name] - a[rF[0].name]) ||
              (rF[1].sort === "asc"
                ? a[rF[1].name] - b[rF[1].name]
                : b[rF[1].name] - a[rF[1].name]) ||
              (rF[2].sort === "asc"
                ? a[rF[2].name] - b[rF[2].name]
                : b[rF[2].name] - a[rF[2].name]) ||
              (rF[3].sort === "asc"
                ? a[rF[3].name] - b[rF[3].name]
                : b[rF[3].name] - a[rF[3].name])
          );
      } else if (rF.length === 5) {
        rF[0].sort &&
          rF[1].sort &&
          rF[2].sort &&
          rF[3].sort &&
          rF[4].sort &&
          filteredItems.sort(
            (a, b) =>
              (rF[0].sort === "asc"
                ? a[rF[0].name] - b[rF[0].name]
                : b[rF[0].name] - a[rF[0].name]) ||
              (rF[1].sort === "asc"
                ? a[rF[1].name] - b[rF[1].name]
                : b[rF[1].name] - a[rF[1].name]) ||
              (rF[2].sort === "asc"
                ? a[rF[2].name] - b[rF[2].name]
                : b[rF[2].name] - a[rF[2].name]) ||
              (rF[3].sort === "asc"
                ? a[rF[3].name] - b[rF[3].name]
                : b[rF[3].name] - a[rF[3].name]) ||
              (rF[4].sort === "asc"
                ? a[rF[4].name] - b[rF[4].name]
                : b[rF[4].name] - a[rF[4].name])
          );
      }
    }
    return filteredItems;
  };

  const sliderSelect = (type: T_SLIDER_TYPE, title: string, field?: string) => {
    const toggleChoice = (choices: Choice[], field: string, title: string) => {
      const choices_copy = [...choices];
      const selectedChoice = choices_copy.find((c) => c.field === field);

      if (selectedChoice) {
        if (selectedChoice.values.includes(title)) {
          selectedChoice.values = selectedChoice.values.filter(
            (v) => v !== title
          );
        } else {
          selectedChoice.values.push(title);
        }
      }

      return choices_copy;
    };

    if (type === "page") {
      setSelectedPageIdx(parseInt(title));
    } else if (type === "group") {
      if (title !== selectedGroup) {
        setFilter1(undefined);
        setFilter2(undefined);
        setFilter3(undefined);
        setFilter4(undefined);
        setFilter5(undefined);
        setSelectedPageIdx(1);
        setSelectedGroup(title);
      }
    } else if (type === "choice" && field) {
      setSelectedPageIdx(1);
      if (selectedFilterIdx === 1 && filter1) {
        setFilter1({
          ...filter1,
          val: toggleChoice(filter1?.val as Choice[], field, title),
        });
      } else if (selectedFilterIdx === 2 && filter2) {
        setFilter2({
          ...filter2,
          val: toggleChoice(filter2?.val as Choice[], field, title),
        });
      } else if (selectedFilterIdx === 3 && filter3) {
        setFilter3({
          ...filter3,
          val: toggleChoice(filter3?.val as Choice[], field, title),
        });
      } else if (selectedFilterIdx === 4 && filter4) {
        setFilter4({
          ...filter4,
          val: toggleChoice(filter4?.val as Choice[], field, title),
        });
      } else if (selectedFilterIdx === 5 && filter5) {
        setFilter5({
          ...filter5,
          val: toggleChoice(filter5?.val as Choice[], field, title),
        });
      }
    } else if (type === "clear-filters") {
      clearFilters();
    }
  };

  const rangeSelect = (
    idx: number,
    unit: string,
    val: number,
    sort?: "asc" | "desc"
  ) => {
    const eleStatus = document.querySelector(
      "#filter_range_status"
    ) as HTMLSpanElement;

    if (eleStatus) {
      eleStatus.style.opacity = "1";
      eleStatus.innerHTML =
        (!sort || sort === "asc" ? ">" : "") +
        (sort === "asc" ? ">" : "") +
        (unit === "$" ? "$" : "") +
        val.toString() +
        (unit !== "$" ? unit : "");
      setTimeout(() => {
        eleStatus.style.opacity = "0";
      }, 1000);
    }

    if (idx === 1 && filter1) {
      setFilter1({ ...filter1, val: val });
    } else if (idx === 2 && filter2) {
      setFilter2({ ...filter2, val: val });
    } else if (idx === 3 && filter3) {
      setFilter3({ ...filter3, val: val });
    } else if (idx === 4 && filter4) {
      setFilter4({ ...filter4, val: val });
    } else if (idx === 5 && filter5) {
      setFilter5({ ...filter5, val: val });
    }

    if (unit === "mi") {
      setMiles(val);
    }
  };

  const filteredItems = useMemo(filterItems, [
    filter1?.val,
    filter2?.val,
    filter3?.val,
    filter4?.val,
    filter5?.val,
    filter1?.sort,
    filter2?.sort,
    filter3?.sort,
    filter4?.sort,
    filter5?.sort,
    selectedStore,
    miles,
  ]);

  const clearFilters = () => {
    const clearChoiceVal = (f: Filter) =>
      (f.val as Choice[]).map((c) => ({
        field: c.field,
        values: [],
      }));

    setSelectedFilterIdx(0);
    setSelectedPageIdx(1);

    if (filter1) {
      setFilter1({
        ...filter1,
        val: filter1.type === "choice" ? clearChoiceVal(filter1) : filter1.val,
        sort: undefined,
      });
    }
    if (filter2) {
      setFilter2({
        ...filter2,
        val: filter2.type === "choice" ? clearChoiceVal(filter2) : filter2.val,
        sort: undefined,
      });
    }
    if (filter3) {
      setFilter3({
        ...filter3,
        val: filter3.type === "choice" ? clearChoiceVal(filter3) : filter3.val,
        sort: undefined,
      });
    }
    if (filter4) {
      setFilter4({
        ...filter4,
        val: filter4.type === "choice" ? clearChoiceVal(filter4) : filter4.val,
        sort: undefined,
      });
    }
    if (filter5) {
      setFilter5({
        ...filter5,
        val: filter5.type === "choice" ? clearChoiceVal(filter5) : filter5.val,
        sort: undefined,
      });
    }
  };

  useEffect(() => {
    const fetchData = async (uri: string) => {
      return fetch(uri)
        .then((resp) => resp.json())
        .catch((e) => console.log("fetch error: " + uri));
    };

    if (lat && lng && key.length) {
      // stores within miles
      const loc_distance = key
        .map((k: any) => {
          if (k["l"][0] && k["l"][1]) {
            let dist = getDistance(
              { latitude: lat, longitude: lng },
              {
                latitude: k["l"][0],
                longitude: k["l"][1],
              }
            );
            dist = dist / 1609.34;
            return { ...k, dist: dist.toFixed(3) };
          }
        })
        .sort((a, b) => a.dist - b.dist)
        .filter((i) => i.dist < miles);

      // all fetches
      const reqs: any = [];
      loc_distance.forEach((loc) => {
        const uri = `/data/groups/${selectedGroup}/${encodeURIComponent(
          loc["a"]
        )}.json`;
        reqs.push(fetchData(uri));
      });

      // all fetches complete
      Promise.all(reqs).then((resp) => {
        let stores_all = resp
          .filter((resp) => resp)
          .map((store_items: any) => {
            return {
              // TODO: re-think dealing with menu
              items: store_items,
              total: 0,
              dist: loc_distance.filter((l) => l?.a === store_items[0]?.a)[0]
                ?.dist,
            };
          })
          .sort((a, b) => a.dist - b.dist);

        // set total items property
        stores_all.forEach((store, idx) => {
          let store_total = 0;
          store.items.forEach((item: any) => {
            store_total += item.c.length;
          });
          stores_all[idx]["total"] = store_total;
        });

        // add items to all array
        const all_items: any = [];
        stores_all = stores_all.filter((store) => store.items.length > 0);

        stores_all = stores_all.filter((store) => {
          store.items.forEach((item: any) => {
            item.c.forEach((cut: any) => {
              all_items.push({
                ...item,
                g: [cut.g + "g"],
                $: cut.$.toFixed(0),
                ppu: (cut.$ / cut.g).toFixed(1),
                dist: store.dist,
              });
            });
          });

          return true;
        });

        // set stores state
        const stores_final = stores_all.map((store: any) => ({
          a: store.items[0].a,
          n: store.items[0].s,
          l: loc_distance.filter((l) => l?.a === store.items[0]?.a)[0]?.l,
          dist: store.dist,
          numItems: store.total,
        }));
        setStores(stores_final);

        // Set all items state
        setItems(
          all_items.map((item: any, idx: number) => ({ id: idx, ...item }))
        );

        // value doesn't matter for now
        setPagesBool(
          chunkArr(all_items, 6).map((item: UniversalInfoDisplayItem) => true)
        );

        // set max min miles
        const maxMiles = miles;
        const minMiles = Math.floor(all_items[0].dist) + 1;
        setMiles(maxMiles);

        // set filters with groups.json data
        const groupFilter = groupFilters.find(
          (g: any) => g.group === selectedGroup
        );
        const groupFilterIdx = groupFilters.findIndex(
          (g: any) => g.group === selectedGroup
        );

        if (groupFilter) {
          Object.entries(groupFilter)
            .filter(([key]) => key !== "group")
            .forEach(([key, obj]: any, idx) => {
              // choices
              const choices: Choice[] = [];
              key.split(",").forEach((field: string) => {
                let choice_values = getFilterChoiceValues(field, all_items);
                if (field === "g") {
                  choice_values = choice_values
                    .map((choice) => parseFloat(choice.replace(/[^0-9.]/g, "")))
                    .sort((a, b) => a - b)
                    .map((choice) => choice + key);
                }
                choices.push({ field: field, values: choice_values });
              });

              // range
              let range = getFilterRange(key, all_items);
              if (key === "mi") {
                range = [minMiles, maxMiles];
              }

              const fObj: Filter = {
                name: key,
                alias: obj.alias,
                type: obj.type as FilterType,
                props: obj.type === "choice" ? choices : range,
                val:
                  obj.type === "choice"
                    ? choices.map((c) => ({
                        field: c.field,
                        values:
                          c.field && filterDefaults[groupFilterIdx][c.field]
                            ? [filterDefaults[groupFilterIdx][c.field]]
                            : [],
                      }))
                    : key === "mi"
                    ? maxMiles
                    : range[0],
                sort: undefined,
              };

              if (idx === 0) {
                setFilter1(fObj);
              } else if (idx === 1) {
                setFilter2(fObj);
              } else if (idx === 2) {
                setFilter3(fObj);
              } else if (idx === 3) {
                setFilter4(fObj);
              } else if (idx === 4) {
                setFilter5(fObj);
              }
            });
        }

        setFetching(false);
      });
    }
  }, [lat, lng]);

  const getLocation = () => {
    setTimeout(() => {
      console.log("setting location to boston");
      setLat(42.364506);
      setLng(-71.038887);
    }, 1000);

    /*
    navigator.geolocation.getCurrentPosition((position) => {
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
    });
    */
  };

  return (
    <div className="universal_info_display">
      <TitleBar
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        totalPages={chunkArr(filteredItems, 6).length}
        selectedStore={selectedStore}
        fetching={fetching}
        map={map}
        totalItems={filteredItems.length}
        close={() => {
          setSelectedGroup("");
          setSelectedItemIdx(-1);
          setSelectedStore(undefined);
          setFetching(false);
          setLat(0);
          setLng(0);
          setItems([]);
          setStores([]);
          setKey([]);
          toggleMap(false);
          setFilter1(undefined);
          setFilter2(undefined);
          setFilter3(undefined);
          setFilter4(undefined);
          setFilter5(undefined);
        }}
        showCloseIcon={fetching}
      />

      {selectedItemIdx > -1 && (
        <Item item={items[selectedItemIdx]} close={setSelectedItemIdx} />
      )}

      {map ? (
        <MapWrapper
          lng={lng}
          lat={lat}
          items={filteredItems}
          stores={stores.filter((store) => store.dist < miles)}
          miles={miles}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          setSelectedFilterIdx={setSelectedFilterIdx}
          map={map}
          toggleMap={() => toggleMap(!map)}
        />
      ) : (
        <ContentSlider
          contentType={props.contentType}
          items={
            selectedGroup
              ? filteredItems
              : groupFilters.map((g: any) => ({ n: g.group }))
          }
          pagesBool={pagesBool}
          setPagesBool={setPagesBool}
          selectedGroup={selectedGroup}
          setSelectedPageIdx={setSelectedPageIdx}
          selectedPageIdx={selectedPageIdx}
          setSelectedItemIdx={setSelectedItemIdx}
          getData={(group) => getData(group)}
          fetching={fetching}
          filtersOn={filtersOn([filter1, filter2, filter3, filter4, filter5])}
        />
      )}

      <span id="filter_range_status" />

      <StatusBar
        selectedGroup={selectedGroup}
        selectedFilterIdx={selectedFilterIdx}
        setSelectedFilterIdx={(idx) => setSelectedFilterIdx(idx)}
        filter1={filter1}
        filter2={filter2}
        filter3={filter3}
        filter4={filter4}
        filter5={filter5}
        fetching={fetching}
        map={map}
        toggleMap={(val) => toggleMap(val)}
        aliases={
          itemAliases[
            groupFilters.findIndex((g: any) => g.group === selectedGroup)
          ]
        }
        filtersOn={filtersOn([filter1, filter2, filter3, filter4, filter5])}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
      />

      {selectedFilterIdx !== 0 &&
        [filter1, filter2, filter3, filter4, filter5].map((f, idx) => {
          if (
            f &&
            (selectedFilterIdx === idx + 1 ||
              (f.name === "mi" &&
                (map || selectedStore) &&
                (selectedFilterIdx === idx + 1 || selectedFilterIdx === 0)))
          ) {
            if (f.type === "range") {
              return (
                <Range
                  key={idx}
                  idx={idx + 1}
                  f={f}
                  set={rangeSelect}
                  setFilter1={setFilter1}
                  setFilter2={setFilter2}
                  setFilter3={setFilter3}
                  setFilter4={setFilter4}
                  setFilter5={setFilter5}
                />
              );
            } else if (f.type === "choice") {
              return (
                <Slider
                  key={idx}
                  type={"choice"}
                  choices={f.props as Choice[]}
                  selected={f.val as Choice[]}
                  select={sliderSelect}
                  fetching={fetching}
                  aliases={
                    itemAliases[
                      groupFilters.findIndex(
                        (g: any) => g.group === selectedGroup
                      )
                    ]
                  }
                />
              );
            }
          }
        })}

      {!map && selectedGroup && !fetching && (
        <Slider
          type={"page"}
          titles={
            filteredItems.length
              ? chunkArr(filteredItems, 6).map((item, idx) =>
                  (idx + 1).toString()
                )
              : ["0"]
          }
          selected={[selectedPageIdx.toString()]}
          select={sliderSelect}
          setSelectedPageIdx={setSelectedPageIdx}
          fetching={fetching}
        />
      )}
    </div>
  );
};

export default UniversalInfoDisplay;
