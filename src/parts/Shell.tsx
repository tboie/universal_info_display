// ***
// Universal Info Display
// [Coded using purpose-oriented-programming]
// ***

import "./Shell.css";

import { useState, useEffect, useMemo } from "react";
import ContentSlider from "./ContentSlider";
import FilterBar from "./FilterBar";
import MapWrapper from "./Map";
import Range from "./Range";
import Item from "./Item";
import Slider, { SliderType } from "./Slider";
import TitleBar from "./TitleBar";
import { getDistance } from "geolib";
import groupFilterData from "./config/groups.json";
import itemAliasData from "./config/item_aliases.json";
import filterDefaultData from "./config/filter_defaults.json";

import searchConfig from "./config/search.json";
import Fuse from "fuse.js";

// page change and page snap utils
declare global {
  var pointerActivated: boolean;
  var pointerPosDown: undefined | [number, number];
  var pointerPos: undefined | [number, number];
  var filterControlPressed: boolean;
  var contentSliderPressed: boolean;
  var pageSliderPressed: boolean;
  var scrollSpeed: number;
  var scrollDirection: "left" | "right" | "stopped";
}

globalThis.pointerActivated = false;
globalThis.pointerPosDown = undefined;
globalThis.pointerPos = undefined;
globalThis.contentSliderPressed = false;
globalThis.pageSliderPressed = false;
globalThis.filterControlPressed = false;

globalThis.scrollSpeed = 0;
globalThis.scrollDirection = "stopped";

// utils
export function chunkArr(arr: any[], size: number) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
    arr.slice(i * size, i * size + size)
  );
}

// serious
export type UniversalInfoDisplayItem = any;

export type Store = {
  a: string; // address
  n: string; // name
  l: [number, number]; // location
  mi: number;
  numItems: number;
};

// filters
export type FilterType = "choice" | "range";
export type FilterChoiceType = "string" | "number";
export type FilterChoiceValues = string[] | number[];
export type FilterChoice = {
  field: string;
  values: FilterChoiceValues;
  type: FilterChoiceType;
};
export type FilterRange = [number, number];
export type FilterOp = ">" | "<" | undefined;
export type FilterSort = "asc" | "desc" | undefined;

export type Filter = {
  i: number;
  name: string;
  alias?: string;
  type: FilterType;
  props: FilterChoice[] | FilterRange;
  val: FilterChoice[] | number;
  sort: FilterSort;
  op: FilterOp;
};

// config
// data structure prob going to change on port
export const groupFilters: any = groupFilterData;
export const itemAliases: any = itemAliasData;
export const filterDefaults: any = filterDefaultData;

// main
const UniversalInfoDisplay = () => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedPageIdx, setSelectedPageIdx] = useState(1);

  const [selectedFilterIdx, setSelectedFilterIdx] = useState(-1);
  const [filter0, setFilter0] = useState<Filter>();
  const [filter1, setFilter1] = useState<Filter>();
  const [filter2, setFilter2] = useState<Filter>();
  const [filter3, setFilter3] = useState<Filter>();
  const [filter4, setFilter4] = useState<Filter>();
  const [filter5, setFilter5] = useState<Filter>();
  const [filter6, setFilter6] = useState<Filter>();
  const [filter7, setFilter7] = useState<Filter>();
  const [rangeModal, setRangeModal] = useState(false);

  const [search, setSearch] = useState(false);
  const [searchStr, setSearchStr] = useState<string>("");

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | undefined>();

  const [items, setItems] = useState<UniversalInfoDisplayItem[]>([]);
  const [selectedItemIdx, setSelectedItemIdx] = useState(-1);
  const [itemModal, setItemModal] = useState(false);

  const [map, setMap] = useState(false);
  const [miles, setMiles] = useState(50);

  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [key, setKey] = useState([]);

  const [fetching, setFetching] = useState(false);

  const getFilterChoicesFromItems = (
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
    ] as string[] | number[];

  const getFilterChoiceType = (values: any[]) => {
    return (
      values.every((i: any) => typeof i === "number") ? "number" : "string"
    ) as FilterChoiceType;
  };

  const getFilterRangeMinMaxFromItems = (
    key: string,
    items: UniversalInfoDisplayItem[]
  ) => {
    const vals = items.map((item) => item[key]);
    return [
      Math.floor(Math.min(...vals) - 1),
      Math.ceil(Math.max(...vals)) + 1,
    ] as FilterRange;
  };

  const getDefaultFilterChoiceVal = (
    groupIdx: number,
    choices: FilterChoice[],
    type: FilterChoiceType
  ) => {
    return choices.map((c) => ({
      field: c.field,
      values:
        c.field && filterDefaults[groupIdx][c.field]
          ? filterDefaults[groupIdx][c.field]
          : [],
      type: type,
    }));
  };

  const getDefaultFilterRangeVal = (name: string, range: FilterRange) => {
    return getDefaultFilterOp("range", name) === "<" ? range[1] : range[0];
  };

  const getFilters = () => [
    { f: filter0, set: setFilter0 },
    { f: filter1, set: setFilter1 },
    { f: filter2, set: setFilter2 },
    { f: filter3, set: setFilter3 },
    { f: filter4, set: setFilter4 },
    { f: filter5, set: setFilter5 },
    { f: filter6, set: setFilter6 },
    { f: filter7, set: setFilter7 },
  ];

  const getFilterByIdx = (idx: number) =>
    getFilters().find((obj) => obj.f?.i === idx);

  const getDefaultFilterOp = (type: FilterType, name: string) => {
    return type === "range"
      ? name === "$" || name === "mi"
        ? "<"
        : ">"
      : undefined;
  };

  const filterItems = () => {
    let filteredItems: UniversalInfoDisplayItem[] = [...items];

    if (search) {
      if (searchStr) {
        // isCaseSensitive: false,
        // includeScore: false,
        // shouldSort: true,
        // includeMatches: false,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        // threshold: 0.6,
        // distance: 100,
        // useExtendedSearch: false,
        // ignoreLocation: false,
        // ignoreFieldNorm: false,
        // fieldNormWeight: 1,
        const options = searchConfig;
        const fuse = new Fuse(filteredItems, options);

        // Change the pattern
        const pattern = searchStr;

        filteredItems = fuse.search(pattern).map((obj) => obj.item);
      } else {
        filteredItems = [];
      }
    } else {
      // store
      if (selectedStore) {
        filteredItems = filteredItems.filter(
          (item) => item.s === selectedStore.n
        );
      }

      // choice
      getFilters()
        .map((obj) => obj.f)
        .filter((f) => f?.type === "choice" && f.name === "groups")
        .forEach((f) => {
          if (f) {
            (f.val as FilterChoice[]).forEach((c) => {
              const choiceItems: UniversalInfoDisplayItem = [];
              let choiceOn = false;

              const cVals = c.values;
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

      // range filters
      let rF = getFilters()
        .map((obj) => obj.f)
        .filter((f) => f?.type === "range") as Filter[];

      // filter items by range value
      rF.forEach(
        (f) =>
          (filteredItems = filteredItems.filter((item) =>
            f.op === ">" ? item[f.name] > f.val : item[f.name] < f.val
          ))
      );

      // multi column range sort from first -> last
      // more dependable than any algs tried
      rF = rF.filter((f) => f.sort);
      if (rF.length === 1) {
        filteredItems.sort((a, b) =>
          rF[0].sort === "asc"
            ? a[rF[0].name] - b[rF[0].name]
            : b[rF[0].name] - a[rF[0].name]
        );
      } else if (rF.length === 2) {
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
      } else if (rF.length === 6) {
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
              : b[rF[4].name] - a[rF[4].name]) ||
            (rF[5].sort === "asc"
              ? a[rF[5].name] - b[rF[5].name]
              : b[rF[5].name] - a[rF[5].name])
        );
      } else if (rF.length === 7) {
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
              : b[rF[4].name] - a[rF[4].name]) ||
            (rF[5].sort === "asc"
              ? a[rF[5].name] - b[rF[5].name]
              : b[rF[5].name] - a[rF[5].name]) ||
            (rF[6].sort === "asc"
              ? a[rF[6].name] - b[rF[6].name]
              : b[rF[6].name] - a[rF[6].name])
        );
      } else if (rF.length === 8) {
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
              : b[rF[4].name] - a[rF[4].name]) ||
            (rF[5].sort === "asc"
              ? a[rF[5].name] - b[rF[5].name]
              : b[rF[5].name] - a[rF[5].name]) ||
            (rF[6].sort === "asc"
              ? a[rF[6].name] - b[rF[6].name]
              : b[rF[6].name] - a[rF[6].name]) ||
            (rF[7].sort === "asc"
              ? a[rF[7].name] - b[rF[7].name]
              : b[rF[7].name] - a[rF[7].name])
        );
      } else {
        // sort by ppu asc by default
        filteredItems = filteredItems.sort((a, b) => a.ppu - b.ppu);
      }
    }

    return filteredItems;
  };

  const filteredItems = useMemo(filterItems, [
    filter0,
    filter1,
    filter2,
    filter3,
    filter4,
    filter5,
    filter6,
    filter7,
    selectedStore,
    miles,
    searchStr,
    search,
  ]);

  const goToPage = (idx: number) => {
    globalThis.contentSliderPressed = false;
    globalThis.filterControlPressed = false;
    globalThis.pageSliderPressed = false;
    setSelectedPageIdx(idx);
  };

  const sliderSelect = (type: SliderType, title: string, field?: string) => {
    const toggleChoice = (
      choices: FilterChoice[],
      field: string,
      title: string
    ) => {
      const choices_copy = [...choices];
      const selectedChoice = choices_copy.find((c) => c.field === field);

      if (selectedChoice) {
        if (selectedChoice.type === "string") {
          const vals = selectedChoice.values as string[];
          if (vals.includes(title)) {
            selectedChoice.values = vals.filter((v) => v !== title);
          } else {
            vals.push(title);
          }
        } else if (selectedChoice.type === "number") {
          const vals = selectedChoice.values as number[];
          const titleNum = parseFloat(title.replace(field, ""));
          if (vals.includes(titleNum)) {
            selectedChoice.values = vals.filter((v) => v !== titleNum);
          } else {
            vals.push(titleNum);
          }
        }
      }

      return choices_copy;
    };

    if (type === "page") {
      setSelectedPageIdx(parseInt(title));
    } else if (type === "group") {
      close(map);
      getData(title);
    } else if (type === "choice" && field) {
      const obj = getFilterByIdx(selectedFilterIdx);
      if (obj && obj.f) {
        obj.set({
          ...obj.f,
          val: toggleChoice(obj.f.val as FilterChoice[], field, title),
        });
      }
      goToPage(1);
    }
  };

  const rangeSelect = (idx: number, unit: string, val: number) => {
    const obj = getFilterByIdx(idx);
    if (obj && obj.f) {
      obj.set({ ...obj.f, val: val });
    }

    if (unit === "mi") {
      setMiles(val);
    }
  };

  // filter_defaults.json vals not applied, all filters cleared
  const clearFilters = (idx?: number) => {
    const clearChoiceVal = (f: Filter) => {
      return (f.val as FilterChoice[]).map((c) => ({
        ...c,
        values: [],
      }));
    };

    const clearRangeVal = (f: Filter) => {
      return getDefaultFilterRangeVal(f.name, f.props as FilterRange);
    };

    const clearVal = (f: Filter) => {
      return f.type === "choice" ? clearChoiceVal(f) : clearRangeVal(f);
    };

    getFilters().forEach((obj) => {
      if (obj && obj.f && obj.f.name !== "group") {
        if (idx === selectedFilterIdx || typeof idx === "undefined") {
          obj.set({
            ...obj.f,
            val: clearVal(obj.f),
            sort: undefined,
            op: getDefaultFilterOp(obj.f.type, obj.f.name),
          });
        }
      }
    });

    setSearchStr("");
    setSearch(false);
    goToPage(1);
  };

  // TODO: Design
  const keyPath = "/data/keys";
  const getData = (group: string) => {
    setFetching(true);
    setSelectedGroup(group);

    fetch(`${keyPath}/${group}.json`)
      .then((r) => r.json())
      .then((key) => {
        setKey(key);
        getLocation();
      });
  };

  const getLocation = () => {
    setTimeout(() => {
      console.log("setting location to boston");
      setLat(42.364506);
      setLng(-71.038887);
    }, 500);

    /*
    navigator.geolocation.getCurrentPosition((position) => {
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
    });
    */
  };

  // device lat/lng changed
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
            return { ...k, mi: dist.toFixed(1) };
          }
          return { ...k, mi: 0 };
        })
        .filter((i) => i.mi && i.mi < miles)
        .sort((a, b) => a.mi - b.mi);

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
              mi: loc_distance.filter((l) => l?.a === store_items[0]?.a)[0].mi,
            };
          })
          .sort((a, b) => a.mi - b.mi);

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

        // create new item for each cut
        stores_all = stores_all.filter((store) => {
          store.items.forEach((item: any) => {
            item.c.forEach((cut: any) => {
              all_items.push({
                ...item,
                g: [cut.g],
                $: cut.$.toFixed(0),
                ppu: (cut.$ / cut.g).toFixed(1),
                mi: store.mi,
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
          mi: store.mi,
          numItems: store.total,
        }));
        setStores(stores_final);

        // Set all items state
        setItems(
          all_items.map((item: any, idx: number) => ({
            ...item,
            idx: idx,
            desc: sampleText,
            // TODO: dont do this here
            "%": Math.round(item["%"]),
          }))
        );

        // set max min miles
        const maxMiles = miles;
        const minMiles = Math.floor(all_items[0].mi) + 1;
        setMiles(maxMiles);

        // set filters with groups.json data
        let groupFilter = groupFilters.find(
          (g: any) => g.group === selectedGroup
        );
        const groupFilterIdx = groupFilters.findIndex(
          (g: any) => g.group === selectedGroup
        );

        if (groupFilter) {
          Object.entries(groupFilter).forEach(([key, obj]: any, idx) => {
            let choices: FilterChoice[] = [];
            let choice_type: FilterChoiceType = "string";
            let range: FilterRange = [0, 0];

            // groups filter if multiple
            if (groupFilters.length > 1 && key === "group") {
              obj = {
                type: "choice",
              };
              choices.push({
                field: key,
                values: groupFilters.map((g: any) => g.group),
                type: "string",
              });
            } else {
              // choices filter
              if (obj.type === "choice") {
                key.split(",").forEach((field: string) => {
                  const choice_values = getFilterChoicesFromItems(
                    field,
                    all_items
                  );
                  choice_type = getFilterChoiceType(choice_values);

                  if (choice_type === "number") {
                    choice_values.sort((a: any, b: any) => a - b);
                  } else {
                    choice_values.sort();
                  }
                  choices.push({
                    field: field,
                    values: choice_values,
                    type: choice_type,
                  });
                });
              }
              // range filter
              else if (obj.type === "range") {
                range = getFilterRangeMinMaxFromItems(key, all_items);
                if (key === "mi") {
                  range = [minMiles, maxMiles];
                }
              }
            }

            const fObj: Filter = {
              i: idx,
              name: key,
              alias: obj.alias,
              type: obj.type as FilterType,
              props: obj.type === "choice" ? choices : range,
              val:
                obj.type === "choice"
                  ? key === "group"
                    ? [
                        {
                          field: key,
                          values: [selectedGroup],
                          type: "string",
                        },
                      ]
                    : getDefaultFilterChoiceVal(
                        groupFilterIdx,
                        choices,
                        choice_type
                      )
                  : getDefaultFilterRangeVal(key, range),
              sort: undefined,
              op: getDefaultFilterOp(obj.type, key),
            };

            if (idx === 0) {
              setFilter0(fObj);
            } else if (idx === 1) {
              setFilter1(fObj);
            } else if (idx === 2) {
              setFilter2(fObj);
            } else if (idx === 3) {
              setFilter3(fObj);
            } else if (idx === 4) {
              setFilter4(fObj);
            } else if (idx === 5) {
              setFilter5(fObj);
            } else if (idx === 6) {
              setFilter6(fObj);
            } else if (idx === 7) {
              setFilter7(fObj);
            }
          });
        }

        setFetching(false);
      });
    }
  }, [lat, lng]);

  const close = (keepMap?: boolean) => {
    setSelectedGroup("");
    setSelectedItemIdx(-1);
    setSelectedFilterIdx(-1);
    setSelectedStore(undefined);
    setFetching(false);
    setItems([]);
    setStores([]);
    setKey([]);
    setLat(0);
    setLng(0);
    if (!keepMap) setMap(false);
    setFilter0(undefined);
    setFilter1(undefined);
    setFilter2(undefined);
    setFilter3(undefined);
    setFilter4(undefined);
    setFilter5(undefined);
    setFilter6(undefined);
    setFilter7(undefined);
    goToPage(1);
  };

  return (
    <div
      className="universal-info-display"
      onTouchMove={(e) => {
        if (globalThis.filterControlPressed) {
          const pos = globalThis.pointerPos;
          const posDown = globalThis.pointerPosDown;

          if (pos && posDown) {
            const yDist = posDown[1] - pos[1];

            if (yDist > 24 || yDist < -24 || globalThis.pointerActivated) {
              globalThis.pointerActivated = true;

              const dist = pos[1] - e.touches[0].pageY;
              const container = document.querySelector(
                ".filter-controls"
              ) as HTMLDivElement;

              if (container) {
                const eleHeight = container.getBoundingClientRect().height;
                const minHeight = parseFloat(
                  window
                    .getComputedStyle(container, null)
                    .getPropertyValue("min-height")
                    .replace("px", "")
                );
                const maxHeight = parseFloat(
                  window
                    .getComputedStyle(container, null)
                    .getPropertyValue("max-height")
                    .replace("px", "")
                );

                const selFilter = getFilterByIdx(selectedFilterIdx)?.f;
                if (selFilter) {
                  if (eleHeight + dist > minHeight) {
                    if (!container.classList.contains("column")) {
                      container.classList.add("column");
                    }
                    container.style.height = eleHeight + dist + "px";
                  } else if (eleHeight + dist < minHeight) {
                    if (container.classList.contains("column")) {
                      container.classList.remove("column");
                    }
                    container.style.height = minHeight + "px";
                  } else if (eleHeight + dist > maxHeight) {
                    container.style.height = maxHeight + "px";
                  }
                }
              }
            }
          }
          globalThis.pointerPos = [e.touches[0].pageX, e.touches[0].pageY];
        }
      }}
      onTouchEnd={(e) => {
        globalThis.pointerPosDown = undefined;
        globalThis.pointerPos = undefined;
        globalThis.pointerActivated = false;
      }}
    >
      <TitleBar
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        totalPages={chunkArr(filteredItems, 6).length}
        selectedStore={selectedStore}
        setSelectedStore={(store) => setSelectedStore(store)}
        fetching={fetching}
        map={map}
        totalItems={filteredItems.length}
        close={() => close()}
        setMap={(val) => setMap(val)}
        setSelectedFilterIdx={setSelectedFilterIdx}
        goToPage={goToPage}
      />

      {itemModal && (
        <Item
          selectedItemIdx={selectedItemIdx}
          item={items[selectedItemIdx]}
          close={() => setItemModal(false)}
          selectedGroup={selectedGroup}
          getData={getData}
          goToPage={goToPage}
          setItemModal={setItemModal}
          setSelectedFilterIdx={setSelectedFilterIdx}
        />
      )}

      {map && !fetching && (
        <MapWrapper
          lng={lng}
          lat={lat}
          items={filteredItems}
          stores={stores.filter((store) => store.mi < miles)}
          miles={miles}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          setSelectedFilterIdx={setSelectedFilterIdx}
          map={map}
          toggleMap={() => setMap(!map)}
          goToPage={goToPage}
        />
      )}

      {(!map || fetching) && (
        <ContentSlider
          type={"grid"}
          items={
            selectedGroup
              ? filteredItems
              : groupFilters.map((g: any) => ({ n: g.group }))
          }
          selectedGroup={selectedGroup}
          setSelectedPageIdx={setSelectedPageIdx}
          selectedPageIdx={selectedPageIdx}
          selectedItemIdx={selectedItemIdx}
          setSelectedItemIdx={setSelectedItemIdx}
          setItemModal={setItemModal}
          getData={(group) => getData(group)}
          fetching={fetching}
          rangeModal={rangeModal}
          selectedFilter={getFilterByIdx(selectedFilterIdx)?.f}
          searchStr={searchStr}
        />
      )}

      {selectedGroup && !fetching && (
        <div
          className={`filter-controls ${
            selectedFilterIdx > -1 ? "sel" : "off"
          }`}
          onPointerDown={(e) => {
            e.stopPropagation();
            globalThis.filterControlPressed = true;
            globalThis.pageSliderPressed = false;
            globalThis.contentSliderPressed = false;
          }}
          onTouchEnd={(e) => {
            const ctrlContainer = document.querySelector(
              ".filter-controls"
            ) as HTMLDivElement;

            if (ctrlContainer) {
              ctrlContainer.classList.remove("dragging");
            }
          }}
        >
          <FilterBar
            selectedGroup={selectedGroup}
            selectedFilterIdx={selectedFilterIdx}
            setSelectedFilterIdx={(idx) => setSelectedFilterIdx(idx)}
            filter0={filter0}
            filter1={filter1}
            filter2={filter2}
            filter3={filter3}
            filter4={filter4}
            filter5={filter5}
            filter6={filter6}
            filter7={filter7}
            fetching={fetching}
            map={map}
            toggleMap={(val) => setMap(val)}
            aliases={
              itemAliases[
                groupFilters.findIndex((g: any) => g.group === selectedGroup)
              ]
            }
            selectedStore={selectedStore}
            setSelectedStore={setSelectedStore}
            clearFilters={(idx) => clearFilters(idx)}
            search={search}
            setSearch={setSearch}
            searchStr={searchStr}
            setSearchStr={(str) => {
              goToPage(1);
              setSearchStr(str);
            }}
            searchResultsLen={
              search && searchStr ? filteredItems.length : undefined
            }
            goToPage={goToPage}
          />

          {getFilters().map((obj, idx) => {
            const f = obj.f;
            if (f && selectedFilterIdx === idx) {
              if (f.type === "range") {
                return (
                  <Range
                    key={idx}
                    idx={idx}
                    f={f}
                    setF={obj.set}
                    set={rangeSelect}
                    setRangeModal={setRangeModal}
                  />
                );
              } else if (f.type === "choice") {
                return (
                  <Slider
                    key={idx}
                    type={
                      getFilters()[selectedFilterIdx]?.f?.name === "group"
                        ? "group"
                        : "choice"
                    }
                    choices={f.props as FilterChoice[]}
                    selected={
                      getFilters()[selectedFilterIdx]?.f?.name === "group"
                        ? [selectedGroup]
                        : (f.val as FilterChoice[])
                    }
                    select={sliderSelect}
                    fetching={fetching}
                    aliases={
                      itemAliases[
                        groupFilters.findIndex(
                          (g: any) => g.group === selectedGroup
                        )
                      ]
                    }
                    titles={
                      getFilters()[selectedFilterIdx]?.f?.name === "group"
                        ? groupFilters.map((g: any) => g.group)
                        : undefined
                    }
                  />
                );
              }
            }
            return null;
          })}
        </div>
      )}

      {!fetching && !map && selectedGroup && (
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
          goToPage={goToPage}
          fetching={fetching}
        />
      )}
    </div>
  );
};

export default UniversalInfoDisplay;

/*** Test Data not present in files ***/
const sampleText =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
