import type { Resolvers } from "../generated";
import type { Context } from "../types";

export const ping: Resolvers<Context> = {
  Query: {
    ping() {
      return "pong";
    },
  },
};
