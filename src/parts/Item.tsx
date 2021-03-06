import { UniversalInfoDisplayItem } from "./Shell";

const Item = ({
  item,
  close,
}: {
  item: UniversalInfoDisplayItem;
  close: (val: number) => any;
}) => {
  return (
    <div id="item">
      {item.id}
      <img
        src={
          "final.gif"
          /*item.img*/
        }
      />
      <button id="item_close" onClick={() => close(-1)}>
        X
      </button>
    </div>
  );
};

export default Item;
