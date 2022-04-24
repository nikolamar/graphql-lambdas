import type { Resolvers } from "../generated";
import type { Context } from "../types";
import { createEdgesWithPageInfo } from "../utils/cursor";

export const tenant: Resolvers<Context> = {
  Query: {
    tenant (_, args, ctx) {
      return ctx.dataSources.db.tenant(args);
    },

    async tenants (_, args, ctx) {
      const dbTenants = await ctx.dataSources.db.tenants(args);
      return createEdgesWithPageInfo(dbTenants, args);
    },
  },
  Mutation: {
    createTenant (_, args, ctx) {
      return ctx.dataSources.db.createTenant(args);
    },

    updateTenant (_, args, ctx) {
      return ctx.dataSources.db.updateTenant(args);
    },
    
    deleteTenant (_, args, ctx) {
      return ctx.dataSources.db.deleteTenant(args);
    }
  }
};