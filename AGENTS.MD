# AGENTS.md — C4T Frontend

## 1. Project context

C4T (Call for Talks) is a university congress management system developed as a final university project.

The frontend is built with React, TypeScript, Vite and Material UI. It communicates with a Java Spring Boot backend through REST APIs.

The application supports different roles, including Administrator, Presenter, Evaluator and Attendee.

The goal is to build a maintainable, understandable and consistent application while preserving the visual identity and functional requirements of C4T.

This repository is developed collaboratively by a team of five developers using Codex as a development assistant.

Codex must support the team's decisions, not replace developer judgment.

## 2. Development methodology

Follow a specification-driven and incremental development approach.

Before implementing a feature:

1. Read the relevant project documentation.
2. Analyze the functional requirements and existing code.
3. Identify the files and components affected.
4. Propose an implementation plan.
5. Explain relevant architectural decisions and trade-offs.
6. Wait for explicit approval before modifying files.

Implement one manageable increment at a time.

Do not generate entire features, introduce large architectural changes or refactor unrelated modules without authorization.

Prefer simple, maintainable solutions over unnecessary abstractions.

Do not assume that faster code generation is more important than understanding the implementation.

## 3. Documentation and source of truth

Before starting a task, consult the relevant documents:

- `README.md`: project setup, technologies and execution.
- `docs/FRONTEND-WORKFLOW.md`: team development workflow.
- The active feature specification under `docs/`.
- Approved screenshots and visual references.
- Existing source code and related components.

The functional specification defines the approved requirements, business rules and acceptance criteria.

The existing code defines the current technical implementation and must be inspected before proposing changes.

`AGENTS.md` defines development conventions and collaboration rules.

If documents conflict, identify the conflict and request clarification rather than silently choosing an interpretation.

Do not invent missing requirements.

## 4. Frontend architecture

Respect the existing feature-based organization.

- `src/app/`: application configuration, router, providers and theme.
- `src/features/`: domain-specific pages, components, services, types and validation schemas.
- `src/layouts/`: shared application layouts.
- `src/components/`: genuinely reusable components shared across features.
- `src/lib/`: shared technical infrastructure.
- `src/styles/`: global styles.

Keep business-specific components within their corresponding features.

Extract components into shared directories only when there is a clear reuse requirement.

Do not introduce new architectural patterns, global state libraries or dependencies without explaining their necessity.

Prefer evolving existing structures over creating parallel implementations.

## 5. React and TypeScript conventions

- Use functional React components and hooks.
- Use TypeScript types and interfaces where appropriate.
- Avoid `any` and `@ts-nocheck` in new code.
- Keep components focused on a clear responsibility.
- Prefer props over hardcoded values when components represent reusable data.
- Avoid duplicating business logic.
- Follow the naming and export conventions already used in the repository.
- Keep routing centralized in `src/app/router.tsx`.

Use React Hook Form and Zod for forms requiring validation.

Use the existing Axios instance for HTTP communication.

Use TanStack Query when managing remote server state.

Do not introduce global state management unless there is a justified requirement.

Avoid unnecessary custom hooks, contexts and abstractions.

When a technical decision has multiple reasonable alternatives, explain the simplest viable approach and its trade-offs.

## 6. Backend integration

The frontend consumes a REST API developed with Spring Boot.

Before integrating an endpoint:

1. Inspect the existing frontend API services.
2. Consult the backend Swagger/OpenAPI documentation when available.
3. Verify request and response contracts.
4. Reuse the existing Axios configuration.
5. Handle loading, error and success states appropriately.
6. Preserve the application's authentication behavior.

Do not invent endpoints, DTO fields or backend business rules.

If an endpoint is unavailable or its contract is unclear, report the dependency before implementing.

When a feature explicitly requires mock data, use typed mocks and keep them separate from presentation components.

Do not replace existing backend integrations with mocks without approval.

## 7. UI and visual identity

Use Material UI and the existing C4T theme.

Preserve the established visual identity:

- Primary burgundy: `#7A1F3A`.
- Dark burgundy: `#4C1224`.
- Cream: `#F3EFEE`.
- Soft pink: `#F3E1E6`.
- Main text: `#241B1F`.

Typography:

- IBM Plex Sans: interface text and controls.
- Source Serif 4: titles and visual hierarchy.
- IBM Plex Mono: technical identifiers and contextual labels.

Prefer existing theme tokens over hardcoded colors.

Use MUI components and `sx` for component-specific styling.

Design primarily for desktop and laptop environments.

- Mobile and tablet responsive layouts are not required for the current MVP.
- Ensure correct rendering at common desktop resolutions, including 1366 × 768 and 1920 × 1080.
- Avoid unnecessary responsive breakpoints and mobile-specific components.
- Preserve accessibility, readable typography and consistent spacing.

Avoid introducing new styling libraries without approval.

## 8. Versioned visual prototype

The C4T prototype is versioned and preserves previous versions.

Example reference:

https://prototipo-congresos.juanchonoli.chatgpt.site/?v=0.7.5

Each feature specification must identify the approved prototype version used as its visual reference.

Before implementing a screen:

1. Read the prototype version recorded in the feature specification.
2. Review the corresponding screenshots.
3. Identify visual requirements relevant to the active task.
4. Compare the implementation against those references.

Do not automatically switch to a newer prototype version.

If the prototype changes during development, report the differences and request confirmation before incorporating them.

The prototype is a visual reference, not a substitute for functional specifications.

Do not claim to have inspected prototype interactions unless they were actually verified.

## 9. Scope and collaborative development

This repository is shared by multiple developers working on different features.

Respect the scope of the active task.

Before modifying files:

- Inspect the current working tree and relevant existing changes.
- Identify files shared with other features.
- Check whether the proposed changes may affect another developer's work.
- Report potential conflicts before implementing.

Changes to shared infrastructure require particular care, including:

- `src/app/router.tsx`
- `src/app/providers.tsx`
- `src/app/theme.ts`
- Shared layouts and components.
- HTTP client configuration.
- Shared types and utilities.

Do not modify legacy components developed by other team members unless necessary and explicitly approved.

Do not overwrite, discard, reset or revert changes belonging to other developers.

Do not silently fix unrelated issues.

If an existing problem is discovered, report it and explain its impact before proposing a correction.

Preserve existing behavior unless a change is explicitly requested.

Do not modify backend repositories from this frontend workspace.

## 10. Comments and documentation

Write code that is understandable to other developers.

Use comments to explain:

- Architectural decisions.
- Non-obvious business rules.
- Technical constraints.
- Reasons behind important implementation choices.

Avoid comments that merely repeat what the code already expresses.

Keep documentation synchronized with approved changes.

When a requirement changes, identify which specification must be updated.

Do not generate unnecessary documentation files for small implementation details.

## 11. Git workflow

Use feature branches created from `develop`, following the team's branching strategy.

Follow the team's commit convention:

`type[TICKET]: short description`

Example:

`feat[FE-03]: add administrator congress selection page`

Write commit descriptions in English.

Do not create commits, push branches, merge changes or open pull requests without explicit authorization.

Keep changes focused on the active task.

Review the diff before proposing a commit.

Do not use destructive Git commands to resolve problems without explicit approval.

If the active branch contains changes from other developers, preserve them and report potential conflicts.

## 12. Validation and quality

Before considering a change complete, run the relevant available project checks:

- `npm run build`
- `npm run lint`
- `npm run format:check`

For TypeScript-specific validation, inspect the project's TypeScript configuration and use an appropriate type-check command.

Do not assume that the Vite build performs complete TypeScript type checking.

The repository currently does not define a dedicated automated test script in `package.json`.

When tests are introduced, execute the tests relevant to the active change.

Report validation results accurately.

Do not claim that a command passed unless it was executed successfully.

If a check fails because of pre-existing code, distinguish that failure from errors introduced by the current change.

Do not modify unrelated files merely to make a check pass.

Also verify relevant functional acceptance criteria and visual requirements.

## 13. Working with the developer

Act as a collaborative senior developer and technical mentor.

The developer should understand the implementation rather than accept automatically generated code.

For each meaningful change:

1. Explain what problem is being solved.
2. Describe the proposed solution.
3. Explain why that approach is appropriate.
4. Identify the files that will be affected.
5. Wait for approval before implementing.
6. Implement only the approved increment.
7. Summarize the changes and explain how to validate them.

Communicate in Argentine Spanish.

Keep technical explanations clear, practical and educational.

Prioritize learning, maintainability, correctness and collaboration over development speed.

Avoid excessive explanations for trivial changes, but explain architectural decisions and non-obvious behavior.

## 14. Completion criteria

An implementation increment is ready for developer review when:

- It respects the approved specification.
- It stays within the agreed scope.
- Its functional behavior has been checked.
- Its visual result has been compared with the approved reference when applicable.
- Relevant technical checks have been executed.
- The developer has received a summary of modified files.
- Any remaining limitations or risks have been reported.
- No commit, push or merge has been performed without authorization.

Do not mark an entire feature as complete when only one increment has been implemented.