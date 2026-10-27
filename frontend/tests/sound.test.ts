import test from "node:test";
import assert from "node:assert/strict";
import { MilestoneSound } from "../src/features/game/sound.js";

function fakeAudio() {
  const voices: {
    frequency: number;
    starts: number[];
    stops: number[];
    disconnected: boolean;
  }[] = [];
  let created = 0;
  const context = {
    state: "suspended",
    currentTime: 12,
    destination: {},
    async resume() {
      this.state = "running";
    },
    async suspend() {
      this.state = "suspended";
    },
    async close() {
      this.state = "closed";
    },
    createOscillator() {
      const voice = {
        frequency: 0,
        starts: [] as number[],
        stops: [] as number[],
        disconnected: false,
      };
      voices.push(voice);
      return {
        type: "",
        frequency: {
          setValueAtTime(frequency: number) {
            voice.frequency = frequency;
          },
        },
        connect() {},
        disconnect() {
          voice.disconnected = true;
        },
        start(time: number) {
          voice.starts.push(time);
        },
        stop(time = 0) {
          voice.stops.push(time);
        },
        onended: null,
      };
    },
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
        },
        connect() {},
        disconnect() {},
      };
    },
  };
  const sound = new MilestoneSound(() => {
    created++;
    return context as unknown as AudioContext;
  });
  return {
    sound,
    context,
    voices,
    get created() {
      return created;
    },
  };
}

test("audio unlocks on interaction and plays one three-note chime per 100 metres", () => {
  const env = fakeAudio();
  assert.equal(env.created, 0);
  env.sound.update(99);
  assert.equal(env.voices.length, 0);
  env.sound.unlock();
  assert.equal(env.created, 1);
  env.sound.update(100);
  assert.equal(env.voices.length, 3);
  assert.deepEqual(
    env.voices.map((v) => v.frequency),
    [659.25, 830.61, 987.77],
  );
  assert.ok(env.voices[0].starts[0] < env.voices[1].starts[0]);
  env.sound.update(100);
  env.sound.update(101);
  env.sound.update(199);
  assert.equal(env.voices.length, 3);
  env.sound.update(200);
  assert.equal(env.voices.length, 6);
  env.sound.update(NaN);
  env.sound.update(Infinity);
  assert.equal(env.voices.length, 6);
  env.sound.destroy();
});
test("muting and pause cancel sound, resume does not replay old milestones, and restart resets milestones", () => {
  const env = fakeAudio();
  env.sound.unlock();
  env.sound.update(100);
  env.sound.setEnabled(false);
  assert.ok(env.voices.every((v) => v.disconnected));
  env.sound.update(200);
  assert.equal(env.voices.length, 3);
  env.sound.setEnabled(true);
  env.sound.unlock();
  env.sound.update(201);
  assert.equal(env.voices.length, 3);
  env.sound.update(300);
  assert.equal(env.voices.length, 6);
  env.sound.pause();
  assert.equal(env.context.state, "suspended");
  assert.ok(env.voices.every((v) => v.disconnected));
  env.sound.unlock();
  env.sound.update(301);
  assert.equal(env.voices.length, 6);
  env.sound.reset();
  env.sound.update(99);
  env.sound.update(100);
  assert.equal(env.voices.length, 9);
  env.sound.destroy();
  assert.equal(env.context.state, "closed");
  assert.ok(env.voices.every((v) => v.disconnected));
});
test("missing or blocked audio never prevents gameplay", async () => {
  const unsupported = new MilestoneSound(() => null);
  assert.doesNotThrow(() => {
    unsupported.unlock();
    unsupported.update(100);
    unsupported.pause();
    unsupported.destroy();
  });
  const blocked = new MilestoneSound(() => {
    throw new Error("Audio unavailable");
  });
  assert.doesNotThrow(() => {
    blocked.unlock();
    blocked.update(100);
    blocked.destroy();
  });
  const suspended = new MilestoneSound(
    () =>
      ({
        state: "suspended",
        resume: () => Promise.reject(new Error("Blocked")),
        close: async () => {},
      }) as unknown as AudioContext,
  );
  suspended.unlock();
  await Promise.resolve();
  suspended.update(100);
  suspended.destroy();
});
