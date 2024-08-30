export const INVALID_ORIGIN = "Invalid request origin";
export const getAcceptSchemaError = (path?: string) =>
  `Invalid body provided. Please see acceptSchema for ${path || "route"}`;
export const getResponseSchemaError = (path?: string) =>
  `Return data invalid, . Please see responseSchema for ${path || "route"}`;
