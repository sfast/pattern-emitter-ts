import { PatternListener } from "..";

const getByValue = (
  map: Map<PatternListener, PatternListener>,
  searchValue: any
): any => {
  for (const [key, value] of map.entries()) {
    if (value === searchValue) {
      return key;
    }
  }
};

export { getByValue };
