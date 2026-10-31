export interface DeveloperMember {
  id: string;
  name: string;
  role: string;
  photo?: string;
}

/**
 * STRICT ORDER OF ALL 10 DEVELOPERS
 * Preserved exactly as required.
 */
export const developersList: DeveloperMember[] = [
  { id: 'dev-1', name: 'Shourya Veer Singh', role: 'Developer', photo: '/team/shourya-veer-singh.jpg' },
  { id: 'dev-2', name: 'Atulya Jaiswal', role: 'Developer', photo: '/team/atulya-jaiswal.jpg' },
  { id: 'dev-3', name: 'A. Sanjeevani Rao', role: 'Developer', photo: '/team/a-sanjeevani-rao.jpg' },
  { id: 'dev-4', name: 'Ayush Suryawanshi', role: 'Developer', photo: '/team/ayush-suryawanghe.jpg' },
  { id: 'dev-5', name: 'Gargee Dhale', role: 'Developer', photo: '/team/gargee-dhare.jpg' },
  { id: 'dev-6', name: 'Anish Jaiswal', role: 'Developer', photo: '/team/anish-jaiswal.jpg' },
  { id: 'dev-7', name: 'Ashwast Gupta', role: 'Developer', photo: '/team/ashwast-gupta.jpg' },
  { id: 'dev-8', name: 'Tripti Patel', role: 'Developer', photo: '/team/trupti-patet.jpg' },
  { id: 'dev-9', name: 'Vansh Chauhan', role: 'Developer', photo: '/team/vansh-chauhan.jpg' },
  { id: 'dev-10', name: 'Sanskar Chandraber', role: 'Developer', photo: '/team/sanskar-chandraber.jpg' },
];
