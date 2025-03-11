import { TRPCError } from "@trpc/server";
import { procedure, router } from "./trpc.js";
import { z } from "zod";

export const appRouter = router({
  deployDetails: {
    query: procedure
      .input(z.object({ deployId: z.string() }))
      .query(async ({ ctx: { client }, input: { deployId } }) => {
        if (!deployId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "deployId is required",
          });
        }
        const deployData = await client.getDeploy(deployId);
        return deployData;
      }),
  },
});

export type AppRouter = typeof appRouter;
