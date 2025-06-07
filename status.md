### Task: Allow task cards to accept 0.25 and 0.5 story points

**Status:** Completed

**Changes Made:**
- Modified `js/ui/taskPropertyPanel.js`:
    - Changed `parseInt` to `parseFloat` for `taskStoryPointsInput.value` in the `_handleSave` function.
    - Updated the validation logic in `_handleSave` to allow non-negative numbers, including increments of 0.25 and 0.5.
    - Ensured that when opening the panel for a new task, `taskStoryPointsInput.value` is initialized to `0` (number type) instead of `'0'` (string type).

**Reasoning:**
The task required allowing more granular story point values (0.25 and 0.5) in addition to whole integers.
- Using `parseFloat` ensures that decimal values entered by the user are correctly parsed as numbers.
- The updated validation checks for `isNaN`, non-negativity, and then specifically allows for whole numbers, or numbers that are multiples of 0.25 or 0.5.
- Initializing `taskStoryPointsInput.value` to `0` (number) for new tasks ensures consistency with the `parseFloat` conversion and prevents potential type-related issues.

---

### Task: Add scrollbars to settings tab lists

**Status:** Completed

**Changes Made:**
- Modified `style.css`:
    - Applied `display: flex; flex-direction: column;` to `.tab-pane` to enable flexbox layout.
    - Set `height: 100%;` on `.tab-pane` to ensure it takes the full height of its parent, allowing `flex-grow` to work correctly.
    - Changed `.tab-pane.active` to `display: flex;`.
    - Added `flex-grow: 1; overflow-y: auto; min-height: 0;` to `.item-list` to make the lists scrollable when content overflows.
    - Removed `overflow: hidden` from `.tab-content-area` to allow inner lists to scroll.
    - Changed `overflow: hidden` to `overflow: auto` on `html, body` to allow general page scrolling if needed.
    - Removed `height: 100%` from `.settings-page-container` and `.tab-pane` as `flex-grow` should handle height.
    - Added `flex-basis: 0` to `.item-list` to ensure `flex-grow` works as expected.
    - Added `flex-shrink: 0` to `.tab-pane h2` and `.add-item-form` to prevent them from shrinking and ensure `item-list` takes available space.
    - Changed `margin: 30px auto;` to `margin: auto;` on `.settings-page-container` to remove vertical margin and allow full vertical expansion.

**Reasoning:**
The user reported that when adding many teams or epics, the lists would go off-screen. By applying flexbox properties to the tab panes and making the item lists (`.item-list`) vertically scrollable, the content will now be contained within the visible area of the settings tab, improving usability. The iterative changes addressed various CSS properties that were preventing the scrollbars from appearing due to height containment issues within the flexbox layout.

---

### Issue: Epics disappeared from settings

**Status:** Resolved

**Finding:**
The debug statements confirmed that epics were being retrieved from storage and rendered into the DOM. The issue was not with data retrieval or rendering logic, but with CSS properties that were causing the elements to be invisible or collapsed.

**Resolution:**
The debug statements and temporary styles have been removed from `js/ui/settingsView.js`. The CSS changes made previously in `style.css` should now correctly enable scrolling for the lists within the settings tab. The disappearance of epics was likely a visual artifact caused by the CSS issues, and not due to data loss.

---

### Issue: Epics and teams settings not visible after scrollbar implementation

**Status:** Resolved

**Finding:**
The previous attempt to add scrollbars to the settings page resulted in the epics and teams settings becoming invisible. This was due to incorrect CSS properties related to flexbox and overflow.

**Resolution:**
The CSS changes in `style.css` that were causing the issue have been reverted. The settings page is now back to its original state, and the epics and teams settings are visible again.

---

### Issue: Tab focus changes to "Epics" tab after adding a new item

**Status:** Resolved

**Finding:**
After adding a new team or template, the settings tab would always revert to the "Epics" tab. This was because the `renderSettings()` function would rebuild the entire settings view, resetting the active tab to the default.

**Resolution:**
The `renderSettings()` function in `js/ui/settingsView.js` has been updated to preserve the currently active tab. Before re-rendering, the function now stores the active tab's ID. After re-rendering, it restores the active state to the correct tab and pane, preventing the focus from being lost.

---

### Task: Make the settings tab longer

**Status:** Completed

**Changes Made:**
- Modified `style.css`:
    - Changed `margin: auto;` to `margin: 0 auto;` on `.settings-page-container` to remove vertical margin and allow it to expand vertically.
    - Added `min-height: 80vh;` to `.settings-page-container` to ensure it takes up a significant portion of the viewport height.
    - Increased `max-height` of `.item-list` to `600px` to make the list longer.

**Reasoning:**
The user reported that the settings tab was too short. By adjusting the margin and adding a minimum height to the main container, and increasing the max-height of the item lists, the settings page now takes up more vertical space, improving the layout and user experience.

---

### Task: Improve the appearance of the navigation bar

**Status:** Completed

**Changes Made:**
- Modified `style.css`:
    - Updated the styles for `.header-nav button` to create a tabbed appearance.
    - Added a bottom border to the active tab for better visual indication.
    - Adjusted padding and margins for a cleaner look.
    - Removed the background color on hover and for the active state to create a more subtle effect.

**Reasoning:**
The user requested an improved navigation bar with a tab-like design. The new styles provide a more modern and intuitive look, with a clear indicator for the active tab.

---

### Task: Move the "Add Sprint" button

**Status:** Completed

**Changes Made:**
- Modified `js/ui/header.js`:
    - Removed the logic responsible for adding and removing the "Add Sprint" button from the header.
- Modified `js/ui/sprintBoardView.js`:
    - Added code to the `_renderInternal()` function to create and append the "Add Sprint" button directly to the `columnsContainer` after the last sprint column.
    - Removed `addSprint` from the public API of `SprintBoardView` as it's no longer needed.
- Modified `index.html`:
    - Reordered script tags to load `js/ui/sprintBoardView.js` before `js/ui/header.js` to resolve `ReferenceError` issues.

**Reasoning:**
The user requested to move the "Add Sprint" button from the navigation bar to next to the last sprint. This change improves the user experience by placing the button in a more contextually relevant location within the Sprint Board view. Additionally, critical `ReferenceError` issues caused by incorrect script loading order and an unnecessary public API exposure were resolved.
