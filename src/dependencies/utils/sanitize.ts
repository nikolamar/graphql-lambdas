import omitDeep from "omit-deep-lodash";

export const sanitize = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) => {
    return (value === null ? undefined : value);
  }));
};

export function isObject (obj) {
  return typeof obj === "object" && !Array.isArray(obj) && obj !== null;
}

export function parseDeep (obj) {
  if (!obj) {
    return obj;
  }

  Object.keys(obj).forEach(key => {
    if (isObject(obj[key])) {
      parseDeep(obj[key]);
    }

    if (typeof obj[key] === "string") {
      try {
        obj[key] = parseDeep(JSON.parse(obj[key]));
      } catch (e) {}
    }
  });

  return obj;
}

export function getSanitizedResponse (obj, fieldsNotToSend) {
  const result = omitDeep(parseDeep(obj), fieldsNotToSend) as Record<string, any>;

  if (result.body) result.body = JSON.stringify(result.body);

  return result;
}