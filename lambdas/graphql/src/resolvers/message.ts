import { sendMessage as send, ROUTES } from "/opt/utils/websocket";
import { assert, ERROR_MESSAGES, ERROR_CODES } from "/opt/utils/errors";
import type { Resolvers } from "../generated";
import type { Context } from "../types";

export const message: Resolvers<Context> = {
  Mutation: {
    async sendMessage(_, args, ctx) {
      const { connectionId, message } = args;
      assert(message, ERROR_MESSAGES.MESSAGE_REQUIRED, ERROR_CODES.INVALID_INPUT);
      assert(connectionId, ERROR_MESSAGES.CONNECTION_ID_REQUIRED, ERROR_CODES.INVALID_INPUT);

      await send(connectionId, ROUTES.MESSAGE, { message });

      return message;
    },
  },
};
