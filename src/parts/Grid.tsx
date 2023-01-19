import "./Grid.css";

import { UniversalInfoDisplayItem } from "./Shell";
import { useState } from "react";
import { groupFilters } from "./Shell";
import groupTemplate from "./config/template_group.json";
import itemTemplate from "./config/template_item.json";
import { itemAliases } from "./Shell";

type PartGridType = {
  items: UniversalInfoDisplayItem[];
  selectedGroup: string;
  selectedItemIdx: number;
  setSelectedItemIdx?: (val: number) => void;
  setItemModal: (val: boolean) => void;
  getData: (group: string) => void;
};

const Grid = ({
  items,
  selectedGroup,
  selectedItemIdx,
  setSelectedItemIdx,
  setItemModal,
  getData,
}: PartGridType) => {
  return items.length ? (
    <div
      className={`item-grid ${
        items?.length && selectedGroup ? "items" : "groups"
      }`}
    >
      {items.map((item, idx) => (
        <GridItem
          key={`square${idx}`}
          idx={idx}
          item={item}
          selectedGroup={selectedGroup}
          selectedItemIdx={selectedItemIdx}
          setSelectedItemIdx={setSelectedItemIdx}
          setItemModal={setItemModal}
          getData={getData}
        />
      ))}
    </div>
  ) : null;
};

type PartGridItemType = {
  idx: number;
  item: any;
  selectedGroup: string;
  selectedItemIdx: number;
  setSelectedItemIdx?: (val: number) => void;
  setItemModal: (val: boolean) => void;
  getData: (group: string) => void;
};

const GridItem = ({
  idx,
  item,
  selectedGroup,
  selectedItemIdx,
  setSelectedItemIdx,
  setItemModal,
  getData,
}: PartGridItemType) => {
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);

  const groupIdx = groupFilters.findIndex(
    (g: any) => g.group === selectedGroup
  );
  const template = selectedGroup ? itemTemplate[groupIdx] : groupTemplate;
  const all_fields = template.fields;

  let fields;
  if (selectedGroup) {
    fields = all_fields[selectedTemplateIdx];
  }

  const toggleTemplate = () => {
    const total = template.fields.length;

    if (selectedTemplateIdx === total - 1) {
      setSelectedTemplateIdx(0);
    } else {
      setSelectedTemplateIdx(selectedTemplateIdx + 1);
    }
  };

  const getFieldText = (f: string) => {
    const val = item[f];
    let out = "";

    if (f === "$") {
      out = f + val;
    } else if (f === "s") {
      // dont do this
      out = val.replaceAll("-", " ");
    } else if (f === "mi" || selectedTemplateIdx === 0) {
      out = val + f;
    } else {
      if (itemAliases[groupIdx] && itemAliases[groupIdx][f]) {
        out = itemAliases[groupIdx][f][val];
      } else {
        // array
        if (typeof val === "object") {
          out = val.join(", ");
        } else {
          out = val;
        }
      }
    }

    return out;
  };

  return (
    <div
      className={`item ${selectedItemIdx === item.idx ? "selected" : ""}`}
      key={item.b + item.n + idx}
      onClick={(e) => {
        if (selectedGroup) {
          setSelectedItemIdx && setSelectedItemIdx(item.idx);
          setItemModal(true);
        } else {
          getData && getData(item.n);
        }
      }}
    >
      <span
        className={`field title`}
        onClick={(e) => {
          if (selectedGroup) {
            setSelectedItemIdx && setSelectedItemIdx(item.idx);
            setItemModal(true);
          } else {
            getData && getData(item.n);
          }
        }}
      >
        {item[template?.title]}
      </span>

      <div className="container">
        <div
          className={`container-text ${selectedTemplateIdx ? "more" : ""}`}
          onClick={(e) => {
            if (selectedTemplateIdx > 0) {
              e.stopPropagation();
              e.preventDefault();
              toggleTemplate();
            }
          }}
        >
          {selectedGroup &&
            fields?.map((f) => {
              return (
                <span
                  key={f}
                  className={`field ${f === "mi" ? "mi" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleTemplate();
                  }}
                >
                  {getFieldText(f)}
                </span>
              );
            })}
        </div>

        <div className="container-img">
          {
            // only glow flower for now
            (item.n === "flower" || selectedGroup === "flower") && (
              <img className="glow" src="/media/glow.png" alt="glow" />
            )
          }
          <img
            className="media"
            src={
              selectedGroup
                ? `/media/${selectedGroup}.gif`
                : `/media/${item.n}.gif` /*`${
                  item.w === "D"
                    ? "https://images.dutchie.com/" +
                      item["p"] +
                      "?auto=format&fit=fill&fill=solid&fillColor=%" +
                      "23000" +
                      "&__typename=ImgixSettings&ixlib=react-9.0.2&h=200&w=200"
                    : item["p"]
                }`*/
            }
            loading="lazy"
            alt="thumb"
          ></img>
        </div>
      </div>
    </div>
  );
};

export default Grid;
