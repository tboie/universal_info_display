import { UniversalInfoDisplayItem } from "./Shell";

const GridItems = ({
  page,
  items,
  setSelectedItemIdx,
}: {
  page: number;
  items: UniversalInfoDisplayItem[];
  setSelectedItemIdx: (val: number) => any;
}) => {
  return (
    <div className="item-grid">
      {items.map((item, idx) => {
        return (
          <div
            className={`item`}
            key={item.name + idx}
            onClick={() => setSelectedItemIdx(item.id)}
          >
            <img src={`${item.img}`} loading="lazy" alt=""></img>
            <span className="price">{"$" + item["$"]}</span>
            <span className="percent">{item["%"] ? item["%"] + "%" : ""}</span>
            <span className="choice">
              {item["g"] ? item["g"].join(",") : ""}
            </span>
            <span className="ppu">
              {item["ppu"] ? "$" + item["ppu"] + "/g" : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default GridItems;
