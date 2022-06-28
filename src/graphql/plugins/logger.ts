import clonedeep from "lodash.clonedeep";
import { pino } from "/opt/utils/pino";
import { rndletters } from "/opt/utils/nanoid";
import { getSanitizedResponse } from "/opt/utils/sanitize";

export const logger = {
  async requestDidStart (ctx) {
    ctx.logger = pino.child({ requestId: rndletters() });
    ctx.logger.info({
      operationName: ctx.request.operationName,
      query: ctx.request.query,
      variables: ctx.request.variables,
    });
    return {
      async didEncounterErrors (ctx) {
        ctx?.errors?.forEach(err => ctx.logger.error("Error", err, {
          operationName: ctx.request.operationName,
          query: ctx.request.query,
          variables: ctx.request.variables,
        }));
      },
      async willSendResponse (ctx) {
        if (!ctx?.errors) {
          const fieldsNotToSend = [];
          
          const sanitizedResponse = getSanitizedResponse(clonedeep(ctx)?.response, fieldsNotToSend);
          ctx.logger.info(sanitizedResponse);
        }
      },
    };
  },
};