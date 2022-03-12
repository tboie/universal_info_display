// ***
// Universal Info Display
// [Coded using purpose-oriented-programming]
// ***

import { useState, useEffect } from "react";
import ContentSlider from "./ContentSlider";
import FilterButtonBar from "./FilterButtonBar";
import FilterRange from "./FilterRange";
import Slider, { T_SLIDER_TYPE } from "./Slider";

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
  const [groupFilters, setGroupFilters] = useState([{ group: "Loading" }]);

  const [selectedFilterIdx, setSelectedFilterIdx] = useState(0);
  const [filter1, setFilter1] = useState<GroupFilter>();
  const [filter2, setFilter2] = useState<GroupFilter>();
  const [filter3, setFilter3] = useState<GroupFilter>();
  const [filter4, setFilter4] = useState<GroupFilter>();

  const [items, setItems] = useState<UniversalInfoDisplayItem[]>(props.items);

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
    return [Math.min(...vals), Math.max(...vals)];
  };

  // get all groups
  useEffect(() => {
    if (props.contentType === "item") {
      fetch("/data/groups.json")
        .then((response) => response.json())
        .then((groupData) => {
          setGroupFilters(groupData);
          setSelectedGroup(groupData[0].group);

          Object.entries(groupData[0])
            .filter(([key]) => key !== "group")
            .forEach(([key, value], idx) => {
              const fObj = {
                name: key,
                type: value as FilterType,
                props: value === "choice" ? [""] : ([0, 0] as [0, 0]),
                val: value === "choice" ? [""] : 0,
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
              }
            });
        });
    }
  }, []);

  // get individual group data and set # number of pages
  useEffect(() => {
    if (groupFilters.length) {
      fetch(`/data/${selectedGroup}.json`)
        .then((response) => response.json())
        .then((items: UniversalInfoDisplayItem[]) => {
          setItems(items.map((item, idx) => ({ id: idx, ...item })));

          // true/false doesn't matter for now
          setPagesBool(
            chunkArr(items, 9).map((item: UniversalInfoDisplayItem) => true)
          );

          const groupFilter = groupFilters.find(
            (g: any) => g.group === selectedGroup
          );

          if (groupFilter) {
            Object.entries(groupFilter)
              .filter(([key]) => key !== "group")
              .forEach(([key, value], idx) => {
                const choices = getFilterChoices(key, items);
                const range = getFilterRange(key, items);
                const fObj = {
                  name: key,
                  type: value as FilterType,
                  props: value === "choice" ? choices : range,
                  val: value === "choice" ? [] : range[1],
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
                }
              });
          }
        });
    }
  }, [selectedGroup, groupFilters.length]);

  const sortItems = () => {
    let filteredItems: UniversalInfoDisplayItem[] = [...items];

    // choice
    [filter1, filter2, filter3, filter4]
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

            filteredItems = [...choiceItems];
          }
        }
      });

    // range
    [filter1, filter2, filter3, filter4]
      .filter((f) => f?.type === "range" && f.sort)
      .forEach((f) => {
        if (f) {
          filteredItems = [
            ...filteredItems.filter((item) =>
              f.sort === "asc" ? item[f.name] < f.val : item[f.name] > f.val
            ),
          ];
        }
      });

    // sort
    [filter1, filter2, filter3, filter4].forEach((f) => {
      if (f?.sort) {
        filteredItems.sort((a, b) =>
          f.sort === "asc" ? a[f.name] - b[f.name] : b[f.name] - a[f.name]
        );
      }
    });

    const seen = new Set();
    return filteredItems.filter((item) => {
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });
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
      }
    }
  };

  const rangeSelect = (idx: number, val: number, sort?: "asc" | "desc") => {
    const eleStatus = document.querySelector(
      "#filter_range_status"
    ) as HTMLSpanElement;

    if (eleStatus && sort) {
      eleStatus.style.opacity = "1";
      eleStatus.innerHTML = (sort === "asc" ? "<" : ">") + val.toString();
      setTimeout(() => {
        eleStatus.style.opacity = "0";
      }, 3000);
    }

    if (idx === 1 && filter1) {
      setFilter1({ ...filter1, val: val });
    } else if (idx === 2 && filter2) {
      setFilter2({ ...filter2, val: val });
    } else if (idx === 3 && filter3) {
      setFilter3({ ...filter3, val: val });
    } else if (idx === 4 && filter4) {
      setFilter4({ ...filter4, val: val });
    }
  };

  return (
    <div className="universal_info_display">
      <span id="filter_range_status">TEST</span>
      <ContentSlider
        {...p}
        items={
          (filter1?.val as string[])?.length ||
          (filter2?.val as string[])?.length ||
          (filter3?.val as string[])?.length ||
          (filter4?.val as string[])?.length ||
          filter1?.sort ||
          filter2?.sort ||
          filter3?.sort ||
          filter4?.sort
            ? sortItems()
            : items
        }
        sliderSelect={sliderSelect}
      />
      {selectedFilterIdx === 0 ? (
        <Slider
          type="group"
          titles={groupFilters.map((g) => g.group)}
          selected={[selectedGroup]}
          select={sliderSelect}
        />
      ) : (
        [filter1, filter2, filter3, filter4].map((f, idx) => {
          if (f && selectedFilterIdx === idx + 1) {
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
                />
              );
            }
          }
        })
      )}
      <FilterButtonBar
        filter1={filter1}
        filter2={filter2}
        filter3={filter3}
        filter4={filter4}
        setFilter1={setFilter1}
        setFilter2={setFilter2}
        setFilter3={setFilter3}
        setFilter4={setFilter4}
        selectedFilterIdx={selectedFilterIdx}
        setSelectedFilterIdx={setSelectedFilterIdx}
      />
    </div>
  );
};

export default UniversalInfoDisplay;
