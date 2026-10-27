import type { AtlantisLevel } from "./types.js";

const chambers = [
  ["The Forgotten Gate", "Famous Books", "Very Easy", 3, "The first guardian welcomes every reader. Recognize the stories that opened the world of books to you."],
  ["The Coral Archives", "Famous Authors", "Easy", 3, "The archivists preserved their favourite storytellers in coral. Match each work to the writer behind it."],
  ["The Whispering Ruins", "Fictional Characters", "Easy", 3, "Familiar voices drift through the ruins. Remember the characters who made their stories unforgettable."],
  ["The Hall of Legends", "Famous Book Series", "Medium", 4, "Shelves stretch into distant kingdoms. Trace the worlds and journeys of beloved literary series."],
  ["The Poet’s Sanctuary", "Poetry and Poets", "Medium", 4, "Verses glow beneath the water. Discover the poets whose words still echo through the city."],
  ["The Temple of Tales", "Classics and Novels", "Medium", 4, "The temple guards the great novels. Recall their settings, people, and enduring stories."],
  ["The Forgotten Library", "Indian Literature", "Medium–Hard", 5, "A treasury of Indian writing survives the tides. Explore its authors, novels, and literary landmarks."],
  ["The Abyssal Chamber", "Literary Devices and Quotes", "Hard", 5, "Deep below the city, language becomes a lantern. Recognize the craft behind memorable writing."],
  ["The Guardian’s Trial", "Mixed Literary Trivia", "Hard", 5, "The guardian tests the breadth of your reading. Books, theatre, and literary history meet here."],
  ["The Heart of Atlantis", "Ultimate Literary Challenge", "Very Hard", 7, "Seven final questions protect the Heart. Bring together everything you know and awaken the lost literary city."],
] as const;
export const ATLANTIS_LEVELS: readonly AtlantisLevel[] = chambers.map(([name, category, difficultyLabel, questionCount, description], index) => ({
  id:index + 1, name, category, difficultyLabel, questionCount,
  requiredCorrect:Math.ceil(questionCount * 0.6), description,
}));
export const QUESTIONS_PER_RUN = ATLANTIS_LEVELS.reduce((sum, level) => sum + level.questionCount, 0);
export const QUESTION_SECONDS = {easy:25, medium:20, hard:15} as const;
