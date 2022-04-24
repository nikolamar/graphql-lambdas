import { USER, PASSWORD } from "../configs/db";
import type { Resolvers } from "../generated";
import type { Context } from "../types";

export const db: Resolvers<Context> = {
  Query: {
    db () {
      return {
        user: USER,
        password: PASSWORD,
      };
    },
  },
};