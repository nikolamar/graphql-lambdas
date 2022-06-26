import { assert, ERROR_CODES, ERROR_MESSAGES } from "/opt/utils/errors";
import { createEdgesWithPageInfo } from "../utils/cursor";
import { getClaim } from "../utils/token";
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
      const claim = await getClaim(ctx.headers?.accesstoken);
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
    async signUp (_, args, ctx) {
      let tenant = await ctx.dataSources.db.tenant({ where: { name: { _eq: "default" } } });
      if (!tenant) {
        tenant = await ctx.dataSources.db.createTenant({
          input: {
            name: "default", status: "active", color: "#00ACC1", accentColor: "#FFFFFF",
          }
        });
      }

      assert(tenant, ERROR_MESSAGES.TENANT_REQUIRED, ERROR_CODES.NOT_FOUND);

      const updatedAttributes = [
        {
          Name: "custom:tenant",
          Value: tenant._id.toString(),
        },
        {
          Name: "custom:roles",
          Value: args.input.role,
        }
      ];

      await ctx?.dataSources?.cognito?.updateCognitoUserAttributes(args.input?.email.toLowerCase(), updatedAttributes);
      await ctx?.dataSources?.cognito?.confirmSignUp(args.input?.email.toLowerCase());

      return ctx.dataSources.db.createUser({
        input: {
          ...args?.input,
          email: args.input?.email.toLowerCase(),
          tenantId: tenant._id.toString(),
        }
      });
    },

    async createUser (_, args, ctx) {
      const user = await ctx.dataSources.db.user({ where: { email: { _eq: args?.input?.email.toLowerCase() } } });
      assert(!user, ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, ERROR_CODES.CONFLICT);

      let tenant;

      if (args?.input?.tenantId) {
        tenant = await ctx.dataSources.db.tenant({ where: { _id: { _eq: args?.input?.tenantId } } });
      } else {
        tenant = await ctx.dataSources.db.tenant({ where: { name: { _eq: "default" } } });
        if (!tenant) {
          tenant = await ctx.dataSources.db.createTenant({
            input: {
              name: "default", status: "active", color: "#00ACC1", accentColor: "#FFFFFF",
            }
          });
        }
      }

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
      
      if (args?.skipCognito) {
        return ctx.dataSources.db.deleteUser(args);
      }

      const count = await ctx.dataSources.db.deleteUser(args);
      await ctx?.dataSources?.cognito?.deleteCognitoUser(record.email);
      return count;
    },
  }
};