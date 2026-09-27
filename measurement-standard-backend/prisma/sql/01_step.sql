-- ============================================================================
-- 01_step.sql   |   Exam type: STEP  (code = 'STEP')
-- ----------------------------------------------------------------------------
-- 5 sections x 20 questions x 4 choices (1 correct) = 100 questions / 400 choices
-- Content is English.
--
-- Target: PostgreSQL. Tables per prisma/schema.prisma
--   exam_types (id uuid, name text, code varchar(100) UNIQUE)
--   sections   (id uuid, name text, exam_type_id uuid -> exam_types.id)
--   questions  (id uuid, content text, explanation text, created_at, section_id uuid)
--   choices    (id uuid, content text, is_correct bool, question_id uuid)
--
-- IDEMPOTENT: safe to re-run. No hard-coded UUIDs, so it works alongside rows
-- already created by the Prisma seeder (src/seeds/seed.ts). Rows are matched on
-- natural keys (exam_types.code, sections.name, questions.content, choices.content).
--
-- NOTE: the mobile app selects exam types and sections by NAME substring, not by
-- code -- see src/app/{verbal,quantitative,achievement,step}.tsx. Changing a
-- name below can make a section stop showing up on its screen.
--
-- Run:  psql "$DATABASE_URL" -f 01_step.sql
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1) EXAM TYPE
-- ----------------------------------------------------------------------------
-- NOTE: every id is supplied explicitly. prisma/schema.prisma declares the ids as
-- @default(uuid()), which Prisma resolves in the client, so the DDL has no column
-- DEFAULT and a raw INSERT that omits id fails with SQLSTATE 23502.
-- gen_random_uuid() is built in from PostgreSQL 13 on, so no extension is needed.
INSERT INTO exam_types (id, name, code)
SELECT gen_random_uuid(), v.name, v.code
FROM (VALUES ('STEP', 'STEP')) AS v(name, code)
WHERE NOT EXISTS (
  SELECT 1 FROM exam_types et WHERE et.code = v.code
);

-- ----------------------------------------------------------------------------
-- 2) SECTIONS
-- ----------------------------------------------------------------------------
INSERT INTO sections (id, name, exam_type_id)
SELECT gen_random_uuid(), v.name, et.id
FROM (VALUES
  ('Grammar'              , 1),
  ('Vocabulary'           , 2),
  ('Reading Comprehension', 3),
  ('Cloze Test'           , 4),
  ('Sentence Correction'  , 5)
) AS v(name, ord)
JOIN exam_types et ON et.code = 'STEP'
WHERE NOT EXISTS (
  SELECT 1 FROM sections s
  WHERE s.exam_type_id = et.id AND s.name = v.name
);

-- ============================================================================
-- 3) QUESTIONS + CHOICES
--    Repeated per section. `sec` resolves the section id from its natural key.
-- ============================================================================

-- ---------------------------------------------------------------- Grammar ---
WITH sec AS (
  SELECT s.id FROM sections s
  JOIN exam_types et ON et.id = s.exam_type_id
  WHERE et.code = 'STEP' AND s.name = 'Grammar'
)
INSERT INTO questions (id, content, explanation, section_id)
SELECT gen_random_uuid(), v.content, v.expl, sec.id
FROM (VALUES
  ('She ___ to school every day.'                          , 'With third person singular (she) the simple present takes -s: goes.'      , 1),
  ('By the time we reached the hall, the film ___.'        , 'The film started before we reached the hall, so the past perfect is used.', 2),
  ('If it ___ tomorrow, we will cancel the trip.'          , 'A first conditional uses "if" + simple present for the condition.'        , 3),
  ('The book ___ by a famous publisher last year.'         , 'The subject receives the action, so the passive voice is required.'       , 4),
  ('Neither of the two answers ___.'                       , 'Neither of is followed by a singular verb.'                               , 5),
  ('He is used to ___ up early every morning.'             , 'The phrase "be used to" is followed by a gerund (verb-ing).'              , 6),
  ('I would rather you ___ me the whole truth.'            , 'Would rather takes the past subjunctive: told.'                           , 7),
  ('There ___ some milk left in the fridge.'               , 'There is used with an uncountable singular noun such as milk.'            , 8),
  ('The harder you work, the ___ you will become.'         , 'The + comparative expresses that two things increase together.'           , 9),
  ('It is essential that every member ___ present on time.', 'After it is essential that we use the subjunctive: be.'                   , 10),
  ('I have been learning Arabic ___ three years.'          , 'For is used with a period of time.'                                       , 11),
  ('This is the ___ book I have ever read.'                , 'The superlative -est is used with ever.'                                  , 12),
  ('He asked me ___ I had finished my homework.'           , 'Whether introduces an indirect yes/no question.'                          , 13),
  ('My brother is much taller ___ his sister.'             , 'Than is used after comparatives such as taller.'                          , 14),
  ('If you want to lose weight, you ___ cut down on sugar.', 'Advice is given with should.'                                             , 15),
  ('Would you mind if I ___ the window?'                   , 'A polite conditional request uses the past form: opened.'                 , 16),
  ('___ studying hard every night, he failed the exam.'    , 'Despite is followed by a gerund.'                                         , 17),
  ('The number of applicants ___ increasing every year.'   , 'The number of is followed by a singular verb.'                            , 18),
  ('I prefer tea ___ coffee in the afternoon.'             , 'Prefer takes the preposition to when comparing two nouns.'                , 19),
  ('Not until he apologized ___ I forgave him.'            , 'Not until introduces an inversion with did: did.'                         , 20)
) AS v(content, expl, ord)
CROSS JOIN sec
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.section_id = sec.id AND q.content = v.content
);

INSERT INTO choices (id, content, is_correct, question_id)
SELECT gen_random_uuid(), v.content, v.correct, q.id
FROM (VALUES
  ('She ___ to school every day.'                          , 'goes'            , true , 1),
  ('She ___ to school every day.'                          , 'go'              , false, 1),
  ('She ___ to school every day.'                          , 'going'           , false, 1),
  ('She ___ to school every day.'                          , 'gone'            , false, 1),
  ('By the time we reached the hall, the film ___.'        , 'was starting'    , false, 2),
  ('By the time we reached the hall, the film ___.'        , 'had started'     , true , 2),
  ('By the time we reached the hall, the film ___.'        , 'has started'     , false, 2),
  ('By the time we reached the hall, the film ___.'        , 'started'         , false, 2),
  ('If it ___ tomorrow, we will cancel the trip.'          , 'rained'          , false, 3),
  ('If it ___ tomorrow, we will cancel the trip.'          , 'is raining'      , false, 3),
  ('If it ___ tomorrow, we will cancel the trip.'          , 'rains'           , true , 3),
  ('If it ___ tomorrow, we will cancel the trip.'          , 'will rain'       , false, 3),
  ('The book ___ by a famous publisher last year.'         , 'published'       , false, 4),
  ('The book ___ by a famous publisher last year.'         , 'is publishing'   , false, 4),
  ('The book ___ by a famous publisher last year.'         , 'has publish'     , false, 4),
  ('The book ___ by a famous publisher last year.'         , 'was published'   , true , 4),
  ('Neither of the two answers ___.'                       , 'is'              , true , 5),
  ('Neither of the two answers ___.'                       , 'are'             , false, 5),
  ('Neither of the two answers ___.'                       , 'were'            , false, 5),
  ('Neither of the two answers ___.'                       , 'have been'       , false, 5),
  ('He is used to ___ up early every morning.'             , 'be getting'      , false, 6),
  ('He is used to ___ up early every morning.'             , 'getting'         , true , 6),
  ('He is used to ___ up early every morning.'             , 'get'             , false, 6),
  ('He is used to ___ up early every morning.'             , 'got'             , false, 6),
  ('I would rather you ___ me the whole truth.'            , 'telling'         , false, 7),
  ('I would rather you ___ me the whole truth.'            , 'to tell'         , false, 7),
  ('I would rather you ___ me the whole truth.'            , 'told'            , true , 7),
  ('I would rather you ___ me the whole truth.'            , 'tell'            , false, 7),
  ('There ___ some milk left in the fridge.'               , 'are'             , false, 8),
  ('There ___ some milk left in the fridge.'               , 'was'             , false, 8),
  ('There ___ some milk left in the fridge.'               , 'were'            , false, 8),
  ('There ___ some milk left in the fridge.'               , 'is'              , true , 8),
  ('The harder you work, the ___ you will become.'         , 'better'          , true , 9),
  ('The harder you work, the ___ you will become.'         , 'best'            , false, 9),
  ('The harder you work, the ___ you will become.'         , 'more good'       , false, 9),
  ('The harder you work, the ___ you will become.'         , 'gooder'          , false, 9),
  ('It is essential that every member ___ present on time.', 'being'           , false, 10),
  ('It is essential that every member ___ present on time.', 'be'              , true , 10),
  ('It is essential that every member ___ present on time.', 'is'              , false, 10),
  ('It is essential that every member ___ present on time.', 'will be'         , false, 10),
  ('I have been learning Arabic ___ three years.'          , 'from'            , false, 11),
  ('I have been learning Arabic ___ three years.'          , 'during'          , false, 11),
  ('I have been learning Arabic ___ three years.'          , 'for'             , true , 11),
  ('I have been learning Arabic ___ three years.'          , 'since'           , false, 11),
  ('This is the ___ book I have ever read.'                , 'more interesting', false, 12),
  ('This is the ___ book I have ever read.'                , 'interestingly'   , false, 12),
  ('This is the ___ book I have ever read.'                , 'most interesting', false, 12),
  ('This is the ___ book I have ever read.'                , 'interesting'     , true , 12),
  ('He asked me ___ I had finished my homework.'           , 'whether'         , true , 13),
  ('He asked me ___ I had finished my homework.'           , 'where'           , false, 13),
  ('He asked me ___ I had finished my homework.'           , 'how'             , false, 13),
  ('He asked me ___ I had finished my homework.'           , 'that'            , false, 13),
  ('My brother is much taller ___ his sister.'             , 'that'            , false, 14),
  ('My brother is much taller ___ his sister.'             , 'than'            , true , 14),
  ('My brother is much taller ___ his sister.'             , 'then'            , false, 14),
  ('My brother is much taller ___ his sister.'             , 'as'              , false, 14),
  ('If you want to lose weight, you ___ cut down on sugar.', 'could'           , false, 15),
  ('If you want to lose weight, you ___ cut down on sugar.', 'must not'        , false, 15),
  ('If you want to lose weight, you ___ cut down on sugar.', 'should'          , true , 15),
  ('If you want to lose weight, you ___ cut down on sugar.', 'would'           , false, 15),
  ('Would you mind if I ___ the window?'                   , 'open'            , false, 16),
  ('Would you mind if I ___ the window?'                   , 'opening'         , false, 16),
  ('Would you mind if I ___ the window?'                   , 'have opened'     , false, 16),
  ('Would you mind if I ___ the window?'                   , 'opened'          , true , 16),
  ('___ studying hard every night, he failed the exam.'    , 'Despite'         , true , 17),
  ('___ studying hard every night, he failed the exam.'    , 'Although'        , false, 17),
  ('___ studying hard every night, he failed the exam.'    , 'Because of'      , false, 17),
  ('___ studying hard every night, he failed the exam.'    , 'However'         , false, 17),
  ('The number of applicants ___ increasing every year.'   , 'were'            , false, 18),
  ('The number of applicants ___ increasing every year.'   , 'is'              , true , 18),
  ('The number of applicants ___ increasing every year.'   , 'are'             , false, 18),
  ('The number of applicants ___ increasing every year.'   , 'have been'       , false, 18),
  ('I prefer tea ___ coffee in the afternoon.'             , 'over'            , false, 19),
  ('I prefer tea ___ coffee in the afternoon.'             , 'from'            , false, 19),
  ('I prefer tea ___ coffee in the afternoon.'             , 'to'              , true , 19),
  ('I prefer tea ___ coffee in the afternoon.'             , 'than'            , false, 19),
  ('Not until he apologized ___ I forgave him.'            , 'I did'           , false, 20),
  ('Not until he apologized ___ I forgave him.'            , 'I have'          , false, 20),
  ('Not until he apologized ___ I forgave him.'            , 'do'              , false, 20),
  ('Not until he apologized ___ I forgave him.'            , 'did'             , true , 20)
) AS v(qcontent, content, correct, ord)
JOIN questions q
  ON q.content = v.qcontent
  AND q.section_id = (
    SELECT s.id FROM sections s
    JOIN exam_types et ON et.id = s.exam_type_id
    WHERE et.code = 'STEP' AND s.name = 'Grammar'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM choices c WHERE c.question_id = q.id AND c.content = v.content
);

-- ---------------------------------------------------------------- Vocabulary ---
WITH sec AS (
  SELECT s.id FROM sections s
  JOIN exam_types et ON et.id = s.exam_type_id
  WHERE et.code = 'STEP' AND s.name = 'Vocabulary'
)
INSERT INTO questions (id, content, explanation, section_id)
SELECT gen_random_uuid(), v.content, v.expl, sec.id
FROM (VALUES
  ('Choose the word closest in meaning to ABUNDANT.'                                , 'Abundant means existing in large quantity: plentiful.'         , 1),
  ('Choose the word OPPOSITE in meaning to GENEROUS.'                               , 'The opposite of generous is stingy (mean with money).'         , 2),
  ('MITIGATE, in the sentence "measures to mitigate the damage", most nearly means:', 'To make something less severe or painful.'                     , 3),
  ('Choose the word closest in meaning to OBSOLETE.'                                , 'Obsolete means no longer produced or used: outdated.'          , 4),
  ('INEVITABLE most nearly means:'                                                  , 'Impossible to avoid or prevent: unavoidable.'                  , 5),
  ('Choose the word OPPOSITE in meaning to DILIGENT.'                               , 'The opposite of diligent (hard-working) is lazy.'              , 6),
  ('PRUDENT most nearly means:'                                                     , 'Showing care and good judgement: wise and cautious.'           , 7),
  ('CANDID most nearly means:'                                                      , 'Open and honest in expression: frank.'                         , 8),
  ('The medicine helped to ___ the pain in her back.'                               , 'To reduce the severity of suffering: to alleviate.'            , 9),
  ('Choose the word OPPOSITE in meaning to METICULOUS.'                             , 'The opposite of meticulous (very careful) is careless.'        , 10),
  ('FRUGAL most nearly means:'                                                      , 'Careful with money and resources: thrifty.'                    , 11),
  ('A COHERENT argument is one that is:'                                            , 'Logical, structured and internally consistent.'                , 12),
  ('The instructions were so AMBIGUOUS that nobody understood them.'                , 'Ambiguous means open to more than one interpretation: unclear.', 13),
  ('Choose the word OPPOSITE in meaning to VERBOSE.'                                , 'The opposite of verbose (wordy) is concise.'                   , 14),
  ('The small business proved RESILIENT after the crisis.'                          , 'Able to recover quickly from difficulty.'                      , 15),
  ('The auditors came to ___ the accounts carefully.'                               , 'To examine something in great detail: to scrutinize.'          , 16),
  ('The plan is technically ___ but lacks funding.'                                 , 'Possible to do in practice: feasible.'                         , 17),
  ('Choose the word OPPOSITE in meaning to TRANSPARENT.'                            , 'The opposite of transparent (see-through, open) is opaque.'    , 18),
  ('The court decided to ___ the earlier ruling.'                                   , 'To support a decision or principle: to uphold.'                , 19),
  ('A VULNERABLE patient needs special care.'                                       , 'Easily harmed or attacked.'                                    , 20)
) AS v(content, expl, ord)
CROSS JOIN sec
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.section_id = sec.id AND q.content = v.content
);

INSERT INTO choices (id, content, is_correct, question_id)
SELECT gen_random_uuid(), v.content, v.correct, q.id
FROM (VALUES
  ('Choose the word closest in meaning to ABUNDANT.'                                , 'scarce'               , false, 1),
  ('Choose the word closest in meaning to ABUNDANT.'                                , 'delicate'             , false, 1),
  ('Choose the word closest in meaning to ABUNDANT.'                                , 'annual'               , false, 1),
  ('Choose the word closest in meaning to ABUNDANT.'                                , 'plentiful'            , true , 1),
  ('Choose the word OPPOSITE in meaning to GENEROUS.'                               , 'stingy'               , true , 2),
  ('Choose the word OPPOSITE in meaning to GENEROUS.'                               , 'charitable'           , false, 2),
  ('Choose the word OPPOSITE in meaning to GENEROUS.'                               , 'honest'               , false, 2),
  ('Choose the word OPPOSITE in meaning to GENEROUS.'                               , 'modest'               , false, 2),
  ('MITIGATE, in the sentence "measures to mitigate the damage", most nearly means:', 'to delay'             , false, 3),
  ('MITIGATE, in the sentence "measures to mitigate the damage", most nearly means:', 'to make less severe'  , true , 3),
  ('MITIGATE, in the sentence "measures to mitigate the damage", most nearly means:', 'to make worse'        , false, 3),
  ('MITIGATE, in the sentence "measures to mitigate the damage", most nearly means:', 'to measure precisely' , false, 3),
  ('Choose the word closest in meaning to OBSOLETE.'                                , 'ancient'              , false, 4),
  ('Choose the word closest in meaning to OBSOLETE.'                                , 'modern'               , false, 4),
  ('Choose the word closest in meaning to OBSOLETE.'                                , 'outdated'             , true , 4),
  ('Choose the word closest in meaning to OBSOLETE.'                                , 'expensive'            , false, 4),
  ('INEVITABLE most nearly means:'                                                  , 'unexpected'           , false, 5),
  ('INEVITABLE most nearly means:'                                                  , 'dangerous'            , false, 5),
  ('INEVITABLE most nearly means:'                                                  , 'certain to be doubted', false, 5),
  ('INEVITABLE most nearly means:'                                                  , 'unavoidable'          , true , 5),
  ('Choose the word OPPOSITE in meaning to DILIGENT.'                               , 'lazy'                 , true , 6),
  ('Choose the word OPPOSITE in meaning to DILIGENT.'                               , 'careful'              , false, 6),
  ('Choose the word OPPOSITE in meaning to DILIGENT.'                               , 'punctual'             , false, 6),
  ('Choose the word OPPOSITE in meaning to DILIGENT.'                               , 'attentive'            , false, 6),
  ('PRUDENT most nearly means:'                                                     , 'clever'               , false, 7),
  ('PRUDENT most nearly means:'                                                     , 'cautious'             , true , 7),
  ('PRUDENT most nearly means:'                                                     , 'reckless'             , false, 7),
  ('PRUDENT most nearly means:'                                                     , 'generous'             , false, 7),
  ('CANDID most nearly means:'                                                      , 'nervous'              , false, 8),
  ('CANDID most nearly means:'                                                      , 'proud'                , false, 8),
  ('CANDID most nearly means:'                                                      , 'frank'                , true , 8),
  ('CANDID most nearly means:'                                                      , 'sly'                  , false, 8),
  ('The medicine helped to ___ the pain in her back.'                               , 'aggravate'            , false, 9),
  ('The medicine helped to ___ the pain in her back.'                               , 'measure'              , false, 9),
  ('The medicine helped to ___ the pain in her back.'                               , 'describe'             , false, 9),
  ('The medicine helped to ___ the pain in her back.'                               , 'alleviate'            , true , 9),
  ('Choose the word OPPOSITE in meaning to METICULOUS.'                             , 'careless'             , true , 10),
  ('Choose the word OPPOSITE in meaning to METICULOUS.'                             , 'thorough'             , false, 10),
  ('Choose the word OPPOSITE in meaning to METICULOUS.'                             , 'painstaking'          , false, 10),
  ('Choose the word OPPOSITE in meaning to METICULOUS.'                             , 'efficient'            , false, 10),
  ('FRUGAL most nearly means:'                                                      , 'sociable'             , false, 11),
  ('FRUGAL most nearly means:'                                                      , 'thrifty'              , true , 11),
  ('FRUGAL most nearly means:'                                                      , 'lavish'               , false, 11),
  ('FRUGAL most nearly means:'                                                      , 'greedy'               , false, 11),
  ('A COHERENT argument is one that is:'                                            , 'very short'           , false, 12),
  ('A COHERENT argument is one that is:'                                            , 'based on rumour'      , false, 12),
  ('A COHERENT argument is one that is:'                                            , 'logically consistent' , true , 12),
  ('A COHERENT argument is one that is:'                                            , 'full of emotion'      , false, 12),
  ('The instructions were so AMBIGUOUS that nobody understood them.'                , 'precise'              , false, 13),
  ('The instructions were so AMBIGUOUS that nobody understood them.'                , 'brief'                , false, 13),
  ('The instructions were so AMBIGUOUS that nobody understood them.'                , 'simple'               , false, 13),
  ('The instructions were so AMBIGUOUS that nobody understood them.'                , 'unclear'              , true , 13),
  ('Choose the word OPPOSITE in meaning to VERBOSE.'                                , 'concise'              , true , 14),
  ('Choose the word OPPOSITE in meaning to VERBOSE.'                                , 'eloquent'             , false, 14),
  ('Choose the word OPPOSITE in meaning to VERBOSE.'                                , 'fluent'               , false, 14),
  ('Choose the word OPPOSITE in meaning to VERBOSE.'                                , 'detailed'             , false, 14),
  ('The small business proved RESILIENT after the crisis.'                          , 'heavily indebted'     , false, 15),
  ('The small business proved RESILIENT after the crisis.'                          , 'able to recover'      , true , 15),
  ('The small business proved RESILIENT after the crisis.'                          , 'permanently weak'     , false, 15),
  ('The small business proved RESILIENT after the crisis.'                          , 'quick to close'       , false, 15),
  ('The auditors came to ___ the accounts carefully.'                               , 'divide'               , false, 16),
  ('The auditors came to ___ the accounts carefully.'                               , 'approve'              , false, 16),
  ('The auditors came to ___ the accounts carefully.'                               , 'scrutinize'           , true , 16),
  ('The auditors came to ___ the accounts carefully.'                               , 'ignore'               , false, 16),
  ('The plan is technically ___ but lacks funding.'                                 , 'impossible'           , false, 17),
  ('The plan is technically ___ but lacks funding.'                                 , 'dangerous'            , false, 17),
  ('The plan is technically ___ but lacks funding.'                                 , 'expensive'            , false, 17),
  ('The plan is technically ___ but lacks funding.'                                 , 'feasible'             , true , 17),
  ('Choose the word OPPOSITE in meaning to TRANSPARENT.'                            , 'opaque'               , true , 18),
  ('Choose the word OPPOSITE in meaning to TRANSPARENT.'                            , 'clear'                , false, 18),
  ('Choose the word OPPOSITE in meaning to TRANSPARENT.'                            , 'honest'               , false, 18),
  ('Choose the word OPPOSITE in meaning to TRANSPARENT.'                            , 'delicate'             , false, 18),
  ('The court decided to ___ the earlier ruling.'                                   , 'avoid'                , false, 19),
  ('The court decided to ___ the earlier ruling.'                                   , 'uphold'               , true , 19),
  ('The court decided to ___ the earlier ruling.'                                   , 'overturn'             , false, 19),
  ('The court decided to ___ the earlier ruling.'                                   , 'postpone'             , false, 19),
  ('A VULNERABLE patient needs special care.'                                       , 'unaffected'           , false, 20),
  ('A VULNERABLE patient needs special care.'                                       , 'recovering'           , false, 20),
  ('A VULNERABLE patient needs special care.'                                       , 'easily harmed'        , true , 20),
  ('A VULNERABLE patient needs special care.'                                       , 'fully healthy'        , false, 20)
) AS v(qcontent, content, correct, ord)
JOIN questions q
  ON q.content = v.qcontent
  AND q.section_id = (
    SELECT s.id FROM sections s
    JOIN exam_types et ON et.id = s.exam_type_id
    WHERE et.code = 'STEP' AND s.name = 'Vocabulary'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM choices c WHERE c.question_id = q.id AND c.content = v.content
);

-- ---------------------------------------------------------------- Reading Comprehension ---
WITH sec AS (
  SELECT s.id FROM sections s
  JOIN exam_types et ON et.id = s.exam_type_id
  WHERE et.code = 'STEP' AND s.name = 'Reading Comprehension'
)
INSERT INTO questions (id, content, explanation, section_id)
SELECT gen_random_uuid(), v.content, v.expl, sec.id
FROM (VALUES
  ('Passage: For three centuries the library of Al-Qarawiyyin in Fez served as a centre of learning. Manuscripts were copied by hand and students travelled from across the Maghreb to study there. What made it influential?', 'The passage links the library to learning and to students travelling from far away.'       , 1),
  ('According to the passage, how were manuscripts produced?'                                                                                                                                                                 , 'The passage says they were copied by hand.'                                                , 2),
  ('PASSAGE A: The workshop accepts a maximum of twelve students per session. PASSAGE B: The workshop runs for six weeks in total. How many student-weeks does the workshop cover at full attendance?'                        , 'At full attendance 12 students x 6 weeks = 72 student-weeks.'                              , 3),
  ('Read: "Regular sleep improves memory, but sleeping too long may leave a person groggy." Which conclusion is directly supported?'                                                                                          , 'Only the idea that both too little and too much sleep can be unhelpful is stated outright.', 4),
  ('Read: "Fewer than 30% of the respondents recycled regularly." What can be inferred?'                                                                                                                                      , 'Most respondents did not recycle regularly.'                                               , 5),
  ('PASSAGE A: The ancient canal was built in 300 BC. PASSAGE B: Historians believe it served 40 towns. How many towns were served, on average, per century?'                                                                 , '40 towns over 3 centuries = about 13.3 towns per century.'                                 , 6),
  ('Read: "The treaty was signed in 1919 but was never enforced." What does the writer imply?'                                                                                                                                , 'A document can exist without having practical effect.'                                     , 7),
  ('Read: "Desert plants store water in thick leaves and open their stomata only at night." Why do they open their stomata at night?'                                                                                         , 'To reduce water loss through evaporation.'                                                 , 8),
  ('Read: "Sales rose 20% in 2020, then fell 20% in 2021." Sales returned to the original 2020 level, true or false?'                                                                                                         , 'False. A rise then fall of the same percentage does not return to the starting value.'     , 9),
  ('Read: "The study followed 500 participants for ten years." What can be concluded about the sample?'                                                                                                                       , 'The sample was large and followed over a long period.'                                     , 10),
  ('Read: "Although the technique is simple, it requires steady hands." What is the writer emphasizing?'                                                                                                                      , 'That ease of description does not mean ease of performance.'                               , 11),
  ('Read: "Prices rose 5% and then fell 4%." Compared with the original price, what is the net change?'                                                                                                                       , 'Slightly higher, by about 1% overall.'                                                     , 12),
  ('Read: "Not all birds migrate, and not all migrating birds fly." Which group is larger?'                                                                                                                                   , 'The group of birds that do not migrate.'                                                   , 13),
  ('Read: "The bridge carries more traffic than any other crossing in the region." What is implied?'                                                                                                                          , 'The region has several crossings, and this one is the busiest.'                            , 14),
  ('Read: "Small changes in temperature caused large changes in the crop yield." Which relationship is described?'                                                                                                            , 'An inverse relationship between two variables.'                                            , 15),
  ('Read: "The museum opens at nine and closes at five, with a one-hour break at noon." How many hours is it open?'                                                                                                           , 'Seven hours, since the one-hour break is excluded.'                                        , 16),
  ('Read: "A single sample cannot represent an entire population." What does this warn against?'                                                                                                                              , 'Generalising from too little evidence.'                                                    , 17),
  ('Read: "The report was published in 1998 and reissued unchanged in 2018." What can be inferred?'                                                                                                                           , 'The original findings were never revised.'                                                 , 18),
  ('Read: "Twice as many boys as girls entered the competition." If 12 girls entered, how many entered in total?'                                                                                                             , '24 girls would be 12 x 2 = 24 boys, so 36 in total.'                                       , 19),
  ('Read: "The river flows northward for most of its length, then turns east." What is unusual?'                                                                                                                              , 'The change in direction at the end.'                                                       , 20)
) AS v(content, expl, ord)
CROSS JOIN sec
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.section_id = sec.id AND q.content = v.content
);

INSERT INTO choices (id, content, is_correct, question_id)
SELECT gen_random_uuid(), v.content, v.correct, q.id
FROM (VALUES
  ('Passage: For three centuries the library of Al-Qarawiyyin in Fez served as a centre of learning. Manuscripts were copied by hand and students travelled from across the Maghreb to study there. What made it influential?', 'its location near a river'                            , false, 1),
  ('Passage: For three centuries the library of Al-Qarawiyyin in Fez served as a centre of learning. Manuscripts were copied by hand and students travelled from across the Maghreb to study there. What made it influential?', 'its collection of weapons'                            , false, 1),
  ('Passage: For three centuries the library of Al-Qarawiyyin in Fez served as a centre of learning. Manuscripts were copied by hand and students travelled from across the Maghreb to study there. What made it influential?', 'its role as a centre of learning'                     , true , 1),
  ('Passage: For three centuries the library of Al-Qarawiyyin in Fez served as a centre of learning. Manuscripts were copied by hand and students travelled from across the Maghreb to study there. What made it influential?', 'its large stone building'                             , false, 1),
  ('According to the passage, how were manuscripts produced?'                                                                                                                                                                 , 'printed on paper'                                     , false, 2),
  ('According to the passage, how were manuscripts produced?'                                                                                                                                                                 , 'dictated aloud'                                       , false, 2),
  ('According to the passage, how were manuscripts produced?'                                                                                                                                                                 , 'traded from abroad'                                   , false, 2),
  ('According to the passage, how were manuscripts produced?'                                                                                                                                                                 , 'copied by hand'                                       , true , 2),
  ('PASSAGE A: The workshop accepts a maximum of twelve students per session. PASSAGE B: The workshop runs for six weeks in total. How many student-weeks does the workshop cover at full attendance?'                        , '72'                                                   , true , 3),
  ('PASSAGE A: The workshop accepts a maximum of twelve students per session. PASSAGE B: The workshop runs for six weeks in total. How many student-weeks does the workshop cover at full attendance?'                        , '18'                                                   , false, 3),
  ('PASSAGE A: The workshop accepts a maximum of twelve students per session. PASSAGE B: The workshop runs for six weeks in total. How many student-weeks does the workshop cover at full attendance?'                        , '6'                                                    , false, 3),
  ('PASSAGE A: The workshop accepts a maximum of twelve students per session. PASSAGE B: The workshop runs for six weeks in total. How many student-weeks does the workshop cover at full attendance?'                        , '144'                                                  , false, 3),
  ('Read: "Regular sleep improves memory, but sleeping too long may leave a person groggy." Which conclusion is directly supported?'                                                                                          , 'Memory cannot be improved by sleep'                   , false, 4),
  ('Read: "Regular sleep improves memory, but sleeping too long may leave a person groggy." Which conclusion is directly supported?'                                                                                          , 'Both too little and too much sleep can be unhelpful'  , true , 4),
  ('Read: "Regular sleep improves memory, but sleeping too long may leave a person groggy." Which conclusion is directly supported?'                                                                                          , 'Sleeping is harmful in every case'                    , false, 4),
  ('Read: "Regular sleep improves memory, but sleeping too long may leave a person groggy." Which conclusion is directly supported?'                                                                                          , 'Long sleep always improves memory'                    , false, 4),
  ('Read: "Fewer than 30% of the respondents recycled regularly." What can be inferred?'                                                                                                                                      , 'Exactly 30% recycled regularly'                       , false, 5),
  ('Read: "Fewer than 30% of the respondents recycled regularly." What can be inferred?'                                                                                                                                      , 'The survey had 30 respondents'                        , false, 5),
  ('Read: "Fewer than 30% of the respondents recycled regularly." What can be inferred?'                                                                                                                                      , 'Most respondents did not recycle regularly'           , true , 5),
  ('Read: "Fewer than 30% of the respondents recycled regularly." What can be inferred?'                                                                                                                                      , 'All respondents recycled regularly'                   , false, 5),
  ('PASSAGE A: The ancient canal was built in 300 BC. PASSAGE B: Historians believe it served 40 towns. How many towns were served, on average, per century?'                                                                 , 'about 40'                                             , false, 6),
  ('PASSAGE A: The ancient canal was built in 300 BC. PASSAGE B: Historians believe it served 40 towns. How many towns were served, on average, per century?'                                                                 , 'about 20'                                             , false, 6),
  ('PASSAGE A: The ancient canal was built in 300 BC. PASSAGE B: Historians believe it served 40 towns. How many towns were served, on average, per century?'                                                                 , 'about 10'                                             , false, 6),
  ('PASSAGE A: The ancient canal was built in 300 BC. PASSAGE B: Historians believe it served 40 towns. How many towns were served, on average, per century?'                                                                 , 'about 13'                                             , true , 6),
  ('Read: "The treaty was signed in 1919 but was never enforced." What does the writer imply?'                                                                                                                                , 'A document can exist without practical effect'        , true , 7),
  ('Read: "The treaty was signed in 1919 but was never enforced." What does the writer imply?'                                                                                                                                , 'The treaty was never signed'                          , false, 7),
  ('Read: "The treaty was signed in 1919 but was never enforced." What does the writer imply?'                                                                                                                                , 'The signatories were dishonest about the date'        , false, 7),
  ('Read: "The treaty was signed in 1919 but was never enforced." What does the writer imply?'                                                                                                                                , 'Enforcement was unnecessary'                          , false, 7),
  ('Read: "Desert plants store water in thick leaves and open their stomata only at night." Why do they open their stomata at night?'                                                                                         , 'To release oxygen for animals'                        , false, 8),
  ('Read: "Desert plants store water in thick leaves and open their stomata only at night." Why do they open their stomata at night?'                                                                                         , 'To reduce water loss through evaporation'             , true , 8),
  ('Read: "Desert plants store water in thick leaves and open their stomata only at night." Why do they open their stomata at night?'                                                                                         , 'To absorb more sunlight'                              , false, 8),
  ('Read: "Desert plants store water in thick leaves and open their stomata only at night." Why do they open their stomata at night?'                                                                                         , 'To attract pollinating insects'                       , false, 8),
  ('Read: "Sales rose 20% in 2020, then fell 20% in 2021." Sales returned to the original 2020 level, true or false?'                                                                                                         , 'False, the final figure is higher than the 2020 level', false, 9),
  ('Read: "Sales rose 20% in 2020, then fell 20% in 2021." Sales returned to the original 2020 level, true or false?'                                                                                                         , 'True, a 20% fall matches a 20% rise'                  , false, 9),
  ('Read: "Sales rose 20% in 2020, then fell 20% in 2021." Sales returned to the original 2020 level, true or false?'                                                                                                         , 'False, the final figure is lower than the 2020 level' , true , 9),
  ('Read: "Sales rose 20% in 2020, then fell 20% in 2021." Sales returned to the original 2020 level, true or false?'                                                                                                         , 'True, the rise and fall cancel out'                   , false, 9),
  ('Read: "The study followed 500 participants for ten years." What can be concluded about the sample?'                                                                                                                       , 'It was small and short'                               , false, 10),
  ('Read: "The study followed 500 participants for ten years." What can be concluded about the sample?'                                                                                                                       , 'It represented the whole population'                  , false, 10),
  ('Read: "The study followed 500 participants for ten years." What can be concluded about the sample?'                                                                                                                       , 'It included only children'                            , false, 10),
  ('Read: "The study followed 500 participants for ten years." What can be concluded about the sample?'                                                                                                                       , 'It was large and followed over a long period'         , true , 10),
  ('Read: "Although the technique is simple, it requires steady hands." What is the writer emphasizing?'                                                                                                                      , 'That simple to describe is not simple to perform'     , true , 11),
  ('Read: "Although the technique is simple, it requires steady hands." What is the writer emphasizing?'                                                                                                                      , 'That the technique is complicated'                    , false, 11),
  ('Read: "Although the technique is simple, it requires steady hands." What is the writer emphasizing?'                                                                                                                      , 'That steady hands are unnecessary'                    , false, 11),
  ('Read: "Although the technique is simple, it requires steady hands." What is the writer emphasizing?'                                                                                                                      , 'That only experts can be trusted'                     , false, 11),
  ('Read: "Prices rose 5% and then fell 4%." Compared with the original price, what is the net change?'                                                                                                                       , 'a 9% fall'                                            , false, 12),
  ('Read: "Prices rose 5% and then fell 4%." Compared with the original price, what is the net change?'                                                                                                                       , 'slightly higher'                                      , true , 12),
  ('Read: "Prices rose 5% and then fell 4%." Compared with the original price, what is the net change?'                                                                                                                       , 'slightly lower'                                       , false, 12),
  ('Read: "Prices rose 5% and then fell 4%." Compared with the original price, what is the net change?'                                                                                                                       , 'no change at all'                                     , false, 12),
  ('Read: "Not all birds migrate, and not all migrating birds fly." Which group is larger?'                                                                                                                                   , 'the two groups are equal'                             , false, 13),
  ('Read: "Not all birds migrate, and not all migrating birds fly." Which group is larger?'                                                                                                                                   , 'the birds that both migrate and fly'                  , false, 13),
  ('Read: "Not all birds migrate, and not all migrating birds fly." Which group is larger?'                                                                                                                                   , 'the birds that do not migrate'                        , true , 13),
  ('Read: "Not all birds migrate, and not all migrating birds fly." Which group is larger?'                                                                                                                                   , 'the birds that migrate but do not fly'                , false, 13),
  ('Read: "The bridge carries more traffic than any other crossing in the region." What is implied?'                                                                                                                          , 'the region has only one crossing'                     , false, 14),
  ('Read: "The bridge carries more traffic than any other crossing in the region." What is implied?'                                                                                                                          , 'no other crossing carries any traffic'                , false, 14),
  ('Read: "The bridge carries more traffic than any other crossing in the region." What is implied?'                                                                                                                          , 'the bridge is privately owned'                        , false, 14),
  ('Read: "The bridge carries more traffic than any other crossing in the region." What is implied?'                                                                                                                          , 'there are several crossings and this is the busiest'  , true , 14),
  ('Read: "Small changes in temperature caused large changes in the crop yield." Which relationship is described?'                                                                                                            , 'an inverse relationship'                              , true , 15),
  ('Read: "Small changes in temperature caused large changes in the crop yield." Which relationship is described?'                                                                                                            , 'a direct relationship'                                , false, 15),
  ('Read: "Small changes in temperature caused large changes in the crop yield." Which relationship is described?'                                                                                                            , 'no relationship'                                      , false, 15),
  ('Read: "Small changes in temperature caused large changes in the crop yield." Which relationship is described?'                                                                                                            , 'a random relationship'                                , false, 15),
  ('Read: "The museum opens at nine and closes at five, with a one-hour break at noon." How many hours is it open?'                                                                                                           , 'five'                                                 , false, 16),
  ('Read: "The museum opens at nine and closes at five, with a one-hour break at noon." How many hours is it open?'                                                                                                           , 'seven'                                                , true , 16),
  ('Read: "The museum opens at nine and closes at five, with a one-hour break at noon." How many hours is it open?'                                                                                                           , 'eight'                                                , false, 16),
  ('Read: "The museum opens at nine and closes at five, with a one-hour break at noon." How many hours is it open?'                                                                                                           , 'six'                                                  , false, 16),
  ('Read: "A single sample cannot represent an entire population." What does this warn against?'                                                                                                                              , 'repeating experiments'                                , false, 17),
  ('Read: "A single sample cannot represent an entire population." What does this warn against?'                                                                                                                              , 'publishing results'                                   , false, 17),
  ('Read: "A single sample cannot represent an entire population." What does this warn against?'                                                                                                                              , 'generalising from too little evidence'                , true , 17),
  ('Read: "A single sample cannot represent an entire population." What does this warn against?'                                                                                                                              , 'collecting large samples'                             , false, 17),
  ('Read: "The report was published in 1998 and reissued unchanged in 2018." What can be inferred?'                                                                                                                           , 'the report was written twice'                         , false, 18),
  ('Read: "The report was published in 1998 and reissued unchanged in 2018." What can be inferred?'                                                                                                                           , 'the report was out of print for 20 years'             , false, 18),
  ('Read: "The report was published in 1998 and reissued unchanged in 2018." What can be inferred?'                                                                                                                           , 'the author had died by 2018'                          , false, 18),
  ('Read: "The report was published in 1998 and reissued unchanged in 2018." What can be inferred?'                                                                                                                           , 'the original findings were never revised'             , true , 18),
  ('Read: "Twice as many boys as girls entered the competition." If 12 girls entered, how many entered in total?'                                                                                                             , '36'                                                   , true , 19),
  ('Read: "Twice as many boys as girls entered the competition." If 12 girls entered, how many entered in total?'                                                                                                             , '24'                                                   , false, 19),
  ('Read: "Twice as many boys as girls entered the competition." If 12 girls entered, how many entered in total?'                                                                                                             , '18'                                                   , false, 19),
  ('Read: "Twice as many boys as girls entered the competition." If 12 girls entered, how many entered in total?'                                                                                                             , '30'                                                   , false, 19),
  ('Read: "The river flows northward for most of its length, then turns east." What is unusual?'                                                                                                                              , 'the river has no source'                              , false, 20),
  ('Read: "The river flows northward for most of its length, then turns east." What is unusual?'                                                                                                                              , 'the change in direction near the end'                 , true , 20),
  ('Read: "The river flows northward for most of its length, then turns east." What is unusual?'                                                                                                                              , 'the river is frozen'                                  , false, 20),
  ('Read: "The river flows northward for most of its length, then turns east." What is unusual?'                                                                                                                              , 'the river flows slowly throughout'                    , false, 20)
) AS v(qcontent, content, correct, ord)
JOIN questions q
  ON q.content = v.qcontent
  AND q.section_id = (
    SELECT s.id FROM sections s
    JOIN exam_types et ON et.id = s.exam_type_id
    WHERE et.code = 'STEP' AND s.name = 'Reading Comprehension'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM choices c WHERE c.question_id = q.id AND c.content = v.content
);

-- ---------------------------------------------------------------- Cloze Test ---
WITH sec AS (
  SELECT s.id FROM sections s
  JOIN exam_types et ON et.id = s.exam_type_id
  WHERE et.code = 'STEP' AND s.name = 'Cloze Test'
)
INSERT INTO questions (id, content, explanation, section_id)
SELECT gen_random_uuid(), v.content, v.expl, sec.id
FROM (VALUES
  ('The meeting was postponed ___ the manager was travelling abroad.', 'A postponement caused by an external situation uses because of.' , 1),
  ('She has been working here ___ 2019.'                             , 'With a starting point in time, since is correct.'                , 2),
  ('The two plans differ ___ their funding arrangements.'            , 'To express a point of difference between two things, in is used.', 3),
  ('He is a man ___ great patience.'                                 , 'A defining relative clause after a noun uses who/that.'          , 4),
  ('The road is closed ___ repairs until August.'                    , 'A limit or boundary is expressed by until.'                      , 5),
  ('Please write your name ___ the top of the form.'                 , 'Position on a surface is expressed by on.'                       , 6),
  ('The children were left ___ their grandmother.'                   , 'Separation is expressed by with.'                                , 7),
  ('She walked ___ the bridge to reach the island.'                  , 'Movement across a surface uses across.'                          , 8),
  ('We have been working ___ this project ___ March.'                , 'on a project, since a point in time.'                            , 9),
  ('The report was written ___ an independent review.'               , 'Means or method is expressed by after.'                          , 10),
  ('He is one of the few engineers ___ can solve the problem.'       , 'A defining clause after an indefinite pronoun uses who.'         , 11),
  ('The concert was postponed ___ a lack of funding.'                , 'A reason is expressed by due to.'                                , 12),
  ('Sit ___ the window if you want to hear the speaker.'             , 'A position inside a vehicle uses in.'                            , 13),
  ('The museum is famous ___ its collection of manuscripts.'         , 'A defining feature uses for.'                                    , 14),
  ('He could not attend the meeting ___ he was in hospital.'         , 'A reason uses because of.'                                       , 15),
  ('Please hand your ticket ___ the inspector.'                      , 'Transfer of an object to a person uses to.'                      , 16),
  ('The project was completed ___ of schedule and ___ of budget.'    , 'Ahead of schedule and within budget use ahead and within.'       , 17),
  ('There is a clear ___ between the two theories.'                  , 'A difference between two things uses difference between.'        , 18),
  ('She replied ___ my email ___ two days.'                          , 'A reply to a message and a duration use to and within.'          , 19),
  ('The results were ___ surprising ___ the whole team.'             , 'The pair so...that expresses a strong degree.'                   , 20)
) AS v(content, expl, ord)
CROSS JOIN sec
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.section_id = sec.id AND q.content = v.content
);

INSERT INTO choices (id, content, is_correct, question_id)
SELECT gen_random_uuid(), v.content, v.correct, q.id
FROM (VALUES
  ('The meeting was postponed ___ the manager was travelling abroad.', 'since of'   , false, 1),
  ('The meeting was postponed ___ the manager was travelling abroad.', 'because of' , true , 1),
  ('The meeting was postponed ___ the manager was travelling abroad.', 'in order to', false, 1),
  ('The meeting was postponed ___ the manager was travelling abroad.', 'as for'     , false, 1),
  ('She has been working here ___ 2019.'                             , 'while'      , false, 2),
  ('She has been working here ___ 2019.'                             , 'for the'    , false, 2),
  ('She has been working here ___ 2019.'                             , 'since'      , true , 2),
  ('She has been working here ___ 2019.'                             , 'during'     , false, 2),
  ('The two plans differ ___ their funding arrangements.'            , 'at'         , false, 3),
  ('The two plans differ ___ their funding arrangements.'            , 'on'         , false, 3),
  ('The two plans differ ___ their funding arrangements.'            , 'with'       , false, 3),
  ('The two plans differ ___ their funding arrangements.'            , 'in'         , true , 3),
  ('He is a man ___ great patience.'                                 , 'who'        , true , 4),
  ('He is a man ___ great patience.'                                 , 'which'      , false, 4),
  ('He is a man ___ great patience.'                                 , 'what'       , false, 4),
  ('He is a man ___ great patience.'                                 , 'whose'      , false, 4),
  ('The road is closed ___ repairs until August.'                    , 'from'       , false, 5),
  ('The road is closed ___ repairs until August.'                    , 'for'        , true , 5),
  ('The road is closed ___ repairs until August.'                    , 'during'     , false, 5),
  ('The road is closed ___ repairs until August.'                    , 'since'      , false, 5),
  ('Please write your name ___ the top of the form.'                 , 'on'         , false, 6),
  ('Please write your name ___ the top of the form.'                 , 'by'         , false, 6),
  ('Please write your name ___ the top of the form.'                 , 'at'         , true , 6),
  ('Please write your name ___ the top of the form.'                 , 'in'         , false, 6),
  ('The children were left ___ their grandmother.'                   , 'without'    , false, 7),
  ('The children were left ___ their grandmother.'                   , 'beside'     , false, 7),
  ('The children were left ___ their grandmother.'                   , 'except'     , false, 7),
  ('The children were left ___ their grandmother.'                   , 'with'       , true , 7),
  ('She walked ___ the bridge to reach the island.'                  , 'across'     , true , 8),
  ('She walked ___ the bridge to reach the island.'                  , 'through'    , false, 8),
  ('She walked ___ the bridge to reach the island.'                  , 'along'      , false, 8),
  ('She walked ___ the bridge to reach the island.'                  , 'above'      , false, 8),
  ('We have been working ___ this project ___ March.'                , 'in'         , false, 9),
  ('We have been working ___ this project ___ March.'                , 'on'         , true , 9),
  ('We have been working ___ this project ___ March.'                , 'since'      , false, 9),
  ('We have been working ___ this project ___ March.'                , 'at'         , false, 9),
  ('The report was written ___ an independent review.'               , 'during'     , false, 10),
  ('The report was written ___ an independent review.'               , 'since'      , false, 10),
  ('The report was written ___ an independent review.'               , 'after'      , true , 10),
  ('The report was written ___ an independent review.'               , 'before'     , false, 10),
  ('He is one of the few engineers ___ can solve the problem.'       , 'which'      , false, 11),
  ('He is one of the few engineers ___ can solve the problem.'       , 'what'       , false, 11),
  ('He is one of the few engineers ___ can solve the problem.'       , 'where'      , false, 11),
  ('He is one of the few engineers ___ can solve the problem.'       , 'who'        , true , 11),
  ('The concert was postponed ___ a lack of funding.'                , 'due to'     , true , 12),
  ('The concert was postponed ___ a lack of funding.'                , 'owing'      , false, 12),
  ('The concert was postponed ___ a lack of funding.'                , 'next to'    , false, 12),
  ('The concert was postponed ___ a lack of funding.'                , 'such as'    , false, 12),
  ('Sit ___ the window if you want to hear the speaker.'             , 'by'         , false, 13),
  ('Sit ___ the window if you want to hear the speaker.'             , 'in'         , true , 13),
  ('Sit ___ the window if you want to hear the speaker.'             , 'on'         , false, 13),
  ('Sit ___ the window if you want to hear the speaker.'             , 'at'         , false, 13),
  ('The museum is famous ___ its collection of manuscripts.'         , 'with'       , false, 14),
  ('The museum is famous ___ its collection of manuscripts.'         , 'by'         , false, 14),
  ('The museum is famous ___ its collection of manuscripts.'         , 'for'        , true , 14),
  ('The museum is famous ___ its collection of manuscripts.'         , 'of'         , false, 14),
  ('He could not attend the meeting ___ he was in hospital.'         , 'because'    , false, 15),
  ('He could not attend the meeting ___ he was in hospital.'         , 'due'        , false, 15),
  ('He could not attend the meeting ___ he was in hospital.'         , 'as'         , false, 15),
  ('He could not attend the meeting ___ he was in hospital.'         , 'because of' , true , 15),
  ('Please hand your ticket ___ the inspector.'                      , 'to'         , true , 16),
  ('Please hand your ticket ___ the inspector.'                      , 'for'        , false, 16),
  ('Please hand your ticket ___ the inspector.'                      , 'at'         , false, 16),
  ('Please hand your ticket ___ the inspector.'                      , 'with'       , false, 16),
  ('The project was completed ___ of schedule and ___ of budget.'    , 'over'       , false, 17),
  ('The project was completed ___ of schedule and ___ of budget.'    , 'ahead'      , true , 17),
  ('The project was completed ___ of schedule and ___ of budget.'    , 'behind'     , false, 17),
  ('The project was completed ___ of schedule and ___ of budget.'    , 'above'      , false, 17),
  ('There is a clear ___ between the two theories.'                  , 'differing'  , false, 18),
  ('There is a clear ___ between the two theories.'                  , 'differently', false, 18),
  ('There is a clear ___ between the two theories.'                  , 'difference' , true , 18),
  ('There is a clear ___ between the two theories.'                  , 'differences', false, 18),
  ('She replied ___ my email ___ two days.'                          , 'at'         , false, 19),
  ('She replied ___ my email ___ two days.'                          , 'for'        , false, 19),
  ('She replied ___ my email ___ two days.'                          , 'with'       , false, 19),
  ('She replied ___ my email ___ two days.'                          , 'to'         , true , 19),
  ('The results were ___ surprising ___ the whole team.'             , 'so'         , true , 20),
  ('The results were ___ surprising ___ the whole team.'             , 'as'         , false, 20),
  ('The results were ___ surprising ___ the whole team.'             , 'too'        , false, 20),
  ('The results were ___ surprising ___ the whole team.'             , 'such'       , false, 20)
) AS v(qcontent, content, correct, ord)
JOIN questions q
  ON q.content = v.qcontent
  AND q.section_id = (
    SELECT s.id FROM sections s
    JOIN exam_types et ON et.id = s.exam_type_id
    WHERE et.code = 'STEP' AND s.name = 'Cloze Test'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM choices c WHERE c.question_id = q.id AND c.content = v.content
);

-- ---------------------------------------------------------------- Sentence Correction ---
WITH sec AS (
  SELECT s.id FROM sections s
  JOIN exam_types et ON et.id = s.exam_type_id
  WHERE et.code = 'STEP' AND s.name = 'Sentence Correction'
)
INSERT INTO questions (id, content, explanation, section_id)
SELECT gen_random_uuid(), v.content, v.expl, sec.id
FROM (VALUES
  ('Choose the grammatically correct sentence:  A) He dont like coffee.  B) He do not likes coffee.  C) He does not like coffee.  D) He not like coffee.'                                                                , 'With he in the simple present the negative takes does not plus the base verb.'               , 1),
  ('Choose the correct sentence:  A) She have a car.  B) She has a car.  C) She haves a car.  D) She are have a car.'                                                                                                    , 'The verb agrees with the singular subject she: has.'                                         , 2),
  ('Choose the correct sentence:  A) I have went home.  B) I have gone home.  C) I have go home.  D) I has gone home.'                                                                                                   , 'After have, the past participle gone is required.'                                           , 3),
  ('Choose the correct sentence:  A) Neither of the boys are coming.  B) Neither of the boys is coming.  C) Neither of the boys are come.  D) Neither of the boy is coming.'                                             , 'Neither of is followed by a singular verb.'                                                  , 4),
  ('Choose the correct sentence:  A) He is taller from his brother.  B) He is taller than his brother.  C) He is taller then his brother.  D) He is tallest of his brother.'                                             , 'Than is used after comparatives.'                                                            , 5),
  ('Choose the correct sentence:  A) I am living here since 2018.  B) I am living here for 2018.  C) I have been living here since 2018.  D) I live here since 2018.'                                                    , 'A living situation that began in the past and continues uses the present perfect with since.', 6),
  ('Choose the correct sentence:  A) The window was broke by the child.  B) The window was broken by the child.  C) The window is broke by the child.  D) The window has broke by the child.'                            , 'In the passive the past participle broken is required.'                                      , 7),
  ('Choose the correct sentence:  A) I would rather to stay at home.  B) I would rather stay at home.  C) I would rather staying at home.  D) I would rather I stay at home.'                                            , 'Would rather is followed by the base verb.'                                                  , 8),
  ('Choose the correct sentence:  A) He asked where am I going.  B) He asked where was I going.  C) He asked where I was going.  D) He asked where I am go.'                                                             , 'In reported questions the word order is declarative and the tense shifts back.'              , 9),
  ('Choose the correct sentence:  A) Everyone have finished.  B) Everyone has finished.  C) Everyone are finished.  D) Everyone have finish.'                                                                            , 'Everyone takes a singular verb.'                                                             , 10),
  ('Choose the correct sentence:  A) There is many students in the hall.  B) There are many student in the hall.  C) There are many students in the hall.  D) There is many a students in the hall.'                     , 'Students is plural, so the verb must be are.'                                                , 11),
  ('Choose the correct sentence:  A) He explained me the problem.  B) He explained me about the problem.  C) He explained the problem to me.  D) He explained me of the problem.'                                        , 'Explain takes an indirect object: explain something to someone.'                             , 12),
  ('Choose the correct sentence:  A) She is more taller than her sister.  B) She is taller than her sister.  C) She is tallest than her sister.  D) She is more tall her sister.'                                        , 'Do not use more with a short comparative adjective.'                                         , 13),
  ('Choose the correct sentence:  A) If I will have time, I will call you.  B) If I have time, I will call you.  C) If I would have time, I will call you.  D) If I have time, I would call you.'                        , 'A first conditional uses if plus simple present, not if plus will.'                          , 14),
  ('Choose the correct sentence:  A) The number of students are twenty.  B) The number of students is twenty.  C) A number of students is twenty.  D) The number of student is twenty.'                                  , 'The number of is followed by a singular verb.'                                               , 15),
  ('Choose the correct sentence:  A) He is used to get up early.  B) He is used to getting up early.  C) He used to getting up early.  D) He is use to get up early.'                                                    , 'The phrase be used to is followed by a gerund.'                                              , 16),
  ('Choose the correct sentence:  A) I am boring in every class.  B) Every class is boring.  C) Every class bore me.  D) I bore every class.'                                                                            , 'Boring describes the person; bored describes the feeling. The class itself is boring.'       , 17),
  ('Choose the correct sentence:  A) The committee have not reached a decision.  B) The committee has not reached a decision.  C) The committee have not reach a decision.  D) The committee are not reached a decision.', 'A collective noun acting as one body takes a singular verb.'                                 , 18),
  ('Choose the correct sentence:  A) She did not went to the party.  B) She did not went to the party.  C) She did not go to the party.  D) She not went to the party.'                                                  , 'After the auxiliary did the main verb returns to its base form.'                             , 19),
  ('Choose the correct sentence:  A) He is one of the best player in the team.  B) He is one of the best players in the team.  C) He is one of the best player of the team.  D) He is the one of best players in team.'  , 'Players is plural, and in is the correct preposition for a group.'                           , 20)
) AS v(content, expl, ord)
CROSS JOIN sec
WHERE NOT EXISTS (
  SELECT 1 FROM questions q WHERE q.section_id = sec.id AND q.content = v.content
);

INSERT INTO choices (id, content, is_correct, question_id)
SELECT gen_random_uuid(), v.content, v.correct, q.id
FROM (VALUES
  ('Choose the grammatically correct sentence:  A) He dont like coffee.  B) He do not likes coffee.  C) He does not like coffee.  D) He not like coffee.'                                                                , 'C) He does not like coffee.'                  , true , 1),
  ('Choose the grammatically correct sentence:  A) He dont like coffee.  B) He do not likes coffee.  C) He does not like coffee.  D) He not like coffee.'                                                                , 'A) He dont like coffee.'                      , false, 1),
  ('Choose the grammatically correct sentence:  A) He dont like coffee.  B) He do not likes coffee.  C) He does not like coffee.  D) He not like coffee.'                                                                , 'B) He do not likes coffee.'                   , false, 1),
  ('Choose the grammatically correct sentence:  A) He dont like coffee.  B) He do not likes coffee.  C) He does not like coffee.  D) He not like coffee.'                                                                , 'D) He not like coffee.'                       , false, 1),
  ('Choose the correct sentence:  A) She have a car.  B) She has a car.  C) She haves a car.  D) She are have a car.'                                                                                                    , 'D) She are have a car.'                       , false, 2),
  ('Choose the correct sentence:  A) She have a car.  B) She has a car.  C) She haves a car.  D) She are have a car.'                                                                                                    , 'B) She has a car.'                            , true , 2),
  ('Choose the correct sentence:  A) She have a car.  B) She has a car.  C) She haves a car.  D) She are have a car.'                                                                                                    , 'A) She have a car.'                           , false, 2),
  ('Choose the correct sentence:  A) She have a car.  B) She has a car.  C) She haves a car.  D) She are have a car.'                                                                                                    , 'C) She haves a car.'                          , false, 2),
  ('Choose the correct sentence:  A) I have went home.  B) I have gone home.  C) I have go home.  D) I has gone home.'                                                                                                   , 'C) I have go home.'                           , false, 3),
  ('Choose the correct sentence:  A) I have went home.  B) I have gone home.  C) I have go home.  D) I has gone home.'                                                                                                   , 'D) I has gone home.'                          , false, 3),
  ('Choose the correct sentence:  A) I have went home.  B) I have gone home.  C) I have go home.  D) I has gone home.'                                                                                                   , 'B) I have gone home.'                         , true , 3),
  ('Choose the correct sentence:  A) I have went home.  B) I have gone home.  C) I have go home.  D) I has gone home.'                                                                                                   , 'A) I have went home.'                         , false, 3),
  ('Choose the correct sentence:  A) Neither of the boys are coming.  B) Neither of the boys is coming.  C) Neither of the boys are come.  D) Neither of the boy is coming.'                                             , 'A) Neither of the boys are coming.'           , false, 4),
  ('Choose the correct sentence:  A) Neither of the boys are coming.  B) Neither of the boys is coming.  C) Neither of the boys are come.  D) Neither of the boy is coming.'                                             , 'C) Neither of the boys are come.'             , false, 4),
  ('Choose the correct sentence:  A) Neither of the boys are coming.  B) Neither of the boys is coming.  C) Neither of the boys are come.  D) Neither of the boy is coming.'                                             , 'D) Neither of the boy is coming.'             , false, 4),
  ('Choose the correct sentence:  A) Neither of the boys are coming.  B) Neither of the boys is coming.  C) Neither of the boys are come.  D) Neither of the boy is coming.'                                             , 'B) Neither of the boys is coming.'            , true , 4),
  ('Choose the correct sentence:  A) He is taller from his brother.  B) He is taller than his brother.  C) He is taller then his brother.  D) He is tallest of his brother.'                                             , 'B) He is taller than his brother.'            , true , 5),
  ('Choose the correct sentence:  A) He is taller from his brother.  B) He is taller than his brother.  C) He is taller then his brother.  D) He is tallest of his brother.'                                             , 'A) He is taller from his brother.'            , false, 5),
  ('Choose the correct sentence:  A) He is taller from his brother.  B) He is taller than his brother.  C) He is taller then his brother.  D) He is tallest of his brother.'                                             , 'C) He is taller then his brother.'            , false, 5),
  ('Choose the correct sentence:  A) He is taller from his brother.  B) He is taller than his brother.  C) He is taller then his brother.  D) He is tallest of his brother.'                                             , 'D) He is tallest of his brother.'             , false, 5),
  ('Choose the correct sentence:  A) I am living here since 2018.  B) I am living here for 2018.  C) I have been living here since 2018.  D) I live here since 2018.'                                                    , 'D) I live here since 2018.'                   , false, 6),
  ('Choose the correct sentence:  A) I am living here since 2018.  B) I am living here for 2018.  C) I have been living here since 2018.  D) I live here since 2018.'                                                    , 'C) I have been living here since 2018.'       , true , 6),
  ('Choose the correct sentence:  A) I am living here since 2018.  B) I am living here for 2018.  C) I have been living here since 2018.  D) I live here since 2018.'                                                    , 'A) I am living here since 2018.'              , false, 6),
  ('Choose the correct sentence:  A) I am living here since 2018.  B) I am living here for 2018.  C) I have been living here since 2018.  D) I live here since 2018.'                                                    , 'B) I am living here for 2018.'                , false, 6),
  ('Choose the correct sentence:  A) The window was broke by the child.  B) The window was broken by the child.  C) The window is broke by the child.  D) The window has broke by the child.'                            , 'C) The window is broke by the child.'         , false, 7),
  ('Choose the correct sentence:  A) The window was broke by the child.  B) The window was broken by the child.  C) The window is broke by the child.  D) The window has broke by the child.'                            , 'D) The window has broke by the child.'        , false, 7),
  ('Choose the correct sentence:  A) The window was broke by the child.  B) The window was broken by the child.  C) The window is broke by the child.  D) The window has broke by the child.'                            , 'B) The window was broken by the child.'       , true , 7),
  ('Choose the correct sentence:  A) The window was broke by the child.  B) The window was broken by the child.  C) The window is broke by the child.  D) The window has broke by the child.'                            , 'A) The window was broke by the child.'        , false, 7),
  ('Choose the correct sentence:  A) I would rather to stay at home.  B) I would rather stay at home.  C) I would rather staying at home.  D) I would rather I stay at home.'                                            , 'A) I would rather to stay at home.'           , false, 8),
  ('Choose the correct sentence:  A) I would rather to stay at home.  B) I would rather stay at home.  C) I would rather staying at home.  D) I would rather I stay at home.'                                            , 'C) I would rather staying at home.'           , false, 8),
  ('Choose the correct sentence:  A) I would rather to stay at home.  B) I would rather stay at home.  C) I would rather staying at home.  D) I would rather I stay at home.'                                            , 'D) I would rather I stay at home.'            , false, 8),
  ('Choose the correct sentence:  A) I would rather to stay at home.  B) I would rather stay at home.  C) I would rather staying at home.  D) I would rather I stay at home.'                                            , 'B) I would rather stay at home.'              , true , 8),
  ('Choose the correct sentence:  A) He asked where am I going.  B) He asked where was I going.  C) He asked where I was going.  D) He asked where I am go.'                                                             , 'C) He asked where I was going.'               , true , 9),
  ('Choose the correct sentence:  A) He asked where am I going.  B) He asked where was I going.  C) He asked where I was going.  D) He asked where I am go.'                                                             , 'A) He asked where am I going.'                , false, 9),
  ('Choose the correct sentence:  A) He asked where am I going.  B) He asked where was I going.  C) He asked where I was going.  D) He asked where I am go.'                                                             , 'B) He asked where was I going.'               , false, 9),
  ('Choose the correct sentence:  A) He asked where am I going.  B) He asked where was I going.  C) He asked where I was going.  D) He asked where I am go.'                                                             , 'D) He asked where I am go.'                   , false, 9),
  ('Choose the correct sentence:  A) Everyone have finished.  B) Everyone has finished.  C) Everyone are finished.  D) Everyone have finish.'                                                                            , 'D) Everyone have finish.'                     , false, 10),
  ('Choose the correct sentence:  A) Everyone have finished.  B) Everyone has finished.  C) Everyone are finished.  D) Everyone have finish.'                                                                            , 'B) Everyone has finished.'                    , true , 10),
  ('Choose the correct sentence:  A) Everyone have finished.  B) Everyone has finished.  C) Everyone are finished.  D) Everyone have finish.'                                                                            , 'A) Everyone have finished.'                   , false, 10),
  ('Choose the correct sentence:  A) Everyone have finished.  B) Everyone has finished.  C) Everyone are finished.  D) Everyone have finish.'                                                                            , 'C) Everyone are finished.'                    , false, 10),
  ('Choose the correct sentence:  A) There is many students in the hall.  B) There are many student in the hall.  C) There are many students in the hall.  D) There is many a students in the hall.'                     , 'B) There are many student in the hall.'       , false, 11),
  ('Choose the correct sentence:  A) There is many students in the hall.  B) There are many student in the hall.  C) There are many students in the hall.  D) There is many a students in the hall.'                     , 'D) There is many a students in the hall.'     , false, 11),
  ('Choose the correct sentence:  A) There is many students in the hall.  B) There are many student in the hall.  C) There are many students in the hall.  D) There is many a students in the hall.'                     , 'C) There are many students in the hall.'      , true , 11),
  ('Choose the correct sentence:  A) There is many students in the hall.  B) There are many student in the hall.  C) There are many students in the hall.  D) There is many a students in the hall.'                     , 'A) There is many students in the hall.'       , false, 11),
  ('Choose the correct sentence:  A) He explained me the problem.  B) He explained me about the problem.  C) He explained the problem to me.  D) He explained me of the problem.'                                        , 'A) He explained me the problem.'              , false, 12),
  ('Choose the correct sentence:  A) He explained me the problem.  B) He explained me about the problem.  C) He explained the problem to me.  D) He explained me of the problem.'                                        , 'B) He explained me about the problem.'        , false, 12),
  ('Choose the correct sentence:  A) He explained me the problem.  B) He explained me about the problem.  C) He explained the problem to me.  D) He explained me of the problem.'                                        , 'D) He explained me of the problem.'           , false, 12),
  ('Choose the correct sentence:  A) He explained me the problem.  B) He explained me about the problem.  C) He explained the problem to me.  D) He explained me of the problem.'                                        , 'C) He explained the problem to me.'           , true , 12),
  ('Choose the correct sentence:  A) She is more taller than her sister.  B) She is taller than her sister.  C) She is tallest than her sister.  D) She is more tall her sister.'                                        , 'B) She is taller than her sister.'            , true , 13),
  ('Choose the correct sentence:  A) She is more taller than her sister.  B) She is taller than her sister.  C) She is tallest than her sister.  D) She is more tall her sister.'                                        , 'A) She is more taller than her sister.'       , false, 13),
  ('Choose the correct sentence:  A) She is more taller than her sister.  B) She is taller than her sister.  C) She is tallest than her sister.  D) She is more tall her sister.'                                        , 'C) She is tallest than her sister.'           , false, 13),
  ('Choose the correct sentence:  A) She is more taller than her sister.  B) She is taller than her sister.  C) She is tallest than her sister.  D) She is more tall her sister.'                                        , 'D) She is more tall her sister.'              , false, 13),
  ('Choose the correct sentence:  A) If I will have time, I will call you.  B) If I have time, I will call you.  C) If I would have time, I will call you.  D) If I have time, I would call you.'                        , 'D) If I have time, I would call you.'         , false, 14),
  ('Choose the correct sentence:  A) If I will have time, I will call you.  B) If I have time, I will call you.  C) If I would have time, I will call you.  D) If I have time, I would call you.'                        , 'B) If I have time, I will call you.'          , true , 14),
  ('Choose the correct sentence:  A) If I will have time, I will call you.  B) If I have time, I will call you.  C) If I would have time, I will call you.  D) If I have time, I would call you.'                        , 'A) If I will have time, I will call you.'     , false, 14),
  ('Choose the correct sentence:  A) If I will have time, I will call you.  B) If I have time, I will call you.  C) If I would have time, I will call you.  D) If I have time, I would call you.'                        , 'C) If I would have time, I will call you.'    , false, 14),
  ('Choose the correct sentence:  A) The number of students are twenty.  B) The number of students is twenty.  C) A number of students is twenty.  D) The number of student is twenty.'                                  , 'C) A number of students is twenty.'           , false, 15),
  ('Choose the correct sentence:  A) The number of students are twenty.  B) The number of students is twenty.  C) A number of students is twenty.  D) The number of student is twenty.'                                  , 'D) The number of student is twenty.'          , false, 15),
  ('Choose the correct sentence:  A) The number of students are twenty.  B) The number of students is twenty.  C) A number of students is twenty.  D) The number of student is twenty.'                                  , 'B) The number of students is twenty.'         , true , 15),
  ('Choose the correct sentence:  A) The number of students are twenty.  B) The number of students is twenty.  C) A number of students is twenty.  D) The number of student is twenty.'                                  , 'A) The number of students are twenty.'        , false, 15),
  ('Choose the correct sentence:  A) He is used to get up early.  B) He is used to getting up early.  C) He used to getting up early.  D) He is use to get up early.'                                                    , 'A) He is used to get up early.'               , false, 16),
  ('Choose the correct sentence:  A) He is used to get up early.  B) He is used to getting up early.  C) He used to getting up early.  D) He is use to get up early.'                                                    , 'C) He used to getting up early.'              , false, 16),
  ('Choose the correct sentence:  A) He is used to get up early.  B) He is used to getting up early.  C) He used to getting up early.  D) He is use to get up early.'                                                    , 'D) He is use to get up early.'                , false, 16),
  ('Choose the correct sentence:  A) He is used to get up early.  B) He is used to getting up early.  C) He used to getting up early.  D) He is use to get up early.'                                                    , 'B) He is used to getting up early.'           , true , 16),
  ('Choose the correct sentence:  A) I am boring in every class.  B) Every class is boring.  C) Every class bore me.  D) I bore every class.'                                                                            , 'B) Every class is boring.'                    , true , 17),
  ('Choose the correct sentence:  A) I am boring in every class.  B) Every class is boring.  C) Every class bore me.  D) I bore every class.'                                                                            , 'A) I am boring in every class.'               , false, 17),
  ('Choose the correct sentence:  A) I am boring in every class.  B) Every class is boring.  C) Every class bore me.  D) I bore every class.'                                                                            , 'C) Every class bore me.'                      , false, 17),
  ('Choose the correct sentence:  A) I am boring in every class.  B) Every class is boring.  C) Every class bore me.  D) I bore every class.'                                                                            , 'D) I bore every class.'                       , false, 17),
  ('Choose the correct sentence:  A) The committee have not reached a decision.  B) The committee has not reached a decision.  C) The committee have not reach a decision.  D) The committee are not reached a decision.', 'D) The committee are not reached a decision.' , false, 18),
  ('Choose the correct sentence:  A) The committee have not reached a decision.  B) The committee has not reached a decision.  C) The committee have not reach a decision.  D) The committee are not reached a decision.', 'B) The committee has not reached a decision.' , true , 18),
  ('Choose the correct sentence:  A) The committee have not reached a decision.  B) The committee has not reached a decision.  C) The committee have not reach a decision.  D) The committee are not reached a decision.', 'A) The committee have not reached a decision.', false, 18),
  ('Choose the correct sentence:  A) The committee have not reached a decision.  B) The committee has not reached a decision.  C) The committee have not reach a decision.  D) The committee are not reached a decision.', 'C) The committee have not reach a decision.'  , false, 18),
  ('Choose the correct sentence:  A) She did not went to the party.  B) She did not went to the party.  C) She did not go to the party.  D) She not went to the party.'                                                  , 'B) She did not went to the party.'            , false, 19),
  ('Choose the correct sentence:  A) She did not went to the party.  B) She did not went to the party.  C) She did not go to the party.  D) She not went to the party.'                                                  , 'D) She not went to the party.'                , false, 19),
  ('Choose the correct sentence:  A) She did not went to the party.  B) She did not went to the party.  C) She did not go to the party.  D) She not went to the party.'                                                  , 'C) She did not go to the party.'              , true , 19),
  ('Choose the correct sentence:  A) She did not went to the party.  B) She did not went to the party.  C) She did not go to the party.  D) She not went to the party.'                                                  , 'A) She did not went to the party.'            , false, 19),
  ('Choose the correct sentence:  A) He is one of the best player in the team.  B) He is one of the best players in the team.  C) He is one of the best player of the team.  D) He is the one of best players in team.'  , 'A) He is one of the best player in the team.' , false, 20),
  ('Choose the correct sentence:  A) He is one of the best player in the team.  B) He is one of the best players in the team.  C) He is one of the best player of the team.  D) He is the one of best players in team.'  , 'C) He is one of the best player of the team.' , false, 20),
  ('Choose the correct sentence:  A) He is one of the best player in the team.  B) He is one of the best players in the team.  C) He is one of the best player of the team.  D) He is the one of best players in team.'  , 'D) He is the one of best players in team.'    , false, 20),
  ('Choose the correct sentence:  A) He is one of the best player in the team.  B) He is one of the best players in the team.  C) He is one of the best player of the team.  D) He is the one of best players in team.'  , 'B) He is one of the best players in the team.', true , 20)
) AS v(qcontent, content, correct, ord)
JOIN questions q
  ON q.content = v.qcontent
  AND q.section_id = (
    SELECT s.id FROM sections s
    JOIN exam_types et ON et.id = s.exam_type_id
    WHERE et.code = 'STEP' AND s.name = 'Sentence Correction'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM choices c WHERE c.question_id = q.id AND c.content = v.content
);

-- ----------------------------------------------------------------------------
-- VERIFY
-- ----------------------------------------------------------------------------
SELECT 'exam_types'  AS entity, count(*) FROM exam_types  WHERE code = 'STEP'
UNION ALL SELECT 'sections',   count(*) FROM sections s JOIN exam_types et ON et.id = s.exam_type_id WHERE et.code = 'STEP'
UNION ALL SELECT 'questions',  count(*) FROM questions q JOIN sections s ON s.id = q.section_id JOIN exam_types et ON et.id = s.exam_type_id WHERE et.code = 'STEP'
UNION ALL SELECT 'choices',    count(*) FROM choices ch JOIN questions q ON q.id = ch.question_id JOIN sections s ON s.id = q.section_id JOIN exam_types et ON et.id = s.exam_type_id WHERE et.code = 'STEP';

COMMIT;
