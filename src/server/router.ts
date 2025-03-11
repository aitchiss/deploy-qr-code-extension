import { TRPCError } from "@trpc/server";
import { procedure, router } from "./trpc.js";
import { teamSettingsSchema } from "../schema/team-configuration.js";
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
  teamSettings: {
    query: procedure.query(async ({ ctx: { teamId, client } }) => {
      if (!teamId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "teamId is required",
        });
      }
      const teamConfig = await client.getTeamConfiguration(teamId);
      if (!teamConfig) {
        return;
      }
      const result = teamSettingsSchema.safeParse(teamConfig.config);
      if (!result.success) {
        console.warn(
          "Failed to parse team settings",
          JSON.stringify(result.error, null, 2)
        );
      }
      return result.data;
    }),

    mutate: procedure
      .input(teamSettingsSchema)
      .mutation(async ({ ctx: { teamId, client }, input }) => {
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "teamId is required",
          });
        }

        try {
          const existingConfig = await client.getTeamConfiguration(teamId);
          if (!existingConfig) {
            await client.createTeamConfiguration(teamId, input);
          } else {
            await client.updateTeamConfiguration(teamId, {
              ...(existingConfig?.config || {}),
              ...input,
            });
          }
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to save team configuration",
            cause: e,
          });
        }
      }),
  },
});

export type AppRouter = typeof appRouter;
