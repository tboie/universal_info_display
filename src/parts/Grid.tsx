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
            key={item.b + item.n + idx}
            onClick={() => setSelectedItemIdx(item.id)}
          >
            <img
              src={`${
                item.w === "D"
                  ? "https://images.dutchie.com/" +
                    item["p"] +
                    "?auto=format&fit=fill&fill=solid&fillColor=%" +
                    "23fff" +
                    "&__typename=ImgixSettings&ixlib=react-9.0.2&h=200&w=200"
                  : item["p"]
              }`}
              loading="lazy"
              alt=""
            ></img>
            <span className="title">{item.n}</span>
            <span className="price">{"$" + item["$"]}</span>
            <span className="type">{item["t"]}</span>
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
