### Task Duplication Feature

**Date:** 2025-06-05

**Description:**
Implemented a task duplication feature accessible from the task property panel. This allows users to create a copy of an existing task with a new unique ID and "(Copy)" appended to its name.

**Changes Made:**

1.  **`index.html`**:
    *   Added a new button with `id="duplicate-task-btn"` and text "Duplicate Task" within the `panel-footer` section of the `task-property-panel`.

2.  **`js/ui/taskPropertyPanel.js`**:
    *   Declared `duplicateTaskBtn` variable.
    *   Initialized `duplicateTaskBtn` by getting its DOM element in the `init` function.
    *   Added an event listener to `duplicateTaskBtn` to call a new private function `_handleDuplicate` on click.
    *   Implemented `_handleDuplicate()`:
        *   Retrieves the current task using its ID.
        *   Generates a new unique ID for the duplicated task.
        *   Creates a new `Task` object, copying properties from the original task and appending " (Copy)" to the name.
        *   Saves the new duplicated task to `Storage`.
        *   Closes the task property panel.
        *   Triggers re-rendering of `SprintBoardView` and `RoadmapView`, and updates `Header` capacities to reflect the new task.
    *   Modified `openPanel()`:
        *   Ensures the "Duplicate Task" button is visible (`display: inline-block`) when an existing task is being edited.
        *   Ensures the "Duplicate Task" button is hidden (`display: none`) when a new task is being added.

### Task Card Full Color

**Date:** 2025-06-05

**Description:**
Modified task cards to display the assigned color across the entire card background instead of just a left border. Text color on dark backgrounds is automatically adjusted for readability.

**Changes Made:**

1.  **`style.css`**:
    *   Modified `.task-card` styles:
        *   Removed `border-left` property.
        *   Added a subtle `border` around the card.
    *   Added `.task-card.dark-background` class to adjust text color to white for better contrast on dark task card backgrounds.

2.  **`js/ui/sprintBoardView.js`**:
    *   In `_renderTaskCard` function:
        *   Set `card.style.backgroundColor` to the task's color.
        *   Added logic to check if the `cardColor` is dark using the `isColorDark` utility function.
        *   If the color is dark, added the `dark-background` class to the card element.

3.  **`js/utils.js`**:
    *   Confirmed the `isColorDark` utility function is present and correctly implemented to determine if a given hex color is dark or light.

**Next Steps:**
*   Verify the functionality in the browser.
