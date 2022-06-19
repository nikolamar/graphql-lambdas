import { assert, ERROR_CODES, ERROR_MESSAGES } from "/opt/utils/errors";
import { CLIENT_ID, POOL_ID, REGION } from "/opt/configs/cognito";
import { getClaim } from "../utils/token";
import type { Resolvers } from "../generated";
import type { Context } from "../types";

export const cognito: Resolvers<Context> = {
  Query: {
    cognito () {
      return {
        region: REGION,
        poolId: POOL_ID,
        clientId: CLIENT_ID,
      };
    },

    async mfaAuthUrl (_, __, ctx) {
      const claim = await getClaim(ctx?.headers?.idtoken);

      const tenantId = claim?.["custom:tenant"];
      assert(tenantId, ERROR_MESSAGES.TENANT_ID_REQUIRED, ERROR_CODES.NOT_FOUND);

      const tenant = await ctx?.dataSources.db.tenant({ where: { _id: { _eq: tenantId } } });
      assert(tenant, ERROR_MESSAGES.TENANT_REQUIRED, ERROR_CODES.NOT_FOUND);

      return ctx?.dataSources?.cognito?.fetchCognitoUserMultiFactorAuthUrl(ctx?.headers?.accesstoken);
    },
  },
};