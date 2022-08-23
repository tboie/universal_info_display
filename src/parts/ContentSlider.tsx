import "./ContentSlider.css";

import React, { useEffect, useState } from "react";
import { chunkArr, Filter, UniversalInfoDisplayItem } from "./Shell";
import Grid from "./Grid";
import { RangeStatus } from "./Range";

const snapThreshold = 0.39;

type ContentSliderType = "grid" | "dynamic";
type PartContentSliderType = {
  type: ContentSliderType;
  items?: UniversalInfoDisplayItem[];
  contentNodes?: React.ReactNode[];
  setContentNodes?: (nodes: JSX.Element[]) => void;
  selectedGroup: string;
  selectedPageIdx: number;
  setSelectedPageIdx: (val: number) => any;
  setSelectedItemIdx?: (val: any) => any;
  getData?: (group: string) => void;
  fetching?: boolean;
  rangeModal?: boolean;
  selectedFilter?: Filter;
  setPages?: (pages: number[]) => void;
};

// paginator flag to create new string node when proccing text
let newStringNode = true;

const ContentSlider = ({
  type,
  items,
  contentNodes,
  setContentNodes,
  selectedGroup,
  selectedPageIdx,
  setSelectedPageIdx,
  setSelectedItemIdx,
  getData,
  fetching,
  rangeModal,
  selectedFilter,
  setPages,
}: PartContentSliderType) => {
  const [pageProcNum, setPageProcNum] = useState(() => (contentNodes ? 1 : 0));
  const [pagesNodes, setPagesNodes] = useState<React.ReactNode[]>([[]]);

  const initScrollSpeedListener = () => {
    // scroll speed/direction
    const container = document.getElementById(`content-slider-${type}`);
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
    initScrollSpeedListener();

    return () => {
      newStringNode = true;
    };
  }, []);

  const addNodeToPage = (
    page: number,
    node: React.ReactNode,
    procNextPage?: boolean
  ) => {
    const cPagesNodes = [...pagesNodes];
    const cPageNodes = cPagesNodes[page - 1] as React.ReactNode[];

    if (!cPageNodes?.length) {
      const newPageNode = [];
      newPageNode.push(node);
      cPagesNodes[page - 1] = newPageNode;
    } else if (cPagesNodes.length) {
      cPageNodes.push(node);
    }

    procNextPage && setPageProcNum(pageProcNum + 1);
    setPages &&
      setPages(new Array(cPagesNodes.length).fill(0).map((n, idx) => idx + 1));
    setPagesNodes(cPagesNodes);
  };

  const moveLastWord = (nodeIdx: number, page: number, newNode: boolean) => {
    if (contentNodes) {
      const cContentNodes = [...contentNodes] as React.ReactNode[];
      const text = cContentNodes[nodeIdx] as string;

      // remove from string
      const lastIndex = text.lastIndexOf(" ");
      const noLastWord = text.substring(0, lastIndex);

      // get last word
      const words = text.split(" ");
      const lastWord = " " + words[words.length - 1];

      cContentNodes[nodeIdx] = noLastWord;
      if (newNode) {
        cContentNodes.splice(nodeIdx + 1, 0, lastWord);
      } else {
        // entire string moved to next page and still overflowing,
        // remove empty ele from array
        if (noLastWord) {
          cContentNodes[nodeIdx] = noLastWord;
        } else {
          cContentNodes.splice(nodeIdx - 1, 1);
        }
      }

      setContentNodes && setContentNodes(cContentNodes as JSX.Element[]);

      const cPagesNodes = [...pagesNodes];
      const cPageNodes = cPagesNodes[page - 1] as React.ReactNode[];

      if (newNode) {
        const newPageNode = [];
        newPageNode.push(lastWord);
        cPagesNodes[page - 1] = newPageNode;
      } else {
        cPageNodes[0] = lastWord + cPageNodes[0];
      }

      const prevPage = cPagesNodes[page - 2] as React.ReactNode[];
      if (prevPage) {
        const prevPageLastNodeIdx = prevPage.length - 1;

        if (prevPageLastNodeIdx) {
          // entire string moved to next page and still overflowing,
          // remove empty ele from array
          if (noLastWord) {
            prevPage[prevPageLastNodeIdx] = noLastWord;
          } else {
            prevPage.pop();
          }
        }
      }
      cPagesNodes[page - 2] = prevPage;

      setPages &&
        setPages(
          new Array(cPagesNodes.length).fill(0).map((n, idx) => idx + 1)
        );
      setPagesNodes(cPagesNodes);
    }
  };

  const popLastNodeToNew = (page: number) => {
    const cPagesNodes = [...pagesNodes];
    let cPageNodes = cPagesNodes[page - 1] as React.ReactNode[];

    if (cPageNodes?.length) {
      const lastNode = cPageNodes.slice(-1)[0];
      const numPageNodes = cPageNodes.length;

      const newPageNodes = [];
      newPageNodes.push(lastNode);
      cPagesNodes.push(newPageNodes);

      cPagesNodes[page - 1] = cPageNodes.filter(
        (n, idx) => idx !== numPageNodes - 1
      );
    }

    setPageProcNum(pageProcNum + 1);
    setPages &&
      setPages(new Array(cPagesNodes.length).fill(0).map((n, idx) => idx + 1));
    setPagesNodes(cPagesNodes);
  };

  function checkOverflow(el: HTMLElement) {
    const curOverflow = el.style.overflow;
    if (!curOverflow || curOverflow === "visible") el.style.overflow = "hidden";
    const isOverflowing = el.clientHeight < el.scrollHeight;
    el.style.overflow = curOverflow;
    return isOverflowing;
  }

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (contentNodes && pageProcNum) {
      // flatten pagesNodes arrays to sync with source contentNodes node array
      const nodeIdx = pagesNodes.flat().length;
      const currNode = contentNodes[nodeIdx];
      const prevNode = contentNodes[nodeIdx - 1];

      let delay = 1;

      if (prevNode) {
        // may be better to check if heavy img node exists on page
        // then slow everything down
        if ((prevNode as React.ReactElement).type === "img") {
          delay = 1;
        }
      }

      if (currNode) {
        timer = setTimeout(() => {
          const containerId = `#overflow-wrapper-${pageProcNum}`;
          const container = document.querySelector(containerId) as HTMLElement;

          if (container) {
            if (!checkOverflow(container)) {
              // prev p node finished splitting to next page
              // add next element and proc next page
              if (!newStringNode) {
                newStringNode = true;
                addNodeToPage(pageProcNum + 1, currNode, true);
              } else {
                addNodeToPage(pageProcNum, currNode);
              }
            } else {
              if (typeof prevNode === "string") {
                if (newStringNode) {
                  newStringNode = false;
                  moveLastWord(nodeIdx - 1, pageProcNum + 1, true);
                } else {
                  moveLastWord(nodeIdx - 2, pageProcNum + 1, false);
                }
              } else {
                popLastNodeToNew(pageProcNum);
              }
            }
          }
          // image components dont get added for faster speeds?
          // why? large image file?
        }, delay);
      }
    }

    return () => clearTimeout(timer);
  }, [pagesNodes]);

  return (
    <div
      id={`content-slider-${type}`}
      className="content-slider"
      onTouchStart={(e) => {
        e.stopPropagation();
        globalThis.contentSliderPressed = true;
        globalThis.pageSliderPressed = false;
      }}
    >
      {type === "grid" ? (
        items?.length ? (
          chunkArr(items, 6).map((items, idx) => (
            <Page
              type={"grid"}
              key={"page" + idx}
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
            type={"grid"}
            text={"No Items Found"}
            key={"page"}
            num={1}
            items={[]}
            selectedGroup={selectedGroup}
            selectedPageIdx={selectedPageIdx}
            setSelectedPageIdx={setSelectedPageIdx}
            setSelectedItemIdx={setSelectedItemIdx}
            getData={getData}
            fetching={fetching}
          />
        )
      ) : null}

      {type === "dynamic" &&
        pagesNodes &&
        pagesNodes.map((nodes, idx) => {
          return (
            <Page
              key={"page" + idx}
              type={type}
              num={idx + 1}
              selectedGroup={selectedGroup}
              selectedPageIdx={selectedPageIdx}
              setSelectedPageIdx={setSelectedPageIdx}
              setSelectedItemIdx={setSelectedItemIdx}
              children={nodes}
            />
          );
        })}

      {rangeModal && <RangeStatus f={selectedFilter} />}
    </div>
  );
};

const Page = ({
  type,
  text,
  items,
  contentNodes,
  children,
  num,
  selectedGroup,
  selectedPageIdx,
  setSelectedPageIdx,
  setSelectedItemIdx,
  getData,
  fetching,
}: {
  type: ContentSliderType;
  text?: string;
  items?: UniversalInfoDisplayItem[];
  contentNodes?: React.ReactNode;
  children?: React.ReactNode;
  num: number;
  selectedGroup: string;
  selectedPageIdx: number;
  setSelectedPageIdx: (val: number) => void;
  setSelectedItemIdx?: (val: number) => void;
  getData?: (group: string) => void;
  fetching?: boolean;
}) => {
  // IntersectionObservers for page snaps and page changes
  useEffect(() => {
    const snapPage = (target: HTMLElement) => {
      const container = document.querySelector(
        `#content-slider-${type}`
      ) as HTMLElement;

      container.style.overflowX = "hidden";
      setTimeout(() => {
        target.scrollIntoView({
          inline: "center",
        });
      }, 10);
      setTimeout(() => {
        container.style.overflowX = "scroll";
      }, 50);
    };

    const handleSnapLeft = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting && globalThis.contentSliderPressed) {
          if (scrollDirection === "left" && scrollSpeed < snapThreshold) {
            snapPage(entry.target);
          }
        }
      });
    };

    const handleSnapRight = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting && globalThis.contentSliderPressed) {
          if (scrollDirection === "right" && scrollSpeed * -1 < snapThreshold) {
            snapPage(entry.target);
          }
        }
      });
    };

    const handlePageChange = (entries: any) => {
      entries.forEach((entry: any) => {
        if (entry.isIntersecting && globalThis.contentSliderPressed) {
          const id = entry.target.id;
          const selected = parseInt(id.replace(`content-page-${type}-`, ""));
          setSelectedPageIdx(selected);
        }
      });
    };

    const container = document.querySelector(
      `#content-slider-${type}`
    ) as HTMLElement;

    const optSnapLeft = {
      root: container,
      threshold: 0,
      rootMargin: "0% -99% 0% 0%",
    };
    const optPageChange = {
      root: container,
      threshold: 0,
      rootMargin: "-50%",
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

    const elePage = document.querySelectorAll(`.content-page-${type}`)[num - 1];

    if (elePage) {
      obsPageChange.observe(elePage);
      obsSnapLeft.observe(elePage);
      obsSnapRight.observe(elePage);
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
        `#content-slider-${type}`
      ) as HTMLElement;

      container.style.overflowX = "hidden";
      setTimeout(() => {
        document
          .querySelectorAll(`.content-page-${type}`)
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
    <div id={`content-page-${type}-${num}`} className={`content-page-${type}`}>
      {type === "grid" && items?.length === 0 && !fetching && (
        <>
          <img className="page-bg" src="/media/bg.jpg" alt="bg" />
          <span className="no-items">{text}</span>
        </>
      )}

      {((type === "grid" && items?.length === 0) || !selectedGroup) && (
        <img className="page-bg" src="/media/bg.jpg" alt="bg" />
      )}

      {type === "grid" && !fetching && items?.length && (
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

      {type === "dynamic" && (
        <div id={`overflow-wrapper-${num}`} className={`overflow-wrapper`}>
          {React.Children.map(children, (child, idx) => {
            if (typeof child === "string") {
              return <p className={`desc`}>{child}</p>;
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

export default ContentSlider;
