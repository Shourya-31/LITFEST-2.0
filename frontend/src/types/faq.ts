export type FaqCategory = 'all' | 'general' | 'events' | 'registration' | 'logistics';

export interface FaqItem {
  id: string;
  category: 'general' | 'events' | 'registration' | 'logistics';
  question: string;
  answer: string;
  tag: string;
  featured?: boolean;
}

export interface FaqSectionProps {
  faqs?: FaqItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  onAscendClick?: () => void;
}
