import test from 'node:test';
import assert from 'node:assert/strict';
import { PIRATE_WHEEL_MILESTONES } from '../src/features/schedule/timelineData.js';

test('timeline dataset contains exactly 10 events matching the schedule poster', () => {
  assert.equal(PIRATE_WHEEL_MILESTONES.length, 10, 'Must have exactly 10 milestone events');

  const expectedTitles = [
    'Inauguration of Litfest',
    'Literary Quiz',
    'Book Fair + Readers Session: Rendezvous',
    'Storyforge (Sr.)',
    'Storyforge (Jr.)',
    'Tube Trolls (Parliamentary Debate)',
    'Poetry Slam',
    'MUN',
    'Literary Marathon',
    'Abyssal Tribunal',
  ];

  const expectedRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  PIRATE_WHEEL_MILESTONES.forEach((m, idx) => {
    assert.equal(m.id, idx);
    assert.equal(m.eventNumber, idx + 1);
    assert.equal(m.spokeNumber, idx + 1);
    assert.equal(m.title, expectedTitles[idx]);
    assert.equal(m.romanNumeral, expectedRoman[idx]);
    assert.ok(m.time && m.time.length > 0, `Event ${idx + 1} must have a valid time`);
    assert.ok(m.date && m.date.length > 0, `Event ${idx + 1} must have a valid date`);
    assert.ok(m.venue && m.venue.length > 0, `Event ${idx + 1} must have a valid venue`);
    assert.ok(m.nauticalTheme && m.nauticalTheme.length > 0, `Event ${idx + 1} must have a nautical theme`);

    if (idx === 3 || idx === 4) {
      assert.equal(m.venue, 'IT Classroom 1', `Event ${idx + 1} venue must be IT Classroom 1`);
    } else {
      assert.equal(m.venue, 'Hira Hall', `Event ${idx + 1} venue must be Hira Hall`);
    }
  });

  // Verify Schedule grouping according to the official festival flyer
  // Thursday, 29 October events
  assert.ok(PIRATE_WHEEL_MILESTONES[0].date.includes('Thursday') && PIRATE_WHEEL_MILESTONES[0].date.includes('29 October'));
  assert.ok(PIRATE_WHEEL_MILESTONES[1].date.includes('Thursday') && PIRATE_WHEEL_MILESTONES[1].date.includes('29 October'));
  assert.ok(PIRATE_WHEEL_MILESTONES[2].date.includes('Thursday') && PIRATE_WHEEL_MILESTONES[2].date.includes('29 October'));

  // Friday is 30 October
  assert.ok(PIRATE_WHEEL_MILESTONES[3].date.includes('Friday') && PIRATE_WHEEL_MILESTONES[3].date.includes('30 October'));
  assert.ok(PIRATE_WHEEL_MILESTONES[4].date.includes('Friday') && PIRATE_WHEEL_MILESTONES[4].date.includes('30 October'));
  assert.ok(PIRATE_WHEEL_MILESTONES[5].date.includes('Friday') && PIRATE_WHEEL_MILESTONES[5].date.includes('30 October'));

  // Saturday is 31 October
  assert.ok(PIRATE_WHEEL_MILESTONES[6].date.includes('Saturday') && PIRATE_WHEEL_MILESTONES[6].date.includes('31 October'));

  // Sunday is 1 November
  assert.ok(PIRATE_WHEEL_MILESTONES[7].date.includes('Sunday') && PIRATE_WHEEL_MILESTONES[7].date.includes('1 November'));

  // Monday is 2 November
  assert.ok(PIRATE_WHEEL_MILESTONES[8].date.includes('Monday') && PIRATE_WHEEL_MILESTONES[8].date.includes('2 November'));
  assert.ok(PIRATE_WHEEL_MILESTONES[9].date.includes('Monday') && PIRATE_WHEEL_MILESTONES[9].date.includes('2 November'));
});
