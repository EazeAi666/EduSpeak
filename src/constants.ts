import { Phoneme, Poem, Module } from './types';

export const PHONEMES: Phoneme[] = [
  // Short Vowels
  { symbol: 'ɪ', example: 'kit', type: 'vowel', description: 'Short high front unrounded vowel' },
  { symbol: 'e', example: 'dress', type: 'vowel', description: 'Short mid front unrounded vowel' },
  { symbol: 'æ', example: 'trap', type: 'vowel', description: 'Short low front unrounded vowel' },
  { symbol: 'ɒ', example: 'lot', type: 'vowel', description: 'Short low back rounded vowel' },
  { symbol: 'ʌ', example: 'strut', type: 'vowel', description: 'Short low-mid back unrounded vowel' },
  { symbol: 'ʊ', example: 'foot', type: 'vowel', description: 'Short high back rounded vowel' },
  { symbol: 'ə', example: 'ago', type: 'vowel', description: 'The schwa - central mid unrounded vowel' },
  
  // Long Vowels
  { symbol: 'i:', example: 'fleece', type: 'vowel', description: 'Long high front unrounded vowel' },
  { symbol: 'ɑ:', example: 'father', type: 'vowel', description: 'Long low back unrounded vowel' },
  { symbol: 'ɔ:', example: 'thought', type: 'vowel', description: 'Long low-mid back rounded vowel' },
  { symbol: 'u:', example: 'goose', type: 'vowel', description: 'Long high back rounded vowel' },
  { symbol: 'ɜ:', example: 'nurse', type: 'vowel', description: 'Long mid central unrounded vowel' },

  // Diphthongs
  { symbol: 'eɪ', example: 'face', type: 'diphthong', description: 'Gliding from /e/ to /ɪ/' },
  { symbol: 'aɪ', example: 'price', type: 'diphthong', description: 'Gliding from /a/ to /ɪ/' },
  { symbol: 'ɔɪ', example: 'choice', type: 'diphthong', description: 'Gliding from /ɔ/ to /ɪ/' },
  { symbol: 'aʊ', example: 'mouth', type: 'diphthong', description: 'Gliding from /a/ to /ʊ/' },
  { symbol: 'əʊ', example: 'goat', type: 'diphthong', description: 'Gliding from /ə/ to /ʊ/' },

  // Consonants (Selection)
  { symbol: 'θ', example: 'thin', type: 'consonant', description: 'Voiceless dental fricative' },
  { symbol: 'ð', example: 'this', type: 'consonant', description: 'Voiced dental fricative' },
  { symbol: 'ʃ', example: 'ship', type: 'consonant', description: 'Voiceless postalveolar fricative' },
  { symbol: 'ʒ', example: 'measure', type: 'consonant', description: 'Voiced postalveolar fricative' },
  { symbol: 'tʃ', example: 'church', type: 'consonant', description: 'Voiceless postalveolar affricate' },
  { symbol: 'dʒ', example: 'judge', type: 'consonant', description: 'Voiced postalveolar affricate' },
  { symbol: 'ŋ', example: 'sing', type: 'consonant', description: 'Voiced velar nasal' },
];

export const POEMS: Poem[] = [
  {
    id: '1',
    title: 'Abiku',
    author: 'Wole Soyinka',
    category: 'nigerian',
    content: `In vain your bangles cast
Charmed circles at my feet
I am Abiku, calling for the first
And repeated time.

Must I weep for those who die?
The tree-frog weeps for the heavy grain
The snail in its box of shell
Weeps for the field it cannot reach...`,
    analysis: 'A classic poem exploring the Yoruba concept of the spirit child who cycles between birth and death.'
  },
  {
    id: '2',
    title: 'The Road Not Taken',
    author: 'Robert Frost',
    category: 'classic',
    content: `Two roads diverged in a yellow wood,
And sorry I could not travel both
And be one traveler, long I stood
And looked down one as far as I could
To where it bent in the undergrowth;...`,
    analysis: 'A fundamental piece of English literature exploring choice and consequence.'
  },
  {
    id: '3',
    title: 'Piano and Drums',
    author: 'Gabriel Okara',
    category: 'nigerian',
    content: `When at break of day at a riverside
I hear jungle drums telegraphing
the mystic rhythm, urgent, raw
like bleeding flesh, speaking of
primordial youth and the beginning...

Then I hear a wailing piano
solo adagio in lontano
fretting diminuendo counterpoint
crescendo and concerto;...`,
    analysis: 'An evocative poem contrasting traditional African heritage with Western influence.'
  }
];

export const TRAINING_MODULES: Module[] = [
  {
    id: 'eng-1',
    title: 'Professional English Foundations',
    description: 'Master classroom delivery, lesson planning, and academic writing.',
    department: 'english',
    topics: ['Giving Instructions', 'Managing Class Participation', 'Concept Checking Questions', 'Feedback Strategies']
  },
  {
    id: 'ss-1',
    title: 'Foundations of Social Studies',
    description: 'Introduction to social systems and citizenship education in Nigeria.',
    department: 'social-studies',
    topics: ['Concept of Social Studies', 'Environmental Education', 'Nigerian Constitution', 'Culture and Identity']
  },
  {
    id: 'ss-2',
    title: 'Nigerian Governance',
    description: 'Structure of the Nigerian state and democratic values.',
    department: 'social-studies',
    topics: ['Arms of Government', 'Local Government Administration', 'Electoral Process', 'Pressure Groups']
  }
];
