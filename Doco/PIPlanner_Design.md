# PI Planner Web App - Detailed Requirements

## Overview
Create a single-page HTML web application for Program Increment (PI) Planning that resembles Microsoft Planner's clean interface design.

## Project Status (as of 2025-06-04)

### Phase 1: Project Foundation & Core Setup - ✅ Complete
- **Initial File Structure**:
    - `index.html` created with basic page layout.
    - `style.css` created with global styles and initial theming.
    - JavaScript files created and structured for traditional script loading (no ES6 modules due to `file:///` constraints):
        - `js/config.js`: Application constants.
        - `js/utils.js`: Utility functions (ID generation, element creation).
        - `js/models.js`: Data models (Sprint, Task, Epic, PIObjective classes).
        - `js/storage.js`: localStorage interaction utilities.
        - `js/main.js`: Main application orchestration.
- **Data Management**:
    - localStorage functions for saving/loading sprints, tasks, epics, objectives, and settings.
    - **Implemented storage for Dependent Teams.**
- **First-Time User Experience**:
    - Welcome modal (`js/ui/welcomeModal.js`) displayed if no existing data.
    - "Quick Setup" option in modal:
        - Generates 12 sprints with user-defined start date, length, and capacity.
        - Creates 5 default epics.
        - Creates sample backlog tasks.
        - Saves all generated data to localStorage (`js/data/initialSetup.js`).
        - **Saves default Dependent Teams to localStorage.**
    - Application bypasses modal if data exists.
    - **Automatic Quick Setup on No Data**: RESOLVED. The application no longer automatically performs a quick setup if no data is found. Instead, it now consistently displays the welcome modal, allowing the user to choose between quick setup or importing data. This was achieved by modifying `js/main.js` to remove the automatic quick setup call and updating `js/ui/welcomeModal.js` to handle the display of the modal based on data presence.
    - **Configurable Quick Setup Sprints**: RESOLVED. The "Quick Setup" option in the welcome dialog now generates 6 sprints by default (instead of 12), and the button text has been updated accordingly. This was achieved by passing the desired number of sprints to the `performQuickSetup` function in `js/ui/welcomeModal.js` and updating `js/data/initialSetup.js` to correctly accept and use this parameter.
    - **No Default Tasks on Quick Setup**: RESOLVED. The quick setup process no longer generates default sample tasks. This was achieved by removing the task generation and saving logic from `js/data/initialSetup.js`.
- **Technical Refactor**:
    - Switched from ES6 modules to traditional script loading to ensure compatibility with `file:///` protocol and "no server" constraint.
    - **Refactored storage access to use a global `Storage` object (IIFE pattern) to resolve `ReferenceError`s.**
    - **Addressed `Storage.getEpicById is not a function` error in `js/roadmapView.js` by ensuring the `getEpicById` function was correctly defined and exposed in the `js/storage.js` public API.**
    - **Resolved CSS errors in `style.css` by removing incorrectly commented-out blocks.**
    - **Confirmed implementation of Phases 1-5 aligns with the document.**

### Recent Work (as of 2025-06-04)
- **Gantt Chart Text Color**: Changed text color on Gantt chart bars from white to black for improved readability (`style.css`).
- **Dependent Team Display on Task Cards**: Implemented display of a chain icon and dependent team name on Sprint Board task cards (`js/ui/sprintBoardView.js`, `style.css`).
- **Task Property Panel Dependent Team Dropdown Fix**: Resolved issue where Dependent Team dropdown in Task Property Panel was not populating correctly (`js/ui/taskPropertyPanel.js`).
- **Backlog Button Width Adjustment**: Adjusted width of backlog buttons to match sprint column buttons for visual consistency (`style.css`, `js/ui/sprintBoardView.js`).
- **Code Alignment with Design**: Reviewed and adjusted code to ensure it matches the completed phases (1-5) described in this document.
- **Header Update**: Removed the "PI Objectives" button from `index.html` and its corresponding event listener from `js/ui/header.js` as per clarification.
- **Roadmap View Task Card Enhancement**: Updated task card rendering in `js/ui/roadmapView.js` to use the standard `.task-card` class and display Task Name, Story Points, Epic, Color Indicator (left border), and Dependency Indicator (chain icon).
- **Bug Fixes**:
    - Fixed `Uncaught TypeError: Storage.getEpicById is not a function` in `js/roadmapView.js` by correcting the export in `js/storage.js`.
    - Fixed CSS parsing errors in `style.css` caused by incorrectly formatted commented-out blocks.
- **Settings Page Visual Upgrade**:
    - Implemented tabbed navigation for settings sections (`Epics`, `Teams`, `Templates`, `Import/Export`, `Danger Zone`) in `js/ui/settingsView.js` and `style.css`.
    - Styled tabs for inactive, active, and hover states.
    - Updated styling for list items, add item forms, and buttons within settings tabs (`style.css`).
    - Ensured "Edit" and "Delete" buttons in settings lists are displayed side-by-side (`style.css`).
- **"Add Sprint" Button Visibility**:
    - The global "Add Sprint" button in the header is now dynamically added/removed based on the active view, appearing only on the "Sprint Board" screen (`index.html`, `js/ui/header.js`, `js/main.js`).
- **Sprint Board Button Styling**:
    - "Add Task" buttons on the Sprint Board (both sprint-specific and backlog) are now styled with the accent green color, matching the primary buttons on the settings screen (`style.css`).
- **Roadmap View Reversion**:
    - Reverted the Roadmap View implementation to the original Gantt chart functionality as requested by the user (`index.html`, `js/ui/header.js`, `js/main.js`, `js/ui/ganttView.js`, `js/ui/roadmapView.js`). The "Roadmap" button now displays the Gantt chart.

### Phase 2: Header & Navigation - ✅ Complete
- **Header Implementation (`index.html`, `style.css`)**:
    - Header displays application title ("PI Planner").
    - **Tab-based navigation implemented with buttons for "Sprint Board", "Roadmap View", and "Settings".**
    - **Removed separate "Dependencies", "Import CSV", and "Export CSV" buttons from the header.**
- **Navigation Logic (`js/ui/header.js`)**:
    - Basic view switching functionality implemented: clicking view toggle buttons shows/hides the corresponding view `div` and updates button's active state.
    - **Logic for "Dependencies", "Import CSV", and "Export CSV" buttons removed from `header.js` as they are no longer in the header.**
    - **Removed "PI Objectives" button from the header.**

### Phase 3: Sprint Board View - ✅ Complete
- **Layout & Structure (`index.html`, `style.css`, `js/ui/sprintBoardView.js`)**:
    - Rendering of a "Backlog" column.
    - Dynamic rendering of sprint columns based on data from localStorage.
    - Columns are arranged horizontally with overflow scrolling.
    - **Resolved horizontal scrollbar issue by adjusting flexbox and overflow styles.**
    - **Implemented vertical scrolling within individual sprint columns when content overflows.**
- **Sprint Column Header Display**:
    - Sprint name, date range, and capacity (used points / total capacity) are displayed.
    - Visual indicator for over-capacity sprints.
- **Task Card Rendering**:
    - Tasks are displayed as cards within their respective columns (Backlog or Sprints).
    - Cards show: Task Name, Story Points, Epic, Color Indicator, and Dependency Indicator.
    - **Improved task card styling for better contrast and compactness.**
- **Editable Sprint Details**:
    - Sprint names are editable on click.
    - Sprint date ranges are editable on click (using date inputs).
- **Task Management**:
    - "+ Add Task" buttons in Backlog and Sprint columns open a Task Property Panel.
    - Clicking an existing task card opens the Task Property Panel for editing.
    - Task Property Panel (`js/ui/taskPropertyPanel.js`) allows setting/editing: Name, Story Points, Epic, Color, Dependent Team.
    - **Added "Delete Task" button to the Task Property Panel for editing existing tasks.**
- **"Add Sprint" Functionality**:
    - "+ Add Sprint" button allows creation of new sprints with user-provided details (name, dates, capacity) via prompts.
- **Drag and Drop Functionality (SortableJS)**:
    - Tasks can be dragged between Backlog and Sprint columns, and between Sprint columns.
    - Task's `sprintId` is updated on drop.
    - Sprint story point totals are recalculated and display updated.
    - **Changed capacity check behavior to allow drag and drop into over-capacity sprints, with visual indication instead of preventing the drop.**

### Phase 4: Roadmap View - ✅ Complete (Initial Rendering & Drag/Drop)
- **Layout & Structure (`index.html`, `style.css`, `js/ui/roadmapView.js`)**:
    - Basic grid rendering with Epic rows and Sprints/Backlog columns.
    - Display of tasks within intersection cells.
    - Drag and drop implemented for moving tasks between intersections.
    - Capacity check integrated into drag and drop.

### Phase 5: Settings View - ✅ Complete (Manage Epics & Dependent Teams, Import/Export)
- **Layout & Structure (`index.html`, `style.css`, `js/ui/settingsView.js`)**:
    - New "Settings" view added.
    - Displays lists of Epics and Dependent Teams.
    - **Includes dedicated sections for Import and Export functionality.**
- **Management Functionality**:
    - Allows adding new Epics and Dependent Teams.
    - Allows editing existing Epics and Dependent Teams.
    - Allows deleting existing Epics and Dependent Teams.
    - **Provides functionality to import all application data from a JSON file.**
    - **Provides functionality to export all application data to a JSON file.**
    - Data is persisted in localStorage.
- **Integration**:
    - Task Property Panel and Feature Template Modal now fetch Epic and Dependent Team lists from storage.

### Future Phases
- Phase 6: Styling, UX, and Refinements (Sprint Board scrollbar issue resolved)
- Phase 7: Testing & Documentation
- **Configurable Feature Templates**: IMPLEMENTED. The application now allows users to manage feature task templates (add, edit, delete) through a new section in the Settings view. The "Add Feature from Template" functionality now uses these user-configured templates. This was achieved by:
    - Adding a new local storage key (`LOCAL_STORAGE_KEY_FEATURE_TEMPLATES`) in `js/config.js`.
    - Implementing `getFeatureTemplates` and `saveFeatureTemplates` in `js/storage.js`.
    - Initializing default templates in `js/data/initialSetup.js` if none exist.
    - Adding a "Manage Feature Templates" section with CRUD UI in `js/ui/settingsView.js`.
    - Modifying `js/ui/featureTemplateModal.js` to fetch templates from storage.

---

## Header Section
- **Background**: Purple color scheme
- **Title**: "PI Planner" (prominent, centered)
### Navigation Enhancement
- **View Toggle Buttons**:
  - Sprint Board (default)
  - Roadmap View  
- **Optional Dependencies Panel** (collapsible sidebar):
  - List of tasks with team dependencies
  - Quick filter by dependent team
- **Controls** (right-aligned):
  - **Import CSV** button: Upload CSV files containing sprint and task data
  - **Export CSV** button: Download combined sprint metadata and task data as a single CSV file

## Main Content Layout

### View Management
- **Default View**: Sprint Board (Kanban-style columns for PI sprints)
- **Toggle Button**: "Display Roadmap" switches between views
- **Smooth Transition**: Fade or slide animation between views

### Roadmap View
#### Layout Structure
- **Matrix Grid Design**: 
  - **Vertical Axis**: Epics (rows)
  - **Horizontal Axis**: Sprints (columns) + Backlog column on left
  - **Calendar Header**: Show sprint date ranges as timeline
  - **Backlog Integration**: Show backlog tasks in leftmost column by epic

#### Visual Elements
- **Sprint Columns**: 
  - Vertical bars spanning full height
  - Header shows PI sprint name and date range
  - Each column has consistent width
  - Alternating background colors for visual separation

- **Epic Rows**:
  - Horizontal bars spanning full width
  - Left sidebar shows epic names
  - Each row has consistent height
  - Clear row separators

- **Task Intersection Boxes**:
  - Located where PI sprint columns and epic rows meet
  - **Backlog Intersection**: Leftmost column shows unplanned tasks by epic
  - Display all task names for that PI sprint/epic combination
  - **Task Display Options**:
    - Compact list view with task names
    - Color-coded task chips
    - Story point totals per intersection
    - Clickable tasks (opens same property panel as Sprint Board)
  - **Drag and Drop**: Tasks can be dragged between backlog and sprint intersections

#### Roadmap Interactions
- **Hover Effects**: Highlight entire row/column when hovering over intersections
- **Task Management**: 
  - Click tasks to edit (same property panel as Sprint Board)
  - Drag tasks between intersections to change PI sprint/epic assignment
  - Right-click context menu for quick actions
- **Zoom Controls**: 
  - Fit to screen / zoom in/out for detailed view
  - Scroll horizontally and vertically for large roadmaps

#### Roadmap Data Visualization
- **Capacity Indicators**:
  - Show story point totals per PI sprint column
  - Show story point totals per epic row  
  - Visual indicators for over-capacity (red highlights)
- **Progress Indicators**:
  - Optional: Show completion percentage per intersection
  - Color intensity based on task density
- **Empty State**: 
  - Show placeholder text in empty intersections
  - "Drop tasks here" messaging during drag operations

### Sprint Board View (Default)
### Sprint Columns
- Display PI sprints as **vertical columns** arranged horizontally across the page
- Each column should:
  - Take full available height minus header
  - Have equal width with horizontal scrolling if needed
  - Be clearly separated with subtle borders

### Sprint Column Header
- **Sprint Name** (editable on click)
- **Date Range**: Start Date - End Date (editable date pickers)
- **Story Points**: "X / Y points" (used vs. available capacity)
- **Visual Indicator**: Red background highlight when story points exceed capacity
- **Add Sprint** button (+ icon) at the end of columns

### Task Management
#### Task Cards Enhancement
Each task card should also display:
- **Task Name** (primary text)
- **Story Points** (badge/chip style)
- **Epic** (smaller text or tag)
- **Color Indicator** (left border or background tint)
- **Dependency Indicator** (small chain icon if task has team dependency)
- **Hover Effects**: Subtle elevation/shadow

#### Adding Tasks Enhancement
- **Primary "Add Task" Button**: Located in backlog column header
- **Secondary Add Buttons**: Each sprint column can still have "+ Add Task" for direct sprint assignment
- **Default Behavior**: Main "Add Task" creates tasks in backlog
- **Sprint-Specific**: Sprint column buttons create tasks directly in that sprint
- **New Task Flow**: 
  1. Click "Add Task" in backlog
  2. Task appears as "New Task" in backlog
  3. Edit task properties as needed
  4. Drag to appropriate sprint when ready

#### Task Editing Enhancement
- **Click any task** to open property panel
- **Property Panel** (slide-in from right or modal):
  - Task Name (text input)
  - Story Points (number input)
  - Epic (dropdown or text input)
  - Color (color picker with predefined palette)
  - **Dependent Team** (dropdown: None, Frontend Team, Backend Team, QA Team, DevOps Team, etc.)
  - Save/Cancel buttons

## Drag and Drop Functionality
- Use **SortableJS library** (import from CDN)
- Allow dragging tasks between backlog and any sprint columns
- Allow dragging tasks between sprint columns
- **Enhanced Visual Feedback**: 
  - Dragging item becomes semi-transparent
  - **Capacity Preview**: Show capacity impact when hovering over sprint columns
  - **Over-Capacity Warning**: Sprint columns highlight in red if drop would exceed capacity
  - Drop zones highlight when dragging over them
  - Smooth animations for reordering
- **Capacity Protection** (optional): Warning dialog when dropping would exceed sprint capacity

## Initial Setup & Data Management

### First-Time User Experience
When the application loads with no existing data (empty localStorage):

#### Welcome Modal/Screen
- **Title**: "Welcome to PI Planner"
- **Subtitle**: "Get started by setting up your Program Increment"
- **Two Setup Options**:

**Option 1: Quick Setup**
- **Form Fields**:
  - PI Start Date (date picker)
  - Sprint Length (dropdown: 1 week, 2 weeks, 3 weeks)
  - Team Capacity per Sprint (number input, default: 40 story points)
- **"Generate 12 Sprints" Button**: 
  - Creates PI sprints automatically (PI 24.1 - Sprint 1, Sprint 2, etc.)
  - Calculates dates based on sprint length
  - Sets consistent capacity across all sprints
- **Default Epics**: Creates 5 default epics (Frontend, Backend, Database, Testing, Design)

**Option 2: Import Data**
- **"Import CSV" Button**: Same functionality as main import
- **File Format Help**: Link to show expected CSV structure
- **Sample CSV Download**: Provide template file

#### Setup Validation
- **Date Validation**: Ensure start date is not in the past
- **Capacity Validation**: Story points must be positive number
- **Confirmation Screen**: Preview generated sprints before creating

### Existing Data Detection
- **Auto-load**: If localStorage contains data, skip welcome screen
- **Data Migration**: Handle version changes gracefully
- **Reset Option**: "Clear All Data" button in settings (with confirmation)

## Data Management
### CSV Import Format Enhancement
Expected columns:
- **Sprint Data**: PI Sprint Name, Start Date, End Date, Story Points Available
- **Task Data**: Task Name, Story Points, Epic, Color, PI Sprint Assignment (can be "Backlog"), Dependent Team
- **Objectives**: Team Name, Objective Description, Business Value

### CSV Export Format
- Combined file with both PI sprint metadata and task details
- Include all task properties and PI sprint assignments

## Styling Requirements
### Color Scheme
- **Primary**: Light purple (#E6E6FA or similar)
- **Secondary**: Green accents (#90EE90 or similar)  
- **Background**: White/off-white
- **Text**: Dark gray for readability

### Design Guidelines
- **Modern, clean aesthetic** similar to Microsoft Planner
- **Responsive design** (works on desktop and tablet)
- **Typography**: Clean sans-serif font (system fonts acceptable)
- **Spacing**: Generous whitespace, consistent padding/margins
- **Shadows**: Subtle card shadows for depth
- **Transitions**: Smooth hover and interaction animations

## Technical Constraints
- **Frontend Only**: HTML, CSS, JavaScript (no server/backend)
- **Browser Storage**: Use localStorage to persist data between sessions
- **File Handling**: Use FileReader API for CSV import
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

## User Experience Features
- **Auto-save**: Automatically save changes to localStorage
- **Setup Wizard**: Guided first-time user experience
- **Data Validation**: Prevent invalid dates and negative story points
- **Undo/Redo**: Basic undo functionality for task moves
- **View Switching**: Seamless transition between Sprint Board and Roadmap
- **Keyboard Shortcuts**: 
  - ESC to close property panel
  - Enter to save task edits
  - Tab to switch between views
- **Loading States**: Show feedback during CSV import/export and initial setup
- **Error Handling**: Graceful handling of invalid CSV files and setup data

## Sample Data
**Note**: Sample data should only be used if user skips initial setup

Include 2-3 pre-populated PI sprints with sample tasks to demonstrate functionality:
- PI Sprint 1: "PI 24.1 - Sprint 1" (2 weeks, 40 points capacity)
- PI Sprint 2: "PI 24.1 - Sprint 2" (2 weeks, 35 points capacity)  
- PI Sprint 3: "PI 24.1 - Sprint 3" (2 weeks, 30 points capacity)
- **Epics**: Frontend, Backend, Database, Testing, Design
- Various sample tasks distributed across different epics and PI sprints to showcase roadmap intersections

**Setup-Generated Data Format**:
- PI Sprint naming: "PI {YEAR}.{QUARTER} - Sprint {NUMBER}"
- Sequential dates based on chosen sprint length
- Consistent capacity across all 12 sprints
- Default epics with placeholder tasks (optional)
- **Sample backlog tasks**: Create 5-10 unassigned tasks in backlog to demonstrate drag-and-drop workflow

## Known Issues
- **Task Property Panel Not Closing Visually**: RESOLVED. The issue was due to a conflict between JavaScript's direct style manipulation and CSS transitions. Fixed by managing panel visibility and transitions purely through CSS classes (`.panel` and `.panel.open`) and removing explicit `display` and `z-index` manipulation from JavaScript.
- **`Uncaught TypeError: Storage.getComponents is not a function` when adding feature from template**: RESOLVED. The `FeatureTemplateModal` was attempting to call a deprecated `Storage.getComponents()` function. Fixed by updating `js/ui/featureTemplateModal.js` to correctly use `Storage.getEpics()`.
- **`Uncaught TypeError: Cannot read properties of null (reading 'classList')` during task deletion**: RESOLVED. This error occurred because `document.getElementById('roadmap-view')` was returning `null` in `sprintBoardView.js` during the `onEnd` event of the drag-and-drop. Fixed by adding a null-check for the `roadmap-view` element before attempting to access its `style` property.
- **`Uncaught TypeError: Cannot read properties of null (reading 'classList')` during task deletion**: RESOLVED. This error occurred because `document.getElementById('sprint-board-view')` or `document.getElementById('roadmap-view')` was returning `null` in `taskPropertyPanel.js` during the `_handleDelete` function. Fixed by adding null-checks for these elements before accessing their `classList` property.
