import { createEdgesWithPageInfo } from "../utils/cursor";
import { getClaim } from "../utils/token";
import { assert, ERROR_CODES, ERROR_MESSAGES } from "/opt/errors";
import { SUPER_ADMIN, USER_ROLES } from "../configs/roles";
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
      
      const userArgs = {
        ...args?.input,
        email: args.input?.email.toLowerCase(),
        tenantId: tenant._id.toString(),
      };

      const newRecord: any = await ctx?.dataSources?.cognito?.createCognitoUser(userArgs);
      assert(newRecord, ERROR_MESSAGES.COGNITO_EMAIL_ALREADY_EXISTS, ERROR_CODES.CONFLICT);

      return ctx.dataSources.db.createUser({ input: newRecord });
    },

    async updateUser (_, args, ctx) {
      const user = await ctx.dataSources.db.user(args);
      assert(user, ERROR_MESSAGES.USER_REQUIRED, ERROR_CODES.NOT_FOUND);

      if (user.role === SUPER_ADMIN) {
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
  
        if (typeof args?.input?.isMFAEnabled === "boolean") {
          await ctx?.dataSources?.cognito?.setCognitoUserMFAPreference(updatedUser.email, updatedUser.isMFAEnabled);
        }
        
        return updatedUser;
      }

      const claim = await getClaim(ctx.headers?.IdToken);      
      const myRole = claim["custom:roles"];
      const myTenantId = claim["custom:tenant"];
      const userRole = user.role;
      const userTenantId = user.tenantId;

      assert(claim["custom:tenant"], ERROR_MESSAGES.CLAIM_REQUIRED_TENANT, ERROR_CODES.UNAUTHORIZED);
      assert(USER_ROLES[myRole] >= USER_ROLES[userRole] && userTenantId === myTenantId, ERROR_MESSAGES.UNAUTHORIZED_ACTION, ERROR_CODES.UNAUTHORIZED);

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

      if (typeof args?.input?.isMFAEnabled === "boolean") {
        await ctx?.dataSources?.cognito?.setCognitoUserMFAPreference(updatedUser.email, updatedUser?.isMFAEnabled);
      }
      
      return updatedUser;
    },

    async deleteUser (_, args, ctx) {
      const user = await ctx.dataSources.db.user(args);
      assert(user, ERROR_MESSAGES.USER_REQUIRED, ERROR_CODES.NOT_FOUND);
      
      if (user.role === SUPER_ADMIN) {
        const count = await ctx.dataSources.db.deleteUser(args);
        await ctx?.dataSources?.cognito?.deleteCognitoUser(user.email);
        return count;
      }

      const claim = await getClaim(ctx.headers?.IdToken);      
      const myRole = claim["custom:roles"];
      const myTenantId = claim["custom:tenant"];
      const userRole = user.role;
      const userTenantId = user.tenantId;

      assert(claim["custom:tenant"], ERROR_MESSAGES.CLAIM_REQUIRED_TENANT, ERROR_CODES.UNAUTHORIZED);
      assert(USER_ROLES[myRole] >= USER_ROLES[userRole] && userTenantId === myTenantId, ERROR_MESSAGES.UNAUTHORIZED_ACTION, ERROR_CODES.UNAUTHORIZED);

      const count = await ctx.dataSources.db.deleteUser(args);
      await ctx?.dataSources?.cognito?.deleteCognitoUser(user.email);
      return count;
    },
  }
};