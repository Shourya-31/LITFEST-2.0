import type { AuthAdapter, BluePulseAdapters } from "../types/game.js";
import { MockGameService } from "./game-service.js";

/** DEVELOPMENT MOCK: intentionally signed out. Never fabricates a user. */
export const developmentAuth: AuthAdapter = {
  async getUser() {
    return null;
  },
  async login() {
    throw new Error(
      "Login integration is pending. Continue as a guest to play.",
    );
  },
};

export function getAdapters(): BluePulseAdapters {
  return (
    window.bluePulseAdapters ?? {
      auth: developmentAuth,
      gameService: new MockGameService(() => developmentAuth.getUser()),
    }
  );
}
