import { z } from "zod";

export const adjustmentSchema = z.object({
  action: z.enum(["ADD", "DEDUCT"]),
  points: z.number().int().min(1).max(2_147_483_647),
  eventName: z.string().trim().min(1).max(150),
  reason: z.string().trim().min(1).max(500),
  idempotencyKey: z.string().uuid(),
});

export type AdjustmentAction = z.infer<typeof adjustmentSchema>["action"];

export function signedDelta(action: AdjustmentAction, points: number): number {
  return action === "ADD" ? points : -points;
}

export interface ParticipantScore {
  id: string;
  name: string;
  totalPoints: number;
}

export function rankParticipants(entries: ParticipantScore[]) {
  return [...entries]
    .sort((left, right) => {
      const nameOrder =
        left.name < right.name ? -1 : left.name > right.name ? 1 : 0;
      const idOrder =
        BigInt(left.id) < BigInt(right.id)
          ? -1
          : BigInt(left.id) > BigInt(right.id)
            ? 1
            : 0;
      return right.totalPoints - left.totalPoints || nameOrder || idOrder;
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}
