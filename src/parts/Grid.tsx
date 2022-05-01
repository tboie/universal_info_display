import { UniversalInfoDisplayItem } from "./Shell";

const GridItems = ({
  items,
  setSelectedItemIdx,
}: {
  items: UniversalInfoDisplayItem[];
  setSelectedItemIdx: (val: number) => any;
}) => {
  return items.length ? (
    <div className="item-grid">
      {items.map((item, idx) => (
        <div
          className={`item`}
          key={item.b + item.n + idx}
          onClick={() => setSelectedItemIdx(item.id)}
        >
          <span className="title">{item.n}</span>

          <div className="container">
            <div className="container-text">
              <span className="price">{"$" + item["$"]}</span>
              <span className="choice">
                {item["g"] ? item["g"].join(",") : ""}
              </span>
              <span className="percent">
                {item["%"] ? Math.round(item["%"]) + "%" : ""}
              </span>
              <span className="type">{item["t"]}</span>

              <span className="ppu">
                {item["ppu"] ? "$" + item["ppu"] + "/g" : ""}
              </span>
            </div>
            <div className="container-img">
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
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : null;
};

export default GridItems;
