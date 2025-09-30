
export const taxBrackets = [
  {
    min: 0,
    max: 500000,
    rate: 0.05,
  },
  {
    min: 500001,
    max: 1000000,
    rate: 0.2,
  },
  {
    min: 1000001,
    max: Infinity,
    rate: 0.3,
  },
];
