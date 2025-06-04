# Gantt Chart Feature

This document outlines the implementation of the new Gantt chart view in the PI Planner application, replacing the previous Roadmap view.

## Purpose

The Gantt chart view provides a visual representation of the roadmap, allowing users to see tasks and their dependencies over time in a Gantt format, organized by components.

## Implementation Details

### Files Modified/Created:

*   **`index.html`**:
    *   The "Roadmap View" button and its corresponding `div` container (`#roadmap-view`) have been removed.
    *   The `js/ui/roadmapView.js` script inclusion has been removed.
    *   A new "Gantt" button (`#gantt-view-btn`) and its `div` container (`#gantt-view`) were added.
    *   DHTMLX Gantt CSS and JavaScript CDN links were added to the `<head>` section.

*   **`js/ui/header.js`**:
    *   References to `roadmapViewBtn` and its event listener were removed.
    *   The `_switchView` function was updated to no longer manage the `RoadmapView`.
    *   Logic for the new "Gantt" button and view switching was added.

*   **`js/ui/ganttView.js` (New File)**:
    *   This module (`GanttView`) is responsible for initializing, rendering, and managing the DHTMLX Gantt chart.
    *   It includes `init()`, `show()`, and `hide()` public methods.
    *   The `_prepareGanttData()` private method transforms application data (Components and Tasks, linked via Sprints) into the DHTMLX Gantt format, establishing a hierarchy where Components are parent tasks and individual Tasks are child tasks.
    *   Component task dates are dynamically calculated based on the earliest start and latest end dates of their associated tasks.
    *   Component task colors are set to match the color of their first associated sub-task.
    *   The `_renderGanttChart()` private method initializes DHTMLX Gantt, configures its date format, sets the scale to months and weeks with a custom compact week format (`WS Day/Month`), defines columns, and loads the prepared data.
    *   The chart is set to `readonly`.
    *   The container (`#gantt-view`) is explicitly set to `height: 100%` and `width: 100%` to ensure it fills the available space, and `gantt.setSizes()` is called after parsing data.

*   **`js/main.js`**:
    *   The call to `RoadmapView.init()` was removed.
    *   A call to `GanttView.init()` was added within the `_initializeModules()` function.

*   **`tests/ganttView.test.js` (New File)**:
    *   Contains unit tests for the `GanttView` module.

*   **`style.css`**:
    *   Updated `html`, `body`, and `#app-main` to ensure full width and height.
    *   Modified `.view` and `#gantt-view` styles to ensure the Gantt chart container correctly expands and removes conflicting padding/borders. Added `position: relative; min-width: 0; min-height: 0;` to `#gantt-view`.

### Gantt Chart Enhancements (May 31, 2025)

*   **Error Fix & Filtering**:
    *   Corrected an error in `js/ui/ganttView.js` where `gantt.is_initialized()` was used. This has been replaced with the correct check `typeof gantt !== 'undefined' && gantt._obj`.
    *   The "Dependent Team" dropdown in the Gantt view now filters tasks. When a team is selected, the Gantt chart displays only tasks assigned to that `dependentTeam` and their parent components. Selecting "All Teams" removes the filter. This uses `gantt.attachEvent("onBeforeTaskDisplay", ...)`.
*   **Data Refresh Improvement**:
    *   The `_renderGanttChart` function in `js/ui/ganttView.js` was updated to improve data refresh logic.
    *   `gantt.init()` is now called only once when the Gantt chart is first initialized.
    *   Subsequent calls to `_renderGanttChart` (e.g., when switching to the Gantt view or changing scales/filters) will now use `gantt.clearAll()` to remove old data and then `gantt.parse()` to load fresh data into the existing Gantt instance. This aims to provide more reliable updates when underlying data (like tasks) changes.
    *   An outdated comment regarding sorting was removed from `_renderGanttChart`.
*   **Component Visibility Logic**:
    *   Modified `_prepareGanttData()` in `js/ui/ganttView.js` to only include components in the Gantt chart if they have at least one associated task. This addresses the user's feedback that "default tasks" (components) were not disappearing after their associated tasks were deleted.

### Settings Enhancements (May 31, 2025)

*   **Clear All Data Button**:
    *   Added a "Clear All Data" button to the Settings tab (`js/ui/settingsView.js`).
    *   This button allows users to permanently delete all PI Planner data (sprints, tasks, components, objectives, settings) from their browser's local storage.
    *   A warning prompt is displayed to the user before proceeding with the deletion, and the page reloads upon successful data clearance.

### DHTMLX Gantt Library

The application now uses DHTMLX Gantt via CDN. The following CDN links are included in the `<head>` section of `index.html`:

```html
<link rel="stylesheet" href="https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.css" type="text/css">
<script src="https://cdn.dhtmlx.com/gantt/edge/dhtmlxgantt.js" type="text/javascript"></script>
```

## Future Enhancements

*   **Data Integration Refinement**: Improve task date calculation (e.g., distribute tasks within sprints based on story points or dependencies).
*   **Interactivity**: Add event handlers for task clicks, date changes, and progress updates to allow interaction with the Gantt chart.
*   **Styling**: Further style the Gantt chart to match the application's theme, including custom bar templates for tasks/components.
*   **Dependencies**: Implement actual task-to-task dependency linking if the data model is extended to support it.
*   **View Modes**: Add UI controls to allow users to switch between different DHTMLX Gantt view modes (Day, Week, Month, Quarter, Year).
*   **Unit Tests**: Add comprehensive unit tests for the new filtering functionality and data refresh logic in `tests/ganttView.test.js`.
*   **Real-time Refresh**: Consider implementing an event-driven mechanism for `GanttView` to listen to data changes (e.g., task deletions/updates) and automatically refresh the chart if it's visible, without requiring a manual view switch or control change.
