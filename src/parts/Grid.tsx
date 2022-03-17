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
            <span className="prop1">{"$" + item["$"]}</span>
            <span className="prop2">{item["%"] ? item["%"] + "%" : ""}</span>
            <span className="prop2">{item["size"]}</span>
          </div>
        );
      })}
    </div>
  );
};

export default GridItems;
