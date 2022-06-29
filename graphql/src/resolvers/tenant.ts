import { createEdgesWithPageInfo } from "../utils/cursor";
import { assert, ERROR_CODES, ERROR_MESSAGES } from "/opt/utils/errors";
import type { Resolvers } from "../generated";
import type { Context } from "../types";

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
    async createTenant (_, args, ctx) {
      const tenant = await ctx.dataSources.db.tenant({ where: { name: { _eq: args?.input?.name } } });
      assert(!tenant, ERROR_MESSAGES.TENANT_NAME_ALREADY_EXISTS, ERROR_CODES.CONFLICT);
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