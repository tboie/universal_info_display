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

export default [
  // top row
  {
    t: "s",
    x: 0,
    y: 0,
    w: 33.333,
    h: 33.333,
    z: 0,
    l: { t: 0, l: 0, r: 33.333, b: 33.333 },
    c: { t: [], r: [1, 4], b: [3, 4], l: [] },
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
    c: { t: [], r: [2], b: [3, 4, 5], l: [0, 3] },
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
    c: { t: [], r: [], b: [5], l: [1, 4] },
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
    l: { t: 33.333, l: 0 },
    c: { t: [0, 1], r: [1, 4, 7], b: [6, 7], l: [] },
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
    bp: ["sm", "lg"],
  },
] as T[];
