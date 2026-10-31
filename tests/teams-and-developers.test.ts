import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  teamMembers,
  teamSectionsHierarchy,
  ROLE_ORDER,
  type TeamRole,
  type TeamMember,
  type TeamSectionHierarchy,
} from '../src/features/teams/teamData.js';
import { developersList, type DeveloperMember } from '../src/features/teams/developerData.js';

test('team roster contains exactly 85 members in total', () => {
  assert.equal(teamMembers.length, 85);
});

test('team hierarchy has exactly 7 designation sections in strict order', () => {
  assert.equal(teamSectionsHierarchy.length, 7);

  const expectedRoles: TeamRole[] = [
    'Overall Coordinator',
    'Associate Overall Coordinator',
    'Head Coordinator',
    'Core Coordinator',
    'Coordinator',
    'Executive (XE)',
    'Member',
  ];

  const actualRoles = teamSectionsHierarchy.map((s: TeamSectionHierarchy) => s.role);
  assert.deepEqual(actualRoles, expectedRoles);
  assert.deepEqual(ROLE_ORDER, expectedRoles);
});

test('hierarchy sections have expected member counts', () => {
  const counts = teamSectionsHierarchy.map((s: TeamSectionHierarchy) => s.members.length);
  // 1: 2 OCs, 2: 3 Assoc OCs, 3: 8 Head Coords, 4: 8 Core Coords, 5: 4 Coords, 6: 27 XEs, 7: 33 Members
  assert.deepEqual(counts, [2, 3, 8, 8, 4, 27, 33]);
  const total = counts.reduce((a: number, b: number) => a + b, 0);
  assert.equal(total, 85);
});

test('Tier 1: Overall Coordinators contains exact names in order', () => {
  const ocs = teamSectionsHierarchy[0].members.map((m: TeamMember) => m.name);
  assert.deepEqual(ocs, ['Eshwar Madamshetty', 'Ruchismita Deheri']);
});

test('Tier 2: Associate Overall Coordinators contains exact names in order', () => {
  const assocOcs = teamSectionsHierarchy[1].members.map((m: TeamMember) => m.name);
  assert.deepEqual(assocOcs, [
    'Amandeep Singh',
    'Aniruddh Dubey',
    'Shourya Veer Singh',
  ]);
});

test('Tier 3: Head Coordinators contains exact names in order', () => {
  const heads = teamSectionsHierarchy[2].members.map((m: TeamMember) => m.name);
  assert.deepEqual(heads, [
    'Ayush Mishra',
    'Garima Pathak',
    'Pratyaksh Singh',
    'Pashmeen Kaur',
    'Nikhil Kaushik',
    'Atulya Jaiswal',
    'Abhinav Pandey',
    'Trupti Patet',
  ]);
});

test('Tier 4: Core Coordinators contains exact names in order', () => {
  const cores = teamSectionsHierarchy[3].members.map((m: TeamMember) => m.name);
  assert.deepEqual(cores, [
    'Vaibhavi Mishra',
    'Sayee Bhakare',
    'Rounak Bed',
    'Prem Kshirsagar',
    'Nandini Gouraha',
    'Mohit',
    'Harsh Agrawal',
    'Anish Jaiswal',
  ]);
});

test('Tier 5: Coordinators contains exact names in order', () => {
  const coords = teamSectionsHierarchy[4].members.map((m: TeamMember) => m.name);
  assert.deepEqual(coords, [
    'Harsh Rathi',
    'Priya Rajwar',
    'Sushma Panduru',
    'Aditya Singh',
  ]);
});

test('Tier 6: XEs (Executives) contains exact 27 names in order', () => {
  const xes = teamSectionsHierarchy[5].members.map((m: TeamMember) => m.name);
  assert.equal(xes.length, 27);
  assert.deepEqual(xes, [
    'Prakash Patet',
    'Tushar Anchal',
    'Aditi Sharma',
    'Vidhi Kilaje',
    'Vijwal',
    'Dev Sugyamal',
    'Sulankita Singh',
    'Prakriti Jamboli',
    'Prakher Kocher',
    'Pradnya Juwane',
    'Nandadullal Raul',
    'Ashwast Gupta',
    'Lavanya Shrivastava',
    'Khushi Kumari',
    'Harshal Jain',
    'Gargee Dhare',
    'Anshika Paliwal',
    'Sahithi Elkapallo',
    'Dhawal Shah',
    'Ayush Suryawanghe',
    'Astha Soni',
    'Arnav Gupta',
    'A. Sanjeevani Rao',
    'Anupurba Baidya',
    'Ark Das',
    'Apeksha Rathore',
    'Anuj Tha',
  ]);
});

test('Tier 7: Members contains exact 33 names in order', () => {
  const members = teamSectionsHierarchy[6].members.map((m: TeamMember) => m.name);
  assert.equal(members.length, 33);
  assert.deepEqual(members, [
    'Subham Maghi',
    'Tejal Namdev',
    'Yogyata Bhargav',
    'Shivansh Tha',
    'Mona Patet',
    'Dhruv Mikkipneni',
    'Mohana Krishna',
    'Sanskar Chandraber',
    'Varun Motwani',
    'Vansh Chauhan',
    'Surabhi Chaurasiya',
    'Sudipta Adhikari',
    'Siya Singh',
    'Shrawani Sontakke',
    'Shravani Ghodeswar',
    'Shradhanjali Behera',
    'Shivam Singh',
    'Shailesh Patet',
    'Sarvajeet Palase',
    'Rajveer Dewangan',
    'Pulkit Baghel',
    'Prince Kesharwani',
    'Prisha Pandey',
    'Nisha Kumari',
    'Navin Agrawal',
    'Manognya Aifene',
    'Manisha Kumari',
    'Gyanesh Sahu',
    'Kavya Garjam',
    'Ashish Bajare',
    'Hasini Jankala',
    'Abhinav Verma',
    'Advika Karuna',
  ]);
});

test('developers list contains exactly 10 developers in strict order', () => {
  assert.equal(developersList.length, 10);
  const devNames = developersList.map((d: DeveloperMember) => d.name);
  assert.deepEqual(devNames, [
    'Shourya Veer Singh',
    'Atulya Jaiswal',
    'A. Sanjeevani Rao',
    'Ayush Suryawanshi',
    'Gargee Dhale',
    'Anish Jaiswal',
    'Ashwast Gupta',
    'Tripti Patel',
    'Vansh Chauhan',
    'Sanskar Chandraber',
  ]);

  // Ensure role is Developer for all
  developersList.forEach((d: DeveloperMember) => {
    assert.equal(d.role, 'Developer');
  });
});

test('all 85 members and 10 developers have non-empty IDs and names', () => {
  teamMembers.forEach((m: TeamMember) => {
    assert.ok(m.id && m.id.length > 0);
    assert.ok(m.name && m.name.length > 0);
    assert.ok(m.role && m.role.length > 0);
  });

  developersList.forEach((d: DeveloperMember) => {
    assert.ok(d.id && d.id.length > 0);
    assert.ok(d.name && d.name.length > 0);
  });
});

test('all team and developer photos resolve to bundled public assets', () => {
  for (const member of teamMembers) {
    assert.ok(member.photo, `${member.name} should have a photo path`);
    assert.ok(
      existsSync(join(process.cwd(), 'public', member.photo.slice(1))),
      `${member.name} photo should exist at ${member.photo}`
    );
  }

  for (const developer of developersList) {
    assert.ok(developer.photo, `${developer.name} should have a photo path`);
    assert.ok(
      existsSync(join(process.cwd(), 'public', developer.photo.slice(1))),
      `${developer.name} photo should exist at ${developer.photo}`
    );
  }
});
