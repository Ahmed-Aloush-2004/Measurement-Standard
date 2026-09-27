const { emit } = require("../gen-sql");

const examType = {
  name: "STEP",
  code: "STEP",
  sections: ["Grammar", "Vocabulary", "Reading Comprehension", "Cloze Test", "Sentence Correction"],
};

const sections = {
  "Grammar": [
    {
      q: "She ___ to school every day.",
      expl: "With third person singular (she) the simple present takes -s: goes.",
      choices: [
        { t: "goes", ok: true },
        { t: "go", ok: false },
        { t: "going", ok: false },
        { t: "gone", ok: false },
      ],
    },
    {
      q: "By the time we reached the hall, the film ___.",
      expl: "The film started before we reached the hall, so the past perfect is used.",
      choices: [
        { t: "had started", ok: true },
        { t: "has started", ok: false },
        { t: "started", ok: false },
        { t: "was starting", ok: false },
      ],
    },
    {
      q: "If it ___ tomorrow, we will cancel the trip.",
      expl: "A first conditional uses \"if\" + simple present for the condition.",
      choices: [
        { t: "rains", ok: true },
        { t: "will rain", ok: false },
        { t: "rained", ok: false },
        { t: "is raining", ok: false },
      ],
    },
    {
      q: "The book ___ by a famous publisher last year.",
      expl: "The subject receives the action, so the passive voice is required.",
      choices: [
        { t: "was published", ok: true },
        { t: "published", ok: false },
        { t: "is publishing", ok: false },
        { t: "has publish", ok: false },
      ],
    },
    {
      q: "Neither of the two answers ___.",
      expl: "Neither of is followed by a singular verb.",
      choices: [
        { t: "is", ok: true },
        { t: "are", ok: false },
        { t: "were", ok: false },
        { t: "have been", ok: false },
      ],
    },
    {
      q: "He is used to ___ up early every morning.",
      expl: "The phrase \"be used to\" is followed by a gerund (verb-ing).",
      choices: [
        { t: "getting", ok: true },
        { t: "get", ok: false },
        { t: "got", ok: false },
        { t: "be getting", ok: false },
      ],
    },
    {
      q: "I would rather you ___ me the whole truth.",
      expl: "Would rather takes the past subjunctive: told.",
      choices: [
        { t: "told", ok: true },
        { t: "tell", ok: false },
        { t: "telling", ok: false },
        { t: "to tell", ok: false },
      ],
    },
    {
      q: "There ___ some milk left in the fridge.",
      expl: "There is used with an uncountable singular noun such as milk.",
      choices: [
        { t: "is", ok: true },
        { t: "are", ok: false },
        { t: "was", ok: false },
        { t: "were", ok: false },
      ],
    },
    {
      q: "The harder you work, the ___ you will become.",
      expl: "The + comparative expresses that two things increase together.",
      choices: [
        { t: "better", ok: true },
        { t: "best", ok: false },
        { t: "more good", ok: false },
        { t: "gooder", ok: false },
      ],
    },
    {
      q: "It is essential that every member ___ present on time.",
      expl: "After it is essential that we use the subjunctive: be.",
      choices: [
        { t: "be", ok: true },
        { t: "is", ok: false },
        { t: "will be", ok: false },
        { t: "being", ok: false },
      ],
    },
    {
      q: "I have been learning Arabic ___ three years.",
      expl: "For is used with a period of time.",
      choices: [
        { t: "for", ok: true },
        { t: "since", ok: false },
        { t: "from", ok: false },
        { t: "during", ok: false },
      ],
    },
    {
      q: "This is the ___ book I have ever read.",
      expl: "The superlative -est is used with ever.",
      choices: [
        { t: "interesting", ok: true },
        { t: "more interesting", ok: false },
        { t: "interestingly", ok: false },
        { t: "most interesting", ok: false },
      ],
    },
    {
      q: "He asked me ___ I had finished my homework.",
      expl: "Whether introduces an indirect yes/no question.",
      choices: [
        { t: "whether", ok: true },
        { t: "where", ok: false },
        { t: "how", ok: false },
        { t: "that", ok: false },
      ],
    },
    {
      q: "My brother is much taller ___ his sister.",
      expl: "Than is used after comparatives such as taller.",
      choices: [
        { t: "than", ok: true },
        { t: "then", ok: false },
        { t: "as", ok: false },
        { t: "that", ok: false },
      ],
    },
    {
      q: "If you want to lose weight, you ___ cut down on sugar.",
      expl: "Advice is given with should.",
      choices: [
        { t: "should", ok: true },
        { t: "would", ok: false },
        { t: "could", ok: false },
        { t: "must not", ok: false },
      ],
    },
    {
      q: "Would you mind if I ___ the window?",
      expl: "A polite conditional request uses the past form: opened.",
      choices: [
        { t: "opened", ok: true },
        { t: "open", ok: false },
        { t: "opening", ok: false },
        { t: "have opened", ok: false },
      ],
    },
    {
      q: "___ studying hard every night, he failed the exam.",
      expl: "Despite is followed by a gerund.",
      choices: [
        { t: "Despite", ok: true },
        { t: "Although", ok: false },
        { t: "Because of", ok: false },
        { t: "However", ok: false },
      ],
    },
    {
      q: "The number of applicants ___ increasing every year.",
      expl: "The number of is followed by a singular verb.",
      choices: [
        { t: "is", ok: true },
        { t: "are", ok: false },
        { t: "have been", ok: false },
        { t: "were", ok: false },
      ],
    },
    {
      q: "I prefer tea ___ coffee in the afternoon.",
      expl: "Prefer takes the preposition to when comparing two nouns.",
      choices: [
        { t: "to", ok: true },
        { t: "than", ok: false },
        { t: "over", ok: false },
        { t: "from", ok: false },
      ],
    },
    {
      q: "Not until he apologized ___ I forgave him.",
      expl: "Not until introduces an inversion with did: did.",
      choices: [
        { t: "did", ok: true },
        { t: "I did", ok: false },
        { t: "I have", ok: false },
        { t: "do", ok: false },
      ],
    },
  ],

  "Vocabulary": [
    {
      q: "Choose the word closest in meaning to ABUNDANT.",
      expl: "Abundant means existing in large quantity: plentiful.",
      choices: [
        { t: "plentiful", ok: true },
        { t: "scarce", ok: false },
        { t: "delicate", ok: false },
        { t: "annual", ok: false },
      ],
    },
    {
      q: "Choose the word OPPOSITE in meaning to GENEROUS.",
      expl: "The opposite of generous is stingy (mean with money).",
      choices: [
        { t: "stingy", ok: true },
        { t: "charitable", ok: false },
        { t: "honest", ok: false },
        { t: "modest", ok: false },
      ],
    },
    {
      q: "MITIGATE, in the sentence \"measures to mitigate the damage\", most nearly means:",
      expl: "To make something less severe or painful.",
      choices: [
        { t: "to make less severe", ok: true },
        { t: "to make worse", ok: false },
        { t: "to measure precisely", ok: false },
        { t: "to delay", ok: false },
      ],
    },
    {
      q: "Choose the word closest in meaning to OBSOLETE.",
      expl: "Obsolete means no longer produced or used: outdated.",
      choices: [
        { t: "outdated", ok: true },
        { t: "expensive", ok: false },
        { t: "ancient", ok: false },
        { t: "modern", ok: false },
      ],
    },
    {
      q: "INEVITABLE most nearly means:",
      expl: "Impossible to avoid or prevent: unavoidable.",
      choices: [
        { t: "unavoidable", ok: true },
        { t: "unexpected", ok: false },
        { t: "dangerous", ok: false },
        { t: "certain to be doubted", ok: false },
      ],
    },
    {
      q: "Choose the word OPPOSITE in meaning to DILIGENT.",
      expl: "The opposite of diligent (hard-working) is lazy.",
      choices: [
        { t: "lazy", ok: true },
        { t: "careful", ok: false },
        { t: "punctual", ok: false },
        { t: "attentive", ok: false },
      ],
    },
    {
      q: "PRUDENT most nearly means:",
      expl: "Showing care and good judgement: wise and cautious.",
      choices: [
        { t: "cautious", ok: true },
        { t: "reckless", ok: false },
        { t: "generous", ok: false },
        { t: "clever", ok: false },
      ],
    },
    {
      q: "CANDID most nearly means:",
      expl: "Open and honest in expression: frank.",
      choices: [
        { t: "frank", ok: true },
        { t: "sly", ok: false },
        { t: "nervous", ok: false },
        { t: "proud", ok: false },
      ],
    },
    {
      q: "The medicine helped to ___ the pain in her back.",
      expl: "To reduce the severity of suffering: to alleviate.",
      choices: [
        { t: "alleviate", ok: true },
        { t: "aggravate", ok: false },
        { t: "measure", ok: false },
        { t: "describe", ok: false },
      ],
    },
    {
      q: "Choose the word OPPOSITE in meaning to METICULOUS.",
      expl: "The opposite of meticulous (very careful) is careless.",
      choices: [
        { t: "careless", ok: true },
        { t: "thorough", ok: false },
        { t: "painstaking", ok: false },
        { t: "efficient", ok: false },
      ],
    },
    {
      q: "FRUGAL most nearly means:",
      expl: "Careful with money and resources: thrifty.",
      choices: [
        { t: "thrifty", ok: true },
        { t: "lavish", ok: false },
        { t: "greedy", ok: false },
        { t: "sociable", ok: false },
      ],
    },
    {
      q: "A COHERENT argument is one that is:",
      expl: "Logical, structured and internally consistent.",
      choices: [
        { t: "logically consistent", ok: true },
        { t: "full of emotion", ok: false },
        { t: "very short", ok: false },
        { t: "based on rumour", ok: false },
      ],
    },
    {
      q: "The instructions were so AMBIGUOUS that nobody understood them.",
      expl: "Ambiguous means open to more than one interpretation: unclear.",
      choices: [
        { t: "unclear", ok: true },
        { t: "precise", ok: false },
        { t: "brief", ok: false },
        { t: "simple", ok: false },
      ],
    },
    {
      q: "Choose the word OPPOSITE in meaning to VERBOSE.",
      expl: "The opposite of verbose (wordy) is concise.",
      choices: [
        { t: "concise", ok: true },
        { t: "eloquent", ok: false },
        { t: "fluent", ok: false },
        { t: "detailed", ok: false },
      ],
    },
    {
      q: "The small business proved RESILIENT after the crisis.",
      expl: "Able to recover quickly from difficulty.",
      choices: [
        { t: "able to recover", ok: true },
        { t: "permanently weak", ok: false },
        { t: "quick to close", ok: false },
        { t: "heavily indebted", ok: false },
      ],
    },
    {
      q: "The auditors came to ___ the accounts carefully.",
      expl: "To examine something in great detail: to scrutinize.",
      choices: [
        { t: "scrutinize", ok: true },
        { t: "ignore", ok: false },
        { t: "divide", ok: false },
        { t: "approve", ok: false },
      ],
    },
    {
      q: "The plan is technically ___ but lacks funding.",
      expl: "Possible to do in practice: feasible.",
      choices: [
        { t: "feasible", ok: true },
        { t: "impossible", ok: false },
        { t: "dangerous", ok: false },
        { t: "expensive", ok: false },
      ],
    },
    {
      q: "Choose the word OPPOSITE in meaning to TRANSPARENT.",
      expl: "The opposite of transparent (see-through, open) is opaque.",
      choices: [
        { t: "opaque", ok: true },
        { t: "clear", ok: false },
        { t: "honest", ok: false },
        { t: "delicate", ok: false },
      ],
    },
    {
      q: "The court decided to ___ the earlier ruling.",
      expl: "To support a decision or principle: to uphold.",
      choices: [
        { t: "uphold", ok: true },
        { t: "overturn", ok: false },
        { t: "postpone", ok: false },
        { t: "avoid", ok: false },
      ],
    },
    {
      q: "A VULNERABLE patient needs special care.",
      expl: "Easily harmed or attacked.",
      choices: [
        { t: "easily harmed", ok: true },
        { t: "fully healthy", ok: false },
        { t: "unaffected", ok: false },
        { t: "recovering", ok: false },
      ],
    },
  ],

  "Reading Comprehension": [
    {
      q: "Passage: For three centuries the library of Al-Qarawiyyin in Fez served as a centre of learning. Manuscripts were copied by hand and students travelled from across the Maghreb to study there. What made it influential?",
      expl: "The passage links the library to learning and to students travelling from far away.",
      choices: [
        { t: "its role as a centre of learning", ok: true },
        { t: "its large stone building", ok: false },
        { t: "its location near a river", ok: false },
        { t: "its collection of weapons", ok: false },
      ],
    },
    {
      q: "According to the passage, how were manuscripts produced?",
      expl: "The passage says they were copied by hand.",
      choices: [
        { t: "copied by hand", ok: true },
        { t: "printed on paper", ok: false },
        { t: "dictated aloud", ok: false },
        { t: "traded from abroad", ok: false },
      ],
    },
    {
      q: "PASSAGE A: The workshop accepts a maximum of twelve students per session. PASSAGE B: The workshop runs for six weeks in total. How many student-weeks does the workshop cover at full attendance?",
      expl: "At full attendance 12 students x 6 weeks = 72 student-weeks.",
      choices: [
        { t: "72", ok: true },
        { t: "18", ok: false },
        { t: "6", ok: false },
        { t: "144", ok: false },
      ],
    },
    {
      q: "Read: \"Regular sleep improves memory, but sleeping too long may leave a person groggy.\" Which conclusion is directly supported?",
      expl: "Only the idea that both too little and too much sleep can be unhelpful is stated outright.",
      choices: [
        { t: "Both too little and too much sleep can be unhelpful", ok: true },
        { t: "Sleeping is harmful in every case", ok: false },
        { t: "Long sleep always improves memory", ok: false },
        { t: "Memory cannot be improved by sleep", ok: false },
      ],
    },
    {
      q: "Read: \"Fewer than 30% of the respondents recycled regularly.\" What can be inferred?",
      expl: "Most respondents did not recycle regularly.",
      choices: [
        { t: "Most respondents did not recycle regularly", ok: true },
        { t: "All respondents recycled regularly", ok: false },
        { t: "Exactly 30% recycled regularly", ok: false },
        { t: "The survey had 30 respondents", ok: false },
      ],
    },
    {
      q: "PASSAGE A: The ancient canal was built in 300 BC. PASSAGE B: Historians believe it served 40 towns. How many towns were served, on average, per century?",
      expl: "40 towns over 3 centuries = about 13.3 towns per century.",
      choices: [
        { t: "about 13", ok: true },
        { t: "about 40", ok: false },
        { t: "about 20", ok: false },
        { t: "about 10", ok: false },
      ],
    },
    {
      q: "Read: \"The treaty was signed in 1919 but was never enforced.\" What does the writer imply?",
      expl: "A document can exist without having practical effect.",
      choices: [
        { t: "A document can exist without practical effect", ok: true },
        { t: "The treaty was never signed", ok: false },
        { t: "The signatories were dishonest about the date", ok: false },
        { t: "Enforcement was unnecessary", ok: false },
      ],
    },
    {
      q: "Read: \"Desert plants store water in thick leaves and open their stomata only at night.\" Why do they open their stomata at night?",
      expl: "To reduce water loss through evaporation.",
      choices: [
        { t: "To reduce water loss through evaporation", ok: true },
        { t: "To absorb more sunlight", ok: false },
        { t: "To attract pollinating insects", ok: false },
        { t: "To release oxygen for animals", ok: false },
      ],
    },
    {
      q: "Read: \"Sales rose 20% in 2020, then fell 20% in 2021.\" Sales returned to the original 2020 level, true or false?",
      expl: "False. A rise then fall of the same percentage does not return to the starting value.",
      choices: [
        { t: "False, the final figure is lower than the 2020 level", ok: true },
        { t: "True, the rise and fall cancel out", ok: false },
        { t: "False, the final figure is higher than the 2020 level", ok: false },
        { t: "True, a 20% fall matches a 20% rise", ok: false },
      ],
    },
    {
      q: "Read: \"The study followed 500 participants for ten years.\" What can be concluded about the sample?",
      expl: "The sample was large and followed over a long period.",
      choices: [
        { t: "It was large and followed over a long period", ok: true },
        { t: "It was small and short", ok: false },
        { t: "It represented the whole population", ok: false },
        { t: "It included only children", ok: false },
      ],
    },
    {
      q: "Read: \"Although the technique is simple, it requires steady hands.\" What is the writer emphasizing?",
      expl: "That ease of description does not mean ease of performance.",
      choices: [
        { t: "That simple to describe is not simple to perform", ok: true },
        { t: "That the technique is complicated", ok: false },
        { t: "That steady hands are unnecessary", ok: false },
        { t: "That only experts can be trusted", ok: false },
      ],
    },
    {
      q: "Read: \"Prices rose 5% and then fell 4%.\" Compared with the original price, what is the net change?",
      expl: "Slightly higher, by about 1% overall.",
      choices: [
        { t: "slightly higher", ok: true },
        { t: "slightly lower", ok: false },
        { t: "no change at all", ok: false },
        { t: "a 9% fall", ok: false },
      ],
    },
    {
      q: "Read: \"Not all birds migrate, and not all migrating birds fly.\" Which group is larger?",
      expl: "The group of birds that do not migrate.",
      choices: [
        { t: "the birds that do not migrate", ok: true },
        { t: "the birds that migrate but do not fly", ok: false },
        { t: "the two groups are equal", ok: false },
        { t: "the birds that both migrate and fly", ok: false },
      ],
    },
    {
      q: "Read: \"The bridge carries more traffic than any other crossing in the region.\" What is implied?",
      expl: "The region has several crossings, and this one is the busiest.",
      choices: [
        { t: "there are several crossings and this is the busiest", ok: true },
        { t: "the region has only one crossing", ok: false },
        { t: "no other crossing carries any traffic", ok: false },
        { t: "the bridge is privately owned", ok: false },
      ],
    },
    {
      q: "Read: \"Small changes in temperature caused large changes in the crop yield.\" Which relationship is described?",
      expl: "An inverse relationship between two variables.",
      choices: [
        { t: "an inverse relationship", ok: true },
        { t: "a direct relationship", ok: false },
        { t: "no relationship", ok: false },
        { t: "a random relationship", ok: false },
      ],
    },
    {
      q: "Read: \"The museum opens at nine and closes at five, with a one-hour break at noon.\" How many hours is it open?",
      expl: "Seven hours, since the one-hour break is excluded.",
      choices: [
        { t: "seven", ok: true },
        { t: "eight", ok: false },
        { t: "six", ok: false },
        { t: "five", ok: false },
      ],
    },
    {
      q: "Read: \"A single sample cannot represent an entire population.\" What does this warn against?",
      expl: "Generalising from too little evidence.",
      choices: [
        { t: "generalising from too little evidence", ok: true },
        { t: "collecting large samples", ok: false },
        { t: "repeating experiments", ok: false },
        { t: "publishing results", ok: false },
      ],
    },
    {
      q: "Read: \"The report was published in 1998 and reissued unchanged in 2018.\" What can be inferred?",
      expl: "The original findings were never revised.",
      choices: [
        { t: "the original findings were never revised", ok: true },
        { t: "the report was written twice", ok: false },
        { t: "the report was out of print for 20 years", ok: false },
        { t: "the author had died by 2018", ok: false },
      ],
    },
    {
      q: "Read: \"Twice as many boys as girls entered the competition.\" If 12 girls entered, how many entered in total?",
      expl: "24 girls would be 12 x 2 = 24 boys, so 36 in total.",
      choices: [
        { t: "36", ok: true },
        { t: "24", ok: false },
        { t: "18", ok: false },
        { t: "30", ok: false },
      ],
    },
    {
      q: "Read: \"The river flows northward for most of its length, then turns east.\" What is unusual?",
      expl: "The change in direction at the end.",
      choices: [
        { t: "the change in direction near the end", ok: true },
        { t: "the river is frozen", ok: false },
        { t: "the river flows slowly throughout", ok: false },
        { t: "the river has no source", ok: false },
      ],
    },
  ],

  "Cloze Test": [
    {
      q: "The meeting was postponed ___ the manager was travelling abroad.",
      expl: "A postponement caused by an external situation uses because of.",
      choices: [
        { t: "because of", ok: true },
        { t: "in order to", ok: false },
        { t: "as for", ok: false },
        { t: "since of", ok: false },
      ],
    },
    {
      q: "She has been working here ___ 2019.",
      expl: "With a starting point in time, since is correct.",
      choices: [
        { t: "since", ok: true },
        { t: "during", ok: false },
        { t: "while", ok: false },
        { t: "for the", ok: false },
      ],
    },
    {
      q: "The two plans differ ___ their funding arrangements.",
      expl: "To express a point of difference between two things, in is used.",
      choices: [
        { t: "in", ok: true },
        { t: "at", ok: false },
        { t: "on", ok: false },
        { t: "with", ok: false },
      ],
    },
    {
      q: "He is a man ___ great patience.",
      expl: "A defining relative clause after a noun uses who/that.",
      choices: [
        { t: "who", ok: true },
        { t: "which", ok: false },
        { t: "what", ok: false },
        { t: "whose", ok: false },
      ],
    },
    {
      q: "The road is closed ___ repairs until August.",
      expl: "A limit or boundary is expressed by until.",
      choices: [
        { t: "for", ok: true },
        { t: "during", ok: false },
        { t: "since", ok: false },
        { t: "from", ok: false },
      ],
    },
    {
      q: "Please write your name ___ the top of the form.",
      expl: "Position on a surface is expressed by on.",
      choices: [
        { t: "at", ok: true },
        { t: "in", ok: false },
        { t: "on", ok: false },
        { t: "by", ok: false },
      ],
    },
    {
      q: "The children were left ___ their grandmother.",
      expl: "Separation is expressed by with.",
      choices: [
        { t: "with", ok: true },
        { t: "without", ok: false },
        { t: "beside", ok: false },
        { t: "except", ok: false },
      ],
    },
    {
      q: "She walked ___ the bridge to reach the island.",
      expl: "Movement across a surface uses across.",
      choices: [
        { t: "across", ok: true },
        { t: "through", ok: false },
        { t: "along", ok: false },
        { t: "above", ok: false },
      ],
    },
    {
      q: "We have been working ___ this project ___ March.",
      expl: "on a project, since a point in time.",
      choices: [
        { t: "on", ok: true },
        { t: "since", ok: false },
        { t: "at", ok: false },
        { t: "in", ok: false },
      ],
    },
    {
      q: "The report was written ___ an independent review.",
      expl: "Means or method is expressed by after.",
      choices: [
        { t: "after", ok: true },
        { t: "before", ok: false },
        { t: "during", ok: false },
        { t: "since", ok: false },
      ],
    },
    {
      q: "He is one of the few engineers ___ can solve the problem.",
      expl: "A defining clause after an indefinite pronoun uses who.",
      choices: [
        { t: "who", ok: true },
        { t: "which", ok: false },
        { t: "what", ok: false },
        { t: "where", ok: false },
      ],
    },
    {
      q: "The concert was postponed ___ a lack of funding.",
      expl: "A reason is expressed by due to.",
      choices: [
        { t: "due to", ok: true },
        { t: "owing", ok: false },
        { t: "next to", ok: false },
        { t: "such as", ok: false },
      ],
    },
    {
      q: "Sit ___ the window if you want to hear the speaker.",
      expl: "A position inside a vehicle uses in.",
      choices: [
        { t: "in", ok: true },
        { t: "on", ok: false },
        { t: "at", ok: false },
        { t: "by", ok: false },
      ],
    },
    {
      q: "The museum is famous ___ its collection of manuscripts.",
      expl: "A defining feature uses for.",
      choices: [
        { t: "for", ok: true },
        { t: "of", ok: false },
        { t: "with", ok: false },
        { t: "by", ok: false },
      ],
    },
    {
      q: "He could not attend the meeting ___ he was in hospital.",
      expl: "A reason uses because of.",
      choices: [
        { t: "because of", ok: true },
        { t: "because", ok: false },
        { t: "due", ok: false },
        { t: "as", ok: false },
      ],
    },
    {
      q: "Please hand your ticket ___ the inspector.",
      expl: "Transfer of an object to a person uses to.",
      choices: [
        { t: "to", ok: true },
        { t: "for", ok: false },
        { t: "at", ok: false },
        { t: "with", ok: false },
      ],
    },
    {
      q: "The project was completed ___ of schedule and ___ of budget.",
      expl: "Ahead of schedule and within budget use ahead and within.",
      choices: [
        { t: "ahead", ok: true },
        { t: "behind", ok: false },
        { t: "above", ok: false },
        { t: "over", ok: false },
      ],
    },
    {
      q: "There is a clear ___ between the two theories.",
      expl: "A difference between two things uses difference between.",
      choices: [
        { t: "difference", ok: true },
        { t: "differences", ok: false },
        { t: "differing", ok: false },
        { t: "differently", ok: false },
      ],
    },
    {
      q: "She replied ___ my email ___ two days.",
      expl: "A reply to a message and a duration use to and within.",
      choices: [
        { t: "to", ok: true },
        { t: "at", ok: false },
        { t: "for", ok: false },
        { t: "with", ok: false },
      ],
    },
    {
      q: "The results were ___ surprising ___ the whole team.",
      expl: "The pair so...that expresses a strong degree.",
      choices: [
        { t: "so", ok: true },
        { t: "as", ok: false },
        { t: "too", ok: false },
        { t: "such", ok: false },
      ],
    },
  ],

  "Sentence Correction": [
    {
      q: "Choose the grammatically correct sentence:  A) He dont like coffee.  B) He do not likes coffee.  C) He does not like coffee.  D) He not like coffee.",
      expl: "With he in the simple present the negative takes does not plus the base verb.",
      choices: [
        { t: "C) He does not like coffee.", ok: true },
        { t: "A) He dont like coffee.", ok: false },
        { t: "B) He do not likes coffee.", ok: false },
        { t: "D) He not like coffee.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) She have a car.  B) She has a car.  C) She haves a car.  D) She are have a car.",
      expl: "The verb agrees with the singular subject she: has.",
      choices: [
        { t: "B) She has a car.", ok: true },
        { t: "A) She have a car.", ok: false },
        { t: "C) She haves a car.", ok: false },
        { t: "D) She are have a car.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) I have went home.  B) I have gone home.  C) I have go home.  D) I has gone home.",
      expl: "After have, the past participle gone is required.",
      choices: [
        { t: "B) I have gone home.", ok: true },
        { t: "A) I have went home.", ok: false },
        { t: "C) I have go home.", ok: false },
        { t: "D) I has gone home.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) Neither of the boys are coming.  B) Neither of the boys is coming.  C) Neither of the boys are come.  D) Neither of the boy is coming.",
      expl: "Neither of is followed by a singular verb.",
      choices: [
        { t: "B) Neither of the boys is coming.", ok: true },
        { t: "A) Neither of the boys are coming.", ok: false },
        { t: "C) Neither of the boys are come.", ok: false },
        { t: "D) Neither of the boy is coming.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) He is taller from his brother.  B) He is taller than his brother.  C) He is taller then his brother.  D) He is tallest of his brother.",
      expl: "Than is used after comparatives.",
      choices: [
        { t: "B) He is taller than his brother.", ok: true },
        { t: "A) He is taller from his brother.", ok: false },
        { t: "C) He is taller then his brother.", ok: false },
        { t: "D) He is tallest of his brother.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) I am living here since 2018.  B) I am living here for 2018.  C) I have been living here since 2018.  D) I live here since 2018.",
      expl: "A living situation that began in the past and continues uses the present perfect with since.",
      choices: [
        { t: "C) I have been living here since 2018.", ok: true },
        { t: "A) I am living here since 2018.", ok: false },
        { t: "B) I am living here for 2018.", ok: false },
        { t: "D) I live here since 2018.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) The window was broke by the child.  B) The window was broken by the child.  C) The window is broke by the child.  D) The window has broke by the child.",
      expl: "In the passive the past participle broken is required.",
      choices: [
        { t: "B) The window was broken by the child.", ok: true },
        { t: "A) The window was broke by the child.", ok: false },
        { t: "C) The window is broke by the child.", ok: false },
        { t: "D) The window has broke by the child.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) I would rather to stay at home.  B) I would rather stay at home.  C) I would rather staying at home.  D) I would rather I stay at home.",
      expl: "Would rather is followed by the base verb.",
      choices: [
        { t: "B) I would rather stay at home.", ok: true },
        { t: "A) I would rather to stay at home.", ok: false },
        { t: "C) I would rather staying at home.", ok: false },
        { t: "D) I would rather I stay at home.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) He asked where am I going.  B) He asked where was I going.  C) He asked where I was going.  D) He asked where I am go.",
      expl: "In reported questions the word order is declarative and the tense shifts back.",
      choices: [
        { t: "C) He asked where I was going.", ok: true },
        { t: "A) He asked where am I going.", ok: false },
        { t: "B) He asked where was I going.", ok: false },
        { t: "D) He asked where I am go.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) Everyone have finished.  B) Everyone has finished.  C) Everyone are finished.  D) Everyone have finish.",
      expl: "Everyone takes a singular verb.",
      choices: [
        { t: "B) Everyone has finished.", ok: true },
        { t: "A) Everyone have finished.", ok: false },
        { t: "C) Everyone are finished.", ok: false },
        { t: "D) Everyone have finish.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) There is many students in the hall.  B) There are many student in the hall.  C) There are many students in the hall.  D) There is many a students in the hall.",
      expl: "Students is plural, so the verb must be are.",
      choices: [
        { t: "C) There are many students in the hall.", ok: true },
        { t: "A) There is many students in the hall.", ok: false },
        { t: "B) There are many student in the hall.", ok: false },
        { t: "D) There is many a students in the hall.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) He explained me the problem.  B) He explained me about the problem.  C) He explained the problem to me.  D) He explained me of the problem.",
      expl: "Explain takes an indirect object: explain something to someone.",
      choices: [
        { t: "C) He explained the problem to me.", ok: true },
        { t: "A) He explained me the problem.", ok: false },
        { t: "B) He explained me about the problem.", ok: false },
        { t: "D) He explained me of the problem.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) She is more taller than her sister.  B) She is taller than her sister.  C) She is tallest than her sister.  D) She is more tall her sister.",
      expl: "Do not use more with a short comparative adjective.",
      choices: [
        { t: "B) She is taller than her sister.", ok: true },
        { t: "A) She is more taller than her sister.", ok: false },
        { t: "C) She is tallest than her sister.", ok: false },
        { t: "D) She is more tall her sister.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) If I will have time, I will call you.  B) If I have time, I will call you.  C) If I would have time, I will call you.  D) If I have time, I would call you.",
      expl: "A first conditional uses if plus simple present, not if plus will.",
      choices: [
        { t: "B) If I have time, I will call you.", ok: true },
        { t: "A) If I will have time, I will call you.", ok: false },
        { t: "C) If I would have time, I will call you.", ok: false },
        { t: "D) If I have time, I would call you.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) The number of students are twenty.  B) The number of students is twenty.  C) A number of students is twenty.  D) The number of student is twenty.",
      expl: "The number of is followed by a singular verb.",
      choices: [
        { t: "B) The number of students is twenty.", ok: true },
        { t: "A) The number of students are twenty.", ok: false },
        { t: "C) A number of students is twenty.", ok: false },
        { t: "D) The number of student is twenty.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) He is used to get up early.  B) He is used to getting up early.  C) He used to getting up early.  D) He is use to get up early.",
      expl: "The phrase be used to is followed by a gerund.",
      choices: [
        { t: "B) He is used to getting up early.", ok: true },
        { t: "A) He is used to get up early.", ok: false },
        { t: "C) He used to getting up early.", ok: false },
        { t: "D) He is use to get up early.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) I am boring in every class.  B) Every class is boring.  C) Every class bore me.  D) I bore every class.",
      expl: "Boring describes the person; bored describes the feeling. The class itself is boring.",
      choices: [
        { t: "B) Every class is boring.", ok: true },
        { t: "A) I am boring in every class.", ok: false },
        { t: "C) Every class bore me.", ok: false },
        { t: "D) I bore every class.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) The committee have not reached a decision.  B) The committee has not reached a decision.  C) The committee have not reach a decision.  D) The committee are not reached a decision.",
      expl: "A collective noun acting as one body takes a singular verb.",
      choices: [
        { t: "B) The committee has not reached a decision.", ok: true },
        { t: "A) The committee have not reached a decision.", ok: false },
        { t: "C) The committee have not reach a decision.", ok: false },
        { t: "D) The committee are not reached a decision.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) She did not went to the party.  B) She did not went to the party.  C) She did not go to the party.  D) She not went to the party.",
      expl: "After the auxiliary did the main verb returns to its base form.",
      choices: [
        { t: "C) She did not go to the party.", ok: true },
        { t: "A) She did not went to the party.", ok: false },
        { t: "B) She did not went to the party.", ok: false },
        { t: "D) She not went to the party.", ok: false },
      ],
    },
    {
      q: "Choose the correct sentence:  A) He is one of the best player in the team.  B) He is one of the best players in the team.  C) He is one of the best player of the team.  D) He is the one of best players in team.",
      expl: "Players is plural, and in is the correct preposition for a group.",
      choices: [
        { t: "B) He is one of the best players in the team.", ok: true },
        { t: "A) He is one of the best player in the team.", ok: false },
        { t: "C) He is one of the best player of the team.", ok: false },
        { t: "D) He is the one of best players in team.", ok: false },
      ],
    },
  ],
};

emit({
  outFile: "prisma/sql/01_step.sql",
  examType,
  sections,
  languageNote: "Content is English.",
});
