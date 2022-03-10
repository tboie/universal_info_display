// ***
// Universal Info Display
// [Coded using purpose-oriented-programming]
// ***

import { useState, useEffect } from "react";
import ContentSlider from "./ContentSlider";
import FilterButtonBar from "./FilterButtonBar";
import FilterRange from "./FilterRange";
import TitleBar from "./TitleBar";
import Slider, { T_SLIDER_TYPE } from "./Slider";

// !TEXT FEATURE NEEDS RE-IMPLEMENTEATION SINCE GROUPING!
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
  var scrollSpeed: number;
  var scrollDirection: "left" | "right" | "stopped";
}

globalThis.contentSliderPressed = false;
globalThis.pageSliderPressed = false;
globalThis.groupSliderPressed = false;
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
  const [selectedPageIdx, setSelectedPageIdx] = useState(0);
  const [pagesBool, setPagesBool] = useState([true]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groupFilters, setGroupFilters] = useState([{ group: "Loading" }]);

  const [selectedFilterIdx, setSelectedFilterIdx] = useState(0);
  const [filter1, setFilter1] = useState<GroupFilter>();
  const [filter2, setFilter2] = useState<GroupFilter>();

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
          Object.entries(groupData[0]).forEach(([key, value], idx) => {
            if (key !== "group") {
              if (idx === 1) {
                setFilter1({
                  name: key,
                  type: value as FilterType,
                  props: value === "choice" ? [""] : [0, 0],
                  val: value === "choice" ? [""] : 0,
                  sort: undefined,
                });
              } else if (idx === 2) {
                setFilter2({
                  name: key,
                  type: value as FilterType,
                  props: value === "choice" ? [""] : [0, 0],
                  val: value === "choice" ? [""] : 0,
                  sort: undefined,
                });
              }
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
          setItems(items);
          // val doesn't matter for now
          setPagesBool(
            chunkArr(items, 9).map((item: UniversalInfoDisplayItem) => true)
          );

          const groupFilter = groupFilters.find(
            (g: any) => g.group === selectedGroup
          );

          if (groupFilter) {
            Object.entries(groupFilter).forEach(([key, value], idx) => {
              if (key !== "group") {
                if (idx === 1) {
                  setFilter1({
                    name: key,
                    type: value as FilterType,
                    props:
                      value === "choice"
                        ? getFilterChoices(key, items)
                        : getFilterRange(key, items),
                    val: value === "choice" ? [] : 0,
                    sort: undefined,
                  });
                } else if (idx === 2) {
                  setFilter2({
                    name: key,
                    type: value as FilterType,
                    props:
                      value === "choice"
                        ? getFilterChoices(key, items)
                        : getFilterRange(key, items),
                    val: value === "choice" ? [] : 0,
                    sort: undefined,
                  });
                }
              }
            });
          }
        });
    }
  }, [selectedGroup, groupFilters.length]);

  const sliderSelect = (type: T_SLIDER_TYPE, title: string, on: boolean) => {
    if (type === "page") {
      setSelectedPageIdx(parseInt(title));
    } else if (type === "group") {
      setSelectedPageIdx(0);
      setSelectedGroup(title);
    }
  };

  return (
    <div className="universal_info_display">
      <TitleBar
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        totalPages={pagesBool.length - 1}
      />
      <ContentSlider {...p} items={items} filter1={filter1} filter2={filter2} />
      {/*<NavSlider {...p} type={"page"} selectedFilterIdx={selectedFilterIdx} /> */}
      <Slider
        type="page"
        titles={pagesBool.map((p, idx) => idx.toString())}
        selected={[selectedPageIdx.toString()]}
        select={sliderSelect}
      />
      {selectedFilterIdx === 0 ? (
        <Slider
          type="group"
          titles={groupFilters.map((g) => g.group)}
          selected={[selectedGroup]}
          select={sliderSelect}
        />
      ) : (
        [filter1, filter2].map((f, idx) => {
          if (f && selectedFilterIdx === idx + 1) {
            if (f.type === "range") {
              return (
                <FilterRange
                  key={idx}
                  min={f.props[0] as number}
                  max={f.props[1] as number}
                  sort={f.sort}
                />
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
        setFilter1={setFilter1}
        setFilter2={setFilter2}
        selectedFilterIdx={selectedFilterIdx}
        setSelectedFilterIdx={setSelectedFilterIdx}
      />
    </div>
  );
};

export default UniversalInfoDisplay;
