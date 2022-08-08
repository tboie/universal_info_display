// ***
// Universal Info Display
// [Coded using purpose-oriented-programming]
// ***

import "./Shell.css";

import { useState, useEffect, useMemo } from "react";
import ContentSlider from "./ContentSlider";
import StatusBar from "./StatusBar";
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

// TODO: revisit these for page snaps
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
export type FilterChoice = {
  field?: string;
  values: string[];
};
export type FilterRange = [number, number];
export type FilterOp = ">" | "<" | undefined;
export type FilterSort = "asc" | "desc" | undefined;

export type Filter = {
  name: string;
  alias?: string;
  type: FilterType;
  props: FilterChoice[] | FilterRange;
  val: FilterChoice[] | number;
  sort: FilterSort;
  op: FilterOp;
};

// main
const UniversalInfoDisplay = () => {
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
    choices: FilterChoice[]
  ) => {
    return choices.map((c) => ({
      field: c.field,
      values:
        c.field && filterDefaults[groupIdx][c.field]
          ? [filterDefaults[groupIdx][c.field]]
          : [],
    }));
  };
  const getDefaultFilterRangeVal = (name: string, range: FilterRange) => {
    return getDefaultFilterOp("range", name) === "<" ? range[1] : range[0];
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

  const getDefaultFilterOp = (type: FilterType, name: string) => {
    return type === "range"
      ? name === "$" || name === "mi"
        ? "<"
        : ">"
      : undefined;
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
          (f.val as FilterChoice[]).forEach((c) => {
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

    // range filters
    let rF = [filter1, filter2, filter3, filter4, filter5].filter(
      (f) => f && f.type === "range" && f.name !== "mi"
    ) as Filter[];

    // filter items by range value
    rF.forEach(
      (f) =>
        (filteredItems = filteredItems.filter((item) =>
          f.op === ">" ? item[f.name] > f.val : item[f.name] < f.val
        ))
    );

    // multi column range sort
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
    }

    return filteredItems;
  };

  const sliderSelect = (type: T_SLIDER_TYPE, title: string, field?: string) => {
    const toggleChoice = (
      choices: FilterChoice[],
      field: string,
      title: string
    ) => {
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
          val: toggleChoice(filter1?.val as FilterChoice[], field, title),
        });
      } else if (selectedFilterIdx === 2 && filter2) {
        setFilter2({
          ...filter2,
          val: toggleChoice(filter2?.val as FilterChoice[], field, title),
        });
      } else if (selectedFilterIdx === 3 && filter3) {
        setFilter3({
          ...filter3,
          val: toggleChoice(filter3?.val as FilterChoice[], field, title),
        });
      } else if (selectedFilterIdx === 4 && filter4) {
        setFilter4({
          ...filter4,
          val: toggleChoice(filter4?.val as FilterChoice[], field, title),
        });
      } else if (selectedFilterIdx === 5 && filter5) {
        setFilter5({
          ...filter5,
          val: toggleChoice(filter5?.val as FilterChoice[], field, title),
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
    op: FilterOp
  ) => {
    const eleStatus = document.querySelector(
      "#filter_range_status"
    ) as HTMLSpanElement;

    if (eleStatus) {
      eleStatus.style.opacity = "1";
      eleStatus.innerHTML =
        op +
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
    filter1,
    filter2,
    filter3,
    filter4,
    filter5,
    selectedStore,
    miles,
  ]);

  // filter_defaults.json vals not applied, all filters cleared
  const clearFilters = () => {
    const clearChoiceVal = (f: Filter) => {
      return (f.val as FilterChoice[]).map((c) => ({
        field: c.field,
        values: [],
      }));
    };

    const clearRangeVal = (f: Filter) => {
      return getDefaultFilterRangeVal(f.name, f.props as FilterRange);
    };

    const clearVal = (f: Filter) => {
      return f.type === "choice" ? clearChoiceVal(f) : clearRangeVal(f);
    };

    // doesn't work well
    // setSelectedPageIdx(1);

    [
      [filter1, setFilter1],
      [filter2, setFilter2],
      [filter3, setFilter3],
      [filter4, setFilter4],
      [filter5, setFilter5],
    ].forEach((fArr: any) => {
      if (fArr[0] && fArr[1]) {
        fArr[1]({
          ...fArr[0],
          val: clearVal(fArr[0]),
          sort: undefined,
          op: getDefaultFilterOp(fArr[0].type, fArr[0].name),
        });
      }
    });
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
              const choices: FilterChoice[] = [];
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
              let range = getFilterRangeMinMaxFromItems(key, all_items);
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
                    ? getDefaultFilterChoiceVal(groupFilterIdx, choices)
                    : getDefaultFilterRangeVal(key, range),
                sort: undefined,
                op: getDefaultFilterOp(obj.type, key),
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
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
        clearFilters={() => clearFilters()}
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
                  setF={[
                    setFilter1,
                    setFilter2,
                    setFilter3,
                    setFilter4,
                    setFilter5,
                  ].find((sF, i) => i === idx)}
                  set={rangeSelect}
                />
              );
            } else if (f.type === "choice") {
              return (
                <Slider
                  key={idx}
                  type={"choice"}
                  choices={f.props as FilterChoice[]}
                  selected={f.val as FilterChoice[]}
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
