import { assert, ERROR_CODES, ERROR_MESSAGES } from "/opt/utils/errors";
import { CLIENT_ID, POOL_ID } from "/opt/configs/cognito";
import { getClaim } from "../utils/token";
import type { Resolvers } from "../generated";
import type { Context } from "../types";

export const cognito: Resolvers<Context> = {
  Query: {
    cognito () {
      return {
        poolId: POOL_ID,
        clientId: CLIENT_ID,
      };
    },

    mfaStatus (_, __, ctx) {
      return ctx?.dataSources?.cognito?.checkCognitoUserMFAStatus(ctx?.headers?.AccessToken);
    },
    
    async mfaAuthUrl (_, __, ctx) {
      const claim = await getClaim(ctx?.headers?.IdToken);

      const tenantId = claim?.["custom:tenant"];
      assert(tenantId, ERROR_MESSAGES.TENANT_ID_REQUIRED, ERROR_CODES.NOT_FOUND);

      const tenant = await ctx?.dataSources.db.tenant({ where: { _id: { _eq: tenantId } } });
      assert(tenant, ERROR_MESSAGES.TENANT_REQUIRED, ERROR_CODES.NOT_FOUND);

      return ctx?.dataSources?.cognito?.fetchCognitoUserMultiFactorAuthUrl(ctx?.headers?.AccessToken);
    },
  },
  Mutation: {
    userPasswordAuth (_, args, ctx) {
      return ctx.dataSources.cognito.userPasswordAuth(args.clientId, args.username, args.password);
    },

    challengeNewPassword (_, args, ctx) {
      return ctx.dataSources.cognito.challengeNewPassword(args.clientId, args.session, args.username, args.newPassword);
    },

    validateMfaCode (_, args, ctx) {
      return ctx?.dataSources?.cognito?.validateCognitoUserMFA(args?.verificationCode, ctx?.headers?.AccessToken);
    },

    setUserMfaPreference (_, args, ctx) {
      return ctx.dataSources.cognito.setUserMfaPreference(ctx.headers.AccessToken, args.isMFAEnabled);
    },
    
    async updateMfaAuthPreference (_, args, ctx) {
      await ctx?.dataSources?.cognito?.setCognitoUserMFAPreference(args.email, args.isMFAEnabled);
      return ctx.dataSources.db.updateUser({
        where: { email: { _eq: args.email } },
        input: { isMFAEnabled: args.isMFAEnabled },
      });
    },
  }
};