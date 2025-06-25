### 2025-06-25 - Import Issue Resolution

**Issue:** When importing an XLSX file from the welcome screen, tasks assigned to sprints were incorrectly moved to the backlog, while importing from the settings screen worked as expected.

**Analysis:**
- Both the welcome modal (`public/js/ui/welcomeModal.js`) and the settings view (`public/js/ui/settingsView.js`) use the `window.PIPlanner.ImportExport.importJIRA` function.
- The `_parseJIRAData` function within `importJIRA` (in `public/js/importExport.js`) explicitly sets `task.sprintId = null` if a sprint name from the JIRA data is not found in `Storage.getSprintByName()`.
- The root cause was identified as the order of operations within `importJIRA`. Sprints were being saved to `Storage` *after* tasks were processed, meaning that during an initial import (e.g., from the welcome screen where no sprints exist yet), `Storage.getSprintByName()` would fail to find the sprints, leading tasks to be assigned to the backlog. When importing from the settings screen, sprints might already exist, leading to correct assignment.

**Resolution:**
- Modified `public/js/importExport.js`.
- Reordered the saving process within the `importJIRA` function to ensure that `importedSprints` are saved to `Storage` *before* `importedTasks` are processed and saved. This guarantees that sprints are available in `Storage` when tasks are being linked, allowing for correct sprint assignment.

**File Modified:**
- `public/js/importExport.js`
