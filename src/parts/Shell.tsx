// ***
// Universal Info Display
// [Coded using purpose-oriented-programming]
// ***

import { useState, useEffect, useMemo } from "react";
import ContentSlider from "./ContentSlider";
import FilterButtonBar from "./FilterButtonBar";
import MapWrapper from "./Map";
import FilterRange from "./FilterRange";
import Item from "./Item";
import Slider, { T_SLIDER_TYPE } from "./Slider";
import TitleBar from "./TitleBar";
import { getDistance } from "geolib";

// !TEXT FEATURE NEEDS RE-IMPLEMENTEATION SINCE GROUPS BRANCH! (item support)
// [TEXT CALCS]
// 1st: display all text into 1 div and split text into pages using element height and viewport height
// Two: Mount pages from above and detect overflow on them
// Finally: from 1st page to last, detect if overflowing and move word to next if true
// 3: Display text
// Now: Improve
// TODO: a) Don't break text on word for #1

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

export type ViewSection = {
  selectedPageIdx: number;
  setSelectedPageIdx: (val: number) => any;

  pagesBool: boolean[];
  setPagesBool: (val: any) => any;

  selectedGroup: string;
  setSelectedGroup: (val: string) => any;

  groupFilters: any[];
  setGroupFilters: (val: any) => any;
};

export type Slider = {
  type: "group" | "page" | "choice";
};

// filters
export type FilterType = "choice" | "range";

export type GroupFilter = {
  name: string;
  type: FilterType;
  props: string[] | [0, 0];
  val: string[] | number;
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
  const [groupFilters, setGroupFilters] = useState([]);

  const [selectedFilterIdx, setSelectedFilterIdx] = useState(0);
  const [filter1, setFilter1] = useState<GroupFilter>();
  const [filter2, setFilter2] = useState<GroupFilter>();
  const [filter3, setFilter3] = useState<GroupFilter>();
  const [filter4, setFilter4] = useState<GroupFilter>();
  const [filter5, setFilter5] = useState<GroupFilter>();

  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | undefined>();
  const [items, setItems] = useState<UniversalInfoDisplayItem[]>([]);
  const [selectedItemIdx, setSelectedItemIdx] = useState(-1);

  const [map, toggleMap] = useState(false);
  const [miles, setMiles] = useState(50);

  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [key, setKey] = useState([]);

  const [fetching, setFetching] = useState(false);

  const p = {
    contentType: props.contentType,
    pagesBool: pagesBool,
    setPagesBool: setPagesBool,
    selectedPageIdx: selectedPageIdx,
    setSelectedPageIdx: setSelectedPageIdx,
    selectedGroup: selectedGroup,
    setSelectedGroup: setSelectedGroup,
    groupFilters: groupFilters,
    setGroupFilters: setGroupFilters,
  };

  const getFilterChoices = (key: string, items: UniversalInfoDisplayItem[]) => [
    ...new Set(
      Array.prototype.concat.apply(
        [],
        items.map((item) => item[key])
      )
    ),
  ];

  const getFilterRange = (key: string, items: UniversalInfoDisplayItem[]) => {
    const vals = items.map((item) => item[key]);
    return [Math.floor(Math.min(...vals)), Math.ceil(Math.max(...vals))];
  };

  const getData = () => {
    setFetching(true);
    fetch("/data/groups.json")
      .then((response) => response.json())
      .then((groupData) => {
        fetch("/data/key_dutchie.json")
          .then((r) => r.json())
          .then((json_dutchie) => {
            fetch("/data/key_iheartjane.json")
              .then((r) => r.json())
              .then((json_iheartjane) => {
                const master = json_dutchie.concat(json_iheartjane);
                setKey(master);
                setGroupFilters(groupData);
                setSelectedGroup(groupData[0].group);
                getLocation();
              });
          });
      });
  };

  const sortItems = () => {
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
          const fVals = f.val as string[];

          if (fVals.length) {
            const choiceItems: UniversalInfoDisplayItem = [];

            fVals.forEach((choice) => {
              choiceItems.push(
                ...filteredItems.filter((item) =>
                  item[f.name]?.includes(choice)
                )
              );
            });

            filteredItems = [...choiceItems].sort((a, b) => a.ppu - b.ppu);
          }
        }
      });

    // ranges
    let rF = [filter1, filter2, filter3, filter4, filter5].filter(
      (f) => f?.type === "range" && f.sort
    ) as GroupFilter[];

    rF.forEach((f) => {
      if (f) {
        filteredItems = [
          ...filteredItems.filter((item) =>
            f.sort === "asc" ? item[f.name] > f.val : item[f.name] < f.val
          ),
        ];
      }
    });

    // multi column range sort
    // more dependable than any algs tried
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

    // sort by ppu if all filters off
    if (
      !(filter1?.val as string[])?.length &&
      !(filter2?.val as string[])?.length &&
      !(filter3?.val as string[])?.length &&
      !(filter4?.val as string[])?.length &&
      !(filter5?.val as string[])?.length &&
      !filter1?.sort &&
      !filter2?.sort &&
      !filter3?.sort &&
      !filter4?.sort &&
      !filter5?.sort
    ) {
      filteredItems.sort((a, b) => a.ppu - b.ppu);
    }

    return filteredItems;
  };

  const sliderSelect = (type: T_SLIDER_TYPE, title: string, on: boolean) => {
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
    } else if (type === "choice") {
      if (selectedFilterIdx === 1 && filter1) {
        const f1Vals = filter1?.val as string[];
        setSelectedPageIdx(1);
        setFilter1({
          ...filter1,
          val: f1Vals.includes(title)
            ? f1Vals.filter((val) => val !== title)
            : f1Vals.concat([title]),
        });
      } else if (selectedFilterIdx === 2 && filter2) {
        const f2Vals = filter2?.val as string[];
        setSelectedPageIdx(1);
        setFilter2({
          ...filter2,
          val: f2Vals.includes(title)
            ? f2Vals.filter((val) => val !== title)
            : f2Vals.concat([title]),
        });
      } else if (selectedFilterIdx === 3 && filter3) {
        const f3Vals = filter3?.val as string[];
        setSelectedPageIdx(1);
        setFilter3({
          ...filter3,
          val: f3Vals.includes(title)
            ? f3Vals.filter((val) => val !== title)
            : f3Vals.concat([title]),
        });
      } else if (selectedFilterIdx === 4 && filter4) {
        const f4Vals = filter4?.val as string[];
        setSelectedPageIdx(1);
        setFilter4({
          ...filter4,
          val: f4Vals.includes(title)
            ? f4Vals.filter((val) => val !== title)
            : f4Vals.concat([title]),
        });
      } else if (selectedFilterIdx === 5 && filter5) {
        const f5Vals = filter5?.val as string[];
        setSelectedPageIdx(1);
        setFilter5({
          ...filter5,
          val: f5Vals.includes(title)
            ? f5Vals.filter((val) => val !== title)
            : f5Vals.concat([title]),
        });
      }
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

    if (eleStatus && sort) {
      eleStatus.style.opacity = "1";
      eleStatus.innerHTML =
        (sort === "asc" ? ">" : "<") +
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

  const filteredItems = useMemo(
    () => sortItems(),
    [
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
    ]
  );

  const clearFilters = () => {
    setSelectedFilterIdx(0);
    if (filter1) {
      setFilter1({
        ...filter1,
        val: filter1.type === "choice" ? [] : filter1.val,
        sort: undefined,
      });
    }
    if (filter2) {
      setFilter2({
        ...filter2,
        val: filter2.type === "choice" ? [] : filter2.val,
        sort: undefined,
      });
    }
    if (filter3) {
      setFilter3({
        ...filter3,
        val: filter3.type === "choice" ? [] : filter3.val,
        sort: undefined,
      });
    }
    if (filter4) {
      setFilter4({
        ...filter4,
        val: filter4.type === "choice" ? [] : filter4.val,
        sort: undefined,
      });
    }
    if (filter5) {
      setFilter5({
        ...filter5,
        val: filter5.type === "choice" ? [] : filter5.val,
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
        const uri = `/data/${selectedGroup}/${encodeURIComponent(
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
              // REC only for now
              items: store_items.filter((item: any) => item.m === "R"),
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

        // check total count and add items to all array
        let numItems = 0;
        const all_items: any = [];
        stores_all = stores_all.filter((store) => store.items.length > 0);

        stores_all = stores_all.filter((store) => {
          // no limit for now (use 600 for 100 pages)
          if (numItems + store.total <= 1000) {
            numItems += store.total;

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
          }
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

        setPagesBool(
          chunkArr(all_items, 6).map((item: UniversalInfoDisplayItem) => true)
        );

        // set max min miles
        const maxMiles = Math.ceil(all_items[all_items.length - 1].dist);
        const minMiles = Math.floor(all_items[0].dist) + 1;
        setMiles(maxMiles);

        // set filters
        const groupFilter = groupFilters.find(
          (g: any) => g.group === selectedGroup
        );

        if (groupFilter) {
          Object.entries(groupFilter)
            .filter(([key]) => key !== "group")
            .forEach(([key, obj]: any, idx) => {
              let choices = getFilterChoices(key, all_items);
              if (key === "g") {
                choices = choices
                  .map((choice) => parseFloat(choice.replace(/[^0-9.]/g, "")))
                  .sort((a, b) => a - b)
                  .map((choice) => choice + key);
              }

              let range = getFilterRange(key, all_items);
              if (key === "mi") {
                range = [minMiles, maxMiles];
              }

              const fObj = {
                name: key,
                type: obj.type as FilterType,
                props: obj.type === "choice" ? choices : range,
                val:
                  obj.type === "choice"
                    ? []
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
    /*
    setTimeout(() => {
      console.log("setting location to boston");
      setLat(42.364506);
      setLng(-71.038887);
    }, 1000);
    */
    navigator.geolocation.getCurrentPosition((position) => {
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
    });
  };

  return (
    <div className="universal_info_display">
      <TitleBar
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        totalPages={chunkArr(filteredItems, 6).length}
        filter1={filter1}
        filter2={filter2}
        filter3={filter3}
        filter4={filter4}
        filter5={filter5}
        selectedStore={selectedStore}
        miles={miles}
        fetching={fetching}
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
          {...p}
          items={filteredItems}
          sliderSelect={sliderSelect}
          setSelectedItemIdx={setSelectedItemIdx}
          clearFilters={clearFilters}
          getData={getData}
          fetching={fetching}
          filtersOn={
            (filter1?.val as string[])?.length ||
            (filter2?.val as string[])?.length ||
            (filter3?.val as string[])?.length ||
            (filter4?.val as string[])?.length ||
            (filter5?.val as string[])?.length ||
            filter1?.sort ||
            filter2?.sort ||
            filter3?.sort ||
            filter4?.sort ||
            filter5?.sort
              ? true
              : false
          }
        />
      )}
      <span id="filter_range_status" />
      <FilterButtonBar
        filter1={filter1}
        filter2={filter2}
        filter3={filter3}
        filter4={filter4}
        filter5={filter5}
        setFilter1={setFilter1}
        setFilter2={setFilter2}
        setFilter3={setFilter3}
        setFilter4={setFilter4}
        setFilter5={setFilter5}
        selectedFilterIdx={selectedFilterIdx}
        setSelectedFilterIdx={setSelectedFilterIdx}
        setSelectedPageIdx={setSelectedPageIdx}
        map={map}
        toggleMap={() => toggleMap(!map)}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
        fetching={fetching}
      />
      {!map && selectedFilterIdx === 0 ? (
        <Slider
          type="group"
          titles={groupFilters.map((g: any) => g.group)}
          selected={[selectedGroup]}
          select={sliderSelect}
          fetching={fetching}
        />
      ) : (
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
                <FilterRange key={idx} idx={idx + 1} f={f} set={rangeSelect} />
              );
            } else if (f.type === "choice") {
              return (
                <Slider
                  key={idx}
                  type={"choice"}
                  titles={f.props as string[]}
                  selected={Array.isArray(f.val) ? f.val : [f.val.toString()]}
                  select={sliderSelect}
                  fetching={fetching}
                />
              );
            }
          }
        })
      )}

      {map && !selectedStore ? (
        <Slider
          type="group"
          titles={groupFilters.map((g: any) => g.group)}
          selected={[selectedGroup]}
          select={sliderSelect}
          fetching={fetching}
        />
      ) : (
        <Slider
          type="page"
          titles={chunkArr(filteredItems, 6).map((item, idx) =>
            (idx + 1).toString()
          )}
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
