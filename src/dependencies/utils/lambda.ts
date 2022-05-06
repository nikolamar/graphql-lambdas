import { response } from "./response";

export const METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
};

/**
 * This is example how to use LambdaResolver class
 * create and app.ts file
 * and in app.ts handler function
 *
 * 
 import { LambdaResolver, METHODS } from "/opt/lambda";
 import { getLayerInfo } from "./get";
 
 export function handler (event) {
   return new LambdaResolver(event)
     .match(event => event?.requestContext?.http?.method)
     .add(METHODS.GET, getLayerInfo)
     .resolve();
 }
 *
 */
export class LambdaResolver {
  private _resolvers = {};
  private _match = "*";

  constructor(private readonly event) {}

  match (callback) {
    if (typeof callback === "function") {
      const match = callback(this.event);
      this._match = match?.toUpperCase();
    }
    return this;
  }

  /**
     * If resolver is undefined, in that case it means that
     * we are switching method with resolver, we are using
     * just one parameter and that is resolver function.
     * We are setting method to asterisk (any method)
     */
  add (method, resolver = null) {
    if (!resolver) {
      resolver = method;
      method = "*";
    }
    this._resolvers[method?.toUpperCase()] = resolver;
    return this;
  }

  resolve () {
    try {
      const resolver = this._resolvers?.[this._match]?.(this.event);
      if (!resolver) {
        throw new Error("Method not supported.");
      }
      return resolver;
    } catch (e) {
      return response(500, e.stack);
    }
  }
}