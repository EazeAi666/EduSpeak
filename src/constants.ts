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
  },
  {
    id: '4',
    title: 'Night Rain',
    author: 'J.P. Clark',
    category: 'nigerian',
    content: `What parameter shall we use
To measure the night?
Is it by the duration of rain
As it falls on our thatch?
Drip-drop-drip-drop-drip...
We can see the stars?
The floor is wet and slippery
Yet we sleep and dream...`,
    analysis: 'A vivid portrayal of a rainy night in a rural Nigerian setting, focusing on nature and family.'
  },
  {
    id: '5',
    title: 'Heavensgate (Selection)',
    author: 'Christopher Okigbo',
    category: 'nigerian',
    content: `BEFORE YOU, mother Idoto,
naked I stand,
before your watery presence,
a prodigal,
leaning on an oilbean;
lost in your legend...`,
    analysis: 'Okigbo\'s famous invocation of indigenous African spirituality, marking the return of the "prodigal" poet to his roots.'
  },
  {
    id: '6',
    title: 'The Fisherman\'s Invocation',
    author: 'Gabriel Okara',
    category: 'nigerian',
    content: `The back-water ripples
are like the wrinkles on the face of an old woman,
and the stars are like
the eyes of the children
watching the canoe slide
past the mangrove roots...`,
    analysis: 'Explores the transition between old and new, tradition and change through the lens of a fisherman.'
  },
  {
    id: '7',
    title: 'Heritage of Liberty',
    author: 'Nnamdi Azikiwe',
    category: 'nigerian',
    content: `Oh land of our birth,
We pledge to thee our love and strength.
From the creeks of the Delta
To the hills of the North,
One nation, one destiny...`,
    analysis: 'A patriotic piece reflecting the aspirations of colonial-era Nigeria towards independence and unity.'
  },
  {
    id: '8',
    title: 'Postcard from Lagos',
    author: 'Lola Shoneyin',
    category: 'nigerian',
    content: `Lagos is a lover 
who only gives when you are not looking.
A city of yellow buses and salt spray,
where the heat is a second skin
and every silence is a prayer...`,
    analysis: 'A contemporary take on Nigeria\'s commercial capital, capturing its chaotic yet vibrant energy.'
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
    id: 'edu-ped-1',
    title: 'Teaching Methodology',
    description: 'Modern pedagogical strategies for the Nigerian classroom.',
    department: 'english',
    topics: ['Student-Centered Learning', 'The Heuristic Method', 'Didactic Approaches', 'Classroom Management', 'Instructional Materials Utilization']
  },
  {
    id: 'edu-prep-1',
    title: 'Lesson Planning & Delivery',
    description: 'How to prepare effective lesson notes and deliver engaging sessions.',
    department: 'english',
    topics: ['Writing Behavioral Objectives', 'Steps in Lesson Note Preparation', 'The Hook: Introduction Strategies', 'Assessment and Evaluation in Class', 'Self-Reflective Teaching']
  },
  {
    id: 'edu-academic-1',
    title: 'Academic Writing',
    department: 'english',
    description: 'Mastering the art of formal writing for tertiary education.',
    topics: ['Essay Structure: Introduction, Body, Conclusion', 'Referencing and Citations (APA)', 'Avoiding Plagiarism', 'Logical Argumentation', 'Thesis Statement Development']
  },
  {
    id: 'ss-gov-1',
    title: 'Elements of Government',
    department: 'social-studies',
    description: 'Fundamental concepts of political science for Social Studies teachers.',
    topics: ['Types of Government (Monarchy, Republic, etc.)', 'Separation of Powers', 'Rule of Law', 'Citizenship and Fundamental Rights', 'Political Parties and Manifestos']
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
  },
  {
    id: 'ss-3',
    title: 'Nigerian History: Pre-Colonial Era',
    description: 'Study of the ancient empires and kingdoms before the 1914 amalgamation.',
    department: 'social-studies',
    topics: ['The Nok Culture', 'The Kanem-Borno Empire', 'The Hausa States', 'The Oyo Empire', 'Benin Kingdom', 'Igbo-Ukwu Artifacts', 'Jukun and Nupe Kingdoms']
  },
  {
    id: 'ss-4',
    title: 'Nigerian History: Colonial Administration',
    description: 'Impact of British rule and the path to independence.',
    department: 'social-studies',
    topics: ['The 1914 Amalgamation', 'Regionalism (The Richards Constitution)', 'Nationalist Movements', 'The 1960 Independence', 'Post-Independence Milestones', 'The 1963 Republican Status']
  },
  {
    id: 'ss-gov-2',
    title: 'Comparative Government',
    department: 'social-studies',
    description: 'Analyzing different political systems and their impact on society.',
    topics: ['Federal vs Unitary Systems', 'Presidential vs Parliamentary', 'Military Rule in Africa', 'Constitution Development in Nigeria']
  },
  {
    id: 'ss-5',
    title: 'Physical Geography of Nigeria',
    description: 'Relief, climate, and natural resources of the Nigerian landmass.',
    department: 'social-studies',
    topics: ['Relief and Drainage', 'Climatic Regions', 'Vegetation Zones', 'Mineral Resources', 'Major Rivers and Basins', 'Agricultural Belts']
  },
  {
    id: 'ss-6',
    title: 'History of Education in Nigeria',
    description: 'From indigenous systems to Western educational models.',
    department: 'social-studies',
    topics: ['Traditional Apprenticeship', 'Islamic Education in the North', 'Missionary Schools', 'The National Policy on Education', 'UPE and 6-3-3-4 System']
  },
  {
    id: 'ss-7',
    title: 'Independence Heroes: The Triumvirate',
    description: 'Study of Azikiwe, Awolowo, and Bello in the struggle for freedom.',
    department: 'social-studies',
    topics: ['Dr. Nnamdi Azikiwe (Zik)', 'Chief Obafemi Awolowo', 'Sir Ahmadu Bello', 'The Zikist Movement', 'Women in the Struggle (Funmilayo Ransome-Kuti)', 'The Anthony Enahoro Status Mission']
  },
  {
    id: 'ss-8',
    title: 'Modern Nigerian History & Geopolitics',
    description: 'From the First Republic to the present day.',
    department: 'social-studies',
    topics: ['The Nigerian Civil War (1967-1970)', 'The Oil Boom Era', 'The Switch to Presidential System (1979)', 'The June 12 Struggle', 'The 1999 Return to Democracy', 'Nigeria in ECOWAS & AU']
  },
  {
    id: 'npe-1',
    title: 'National Policy on Education (NPE)',
    description: 'Guidelines and philosophy of Nigerian education across levels. Essential for all NCE students.',
    department: 'social-studies',
    topics: ['Philosophy of Nigerian Education', 'Pre-Primary and Primary Education', 'Secondary Education (9-3-4 System)', 'Technical and Vocational Education', 'Mass Literacy and Adult Education', 'The Role of NCCE and NTI']
  },
  {
    id: 'edu-111',
    title: 'EDU 111: Introduction to Teaching Profession',
    description: 'Fundamental concepts of teaching as a professional career in Nigeria. Understanding the TRCN role.',
    department: 'social-studies',
    topics: ['History of Teaching', 'Ethics of Teaching', 'Qualities of a Teacher', 'Teachers Registration Council of Nigeria (TRCN)', 'Teacher Professionalism']
  },
  {
    id: 'edu-211',
    title: 'EDU 211: Educational Psychology',
    description: 'Understanding child development and learning theories in the classroom context.',
    department: 'social-studies',
    topics: ['Cognitive Development (Piaget)', 'Social Learning (Bandura)', 'Motivation in Learning', 'Intelligence and its Measurement', 'Classroom Management Psychology']
  },
  {
    id: 'gse-111',
    title: 'GSE 111: General English I',
    description: 'Essential communication skills for tertiary students, focusing on grammar and basic writing.',
    department: 'english',
    topics: ['Parts of Speech', 'Sentence Structure', 'Reading Skills', 'Summary Writing', 'Punctuation Rules', 'Word Power and Vocabulary']
  },
  {
    id: 'gse-121',
    title: 'GSE 121: General English II',
    description: 'Advanced communication involving academic writing and oral delivery.',
    department: 'english',
    topics: ['Expository Writing', 'Argumentative Essays', 'Oral Communication Skills', 'Library Study Skills', 'Speed Reading']
  },
  {
    id: 'eng-111',
    title: 'ENG 111: Introduction to Phonetics',
    description: 'Scientific study of the sounds of the English language. Essential for NCE English majors.',
    department: 'english',
    topics: ['Vowel Sounds', 'Consonant Sounds', 'The Phonetic Alphabet (IPA)', 'Stress and Intonation', 'Transcribing English Words']
  },
  {
    id: 'eng-112',
    title: 'ENG 112: Introduction to English Literature',
    description: 'Survey of literary genres and critical appreciation.',
    department: 'english',
    topics: ['Elements of Poetry', 'Drama and Theatre', 'Prose Fiction', 'Literary Criticism Basics', 'Nigerian Prose Fiction']
  },
  {
    id: 'sos-111',
    title: 'SOS 111: Issues and Problems of Social Studies',
    description: 'Analyzing societal challenges in the Nigerian context.',
    department: 'social-studies',
    topics: ['Corruption and Integrity', 'Gender Equality', 'Poverty Alleviation', 'Drug Abuse and HIV/AIDS', 'Population Education']
  }
];

export const DAILY_TIPS = [
  "When teaching Social Studies, use local examples of governance to make concepts more relatable.",
  "In Phonetics, use a mirror to help students see the positioning of their lips and tongue.",
  "Always write behavioral objectives that are SMART: Specific, Measurable, Achievable, Relevant, and Time-bound.",
  "Literature is a mirror of society; encourage students to find modern Nigerian parallels in classic poems.",
  "The Schwa /ə/ is the most common sound in English. Mastering it significantly improves fluency.",
  "Nigerian English often features distinct rhythms; help students identify these during phonetics practice.",
  "A good lesson note is a roadmap, not a script. Be prepared to adapt based on class energy.",
  "Civic education is the heartbeat of Social Studies; keep students updated on current Nigerian events.",
  "Use 'Concept Checking Questions' (CCQs) rather than just asking 'Do you understand?'",
  "The 6-3-3-4 system focuses on skill acquisition; highlight practical applications in your lessons.",
  "In government, explain the 'Separation of Powers' using the three arms of the Nigerian state.",
  "Reading aloud improves both pronunciation for students and confidence for teachers.",
  "Encourage students to write their own poems inspired by Nigerian pioneers like Soyinka.",
  "Social Studies helps develop critical thinking about societal problems like corruption and poverty.",
  "Consistency is key in language learning; encourage 5 minutes of daily practice over weekly marathons.",
  "The teacher is a facilitator. Create space for students to explore and ask questions.",
  "Use mnemonic devices to help students remember the arms of government or parts of speech.",
  "History isn't just about dates; it's about the people and movements that shaped the present.",
  "Effective classroom management starts with building mutual respect with your students.",
  "Digital literacy is now an essential part of the modern Nigerian teacher's toolkit."
];

export const PRACTICE_WORDS: string[] = [
  'Pedagogy', 'Curriculum', 'Assessment', 'Instruction', 'Cognitive', 
  'Scaffolding', 'Linguistics', 'Education', 'Evaluation', 'Methodology',
  'Acoustics', 'Articulate', 'Clarity', 'Confidence', 'Delivery',
  'Enunciation', 'Feedback', 'Fluency', 'Interaction', 'Intonation',
  'Lecturing', 'Literacy', 'Mastery', 'Motivation', 'Pronunciation',
  'Resonance', 'Rhythm', 'Syllable', 'Terminology', 'Transcription',
  'Vocabulary', 'Workshop', 'Engagement', 'Facilitation', 'Objective',
  'Synchronous', 'Asynchronous', 'Formative', 'Summative', 'Portfolio',
  'Didactic', 'Heuristic', 'Pragmatic', 'Rhetoric', 'Eloquence'
];
