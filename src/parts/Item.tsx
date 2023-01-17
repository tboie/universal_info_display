import { useState } from "react";
import ContentSlider from "./ContentSlider";
import "./Item.css";

import { UniversalInfoDisplayItem } from "./Shell";
import Slider from "./Slider";
import TitleBar from "./TitleBar";
import { Store } from "./Shell";

type PartItemType = {
  selectedItemIdx: number;
  item: UniversalInfoDisplayItem;
  close: () => void;
  selectedGroup: string;
  selectedStore?: Store;
  getData: (group: string) => void;
  goToPage: (idx: number) => void;
  setItemModal: (val: boolean) => void;
  setSelectedFilterIdx: (val: number) => void;
};

const Item = ({
  selectedItemIdx,
  item,
  close,
  selectedGroup,
  selectedStore,
  getData,
  goToPage,
  setItemModal,
  setSelectedFilterIdx,
}: PartItemType) => {
  const [pages, setPages] = useState<number[]>([]);
  const [selectedPageIdx, setSelectedPageIdx] = useState(1);
  const [contentNodes, setContentNodes] = useState(getContentNodes());

  function getContentNodes() {
    return [
      <span className={`store`}>{item.s.replaceAll("-", " ")}</span>,
      <img
        className={`glow`}
        src={`/media/glow.png`}
        alt={`glow`}
        width={"700px"}
        height={"700px"}
      />,
      <img
        className={`cover`}
        src={`/media/${selectedGroup}.gif`}
        alt={`item`}
        width={"300px"}
        height={"300px"}
      />,
      <span className={`title`}>{item.n}</span>,
      <span className={`brand`}>{"by " + item.b}</span>,
      <div className={`component`}>
        {["g", "%", "t", "mi"].map((f) => (
          <span>{f !== "t" ? item[f] + f : item[f]}</span>
        ))}
      </div>,
      item.desc,
      item.desc,
      <div className={`component`}>COMPONENT</div>,
      item.desc,
      item.desc,
      <div className={`component`}>COMPONENT</div>,
      item.desc,
      <div className={`component`}>COMPONENT</div>,
      item.desc,
      <div className={`component`}>COMPONENT</div>,
      item.desc,
      item.desc,
      <div className={`component`}>COMPONENT</div>,
      /*
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      <div className={`component`}>COMPONENT</div>,
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      <div className={`component`}>COMPONENT</div>,
      */
    ];
  }

  return (
    <div id="item">
      <TitleBar
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        totalPages={pages.length}
        fetching={false}
        map={false}
        totalItems={1}
        close={close}
        selectedItem={item}
        setSelectedFilterIdx={setSelectedFilterIdx}
        selectedStore={selectedStore}
      />
      <ContentSlider
        type={"dynamic"}
        contentNodes={contentNodes}
        setContentNodes={setContentNodes}
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        setSelectedPageIdx={setSelectedPageIdx}
        setPages={setPages}
        selectedItemIdx={selectedItemIdx}
        setItemModal={setItemModal}
        getData={getData}
      />
      <div className="button-bar">
        <button className="close" onClick={close}>
          X
        </button>
        <button className="buy" onClick={(e) => {}}>
          Buy
        </button>
        <a
          className="directions"
          href={`http://maps.google.com/?q=${selectedStore?.l[0]},${selectedStore?.l[1]}`}
          target="_blank"
        >
          Directions
        </a>

        {/*
        <button
          className="directions"
          onClick={(e) => {
            console.log("directions");
            //@ts-ignore
            window.location =
              window.location.protocol + "//" + "geo:42.364506,-71.038887";
          }}
        >
          Directions
        </button>
        */}
      </div>
      <Slider
        type={"page"}
        titles={pages.map((n) => n.toString())}
        selected={[selectedPageIdx.toString()]}
        select={(type, title) => setSelectedPageIdx(parseInt(title))}
        fetching={false}
        goToPage={goToPage}
      />
    </div>
  );
};

export default Item;
