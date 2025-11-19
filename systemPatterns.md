# System Patterns: PI Planner

## Architectural Overview
The app follows a modular, single-page application (SPA) pattern without a framework, emphasizing loose coupling and browser-native features. Core components are organized into UI modules, data models, and utilities, with localStorage as the single source of truth.

## Key Design Patterns
- **Module Pattern (IIFE):** Each UI component (e.g., SprintBoardView, Header, SettingsView) is wrapped in an Immediately Invoked Function Expression to create private scopes and expose a public API (e.g., { init, show, hide, render }). This prevents global pollution and allows independent development/testing.
  
- **Facade Pattern (Storage Module):** storage.js acts as a facade for localStorage operations, providing methods like getSprints(), saveTasks(), getTaskById(). It abstracts raw localStorage (e.g., JSON serialization/deserialization, null checks), ensuring consistent data access across modules.

- **Observer/Event Pattern:** Limited use for cross-module communication:
  - Custom events (e.g., 'appDataInitialized' dispatched after welcome modal setup) trigger view updates.
  - DOM events for user interactions (clicks, drags); no central event bus, but modules listen to relevant elements.
  - On data changes (e.g., task move in SortableJS onEnd), re-render views and update capacities.

- **MVC-Like Structure:**
  - **Model:** Classes in models.js (Sprint, Task, Epic, PIObjective) define data structures; instances stored in localStorage via Storage.
  - **View:** UI modules render DOM dynamically (e.g., _renderInternal in SprintBoardView creates columns/cards using createElement from utils.js).
  - **Controller:** Main.js orchestrates init sequence; individual modules handle their logic (e.g., Header.switchView hides/shows views).

- **Template/Factory Patterns:** 
  - utils.js provides createElement for consistent DOM creation (like a simple template factory).
  - Feature templates in settings allow factory-like task creation from predefined structures.

- **State Management:** Implicit via localStorage; no Redux-like store. Views fetch fresh data on render/show (e.g., Storage.getTasks() in _renderInternal). Filters (text/traffic light) are local state in modules (e.g., currentFilterString in SprintBoardView).

- **View Switching:** Centralized in Header._switchView: Hides all views, shows target (via module.show() or direct display), updates active classes/buttons. Ensures single-view focus.

## Data Flow
1. App init (main.js): Load modules, show initial view (default: sprint-board).
2. User action (e.g., drag task): SortableJS onEnd updates Storage, triggers re-render.
3. Render: Modules query Storage, build DOM, attach listeners.
4. Persistence: All changes saved immediately to localStorage; no batching.

## Best Practices and Conventions
- **Naming:** CamelCase for functions/variables; PascalCase for classes; kebab-case for CSS classes/IDs.
- **Error Handling:** Console.error/warn for missing elements/modules; user alerts for critical (e.g., delete confirm).
- **Extensibility:** New views follow pattern: Add HTML div, script tag, init in main.js, button in header.
- **Performance:** Render on-demand (no virtual DOM); suitable for <1000 tasks.
- **Security:** Client-only; no sensitive data.

## Anti-Patterns to Avoid
- Globals: Enforced by IIFE.
- Tight Coupling: Modules depend only on Storage/utils, not each other directly.

This pattern supports easy extension (e.g., new reports) while keeping the codebase maintainable.
