import { useState } from "react";
import ContentSlider from "./ContentSlider";
import "./Item.css";

import { UniversalInfoDisplayItem } from "./Shell";
import Slider from "./Slider";
import TitleBar from "./TitleBar";

type PartItemType = {
  selectedItemIdx: number;
  item: UniversalInfoDisplayItem;
  close: (val: number) => any;
  selectedGroup: string;
};

const Item = ({
  selectedItemIdx,
  item,
  close,
  selectedGroup,
}: PartItemType) => {
  const [selectedPageIdx, setSelectedPageIdx] = useState(1);
  const [contentNodes, setContentNodes] = useState(getContentNodes());

  function getContentNodes() {
    return [
      <div>
        <img className={`glow`} src={`/media/glow.png`} alt={`glow`} />
        <img className={`cover`} src={`/media/flower.gif`} alt={`item`} />
      </div>,
      item.desc,
      item.desc,
      item.desc,
      item.desc,
      <div>
        <img className={`glow`} src={`/media/glow.png`} alt={`glow`} />
        <img className={`cover`} src={`/media/flower.gif`} alt={`item`} />
      </div>,
      <div>
        <img className={`glow`} src={`/media/glow.png`} alt={`glow`} />
        <img className={`cover`} src={`/media/flower.gif`} alt={`item`} />
      </div>,
      item.desc,
      <div>
        <img className={`glow`} src={`/media/glow.png`} alt={`glow`} />
        <img className={`cover`} src={`/media/flower.gif`} alt={`item`} />
      </div>,
      item.desc,
      item.desc,
      item.desc,
      <div>
        <img className={`glow`} src={`/media/glow.png`} alt={`glow`} />
        <img className={`cover`} src={`/media/flower.gif`} alt={`item`} />
      </div>,
      item.desc,
    ];
  }

  return (
    <div id="item">
      <TitleBar
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        totalPages={2}
        fetching={false}
        map={false}
        totalItems={1}
        close={() => {}}
        selectedItem={item}
      />
      <ContentSlider
        type={"dynamic"}
        contentNodes={contentNodes}
        setContentNodes={setContentNodes}
        selectedGroup={selectedGroup}
        selectedPageIdx={selectedPageIdx}
        setSelectedPageIdx={setSelectedPageIdx}
      />
      <button id="item-close" onClick={() => close(-1)}>
        X
      </button>
      <Slider
        type={"page"}
        titles={["0", "1"]}
        selected={[selectedPageIdx.toString()]}
        select={() => {}}
        setSelectedPageIdx={setSelectedPageIdx}
        fetching={false}
      />
    </div>
  );
};

export default Item;
