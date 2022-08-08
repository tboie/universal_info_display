import "./Grid.css";

import { UniversalInfoDisplayItem } from "./Shell";

const GridItems = ({
  items,
  setSelectedItemIdx,
  selectedGroup,
  getData,
}: {
  items: UniversalInfoDisplayItem[];
  setSelectedItemIdx: (val: number) => any;
  selectedGroup: string;
  getData: (group: string) => void;
}) => {
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
            e.stopPropagation();
            e.preventDefault();

            selectedGroup ? setSelectedItemIdx(item.id) : getData(item.n);
          }}
        >
          <span className="title">{item.n}</span>

          <div className="container">
            <div className="container-text">
              {selectedGroup && (
                <>
                  <span className="price">{"$" + item["$"]}</span>
                  <span className="choice">
                    {item["g"] ? item["g"].join(",") : ""}
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
                  <img className="glow" src="glow.png" />
                )
              }
              <img
                className="media"
                src={
                  selectedGroup ? `${selectedGroup}.gif` : `${item.n}.gif` /*`${
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
                alt="image"
              ></img>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : null;
};

const TestSphere = () => {
  return (
    <div className="scene">
      <div className="wrapper">
        <ul className="ball">
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
          <li className="ring"></li>
        </ul>
      </div>
    </div>
  );
};

export default GridItems;
