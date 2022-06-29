import { CLIENT_ID, POOL_ID, REGION } from "/opt/configs/cognito";
import type { Resolvers } from "../generated";
import type { Context } from "../types";

export const cognito: Resolvers<Context> = {
  Query: {
    cognito() {
      return {
        region: REGION,
        poolId: POOL_ID,
        clientId: CLIENT_ID,
      };
    },

    mfaAuthUrl(_, __, ctx) {
      return ctx?.dataSources?.cognito?.fetchCognitoUserMultiFactorAuthUrl(
        ctx?.headers?.accesstoken
      );
    },
  },
};
