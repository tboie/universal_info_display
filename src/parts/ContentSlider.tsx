import "./ContentSlider.css";

import { useEffect } from "react";
import { chunkArr, UniversalInfoDisplayItem } from "./Shell";
import Grid from "./Grid";

const ContentSlider = ({
  items,
  selectedGroup,
  selectedPageIdx,
  setSelectedPageIdx,
  setSelectedItemIdx,
  getData,
  fetching,
  snap,
}: {
  items: UniversalInfoDisplayItem[];
  selectedGroup: string;
  selectedPageIdx: number;
  setSelectedPageIdx: (val: number) => any;
  setSelectedItemIdx: (val: any) => any;
  getData: (group: string) => void;
  fetching: boolean;
  snap?: "page" | "half";
}) => {
  const initScrollSpeedListener = () => {
    // scroll speed/direction
    const container = document.getElementById("content-slider");
    if (container) {
      let lastOffset = container.scrollLeft;
      let lastDate = new Date().getTime();

      container.addEventListener("scroll", (e) => {
        const delayInMs = e.timeStamp - lastDate;
        const ele = e.target as HTMLDivElement;

        const offset = ele.scrollLeft - lastOffset;
        globalThis.scrollSpeed = offset / delayInMs;

        if (lastOffset === ele.scrollLeft) {
          globalThis.scrollDirection = "stopped";
        } else if (lastOffset < ele.scrollLeft) {
          globalThis.scrollDirection = "left";
        } else if (lastOffset > ele.scrollLeft) {
          globalThis.scrollDirection = "right";
        }

        lastDate = e.timeStamp;
        lastOffset = ele.scrollLeft;
      });
    }
  };

  useEffect(() => {
    if (snap) {
      initScrollSpeedListener();
    }
  }, []);

  return (
    <>
      <div id="content-slider" className="content-slider">
        {items?.length ? (
          chunkArr(items, 6).map((items, idx) => (
            <Page
              key={idx}
              num={idx + 1}
              items={items}
              selectedGroup={selectedGroup}
              selectedPageIdx={selectedPageIdx}
              setSelectedPageIdx={setSelectedPageIdx}
              setSelectedItemIdx={setSelectedItemIdx}
              getData={getData}
              fetching={fetching}
            />
          ))
        ) : (
          <Page
            text={"No Items Found"}
            key={0}
            num={1}
            items={[]}
            selectedGroup={selectedGroup}
            selectedPageIdx={selectedPageIdx}
            setSelectedPageIdx={setSelectedPageIdx}
            setSelectedItemIdx={setSelectedItemIdx}
            getData={getData}
            fetching={fetching}
          />
        )}
      </div>
    </>
  );
};

const Page = ({
  text,
  items,
  num,
  selectedGroup,
  selectedPageIdx,
  setSelectedPageIdx,
  setSelectedItemIdx,
  getData,
  fetching,
}: {
  text?: string;
  items?: UniversalInfoDisplayItem[];
  num: number;
  selectedGroup: string;
  selectedPageIdx: number;
  setSelectedPageIdx: (val: number) => void;
  setSelectedItemIdx: (val: number) => void;
  getData: (group: string) => void;
  fetching: boolean;
}) => {
  // IntersectionObservers for page snaps and page changes
  useEffect(() => {
    const handleSnapLeft = (entries: any, observer: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          if (globalThis.contentSliderPressed) {
            if (scrollDirection === "left") {
              if (scrollSpeed < 0.38) {
                const container = document.querySelector(
                  "#content-slider"
                ) as HTMLElement;

                container.style.overflowX = "hidden";
                setTimeout(() => {
                  entry.target.scrollIntoView({
                    inline:
                      entry.target.id.indexOf("half-page") > -1
                        ? "nearest"
                        : "center",
                  });
                }, 10);
                setTimeout(() => {
                  container.style.overflowX = "scroll";
                }, 100);
              }
            }
          }
        }
      });
    };

    const handleSnapRight = (entries: any, observer: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          if (globalThis.contentSliderPressed) {
            if (scrollDirection === "right") {
              if (scrollSpeed * -1 < 0.38) {
                const container = document.querySelector(
                  "#content-slider"
                ) as HTMLElement;

                container.style.overflowX = "hidden";
                setTimeout(() => {
                  entry.target.scrollIntoView({
                    inline:
                      entry.target.id.indexOf("half-page") > -1
                        ? "end"
                        : "center",
                  });
                }, 10);
                setTimeout(() => {
                  container.style.overflowX = "scroll";
                }, 100);
              }
            }
          }
        }
      });
    };

    const handlePageChange = (entries: any, observer: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting) {
          if (globalThis.contentSliderPressed) {
            const id = entry.target.id;
            const selected = parseInt(id.replace("content-page", ""));
            setSelectedPageIdx(selected);
          }
        }
      });
    };

    const container = document.querySelector("#content-slider") as HTMLElement;

    const optSnapLeft = {
      root: container,
      threshold: 0,
      rootMargin: "0% -99% 0% 0%",
    };
    const optPageChange = {
      root: container,
      threshold: 0,
      rootMargin: "50%",
    };
    const optSnapRight = {
      root: container,
      threshold: 0,
      rootMargin: "0% 0% 0% -99%",
    };

    const obsPageChange = new IntersectionObserver(
      handlePageChange,
      optPageChange
    );
    const obsSnapLeft = new IntersectionObserver(handleSnapLeft, optSnapLeft);
    const obsSnapRight = new IntersectionObserver(
      handleSnapRight,
      optSnapRight
    );

    const elePage = document.querySelector(`.content-page:nth-of-type(${num})`);
    if (elePage) {
      obsPageChange.observe(elePage);
      obsSnapLeft.observe(elePage);
      obsSnapRight.observe(elePage);
    }

    const eleHalf = document.querySelector(`.half-page:nth-of-type(${num})`);
    if (eleHalf) {
      obsSnapLeft.observe(eleHalf);
      obsSnapRight.observe(eleHalf);
    }

    return () => {
      obsPageChange.disconnect();
      obsSnapLeft.disconnect();
      obsSnapRight.disconnect();
    };
  }, []);

  // Center page when changed
  useEffect(() => {
    if (!globalThis.contentSliderPressed) {
      const container = document.querySelector(
        "#content-slider"
      ) as HTMLElement;

      container.style.overflowX = "hidden";
      setTimeout(() => {
        document
          .querySelectorAll(".content-page")
          [selectedPageIdx - 1]?.scrollIntoView({
            inline: "center",
          });
      }, 10);
      setTimeout(() => {
        container.style.overflowX = "scroll";
      }, 100);
    }
  }, [selectedPageIdx]);

  return (
    <div
      id={`content-page${num}`}
      className="content-page"
      onTouchStart={(e) => {
        globalThis.contentSliderPressed = true;
        globalThis.pageSliderPressed = false;
        globalThis.groupSliderPressed = false;
        globalThis.choiceSliderPressed = false;
      }}
    >
      <div id={`half-page${num}`} className="half-page" />
      {items?.length === 0 && !fetching && (
        <>
          <img className="page-bg" src="/media/bg.jpg" />
          <span className="no-items">{text}</span>
        </>
      )}

      {(items?.length === 0 || !selectedGroup) && (
        <img className="page-bg" src="/media/bg.jpg" />
      )}

      {!fetching && items?.length && (
        <Grid
          // only render items in range of selectedPageIdx
          items={
            num >= selectedPageIdx - 4 && num <= selectedPageIdx + 4
              ? items
              : []
          }
          setSelectedItemIdx={setSelectedItemIdx}
          selectedGroup={selectedGroup}
          getData={getData}
        />
      )}
    </div>
  );
};

export default ContentSlider;
