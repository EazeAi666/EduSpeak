export type View = 'home' | 'phonetics' | 'literature' | 'dictionary' | 'training' | 'discover';
export type Department = 'english' | 'social-studies';

export interface Poem {
  id: string;
  title: string;
  author: string;
  content: string;
  analysis?: string;
  category: 'classic' | 'modern' | 'nigerian';
}

export interface Phoneme {
  symbol: string;
  example: string;
  type: 'vowel' | 'consonant' | 'diphthong';
  description: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  department: Department;
  icon?: string;
  topics: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
