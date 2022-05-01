import { useEffect } from "react";
import { Choice } from "./Shell";

export type T_SLIDER_TYPE = "choice" | "group" | "page";

type T_SLIDER = {
  type: T_SLIDER_TYPE;
  titles?: string[];
  choices?: Choice[];
  selected: string[] | Choice[];
  select: (type: T_SLIDER_TYPE, title: string, field?: string) => void;
  setSelectedPageIdx?: (val: number) => any;
  fetching: boolean;
};

type T_SLIDER_LABEL = {
  idx: number;
  type: T_SLIDER_TYPE;
  title: string;
  field?: string;
  on: boolean;
  click: (type: T_SLIDER_TYPE, title: string, field?: string) => void;
};

const Slider = ({
  type,
  titles,
  choices,
  selected,
  select,
  setSelectedPageIdx,
  fetching,
}: T_SLIDER) => {
  useEffect(() => {
    let observer: IntersectionObserver;
    const container = document.querySelector(`.slider.${type}`);
    const labels = document.querySelectorAll(`.slider.${type} .slider_label`);

    if (container) {
      const handleIntersect: IntersectionObserverCallback = (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (
              type === "page" &&
              !globalThis.contentSliderPressed &&
              titles?.length
            ) {
              const ele = entry.target as HTMLElement;
              const idx =
                parseInt(ele.id.replace("slider_label_" + type, "")) - 1;
              const title = titles[idx];
              select(type, title);
            }
          }
        });
      };

      const options = {
        root: container,
        threshold: 0,
        rootMargin: "-50%",
      };

      observer = new IntersectionObserver(handleIntersect, options);
      labels.forEach((label) => observer.observe(label));
    }

    return () => observer?.disconnect();
  }, [titles]);

  useEffect(() => {
    if (type === "page" && !globalThis.pageSliderPressed) {
      const container = document.querySelector(
        `.slider.${type}`
      ) as HTMLDivElement;

      if (container) {
        container.style.overflowX = "hidden";
        document
          .querySelector(`.slider.${type} .selected`)
          ?.scrollIntoView({ inline: "center" });
        container.style.overflowX = "scroll";
      }
    }
  }, [selected]);

  const getAllChoicesLabels = (choices: Choice[]) => {
    const eleLabels: JSX.Element[] = [];
    let i = 0;

    choices.forEach((c, idx) => {
      c.values.forEach((v) => {
        eleLabels.push(
          <Label
            idx={i}
            key={i + v}
            type={type}
            title={v}
            field={c.field}
            on={(selected[idx] as Choice)?.values.includes(v)}
            click={select}
          />
        );
        i++;
      });
      if (idx !== choices.length - 1) {
        eleLabels.push(<span className="slider_label">·</span>);
      }
    });

    return eleLabels;
  };

  return (
    <div
      className={`slider ${type} ${
        type === "page" && titles?.length ? "tick" : ""
      }`}
      onTouchStart={() => {
        globalThis.contentSliderPressed = false;
        if (type === "page") {
          globalThis.groupSliderPressed = false;
          globalThis.choiceSliderPressed = false;
          globalThis.pageSliderPressed = true;
        } else if (type === "group") {
          globalThis.pageSliderPressed = false;
          globalThis.choiceSliderPressed = false;
          globalThis.groupSliderPressed = true;
        } else if (type === "choice") {
          globalThis.pageSliderPressed = false;
          globalThis.groupSliderPressed = false;
          globalThis.choiceSliderPressed = true;
        }
      }}
    >
      {type !== "choice" && !fetching && titles?.length
        ? titles.map((t, idx) => (
            <Label
              idx={idx + 1}
              key={idx}
              type={type}
              title={t}
              on={(selected as string[]).includes(t)}
              click={select}
            />
          ))
        : null}

      {type === "choice" && !fetching && choices?.length
        ? getAllChoicesLabels(choices).map((ele) => ele)
        : null}

      {type === "page" && !fetching && titles?.length ? (
        <>
          <button
            id="btn_first"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (setSelectedPageIdx) {
                globalThis.pageSliderPressed = false;
                setSelectedPageIdx(1);
              }
            }}
          >
            {"<<"}
          </button>
          <button
            id="btn_last"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (setSelectedPageIdx) {
                globalThis.pageSliderPressed = false;
                setSelectedPageIdx(titles.length);
              }
            }}
          >
            {">>"}
          </button>
        </>
      ) : null}
    </div>
  );
};

export const choiceStrMap: any = {
  H: "Hybrid",
  S: "Sativa",
  I: "Indica",
  C: "C",
  N: "None",
  R: "REC",
  M: "MED",
};

const Label = ({ idx, type, title, field, on, click }: T_SLIDER_LABEL) => {
  const getChoiceText = (title: string) => {
    return choiceStrMap[title] || title;
  };
  return (
    <span
      id={`slider_label_${type + idx}`}
      className={`slider_label ${on ? "selected" : ""}`}
      onClick={(e) => {
        if (type === "page") {
          e.stopPropagation();
          e.preventDefault();
          globalThis.pageSliderPressed = false;
        }
        click(type, title, field);
      }}
    >
      {type === "choice" ? getChoiceText(title) : title}
    </span>
  );
};

export default Slider;
