import type { Resolvers } from "../generated";
import type { Context } from "../types";

export const env: Resolvers<Context> = {
  Query: {
    env() {
      return process.env.NODE_ENV;
    },

    stage() {
      return process.env.STAGE;
    },

    version() {
      return process.env.VERSION;
    },
  },
};
