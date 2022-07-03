import type { Resolvers } from "/opt/schemas/generated";
import type { Context } from "./types";

export const resolvers: Resolvers<Context> = {
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
