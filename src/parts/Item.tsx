import { useState } from "react";
import ContentSlider from "./ContentSlider";
import "./Item.css";

import { UniversalInfoDisplayItem } from "./Shell";
import Slider from "./Slider";
import TitleBar from "./TitleBar";

type PartItemType = {
  selectedItemIdx: number;
  item: UniversalInfoDisplayItem;
  close: () => void;
  selectedGroup: string;
  getData: (group: string) => void;
  goToPage: (idx: number) => void;
  setItemModal: (val: boolean) => void;
};

const Item = ({
  selectedItemIdx,
  item,
  close,
  selectedGroup,
  getData,
  goToPage,
  setItemModal,
}: PartItemType) => {
  const [pages, setPages] = useState<number[]>([]);
  const [selectedPageIdx, setSelectedPageIdx] = useState(1);
  const [contentNodes, setContentNodes] = useState(getContentNodes());

  function getContentNodes() {
    return [
      <img
        className={`glow`}
        src={`/media/glow.png`}
        alt={`glow`}
        width={"600px"}
        height={"600px"}
      />,
      <img
        className={`cover`}
        src={`/media/flower.gif`}
        alt={`item`}
        width={"300px"}
        height={"300px"}
      />,
      <div className={`component`}>COMPONENT</div>,
      item.desc,
      item.desc,
      <div className={`component`}>COMPONENT</div>,
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
      <div className={`component`}>COMPONENT</div>,
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
      />
      <span className="title">{item.n}</span>
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
      <button id="item-close" onClick={close}>
        X
      </button>
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
