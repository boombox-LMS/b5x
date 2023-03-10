import { z } from "zod";

export const QueryStringValueSchema = z.string().refine((val) => {
  const invalidValues = [
    "undefined",
    "null",
    "NaN",
    "Infinity",
    "-Infinity",
    "true",
    "false",
  ];
  if (invalidValues.includes(val)) {
    return false;
  }
  return true;
});
