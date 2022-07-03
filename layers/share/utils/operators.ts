import { ObjectId } from "mongodb";
import { $or, EQ, GTE, ID, IN, LTE, OR, REGEX } from "../configs/fields";

export const createMatchFromOperators = (where: any) => {
  const match: any = {};
  for (const [key1, value1] of Object.entries(where)) {
    if (key1 === OR && Array.isArray(value1)) {
      const orOperators = [];

      for (const or of value1) {
        orOperators.push(createMatchFromOperators(or));
      }
      match[$or] = orOperators;

      continue;
    }

    for (const [key2, value2] of Object.entries(value1 as any)) {
      switch (key2) {
        case EQ:
          match[key1] = value2;
          break;
        case REGEX:
          match[key1] = new RegExp(value2 as any, "i");
          break;
        case LTE:
          match[key1] = Object.assign(match[key1] || {}, { $lte: value2 });
          break;
        case GTE:
          match[key1] = Object.assign(match[key1] || {}, { $gte: value2 });
          break;
        case IN:
          match[key1] = { $in: value2 };
          break;
        default:
          match[key1] = value2;
      }
    }
  }

  // prepare query params
  if (match?.[ID] && typeof match?.[ID] === "string") match[ID] = new ObjectId(match?.[ID]);

  return match;
};
