import { ATLANTIS_LEVELS, QUESTION_SECONDS } from "./levels.js";
import { QUESTION_BANK } from "./questions.js";
import { selectQuestions } from "./random.js";
import { chamberStars } from "./progress.js";
import type { AtlantisChamberRecords, AtlantisResult, LiteraryQuestion } from "./types.js";

export type AtlantisState = "ready" | "playing" | "paused" | "feedback" | "unlocked" | "failed" | "victory";
export interface AnswerFeedback { correct: boolean; selected: number | null; correctAnswer: number; points: number; timedOut: boolean; alreadyRewarded: boolean }
export class AtlantisRun {
  state: AtlantisState = "ready";
  levelIndex = 0; score = 0; elapsedSeconds = 0; questionSeconds = 0;
  correctAnswers = 0; wrongAnswers = 0; unansweredAnswers = 0;
  highestCompletedLevel = 0; questionIndex = 0; attemptCorrect = 0;
  questions: LiteraryQuestion[] = [];
  hintsUsed = new Set<string>();
  readonly seenQuestions = new Set<string>();
  readonly rewardedQuestions = new Set<string>();
  feedback: AnswerFeedback | null = null;
  runId = "";
  chambers: AtlantisChamberRecords = {};
  private attemptStartScore = 0;
  private random: () => number;
  constructor(random: () => number = Math.random) { this.random = random; }
  get level() { return ATLANTIS_LEVELS[this.levelIndex]; }
  get question(): LiteraryQuestion { return this.questions[this.questionIndex]; }
  get remainingSeconds() { return this.question ? Math.max(0, QUESTION_SECONDS[this.question.difficulty] - this.questionSeconds) : 0; }
  get accuracy() { return Math.round(this.correctAnswers / Math.max(1, this.correctAnswers + this.wrongAnswers + this.unansweredAnswers) * 100); }
  get attemptAnswered() { return this.questionIndex + (this.feedback ? 1 : 0); }
  start(runId: string): void {
    this.runId = runId; this.levelIndex = 0; this.score = 0; this.elapsedSeconds = 0;
    this.correctAnswers = 0; this.wrongAnswers = 0; this.unansweredAnswers = 0; this.highestCompletedLevel = 0;
    this.chambers = {};
    this.hintsUsed.clear(); this.seenQuestions.clear(); this.rewardedQuestions.clear(); this.beginAttempt();
  }
  private beginAttempt(): void {
    this.attemptStartScore = this.score;
    this.questions = selectQuestions(QUESTION_BANK,this.level,this.seenQuestions,this.random);
    this.questions.forEach(question => this.seenQuestions.add(question.id));
    this.questionIndex = 0; this.attemptCorrect = 0; this.questionSeconds = 0;
    this.feedback = null; this.state = "playing";
  }
  tick(seconds: number): void {
    if (this.state !== "playing" || !Number.isFinite(seconds) || seconds <= 0) return;
    const active = Math.min(seconds,this.remainingSeconds);
    this.elapsedSeconds += active; this.questionSeconds += active;
    if (this.remainingSeconds === 0) this.resolve(null);
  }
  pause(): void { if (this.state === "playing") this.state = "paused"; }
  resume(): void { if (this.state === "paused") this.state = "playing"; }
  hint(): boolean {
    if (this.state !== "playing" || !this.question.hint || this.hintsUsed.has(this.question.id)) return false;
    this.hintsUsed.add(this.question.id); this.score = Math.max(0,this.score - 25); return true;
  }
  answer(option: number): AnswerFeedback | null {
    if (this.state !== "playing" || !Number.isInteger(option) || option < 0 || option > 3) return null;
    return this.resolve(option);
  }
  private resolve(selected: number | null): AnswerFeedback {
    const correct = selected === this.question.correctAnswer;
    const alreadyRewarded = this.rewardedQuestions.has(this.question.id);
    let points = 0;
    if (correct) {
      this.correctAnswers++; this.attemptCorrect++;
      if (!alreadyRewarded) {
        points = 100 + Math.round(50 * this.remainingSeconds / QUESTION_SECONDS[this.question.difficulty]);
        this.rewardedQuestions.add(this.question.id);
      }
    } else if (selected === null) this.unansweredAnswers++;
    else { this.wrongAnswers++; points = -20; }
    this.score = Math.max(0,this.score + points);
    this.feedback = {correct,selected,correctAnswer:this.question.correctAnswer,points,timedOut:selected === null,alreadyRewarded};
    this.state = "feedback"; return this.feedback;
  }
  /** Continue is the only transition out of feedback: explanations never auto-skip. */
  continue(): number {
    if (this.state !== "feedback") return 0;
    if (this.questionIndex + 1 < this.questions.length) {
      this.questionIndex++; this.questionSeconds = 0; this.feedback = null; this.state = "playing"; return 0;
    }
    if (this.attemptCorrect < this.level.requiredCorrect) { this.state = "failed"; return 0; }
    this.highestCompletedLevel = this.level.id;
    const bonus = (this.attemptCorrect === this.questions.length ? 200 : 0) + (this.level.id === 10 ? 500 : 0);
    this.score += bonus;
    this.chambers[this.level.id] = {stars:chamberStars(this.attemptCorrect,this.questions.length) as 1 | 2 | 3,
      bestScore:Math.max(0,this.score - this.attemptStartScore), bestAccuracy:this.attemptCorrect / this.questions.length * 100};
    this.state = this.level.id === 10 ? "victory" : "unlocked"; return bonus;
  }
  next(): void { if (this.state === "unlocked") { this.levelIndex++; this.beginAttempt(); } }
  retry(): void { if (this.state === "failed") this.beginAttempt(); }
  /** The map cannot skip ahead, replay a cleared chamber, or restart an active question. */
  enterLevel(id: number): boolean {
    if (!Number.isInteger(id) || id < 1 || id > 10 || id !== this.highestCompletedLevel + 1) return false;
    if (this.state === "unlocked" && id === this.level.id + 1) this.next();
    else if (id !== this.level.id) return false;
    else if (this.state === "paused") this.resume();
    else if (this.state === "failed") this.retry();
    else if (this.state !== "playing" && this.state !== "feedback") return false;
    return true;
  }
  result(): AtlantisResult {
    return {runId:this.runId,score:this.score,highestCompletedLevel:this.highestCompletedLevel,completed:this.state === "victory",
      elapsedSeconds:this.elapsedSeconds,correctAnswers:this.correctAnswers,wrongAnswers:this.wrongAnswers,
      unansweredAnswers:this.unansweredAnswers,hintsUsed:this.hintsUsed.size};
  }
}
