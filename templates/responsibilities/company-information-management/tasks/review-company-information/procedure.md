# Procedure: Review & Improve Company Information

**Task:** Company Information Review & Improvement  
**Responsibility:** Company Information Management  
**Objective:** Improve the accuracy, clarity, completeness, and consistency of Company Information while preserving the company's intent.

## 1. Information Gathering

Read the current Company Information, evaluating these 14 sections:

1. Company Identity
2. Mission & Purpose
3. Vision
4. Core Values & Ethics
5. Customers & Their Needs
6. Products & Value Proposition
7. Strategy & Market Position
8. Goals & Success Metrics
9. Decision-Making Principles
10. Operating Philosophy
11. Organizational Structure & Authority
12. Communication & Collaboration
13. Business & Financial Model
14. Company History & Lessons Learned

**Additional context:** Read the company's current project list. Use it to understand ongoing activities and strategic alignment, but keep the evaluation focused on Company Information.

**Sources:**
- Company Information: `[COMPANY_INFORMATION_SOURCE]`
- Project List: `[COMPANY_PROJECTS_SOURCE]`

## 2. Evaluation

Evaluate each Company Information section for:

- Ambiguities or missing context.
- Contradictions within or between sections.
- Opportunities to improve clarity, completeness, or wording.

Identify which sections would benefit from clarification or revision. Leave satisfactory sections unchanged.

## 3. Interviewing

Interview the user to resolve the most important ambiguities, contradictions, or missing information.

- Ask a maximum of **6 questions total**, including follow-ups.
- Prioritize questions by their expected impact on clarity and accuracy.
- Ask focused questions, using earlier answers to guide subsequent questions.
- Avoid questions that can be answered from existing information.
- Stop early when sufficient clarity is achieved.
- Do not invent missing facts. Flag unresolved uncertainties.

## 4. Drafting

For each section requiring improvement:

- Draft replacement text using the original content and interview findings.
- Improve clarity, consistency, structure, and conciseness.
- Preserve existing information and intended meaning wherever possible.
- Reorganize content when it improves understanding.
- Avoid introducing unsupported claims.
- Provide a one-sentence explanation of the improvement.

**Required output format (per section):**

### Section: [Section Name]

**Original:**  
[Current section text]

**Proposed:**  
[Complete replacement section text]

**Reason:**  
[One sentence explaining why the revision is better.]

Repeat for each section requiring changes.

## 5. Approval

Submit each proposed section revision to the Boss using the configured Paperclip approval workflow.

- Present the original text, proposed replacement, and reason.
- Allow individual sections to be approved, rejected, or returned for revision.
- Revise and resubmit when requested.
- Record the decision for each section.
- Do not modify Company Information directly.
- Do not treat a proposed change as approved until explicit authorization is received.

**Approval destination:** `[BOSS_APPROVAL_WORKFLOW]`

## 6. Task Records & Memory

Save a concise task report containing:

- Sections evaluated and findings.
- Interview questions and answers.
- Proposed section revisions.
- Approval decisions and outstanding revisions.
- Unresolved issues requiring future attention.

**Output file:** `[TASK_FOLDER]/company-information-review.md`

Do not add evaluation details, interview history, or task-specific findings to the employee's long-term memory.

Keep information in task-scoped files only. Future tasks may retrieve these files when explicitly authorized.

## 7. Completion Criteria

The task is complete when:

- All 14 sections have been evaluated.
- Necessary clarification has been obtained or remaining uncertainties documented.
- Proposed improvements have been drafted.
- Each proposal has received an approval decision or remains explicitly pending.
- The task report has been saved.

**Final output:** A brief completion summary identifying approved, rejected, pending, and unresolved items.
