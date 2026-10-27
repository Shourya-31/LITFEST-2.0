/**
 * Team members in exact role-based order:
 * 1. Overall Coordinator: Ruchismita Deheri, Eshwar
 * 2. Head Coordinators: Tripti Patel, Abhinav Pandey, Garima Pathak, Atulya Jaiswal, Nikhil Khaushik, Ayush Mishra, Ashhad Ali
 * 3. Associate Coordinators: Amandeep Singh Matharu, Aniruddh Dubey, Shourya Veer Singh
 * 4. Core Coordinators: Sayee, Vaibhavi Mishra, Harsh Agrawal, Anish Jaiswal, Mohit, Rounak Bedi
 * 5. Coordinator: ADITYA ANIL SINGH
 */

export type TeamRole =
  | "Overall Coordinator"
  | "Head Coordinator"
  | "Associate Coordinator"
  | "Core Coordinator"
  | "Coordinator";

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  photo?: string;
}

export const ROLE_ORDER: TeamRole[] = [
  "Overall Coordinator",
  "Head Coordinator",
  "Associate Coordinator",
  "Core Coordinator",
  "Coordinator",
];

export const team: TeamMember[] = [
  // Overall Coordinator
  {
    id: "ruchismita-deheri",
    name: "Ruchismita Deheri",
    role: "Overall Coordinator",
  },
  { id: "eshwar", name: "Eshwar", role: "Overall Coordinator" },

  // Head Coordinators
  { id: "tripti-patel", name: "Tripti Patel", role: "Head Coordinator" },
  { id: "abhinav-pandey", name: "Abhinav Pandey", role: "Head Coordinator" },
  { id: "garima-pathak", name: "Garima Pathak", role: "Head Coordinator" },
  { id: "atulya-jaiswal", name: "Atulya Jaiswal", role: "Head Coordinator" },
  { id: "nikhil-khaushik", name: "Nikhil Khaushik", role: "Head Coordinator" },
  { id: "ayush-mishra", name: "Ayush Mishra", role: "Head Coordinator" },
  { id: "ashhad-ali", name: "Ashhad Ali", role: "Head Coordinator" },

  // Associate Coordinators
  {
    id: "amandeep-singh-matharu",
    name: "Amandeep Singh Matharu",
    role: "Associate Coordinator",
  },
  {
    id: "aniruddh-dubey",
    name: "Aniruddh Dubey",
    role: "Associate Coordinator",
  },
  {
    id: "shourya-veer-singh",
    name: "Shourya Veer Singh",
    role: "Associate Coordinator",
  },

  // Core Coordinators
  { id: "sayee", name: "Sayee", role: "Core Coordinator" },
  { id: "vaibhavi-mishra", name: "Vaibhavi Mishra", role: "Core Coordinator" },
  { id: "harsh-agrawal", name: "Harsh Agrawal", role: "Core Coordinator" },
  { id: "anish-jaiswal", name: "Anish Jaiswal", role: "Core Coordinator" },
  { id: "mohit", name: "Mohit", role: "Core Coordinator" },
  { id: "rounak-bedi", name: "Rounak Bedi", role: "Core Coordinator" },

  // Coordinator
  { id: "aditya-anil-singh", name: "ADITYA ANIL SINGH", role: "Coordinator" },
];
