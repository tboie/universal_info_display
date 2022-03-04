import { useEffect } from "react";
import { ViewSection, Slider } from "./Shell";
import SliderLabel from "./SliderLabel";

const NavSlider = (
  props: ViewSection & Slider & { selectedFilterIdx: number }
) => {
  const {
    type,
    pagesBool,
    setPagesBool,
    selectedPageIdx,
    setSelectedPageIdx,
    selectedGroup,
    setSelectedGroup,
    groupFilters,
    selectedFilterIdx,
  } = { ...props };

  const sel_labels =
    type === "page"
      ? "#universal_info_display_nav_page_slider .slider_label"
      : "#universal_info_display_nav_group_slider .slider_label";
  const sel_container =
    type === "page"
      ? "#universal_info_display_nav_page_slider"
      : "#universal_info_display_nav_group_slider";

  // Select page when centered
  useEffect(() => {
    const handleIntersect = (entries: any, observer: any) => {
      entries.forEach((entry: any, idx: number) => {
        if (entry.isIntersecting) {
          if (globalThis.numbersPressed || globalThis.groupsPressed) {
            if (type === "page") {
              setSelectedPageIdx(parseInt(entry.target.id.replace("num", "")));
            } else if (type === "group") {
              setSelectedPageIdx(0);
              setSelectedGroup(entry.target.innerText);
            }
          }
        }
      });
    };

    const options = {
      root: document.querySelector(sel_container) as HTMLElement,
      threshold: 0,
      rootMargin: "-50%",
    };

    const obs = new IntersectionObserver(handleIntersect, options);
    document.querySelectorAll(sel_labels).forEach((num) => obs.observe(num));

    return () => obs.disconnect();
  }, [pagesBool, groupFilters]);

  // Toggle pressed flag on touch start
  useEffect(() => {
    document
      .querySelector(sel_container)
      ?.addEventListener("touchstart", () => {
        globalThis.itemsPressed = false;
        globalThis.numbersPressed = type === "page";
        globalThis.groupsPressed = type === "group";
      });
  }, []);

  // Center selected page change
  useEffect(() => {
    if (type === "page" && !globalThis.numbersPressed) {
      const eleNum = document.querySelectorAll(sel_labels)[selectedPageIdx];
      const container = document.querySelector(sel_container) as HTMLDivElement;

      container.style.overflowX = "hidden";
      eleNum?.scrollIntoView({
        inline: "center",
      });
      setTimeout(() => {
        container.style.overflowX = "scroll";
      }, 10);
    }
  }, [selectedPageIdx]);

  // Center selected group on filter change
  // quick fix: re-think this?
  useEffect(() => {
    if (
      type === "group" &&
      !globalThis.groupsPressed &&
      selectedFilterIdx === 0
    ) {
      document.querySelectorAll(sel_labels).forEach((ele) => {
        if ((ele as HTMLElement).innerText === selectedGroup) {
          const container = document.querySelector(
            sel_container
          ) as HTMLDivElement;

          container.style.overflowX = "hidden";
          (ele as HTMLElement)?.scrollIntoView({
            inline: "center",
            behavior: "smooth",
          });
          setTimeout(() => {
            container.style.overflowX = "scroll";
          }, 10);
        }
      });
    }
  }, [selectedFilterIdx]);

  return (
    <div
      id={`universal_info_display_nav_${
        type === "group" ? "group" : "page"
      }_slider`}
      className="universal_info_display_nav_slider"
    >
      {type === "page" &&
        pagesBool.map((page, idx) => {
          return (
            <SliderLabel
              key={idx}
              type={type}
              selected={idx === selectedPageIdx}
              idx={idx}
              title={idx.toString()}
            />
          );
        })}

      {type === "group" &&
        groupFilters?.map((g, idx) => {
          return (
            <SliderLabel
              type={type}
              key={idx}
              selected={g.group === selectedGroup}
              idx={idx}
              title={g.group}
            />
          );
        })}
    </div>
  );
};

export default NavSlider;
