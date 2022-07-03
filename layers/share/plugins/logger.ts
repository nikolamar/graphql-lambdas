export const logger = {
  async requestDidStart(ctx: any) {
    return {
      async didEncounterErrors(ctx: any) {
        ctx?.errors?.forEach((err: Error) =>
          ctx.logger.error("Error", err, {
            operationName: ctx.request.operationName,
            query: ctx.request.query,
            variables: ctx.request.variables,
          }),
        );
      },
      async willSendResponse(ctx: any) {
        if (!ctx?.errors) {
          console.dir(ctx?.response);
        }
      },
    };
  },
};
