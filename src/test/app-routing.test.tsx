import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { team, ROLE_ORDER } from "@/data/team";
import { QUEST_TIERS, events, MUN_INFO } from "@/data/events";

describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    const matches = router.matchRoutes("/");
    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("matches /events and /team routes", () => {
    const router = createRouter({
      routeTree,
      context: { queryClient: new QueryClient() },
    });

    expect(router.matchRoutes("/events").at(-1)?.routeId).not.toBe(rootRouteId);
    expect(router.matchRoutes("/team").at(-1)?.routeId).not.toBe(rootRouteId);
  });
});

describe("Team Data & Exact Role-Based Order", () => {
  it("contains all 19 coordinators in exact role-based order", () => {
    expect(team).toHaveLength(19);

    const expectedOrder = [
      // Overall Coordinator
      { name: "Ruchismita Deheri", role: "Overall Coordinator" },
      { name: "Eshwar", role: "Overall Coordinator" },
      // Head Coordinators
      { name: "Tripti Patel", role: "Head Coordinator" },
      { name: "Abhinav Pandey", role: "Head Coordinator" },
      { name: "Garima Pathak", role: "Head Coordinator" },
      { name: "Atulya Jaiswal", role: "Head Coordinator" },
      { name: "Nikhil Khaushik", role: "Head Coordinator" },
      { name: "Ayush Mishra", role: "Head Coordinator" },
      { name: "Ashhad Ali", role: "Head Coordinator" },
      // Associate Coordinators
      { name: "Amandeep Singh Matharu", role: "Associate Coordinator" },
      { name: "Aniruddh Dubey", role: "Associate Coordinator" },
      { name: "Shourya Veer Singh", role: "Associate Coordinator" },
      // Core Coordinators
      { name: "Sayee", role: "Core Coordinator" },
      { name: "Vaibhavi Mishra", role: "Core Coordinator" },
      { name: "Harsh Agrawal", role: "Core Coordinator" },
      { name: "Anish Jaiswal", role: "Core Coordinator" },
      { name: "Mohit", role: "Core Coordinator" },
      { name: "Rounak Bedi", role: "Core Coordinator" },
      // Coordinator
      { name: "ADITYA ANIL SINGH", role: "Coordinator" },
    ];

    expectedOrder.forEach((expected, i) => {
      expect(team[i].name).toBe(expected.name);
      expect(team[i].role).toBe(expected.role);
    });
  });

  it("verifies ROLE_ORDER follows hierarchical precedence", () => {
    expect(ROLE_ORDER).toEqual([
      "Overall Coordinator",
      "Head Coordinator",
      "Associate Coordinator",
      "Core Coordinator",
      "Coordinator",
    ]);
  });
});

describe("Events Quest Tiers and Image Integrity", () => {
  it("has the required quest categories for horizontal row layout", () => {
    expect(QUEST_TIERS).toEqual([
      "Main Quest",
      "Side Quest",
      "Fun Quest",
      "MUN",
    ]);
  });

  it("verifies required events and titles for Main, Side, and Fun Quests", () => {
    const mainTitles = events
      .filter((e) => e.quest === "Main Quest")
      .map((e) => e.title);
    expect(mainTitles).toEqual([
      "The Quiz",
      "Literary Marathon",
      "Tube Trolls",
    ]);

    const sideTitles = events
      .filter((e) => e.quest === "Side Quest")
      .map((e) => e.title);
    expect(sideTitles).toEqual([
      "Storyforge Championships",
      "Poetry Slam",
      "Abyssal Tribunal",
    ]);

    const funTitles = events
      .filter((e) => e.quest === "Fun Quest")
      .map((e) => e.title);
    expect(funTitles).toEqual([
      "Jenga",
      "Snakes and Ladders",
      "Other Fun Games",
    ]);
  });

  it("verifies every single event has a relevant image", () => {
    events.forEach((event) => {
      expect(event.image).toBeDefined();
      expect(event.image.length).toBeGreaterThan(0);
    });
  });

  it("verifies separate MUN section link points to nitrrmun.in", () => {
    expect(MUN_INFO.link).toBe("https://nitrrmun.in");
    expect(MUN_INFO.displayUrl).toBe("nitrrmun.in");
    expect(MUN_INFO.image).toBeDefined();
  });
});
