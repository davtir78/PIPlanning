## Task Card Compaction Update

**Date:** 2025-06-04

**Changes Made:**

1.  **CSS Adjustments (`style.css`):**
    *   Reduced padding and margins for `.task-card` to make it smaller.
    *   Decreased font sizes for `.task-card .task-name`, `.task-card p`, and `.task-card .task-dependency` for a more compact look.
    *   Adjusted internal margins for `.task-card .task-name` and `.task-card p`.

2.  **JavaScript Adjustments (`js/ui/sprintBoardView.js` - `_renderTaskCard` function):**
    *   Modified the rendering of task cards to display "Story Points" and "Epic" on separate lines.
    *   Removed the display of "Dependent Team" information from the task card.

**Status:** Completed.

**Next Steps:**
*   Verify changes in the browser.
*   Commit changes if satisfactory.
