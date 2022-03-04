import SliderLabel from "./SliderLabel";
import { GroupFilter } from "./Shell";

const FilterSliderChoice = ({
  choices,
  filter1,
  filter2,
  selectedFilterIdx,
  setFilter1,
  setFilter2,
}: {
  choices: string[];
  filter1?: GroupFilter;
  filter2?: GroupFilter;
  selectedFilterIdx: number;
  setFilter1: (val: any) => any;
  setFilter2: (val: any) => any;
}) => {
  const click = (idx: number, title: string) => {
    const f1Vals = filter1?.val as string[];
    const f2Vals = filter2?.val as string[];
    if (selectedFilterIdx === 1) {
      setFilter1({
        ...filter1,
        val: f1Vals.includes(title)
          ? f1Vals.filter((val) => val !== title)
          : f1Vals.concat([title]),
      });
    } else if (selectedFilterIdx === 2) {
      setFilter2({
        ...filter2,
        val: f2Vals.includes(title)
          ? f2Vals.filter((val) => val !== title)
          : f2Vals.concat([title]),
      });
    }
  };

  if (filter1 && filter1.type === "choice") {
    if (filter1.sort === "asc") {
      choices.sort((a, b) => a.localeCompare(b));
    } else if (filter1.sort === "desc") {
      choices.sort((a, b) => b.localeCompare(a));
    }
  }

  if (filter2 && filter2.type === "choice") {
    if (filter2.sort === "asc") {
      choices.sort((a, b) => a.localeCompare(b));
    } else if (filter2.sort === "desc") {
      choices.sort((a, b) => b.localeCompare(a));
    }
  }

  return (
    <div
      id="universal_info_display_filter_control_choice"
      className="universal_info_display_filter_control"
    >
      {choices.map((c, idx) => {
        return (
          <SliderLabel
            key={idx}
            type={"group"}
            selected={
              selectedFilterIdx === 1
                ? (filter1?.val as string[]).includes(c)
                : (filter2?.val as string[]).includes(c)
            }
            idx={idx}
            title={c}
            click={click}
          />
        );
      })}
    </div>
  );
};

export default FilterSliderChoice;
