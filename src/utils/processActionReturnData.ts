import cloneDeep from "lodash.clonedeep";
import { convertDecimalToNumber } from "@/utils/convertDecimalToNumbers";
import { removeFields } from "@/utils/query.utils";

export function processActionReturnData<T>(data: T | T[], limitFields: string[] = []) {
  if (data instanceof Array) {
    return data.map((item) => {
      return cloneDeep(removeFields(convertDecimalToNumber(item as Record<string, unknown>), limitFields));
    });
  }

  return cloneDeep(removeFields(convertDecimalToNumber(data as Record<string, unknown>), limitFields));
}