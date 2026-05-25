---
description: Documentation-Driven Development (DDD) Workflow
---

# Docs-First Development Workflow

**THE GOLDEN RULE:** You are forbidden from writing any functional code (React/FastAPI) for a new feature or database change until the corresponding documentation has been updated and approved by the user.

## When to Use

This workflow is MANDATORY whenever you are asked to:
- Create a new API endpoint.
- Modify the database schema.
- Add a new major UI feature (requiring new state/props).
- Change core AI or WebSocket logic.

## Strict Documentation Constraints (The "Do Not Mess Up" Rules)

Before touching any documentation, you MUST adhere to these architectural rules:
1.  **Single Source of Truth:** Never create new generic files like `api_design.md` or `database_schema.md` in the root folder. All documentation MUST be placed inside the specific `docs/api/` or `docs/database_schema/` modular files.
2.  **Read the Map:** You MUST ALWAYS read `docs/api/README.md` and `docs/database_schema/README.md` first to understand where a feature belongs and what the Global Conventions are.
3.  **Strict Formatting:** * **Database:** You must use Markdown Tables matching the exact columns defined in the existing schema files (e.g., `| Name | Type | Constraints | Default | Description |`).
    * **API:** You must use the established header format: `### METHOD /path/to/endpoint` followed by Headers, Query Params/Body (in tables), and Response JSON blocks.
    * **Shared Types:** If an API uses common structures (like Pagination or UserBrief), reference `docs/api/shared_types.md` rather than duplicating the schema.
4.  **Cross-Linking:** Any new API endpoint added to `docs/api/*.md` MUST include a markdown link pointing to the corresponding database table in `docs/database_schema/*.md` (and vice versa).

---

## The 3-Step "Docs-First" Protocol

### Step 1: Document Retrieval & Analysis (The "Read" Phase)
Before proposing any solution, you MUST:
1. Read the Index `README.md` files in both the `api` and `database_schema` folders.
2. Locate the relevant modular documentation files based on the Traceability Matrix (e.g., `docs/api/social.md`, `docs/database_schema/social.md`).
3. Read the existing context to understand the current state.
4. Explicitly state to the user: *"I have reviewed the Index files and the current documentation for [Module Name]."*

### Step 2: The Implementation Plan & Docs Update (The "Write" Phase)
Do NOT output code yet. You must output an **Implementation Plan** that includes the exact Markdown text to update the docs.

**Your output must follow this format:**
1.  **Architecture Impact:** Briefly explain how this feature affects the Frontend, Backend, and Database. State which specific `.md` files will be updated.
2.  **Documentation Updates:**
    * **Database (`docs/database_schema/[module].md`):** Provide the exact Markdown table row(s) or new table(s) to be added.
    * **API (`docs/api/[module].md`):** Provide the exact Markdown block for the new/modified endpoint. Include Params, Request Body, and Response JSON. Ensure cross-links are present.
    * **Traceability Matrix (if applicable):** If a completely new domain is added, provide the row to update the matrix in `docs/api/README.md`.
3.  **User Review Required:** Explicitly ask the user: *"Please approve these documentation updates before I proceed to generate the actual code."*

### Step 3: Code Generation (The "Execute" Phase)
*ONLY AFTER* the user replies with "Approved" or "Proceed":
1. Generate the FastAPI/SQLAlchemy backend code exactly matching the newly approved API schema and Database tables.
2. Generate the React/Once UI frontend code expecting the exact JSON structure defined in the approved API schema.

---
## Anti-Patterns (What NOT to do)
- **The Cowboy Coder:** Generating `router.py` or `page.tsx` directly when asked for a new feature.
- **Silent Assumptions:** Adding a new column to a SQLAlchemy model without first adding it to the Markdown schema documentation.
- **Formatting Chaos:** Creating bulleted lists for database columns instead of using the standard Markdown tables.
- **Ignoring the Map:** Putting auth logic documentation into `content.md` because you didn't check the `README.md` index.