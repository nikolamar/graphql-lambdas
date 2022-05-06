import { assert, ERROR_CODES, ERROR_MESSAGES } from "/opt/utils/errors";
import { createEdgesWithPageInfo } from "../utils/cursor";
import { getClaim } from "../utils/token";
import { USER_ROLES } from "../configs/roles";
import type { Resolvers } from "../generated";
import type { Context } from "../types";

export const user: Resolvers<Context> = {
  User: {
    tenant (user, _, ctx) {
      if (!user?.tenantId) {
        return null;
      }
      return ctx.dataSources.db.dataLoader.tenant(user?.tenantId);
    },
  },
  Query: {
    async me (_, __, ctx) {
      const claim = await getClaim(ctx.headers?.IdToken);
      assert(claim, ERROR_MESSAGES.ID_TOKEN_REQUIRED, ERROR_CODES.UNAUTHORIZED);

      return ctx.dataSources.db.user({ where: { sub: { _eq: claim.sub }}});
    },

    user (_, args, ctx) {
      return ctx.dataSources.db.user(args);
    },

    async users (_, args, ctx) {
      const data = await ctx.dataSources.db.users(args);
      return createEdgesWithPageInfo(data, args);
    },
  },
  Mutation: {
    async createUser (_, args, ctx) {
      const user = await ctx.dataSources.db.user({ where: { email: { _eq: args?.input?.email.toLowerCase() } } });
      assert(!user, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, ERROR_CODES.CONFLICT);
      
      const tenant = await ctx.dataSources.db.tenant({ where: { _id: { _eq: args?.input?.tenantId } } });
      assert(tenant, ERROR_MESSAGES.TENANT_REQUIRED, ERROR_CODES.NOT_FOUND);

      const newRecord = {
        ...args?.input,
        email: args.input?.email.toLowerCase(),
        tenantId: tenant._id.toString(),
      };

      if (args?.skipCognito) {
        return ctx.dataSources.db.createUser({ input: newRecord });
      }
      
      const cognitoUser: any = await ctx?.dataSources?.cognito?.createCognitoUser(newRecord);
      assert(cognitoUser, ERROR_MESSAGES.COGNITO_EMAIL_ALREADY_EXISTS, ERROR_CODES.CONFLICT);

      return ctx.dataSources.db.createUser({ input: cognitoUser });
    },

    async updateUser (_, args, ctx) {
      const record = await ctx.dataSources.db.user(args);
      assert(record, ERROR_MESSAGES.USER_REQUIRED, ERROR_CODES.NOT_FOUND);

      const claim = await getClaim(ctx.headers?.IdToken);      
      const myRole = claim["custom:roles"];
      const myTenantId = claim["custom:tenant"];

      assert(claim["custom:tenant"], ERROR_MESSAGES.CLAIM_REQUIRED_TENANT, ERROR_CODES.UNAUTHORIZED);
      assert(USER_ROLES[myRole] >= USER_ROLES[record.role] && record.tenantId === myTenantId, ERROR_MESSAGES.UNAUTHORIZED_ACTION, ERROR_CODES.UNAUTHORIZED);

      if (args?.skipCognito) {
        return ctx.dataSources.db.updateUser(args);
      }

      const updatedUser = await ctx.dataSources.db.updateUser(args);
      const updatedAttributes = [];
      
      if (updatedUser?.tenantId) {
        updatedAttributes.push({
          Name: "custom:tenant",
          Value: updatedUser.tenantId,
        });
      }
      
      if (updatedUser?.role) {
        updatedAttributes.push({
          Name: "custom:roles",
          Value: updatedUser.role,
        });
      }
      
      if (updatedAttributes.length) {
        await ctx?.dataSources?.cognito?.updateCognitoUserAttributes(updatedUser.email, updatedAttributes);
      }

      if (typeof args?.input?.mfa === "boolean") {
        await ctx?.dataSources?.cognito?.setCognitoUserMFAPreference(updatedUser.email, updatedUser?.mfa);
      }
      
      return updatedUser;
    },

    async deleteUser (_, args, ctx) {
      const record = await ctx.dataSources.db.user(args);
      assert(record, ERROR_MESSAGES.USER_REQUIRED, ERROR_CODES.NOT_FOUND);

      const claim = await getClaim(ctx.headers?.IdToken);      
      const myRole = claim["custom:roles"];
      const myTenantId = claim["custom:tenant"];

      assert(claim["custom:tenant"], ERROR_MESSAGES.CLAIM_REQUIRED_TENANT, ERROR_CODES.UNAUTHORIZED);
      assert(USER_ROLES[myRole] >= USER_ROLES[record.role] && record.tenantId === myTenantId, ERROR_MESSAGES.UNAUTHORIZED_ACTION, ERROR_CODES.UNAUTHORIZED);

      if (args?.skipCognito) {
        return ctx.dataSources.db.deleteUser(args);
      }

      const count = await ctx.dataSources.db.deleteUser(args);
      await ctx?.dataSources?.cognito?.deleteCognitoUser(record.email);
      return count;
    },
  }
};