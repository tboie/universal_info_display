import "./Slider.css";

import { useEffect } from "react";
import { FilterChoice } from "./Shell";

export type SliderType = "choice" | "group" | "page";

type PartSliderType = {
  type: SliderType;
  titles?: string[];
  choices?: FilterChoice[];
  selected: string[] | FilterChoice[];
  select: (type: SliderType, title: string, field?: string) => void;
  setSelectedPageIdx?: (val: number) => any;
  fetching: boolean;
  aliases?: any;
  filtersOn?: boolean;
};

type PartSliderLabelType = {
  idx: number;
  type: SliderType;
  title: string;
  field?: string;
  on: boolean;
  click: (type: SliderType, title: string, field?: string) => void;
  aliases?: any;
  filtersOn?: boolean;
};

const Slider = ({
  type,
  titles,
  choices,
  selected,
  select,
  setSelectedPageIdx,
  fetching,
  aliases,
  filtersOn,
}: PartSliderType) => {
  useEffect(() => {
    let observer: IntersectionObserver;
    const container = document.querySelector(`.slider.${type}`);
    const labels = document.querySelectorAll(`.slider.${type} .slider-label`);

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
                parseInt(ele.id.replace("slider-label-" + type, "")) - 1;
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

  const getAllChoicesLabels = (choices: FilterChoice[]) => {
    const eleLabels: JSX.Element[] = [];
    let i = 0;

    choices.forEach((c, idx) => {
      const selChoice = selected[idx] as FilterChoice;
      const selVals = selChoice.values;

      c.values.forEach((v) => {
        eleLabels.push(
          <Label
            idx={i}
            key={i + v.toString()}
            type={type}
            title={c.type === "string" ? v.toString() : v.toString() + c.field}
            field={c.field}
            on={selVals.map((v) => v).includes(v)}
            click={select}
            aliases={aliases}
          />
        );
        i++;
      });
      if (idx !== choices.length - 1) {
        eleLabels.push(
          <span key={`choice-${c.field}-${idx}`} className="slider-label dot">
            ·
          </span>
        );
      }
    });

    return eleLabels;
  };

  return (
    <div
      className={`slider ${type} ${
        type === "page" && titles?.length ? "tick" : ""
      }`}
      onPointerDown={(e) => {
        if (type === "page") {
          e.stopPropagation();
          globalThis.contentSliderPressed = false;
          globalThis.filterControlPressed = false;
          globalThis.pageSliderPressed = true;
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
            id="btn-first"
            onClick={(e) => {
              if (setSelectedPageIdx) {
                globalThis.pageSliderPressed = false;
                setSelectedPageIdx(1);
              }
            }}
          >
            {"<<"}
          </button>
          <button
            id="btn-last"
            onClick={(e) => {
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

const Label = ({
  idx,
  type,
  title,
  field,
  on,
  click,
  aliases,
  filtersOn,
}: PartSliderLabelType) => {
  return (
    <span
      id={`slider-label-${type + idx}`}
      className={`slider-label ${on ? "selected" : ""}`}
      onClick={(e) => {
        e.stopPropagation();

        globalThis.contentSliderPressed = false;
        globalThis.filterControlPressed = false;
        globalThis.pageSliderPressed = false;

        click(type, title, field);
      }}
    >
      {aliases && field && aliases[field] && aliases[field][title]
        ? aliases[field][title]
        : title}
    </span>
  );
};

export default Slider;
