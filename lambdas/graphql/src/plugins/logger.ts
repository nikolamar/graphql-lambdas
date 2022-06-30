export const logger = {
  async requestDidStart(ctx) {
    return {
      async didEncounterErrors(ctx) {
        ctx?.errors?.forEach((err) =>
          ctx.logger.error("Error", err, {
            operationName: ctx.request.operationName,
            query: ctx.request.query,
            variables: ctx.request.variables,
          })
        );
      },
      async willSendResponse(ctx) {
        if (!ctx?.errors) {
          console.dir(ctx?.response);
        }
      },
    };
  },
};
