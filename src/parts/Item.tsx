import "./Item.css";

import { UniversalInfoDisplayItem } from "./Shell";

type PartItemType = {
  item: UniversalInfoDisplayItem;
  close: (val: number) => any;
};

const Item = ({ item, close }: PartItemType) => {
  return (
    <div id="item">
      <img src={"/media/flower.gif"} />
      <button id="item_close" onClick={() => close(-1)}>
        X
      </button>
    </div>
  );
};

export default Item;
