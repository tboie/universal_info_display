export type T_SIDE = "t" | "r" | "b" | "l";
export type T_LOCK = { t?: number; r?: number; b?: number; l?: number };
export type T = {
  i?: number;
  t: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  l: T_LOCK;
  c: { t: number[]; r: number[]; b: number[]; l: number[] };
  bp: ("sm" | "lg")[];
  aR?: number;
  aB?: number;
  tX?: number;
  tY?: number;
  oW?: number;
  oH?: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  tempL?: T_LOCK;
  updated?: boolean;
};

// 10x10 Grid
/*
const units: T[] = [];
let x = 0,
  y = 0;

for (y = 0; y < 10; y++) {
  for (x = 0; x < 10; x++) {
    // set connections
    let cT: number[] = [];
    let cB: number[] = [];
    let cL: number[] = [];
    let cR: number[] = [];

    //top
    if (y > 0) {
      cT.push(x + y * 10 - 10);

      if (x > 0) {
        cT.push(x - 1 + y * 10 - 10);
      }
      if (x < 9) {
        cT.push(x + 1 + y * 10 - 10);
      }
    }

    //bottom
    if (y < 9) {
      cB.push(x + y * 10 + 10);

      if (x > 0) {
        cB.push(x - 1 + y * 10 + 10);
      }
      if (x < 9) {
        cB.push(x + 1 + y * 10 + 10);
      }
    }

    //right
    if (x < 9) {
      cR.push(x + y * 10 + 1);

      if (y > 0) {
        cR.push(x + y * 10 + 1 - 10);
      }
      if (y < 9) {
        cR.push(x + y * 10 + 1 + 10);
      }
    }

    //left
    if (x > 0) {
      cL.push(x + y * 10 - 1);

      if (y > 0) {
        cL.push(x + y * 10 - 1 - 10);
      }
      if (y < 9) {
        cL.push(x + y * 10 - 1 + 10);
      }
    }

    units.push({
      t: "s",
      x: x * 10,
      y: y * 10,
      w: 10,
      h: 10,
      minW: 5,
      maxW: 25,
      minH: 5,
      maxH: 25,
      z: 0,
      l: {
        t: y === 0 ? 0 : undefined,
        b: y === 9 ? 100 : undefined,
        r: x === 9 ? 100 : undefined,
        l: x === 0 ? 0 : undefined,
      },
      c: { t: cT, r: cR, b: cB, l: cL },
      bp: ["sm", "lg"],
    } as T);
  }
}

export default units;
*/

// 9 Unit Grid
export default [
  // top row
  {
    t: "s",
    x: 0,
    y: 0,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: { t: 0, l: 0 },
    c: { t: [], r: [1, 4], b: [3, 4], l: [] },
    minW: 5,
    maxW: 50,
    minH: 5,
    maxH: 50,
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 33.333,
    y: 0,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: { t: 0 },
    c: { t: [], r: [2, 5], b: [3, 4, 5], l: [0, 3] },
    minW: 5,
    maxW: 50,
    minH: 5,
    maxH: 50,
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 66.666,
    y: 0,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: { t: 0, r: 100 },
    c: { t: [], r: [], b: [5, 4], l: [1, 4] },
    minW: 5,
    maxW: 50,
    minH: 5,
    maxH: 50,
    bp: ["sm", "lg"],
  },
  // middle row
  {
    t: "s",
    x: 0,
    y: 33.333,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: { l: 0 },
    c: { t: [0, 1], r: [1, 4, 7], b: [6, 7], l: [] },
    minW: 5,
    maxW: 50,
    minH: 5,
    maxH: 50,
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 33.333,
    y: 33.333,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: {},
    c: { t: [0, 1, 2], r: [2, 5, 8], b: [6, 7, 8], l: [0, 3, 6] },
    minW: 5,
    maxW: 50,
    minH: 5,
    maxH: 50,
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 66.666,
    y: 33.333,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: { r: 100 },
    c: { t: [1, 2], r: [], b: [7, 8], l: [1, 4, 7] },
    minW: 5,
    maxW: 50,
    minH: 5,
    maxH: 50,
    bp: ["sm", "lg"],
  },
  //bottom row
  {
    t: "s",
    x: 0,
    y: 66.666,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: { l: 0, b: 100 },
    c: { t: [3, 4], r: [4, 7], b: [], l: [] },
    minW: 5,
    maxW: 50,
    minH: 5,
    maxH: 50,
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 33.333,
    y: 66.666,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: { b: 100 },
    c: { t: [3, 4, 5], r: [5, 8], b: [], l: [3, 6] },
    minW: 5,
    maxW: 50,
    minH: 5,
    maxH: 50,
    bp: ["sm", "lg"],
  },
  {
    t: "s",
    x: 66.666,
    y: 66.666,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: { r: 100, b: 100 },
    c: { t: [4, 5], r: [], b: [], l: [4, 7] },
    minW: 5,
    maxW: 50,
    minH: 5,
    maxH: 50,
    bp: ["sm", "lg"],
  },
] as T[];
