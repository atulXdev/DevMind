================================================================================
CONTINUUM
"The AI That Actually Remembers What Works."
FINAL HACKATHON PRODUCT REQUIREMENTS DOCUMENT (PRD)
================================================================================

Document status: Final specification for implementation
Audience: AI coding agents (Claude Code, Cursor, Antigravity, Devin, OpenHands)
           and human engineers building the hackathon submission
Format: Plain text specification. No code, no pseudocode, no SQL, no JSON,
        no YAML. Descriptions only, sufficient for an implementer to build
        the system without further clarification.

================================================================================
TABLE OF CONTENTS
================================================================================
1.  Executive Summary and Product Vision
2.  Problem Statement
3.  Solution Overview
4.  Goals and Non-Goals
5.  Sponsor Technology Mandate (Hindsight and CascadeFlow)
6.  Scope Boundaries and Explicitly Removed Features
7.  System Architecture
8.  Core Module 1: GitHub App
9.  Core Module 2: Autonomous Incident Investigation Engine
10. Core Module 3: Hindsight Memory Engine
11. Core Module 4: CascadeFlow Routing Engine
12. Core Module 5: Verification Engine
13. Core Module 6: Engineering Dashboard
14. Feature Specifications (all required features, full definitions)
15. Hindsight Deep Dive
16. CascadeFlow Deep Dive
17. Dashboard Specification
18. Security Specification
19. Deployment and Infrastructure (free tier)
20. Demo Flow and Script
21. Judge Questions and Answers (approximately 30)
22. Appendix: Glossary and Data Entities (descriptive, non-technical)

================================================================================
1. EXECUTIVE SUMMARY AND PRODUCT VISION
================================================================================

Continuum is a Verified Engineering Memory Platform. It is not a code review
bot, not a linting tool, and not a generic "AI assistant bolted onto GitHub."
Continuum's core innovation is that it treats engineering knowledge as a
living, evolving asset that must be earned through verification rather than
assumed through inference.

Every day, engineering teams solve the same categories of problems over and
over. A flaky test gets fixed on Monday. The same flaky pattern reappears in
a different service on Thursday. A junior engineer spends three hours
debugging a null-pointer issue that a senior engineer solved in ten minutes
six months ago, in a pull request nobody remembers. Traditional AI code
review tools are stateless: they read a diff, generate a comment, and forget
everything the moment the request completes. They have no memory of what
actually worked. They cannot distinguish between a fix that was suggested
and a fix that was proven. This is the fundamental limitation Continuum is
built to solve.

Continuum operates as a GitHub App that installs directly onto a repository.
It listens for signals of engineering distress -- primarily continuous
integration (CI) failures -- and responds not with a shallow, one-shot
suggestion, but with a full investigation lifecycle. It searches its own
memory store for prior verified incidents that resemble the current one. It
routes its reasoning through a tiered model architecture that balances cost
and capability using confidence scoring. It proposes a fix. And critically,
it does not trust its own fix until the repository's own continuous
integration pipeline confirms that the fix actually resolves the failure.
Only after this independent, external verification does the fix get written
back into memory as a trusted, reusable pattern.

This creates a compounding advantage that is the heart of Continuum's pitch:
the system gets measurably smarter over time, and that intelligence is
never speculative. Every memory in Continuum's store carries a verification
status. Judges, users, and engineers can trace any suggested fix back to the
exact prior incident that informed it, see the confidence score that
produced the model routing decision, and see the GitHub Actions run that
proved the fix worked. Nothing in Continuum's memory is "probably right."
Everything is either unverified (a hypothesis) or verified (a proven
outcome), and the system is explicit about which is which at every step of
the user experience.

Continuum is built on top of two sponsor technologies that are not
peripheral integrations but load-bearing architectural pillars. Hindsight
provides the persistent memory substrate: it is where investigations,
incidents, fixes, and their verification outcomes live, and it is what
allows Continuum to recall relevant precedent instead of reasoning from a
blank slate every time. CascadeFlow provides the reasoning orchestration
layer: it decides, incident by incident, whether a cheap and fast model is
sufficient to handle the investigation or whether the complexity and risk
of the situation warrants escalation to a more capable and more expensive
model. CascadeFlow's confidence-based escalation is also what makes
Continuum's decisions explainable -- every routing decision comes with a
stated reason, visible to the user, rather than being a hidden internal
implementation detail.

The product is designed to be demonstrated live, end to end, in under five
minutes. A judge installs the GitHub App on a sample repository, pushes a
deliberately broken commit, and watches Continuum detect the CI failure,
search its memory, route its reasoning, propose a fix, trigger a real
verification run through the repository's own GitHub Actions, and update
its dashboard and memory store in real time as the fix is confirmed. The
entire lifecycle is visible, inspectable, and grounded in real GitHub
infrastructure rather than a simulated demo environment. This is the
central design philosophy of Continuum: everything shown to a judge must be
real, verifiable, and reproducible on the judge's own repository, not a
pre-recorded illusion.

Continuum's long-term vision, beyond the hackathon, is to become the
default "engineering memory layer" that sits underneath any AI coding tool.
Where a code-generation assistant answers "what should I write right now,"
Continuum answers a different and complementary question: "what has
actually worked before, and how confident should we be in trying it again."
This positions Continuum not as a competitor to existing AI coding
assistants, but as an infrastructure layer they could eventually consume --
a verified, evolving memory of what has been proven to work in this
specific codebase, by this specific team, under this specific CI process.

For the hackathon submission, the vision is deliberately scoped down to a
single, coherent, demonstrable slice of that larger idea: CI failure
investigation, memory-informed fix suggestion, and GitHub-Actions-based
verification, wrapped in a single beautiful dashboard that makes the
system's reasoning and memory visible to a human. Everything else described
in this document exists in service of making that slice as impressive,
credible, and technically substantive as possible within the constraints of
free-tier infrastructure and a hackathon timeline.

--------------------------------------------------------------------------------
1.1 Why This Product Wins
--------------------------------------------------------------------------------

Hackathon judges evaluate submissions along a fairly predictable set of
axes: technical depth, sponsor technology usage, originality, polish, and
demo impact. Continuum is deliberately engineered to score well on all five
simultaneously, and the reasoning is worth stating explicitly because it
should guide every implementation decision made from this PRD.

Technical depth is established by the fact that Continuum is not a single
API call wrapped in a chat interface. It is a multi-stage pipeline: webhook
ingestion, investigation orchestration, memory retrieval, confidence-scored
model routing, fix generation, independent verification via a second,
separate system (GitHub Actions), and memory mutation based on verified
outcomes. Each of these stages is a real engineering problem with real
failure modes, and this PRD specifies handling for all of them.

Sponsor technology usage is established by making Hindsight and CascadeFlow
non-optional, load-bearing components. If either sponsor technology were
removed from Continuum, the product would not function -- Hindsight's
removal eliminates memory (there would be nothing to search, nothing to
verify, nothing to compound), and CascadeFlow's removal eliminates
intelligent routing (there would be no confidence scoring, no cost
optimization, no explainability of "why this model, why this level of
reasoning"). This is the standard this document holds every feature to:
sponsor technologies must be structurally necessary, not decorative.

Originality is established by the verification-gated memory model itself.
Many hackathon projects claim "AI that learns your codebase." Very few
gate that learning behind independent, automated, external proof. Continuum's
insistence that a memory only becomes "verified" after a real GitHub
Actions run confirms the fix is a genuinely novel design decision that
differentiates it from every "AI reviews your PR" clone that will appear at
any given hackathon.

Polish is established by the single, unified Engineering Dashboard
specified in Section 13 and Section 17, which gives judges one visual home
for the entire incident lifecycle: the current incident, the timeline of
investigation steps, the memories that were recalled and how similar they
were, the routing decision and its explanation, the verification status,
and a running counter of cost saved through intelligent routing.

Demo impact is established by the demo flow in Section 20, which is
designed around a single narrative arc: break something, watch it get
fixed, watch the system prove the fix, watch the system remember. This arc
is simple enough for a judge to follow in a noisy demo hall and impressive
enough to be memorable after they have seen twenty other pitches.

--------------------------------------------------------------------------------
1.2 What Continuum Is Not
--------------------------------------------------------------------------------

Because "AI code reviewer" is an extremely crowded category, this PRD is
explicit and repeated throughout about what Continuum deliberately avoids
becoming, so that implementers do not drift the scope back toward a generic
PR-commenting bot.

Continuum is not a static analysis tool. It does not run linters or
security scanners as its primary function, although its investigation
engine may reference lint or scanner output if present in CI logs as
supporting evidence.

Continuum is not a general-purpose chatbot embedded in pull requests. It
does not answer arbitrary developer questions unrelated to an active
incident. Its surface area is intentionally narrow: CI failures, their
investigation, their remediation, and their verified memory.

Continuum is not a code execution sandbox. Continuum's own servers never
execute the repository owner's code. All verification of a proposed fix
happens exclusively through the repository owner's own GitHub Actions
workflows, triggered through standard GitHub mechanisms (a pushed commit or
an opened pull request), never through arbitrary code execution on
Continuum's infrastructure. This is both a security requirement and a trust
requirement: judges and future users must be able to trust that Continuum
never runs unknown code on infrastructure it controls, and never has the
opportunity to disguise a fabricated "verification passed" result, because
the verification is always an independently observable GitHub Actions run
that anyone with repository access can inspect.

Continuum is not an enterprise SaaS product for this submission. There is
no billing, no multi-tenant organization management, no admin console, no
SSO, and no compliance certification story. Section 6 enumerates the full
list of removed features and the rationale for each removal.

================================================================================
2. PROBLEM STATEMENT
================================================================================

--------------------------------------------------------------------------------
2.1 The Core Problem: Engineering Knowledge Is Lost, Not Compounded
--------------------------------------------------------------------------------

Every software team accumulates tribal knowledge about the specific,
idiosyncratic ways their codebase breaks. A particular test suite is known
to be flaky under high parallelism. A particular dependency has a version
range that silently breaks a build step. A particular deployment
configuration causes a specific class of runtime error under specific
conditions. This knowledge typically lives in one of three places: inside
the heads of a small number of senior engineers, scattered across old pull
request comments that are never searched again, or nowhere at all, forcing
the same investigation to be repeated from scratch.

AI coding assistants, including the most capable large language models
available today, do not solve this problem, because they are fundamentally
stateless with respect to any individual codebase's history. Each
invocation begins from the same prior: general programming knowledge, plus
whatever context happens to be included in that specific prompt. There is
no mechanism by which "we solved this exact class of problem three weeks
ago, and here is exactly what worked" becomes part of the assistant's
starting context automatically, without a human manually finding and
pasting in that prior context.

--------------------------------------------------------------------------------
2.2 The Trust Problem: AI Suggestions Are Indistinguishable From AI Guesses
--------------------------------------------------------------------------------

A second, related problem is that existing AI code review and suggestion
tools do not distinguish between a fix that is plausible and a fix that is
proven. A suggestion generated by a language model reading a diff is, from
the tool's own perspective, exactly as confident-sounding whether it is
correct or not. Engineers who have used these tools for any length of time
develop a justified skepticism: every suggestion must be manually verified
by a human before it can be trusted, which significantly reduces the time
savings the tool was meant to provide in the first place.

This creates an adoption ceiling. Teams will not allow an automated system
to make unsupervised changes to their codebase, and reasonably so, if the
system has no mechanism for proving its own suggestions correct before
asking for trust. Any credible solution to this problem needs an
independent, external, automated verification step that happens before a
fix is presented as reliable, not just a confident-sounding explanation
from the model itself.

--------------------------------------------------------------------------------
2.3 The Cost Problem: Uniform Model Usage Is Wasteful
--------------------------------------------------------------------------------

Third, most AI coding tools apply a uniform level of model capability to
every request, regardless of the actual complexity or risk of the
situation. A one-line typo in a test assertion and a subtle race condition
in a distributed system's retry logic are handled by exactly the same
model, at exactly the same cost, with exactly the same latency. This is
economically wasteful at scale, and it also means teams cannot see or
reason about why a particular level of AI effort was applied to a
particular problem, because the decision, if it exists at all, is invisible
to them.

--------------------------------------------------------------------------------
2.4 The Composite Problem Continuum Solves
--------------------------------------------------------------------------------

Continuum is built to solve these three problems together, because they
are deeply linked. Persistent, verified memory (solving problem one) is
what makes trustworthy suggestions possible (solving problem two), because
a suggestion informed by a previously verified fix for a similar incident
is categorically more trustworthy than a suggestion generated from a blank
context window. And a system with verified memory can also make
intelligent, explainable decisions about how much reasoning effort a given
incident actually requires (solving problem three), because a strong
memory match against a previously verified fix is itself evidence that a
cheaper, faster model is likely sufficient, while a weak or absent memory
match is evidence that the situation is novel and may warrant escalation
to a more capable model.

This is the throughline that must be preserved in every part of the
implementation: memory quality informs routing confidence, routing
confidence informs how a fix is generated, and verification outcomes flow
back to improve memory quality. The three systems described in this
document -- Hindsight-backed memory, CascadeFlow-backed routing, and
GitHub-Actions-backed verification -- are not three independent features.
They are three stages of a single feedback loop, and the PRD should be read
with that loop always in mind.

================================================================================
3. SOLUTION OVERVIEW
================================================================================

--------------------------------------------------------------------------------
3.1 The Continuum Loop
--------------------------------------------------------------------------------

At the highest level, Continuum operates a repeating cycle referred to
throughout this document as the Continuum Loop. The loop has six stages.

Stage one is detection. Continuum's GitHub App receives a webhook event
indicating that a continuous integration run associated with an installed
repository has failed. This is the trigger for everything that follows.

Stage two is recall. Before generating any new reasoning, Continuum's
Incident Investigation Engine queries the Hindsight Memory Engine for prior
incidents that resemble the current failure, using signals such as the
failing workflow name, the failing step, the error signature extracted from
logs, and the files implicated in the associated commit or pull request.

Stage three is routing. The CascadeFlow Routing Engine evaluates the
incident, incorporating the strength and relevance of the memory matches
found in stage two, the apparent complexity of the failure, and whether the
affected files fall into a designated high-risk category. Based on this
evaluation, CascadeFlow assigns a confidence score and decides whether a
fast, inexpensive model is sufficient to generate the investigation and
fix, or whether the incident should be escalated to a more capable model.

Stage four is investigation and fix generation. Using the model tier
selected in stage three, and grounded in both the raw CI failure evidence
and any relevant memories recalled in stage two, Continuum's Investigation
Engine produces a diagnosis of the root cause and a proposed code change
intended to resolve it.

Stage five is verification. Continuum never presents its own confidence as
proof. The proposed fix is applied as a commit, either directly to a branch
or as part of a pull request depending on the repository's configured
mode, and the repository's own GitHub Actions workflows are triggered
through standard GitHub mechanisms. Continuum then observes the outcome of
that run through the GitHub Checks API. If the workflow passes, the fix is
considered verified. If it fails, Continuum may attempt a bounded number of
additional iterations, described in Section 9, before surfacing the
incident to a human as unresolved.

Stage six is memory evolution. Verified outcomes are written back into
Hindsight as trusted memories, carrying full provenance: the original
incident signature, the diagnosis, the fix, the verification run, and a
link back to the memories that were recalled and used to inform the fix in
the first place, creating a traceable lineage of engineering knowledge.
Unverified attempts are also recorded, but are marked explicitly as
unverified and are down-weighted in future recall so that Continuum does
not confidently repeat an approach that has already failed.

--------------------------------------------------------------------------------
3.2 Why Each Stage Requires a Sponsor Technology
--------------------------------------------------------------------------------

Stage two (recall) and stage six (memory evolution) are impossible without
a persistent, queryable, structured memory store, which is precisely the
role Hindsight plays in this architecture. A conventional database could
technically store records, but Hindsight is specifically designed for the
kind of semantic, relationship-aware memory retrieval and evolution that
Continuum's recall step depends on -- finding not just exact matches but
conceptually similar prior incidents, and understanding how a given memory
relates to others (for example, "this incident is a recurrence of that
incident" or "this fix superseded an earlier, less reliable fix for the
same class of problem").

Stage three (routing) is impossible without a system designed specifically
for confidence-based model orchestration, which is precisely the role
CascadeFlow plays. Continuum does not want to hand-roll a brittle if-else
ladder for deciding which model to use; it wants a principled, explainable,
confidence-scored escalation path, with cost tracking built in, which is
the exact problem CascadeFlow exists to solve.

--------------------------------------------------------------------------------
3.3 User-Facing Summary
--------------------------------------------------------------------------------

From the perspective of a repository owner, using Continuum looks like
this. They install the Continuum GitHub App on one or more repositories,
granting a narrow, explicitly scoped set of permissions. From that point
forward, whenever a CI run fails on a tracked branch or pull request,
Continuum automatically begins an investigation, visible in real time on
the Continuum dashboard and, optionally, as a status comment on the
associated pull request. Within a short time -- typically under two minutes
for the model reasoning stages, plus however long the repository's own CI
takes to run for verification -- Continuum either produces a verified fix,
complete with a badge on the pull request confirming that the fix passed
the repository's own tests, or it surfaces a clear, explainable summary of
what it tried, why it was not confident enough to keep iterating, and what
a human should look at next. Over time, as more incidents are verified, the
repository owner sees a growing library of trusted, reusable engineering
memory specific to their own codebase, visible and searchable through the
dashboard.

================================================================================
4. GOALS AND NON-GOALS
================================================================================

--------------------------------------------------------------------------------
4.1 Goals
--------------------------------------------------------------------------------

The implementation must satisfy the following goals, in priority order.

Goal one: win the hackathon. Every design decision in this document should
be evaluated against whether it increases the probability of winning,
which in practice means prioritizing a small number of features executed
with real depth over a large number of features executed shallowly.

Goal two: demonstrate meaningful, structurally necessary usage of both
Hindsight and CascadeFlow, as described in Section 5.

Goal three: be deployable entirely on free infrastructure tiers, as
described in Section 19, so that the submission can be judged, reproduced,
and kept running after the hackathon without incurring cost.

Goal four: allow judges to install Continuum on their own GitHub
repositories and reproduce the demo flow independently, without requiring
the original team to be present or to manually configure anything on the
judge's behalf.

Goal five: have a memorable, coherent live demo, structured around the
single narrative arc described in Section 20.

Goal six: look and feel like a real startup minimum viable product, not a
prototype held together with visible seams. This governs the visual and
interaction design of the dashboard described in Sections 13 and 17.

Goal seven: be secure by construction, particularly with respect to GitHub
permissions scoping, secret handling, and the strict rule that Continuum's
own infrastructure never executes repository code, as described in Section
18.

Goal eight: be explainable at every decision point. A user or judge should
never have to take Continuum's word for why it did something; the routing
decision, the memory matches, and the verification outcome should always
be visible and inspectable.

Goal nine: be production-oriented in its design, even though the
hackathon build will necessarily be a scoped-down slice of the larger
vision. Architectural decisions should not paint the team into a corner
that would make a genuine production version of Continuum implausible.

--------------------------------------------------------------------------------
4.2 Non-Goals
--------------------------------------------------------------------------------

The following are explicitly out of scope for the hackathon submission and
should not be implemented, even if they seem like natural extensions.
Section 6 provides fuller detail and rationale for each.

Non-goal: supporting organizations, teams, or multi-tenant billing of any
kind.

Non-goal: integrating with chat platforms such as Slack or Microsoft
Teams.

Non-goal: building a public marketplace or plugin ecosystem.

Non-goal: enterprise single sign-on or any authentication method beyond
standard GitHub OAuth.

Non-goal: sharing memory across organizations or repositories that do not
belong to the same installing user, beyond the single-repository or
single-account scope described in Section 10.

Non-goal: any form of "trust decay" mechanic where verified memories
automatically lose trust over time absent new evidence. Trust changes only
in response to new verification outcomes, not the passage of time, in
order to keep the trust model simple, explainable, and demonstrable within
a hackathon's time horizon.

Non-goal: leaderboards, gamification, or social features of any kind.

Non-goal: payment processing or any monetization mechanism.

Non-goal: an administrative panel for managing other users' accounts.

Non-goal: formal compliance certifications such as SOC 2, or any
compliance documentation beyond the security practices described in
Section 18.

================================================================================
5. SPONSOR TECHNOLOGY MANDATE (HINDSIGHT AND CASCADEFLOW)
================================================================================

--------------------------------------------------------------------------------
5.1 Guiding Principle
--------------------------------------------------------------------------------

Both sponsor technologies must be integrated in a way that is structurally
necessary to Continuum's core function, not layered on as an afterthought
to satisfy a hackathon requirement. The test every implementer should apply
before writing any component is: "if I removed this sponsor technology,
would Continuum stop being able to do the thing it claims to do?" If the
answer is no, the integration is decorative and must be redesigned. This
section defines exactly how each technology is load-bearing, and Sections
15 and 16 provide the full technical deep dives.

--------------------------------------------------------------------------------
5.2 Hindsight as the Memory Substrate
--------------------------------------------------------------------------------

Hindsight is the persistent store for every unit of engineering memory
Continuum produces. Without Hindsight, Continuum has no way to recall a
prior incident, no way to know whether a similar problem has been seen
before, no way to distinguish a verified fix from a first attempt, and no
way to build the compounding-intelligence story that is the entire premise
of the product. Concretely, Hindsight is used for the following
responsibilities, each detailed further in Section 15.

Persistent engineering memory: every investigated incident, whether
ultimately verified or not, is written into Hindsight as a memory record,
so that the system's institutional knowledge survives beyond any single
investigation session and beyond any single server process.

Memory retrieval: at the start of every new investigation, before any new
reasoning is generated, Continuum queries Hindsight for memories relevant
to the current incident, using a combination of structured signals (for
example, workflow name, failing file paths) and semantic similarity over
the natural-language description of the failure.

Memory updates: when a fix is verified, the corresponding memory record is
updated in place to reflect its new, higher-trust status, rather than
being treated as a brand-new, disconnected record, preserving a single
coherent history for that class of incident.

Knowledge storage: beyond raw incident and fix data, Hindsight stores the
structured diagnosis produced by the Investigation Engine, so that future
recalls surface not just "here is a similar past incident" but "here is
the specific reasoning that explained it."

Memory evolution: as more incidents of a similar type are verified,
Hindsight allows Continuum to strengthen a given memory's confidence and,
where applicable, supersede an older, less reliable fix with a newer,
better-verified one, while preserving the historical lineage.

Verified incident history: Hindsight maintains the authoritative,
queryable record of which incidents have been verified, which are
unverified hypotheses, and which were verified but later superseded,
directly powering the dashboard's Verified Memories widget described in
Section 17.

Relationship mapping: Hindsight is used to represent relationships between
memories -- for example, that two incidents in different files were both
instances of the same underlying misconfiguration, or that a given fix was
derived from and supersedes an earlier fix -- which is what allows
Continuum's investigation reasoning to surface not just isolated facts but
connected engineering context.

--------------------------------------------------------------------------------
5.3 CascadeFlow as the Reasoning Orchestrator
--------------------------------------------------------------------------------

CascadeFlow is the layer responsible for deciding how much reasoning
capability a given incident actually deserves, and for making that
decision transparent. Without CascadeFlow, Continuum would either have to
hard-code a single model tier for every incident, wasting cost on trivial
issues and under-provisioning capability for hard ones, or implement its
own bespoke, unexplainable routing logic. Concretely, CascadeFlow is used
for the following responsibilities, each detailed further in Section 16.

Model routing: CascadeFlow selects which model tier handles a given
investigation, from a small set of tiers ranging from a fast, inexpensive
model suitable for well-understood, well-matched incidents, up to a more
capable, more expensive model reserved for novel or high-risk situations.

Confidence-based escalation: CascadeFlow does not make a single, one-shot
routing decision. It begins with the fastest, cheapest tier by default,
evaluates the confidence of the resulting diagnosis, and escalates to a
more capable tier when confidence falls below a defined threshold, up to a
bounded maximum number of escalations.

Cost optimization: because most incidents, once a mature memory store
exists, will match strongly against previously verified fixes, CascadeFlow
is expected to route the majority of investigations to the cheap tier over
time, and the dashboard's Cost Savings widget, described in Section 17,
makes this optimization visible and quantifiable.

Reasoning orchestration: CascadeFlow governs not just which model answers,
but the shape of the investigation pipeline itself -- for example,
deciding whether a memory match is strong enough to skip a full
from-scratch diagnosis and instead adapt a previously verified fix
directly, versus requiring the Investigation Engine to reason from first
principles.

Decision explainability: every CascadeFlow routing decision produces a
human-readable explanation -- naming the confidence score, the memory
match strength that informed it, and whether the affected files fall into
a high-risk category -- which is surfaced directly in the dashboard's
Routing Decision widget, described in Section 17, and is never hidden as
an internal implementation detail.

--------------------------------------------------------------------------------
5.4 Integration Depth Requirement
--------------------------------------------------------------------------------

Implementers must ensure that Hindsight and CascadeFlow are wired directly
into the Incident Investigation Engine's control flow, not called
optionally or as a post-hoc enrichment step. Specifically: no investigation
may begin generating a fix before a Hindsight memory query has completed
and been incorporated into the CascadeFlow routing decision, and no fix may
be written back to memory without an explicit verification outcome
attached. This ordering is not an implementation detail; it is the
structural guarantee that makes Continuum's core claim -- "only verified
outcomes become trusted memory, and every routing decision is informed by
memory" -- actually true rather than aspirational.

================================================================================
6. SCOPE BOUNDARIES AND EXPLICITLY REMOVED FEATURES
================================================================================

This section exists so that implementers, including AI coding agents
generating large amounts of code quickly, have an explicit, low-ambiguity
list of things not to build, even if they seem like natural or "obviously
useful" additions. Scope discipline is itself a hackathon-winning strategy:
a small number of deeply implemented, sponsor-technology-grounded features
will consistently beat a larger number of shallow features.

Organization billing is removed. Continuum's hackathon scope is limited to
individual GitHub accounts installing the app on their own repositories.
There is no concept of an organization entity, no seat-based pricing, and
no invoicing.

Slack and Teams integrations are removed. All notifications and status
updates happen through the GitHub Checks API, pull request comments, and
the Continuum dashboard. No chat platform integration should be built.

A marketplace is removed. Continuum is not distributed through a plugin or
extension marketplace for this submission; installation happens directly
through the GitHub App installation flow described in Section 8.

Enterprise SSO is removed. The only supported authentication method is
standard GitHub OAuth, as described in Section 8 and Section 18.

Cross-organization memory sharing is removed. Memory scope is limited to
the installing GitHub account (or, if the account is later extended to
organizations, to that single organization) and does not span multiple,
unrelated accounts.

Trust decay is removed. As stated in Section 4.2, a verified memory's
trust does not degrade purely due to elapsed time. Trust only changes in
response to new, explicit verification evidence, described fully in
Section 15.

Leaderboards are removed. There is no cross-user or cross-repository
ranking, competitive scoring, or social comparison feature of any kind.

Complex SaaS features in general are removed, including but not limited to
usage quotas, tiered subscription plans, and in-app upgrade flows.

Payment systems are removed entirely. Continuum does not process, store,
or reference any payment information.

Admin panels are removed. There is no separate administrative interface
for managing other users, repositories, or system configuration beyond
what a single installing user needs to manage their own installation.

Multi-tenant billing is removed, for the same reasons as organization
billing above.

Large-scale analytics are removed. The dashboard described in Sections 13
and 17 shows Continuum's own operational metrics (incident counts, cost
savings, verification rates) relevant to a single installation, not a
general-purpose analytics or business intelligence product.

SOC 2 and other compliance frameworks are removed. Section 18 describes
real, meaningful security practices, but no formal compliance
certification process, documentation package, or audit engagement is in
scope.

Implementers should treat any feature request that resembles the above
list, even if phrased differently, as out of scope, and should redirect
effort toward deepening the six core modules and the required feature list
in Section 14 instead.

================================================================================
7. SYSTEM ARCHITECTURE
================================================================================

--------------------------------------------------------------------------------
7.1 High-Level Component Map
--------------------------------------------------------------------------------

Continuum is composed of the following logical components, each of which
maps to one of the six core modules named in the introduction and detailed
in Sections 8 through 13.

The GitHub App is the entry point and identity layer. It is registered as
a GitHub App (not a legacy OAuth-only application), which grants it
narrowly scoped, repository-level permissions and the ability to receive
webhook events. It handles installation, authentication of the installing
user, and receipt of GitHub webhook events for push, pull request, and
check run/check suite activity.

The Backend Service is a single deployed service (described in deployment
terms in Section 19) that hosts the webhook receiver, the Incident
Investigation Engine, the integration logic for Hindsight and CascadeFlow,
the Verification Engine's orchestration logic, and the API consumed by the
dashboard frontend.

The Hindsight Memory Engine is a self-hosted Hindsight instance (or
Hindsight accessed through its provided service interface, depending on
what the sponsor technology offers at hackathon time) that the Backend
Service calls into for all memory read and write operations. It is treated
architecturally as an external system with a defined interface, not as an
in-process library, so that the memory store's persistence is independent
of the Backend Service's own lifecycle.

The CascadeFlow Routing Engine is similarly treated as an external
reasoning-orchestration system that the Backend Service calls into
whenever a routing decision is needed, passing in the incident context and
receiving back a selected model tier, a confidence score, and an
explanation string.

The Verification Engine is a set of responsibilities within the Backend
Service (not a separate deployed service) responsible for committing a
proposed fix, triggering the repository owner's own GitHub Actions through
standard GitHub mechanisms, polling or receiving webhook notification of
the resulting check run status, and interpreting the outcome as either a
verification pass, a verification failure warranting another iteration, or
an exhausted-attempts state requiring human escalation.

The Database (Supabase Postgres, per Section 19) stores Continuum's own
operational and relational data that does not belong inside Hindsight's
memory model: installations, users, repository configuration, incident
records (as the system-of-record row, with memory content itself living in
Hindsight), verification run references, and dashboard-facing aggregates
such as running cost savings totals.

The Dashboard Frontend is a web application (deployed per Section 19) that
authenticates the installing user via GitHub OAuth, and renders the
real-time state of incidents, memory, routing decisions, verification
status, and cost savings, as specified fully in Sections 13 and 17.

--------------------------------------------------------------------------------
7.2 Component Interaction Principles
--------------------------------------------------------------------------------

Three principles govern how these components interact, and implementers
should treat violations of these principles as architectural defects even
if the resulting code happens to function.

First, GitHub is always the source of truth for code and for verification.
Continuum never maintains its own independent copy of "what the correct
code should be" outside of what it proposes as a commit or pull request
through the GitHub API, and it never fabricates or infers a verification
result; it only reports what the GitHub Checks API actually returned for a
real workflow run.

Second, Hindsight is always consulted before new reasoning is generated,
and always updated after a verification outcome is known. No investigation
path skips memory recall, and no verified or failed fix goes unrecorded.

Third, CascadeFlow's routing decision is always made using the memory
recall results as an input, and the decision, once made, is always
recorded with its explanation before the selected model is invoked, so
that the explanation can never be reconstructed after the fact in a way
that might not faithfully represent the actual decision process.

--------------------------------------------------------------------------------
7.3 Request Lifecycle
--------------------------------------------------------------------------------

A request lifecycle, in this document, refers to the path of a single
inbound webhook event through the Backend Service. When GitHub delivers a
webhook event to Continuum's registered endpoint, the Backend Service first
validates the event's authenticity using the shared webhook secret
configured at GitHub App registration time, rejecting any event that
cannot be validated. It then identifies which installation and repository
the event belongs to, using the installation ID embedded in the webhook
payload, and loads that repository's Continuum configuration from the
Database. If the event type is not one Continuum acts on (only check
suite/check run completion events with a failure conclusion, and
relevant push/pull request events needed for context, are acted on), the
event is acknowledged and discarded without further processing. If the
event does represent a CI failure on a tracked branch or pull request, the
Backend Service creates a new Incident record in the Database and enqueues
the Incident Lifecycle described next.

--------------------------------------------------------------------------------
7.4 Incident Lifecycle
--------------------------------------------------------------------------------

The Incident Lifecycle is the detailed version of the Continuum Loop
introduced in Section 3.1, described here at implementation-relevant
granularity.

Upon creation, an Incident record moves through a defined sequence of
states: Detected, Investigating, MemoryMatched, Routed, FixProposed,
Verifying, Verified, VerificationFailed, Escalated, and Resolved (or
Abandoned, if the bounded retry budget described in Section 9 is
exhausted without success). Every state transition is timestamped and
written to the Database, and the sequence of transitions is what powers
the dashboard's Incident Timeline widget described in Section 17.

In the Detected state, the Backend Service has recorded that a CI failure
occurred and has captured the relevant CI log output, the failing workflow
and step names, the commit SHA, and the list of files changed in the
triggering commit or pull request.

In the Investigating state, the Investigation Engine (Section 9) begins
processing: it extracts a normalized error signature from the raw CI logs
(for example, isolating the specific exception type and message, or the
specific assertion failure, from surrounding noise), which becomes the
primary key used for memory search.

In the MemoryMatched state, the Hindsight Memory Engine has been queried
using the error signature, the failing file paths, and a natural-language
summary of the failure, and has returned a ranked list of candidate prior
memories, each carrying a similarity score and a verification status.

In the Routed state, CascadeFlow has consumed the memory match results
along with the incident's characteristics and has returned a selected
model tier, a confidence score, and an explanation, all of which are
persisted against the Incident record.

In the FixProposed state, the Investigation Engine, using the model tier
selected by CascadeFlow, has produced a root-cause diagnosis and a
concrete proposed code change, and has committed that change either
directly (for a push-triggered incident on a branch Continuum is
configured to write to) or as a new pull request (the default and
recommended mode, described further in Section 9).

In the Verifying state, the Verification Engine has confirmed that the
repository's own GitHub Actions workflows have started running against the
proposed fix, and is awaiting their outcome.

In the Verified state, the workflows completed successfully, and the
Verification Engine has triggered the memory write-back described in
Section 15, marking the associated memory as verified and attaching the
verification run as evidence.

In the VerificationFailed state, the workflows completed with a failure,
and depending on the remaining retry budget, the Incident either returns
to the Investigating state for another bounded attempt (informed by the
new failure information) or transitions to Escalated.

In the Escalated state, Continuum has exhausted its bounded retry budget
without producing a verified fix, and surfaces this clearly to the user
through the dashboard and, if configured, a pull request comment
explaining what was tried and why it stopped, rather than silently failing
or looping indefinitely.

The Resolved state is a terminal state reached only after a Verified
outcome, or after a human manually marks an Escalated incident as resolved
through the dashboard (for example, because they fixed it themselves).

--------------------------------------------------------------------------------
7.5 Memory Lifecycle
--------------------------------------------------------------------------------

The Memory Lifecycle describes how a unit of engineering memory moves
through its own states within Hindsight, independent of any single
Incident's lifecycle, because a single memory may be recalled and
reinforced across many incidents over time. A memory begins in a
Hypothesis state when it is first written, immediately after a fix is
proposed but before verification is known. If the associated Incident
reaches the Verified state, the memory transitions to Verified, and its
trust score (Section 15) is increased. If the associated Incident instead
reaches VerificationFailed or Escalated, the memory transitions to
Refuted, and is retained in the store (never deleted) but is explicitly
excluded from being presented as a positive precedent in future recall,
though it may still be surfaced as a negative precedent ("this approach
was tried before and did not work") when relevant. If a later, different
fix for what Hindsight determines is the same underlying incident class is
verified, the earlier Verified memory is not deleted but is marked as
Superseded, and a relationship is recorded in Hindsight linking the two,
preserving full lineage.

--------------------------------------------------------------------------------
7.6 Verification Lifecycle
--------------------------------------------------------------------------------

The Verification Lifecycle governs exactly how Continuum interacts with
GitHub Actions to obtain a trustworthy pass/fail signal. Once a fix is
committed (Section 7.4, FixProposed state), the Verification Engine
records the exact commit SHA that needs to be verified and begins
listening for check_suite and check_run webhook events referencing that
SHA. It does not poll aggressively; it relies primarily on GitHub's
webhook delivery, with a conservative fallback poll (using the GitHub
Checks API) only if no webhook has been received within a defined timeout,
to guard against missed webhook deliveries. When a check_suite completion
event is received for the tracked SHA, the Verification Engine inspects
the conclusion field. A conclusion of "success" moves the Incident to
Verified. A conclusion of "failure" moves the Incident toward
VerificationFailed, and the Verification Engine captures the new failing
log output as fresh evidence for a potential retry. Other conclusions
(for example, "cancelled" or "timed_out") are treated conservatively as
failures for the purposes of the Incident state machine, since Continuum
must never interpret an inconclusive result as a pass.

--------------------------------------------------------------------------------
7.7 Routing Lifecycle
--------------------------------------------------------------------------------

The Routing Lifecycle describes CascadeFlow's internal escalation
behavior across a single Incident, which may itself involve more than one
routing decision if the first, cheaper tier produces a low-confidence
result. CascadeFlow is invoked once per Investigating-state pass. It
begins by evaluating the incident against the cheap tier by default. If
the resulting diagnosis confidence, combined with the strength of the
memory match, exceeds the configured threshold, the cheap-tier result is
accepted and the Incident proceeds to FixProposed. If confidence falls
below threshold, CascadeFlow escalates to the next tier and re-evaluates,
up to the maximum escalation depth defined in Section 16. Every escalation
step, whether it results in acceptance or further escalation, is recorded
individually, so that the dashboard's Routing Decision widget can show not
just the final tier used but the full escalation path and the reasoning at
each step, which is an important part of the explainability goal stated in
Section 4.1.

--------------------------------------------------------------------------------
7.8 Dashboard Lifecycle
--------------------------------------------------------------------------------

The Dashboard Lifecycle describes how the frontend stays synchronized with
backend state. On load, the dashboard authenticates the user via GitHub
OAuth, fetches the list of repositories the user has installed Continuum
on, and fetches the current and recent Incident records for the selected
repository from the Backend Service's API. For live updates during an
active incident (the primary demo scenario), the dashboard establishes a
persistent connection to the Backend Service (implemented as either
server-sent events or a WebSocket connection, at the implementer's
discretion, with server-sent events preferred for simplicity on free-tier
infrastructure) and receives incremental state updates as the Incident
Lifecycle progresses through its states, so that a judge watching the
dashboard during a live demo sees each stage of the Continuum Loop appear
in near-real time rather than only after a full page refresh.

================================================================================
8. CORE MODULE 1: GITHUB APP
================================================================================

--------------------------------------------------------------------------------
8.1 Purpose
--------------------------------------------------------------------------------

The GitHub App module is Continuum's entry point into a repository. It is
responsible for installation, permission scoping, authentication of the
installing user for dashboard access, and reliable receipt of the webhook
events that drive the entire Incident Lifecycle. It must be implemented as
a genuine GitHub App (as opposed to a plain OAuth application without
installable, repository-scoped permissions), because GitHub Apps are the
only mechanism that provides the fine-grained, repository-level permission
model and webhook subscription model Continuum's security posture (Section
18) depends on.

--------------------------------------------------------------------------------
8.2 Problem Solved
--------------------------------------------------------------------------------

Without a properly scoped GitHub App, Continuum would either need
broad, account-wide access (an unacceptable security posture for a tool
that judges are expected to install on their own repositories) or would
have no reliable way to be notified of CI failures as they happen, forcing
it to poll GitHub continuously, which is both slower and wasteful of the
limited free-tier API rate limits available.

--------------------------------------------------------------------------------
8.3 Workflow
--------------------------------------------------------------------------------

A user (in the hackathon context, most often a judge) navigates to
Continuum's public marketing and installation page (Section 14, Public
Demo Page feature), and selects "Install on GitHub." This redirects to
GitHub's standard App installation flow, where the user selects either all
repositories or specific repositories to grant Continuum access to, and
reviews the exact permission list before confirming. Upon confirmation,
GitHub redirects back to Continuum with an installation identifier.
Continuum's Backend Service exchanges this for an installation access
token using its GitHub App credentials, records the new Installation and
associated Repository rows in the Database, and configures a default
webhook subscription for check_suite, check_run, pull_request, and push
events scoped to the newly installed repositories. The user is then
redirected into the Dashboard, authenticated via a standard GitHub OAuth
user-to-server flow (separate from the App's installation-level
permissions), landing on an onboarding view for their newly connected
repository.

--------------------------------------------------------------------------------
8.4 User Experience
--------------------------------------------------------------------------------

The installation experience must feel identical in simplicity to
installing any well-known GitHub App (for example, a CI provider or a
dependency bot): a small number of clicks, a clear permission review
screen controlled by GitHub itself (not something Continuum needs to
build), and a fast redirect into a working dashboard. After installation,
first-time users see a brief, dismissible onboarding panel in the
dashboard explaining the Continuum Loop in a few short lines, plus a
prominent call to action inviting them to push a failing commit to see
Continuum in action, directly supporting the demo flow in Section 20.

--------------------------------------------------------------------------------
8.5 System Behaviour
--------------------------------------------------------------------------------

The GitHub App module must correctly handle installation events
(installation created, installation deleted, and repositories
added/removed from an existing installation), keeping the Database's
Repository table synchronized with the actual set of repositories
Continuum currently has access to. It must handle webhook signature
verification on every inbound event using the App's configured webhook
secret, and must reject and log (without processing) any event that fails
verification. It must handle installation access token refresh
transparently, since GitHub App installation tokens are short-lived and
must be re-minted periodically using the App's private key; this refresh
logic must be centralized so that no other module needs to be aware of
token lifetime.

--------------------------------------------------------------------------------
8.6 Inputs
--------------------------------------------------------------------------------

Inputs to this module are: GitHub App installation callback requests,
GitHub OAuth user authentication callback requests, and the full set of
subscribed webhook event payloads delivered by GitHub.

--------------------------------------------------------------------------------
8.7 Outputs
--------------------------------------------------------------------------------

Outputs are: newly created or updated Installation, Repository, and User
records in the Database; enqueued Incident-creation actions for qualifying
webhook events, handed off to the Incident Investigation Engine; and
authenticated dashboard sessions for installing users.

--------------------------------------------------------------------------------
8.8 States
--------------------------------------------------------------------------------

An Installation record exists in one of three states: Active (the app is
currently installed and has valid access), Suspended (GitHub has reported
the installation as suspended by the account owner, in which case
Continuum stops processing events for it but retains historical data), and
Removed (the installation was fully uninstalled; Continuum retains
historical Incident and memory data for potential reinstallation but
clearly marks the installation as inactive in the dashboard if somehow
still reachable).

--------------------------------------------------------------------------------
8.9 Dependencies
--------------------------------------------------------------------------------

This module depends on a registered GitHub App with correctly configured
permissions (Section 18.1) and webhook subscriptions, on the Database for
persisting installation state, and on the Backend Service's webhook
endpoint being publicly reachable at a stable URL, which constrains the
deployment choice described in Section 19.

--------------------------------------------------------------------------------
8.10 Failure Handling
--------------------------------------------------------------------------------

If webhook signature verification fails, the event is rejected with an
appropriate HTTP status and logged for audit purposes (Section 18.7),
without any further processing. If the Backend Service is temporarily
unavailable when GitHub attempts webhook delivery, Continuum relies on
GitHub's own built-in webhook redelivery mechanism; no custom retry queue
is required for the hackathon scope, but the implementation must expose
GitHub's redelivery feature as a documented recovery path. If an
installation access token has expired and refresh fails (for example, due
to a misconfigured private key), the module must fail loudly in logs and
must surface a clear "reconnect GitHub" state in the dashboard rather than
silently dropping events.

--------------------------------------------------------------------------------
8.11 Acceptance Criteria
--------------------------------------------------------------------------------

Acceptance for this module requires: a user can install the GitHub App on
a repository they own within a small number of clicks; the App requests
only the permissions enumerated in Section 18.1 and no broader scope; a
webhook event for a CI failure on an installed repository reliably results
in a new Incident record within a small number of seconds under normal
conditions; uninstalling and reinstalling the App correctly restores
access without duplicating Repository records; and dashboard
authentication correctly restricts a user to only the repositories their
GitHub account has installed Continuum on or has access to.

--------------------------------------------------------------------------------
8.12 Edge Cases
--------------------------------------------------------------------------------

Edge cases to handle explicitly include: a user installing Continuum on a
repository with no GitHub Actions workflows configured at all, in which
case Continuum should detect the absence of workflows at installation
time and surface a clear dashboard message explaining that verification
requires at least one GitHub Actions workflow to be present; a user
revoking permissions partway through an active Incident investigation, in
which case any in-flight Verification Engine calls to the GitHub API must
fail gracefully and move the Incident to an Escalated state rather than
retrying indefinitely against a now-inaccessible repository; and a user
installing Continuum on a very large monorepo, in which case the module
must not attempt to eagerly fetch or index the entire repository at
installation time, deferring all repository content access to the
specific files implicated in an actual incident.

--------------------------------------------------------------------------------
8.13 Future Scope
--------------------------------------------------------------------------------

Beyond the hackathon, this module could be extended to support
organization-level installations with per-repository opt-in controls, a
richer onboarding wizard that helps a new user configure high-risk file
patterns (Section 16.5) during setup, and support for GitHub Enterprise
Server in addition to github.com. None of this is in scope for the current
submission.

================================================================================
9. CORE MODULE 2: AUTONOMOUS INCIDENT INVESTIGATION ENGINE
================================================================================

--------------------------------------------------------------------------------
9.1 Purpose
--------------------------------------------------------------------------------

The Investigation Engine is the reasoning core of Continuum. It transforms
a raw CI failure into a structured diagnosis and a concrete proposed fix,
using memory recall and CascadeFlow-selected model capability as its two
primary inputs, and it owns the Incident state machine described in
Section 7.4 from Detected through FixProposed.

--------------------------------------------------------------------------------
9.2 Problem Solved
--------------------------------------------------------------------------------

Left unaddressed, a CI failure requires a human to open the CI logs,
manually identify the root cause, write a fix, and push it, a process that
can take anywhere from minutes to hours depending on the failure's
subtlety. The Investigation Engine automates the diagnostic and
fix-generation portion of this process, while remaining honest about its
own confidence and always deferring final trust to the Verification
Engine.

--------------------------------------------------------------------------------
9.3 Workflow
--------------------------------------------------------------------------------

Upon receiving a Detected Incident, the Investigation Engine first
retrieves the full CI log output for the failing job through the GitHub
API, along with the diff of the triggering commit or pull request. It
applies a log-normalization step to extract a concise error signature:
depending on the CI system and language involved, this may mean isolating
a stack trace's exception type and message, isolating a specific failing
test assertion and its expected/actual values, or isolating a build-tool
error code and message, discarding surrounding noise such as timestamps
and unrelated log lines. This normalized signature, together with the list
of files touched by the triggering change, becomes the query sent to the
Hindsight Memory Engine (Section 10).

With memory results in hand, the Investigation Engine hands off to
CascadeFlow (Section 11) for a routing decision, passing along the memory
match strength and the characteristics of the incident. Once a model tier
is selected, the Investigation Engine constructs a reasoning prompt that
includes: the normalized error signature and full relevant log excerpt,
the diff of the triggering change, the content of the specifically
implicated files (fetched fresh from the repository at the triggering
commit SHA, never assumed from stale cache), and the top relevant memories
returned by Hindsight, each clearly labeled with its verification status
so the model can distinguish a proven precedent from a previously refuted
one. The selected model produces a structured diagnosis (a root-cause
explanation in plain language) and a proposed code change.

If the memory match was strong and verified, the Investigation Engine
first attempts to adapt the previously verified fix directly to the
current context, which is both faster and more reliable than reasoning
from first principles, and only falls back to a from-scratch diagnosis if
the adaptation does not cleanly apply (for example, because the
surrounding code has changed too much since the original fix). This
adaptive-reuse behavior is a key differentiator that should be visibly
reflected in the dashboard (Section 17) as "Reused verified fix from
[incident reference]" versus "Generated new diagnosis."

The proposed code change is then committed. By default, Continuum operates
in pull-request mode: it creates a new branch from the triggering commit,
applies the change, and opens a pull request with a clear, structured
description explaining the diagnosis, referencing any memories used, and
stating the CascadeFlow routing explanation. If the repository owner has
explicitly configured direct-push mode for a specific branch pattern (an
opt-in setting, never a default, described further in Section 18), the
change may instead be pushed directly to the existing branch. In either
mode, the resulting commit SHA is handed to the Verification Engine
(Section 12) to begin the Verification Lifecycle.

--------------------------------------------------------------------------------
9.4 User Experience
--------------------------------------------------------------------------------

From the user's perspective, once a CI failure occurs, they see a new
Incident appear on the Continuum dashboard within seconds, immediately
transitioning through Detected and Investigating, with the dashboard
showing live status text describing what the Investigation Engine is
currently doing (for example, "Extracting error signature," "Searching
memory," "Awaiting CascadeFlow routing decision," "Generating fix"). If
operating in pull-request mode, they additionally see a new pull request
appear on GitHub, authored by the Continuum App's bot identity, with a
clearly formatted description.

--------------------------------------------------------------------------------
9.5 System Behaviour
--------------------------------------------------------------------------------

The Investigation Engine must never fabricate log content or file content;
all evidence used in reasoning must be fetched live from the GitHub API at
investigation time. It must enforce a maximum context size appropriate to
the selected model tier, truncating log excerpts intelligently (preserving
the most diagnostically relevant lines, such as the final stack trace or
assertion failure, over less relevant surrounding output) rather than
naively truncating from the end. It must record every input it used to
generate a given diagnosis (which memories, which log excerpt, which
files) so that the diagnosis is fully reproducible and auditable after the
fact.

--------------------------------------------------------------------------------
9.6 Inputs
--------------------------------------------------------------------------------

Inputs are: the triggering webhook event and its associated CI run
metadata, the raw CI log output, the triggering commit or pull request
diff, the content of implicated files at the triggering SHA, the ranked
memory results from Hindsight, and the routing decision from CascadeFlow.

--------------------------------------------------------------------------------
9.7 Outputs
--------------------------------------------------------------------------------

Outputs are: a structured diagnosis record (persisted against the
Incident), a proposed code change committed to GitHub (either as a pull
request or a direct push per configuration), and a new Hypothesis-state
memory record written to Hindsight (Section 15) capturing the diagnosis
and proposed fix ahead of verification.

--------------------------------------------------------------------------------
9.8 States
--------------------------------------------------------------------------------

Within the Investigation Engine's ownership of the Incident lifecycle, the
relevant sub-states are Detected, Investigating, MemoryMatched, Routed,
and FixProposed, as defined in Section 7.4.

--------------------------------------------------------------------------------
9.9 Dependencies
--------------------------------------------------------------------------------

This module depends on the GitHub App module for API access to logs,
diffs, and file content and for commit/pull-request creation; on the
Hindsight Memory Engine for recall; and on the CascadeFlow Routing Engine
for model tier selection.

--------------------------------------------------------------------------------
9.10 Failure Handling
--------------------------------------------------------------------------------

If CI log retrieval fails (for example, due to a transient GitHub API
error), the Investigation Engine retries with backoff up to a small,
defined maximum before marking the Incident as Escalated with a clear
"could not retrieve CI logs" explanation, rather than proceeding with
incomplete evidence. If the selected model tier fails to produce a
well-formed diagnosis and proposed change (for example, due to a
malformed or incomplete model response), CascadeFlow's escalation path
(Section 11) is invoked to retry at a higher tier before the Incident is
marked Escalated. If committing the proposed change to GitHub fails (for
example, due to a merge conflict against a branch that has moved since the
triggering commit), the Investigation Engine surfaces this distinctly from
a verification failure, since it represents an inability to even attempt a
fix rather than a fix that was attempted and did not work.

--------------------------------------------------------------------------------
9.11 Acceptance Criteria
--------------------------------------------------------------------------------

Acceptance requires: a genuine CI failure on a demo repository reliably
produces a Detected Incident, a completed memory query, a CascadeFlow
routing decision with a stated explanation, and a committed proposed fix,
end to end, within a bounded and demo-appropriate time budget (target:
under two minutes for the reasoning stages, excluding the repository's own
CI run time); the resulting pull request or commit description clearly
and correctly explains the diagnosis in plain language a non-expert judge
can follow; and when a strong verified memory match exists, the engine
visibly reuses it rather than re-deriving a fix from scratch.

--------------------------------------------------------------------------------
9.12 Edge Cases
--------------------------------------------------------------------------------

Edge cases include: a CI failure with no clear single root cause (for
example, an intermittent infrastructure flake unrelated to code), in which
case the Investigation Engine must recognize when its own diagnosis
confidence is low even after escalation, and should surface an "unable to
confidently diagnose" state rather than proposing a low-confidence,
essentially random code change; a CI failure caused by a change in a file
that a proposed fix would need to touch but that has since been modified
by another commit, requiring the engine to re-fetch fresh file content
immediately before committing rather than relying on content fetched
earlier in the investigation; and a repository with multiple, independent
CI workflows failing simultaneously for unrelated reasons, which must be
represented as multiple distinct Incidents rather than incorrectly merged
into one.

--------------------------------------------------------------------------------
9.13 Future Scope
--------------------------------------------------------------------------------

Beyond the hackathon, the Investigation Engine could support multi-file,
multi-commit fixes for more architecturally complex incidents, proactive
investigation of flaky (intermittently failing) tests even absent a fresh
failure, and a "explain like I'm reviewing this PR" mode that walks a
human reviewer through the diagnosis interactively. None of this is
required for the current submission.

--------------------------------------------------------------------------------
9.14 Bounded Retry Budget
--------------------------------------------------------------------------------

To prevent runaway loops and runaway cost, the Investigation Engine
enforces a strict maximum of three total fix attempts per Incident before
transitioning to Escalated regardless of remaining CascadeFlow escalation
headroom. Each attempt after the first incorporates the fresh failure
evidence from the previous attempt's verification failure as additional
context, so that later attempts are informed retries rather than blind
repeats. This bounded-retry rule must be enforced centrally in the
Incident state machine, not left to be independently respected by each
call site, so that it cannot be accidentally bypassed.

================================================================================
10. CORE MODULE 3: HINDSIGHT MEMORY ENGINE
================================================================================

Note: this module is specified at architectural and behavioral depth here;
Section 15 provides the full deep dive on data model, trust scoring, and
lifecycle semantics referenced throughout this section.

--------------------------------------------------------------------------------
10.1 Purpose
--------------------------------------------------------------------------------

The Hindsight Memory Engine module is the integration layer between
Continuum's Backend Service and the self-hosted Hindsight instance. It is
responsible for every read and write of engineering memory: incident
memories, diagnoses, fixes, verification outcomes, and the relationships
between them.

--------------------------------------------------------------------------------
10.2 Problem Solved
--------------------------------------------------------------------------------

Without this module, every other component that needs memory (the
Investigation Engine for recall, the Verification Engine for write-back,
the Dashboard for display) would need to implement its own ad hoc access
to Hindsight, risking inconsistent query logic and inconsistent
interpretation of trust and verification status. Centralizing this access
ensures a single, consistent contract for what "a memory" means across the
entire system.

--------------------------------------------------------------------------------
10.3 Workflow
--------------------------------------------------------------------------------

On the read path, the module accepts a structured query from the
Investigation Engine consisting of the normalized error signature, the
implicated file paths, and a natural-language failure summary, and
translates this into the appropriate Hindsight retrieval calls, combining
structured filtering (for example, same repository, overlapping file
paths) with semantic similarity search over the natural-language summary.
It returns a ranked list of candidate memories, each annotated with a
similarity score, a verification status, and, where applicable, a
reference to any memory it supersedes or is superseded by.

On the write path, the module accepts a memory-write request at two
distinct points in the Incident Lifecycle: once in the FixProposed state
(writing a Hypothesis-state memory), and again whenever a verification
outcome becomes known (updating that memory to Verified or Refuted, per
Section 7.5). All writes include full provenance: the Incident identifier,
the diagnosis text, the proposed or applied fix, the CascadeFlow routing
explanation used to produce it, and, for verified memories, a reference to
the specific GitHub Actions run that proved it.

--------------------------------------------------------------------------------
10.4 User Experience
--------------------------------------------------------------------------------

This module has no direct user interface of its own; its behavior is
experienced indirectly through the Dashboard's Memory Matches widget
(Section 17) and Verified Memories widget, and through the visible "Reused
verified fix" versus "Generated new diagnosis" language in Investigation
Engine output (Section 9.3).

--------------------------------------------------------------------------------
10.5 System Behaviour
--------------------------------------------------------------------------------

The module must scope every query and write to the correct repository (and,
if a user has installed Continuum on multiple repositories, must never
leak a memory from one repository into another repository's recall
results, consistent with the non-goal in Section 4.2 regarding
cross-organization sharing). It must handle Hindsight being temporarily
unavailable by allowing the Investigation Engine to proceed with an
explicitly empty memory result set (clearly labeled "no memory available"
rather than silently treated as "no similar incidents found"), so that a
transient Hindsight outage degrades gracefully rather than blocking the
entire Incident Lifecycle.

--------------------------------------------------------------------------------
10.6 Inputs
--------------------------------------------------------------------------------

Inputs are: read queries from the Investigation Engine (Section 9.3), and
write requests from both the Investigation Engine (Hypothesis writes) and
the Verification Engine (status update writes).

--------------------------------------------------------------------------------
10.7 Outputs
--------------------------------------------------------------------------------

Outputs are: ranked memory match results returned to the Investigation
Engine, and confirmation of successful writes, both also mirrored into the
Database for fast dashboard querying (Section 17), since the Dashboard is
not expected to query Hindsight directly for every render.

--------------------------------------------------------------------------------
10.8 States
--------------------------------------------------------------------------------

See Section 7.5 for the full Memory Lifecycle state definitions
(Hypothesis, Verified, Refuted, Superseded).

--------------------------------------------------------------------------------
10.9 Dependencies
--------------------------------------------------------------------------------

This module depends on a running, reachable, self-hosted Hindsight
instance (Section 19), and on the Database for mirroring memory metadata
needed by the Dashboard.

--------------------------------------------------------------------------------
10.10 Failure Handling
--------------------------------------------------------------------------------

If a write to Hindsight fails, the module retries with backoff a small,
defined number of times, and if still unsuccessful, records the intended
write in the Database as a pending-write record and surfaces a visible
"memory sync pending" indicator in the dashboard rather than silently
dropping the write, since losing verified memory data would directly
undermine Continuum's core value proposition.

--------------------------------------------------------------------------------
10.11 Acceptance Criteria
--------------------------------------------------------------------------------

Acceptance requires: a second, similar incident on the same repository
reliably surfaces the first incident's memory as a top match; a verified
memory is correctly and visibly distinguished from an unverified one in
every place memories are displayed; and a repeated identical failure, once
a verified fix exists, results in the Investigation Engine reusing that
fix rather than regenerating a new diagnosis from scratch.

--------------------------------------------------------------------------------
10.12 Edge Cases
--------------------------------------------------------------------------------

Edge cases include: two structurally different incidents that happen to
produce a similar error message (for example, the same exception type
thrown for unrelated reasons in different files), which the module must
distinguish primarily using file-path and diff context rather than error
text alone, to avoid a false-positive memory match driving an incorrect
fix; and a very large number of accumulated memories for a highly active
repository, which the retrieval query must handle without unbounded
latency growth, relying on Hindsight's own indexing rather than any
in-process brute-force comparison.

--------------------------------------------------------------------------------
10.13 Future Scope
--------------------------------------------------------------------------------

Beyond the hackathon, this module could support memory export/import for
migrating a repository's engineering memory, and richer relationship types
beyond supersession (for example, "related but distinct" links between
memories that a human curator can annotate manually).

================================================================================
11. CORE MODULE 4: CASCADEFLOW ROUTING ENGINE
================================================================================

Note: this module is specified at architectural and behavioral depth here;
Section 16 provides the full deep dive on tiers, scoring, and escalation
logic referenced throughout this section.

--------------------------------------------------------------------------------
11.1 Purpose
--------------------------------------------------------------------------------

The CascadeFlow Routing Engine module is the integration layer between
Continuum's Backend Service and CascadeFlow, responsible for translating
an incident's characteristics into a routing decision, executing that
decision by invoking the selected model tier, and recording the decision
and its explanation.

--------------------------------------------------------------------------------
11.2 Problem Solved
--------------------------------------------------------------------------------

Without this module, model selection would either be hard-coded (wasteful
and inflexible) or would need bespoke, unexplainable logic built from
scratch. This module ensures every routing decision is principled,
consistent, and explainable, and ensures the cost-optimization story
central to Continuum's pitch is actually measured and enforced rather than
asserted.

--------------------------------------------------------------------------------
11.3 Workflow
--------------------------------------------------------------------------------

The module receives, from the Investigation Engine, the incident's
normalized error signature, the memory match results (including their
similarity scores and verification statuses), and the list of implicated
files. It checks the implicated files against the repository's configured
high-risk file patterns (Section 16.5). It then invokes CascadeFlow with
this context, beginning at the cheap tier. CascadeFlow returns a
confidence score for how well it expects the cheap tier to handle this
incident, along with its reasoning. If confidence is at or above the
configured acceptance threshold, and no high-risk file match forces
escalation regardless of confidence, the module accepts the cheap tier and
returns its selection, confidence score, and explanation to the
Investigation Engine. If confidence is below threshold, or a high-risk
file match is present, the module escalates to the next tier and repeats,
up to the maximum escalation depth. Every step of this process, whether it
results in acceptance or further escalation, is recorded as an individual
Routing Decision entry associated with the Incident.

--------------------------------------------------------------------------------
11.4 User Experience
--------------------------------------------------------------------------------

Users experience this module through the Dashboard's Routing Decision
widget (Section 17), which shows the final selected tier, the confidence
score that justified it, a plain-language explanation, and, if escalation
occurred, the full escalation path with the reason for each step (for
example, "Cheap tier confidence 62 percent, below 75 percent threshold,
escalating" followed by "Capable tier confidence 91 percent, accepted").

--------------------------------------------------------------------------------
11.5 System Behaviour
--------------------------------------------------------------------------------

The module must never allow an Incident to proceed to fix generation
without a recorded routing decision, and must never allow the explanation
text to be generated independently of the actual decision logic (that is,
the explanation must be a direct, faithful description of the confidence
score and thresholds that were actually evaluated, not a separately
generated, potentially inconsistent narrative).

--------------------------------------------------------------------------------
11.6 Inputs
--------------------------------------------------------------------------------

Inputs are: the incident's error signature and implicated files, the
memory match results from the Hindsight module, and the repository's
configured high-risk file patterns and confidence thresholds.

--------------------------------------------------------------------------------
11.7 Outputs
--------------------------------------------------------------------------------

Outputs are: a selected model tier, a confidence score, a full escalation
path with per-step explanations, and running cost accounting (tokens and
estimated dollar cost per tier used), all persisted against the Incident
and aggregated into the Database's running cost-savings totals used by the
Dashboard's Cost Savings widget.

--------------------------------------------------------------------------------
11.8 States
--------------------------------------------------------------------------------

A Routing Decision, once made for a given Investigating pass, exists in a
single terminal state (Accepted at a given tier); the escalation process
that led to it is represented as an ordered sequence of intermediate
evaluation steps rather than as its own persistent state machine.

--------------------------------------------------------------------------------
11.9 Dependencies
--------------------------------------------------------------------------------

This module depends on CascadeFlow being reachable and correctly
configured with the available model tiers (Section 16.2), and on the
Database for persisting decisions and cost accounting.

--------------------------------------------------------------------------------
11.10 Failure Handling
--------------------------------------------------------------------------------

If CascadeFlow is unreachable, the module falls back to a conservative
default: route directly to the capable tier (never silently defaulting to
the cheap tier without a confidence evaluation, since that would risk
presenting a low-quality fix as if it had been properly assessed), and
records this fallback explicitly in the routing explanation shown on the
dashboard ("CascadeFlow unavailable, defaulted to capable tier") so the
degraded mode is never hidden from the user.

--------------------------------------------------------------------------------
11.11 Acceptance Criteria
--------------------------------------------------------------------------------

Acceptance requires: a routing decision is produced for every Incident
that reaches the Routed state; the decision's explanation is human
readable and specific (naming the actual confidence score and threshold
involved, not a generic message); high-risk file matches reliably force
escalation regardless of confidence; and the dashboard's running cost
savings figure updates correctly and verifiably as incidents are routed to
the cheap tier.

--------------------------------------------------------------------------------
11.12 Edge Cases
--------------------------------------------------------------------------------

Edge cases include: an incident with a very strong memory match but which
also touches a high-risk file, where the high-risk override must still
force escalation even though memory confidence alone would suggest the
cheap tier is sufficient, since risk and confidence are evaluated as
independent factors, not a single blended score that risk could be
"outvoted" on; and an incident where escalation reaches the maximum
configured depth without exceeding the acceptance threshold, in which case
the module accepts the highest available tier's result but explicitly
flags the incident's diagnosis as "low confidence despite maximum
escalation" in both the Routing Decision explanation and the Investigation
Engine's downstream handling (Section 9.12).

--------------------------------------------------------------------------------
11.13 Future Scope
--------------------------------------------------------------------------------

Beyond the hackathon, this module could support per-repository custom
confidence thresholds configurable by the repository owner, and richer
cost-tier options beyond the two or three tiers defined for the hackathon
scope.

================================================================================
12. CORE MODULE 5: VERIFICATION ENGINE
================================================================================

--------------------------------------------------------------------------------
12.1 Purpose
--------------------------------------------------------------------------------

The Verification Engine module is responsible for the single most
differentiating behavior in Continuum: never trusting a proposed fix
until the repository's own, independent GitHub Actions workflows have
confirmed it. It owns the Incident state machine from FixProposed through
Verified, VerificationFailed, and Escalated.

--------------------------------------------------------------------------------
12.2 Problem Solved
--------------------------------------------------------------------------------

Without this module, Continuum would be indistinguishable from any other
AI tool that presents a plausible-sounding suggestion as if it were
reliable. This module is what allows Continuum to make the much stronger
and much rarer claim that a given fix has been proven to work, not merely
proposed.

--------------------------------------------------------------------------------
12.3 Workflow
--------------------------------------------------------------------------------

Once the Investigation Engine commits a proposed fix (Section 9.3) and
hands off the resulting commit SHA, the Verification Engine records this
SHA as the one being tracked for the current Incident and transitions the
Incident to Verifying. It subscribes (via the already-established webhook
subscription, Section 8) to check_suite completion events referencing this
SHA. As a safety net against missed webhook deliveries, it also schedules
a fallback poll of the GitHub Checks API for this SHA, set to fire only if
no relevant webhook has arrived within a conservative timeout window,
using the GitHub API rather than assuming a webhook will always arrive
promptly. When a relevant check_suite completion is observed, either via
webhook or fallback poll, the Verification Engine reads its conclusion. A
"success" conclusion transitions the Incident to Verified and immediately
triggers two follow-on actions: a memory write-back to Hindsight marking
the associated Hypothesis memory as Verified (Section 10.3), and, in
pull-request mode, the posting of a PR Verification Badge (Section 14)
comment on the pull request summarizing the diagnosis, the fix, and a link
to the passing workflow run. A "failure" (or other non-success) conclusion
transitions the Incident toward VerificationFailed, captures the new
failing log output, and, if the bounded retry budget (Section 9.14) is not
exhausted, hands the Incident back to the Investigation Engine for another
attempt informed by this new evidence; if the budget is exhausted, the
Incident transitions to Escalated, and the associated Hypothesis memory is
marked Refuted (Section 7.5).

--------------------------------------------------------------------------------
12.4 User Experience
--------------------------------------------------------------------------------

Users see the Incident's dashboard state move to "Verifying" with a live
link to the running GitHub Actions workflow, so they (or a judge) can
watch the real CI run happening on GitHub itself, not a simulated
progress bar. Upon success, they see the Incident move to "Verified" with
a green confirmation, the PR Verification Badge appear on GitHub, and (if
they navigate to the Verified Memories widget) the corresponding memory
now marked as Verified with a link back to this exact incident as its
proof.

--------------------------------------------------------------------------------
12.5 System Behaviour
--------------------------------------------------------------------------------

The Verification Engine must never itself execute the repository's code,
run its test suite, or simulate a CI result; it strictly observes outcomes
that GitHub itself reports for a workflow run GitHub itself executed, per
the security requirement in Section 18.5. It must correctly associate a
check_suite event with the correct Incident even when a repository has
multiple workflows or multiple simultaneous check suites in flight, using
the exact commit SHA as the correlation key.

--------------------------------------------------------------------------------
12.6 Inputs
--------------------------------------------------------------------------------

Inputs are: the tracked commit SHA from the Investigation Engine,
check_suite and check_run webhook events, and fallback Checks API polling
responses.

--------------------------------------------------------------------------------
12.7 Outputs
--------------------------------------------------------------------------------

Outputs are: Incident state transitions (Verified, VerificationFailed,
Escalated), memory write-back requests to the Hindsight module, and PR
Verification Badge comments posted through the GitHub API.

--------------------------------------------------------------------------------
12.8 States
--------------------------------------------------------------------------------

See Section 7.4 and 7.6 for the full state definitions this module owns
and transitions between.

--------------------------------------------------------------------------------
12.9 Dependencies
--------------------------------------------------------------------------------

This module depends on the GitHub App module for webhook receipt and
Checks API access, on the repository actually having at least one GitHub
Actions workflow configured (Section 8.12), and on the Hindsight module
for memory write-back.

--------------------------------------------------------------------------------
12.10 Failure Handling
--------------------------------------------------------------------------------

If no check_suite event and no successful fallback poll are observed
within an extended maximum wait window (accounting for the fact that some
repositories' CI may legitimately take a long time), the Incident
transitions to Escalated with a "verification timed out" explanation
rather than remaining in Verifying indefinitely. If the repository has no
GitHub Actions workflows configured at all, this is detected proactively
at installation time (Section 8.12) rather than discovered only after a
fix is proposed with no way to verify it.

--------------------------------------------------------------------------------
12.11 Acceptance Criteria
--------------------------------------------------------------------------------

Acceptance requires: a genuinely passing workflow run reliably and
correctly moves the Incident to Verified within a short time of the
workflow completing; a genuinely failing workflow run reliably triggers
either a retry or an Escalated state, never a false Verified result; the
PR Verification Badge only ever appears on a pull request whose fix has
actually been confirmed by a real, inspectable GitHub Actions run; and the
memory write-back correctly reflects the true verification outcome in all
cases.

--------------------------------------------------------------------------------
12.12 Edge Cases
--------------------------------------------------------------------------------

Edge cases include: a repository with multiple required workflows where
some pass and some fail for the same commit, which must be treated as an
overall verification failure (all required workflows must pass, not just
one) unless the repository owner has explicitly configured a specific
subset of workflows as the ones Continuum should track; a workflow that is
manually re-run by a human after Continuum's own tracking has already
concluded, which should not retroactively change a already-recorded
Incident outcome, to keep the historical record stable; and a fix that
passes CI but does so for a coincidental, unrelated reason (for example,
the true underlying bug was flaky and happened not to trigger during this
particular run), which the design acknowledges as an inherent limitation
of CI-based verification and does not attempt to fully solve within
hackathon scope, though the bounded retry-with-fresh-evidence process
(Section 9.14) partially mitigates it by testing the fix against
multiple runs when a retry is needed.

--------------------------------------------------------------------------------
12.13 Future Scope
--------------------------------------------------------------------------------

Beyond the hackathon, this module could support configurable per-workflow
verification requirements, statistical confidence for flaky-prone
verification (running a fix against CI multiple times before trusting it
for known-flaky workflows), and richer verification evidence types beyond
a binary pass/fail, such as performance regression checks.

================================================================================
13. CORE MODULE 6: ENGINEERING DASHBOARD
================================================================================

Note: this module is specified at architectural and behavioral depth here;
Section 17 provides the full widget-by-widget visual and interaction
specification referenced throughout this section.

--------------------------------------------------------------------------------
13.1 Purpose
--------------------------------------------------------------------------------

The Engineering Dashboard is the single visual home for everything
Continuum does. Its purpose is to make an inherently invisible process --
an AI system investigating, reasoning about, and verifying a fix -- fully
visible, inspectable, and explainable to a human in real time.

--------------------------------------------------------------------------------
13.2 Problem Solved
--------------------------------------------------------------------------------

Without a unified dashboard, Continuum's sophisticated backend behavior
would be invisible, forcing users (and judges) to piece together what
happened from scattered GitHub pull request comments and log output. The
dashboard is what turns Continuum's technical depth into demonstrable,
credible, and memorable product value.

--------------------------------------------------------------------------------
13.3 Workflow
--------------------------------------------------------------------------------

A user lands on the dashboard after GitHub OAuth authentication (Section
8.3), selects a connected repository (or is taken directly to it if only
one is connected, which will be the common case in the demo), and sees a
repository-level view composed of the widgets defined in Section 17: an
overview of current and recent incidents, and, upon selecting a specific
incident, a detailed incident view showing the full timeline, memory
matches, routing decision, and verification status for that incident, all
updating live via the persistent connection described in Section 7.8.

--------------------------------------------------------------------------------
13.4 User Experience
--------------------------------------------------------------------------------

The dashboard's visual and interaction design must feel like a polished,
opinionated developer tool, in the spirit of tools such as a modern CI
provider's own dashboard or a modern error-monitoring product's incident
view: dark-mode-first, information-dense but uncluttered, with clear use
of color to distinguish states (for example, a consistent color mapping
across the whole product for "unverified," "verifying," and "verified"),
and a strong sense of narrative flow from top to bottom mirroring the
Continuum Loop itself, so that a judge glancing at the screen for the
first time can intuitively understand the story being told without a
verbal explanation.

--------------------------------------------------------------------------------
13.5 System Behaviour
--------------------------------------------------------------------------------

The dashboard must never show a state that has not actually happened; for
example, it must not optimistically show "Verified" before the
Verification Engine has actually received a passing conclusion, even
briefly, since this would undermine the entire trust story the product is
built around. All state shown must be a direct, faithful reflection of
backend-persisted Incident, Routing Decision, and Memory records.

--------------------------------------------------------------------------------
13.6 Inputs
--------------------------------------------------------------------------------

Inputs are: authenticated API requests from the logged-in user's browser,
and the live incident-update stream described in Section 7.8.

--------------------------------------------------------------------------------
13.7 Outputs
--------------------------------------------------------------------------------

Outputs are: rendered views of repository, incident, memory, routing, and
cost-savings data; and user-initiated actions such as manually marking an
Escalated incident as Resolved.

--------------------------------------------------------------------------------
13.8 States
--------------------------------------------------------------------------------

The dashboard itself is largely stateless with respect to business logic;
its states are presentational (loading, populated, empty-state for a
repository with no incidents yet, and error/disconnected state if the live
update stream drops, with automatic reconnection).

--------------------------------------------------------------------------------
13.9 Dependencies
--------------------------------------------------------------------------------

This module depends on the Backend Service's API and live-update stream,
and on GitHub OAuth for authentication.

--------------------------------------------------------------------------------
13.10 Failure Handling
--------------------------------------------------------------------------------

If the live-update connection drops, the dashboard must visibly indicate a
"reconnecting" state rather than silently freezing on stale data, and must
automatically re-fetch current state upon reconnection to reconcile any
updates missed while disconnected.

--------------------------------------------------------------------------------
13.11 Acceptance Criteria
--------------------------------------------------------------------------------

Acceptance requires: every widget defined in Section 17 is present and
correctly populated for a real, live-demo incident; the incident detail
view updates in near-real time (target: within a few seconds of a backend
state transition) without requiring a manual page refresh; and the
dashboard remains fully legible and functional on the display resolution
and aspect ratio typical of a hackathon demo screen or projector.

--------------------------------------------------------------------------------
13.12 Edge Cases
--------------------------------------------------------------------------------

Edge cases include: a repository with a very large history of incidents,
which the dashboard must paginate or otherwise bound rather than
attempting to render an unbounded list at once; and simultaneous incidents
across multiple repositories for the same user, which must be clearly
separated in the navigation so a user is never uncertain which repository
an incident belongs to.

--------------------------------------------------------------------------------
13.13 Future Scope
--------------------------------------------------------------------------------

Beyond the hackathon, the dashboard could support team-level views once
multi-user organizations are in scope, customizable widget layouts, and
richer historical analytics. None of this is required for the current
submission.

================================================================================
14. FEATURE SPECIFICATIONS
================================================================================

This section provides the full definition -- purpose, problem solved,
workflow, user experience, system behaviour, inputs, outputs, states,
dependencies, failure handling, acceptance criteria, edge cases, and future
scope -- for each of the seventeen required features enumerated in the
original brief. Several features are direct user-facing expressions of the
core modules already specified in Sections 8 through 13; for those, this
section focuses specifically on the feature-level user experience and
acceptance criteria rather than repeating full module architecture, and
cross-references the relevant module section for underlying system
behaviour.

--------------------------------------------------------------------------------
14.1 Feature: GitHub App Installation
--------------------------------------------------------------------------------
Purpose: allow any GitHub user to connect Continuum to one or more of
their repositories in under a minute.
Problem solved: eliminates any manual configuration, API key exchange, or
out-of-band setup step that would create friction for a judge trying
Continuum for the first time.
Workflow: as described in Section 8.3.
User experience: a single "Install on GitHub" call to action, GitHub's own
native installation and permission-review screen, and a redirect into a
working, onboarded dashboard.
System behaviour: as described in Section 8.5.
Inputs: user click-through actions; GitHub installation callback.
Outputs: new Installation and Repository records; authenticated session.
States: see Section 8.8.
Dependencies: registered GitHub App (Section 8.9).
Failure handling: as described in Section 8.10.
Acceptance criteria: as described in Section 8.11, plus: the entire
installation-to-first-dashboard-view flow completes in under sixty
seconds under normal network conditions.
Edge cases: as described in Section 8.12.
Future scope: as described in Section 8.13.

--------------------------------------------------------------------------------
14.2 Feature: Webhook Processing
--------------------------------------------------------------------------------
Purpose: reliably and securely receive and act on GitHub's notifications
of repository activity relevant to Continuum.
Problem solved: removes the need for Continuum to poll GitHub for changes,
which would be slower and would consume scarce free-tier API rate limit.
Workflow: as described in Section 7.3.
User experience: entirely invisible to the end user; its success is
experienced only indirectly, through Incidents appearing promptly on the
dashboard after a real CI failure.
System behaviour: signature verification on every event; strict filtering
to only the event types Continuum acts on; idempotent handling such that a
redelivered webhook for an already-processed event does not create a
duplicate Incident.
Inputs: raw webhook HTTP requests from GitHub.
Outputs: validated, parsed event data handed to the appropriate downstream
module (Section 8 for installation events, Section 9 for CI-failure
events, Section 12 for check-suite completion events).
States: each inbound event is either Accepted, Rejected (failed signature
verification), or Ignored (valid but not relevant to Continuum's scope).
Dependencies: GitHub App webhook subscription configuration (Section 8.9).
Failure handling: as described in Section 8.10, relying on GitHub's own
redelivery mechanism for transient Backend Service unavailability.
Acceptance criteria: no event with an invalid signature is ever processed;
every valid, relevant event results in the correct downstream action
within a small number of seconds under normal conditions; redelivered
events never create duplicate Incidents.
Edge cases: out-of-order event delivery (for example, a check_run event
arriving before the check_suite event it belongs to), which must be
handled by correlating on commit SHA rather than assuming strict delivery
order.
Future scope: a dead-letter queue for events that fail processing
repeatedly, for full production hardening beyond hackathon scope.

--------------------------------------------------------------------------------
14.3 Feature: CI Failure Detection
--------------------------------------------------------------------------------
Purpose: correctly and promptly recognize when a CI run has failed on a
tracked repository, branch, or pull request.
Problem solved: this is the trigger for the entire Continuum Loop; without
reliable detection, nothing downstream can happen.
Workflow: a check_suite (or, if configured, check_run) webhook event with
a conclusion of "failure" is received for an installed repository; the
Backend Service confirms the associated branch or pull request is within
the repository's tracked scope (by default, all branches and pull
requests, unless the repository owner has configured a narrower scope);
an Incident record is created in the Detected state.
User experience: invisible directly, but is the moment that starts the
visible Incident Timeline the user sees appear on the dashboard.
System behaviour: must correctly ignore conclusions other than "failure"
(such as "success," "neutral," or "skipped"), and must correctly ignore
check suites unrelated to CI in the traditional sense if a repository has
configured unrelated GitHub Apps that also post check runs, by allowing
the repository owner to optionally specify which check names Continuum
should pay attention to.
Inputs: check_suite completion webhook events.
Outputs: new Incident record in Detected state.
States: n/a at the feature level; see Incident Lifecycle (Section 7.4).
Dependencies: Webhook Processing feature (Section 14.2).
Failure handling: if the repository's CI configuration is ambiguous (for
example, no clear single check suite representing "the build"), Continuum
defaults to tracking all check suites and requires all of them to succeed
for a Verified outcome (Section 12.12).
Acceptance criteria: a genuine, intentional CI failure on a demo
repository is detected and produces a Detected Incident within a small
number of seconds of the check suite completing.
Edge cases: a CI failure on a branch that is not the default branch and
not associated with any open pull request, which is still tracked (since
Continuum's default scope is repository-wide) but should be clearly
labeled with its branch name throughout the dashboard so the user is never
confused about which branch an incident belongs to.
Future scope: configurable branch/path filtering for repositories that
want to limit Continuum's scope to a subset of their branches.

--------------------------------------------------------------------------------
14.4 Feature: Incident Investigation
--------------------------------------------------------------------------------
Purpose: user-facing expression of the Investigation Engine (Section 9).
Problem solved: as described in Section 9.2.
Workflow: as described in Section 9.3.
User experience: as described in Section 9.4, plus: the Incident Timeline
widget (Section 17.2) shows each investigation step as it happens.
System behaviour: as described in Section 9.5.
Inputs/Outputs/States/Dependencies: as described in Sections 9.6 through
9.9.
Failure handling: as described in Section 9.10.
Acceptance criteria: as described in Section 9.11.
Edge cases: as described in Section 9.12.
Future scope: as described in Section 9.13.

--------------------------------------------------------------------------------
14.5 Feature: Memory Search
--------------------------------------------------------------------------------
Purpose: allow the Investigation Engine, and optionally the user directly
through the dashboard, to search Continuum's accumulated engineering
memory for a given repository.
Problem solved: is the concrete, user-visible expression of "Continuum
remembers," and lets a user manually explore what the system has learned,
independent of an active incident.
Workflow: automatically invoked as part of every Incident Investigation
(Section 9.3); additionally exposed as a manual search interface within
the dashboard's Verified Memories widget (Section 17.8), where a user can
enter free-text describing a problem and see matching memories ranked by
relevance, exactly as the Investigation Engine would see them.
User experience: a simple search input returning a ranked list of memory
cards, each showing the original incident's error signature, its
verification status, and a short diagnosis summary, with the ability to
click through to the full historical incident detail view.
System behaviour: the manual search path must use the exact same
underlying Hindsight query logic as the automated investigation path
(Section 10.3), so that what a user sees manually searching is a faithful
preview of what the Investigation Engine would actually find.
Inputs: free-text query (manual) or structured incident signature
(automatic).
Outputs: ranked memory match list.
States: n/a.
Dependencies: Hindsight Memory Engine module (Section 10).
Failure handling: an empty or malformed query returns a clear "enter a
description of the problem" prompt rather than an error.
Acceptance criteria: a manual search for a description closely matching a
previously verified incident returns that incident as a top result; search
latency remains low enough to feel interactive (target: under two
seconds) for the memory volumes expected in a hackathon demo repository.
Edge cases: a search with no matches at all, which must return a clear
"no similar memories found yet" empty state rather than an error or a
misleadingly low-relevance forced match.
Future scope: filters by date range, file path, or verification status.

--------------------------------------------------------------------------------
14.6 Feature: Hindsight Recall
--------------------------------------------------------------------------------
Purpose: the specific automated recall step within the Investigation
Engine's workflow, called out as its own required feature to emphasize its
centrality.
Problem solved: as described in Section 5.2 and Section 10.2.
Workflow: as described in Section 10.3 (read path).
User experience: surfaced through the Memory Matches widget (Section
17.4), showing exactly which memories were recalled for the current
incident and their similarity scores, in real time as the Investigating
state resolves into MemoryMatched.
System behaviour: as described in Section 10.5.
Acceptance criteria: recall results shown on the dashboard for a live
incident exactly match the memories actually used to inform the
Investigation Engine's diagnosis, with no discrepancy between what is
displayed and what was actually used, since this traceability is core to
the explainability goal (Section 4.1).
Edge cases and future scope: as described in Section 10.12 and 10.13.

--------------------------------------------------------------------------------
14.7 Feature: CascadeFlow Intelligent Routing
--------------------------------------------------------------------------------
Purpose: the specific automated routing step within the Investigation
Engine's workflow, called out as its own required feature to emphasize its
centrality.
Problem solved: as described in Section 5.3 and Section 11.2.
Workflow: as described in Section 11.3.
User experience: surfaced through the Routing Decision widget (Section
17.5).
System behaviour: as described in Section 11.5.
Acceptance criteria: as described in Section 11.11.
Edge cases and future scope: as described in Section 11.12 and 11.13.

--------------------------------------------------------------------------------
14.8 Feature: Explainable AI Decisions
--------------------------------------------------------------------------------
Purpose: ensure that every consequential decision Continuum makes --
which memories were used, which model tier was chosen and why, whether a
fix was reused or newly generated -- is stated in plain language and
visible to the user, never left as an opaque internal implementation
detail.
Problem solved: builds the trust required for a human to feel comfortable
relying on an autonomous system's output, and directly differentiates
Continuum from black-box AI tools.
Workflow: every module that makes a consequential decision (Investigation
Engine's reuse-versus-regenerate choice, CascadeFlow's tier selection,
Verification Engine's pass/fail interpretation) is required to produce a
structured explanation string alongside its decision, persisted against
the Incident, never generated after the fact by a separate summarization
step that could drift from what actually happened.
User experience: every widget on the dashboard that shows a decision
includes an adjacent, specific, plain-language explanation, not a generic
label.
System behaviour: explanation text must reference concrete values (actual
confidence scores, actual memory identifiers, actual thresholds) rather
than vague language.
Inputs/Outputs: explanation strings generated alongside each decision
they describe, across the Investigation, Routing, and Verification
modules.
States: n/a.
Dependencies: Sections 9, 11, and 12.
Failure handling: if an explanation cannot be generated for some reason,
the underlying decision must not be presented at all rather than presented
without justification, since an unexplained decision is worse for trust
than a visibly incomplete one.
Acceptance criteria: a judge unfamiliar with Continuum's internals can, by
reading the dashboard alone, correctly explain back why a given model tier
was chosen and why a given memory was or was not used.
Edge cases: a decision with a borderline confidence score very close to a
threshold, which the explanation should call out explicitly ("62 percent,
just below the 65 percent threshold") rather than presenting the threshold
crossing as an obviously clear-cut decision.
Future scope: an interactive "why" drill-down allowing a user to click
into the full underlying reasoning trace for any decision.

--------------------------------------------------------------------------------
14.9 Feature: Suggested Fix Generation
--------------------------------------------------------------------------------
Purpose: the concrete code-change output of the Investigation Engine.
Problem solved: as described in Section 9.2.
Workflow: as described in Section 9.3 (fix generation and adaptive reuse
portions specifically).
User experience: a clearly formatted pull request (default mode) with a
structured description containing the diagnosis, the routing explanation,
and any memory references, plus a normal, readable code diff.
System behaviour: fixes must be minimal and targeted to the diagnosed root
cause; the Investigation Engine must not make sweeping, unrelated changes
alongside the targeted fix, both to keep the diff reviewable by a human
and to keep the Verification Engine's pass/fail signal meaningfully
attributable to the actual fix.
Inputs/Outputs/States/Dependencies/Failure handling: as described in
Section 9.6 through 9.10.
Acceptance criteria: the generated diff, inspected by a human reviewer, is
plausible, minimal, and directly addresses the stated diagnosis.
Edge cases: an incident whose correct fix is not a code change at all but
a configuration or dependency version change, which the Investigation
Engine must be able to propose as well, not just source code edits.
Future scope: support for multi-commit, multi-file architectural fixes.

--------------------------------------------------------------------------------
14.10 Feature: Verification Using GitHub Actions
--------------------------------------------------------------------------------
Purpose: the user-facing expression of the Verification Engine (Section
12).
Problem solved: as described in Section 12.2.
Workflow: as described in Section 12.3.
User experience: as described in Section 12.4, including the live link to
the real, running GitHub Actions workflow.
System behaviour: as described in Section 12.5.
Acceptance criteria: as described in Section 12.11, with particular
emphasis that this is the single most scrutinized correctness requirement
in the whole product: a false-positive "Verified" state must never occur
under any tested condition.
Edge cases and future scope: as described in Section 12.12 and 12.13.

--------------------------------------------------------------------------------
14.11 Feature: Verified Memory Update
--------------------------------------------------------------------------------
Purpose: the write-back half of the Memory Lifecycle (Section 7.5),
called out as its own required feature.
Problem solved: is the mechanism that actually produces the "compounding
intelligence" Continuum promises; without it, verification would be a
one-time event with no lasting benefit.
Workflow: triggered immediately upon the Verification Engine observing a
"success" conclusion (Section 12.3); the associated Hypothesis memory is
updated in place to Verified status, with the verifying GitHub Actions run
attached as evidence, and, if this fix supersedes an earlier Verified
memory for what Hindsight determines is the same incident class, the
supersession relationship is recorded (Section 7.5).
User experience: the corresponding memory visibly and immediately changes
status in the Verified Memories widget (Section 17.8), and any pull
request comment (PR Verification Badge, Section 14.16) reflects the new
verified status.
System behaviour: this update must be atomic with respect to the
Incident's own state transition to Verified, so that it is never possible
for the dashboard to show an Incident as Verified while the underlying
memory still shows as Hypothesis, or vice versa.
Inputs: verification success signal from Section 12.3.
Outputs: updated memory record in Hindsight; updated Database mirror for
dashboard display.
States: see Section 7.5.
Dependencies: Verification Engine (Section 12), Hindsight module (Section
10).
Failure handling: as described in Section 10.10.
Acceptance criteria: within a small number of seconds of a real GitHub
Actions workflow reporting success, the corresponding memory is visibly
Verified on the dashboard.
Edge cases: as described in Section 7.5 regarding supersession.
Future scope: n/a beyond what is described in Section 10.13.

--------------------------------------------------------------------------------
14.12 Feature: Incident Timeline
--------------------------------------------------------------------------------
Purpose: give a human-readable, chronological account of everything that
happened during a single incident's investigation and resolution.
Problem solved: without a timeline, the Incident Lifecycle's state
transitions (Section 7.4) would be invisible or, at best, visible only as
a single current-state label, losing the narrative that makes Continuum's
process demonstrable and trustworthy.
Workflow: every state transition recorded in the Incident Lifecycle
(Section 7.4) is rendered as a timeline entry, in order, with a timestamp
and a short, specific description of what happened at that step (for
example, "Memory search found 2 candidate matches," "CascadeFlow selected
capable tier, confidence 91 percent," "Fix committed as pull request #42,"
"GitHub Actions run started," "GitHub Actions run passed, memory
verified").
User experience: a vertically scrolling, chronologically ordered list,
visually similar to a well-designed CI run log or incident-response
timeline, updating live as new steps occur during an in-progress
incident.
System behaviour: entries must be generated directly from the actual
state transition events recorded by the owning module (Investigation
Engine, Routing Engine, Verification Engine), never reconstructed
after the fact from a summary, to guarantee faithfulness.
Inputs: state transition events from Sections 9, 11, and 12.
Outputs: rendered timeline in the dashboard.
States: n/a.
Dependencies: Incident Lifecycle (Section 7.4).
Failure handling: if a given state transition's descriptive text cannot be
generated for some reason, a minimal fallback description (the raw state
name and timestamp) is shown rather than omitting the entry entirely, so
the timeline never has silent gaps.
Acceptance criteria: for a live demo incident, a judge watching the
timeline can narrate back, in their own words, exactly what Continuum did
and in what order, without needing anything explained to them verbally.
Edge cases: an incident that goes through a retry (Section 9.14), which
must show the retry as a clearly delineated new sub-sequence within the
same timeline, not merged confusingly with the first attempt's steps.
Future scope: exportable/shareable timeline links for a specific incident.

--------------------------------------------------------------------------------
14.13 Feature: Routing Visualization
--------------------------------------------------------------------------------
Purpose: give a specifically visual (not just textual) representation of
the CascadeFlow escalation path for a given incident.
Problem solved: a routing decision with potentially multiple escalation
steps is easier to understand at a glance as a visual path than as prose
alone, and a strong visual here also directly demonstrates CascadeFlow
usage to judges scanning the dashboard quickly.
Workflow: rendered directly from the Routing Decision data produced in
Section 11.3, showing each tier evaluated as a node, connected in
sequence, with the confidence score and accept/escalate outcome at each
node, and the finally accepted tier visually highlighted.
User experience: a compact, horizontal step visualization (for example,
"Cheap tier: 62% confidence, escalated" leading to "Capable tier: 91%
confidence, accepted"), using the same state color mapping as the rest of
the dashboard (Section 13.4).
System behaviour: must render correctly whether escalation occurred zero
times (direct acceptance at the cheap tier, the common and cost-optimal
case) or multiple times (up to the maximum escalation depth).
Inputs: Routing Decision data (Section 11.7).
Outputs: rendered visualization.
Acceptance criteria: the visualization correctly and legibly represents
both a zero-escalation and a multi-escalation routing decision, verified
against real incidents of both kinds during testing.
Edge cases: the CascadeFlow-unavailable fallback case (Section 11.10),
which must render distinctly (for example, a visibly different, clearly
labeled "fallback" style) rather than looking like a normal successful
routing decision.
Future scope: a repository-level aggregate view showing the distribution
of routing decisions across all incidents over time.

--------------------------------------------------------------------------------
14.14 Feature: Cost Savings Display
--------------------------------------------------------------------------------
Purpose: make the economic value of CascadeFlow's intelligent routing
concrete and quantified, rather than an abstract claim.
Problem solved: "we save money with smart routing" is a common but
often unsubstantiated claim in AI tooling; this feature makes the savings
visible, calculated, and specific to the user's own repository.
Workflow: for every routing decision (Section 11.7), the module computes
both the actual estimated cost incurred (based on the tier actually used
and its token usage) and a baseline estimated cost representing what it
would have cost had every incident instead been routed to the most capable
tier by default with no intelligent routing. The running difference
between these two totals, aggregated across all of a repository's
incidents, is the displayed cost savings figure.
User experience: a prominent running total (for example, a dollar figure
and a percentage saved) in the Cost Savings widget (Section 17.6), updating
after each new incident is routed.
System behaviour: the baseline comparison must use a consistent, clearly
documented methodology (visible via a tooltip or explanatory note in the
dashboard) so the figure is defensible under judge scrutiny, not an
arbitrarily inflated marketing number.
Inputs: per-incident token usage and tier cost data from Section 11.7.
Outputs: aggregate cost savings figure, persisted in the Database and
displayed on the dashboard.
Acceptance criteria: the displayed figure can be manually recomputed by an
implementer from the underlying per-incident cost records and matches
exactly, with no discrepancy.
Edge cases: a repository with only a small number of incidents so far,
where the savings figure, while directionally correct, is not yet
statistically meaningful; the dashboard should present the figure without
overstating its significance for very small sample sizes (for example, by
also showing the raw incident count alongside the savings figure).
Future scope: a projected annual savings estimate based on the
repository's observed incident rate.

--------------------------------------------------------------------------------
14.15 Feature: Live Dashboard
--------------------------------------------------------------------------------
Purpose: the umbrella feature covering the real-time behavior of the
Engineering Dashboard module (Section 13) as a whole.
Problem solved: a dashboard that only updates on manual refresh would
severely undercut the live-demo impact central to Continuum's pitch
(Section 20).
Workflow: as described in Section 7.8 (Dashboard Lifecycle).
User experience: state changes appear on screen within a few seconds of
occurring on the backend, without any user action required.
System behaviour: as described in Section 13.5 and 13.10.
Acceptance criteria: during a live demo run-through, every Incident state
transition, memory update, and routing decision appears on screen without
a manual refresh, verified end to end at least once before the actual
judged demo.
Edge cases and future scope: as described in Section 13.12 and 13.13.

--------------------------------------------------------------------------------
14.16 Feature: PR Verification Badge
--------------------------------------------------------------------------------
Purpose: surface Continuum's verification result directly on the GitHub
pull request itself, where a developer would naturally be looking, not
only on the separate Continuum dashboard.
Problem solved: without this, a developer reviewing the pull request
Continuum created would have no in-context confirmation that the proposed
fix has actually been proven to work, undercutting adoption.
Workflow: immediately upon an Incident reaching the Verified state
(Section 12.3), the Verification Engine posts a structured comment on the
associated pull request (or, in direct-push mode, on the associated
commit) containing: a clear "Verified" status badge, a summary of the
diagnosis, a link to the specific passing GitHub Actions run, and, if
applicable, a reference to the prior verified memory this fix was
adapted from.
User experience: a developer opening the pull request sees, without
needing to visit the Continuum dashboard at all, a clear, confident,
evidence-backed confirmation that this fix works, with a direct link to
the proof.
System behaviour: the badge comment must only ever be posted after a real
"success" conclusion has been observed (Section 12.3), never
optimistically or speculatively.
Inputs: verification success signal.
Outputs: a posted GitHub pull request or commit comment.
Acceptance criteria: for a real demo incident, the badge comment appears
on the correct pull request within a small number of seconds of the
underlying GitHub Actions run completing successfully, and its embedded
link correctly navigates to that exact run.
Edge cases: a pull request that is closed or merged by a human before
verification completes, in which case the badge comment attempt must fail
gracefully (the pull request may no longer accept new comments in some
states) without crashing the Verification Engine's broader state handling.
Future scope: a rich, collapsible comment format showing the full
diagnosis and memory lineage inline, rather than a summary with a link
out.

--------------------------------------------------------------------------------
14.17 Feature: Public Demo Page
--------------------------------------------------------------------------------
Purpose: give judges (and anyone else) a clear, public, unauthenticated
entry point that explains Continuum and offers a direct path to installing
it on their own repository.
Problem solved: judges evaluating many submissions need to be able to
quickly understand what a product does and try it themselves without
needing a guided walkthrough from the team at all times.
Workflow: a public marketing page, requiring no authentication, that
explains the Continuum Loop in a small number of clear sections (the
problem, the solution, how Hindsight and CascadeFlow are used, and a
short, real, embedded example of a past verified incident, sourced live
from the team's own demo repository's public memory rather than a
fabricated screenshot), with a prominent "Install on GitHub" call to
action leading directly into the flow described in Section 8.3.
User experience: fast-loading, visually polished, consistent with the
dashboard's visual language (Section 13.4), readable in under two minutes
by someone who has never heard of Continuum before.
System behaviour: the embedded "real example" content must be fetched
live from the Backend Service's public API for the team's own demo
repository, not hard-coded static text, so that it stays truthful and
up to date, and so that judges can verify it is not fabricated by
cross-referencing it against the actual dashboard.
Inputs: none (publicly accessible, unauthenticated).
Outputs: rendered marketing page; outbound link into the GitHub App
installation flow.
Acceptance criteria: the page loads correctly with no authentication;
the "Install on GitHub" call to action correctly initiates the flow in
Section 8.3; the embedded real example correctly reflects actual,
current data from the Backend Service.
Edge cases: the team's own demo repository temporarily having no verified
incidents yet (for example, immediately after a fresh deployment), in
which case the page must show a clear, honest "no verified incidents yet"
placeholder rather than a broken or empty-looking section.
Future scope: a public, read-only, shareable dashboard view for any
willing user's repository, for social proof and virality beyond the
hackathon.

================================================================================
15. HINDSIGHT DEEP DIVE
================================================================================

--------------------------------------------------------------------------------
15.1 What Hindsight Stores
--------------------------------------------------------------------------------

Hindsight stores four related categories of engineering memory content for
Continuum, each conceptually distinct but linked together into a single
coherent memory graph per repository.

The first category is Incident Memories: one memory per investigated CI
failure, capturing the normalized error signature, a natural-language
description of the failure suitable for semantic search, the implicated
file paths, and a reference back to the Continuum Incident record in the
Database (which holds the full structured, relational detail; Hindsight
holds the memory-optimized, retrievable representation).

The second category is Diagnosis Content: the plain-language root-cause
explanation produced by the Investigation Engine for a given incident,
stored as part of the same memory so that future recall surfaces not just
"a similar failure happened before" but the actual reasoning that explained
it, which is what allows the Investigation Engine to genuinely reuse past
understanding rather than merely past error text.

The third category is Fix Content: the actual proposed or applied code
change associated with a given incident's diagnosis, stored so that a
future, sufficiently similar incident can attempt direct adaptation of a
previously verified fix (Section 9.3) rather than regenerating one from
scratch.

The fourth category is Verification Evidence: for any memory that has
reached Verified status, a reference to the specific GitHub Actions run
that proved it, including the run's URL and completion timestamp, so that
"verified" is never an unsupported claim but always has a concrete,
externally checkable citation attached.

Beyond these four content categories, Hindsight also stores the
relationships between memories described in Section 15.5: supersession
links, and "refuted approach" links used to prevent Continuum from
confidently repeating a previously failed attempt.

--------------------------------------------------------------------------------
15.2 When Memories Are Created
--------------------------------------------------------------------------------

A new memory is created at exactly one point in the Incident Lifecycle:
when the Investigation Engine reaches the FixProposed state (Section 7.4)
and commits a proposed fix. At this moment, a memory is written to
Hindsight in the Hypothesis state (Section 7.5), containing the incident
signature, diagnosis, and fix content described above, but explicitly not
yet carrying any verification evidence, since none exists yet. No memory
is ever created earlier than this point (for example, memories are never
created merely from a CI failure being detected, before any diagnosis
exists), because an unexplained failure with no proposed resolution is not
yet a useful unit of engineering memory.

--------------------------------------------------------------------------------
15.3 When Memories Are Updated
--------------------------------------------------------------------------------

A memory is updated, rather than a new one created, at exactly two further
points. First, when the Verification Engine observes a verification
outcome (Section 12.3): a "success" conclusion updates the memory's state
from Hypothesis to Verified and attaches the Verification Evidence
described above; a "failure" conclusion (with the retry budget exhausted)
updates the memory's state from Hypothesis to Refuted. Second, when a
later, independently-arrived-at fix for what Hindsight determines is the
same underlying incident class is itself verified: the earlier memory's
state is updated from Verified to Superseded, and a supersession
relationship (Section 15.5) is recorded pointing to the new, superseding
memory, while the earlier memory's content is preserved in full rather
than overwritten, maintaining an auditable history.

--------------------------------------------------------------------------------
15.4 When Memories Are Recalled
--------------------------------------------------------------------------------

Memories are recalled at exactly one automated point: at the start of
every new Incident's Investigating state (Section 7.4), immediately before
CascadeFlow routing, using the query behavior described in Section 10.3.
Memories may additionally be recalled on demand through the manual Memory
Search feature (Section 14.5), using the identical underlying query logic.
Recall always returns memories ranked by a combination of semantic
similarity to the current incident's natural-language description and
structural relevance (matching or overlapping file paths, matching error
signature category), with verification status returned as metadata on
each result rather than used to filter results out entirely, since a
Refuted memory (a previously tried and failed approach) is still valuable
context for the Investigation Engine to avoid repeating a mistake, even
though it is never presented as a positive precedent.

--------------------------------------------------------------------------------
15.5 How Verification Changes Trust
--------------------------------------------------------------------------------

Continuum's trust model is deliberately simple and fully explainable,
consistent with the non-goal (Section 4.2) of avoiding a complex,
opaque trust-decay mechanic. Every memory carries a trust level derived
directly and only from its lifecycle state: a Hypothesis memory carries
low trust and is always clearly labeled as unverified wherever it is
displayed or used in reasoning; a Verified memory carries high trust and
is eligible for direct fix reuse (Section 9.3); a Refuted memory carries
zero positive trust and is never reused as a positive precedent, but is
retained and surfaced as a negative precedent; a Superseded memory retains
its historical high-trust status for lineage purposes but is no longer the
memory recommended for reuse, in favor of the memory that superseded it,
which is surfaced instead. Critically, trust never changes as a function
of elapsed time alone; a Verified memory from a year ago (in a production
deployment beyond the hackathon window) carries exactly the same trust as
one verified an hour ago, unless and until new verification evidence
(a refutation or a supersession) arrives. This keeps the trust model easy
to explain to both users and judges: trust is earned by proof, not eroded
by the calendar.

--------------------------------------------------------------------------------
15.6 How Engineering Memory Evolves
--------------------------------------------------------------------------------

Over the lifetime of a single repository's Continuum installation, the
following evolution pattern is expected and should be visibly
demonstrable in the dashboard's Verified Memories widget (Section 17.8)
during a sufficiently long demo or judging session. Early on, most
incidents result in new Hypothesis memories and cheap-tier routing
confidence is generally lower, since there is little prior precedent to
match against, leading CascadeFlow to escalate more often (Section 11.3).
As verified memories accumulate, an increasing proportion of new incidents
find strong matches against prior Verified memories, CascadeFlow's
confidence at the cheap tier rises correspondingly (since strong memory
match is a direct input to confidence, Section 16.4), escalation becomes
less frequent, and the Cost Savings widget's running total grows at an
accelerating rate. Occasionally, a new incident's fix, once verified,
turns out to be a better general solution than an earlier verified fix for
a related but not identical problem, triggering a supersession and
visibly updating the memory graph's lineage. This overall arc -- starting
uncertain and improving measurably and traceably over time -- is the
concrete, demonstrable version of Continuum's core promise, and
implementers should ensure the dashboard makes this arc visible rather
than only showing a snapshot of current state.

================================================================================
16. CASCADEFLOW DEEP DIVE
================================================================================

--------------------------------------------------------------------------------
16.1 Why Routing Exists
--------------------------------------------------------------------------------

Routing exists because not all incidents are equally hard, and treating
them as if they were is both economically wasteful and, in the opposite
direction, potentially unsafe. A one-line dependency version mismatch that
closely matches a previously verified fix does not need the same level of
model capability, context, or cost as a novel failure in a high-risk area
of the codebase with no prior precedent. CascadeFlow exists to make this
distinction automatically, consistently, and explainably, rather than
leaving it as an unstated, ad hoc implementation detail buried inside a
single monolithic prompt.

--------------------------------------------------------------------------------
16.2 The Cheap Model Tier
--------------------------------------------------------------------------------

The cheap tier is the default starting point for every incident. It uses a
fast, inexpensive model well suited to well-precedented, low-complexity
situations, particularly those with a strong Hindsight memory match. The
cheap tier's role in the architecture is to handle the majority of
incidents once a repository's memory store has matured, directly powering
the Cost Savings feature (Section 14.14). The cheap tier is never used
for incidents touching high-risk files (Section 16.5), regardless of
confidence, since risk override takes precedence over cost optimization
by design.

--------------------------------------------------------------------------------
16.3 The Capable Model Tier
--------------------------------------------------------------------------------

The capable tier is a more powerful, more expensive model reserved for
incidents where the cheap tier's confidence falls below threshold, where
no strong memory match exists, or where high-risk files are implicated.
The capable tier is expected to be used more frequently early in a
repository's lifecycle (Section 15.6) and progressively less often as
memory matures, which is itself part of the demonstrable "system gets
smarter" story.

If CascadeFlow's available configuration supports more than two tiers at
hackathon time, an implementer may introduce an intermediate tier between
cheap and capable; this is an optional enhancement, not a requirement, and
the two-tier model (cheap, capable) is sufficient to satisfy every
acceptance criterion in this document.

--------------------------------------------------------------------------------
16.4 Confidence Scoring
--------------------------------------------------------------------------------

A confidence score is produced at every routing evaluation step (Section
11.3), representing CascadeFlow's estimate of how likely the currently
evaluated tier is to produce a correct, verifiable diagnosis and fix for
this specific incident. The score is informed primarily by three signals,
combined by CascadeFlow's own scoring logic rather than a separately
hand-built formula in the Continuum codebase: the strength (similarity
score) of the best matching Hindsight memory and whether that memory is
Verified, Hypothesis, or Refuted; the apparent structural complexity of the
incident (for example, how many files are implicated, how large the
relevant diff is); and whether the incident's error signature matches a
category CascadeFlow (or Continuum's own historical routing data, if
CascadeFlow supports incorporating it) has previously found this tier
reliable for. A confidence score at or above the configured acceptance
threshold (a value tunable per deployment but defaulting to a specific,
documented percentage decided at implementation time and kept consistent
across the demo) results in acceptance of the current tier; below
threshold results in escalation.

--------------------------------------------------------------------------------
16.5 High-Risk Files
--------------------------------------------------------------------------------

A repository owner may configure a list of high-risk file path patterns
(for example, patterns matching authentication logic, payment-adjacent
code even though payments themselves are out of scope for Continuum's own
product per Section 6, database migration files, or infrastructure
configuration) through the dashboard's repository settings. Any incident
whose implicated files match one of these patterns is forced to escalate
to the capable tier regardless of confidence score, and this override is
explicitly and separately labeled in the routing explanation ("Escalated
due to high-risk file match: [pattern]") so that it is never confused with
a low-confidence escalation. If a repository owner has not configured any
high-risk patterns, Continuum applies a small, sensible default set (for
example, common authentication and CI/CD configuration file path
conventions) so that the safety behavior is present even without explicit
configuration, and this default set is clearly disclosed in the dashboard
settings view.

--------------------------------------------------------------------------------
16.6 Decision Explanation
--------------------------------------------------------------------------------

As established in Section 11.5 and Section 14.8, every routing decision
must produce a faithful, specific, plain-language explanation, generated
directly from the actual confidence score, threshold, and any high-risk
override evaluated, and this explanation is a first-class, persisted part
of the Incident record, not a display-only afterthought.

--------------------------------------------------------------------------------
16.7 Cost Optimization
--------------------------------------------------------------------------------

Cost optimization is the direct, measurable consequence of routing most
incidents to the cheap tier whenever confidence and risk assessment
support it. Section 14.14 specifies the exact accounting methodology: real
cost incurred by tier actually used, compared against a baseline of
capable-tier-for-everything, with the difference displayed as savings.
Implementers should ensure the actual token costs used for this accounting
are the real, current costs of the models backing each tier, not
placeholder or estimated figures, so that the Cost Savings widget's claim
is fully defensible.

================================================================================
17. DASHBOARD SPECIFICATION
================================================================================

This section specifies each of the eight required dashboard widgets in
detail: their content, their data source, and their visual behavior. All
widgets share the dark-mode-first, state-color-consistent visual language
established in Section 13.4.

--------------------------------------------------------------------------------
17.1 Widget: Current Incident
--------------------------------------------------------------------------------

Shows the single most recent, currently in-progress incident (if any) for
the selected repository, prominently at the top of the dashboard. Displays
the incident's current state (using the Incident Lifecycle states from
Section 7.4), the branch or pull request it is associated with, and how
long it has been in its current state. If no incident is currently in
progress, this widget shows a calm, positive "no active incidents" state
rather than an empty or broken-looking placeholder, with a subtle
secondary prompt inviting the user to push a failing commit to see
Continuum work (directly supporting Section 20's demo flow).

--------------------------------------------------------------------------------
17.2 Widget: Incident Timeline
--------------------------------------------------------------------------------

As specified in full in Section 14.12. Rendered directly below or
alongside the Current Incident widget when an incident is selected,
occupying a prominent, primary position in the layout given its
centrality to the demo narrative.

--------------------------------------------------------------------------------
17.3 Widget: Memory Matches
--------------------------------------------------------------------------------

For the selected incident, shows the ranked list of memories recalled from
Hindsight (Section 15.4), each displayed as a compact card showing the
matched incident's error signature, its similarity score, its
verification status (with distinct, consistent visual treatment for
Verified, Hypothesis, Refuted, and Superseded), and, if it was the memory
ultimately used for direct fix reuse, a clear "used for this fix"
indicator.

--------------------------------------------------------------------------------
17.4 Widget: Routing Decision
--------------------------------------------------------------------------------

Combines the textual explanation (Section 14.8) and the visual escalation
path (Section 14.13, Routing Visualization) into a single widget for the
selected incident, showing the final accepted tier prominently and the
full escalation path (if any) available on inspection.

--------------------------------------------------------------------------------
17.5 Widget: Verification Status
--------------------------------------------------------------------------------

For the selected incident, shows the current Verification Lifecycle state
(Section 7.6): Not Yet Verifying, Verifying (with a live link to the
running GitHub Actions workflow), Verified (with a link to the passing
run and a green confirmation state), or Verification Failed/Escalated
(with a link to the failing run and, if applicable, an indicator that a
retry is in progress).

--------------------------------------------------------------------------------
17.6 Widget: Cost Savings
--------------------------------------------------------------------------------

As specified in full in Section 14.14. Displayed as a repository-level
aggregate (not per-incident), typically positioned prominently since it is
one of the most immediately impressive figures for a judge to see at a
glance.

--------------------------------------------------------------------------------
17.7 Widget: Verified Memories
--------------------------------------------------------------------------------

A browsable, searchable (Section 14.5) list of all memories for the
selected repository that have reached Verified status, each showing its
error signature, a short diagnosis summary, the date it was verified, and
a link to the original incident and its verification evidence. This
widget is what most directly visualizes the "compounding intelligence"
story described in Section 15.6.

--------------------------------------------------------------------------------
17.8 Widget: Recent Activity
--------------------------------------------------------------------------------

A compact, reverse-chronological feed of recent events across the entire
selected repository (not limited to a single incident): new incidents
detected, memories verified, memories superseded, and routing decisions
made, giving a quick-glance sense of overall system activity, particularly
useful for a judge who arrives mid-demo and wants a fast sense of what has
already happened.

================================================================================
18. SECURITY SPECIFICATION
================================================================================

--------------------------------------------------------------------------------
18.1 GitHub Permissions
--------------------------------------------------------------------------------

The Continuum GitHub App requests the minimum set of permissions required
to function, and no broader scope. This includes: read and write access to
repository contents (required to read implicated files and commit
proposed fixes), read and write access to pull requests (required to
open pull requests and post the PR Verification Badge comment), read
access to checks (required to observe GitHub Actions verification
outcomes), and read access to metadata (required for basic repository
information). Continuum explicitly does not request administrative
permissions, does not request access to repository secrets, and does not
request organization-wide permissions beyond what is needed for the
specific repositories a user chooses to install it on.

--------------------------------------------------------------------------------
18.2 Secret Protection
--------------------------------------------------------------------------------

Continuum never requests, stores, or has access to a repository's GitHub
Actions secrets, environment variables, or any other repository secret
material. All verification (Section 12) happens by triggering the
repository owner's existing, already-configured GitHub Actions workflows
through standard commit/pull-request mechanisms; Continuum never needs to
know the contents of those workflows' secrets to observe their pass/fail
outcome. Continuum's own operational secrets (its GitHub App private key,
its CascadeFlow and Hindsight access credentials, its Database
credentials) are stored using the secret management facilities of its
chosen free-tier hosting providers (Section 19), never committed to source
control, and never exposed to the frontend or to any log output.

--------------------------------------------------------------------------------
18.3 Prompt Injection Mitigation
--------------------------------------------------------------------------------

Because the Investigation Engine's reasoning prompts (Section 9.3)
necessarily include content from the repository itself (CI logs, file
content, diffs), which is technically untrusted input that could
theoretically contain adversarial instructions crafted to manipulate the
model, Continuum applies the following mitigations. Content pulled from
the repository is always clearly delimited and labeled as data, not
instructions, within the reasoning prompt's structure, so the model is
consistently cued to treat it as evidence to reason about rather than as
commands to follow. The Investigation Engine's action space is narrow and
structurally constrained (it may propose a code change and a diagnosis; it
has no ability to, for example, modify GitHub App permissions, alter its
own configuration, or take any action outside the specific commit/pull
request mechanism described in Section 9.3), which limits the blast radius
even if a prompt injection attempt partially succeeded. All proposed fixes
are always subject to the independent Verification Engine (Section 12)
before being presented as trustworthy, meaning even a successfully
manipulated diagnosis cannot result in a false "Verified" claim, since
verification is based purely on the real GitHub Actions outcome, not on
anything the model itself asserts.

--------------------------------------------------------------------------------
18.4 Repository Privacy
--------------------------------------------------------------------------------

Repository content accessed during an investigation (logs, diffs, file
content) is used only for the duration of that investigation's reasoning
and memory-writing process and is not shared across unrelated
installations or users; Hindsight memory scope is strictly isolated per
repository (per the non-goal in Section 4.2 regarding cross-organization
sharing), so no content or learned pattern from one user's private
repository is ever surfaced to a different, unrelated user.

--------------------------------------------------------------------------------
18.5 No Code Execution on Continuum Servers
--------------------------------------------------------------------------------

This is treated as an absolute, non-negotiable architectural constraint
repeated here for emphasis: Continuum's own Backend Service infrastructure
never executes, compiles, runs tests against, or otherwise directly
executes any of a repository owner's code, at any point in the Continuum
Loop. Every claim of correctness Continuum makes is derived exclusively
from observing the outcome of the repository owner's own GitHub Actions
workflows, run entirely on GitHub's own infrastructure, under the
repository owner's own existing configuration and permissions. This
constraint is what allows Continuum to be installed on judges' own
repositories with a credible security story, and it must never be
compromised for implementation convenience (for example, it would be a
serious violation of this specification to add a "quick local test runner"
inside the Backend Service, even for demo reliability purposes).

--------------------------------------------------------------------------------
18.6 Use of the Repository's Own GitHub Actions
--------------------------------------------------------------------------------

As established throughout Section 12, verification always flows through
the repository owner's own, pre-existing GitHub Actions configuration.
Continuum does not create, modify, or inject new GitHub Actions workflow
files into a repository as part of its normal operation; it relies on
whatever CI configuration already exists. If a repository has no GitHub
Actions workflows at all, this is surfaced clearly at installation time
(Section 8.12) rather than worked around by any mechanism that would
require Continuum to execute code itself.

--------------------------------------------------------------------------------
18.7 Audit Logs
--------------------------------------------------------------------------------

Every consequential action Continuum takes against a user's repository --
committing a proposed fix, opening a pull request, posting a comment -- is
logged with a timestamp, the acting Incident identifier, and the specific
GitHub API call made, retained in the Database and viewable (at minimum in
a simple chronological list, without requiring a dedicated admin panel per
the Section 6 non-goal) by the installing user through the dashboard, so
that a user always has a complete, inspectable record of every action
Continuum has taken on their behalf.

================================================================================
19. DEPLOYMENT AND INFRASTRUCTURE
================================================================================

--------------------------------------------------------------------------------
19.1 Overall Philosophy
--------------------------------------------------------------------------------

Every component of Continuum must run entirely on free-tier
infrastructure, both so the hackathon submission can be deployed and
judged at zero cost, and so it can remain running and reproducible after
the event without requiring ongoing payment. This section describes the
deployment shape at a decision level; it intentionally does not include
configuration files, infrastructure-as-code, or step-by-step setup
instructions, consistent with the plain-text, no-code format required for
this document.

--------------------------------------------------------------------------------
19.2 Frontend
--------------------------------------------------------------------------------

The Dashboard Frontend (Section 13) and the Public Demo Page (Section
14.17) are deployed on a free tier of a modern static/edge frontend
hosting provider (for example, Vercel's free tier), chosen for its strong
support for fast, globally distributed delivery of a frontend application
and straightforward integration with a Git-based deployment workflow,
which is well suited to a hackathon's iterative development pace.

--------------------------------------------------------------------------------
19.3 Backend
--------------------------------------------------------------------------------

The Backend Service (Section 7.1), including the webhook receiver, the
Investigation Engine, the Hindsight and CascadeFlow integration modules,
and the Verification Engine's orchestration logic, is deployed on a free
tier of a persistent, always-on backend hosting provider (for example,
Render's free tier or Fly.io's free tier), chosen specifically because
this component must be able to reliably receive inbound GitHub webhook
deliveries at a stable, publicly reachable URL at any time, which rules
out purely on-demand or cold-start-heavy serverless deployment models for
this particular component, given the latency sensitivity of the live-demo
experience described in Section 20.

--------------------------------------------------------------------------------
19.4 Database
--------------------------------------------------------------------------------

Continuum's relational, operational data (Installations, Repositories,
Users, Incident records, Routing Decision records, and the Database
mirror of memory metadata described in Section 10.7) is stored in a free
tier of a managed Postgres provider (for example, Supabase's free tier),
chosen for its combination of a genuinely free, persistent Postgres
instance and a straightforward authentication story that pairs well with
GitHub OAuth for the dashboard's user sessions.

--------------------------------------------------------------------------------
19.5 Authentication
--------------------------------------------------------------------------------

All user-facing authentication (Section 8.3, dashboard login) uses
standard GitHub OAuth, consistent with the non-goal (Section 4.2) of
avoiding any enterprise SSO or alternative identity provider integration.

--------------------------------------------------------------------------------
19.6 Memory
--------------------------------------------------------------------------------

The Hindsight Memory Engine (Section 10) is deployed as a self-hosted
Hindsight instance, deployed on the same free-tier backend hosting
provider used for the Backend Service where feasible, or on a separate
free-tier compute instance if Hindsight's resource requirements warrant
isolating it from the Backend Service's own process, with the two
communicating over a private network connection or an authenticated
service interface, consistent with the "external system with a defined
interface" architectural treatment described in Section 7.1.

--------------------------------------------------------------------------------
19.7 Model Routing
--------------------------------------------------------------------------------

CascadeFlow (Section 11) is integrated as a hosted or self-hosted service
per whatever deployment option the sponsor technology provides at
hackathon time; the Backend Service's CascadeFlow Routing Engine module
(Section 11) is written against a stable interface contract so that the
specific deployment mode of CascadeFlow itself (hosted service versus
self-hosted) does not require changes to the rest of Continuum's
architecture.

--------------------------------------------------------------------------------
19.8 Verification
--------------------------------------------------------------------------------

Verification (Section 12) requires no dedicated infrastructure of its own
beyond the Backend Service's webhook handling and GitHub API access,
since verification execution itself always happens on GitHub's own
infrastructure via the repository owner's existing GitHub Actions
configuration (Section 18.5, 18.6).

--------------------------------------------------------------------------------
19.9 Storage
--------------------------------------------------------------------------------

Any binary or file-like storage needs beyond the relational Database
(for example, cached large log excerpts, if needed for performance) use a
free tier of managed object storage paired with the chosen Database
provider (for example, Supabase Storage), rather than introducing a
separate storage vendor.

--------------------------------------------------------------------------------
19.10 Monitoring
--------------------------------------------------------------------------------

Operational monitoring (uptime checks, error logging) uses only free-tier
solutions appropriate to the chosen hosting providers (for example, the
hosting provider's own built-in logging and basic uptime monitoring), with
no paid observability platform introduced for the hackathon scope.

--------------------------------------------------------------------------------
19.11 No Paid Infrastructure
--------------------------------------------------------------------------------

Restated for clarity and enforceability: no component of Continuum's
architecture, as specified in this document, requires a paid tier of any
infrastructure provider to function correctly for the demo and judging
scope described in Section 20. Any implementation decision that would
require introducing a paid tier must be reconsidered and replaced with a
free-tier-compatible alternative before being adopted.

================================================================================
20. DEMO FLOW AND SCRIPT
================================================================================

--------------------------------------------------------------------------------
20.1 The Complete Demo
--------------------------------------------------------------------------------

The demo is designed to be run live, end to end, using a real repository
and real GitHub infrastructure, never a simulated or pre-recorded
substitute, because the authenticity of the demo is itself part of
Continuum's core credibility argument.

Step one: the judge (or presenter, on the judge's behalf, but ideally the
judge themselves for maximum credibility) installs the Continuum GitHub
App (Section 8.3) on a prepared demo repository, either the team's own
public demo repository seeded with prior verified incidents (to
demonstrate the "compounding memory" story immediately, Section 15.6) or,
for maximum impressiveness, the judge's own repository, showcasing that
Continuum genuinely works on arbitrary, previously-unseen code.

Step two: the judge (or presenter) pushes a deliberately broken commit --
prepared in advance as a small, clearly explainable bug (for example, an
off-by-one error causing a specific test assertion to fail, or a
dependency version bump that breaks a build step) -- to a branch or pull
request on the installed repository.

Step three: the repository's own GitHub Actions CI workflow runs
automatically, as it always would, independent of Continuum, and fails,
exactly as it would for any real bug, with no Continuum involvement in
this step at all, which is itself worth calling out verbally during the
demo to reinforce that this is genuine, unmodified CI behavior.

Step four: GitHub delivers a check_suite completion webhook to Continuum
(Section 14.2, 14.3), and within a small number of seconds, a new Incident
appears on the Continuum dashboard, visibly moving into the Investigating
state (Section 17.1, 17.2).

Step five: the dashboard's Memory Matches widget (Section 17.3) populates
with the results of the Hindsight recall (Section 15.4), visibly showing
whether a relevant prior verified incident was found, ideally showing a
strong match against a seeded prior incident to make the "Continuum
remembers" story concrete rather than abstract.

Step six: the dashboard's Routing Decision widget (Section 17.4) populates
with CascadeFlow's tier selection and confidence score (Section 16.4),
visibly showing the routing explanation, ideally showing a fast, cheap-tier
acceptance driven by the strong memory match from step five, directly
demonstrating the cost-optimization story.

Step seven: the Investigation Engine proposes a fix (Section 9.3),
visibly appearing as a new pull request on GitHub, with a clear diagnosis
description referencing the reused memory.

Step eight: the repository's own GitHub Actions reruns automatically
against the new commit, exactly as it would for any real pull request,
again with no special Continuum-side execution involved (Section 18.5),
and the dashboard's Verification Status widget (Section 17.5) shows the
live, real-time link to this running workflow.

Step nine: the workflow passes, the dashboard's Verification Status widget
updates to Verified, the PR Verification Badge (Section 14.16) appears on
the pull request with a link to the passing run, and the corresponding
memory updates to Verified in the Verified Memories widget (Section 17.7),
visibly closing the loop.

Step ten: the dashboard's Cost Savings widget (Section 17.6) updates to
reflect the newly completed, cheaply-routed incident, giving a concrete,
quantified closing data point for the demo.

--------------------------------------------------------------------------------
20.2 Why This Demo Is Impressive
--------------------------------------------------------------------------------

This demo is impressive for several concrete, articulable reasons that the
presenting team should be prepared to state explicitly to judges. First,
every step is real: the CI failure is a genuine failure of genuine code,
the verification is a genuine, independently inspectable GitHub Actions
run, and the pull request is a genuine pull request a human could merge.
Nothing shown is a mockup or a simulated placeholder. Second, the demo is
reproducible by the judge themselves, on their own repository, which is a
far stronger credibility signal than a team demonstrating their own
pre-prepared example. Third, the demo makes both sponsor technologies'
contributions concretely visible and separable: a judge can point at the
Memory Matches widget and understand exactly what Hindsight contributed,
and point at the Routing Decision widget and understand exactly what
CascadeFlow contributed, rather than the sponsor technologies being buried
inside an unexplained black box. Fourth, the demo tells a coherent,
single-narrative-arc story -- break something, watch it get diagnosed
using memory and intelligent routing, watch it get proven correct, watch
the system get smarter -- that a judge can retell accurately to other
judges after the fact, which matters significantly in a hackathon judging
process where a project must often be advocated for by a judge who saw the
live demo to other judges who did not.

--------------------------------------------------------------------------------
20.3 Demo Preparation Requirements
--------------------------------------------------------------------------------

To ensure demo reliability, the team should prepare, before judging
begins: a demo repository seeded in advance with a small number (a
handful, not dozens) of prior verified incidents, so the memory-match step
(Section 20.1, step five) reliably shows a strong match rather than an
empty result; a pre-validated, deliberately broken commit ready to push at
demo time, tested end to end at least once beforehand to confirm the full
loop completes within a reasonable, stage-appropriate time budget; and a
fallback plan (for example, a very recent successful run captured as a
short recording) to fall back on only in the event of unexpected, judging-day
infrastructure issues such as a GitHub Actions outage entirely outside the
team's control, used only as a last resort and disclosed honestly as a
fallback if it is ever needed.

================================================================================
21. JUDGE QUESTIONS AND ANSWERS
================================================================================

The following are approximately thirty questions judges are likely to ask,
with strong, specific answers grounded in this specification. Presenters
should internalize these rather than reading them verbatim.

1. Why did you use Hindsight instead of a regular database for memory?
Answer: a regular database can store rows, but Hindsight is built
specifically for the kind of semantic, relationship-aware recall Continuum
needs -- finding conceptually similar prior incidents, not just exact
matches, and representing relationships like supersession between
memories, which is what actually lets Continuum's recall behave like
memory rather than like a lookup table.

2. Why did you use CascadeFlow instead of just always calling one model?
Answer: always calling one model means either overpaying for simple,
well-precedented incidents or underpowering genuinely hard, novel ones.
CascadeFlow lets Continuum make that decision automatically, per incident,
based on a real confidence signal, and make the decision explainable
rather than hidden.

3. How is this different from CodeRabbit or other AI code review tools?
Answer: those tools are stateless, one-shot suggestion generators. They
have no persistent, verified memory of prior fixes, and no independent
verification step that proves a suggestion actually works before
presenting it as reliable. Continuum's suggestions are gated behind real
GitHub Actions verification, and only verified outcomes become trusted,
reusable memory.

4. What exactly is proprietary about Continuum, versus what comes from the
sponsor technologies?
Answer: Hindsight provides memory storage and retrieval primitives, and
CascadeFlow provides model routing primitives; Continuum's own
contribution is the verification-gated memory lifecycle (Section 7.5,
Section 15) that connects them -- the specific rule that a memory only
becomes trusted after independent proof, the incident investigation
pipeline that ties CI failures to memory recall to routing to fix
generation, and the dashboard that makes the entire reasoning process
explainable.

5. How do you prevent hallucinated fixes from being merged?
Answer: no fix is ever presented as reliable, and no memory is ever marked
Verified, until the repository's own real GitHub Actions workflow reports
a genuine success on that exact fix (Section 12); a hallucinated,
incorrect fix will simply fail verification like any other incorrect fix
and either be retried with fresh evidence or escalated to a human.

6. Why do you rely on GitHub Actions instead of running tests yourselves?
Answer: two reasons. Security: Continuum's own servers never execute a
repository owner's code (Section 18.5), which is essential for a tool
users are asked to install on their own private repositories. Trust: using
the repository owner's own, pre-existing, already-trusted CI
configuration means the verification signal is independently inspectable
by anyone with repository access, rather than something only Continuum
itself could vouch for.

7. How is a memory actually verified, step by step?
Answer: as described in Section 12.3 and Section 15.3: a fix is proposed,
committed as a pull request or push, the repository's real GitHub Actions
workflow runs against it, and only a genuine "success" conclusion from
that real run updates the associated memory from Hypothesis to Verified.

8. How do you reduce cost, concretely?
Answer: CascadeFlow routes most incidents, particularly ones with strong
memory matches, to a fast, inexpensive model tier by default, only
escalating to a more expensive tier when confidence is low or high-risk
files are involved (Section 16); the Cost Savings widget (Section 14.14)
quantifies this against a baseline of using the expensive tier for
everything.

9. How do you ensure security given you're asking to install this on
private repositories?
Answer: narrowly scoped GitHub App permissions with no admin or secrets
access (Section 18.1, 18.2), no code execution on Continuum's own
infrastructure ever (Section 18.5), and full audit logging of every action
taken (Section 18.7).

10. What happens if Continuum's proposed fix is wrong?
Answer: it fails the repository's real CI, and Continuum either retries
with the new failure evidence (up to a bounded budget, Section 9.14) or
escalates transparently to the user with a clear explanation of what was
tried and why it stopped (Section 7.4, Escalated state), rather than
looping forever or silently giving up.

11. Does Continuum ever push directly to a protected branch without
review?
Answer: by default, no; Continuum operates in pull-request mode, creating
a reviewable pull request rather than pushing directly, and direct-push
mode is an explicit, opt-in configuration a repository owner would have to
enable themselves (Section 9.3).

12. How does memory search actually work under the hood?
Answer: it combines structured signals -- matching or overlapping file
paths, matching error signature category -- with semantic similarity
search over a natural-language description of the failure, executed
through Hindsight (Section 10.3, Section 15.4).

13. What stops two unrelated bugs with similar error text from being
incorrectly matched as the same memory?
Answer: file-path and diff context are used alongside error text
specifically to avoid this false-positive scenario (Section 10.12); a
shared exception type alone is not sufficient for a strong match if the
implicated files are unrelated.

14. How do you decide what counts as a "high-risk" file?
Answer: a repository owner can configure their own high-risk path
patterns, and Continuum applies a sensible default set (for example,
authentication and CI/CD configuration paths) if none is configured
(Section 16.5); any incident touching a high-risk file is forced to the
capable tier regardless of confidence.

15. What happens if CascadeFlow or Hindsight is temporarily down during
the demo?
Answer: both integrations degrade gracefully rather than crashing the
Incident Lifecycle: a CascadeFlow outage falls back to the capable tier
with an explicitly disclosed fallback explanation (Section 11.10), and a
Hindsight outage proceeds with an explicitly empty, clearly labeled memory
result rather than blocking investigation (Section 10.5).

16. How long does the full loop take, end to end?
Answer: targeting under two minutes for the reasoning stages (detection
through fix proposal), plus however long the repository's own CI takes to
run for verification, which is outside Continuum's control by design
(Section 9.11).

17. Can this scale beyond a single repository per user?
Answer: yes, the architecture supports a user installing Continuum on
multiple repositories, each with its own isolated memory scope (Section
10.5); what is explicitly out of scope for the hackathon is
multi-organization or cross-account sharing (Section 4.2).

18. Why no Slack integration? Isn't that an obvious next feature?
Answer: it was deliberately descoped (Section 6) to keep the hackathon
build focused on proving the core verified-memory loop deeply, rather than
spreading effort across integration surface area; the GitHub-native
experience (pull requests, check runs, the dashboard) is sufficient to
fully demonstrate the product's value without it.

19. What's the business model beyond the hackathon?
Answer: the hackathon submission intentionally excludes billing and
monetization (Section 6) to focus on proving the core technology; the
longer-term vision (Section 1, final subsection) is as an engineering
memory layer that other AI coding tools could eventually consume, which
naturally suggests both a direct subscription model and a platform/API
licensing model, though neither is built for this submission.

20. How do you know the cost savings figure is real and not inflated?
Answer: it is computed directly from real per-incident token usage against
each tier's real, current cost, compared to a clearly documented baseline
methodology (Section 14.14), and is fully recomputable by an implementer
from the underlying stored records.

21. What if a repository has no GitHub Actions configured at all?
Answer: this is detected proactively at installation time and clearly
surfaced to the user (Section 8.12), since verification is fundamentally
dependent on the repository having at least one workflow to observe.

22. How do you handle flaky tests that fail for reasons unrelated to the
actual bug?
Answer: this is an acknowledged, inherent limitation of any CI-based
verification approach (Section 12.12); the bounded retry-with-fresh-evidence
process partially mitigates it, and this is an area explicitly called out
for future, post-hackathon investment (Section 12.13).

23. Is the model ever allowed to modify Continuum's own configuration or
permissions?
Answer: no; the Investigation Engine's action space is deliberately narrow
and structurally limited to proposing a code change and diagnosis within a
single commit or pull request (Section 18.3), specifically to limit blast
radius even under adversarial or prompt-injection conditions.

24. How do you prevent prompt injection from a malicious commit or log
output?
Answer: repository-sourced content is always clearly delimited as data
rather than instructions within reasoning prompts, the model's action
space is narrow, and critically, even a successfully manipulated diagnosis
cannot produce a false "Verified" claim, because verification depends
solely on a real, independent GitHub Actions outcome, not on anything the
model itself asserts (Section 18.3).

25. What's the single hardest engineering problem in this system?
Answer: reliably and correctly interpreting GitHub Actions verification
outcomes across the many edge cases of multiple workflows, partial
failures, timeouts, and out-of-order webhook delivery (Section 12.12),
because a false-positive "Verified" result would undermine the entire
product's core trust claim.

26. Why a dashboard at all, instead of just GitHub pull request comments?
Answer: pull request comments alone cannot show the full incident
timeline, the memory match reasoning, or the routing explanation in a
digestible, unified, real-time way; the dashboard (Section 13, 17) is what
makes Continuum's reasoning process genuinely explainable rather than
scattered across disconnected GitHub artifacts.

27. What happens to memory if a user uninstalls and reinstalls Continuum?
Answer: historical Incident and memory data is retained (Section 8.8), so
a reinstall restores access to the repository's previously accumulated
engineering memory rather than starting over from zero.

28. How do you handle a repository with multiple required CI workflows?
Answer: by default, all required workflows for a given commit must pass
for the incident to reach Verified; a repository owner may optionally
configure a specific subset of workflows for Continuum to track (Section
12.12).

29. Could a competitor just copy this idea easily?
Answer: the individual pieces (AI code suggestions, CI integration) are
not novel in isolation; what is harder to replicate quickly is the
specific verification-gated memory lifecycle design (Section 7.5) and the
deep, structurally necessary integration of both a genuine memory system
and a genuine confidence-based routing system working together as a
single feedback loop, rather than either being a superficial add-on.

30. What would you build next, right after the hackathon?
Answer: deepening the memory relationship model (richer relationship
types beyond supersession, Section 10.13), supporting statistically
robust verification for known-flaky workflows (Section 12.13), and
extending installation to organizations, in that order, since each builds
directly on the verified-memory foundation already established rather
than introducing new, disconnected surface area.

================================================================================
22. APPENDIX: GLOSSARY AND DATA ENTITIES
================================================================================

--------------------------------------------------------------------------------
22.1 Glossary
--------------------------------------------------------------------------------

Continuum Loop: the six-stage cycle (detection, recall, routing,
investigation and fix generation, verification, memory evolution)
described in Section 3.1 that every incident moves through.

Incident: a single tracked instance of a CI failure and its investigation,
resolution, and verification, as defined by the Incident Lifecycle in
Section 7.4.

Memory: a unit of engineering knowledge stored in Hindsight, as defined in
Section 15.1, existing in one of the states defined in Section 7.5.

Hypothesis (memory state): a memory that has been proposed but not yet
verified.

Verified (memory state): a memory whose associated fix has been confirmed
correct by a real GitHub Actions run.

Refuted (memory state): a memory whose associated fix was proposed but
failed verification and exhausted its retry budget.

Superseded (memory state): a previously Verified memory that has been
replaced by a newer, independently verified fix for the same incident
class.

Routing Decision: the record of which model tier CascadeFlow selected for
a given incident, including its confidence score, escalation path, and
explanation, as defined in Section 11.

Verification Engine: the module responsible for triggering and
interpreting the repository's own GitHub Actions outcome, as defined in
Section 12.

High-risk file: a file matching a configured or default pattern that
forces routing escalation regardless of confidence, as defined in Section
16.5.

PR Verification Badge: the comment posted on a pull request confirming a
verified fix, as defined in Section 14.16.

--------------------------------------------------------------------------------
22.2 Data Entities (Descriptive)
--------------------------------------------------------------------------------

The following entities are described conceptually, without schema syntax,
to guide the Database design referenced throughout this document.

Installation: represents a single GitHub App installation, linked to the
installing GitHub user or organization account, carrying its current
status (Active, Suspended, Removed) as defined in Section 8.8.

Repository: represents a single repository Continuum has been granted
access to under a given Installation, carrying its configuration
(tracked branch scope, high-risk file patterns, direct-push mode setting
if enabled).

User: represents a person authenticated via GitHub OAuth for dashboard
access, linked to the Installations they have access to.

Incident: the central operational record, carrying its current lifecycle
state (Section 7.4), its full state-transition history (powering the
Incident Timeline, Section 14.12), its associated triggering commit or
pull request reference, and references to its Routing Decision and
Verification outcome.

Routing Decision: a record of the full CascadeFlow escalation path for a
given Incident's Investigating pass, including each evaluated tier, its
confidence score, and the acceptance or escalation outcome at each step,
as defined in Section 11.7.

Memory Mirror: a Database-side mirror of key Hindsight memory metadata
(state, similarity score when recalled, verification evidence reference)
sufficient for fast dashboard queries without requiring the dashboard to
query Hindsight directly for every render, as described in Section 10.7.

Audit Log Entry: a record of a single consequential action Continuum took
against a user's repository, as defined in Section 18.7.

================================================================================
END OF DOCUMENT
================================================================================