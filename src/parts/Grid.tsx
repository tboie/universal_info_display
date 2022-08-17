import "./Grid.css";

import { UniversalInfoDisplayItem } from "./Shell";

type PartGridType = {
  items: UniversalInfoDisplayItem[];
  selectedGroup: string;
  setSelectedItemIdx?: (val: number) => any;
  getData?: (group: string) => void;
};

const Grid = ({
  items,
  selectedGroup,
  setSelectedItemIdx,
  getData,
}: PartGridType) => {
  return items.length ? (
    <div
      className={`item-grid ${
        items?.length && selectedGroup ? "items" : "groups"
      }`}
    >
      {items.map((item, idx) => (
        <div
          className={`item`}
          key={item.b + item.n + idx}
          onClick={(e) => {
            selectedGroup
              ? setSelectedItemIdx && setSelectedItemIdx(item.idx)
              : getData && getData(item.n);
          }}
        >
          <span className="title">{item.n}</span>

          <div className="container">
            <div className="container-text">
              {selectedGroup && (
                <>
                  <span className="price">{"$" + item["$"]}</span>
                  <span className="choice">
                    {item["g"] ? item["g"].join(",") + "g" : ""}
                  </span>
                  {/*}
                  <span className="percent">
                    {item["%"] ? item["%"] + "%" : ""}
                  </span>

                  <span className="type">{item["t"]}</span>

                  <span className="ppu">
                    {item["ppu"] ? "$" + item["ppu"] + "/g" : ""}
                  </span>

                  <span className="mi">
                    {item["dist"] ? Math.round(item["dist"]) + "mi" : ""}
                  </span>
                  */}
                </>
              )}
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
      ))}
    </div>
  ) : null;
};

export default Grid;
