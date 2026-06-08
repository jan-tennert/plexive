# Deepscroll — Long-Form Style Guide (Reference Version)

This is the **long-form reference version** of the Deepscroll style guide. It is the master source for all stylistic decisions across the seven content formats. The per-format AI generation prompts in `DEEPSCROLL_CONTENT_STRUCTURE.md` will reference compressed versions of these rules — but this document holds the full reasoning, the full blacklists, and the full examples.

**Use this document when:**
- Generating a benchmark example post (where quality matters infinitely more than token cost)
- Resolving ambiguity in a per-format prompt
- Onboarding a new content reviewer
- Updating the compressed style rules in any per-format prompt

**Goal of every Deepscroll post:**
A reader who finds the topic interesting should be able to read from feed card to final source without effort. Substance holds attention. The post does not lure — it earns continued reading by giving the reader something at every drop-off point. The reader should leave the post feeling they learned something real, not feeling they were entertained.

---

## Rule 1 — No AI Fingerprints

**This is the most important rule.** A post that reads as AI-written destroys the entire premise of Deepscroll. Substance only works when the voice feels human. Even brilliant content fails if the prose has the fingerprint of a chatbot.

This rule has four parts: a vocabulary blacklist, a structural blacklist, a punctuation and formatting blacklist, and a positive directive.

### 1A — Vocabulary Blacklist

These words appear in AI-generated text at far higher rates than in human writing. Avoid them entirely unless they are technically necessary (e.g. "robust" in a statistics context). Replace with the plain alternative.

**Adjectives — banned:**
delve, tapestry, multifaceted, intricate, vibrant, robust, comprehensive, nuanced, profound, paramount, pivotal, crucial, essential, stark, captivating, compelling, transformative, groundbreaking, cutting-edge, ever-evolving, ever-changing, dynamic, seamless, holistic, meticulous, remarkable, fascinating, intriguing

**Verbs — banned in figurative use:**
navigate (use literally only), foster, cultivate, leverage, embark, harness, unlock, empower, elevate, underscore, illuminate, encompass, delve, traverse

**Nouns — banned in figurative use:**
journey (use literally only — a Camino is a journey, a learning process is not), realm, landscape (figurative), tapestry, ecosystem (outside biology), wealth (of information / of knowledge), plethora, myriad, treasure trove

**Inflated formals — replace with plain word:**
- utilize → use
- facilitate → help
- commence → start
- demonstrate → show (unless "demonstrate" in a proof sense)
- numerous → many
- subsequently → later, then
- approximately → about
- in order to → to
- due to the fact that → because
- a multitude of → many
- in close proximity → near

**Marketing-buzzword adjectives — banned outright:**
game-changing, revolutionary, mind-blowing, eye-opening, life-changing, must-read, must-know, indispensable, unparalleled, world-class, next-level, state-of-the-art, world-changing

If the post needs to express that something was important, say *what changed because of it* — never use any of the above adjectives.

### 1B — Structural Blacklist

These are the patterns that betray AI authorship even after vocabulary is cleaned up. The structural patterns matter more than the vocabulary — they are the rhythm under the surface.

**Pattern 1: Contrast frames** (the most common AI tic)
- Banned: "It's not just X, it's Y."
- Banned: "Not only X, but also Y."
- Banned: "This isn't X — it's Y."
- Banned: "More than X, this is Y."
- Replacement: state directly what the thing IS, without staging the contrast.
  - ❌ "Kahneman's book isn't just psychology — it's a guide to thinking."
  - ✅ "Kahneman's book is a guide to thinking, written by a psychologist."

**Pattern 2: Forced tricolons** (rule-of-three abuse)
AI loves three-element lists even when one or two elements are sufficient. Only use three elements when all three are genuinely distinct and load-bearing.
- ❌ "It's smart, fast, and revolutionary."
- ❌ "The book is engaging, accessible, and thought-provoking."
- ✅ "The book is dense but readable."

**Pattern 3: Ta-da phrases** (the artificial pause-and-reveal)
- Banned: "Here's the thing:"
- Banned: "Here's the truth:"
- Banned: "Here's what nobody tells you:"
- Banned: "Picture this:"
- Banned: "Imagine this:"
- Banned: "Think about it:"
- Banned: "There's a catch:"
- Banned: "But here's the kicker:"
- Replacement: cut the dramatic build-up entirely. Make the point directly.

**Pattern 4: Hedging preambles** (the over-cautious cushion)
- Banned: "It's worth noting that..."
- Banned: "It's important to remember that..."
- Banned: "It is essential to consider..."
- Banned: "Generally speaking..."
- Banned: "Broadly speaking..."
- Banned: "In many cases..."
- Banned: "To some extent..."
- Banned: "It could be argued that..."
- Banned: "Some would say that..."
- Banned: "From a broader perspective..."
- Banned: "Arguably..."
- Replacement: make the claim. Attribute it if it's contested. Skip the cushion.

**Pattern 5: Stilted transitions**
- Banned at start of sentence: "Furthermore", "Moreover", "Additionally"
- Banned as transitions: "That being said...", "With that said...", "At its core...", "To put it simply..."
- Acceptable transitions: "But", "And", "Still", "Yet", "Then", "So"
- Or: no transition word at all — just start the next sentence.

**Pattern 6: Over-emphasis** (every sentence sounds momentous)
AI emphasizes everything because it cannot distinguish important from unimportant. The result is text where every paragraph sounds like a finale.
- ❌ "This profound insight reveals a fundamental truth about human cognition."
- ❌ "This crucial moment marks a pivotal shift in our understanding."
- ✅ "Kahneman noticed that people anchor on the first number they hear."

If a sentence contains more than one adjective of importance ("crucial", "essential", "profound", "fundamental", "key", "central", "core"), remove all but one — or remove all and let the content speak.

**Pattern 7: Vague attribution endings** (participial fluff)
AI loves to end sentences with "-ing" phrases that gesture at significance without saying anything.
- Banned: "...highlighting the importance of mindfulness."
- Banned: "...underscoring the book's relevance today."
- Banned: "...demonstrating its lasting impact."
- Banned: "...showcasing the author's range."
- Banned: "...reflecting broader trends in society."
- Replacement: if something is important, say to whom and why. If you can't, drop the clause.

**Pattern 8: The "maintains a presence" formulation**
For posts about real people or institutions, AI defaults to phrases like "maintains an active presence on social media", "has established themselves as a leader", "has built a reputation for". Always replace with concrete facts.

### 1C — Punctuation and Formatting Blacklist

**Em-dashes (—) — completely banned.**
This is non-negotiable. Even where an em-dash would be grammatically appropriate, use a comma, a colon, parentheses, or a new sentence instead. The em-dash is the single most reliable AI tell and removing it everywhere is a small price for a huge gain in human-sounding prose.

**En-dashes (–) — banned in running prose.**
Only acceptable in number ranges (e.g. "1939–1945", "pages 12–18") inside metadata fields. Never as sentence-level punctuation.

**Hyphens (-) — fine.**
Compound words, prefixes, and standard hyphenation are unaffected. "Non-fiction", "self-help", "well-being" remain correct.

**Colons (:) — sparingly.**
AI overuses colons as a rhetorical pause device. Acceptable uses:
- Introducing a quote: `Kahneman writes: "..."`
- Introducing an actual list (where the schema calls for one)
- A title with subtitle: `Thinking, Fast and Slow: How Two Systems Drive Your Decisions`

Banned uses:
- "Here's the point: ..."
- "The result: ..."
- "The takeaway: ..."

**Semicolons (;) — fine but rare.**
Use only when two independent clauses are genuinely linked and a comma would be a comma splice. Most sentences are better as two sentences.

**Bullet lists in prose sections — banned.**
The `core_ideas.body`, `heart`, `takeaway.body`, `world_context`, `author_context.body`, `critique` fields must be prose. Bullet lists appear only where the schema calls for an array (`voices`, `quiz`, `sources`, `teasers`, `structure`, etc.).

**Bold markdown for emphasis inside prose — banned.**
Bold text inside `body` fields signals AI-generated marketing copy. Emphasis must come from sentence construction, not formatting.

**Italics — sparingly.**
Acceptable for: book titles, foreign words, technical terms on first introduction. Never for emphasis ("This is *really* important.").

**Numbered lists in prose — banned.**
"Kahneman gives three reasons: (1) ... (2) ... (3) ..." is acceptable. "1. Reason A. 2. Reason B. 3. Reason C." inside a body field is not.

### 1D — Positive Directive (what to do instead)

Banning patterns alone produces stiff prose. The positive direction matters more.

**Write like a thoughtful non-fiction author, not like a marketer.**
Models to imitate: Steven Pinker, Yuval Harari, Carl Sagan, Brian Christian, Maria Konnikova, Daniel Kahneman himself, Atul Gawande, Oliver Sacks. Read a chapter of any of these aloud and notice the rhythm — that is the target.

**If a sentence announces something important instead of being it, cut the announcement.**
- ❌ "Kahneman's most important insight is the distinction between System 1 and System 2."
- ✅ "Kahneman distinguishes System 1 and System 2."

**If a word is rare in everyday English, replace it with the everyday one** — unless the rare word is technically precise and the everyday one is not. "Robust" is fine in statistics. "Robust framework" outside statistics is AI vocabulary.

**Vary sentence structure naturally.**
Not every sentence starts with the subject. Not every paragraph has the same rhythm. Let content drive form, not the other way around. A long sentence that unfolds a thought is fine. A short sentence that lands a point is fine. The artificial alternation "Long sentence. Short. Long again." is AI rhythm.

**Read each paragraph aloud.**
If it sounds like a LinkedIn post, rewrite. If it sounds like a TED Talk introduction, rewrite. If it sounds like a book paragraph, keep.

**Write for a concrete reader, not for "readers in general."**
The reader is curious, well-educated, fluent in English, comfortable with complex ideas, impatient with bloated language. They came here because the feed card promised substance. Deliver substance.

---

## Rule 2 — Voice and Address

The voice is **direct but not familiar**. The reader is treated as an intelligent adult who chose to be here.

**Default voice: third-person assertive.**
- "Kahneman shows that..."
- "The book argues..."
- "Research after the book's publication has called this finding into question."

**Use "you" only where it serves the content**, never as filler warmth:
- ✅ "You can apply this when negotiating a salary."  (specific application)
- ✅ "If you've ever tried to remember a phone number while driving, you've felt System 2 fail."  (specific evocation)
- ❌ "You might be surprised to learn..."  (cheap warmth)
- ❌ "You'll discover..."  (self-help register)
- ❌ "As you can see..."  (filler)

**Use "we" only in genuine shared reflection**, typically in `takeaway`:
- ✅ "We all use anchoring without realizing it."  (claim about the human condition)
- ❌ "Let's explore how..."  (filler invitation)
- ❌ "We'll see in this section that..."  (filler scaffolding)

**Never first-person from the post author.**
- ❌ "I find Kahneman's argument convincing because..."
- ❌ "In my reading of the book..."
This is editorial curation, not a personal essay. The post takes a stance, but the stance is presented as a considered judgment, not as personal opinion.

---

## Rule 3 — Sentence Rhythm

**Vary sentence length, but naturally.** Reading flow comes from variation, not from forced alternation.

**Long sentences are welcome** when they unfold a thought. A 30-word sentence that develops an argument is better than five 6-word sentences that fragment it.

**Short sentences land specific points.** A short sentence after a long one is a natural cadence. A series of short sentences is staccato — that is a different register (advertising, TikTok captions) and not appropriate for Deepscroll.

**Within any paragraph, at least two distinct sentence lengths.** A paragraph of five sentences all roughly equal in length is monotonous. So is a paragraph where every sentence is exactly long-short-long-short.

**No telegram-as-style:**
- ❌ "This matters. Here's why. The brain is lazy. It takes shortcuts. Anchoring is one."
- ✅ "This matters because the brain is lazy. It takes shortcuts, and anchoring is one of the most consistent."

**Read it aloud.** If you find yourself running out of breath in the middle of a sentence, it's too long. If you sound like a chatbot performing emphasis, it's too short.

---

## Rule 4 — Prose vs. Lists

The schema controls where lists belong. Within prose sections, prose only.

**Lists in body fields are banned.**
- `essence` — single sentence, never a list
- `heart` — prose, 4–6 sentences
- `core_ideas[].body` — prose, 3–6 sentences, never bullets inside
- `takeaway.body` — prose, even when `framing: "framework"`
- `world_context`, `author_context.body`, `critique` — prose

**Lists in their natural sections are required:**
- `voices` — array of quote objects
- `quiz` — array of question objects
- `sources` — array of source objects
- `feed_card.teasers` — array of three strings
- `structure` — array of strings (this section exists *to be* a list)

**Inline numeration in prose is fine:**
- ✅ "Kahneman gives three reasons: first, the cost of careful thinking; second, the speed of automatic responses; third, the brain's preference for coherence over accuracy."

This is structured prose, not a list. The numbers are inside the sentence.

---

## Rule 5 — Voices (Quote Selection)

The `voices` section appears right after `essence`. It is the first proof of substance. Weak quotes here destroy the post before it begins.

**Three quotes by default. Four only if all four serve distinct functions.**

**Heuristic for quote selection** — not rigid, but a useful filter:
1. **One "aha" quote** — a thesis statement that surprises in isolation. Example for Kahneman: *"Nothing in life is as important as you think it is, while you are thinking about it."*
2. **One vivid quote** — a concrete image, metaphor, or example from the book. Example: *"A reliable way to make people believe in falsehoods is frequent repetition, because familiarity is not easily distinguished from truth."*
3. **One "punch" quote** — short, elegant, memorable. Example: *"We are blind to the obvious, and we are also blind to our blindness."*

**Hard rules for quotes:**
- Each quote must work **in isolation** — no context needed
- Each quote must come **from the book** (or for People/Stories, from primary source). Goodreads-style paraphrases are not quotes.
- Length is flexible but capped at ~3 sentences. Longer passages belong in `core_ideas[].quote`.
- Attribution stays short (max ~5 words): "— on intuition", "— on framing", "— Raskolnikov to Sonya"
- No generic praise quotes ("This book changed my life"). Those signal nothing.

---

## Rule 6 — Visuals

Visuals are breathing room in long text. Too few makes the post a wall of text. Too many turns it into a slideshow.

**Target: 3–5 visuals per post**, distributed across the post.

**Required placements:**
- `feed_card.cover_url` — book cover (always)
- `takeaway.visual_svg` — if `framing: "framework"`, a diagram of the framework is required. The reader must grasp the framework at a glance.

**Recommended placements:**
- 1–2 visuals across `core_ideas` items, on the items where a model, relationship, or comparison can be diagrammed
- 1 portrait in `author_context` (Wikimedia)

**Sparing placements:**
- Other sections only when the visual carries real information, not decoration

**SVG vs. image decision:**
- Model, framework, relationship, comparison → **SVG**
- Historical scene, person, artifact, photo → **image** (Wikimedia Commons preferred for licensing)
- Book cover → Open Library

**SVG technical standard** (already in project):
- `viewBox="0 0 400 300"`, no fixed width/height
- `currentColor` for neutral elements (text, helper lines, arrows) — inherits theme
- Fixed accent color (format-specific) for highlighted elements
- No shadows, filters, gradients
- Stroke-based: stroke-width 2–2.5, `stroke-linecap="round"`, `stroke-linejoin="round"`
- Font: `system-ui, sans-serif`, weight 600–700, size 11–15
- Transparent background — no background rect

**Distribution rule:** Never two visuals back-to-back. There must be text between any two visuals.

---

## Rule 7 — Core Ideas: Headings

The `core_ideas` headings are the second-stage hook after the feed card. The reader scrolls through them and decides at each one whether to read the body. If the headings are labels, the reader skims past. If the headings are claims, the reader stops.

**Hard rule: every heading is a claim, not a label.**
- ❌ "Cognitive Biases"  (label)
- ❌ "Anchoring Effect"  (label)
- ❌ "The Power of System 1"  (buzzword + label)
- ✅ "Anchoring decides what feels reasonable"  (active claim)
- ✅ "Your intuitions about randomness are usually wrong"  (active claim)
- ✅ "We see causes where there are only patterns"  (active claim)

**Length: 4–10 words.** Longer is a subtitle. Shorter is a label.

**Format-specific variation:**
- **Non-fiction:** direct thesis ("Anchoring decides what feels reasonable.")
- **Fiction:** question, observation, or thematic claim ("Why Raskolnikov cannot confess to himself.")

**No clickbait formulations:**
- ❌ "The shocking truth about anchoring"
- ❌ "What nobody tells you about cognitive bias"
- ❌ "The one rule that will change how you think"

**The skim test:**
A reader who reads **only the headings** in order should come away with a coherent mini-summary of the book. If the headings together don't form a sketch of the argument, they are not pulling their weight.

---

## Rule 8 — Essence vs. Heart Distinction

These two sections come close together and risk redundancy. Each has a distinct job.

**`essence`** — one dense sentence. **What the book IS.**
Identity statement. Answers: "What kind of book is this and what is it about?"

Example for Kahneman:
> "A psychologist's account of the two modes of thinking that drive every judgment, and the systematic ways both fail."

**`heart`** — 4–6 sentences. **What the book SAYS.**
Central argument (non-fiction) or central question (fiction). The reader who stops here should still have the essence of the book.

Example for Kahneman:
> "Kahneman argues that the mind runs on two systems with different strengths. System 1 is fast, automatic, and shaped by evolution for survival in environments we no longer live in. System 2 is slow, effortful, and the only mode capable of correcting System 1's errors — but it tires quickly and tends to defer. Most of what feels like considered judgment is actually System 1's output dressed up. The book's project is to map where this matters and what to do about it."

**No word recycling between `essence` and `heart`.** If `essence` says "two modes", `heart` opens differently. The reader feels progress, not repetition.

---

## Rule 9 — Quiz Style

The quiz is Elo-relevant. Quiz quality is a fairness question for the entire ranking system.

**Test understanding, not trivia.**
- ❌ "In what year was Thinking, Fast and Slow published?"
- ❌ "What is Daniel Kahneman's nationality?"
- ✅ "According to Kahneman, what happens to System 2 under cognitive load?"
- ✅ "Which of the following best illustrates the anchoring effect?"

**Distractor design — every wrong option must be plausible.**
Plausible means: a reader who has skimmed but not read carefully might pick it. Implausible distractors make the question trivial and remove its Elo value.

- ❌ Question: "What is System 1?"  Options: ["fast thinking", "a software product", "a type of car", "a mathematical operator"]
- ✅ Question: "What is System 1?"  Options: ["fast automatic thinking", "deliberate effortful thinking", "the rational override system", "the part of the brain that handles language"]

The wrong answers in the second version are all things readers might confuse System 1 with — that is what makes it a real test.

**Difficulty distribution across 5–10 questions:**
- 1–2 questions: easy (anyone who read the post can answer)
- 2–3 questions: medium (require remembering specific arguments)
- 1–2 questions: hard (require synthesizing across sections)

Not all questions the same difficulty.

**Explanation field — explain the logic of the correct answer, not why others are wrong.**
- ❌ "Option A is wrong because System 1 is fast. Option B is wrong because System 2 is slow. Option C is correct because..."
- ✅ "Cognitive load depletes System 2's capacity, so System 1 takes over more decisions — this is the source of most poor judgments under fatigue."

The explanation teaches something. It does not correct.

**Question length:** short and clear. A question should be readable in two breaths.

**Format:** pure multiple choice, exactly 4 options. No "all of the above", no "none of the above". Those are lazy and easy to guess.

---

## Rule 10 — Drop-Off Points

A long post has natural points where readers leave. The post must be designed so that every such point feels like a complete mini-experience, not an abandoned lecture.

**Natural drop-off points in Books format:**
1. After `voices` — reader has three strong quotes. Mini-experience: a taste of the book.
2. After `heart` — reader has the central argument. Mini-experience: knowing what the book says.
3. After `core_ideas` — reader has the full intellectual content. Mini-experience: comprehensive understanding.
4. After `takeaway` — reader has the applicable takeaway. Mini-experience: actionable insight.
5. After `quiz` — reader has tested understanding. Mini-experience: validated learning.

**Implication for writing:**
Every section must work as an ending. No section should depend on the next section to make sense. No "in the next section we will see..." cross-references. No "but we'll get to that later." No cliffhangers.

**The reader chooses when to leave.** The post's job is to make every exit point feel earned, not interrupted.

---

## Rule 11 — Concrete Before Abstract

The reader's working memory needs an anchor before it can hold an abstraction. Every `core_ideas` section, and ideally `heart`, follows this order:

1. **Concrete instance** — a scenario, example, anecdote, or specific case
2. **Generalization** — the abstract claim or rule the instance illustrates
3. **Application or implication** — what follows from this

**Example for a core idea on Anchoring:**

❌ Abstract-first version:
> "Anchoring is a cognitive bias where initial information disproportionately influences subsequent judgments. People rely too heavily on the first piece of information they receive when making decisions. This has implications across many domains including negotiation, pricing, and clinical judgment."

✅ Concrete-first version:
> "Spin a wheel that lands on 65, then ask people what percentage of African countries are in the UN. Their average answer is 45 percent. Spin the wheel to 10, ask again, and the average drops to 25. The number on the wheel has no logical bearing on the question, but it sets the mental ceiling — this is anchoring. It explains why first offers in negotiation matter disproportionately, and why list prices work even when nobody pays them."

The second version teaches the same idea, but the reader's brain has somewhere to put it.

---

## Rule 12 — Stance Without Hedging

Style Rule 7 in the existing document says "no Wikipedia hedging." Here is the operational version.

**Make claims with attribution. Do not hedge in vague third person.**

Banned formulations:
- "Some scholars argue that..."
- "It is often said that..."
- "Research has shown..."  (without specific citation)
- "Many believe that..."
- "There is some debate over..."
- "It could be argued..."
- "Perhaps", "possibly", "arguably" as hedging markers

**When something is uncontested, state it.**
- ✅ "Kahneman shows that anchoring affects expert judgment as much as novice judgment."

**When something is contested, name the camps.**
- ❌ "Some have criticized the book's findings on priming."
- ✅ "After 2012, several priming studies including Kahneman's example of the 'Florida effect' failed to replicate. Kahneman himself publicly acknowledged this in 2017."

**When something is uncertain, attribute the uncertainty.**
- ❌ "It may be the case that..."
- ✅ "Kahneman speculates, without empirical support, that..."

The general principle: **a sentence makes a claim or quotes someone making one.** Sentences that hedge in unattributed third person are filler.

---

## How to use this document

When generating a Deepscroll post — especially a benchmark example — keep all 12 rules in mind throughout. The most common failure modes, in order of frequency:

1. **AI fingerprints sneak in** — em-dashes, contrast frames, hedging, banned vocabulary
2. **Headings become labels** — generic category names instead of claims
3. **Quotes are weak** — generic praise instead of substantive thesis quotes
4. **Quiz is trivia** — year-and-place questions instead of comprehension
5. **Sentence rhythm is uniform** — either all long or all short
6. **Drop-off points are cliffhangers** — sections depend on what follows

Before submitting any generated post, run the **AI-tell check**:
- [ ] Zero em-dashes
- [ ] Zero contrast-frame sentences
- [ ] Zero banned vocabulary words
- [ ] Zero hedging preambles
- [ ] Zero "ta-da" phrases
- [ ] At least three distinct visuals distributed across the post
- [ ] Headings are claims, not labels
- [ ] Quiz tests understanding, has plausible distractors

If any check fails, revise the relevant section before output.

---

*This is the long-form reference version. The per-format prompts in `DEEPSCROLL_CONTENT_STRUCTURE.md` will reference compressed versions of these rules. Always consult this document when ambiguity arises or when generating a benchmark example.*
