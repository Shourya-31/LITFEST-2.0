import quizImg from "@/assets/events/quiz.svg";
import marathonImg from "@/assets/events/marathon.svg";
import tubeTrollsImg from "@/assets/events/tube-trolls.svg";
import storyforgeImg from "@/assets/events/storyforge.svg";
import poetrySlamImg from "@/assets/events/poetry-slam.svg";
import abyssalTribunalImg from "@/assets/events/abyssal-tribunal.svg";
import jengaImg from "@/assets/events/jenga.svg";
import snakesLaddersImg from "@/assets/events/snakes-ladders.svg";
import funGamesImg from "@/assets/events/fun-games.svg";
import mainImg from "@/assets/quest-main.jpg";
import sideImg from "@/assets/quest-side.jpg";
import funImg from "@/assets/quest-fun.jpg";
import munImg from "@/assets/quest-mun.jpg";

export type EventCategory =
  "Literary" | "Cultural" | "Competitions" | "Workshops";

export type QuestTier = "Main Quest" | "Side Quest" | "Fun Quest" | "MUN";

export const QUEST_TIERS: QuestTier[] = [
  "Main Quest",
  "Side Quest",
  "Fun Quest",
  "MUN",
];

export interface FestEvent {
  id: string;
  title: string;
  category?: EventCategory;
  date?: string;
  description?: string;
  status: "upcoming" | "past";
  quest: QuestTier;
  image: string;
  link?: string;
}

export const QUEST_CONFIG: Record<
  QuestTier,
  { name: string; image: string; link?: string }
> = {
  "Main Quest": {
    name: "Main Quests",
    image: mainImg,
  },
  "Side Quest": {
    name: "Side Quests",
    image: sideImg,
  },
  "Fun Quest": {
    name: "Fun Quests",
    image: funImg,
  },
  MUN: {
    name: "MUN",
    image: munImg,
    link: "https://nitrrmun.in",
  },
};

export const MUN_INFO = {
  title: "Model United Nations",
  displayUrl: "nitrrmun.in",
  link: "https://nitrrmun.in",
  image: munImg,
};

export const events: FestEvent[] = [
  // Main Quests: The Quiz, Literary Marathon, Tube Trolls
  {
    id: "the-quiz",
    title: "The Quiz",
    quest: "Main Quest",
    status: "upcoming",
    image: quizImg,
  },
  {
    id: "literary-marathon",
    title: "Literary Marathon",
    quest: "Main Quest",
    status: "upcoming",
    image: marathonImg,
  },
  {
    id: "tube-trolls",
    title: "Tube Trolls",
    quest: "Main Quest",
    status: "upcoming",
    image: tubeTrollsImg,
  },

  // Side Quests: Storyforge Championships, Poetry Slam, Abyssal Tribunal
  {
    id: "storyforge",
    title: "Storyforge Championships",
    quest: "Side Quest",
    status: "upcoming",
    image: storyforgeImg,
  },
  {
    id: "poetry-slam",
    title: "Poetry Slam",
    quest: "Side Quest",
    status: "upcoming",
    image: poetrySlamImg,
  },
  {
    id: "abyssal-tribunal",
    title: "Abyssal Tribunal",
    quest: "Side Quest",
    status: "upcoming",
    image: abyssalTribunalImg,
  },

  // Fun Quests: Jenga, Snakes and Ladders, Other Fun Games
  {
    id: "jenga",
    title: "Jenga",
    quest: "Fun Quest",
    status: "upcoming",
    image: jengaImg,
  },
  {
    id: "snakes-and-ladders",
    title: "Snakes and Ladders",
    quest: "Fun Quest",
    status: "upcoming",
    image: snakesLaddersImg,
  },
  {
    id: "other-fun-games",
    title: "Other Fun Games",
    quest: "Fun Quest",
    status: "upcoming",
    image: funGamesImg,
  },
];
