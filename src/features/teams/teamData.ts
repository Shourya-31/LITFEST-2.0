import { developersList, type DeveloperMember } from './developerData.js';
export { developersList, type DeveloperMember };

export type TeamRole =
  | 'Overall Coordinator'
  | 'Associate Overall Coordinator'
  | 'Head Coordinator'
  | 'Core Coordinator'
  | 'Coordinator'
  | 'Executive (XE)'
  | 'Member';

export interface TeamMember {
  id: string;
  name: string;
  role: TeamRole;
  designationSection: TeamRole;
  photo?: string;
}

export const ROLE_ORDER: TeamRole[] = [
  'Overall Coordinator',
  'Associate Overall Coordinator',
  'Head Coordinator',
  'Core Coordinator',
  'Coordinator',
  'Executive (XE)',
  'Member',
];

export interface TeamSectionHierarchy {
  role: TeamRole;
  title: string;
  subtitle: string;
  prominence: 'highest' | 'high' | 'elevated' | 'medium' | 'standard' | 'compact' | 'compact-grid';
  members: TeamMember[];
}

/**
 * STRICT ORDER OF ALL 85 TEAM MEMBERS IN 7 DESIGNATION SECTIONS
 * Team photos are served from `public/team` and named after each member ID.
 * If an image cannot be loaded, the card gracefully displays stylized initials.
 */
const teamRoster: TeamMember[] = [
  // ========================================================
  // 1. OVERALL COORDINATORS (OCs) - 2 members
  // ========================================================
  {
    id: 'eshwar-madamshetty',
    name: 'Eshwar Madamshetty',
    role: 'Overall Coordinator',
    designationSection: 'Overall Coordinator',
    photo: '', // e.g. '/team/eshwar-madamshetty.jpg'
  },
  {
    id: 'ruchismita-deheri',
    name: 'Ruchismita Deheri',
    role: 'Overall Coordinator',
    designationSection: 'Overall Coordinator',
    photo: '', // e.g. '/team/ruchismita-deheri.jpg'
  },

  // ========================================================
  // 2. ASSOCIATE OVERALL COORDINATORS - 3 members
  // ========================================================
  {
    id: 'amandeep-singh',
    name: 'Amandeep Singh',
    role: 'Associate Overall Coordinator',
    designationSection: 'Associate Overall Coordinator',
    photo: '', // e.g. '/team/amandeep-singh.jpg'
  },
  {
    id: 'aniruddh-dubey',
    name: 'Aniruddh Dubey',
    role: 'Associate Overall Coordinator',
    designationSection: 'Associate Overall Coordinator',
    photo: '', // e.g. '/team/aniruddh-dubey.jpg'
  },
  {
    id: 'shourya-veer-singh',
    name: 'Shourya Veer Singh',
    role: 'Associate Overall Coordinator',
    designationSection: 'Associate Overall Coordinator',
    photo: '', // e.g. '/team/shourya-veer-singh.jpg'
  },

  // ========================================================
  // 3. HEAD COORDINATORS - 8 members
  // ========================================================
  {
    id: 'ayush-mishra',
    name: 'Ayush Mishra',
    role: 'Head Coordinator',
    designationSection: 'Head Coordinator',
    photo: '', // e.g. '/team/ayush-mishra.jpg'
  },
  {
    id: 'garima-pathak',
    name: 'Garima Pathak',
    role: 'Head Coordinator',
    designationSection: 'Head Coordinator',
    photo: '', // e.g. '/team/garima-pathak.jpg'
  },
  {
    id: 'pratyaksh-singh',
    name: 'Pratyaksh Singh',
    role: 'Head Coordinator',
    designationSection: 'Head Coordinator',
    photo: '', // e.g. '/team/pratyaksh-singh.jpg'
  },
  {
    id: 'pashmeen-kaur',
    name: 'Pashmeen Kaur',
    role: 'Head Coordinator',
    designationSection: 'Head Coordinator',
    photo: '', // e.g. '/team/pashmeen-kaur.jpg'
  },
  {
    id: 'nikhil-kaushik',
    name: 'Nikhil Kaushik',
    role: 'Head Coordinator',
    designationSection: 'Head Coordinator',
    photo: '', // e.g. '/team/nikhil-kaushik.jpg'
  },
  {
    id: 'atulya-jaiswal',
    name: 'Atulya Jaiswal',
    role: 'Head Coordinator',
    designationSection: 'Head Coordinator',
    photo: '', // e.g. '/team/atulya-jaiswal.jpg'
  },
  {
    id: 'abhinav-pandey',
    name: 'Abhinav Pandey',
    role: 'Head Coordinator',
    designationSection: 'Head Coordinator',
    photo: '', // e.g. '/team/abhinav-pandey.jpg'
  },
  {
    id: 'trupti-patet',
    name: 'Trupti Patet',
    role: 'Head Coordinator',
    designationSection: 'Head Coordinator',
    photo: '', // e.g. '/team/trupti-patet.jpg'
  },

  // ========================================================
  // 4. CORE COORDINATORS - 8 members
  // ========================================================
  {
    id: 'vaibhavi-mishra',
    name: 'Vaibhavi Mishra',
    role: 'Core Coordinator',
    designationSection: 'Core Coordinator',
    photo: '', // e.g. '/team/vaibhavi-mishra.jpg'
  },
  {
    id: 'sayee-bhakare',
    name: 'Sayee Bhakare',
    role: 'Core Coordinator',
    designationSection: 'Core Coordinator',
    photo: '', // e.g. '/team/sayee-bhakare.jpg'
  },
  {
    id: 'rounak-bed',
    name: 'Rounak Bed',
    role: 'Core Coordinator',
    designationSection: 'Core Coordinator',
    photo: '', // e.g. '/team/rounak-bed.jpg'
  },
  {
    id: 'prem-kshirsagar',
    name: 'Prem Kshirsagar',
    role: 'Core Coordinator',
    designationSection: 'Core Coordinator',
    photo: '', // e.g. '/team/prem-kshirsagar.jpg'
  },
  {
    id: 'nandini-gouraha',
    name: 'Nandini Gouraha',
    role: 'Core Coordinator',
    designationSection: 'Core Coordinator',
    photo: '', // e.g. '/team/nandini-gouraha.jpg'
  },
  {
    id: 'mohit',
    name: 'Mohit',
    role: 'Core Coordinator',
    designationSection: 'Core Coordinator',
    photo: '', // e.g. '/team/mohit.jpg'
  },
  {
    id: 'harsh-agrawal',
    name: 'Harsh Agrawal',
    role: 'Core Coordinator',
    designationSection: 'Core Coordinator',
    photo: '', // e.g. '/team/harsh-agrawal.jpg'
  },
  {
    id: 'anish-jaiswal',
    name: 'Anish Jaiswal',
    role: 'Core Coordinator',
    designationSection: 'Core Coordinator',
    photo: '', // e.g. '/team/anish-jaiswal.jpg'
  },

  // ========================================================
  // 5. COORDINATORS - 4 members
  // ========================================================
  {
    id: 'harsh-rathi',
    name: 'Harsh Rathi',
    role: 'Coordinator',
    designationSection: 'Coordinator',
    photo: '', // e.g. '/team/harsh-rathi.jpg'
  },
  {
    id: 'priya-rajwar',
    name: 'Priya Rajwar',
    role: 'Coordinator',
    designationSection: 'Coordinator',
    photo: '', // e.g. '/team/priya-rajwar.jpg'
  },
  {
    id: 'sushma-panduru',
    name: 'Sushma Panduru',
    role: 'Coordinator',
    designationSection: 'Coordinator',
    photo: '', // e.g. '/team/sushma-panduru.jpg'
  },
  {
    id: 'aditya-singh',
    name: 'Aditya Singh',
    role: 'Coordinator',
    designationSection: 'Coordinator',
    photo: '', // e.g. '/team/aditya-singh.jpg'
  },

  // ========================================================
  // 6. XEs (EXECUTIVES) - 27 members
  // ========================================================
  {
    id: 'prakash-patet',
    name: 'Prakash Patet',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/prakash-patet.jpg'
  },
  {
    id: 'tushar-anchal',
    name: 'Tushar Anchal',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/tushar-anchal.jpg'
  },
  {
    id: 'aditi-sharma',
    name: 'Aditi Sharma',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/aditi-sharma.jpg'
  },
  {
    id: 'vidhi-kilaje',
    name: 'Vidhi Kilaje',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/vidhi-kilaje.jpg'
  },
  {
    id: 'vijwal',
    name: 'Vijwal',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/vijwal.jpg'
  },
  {
    id: 'dev-sugyamal',
    name: 'Dev Sugyamal',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/dev-sugyamal.jpg'
  },
  {
    id: 'sulankita-singh',
    name: 'Sulankita Singh',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/sulankita-singh.jpg'
  },
  {
    id: 'prakriti-jamboli',
    name: 'Prakriti Jamboli',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/prakriti-jamboli.jpg'
  },
  {
    id: 'prakher-kocher',
    name: 'Prakher Kocher',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/prakher-kocher.jpg'
  },
  {
    id: 'pradnya-juwane',
    name: 'Pradnya Juwane',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/pradnya-juwane.jpg'
  },
  {
    id: 'nandadullal-raul',
    name: 'Nandadullal Raul',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/nandadullal-raul.jpg'
  },
  {
    id: 'ashwast-gupta',
    name: 'Ashwast Gupta',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/ashwast-gupta.jpg'
  },
  {
    id: 'lavanya-shrivastava',
    name: 'Lavanya Shrivastava',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/lavanya-shrivastava.jpg'
  },
  {
    id: 'khushi-kumari',
    name: 'Khushi Kumari',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/khushi-kumari.jpg'
  },
  {
    id: 'harshal-jain',
    name: 'Harshal Jain',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/harshal-jain.jpg'
  },
  {
    id: 'gargee-dhare',
    name: 'Gargee Dhare',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/gargee-dhare.jpg'
  },
  {
    id: 'anshika-paliwal',
    name: 'Anshika Paliwal',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/anshika-paliwal.jpg'
  },
  {
    id: 'sahithi-elkapallo',
    name: 'Sahithi Elkapallo',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/sahithi-elkapallo.jpg'
  },
  {
    id: 'dhawal-shah',
    name: 'Dhawal Shah',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/dhawal-shah.jpg'
  },
  {
    id: 'ayush-suryawanghe',
    name: 'Ayush Suryawanghe',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/ayush-suryawanghe.jpg'
  },
  {
    id: 'astha-soni',
    name: 'Astha Soni',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/astha-soni.jpg'
  },
  {
    id: 'arnav-gupta',
    name: 'Arnav Gupta',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/arnav-gupta.jpg'
  },
  {
    id: 'a-sanjeevani-rao',
    name: 'A. Sanjeevani Rao',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/a-sanjeevani-rao.jpg'
  },
  {
    id: 'anupurba-baidya',
    name: 'Anupurba Baidya',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/anupurba-baidya.jpg'
  },
  {
    id: 'ark-das',
    name: 'Ark Das',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/ark-das.jpg'
  },
  {
    id: 'apeksha-rathore',
    name: 'Apeksha Rathore',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/apeksha-rathore.jpg'
  },
  {
    id: 'anuj-tha',
    name: 'Anuj Tha',
    role: 'Executive (XE)',
    designationSection: 'Executive (XE)',
    photo: '', // e.g. '/team/anuj-tha.jpg'
  },

  // ========================================================
  // 7. MEMBERS - 33 members
  // ========================================================
  {
    id: 'subham-maghi',
    name: 'Subham Maghi',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/subham-maghi.jpg'
  },
  {
    id: 'tejal-namdev',
    name: 'Tejal Namdev',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/tejal-namdev.jpg'
  },
  {
    id: 'yogyata-bhargav',
    name: 'Yogyata Bhargav',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/yogyata-bhargav.jpg'
  },
  {
    id: 'shivansh-tha',
    name: 'Shivansh Tha',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/shivansh-tha.jpg'
  },
  {
    id: 'mona-patet',
    name: 'Mona Patet',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/mona-patet.jpg'
  },
  {
    id: 'dhruv-mikkipneni',
    name: 'Dhruv Mikkipneni',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/dhruv-mikkipneni.jpg'
  },
  {
    id: 'mohana-krishna',
    name: 'Mohana Krishna',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/mohana-krishna.jpg'
  },
  {
    id: 'sanskar-chandraber',
    name: 'Sanskar Chandraber',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/sanskar-chandraber.jpg'
  },
  {
    id: 'varun-motwani',
    name: 'Varun Motwani',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/varun-motwani.jpg'
  },
  {
    id: 'vansh-chauhan',
    name: 'Vansh Chauhan',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/vansh-chauhan.jpg'
  },
  {
    id: 'surabhi-chaurasiya',
    name: 'Surabhi Chaurasiya',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/surabhi-chaurasiya.jpg'
  },
  {
    id: 'sudipta-adhikari',
    name: 'Sudipta Adhikari',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/sudipta-adhikari.jpg'
  },
  {
    id: 'siya-singh',
    name: 'Siya Singh',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/siya-singh.jpg'
  },
  {
    id: 'shrawani-sontakke',
    name: 'Shrawani Sontakke',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/shrawani-sontakke.jpg'
  },
  {
    id: 'shravani-ghodeswar',
    name: 'Shravani Ghodeswar',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/shravani-ghodeswar.jpg'
  },
  {
    id: 'shradhanjali-behera',
    name: 'Shradhanjali Behera',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/shradhanjali-behera.jpg'
  },
  {
    id: 'shivam-singh',
    name: 'Shivam Singh',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/shivam-singh.jpg'
  },
  {
    id: 'shailesh-patet',
    name: 'Shailesh Patet',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/shailesh-patet.jpg'
  },
  {
    id: 'sarvajeet-palase',
    name: 'Sarvajeet Palase',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/sarvajeet-palase.jpg'
  },
  {
    id: 'rajveer-dewangan',
    name: 'Rajveer Dewangan',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/rajveer-dewangan.jpg'
  },
  {
    id: 'pulkit-baghel',
    name: 'Pulkit Baghel',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/pulkit-baghel.jpg'
  },
  {
    id: 'prince-kesharwani',
    name: 'Prince Kesharwani',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/prince-kesharwani.jpg'
  },
  {
    id: 'prisha-pandey',
    name: 'Prisha Pandey',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/prisha-pandey.jpg'
  },
  {
    id: 'nisha-kumari',
    name: 'Nisha Kumari',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/nisha-kumari.jpg'
  },
  {
    id: 'navin-agrawal',
    name: 'Navin Agrawal',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/navin-agrawal.jpg'
  },
  {
    id: 'manognya-aifene',
    name: 'Manognya Aifene',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/manognya-aifene.jpg'
  },
  {
    id: 'manisha-kumari',
    name: 'Manisha Kumari',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/manisha-kumari.jpg'
  },
  {
    id: 'gyanesh-sahu',
    name: 'Gyanesh Sahu',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/gyanesh-sahu.jpg'
  },
  {
    id: 'kavya-garjam',
    name: 'Kavya Garjam',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/kavya-garjam.jpg'
  },
  {
    id: 'ashish-bajare',
    name: 'Ashish Bajare',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/ashish-bajare.jpg'
  },
  {
    id: 'hasini-jankala',
    name: 'Hasini Jankala',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/hasini-jankala.jpg'
  },
  {
    id: 'abhinav-verma',
    name: 'Abhinav Verma',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/abhinav-verma.jpg'
  },
  {
    id: 'advika-karuna',
    name: 'Advika Karuna',
    role: 'Member',
    designationSection: 'Member',
    photo: '', // e.g. '/team/advika-karuna.jpg'
  },
];

export const teamMembers: TeamMember[] = teamRoster.map((member) => ({
  ...member,
  photo: member.photo || `/team/${member.id}.jpg`,
}));

export const teamSectionsHierarchy: TeamSectionHierarchy[] = [
  {
    role: 'Overall Coordinator',
    title: 'OVERALL COORDINATORS (OCs)',
    subtitle: 'Commanding the helm and guiding the vision of Literati',
    prominence: 'highest',
    members: teamMembers.filter((m) => m.designationSection === 'Overall Coordinator'),
  },
  {
    role: 'Associate Overall Coordinator',
    title: 'ASSOCIATE OVERALL COORDINATORS',
    subtitle: 'Steering operations and synchronizing every creative pulse',
    prominence: 'high',
    members: teamMembers.filter((m) => m.designationSection === 'Associate Overall Coordinator'),
  },
  {
    role: 'Head Coordinator',
    title: 'HEAD COORDINATORS',
    subtitle: 'Leading the core pillars and orchestration across disciplines',
    prominence: 'elevated',
    members: teamMembers.filter((m) => m.designationSection === 'Head Coordinator'),
  },
  {
    role: 'Core Coordinator',
    title: 'CORE COORDINATORS',
    subtitle: 'Driving execution, events, and festival synergy',
    prominence: 'medium',
    members: teamMembers.filter((m) => m.designationSection === 'Core Coordinator'),
  },
  {
    role: 'Coordinator',
    title: 'COORDINATORS',
    subtitle: 'Anchoring team operations and logistical harmony',
    prominence: 'standard',
    members: teamMembers.filter((m) => m.designationSection === 'Coordinator'),
  },
  {
    role: 'Executive (XE)',
    title: 'XEs (EXECUTIVES)',
    subtitle: 'The dynamic force powering each domain on the ground',
    prominence: 'compact',
    members: teamMembers.filter((m) => m.designationSection === 'Executive (XE)'),
  },
  {
    role: 'Member',
    title: 'MEMBERS',
    subtitle: 'The passionate spirit and boundless energy behind every moment',
    prominence: 'compact-grid',
    members: teamMembers.filter((m) => m.designationSection === 'Member'),
  },
];
