// PI Planner Header UI Logic

const Header = (() => {
    // DOM Elements for header controls
    let sprintBoardBtn = null;
    let ganttViewBtn = null;
    let settingsBtn = null;
    let headerControlsEl = null; // Reference to the header-controls div
    let viewToggleButtons = null;

    /**
     * Handles switching between different application views.
     * @param {string} targetViewId - The ID of the view to display.
     * @private
     */
    function _switchView(targetViewId) {
        // Hide all views first, then show the target one
        if (typeof SprintBoardView !== 'undefined') SprintBoardView.hide();
        if (typeof GanttView !== 'undefined') GanttView.hide();
        const piObjectivesViewEl = document.getElementById('pi-objectives-view');
        if (piObjectivesViewEl) piObjectivesViewEl.style.display = 'none';
        const settingsViewEl = document.getElementById('settings-view');
        if (settingsViewEl) settingsViewEl.style.display = 'none';

        // Show the target view using its module's show method
        if (targetViewId === 'sprint-board-view' && typeof SprintBoardView !== 'undefined') {
            SprintBoardView.show();
            _addSprintButton(); // Add sprint button when sprint board is active
        } else if (targetViewId === 'gantt-view') {
            if (typeof GanttView !== 'undefined') {
                GanttView.show();
            } else {
                const ganttViewEl = document.getElementById('gantt-view');
                if (ganttViewEl) ganttViewEl.style.display = 'block';
                console.error("GanttView module not defined.");
            }
            _removeSprintButton(); // Remove sprint button for other views
        } else if (targetViewId === 'settings-view') {
             if (typeof SettingsView !== 'undefined') {
                 SettingsView.show();
             } else {
                 if (settingsViewEl) settingsViewEl.style.display = 'block';
                 console.error("SettingsView module not defined.");
             }
             _removeSprintButton(); // Remove sprint button for other views
        }
        else {
            const targetViewEl = document.getElementById(targetViewId);
            if (targetViewEl) targetViewEl.style.display = 'block';
            _removeSprintButton(); // Remove sprint button for other views
        }

        // Update active button state
        if (viewToggleButtons) {
            viewToggleButtons.forEach(button => {
                if (button.dataset.view === targetViewId) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }

        // Update .active-view class on view containers
        document.querySelectorAll('.view').forEach(v => {
            if (v.id === targetViewId) {
                v.classList.add('active-view');
            } else {
                v.classList.remove('active-view');
            }
        });

        console.log(`Switched to view: ${targetViewId}`);
    }

    /**
     * Dynamically adds the "+ Add Sprint" button to the header controls.
     * @private
     */
    function _addSprintButton() {
        if (!headerControlsEl) return;
        // Check if button already exists to prevent duplicates
        if (!headerControlsEl.querySelector('#add-sprint-btn')) {
            const addSprintBtn = createElement('button', 'global-add-sprint-btn', { id: 'add-sprint-btn' }, '+ Add Sprint');
            addSprintBtn.addEventListener('click', () => {
                if (typeof SprintBoardView !== 'undefined' && SprintBoardView.addSprint) {
                    SprintBoardView.addSprint();
                } else {
                    console.warn("SprintBoardView.addSprint method not available.");
                }
            });
            headerControlsEl.appendChild(addSprintBtn);
        }
    }

    /**
     * Dynamically removes the "+ Add Sprint" button from the header controls.
     * @private
     */
    function _removeSprintButton() {
        if (!headerControlsEl) return;
        const addSprintBtn = headerControlsEl.querySelector('#add-sprint-btn');
        if (addSprintBtn) {
            addSprintBtn.remove();
        }
    }

    /**
     * Initializes event listeners for all header controls.
     */
    function init() {
        sprintBoardBtn = document.getElementById('sprint-board-btn');
        ganttViewBtn = document.getElementById('gantt-view-btn');
        settingsBtn = document.getElementById('settings-btn');
        headerControlsEl = document.getElementById('header-controls'); // Get reference to the header-controls div
        viewToggleButtons = document.querySelectorAll('.view-toggle-btn');

        if (sprintBoardBtn) {
            sprintBoardBtn.addEventListener('click', () => _switchView('sprint-board-view'));
        }
        if (ganttViewBtn) {
            ganttViewBtn.addEventListener('click', () => _switchView('gantt-view'));
        }
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => _switchView('settings-view'));
        }
        // The addSprintBtn listener is now handled by _addSprintButton()
        console.log("Header controls initialized.");
    }

    /**
     * Placeholder function to update any capacity indicators in the header.
     * This might be used to show overall PI capacity or similar global metrics.
     */
    function updateHeaderCapacities() {
        // console.log("Header.updateHeaderCapacities called - to be implemented if needed.");
        // Example:
        // const totalCapacity = getSprints().reduce((sum, sprint) => sum + sprint.capacity, 0); // Corrected
        // const totalUsedPoints = getTasks().filter(t => t.sprintId !== 'Backlog').reduce((sum, task) => sum + (task.storyPoints || 0), 0); // Corrected
        // const capacityDisplayElement = document.getElementById('global-capacity-indicator');
        // if (capacityDisplayElement) {
        //     capacityDisplayElement.textContent = `PI Load: ${totalUsedPoints} / ${totalCapacity} SP`;
        // }
    }


    // Public API
    return {
        init,
        switchView: _switchView, // Expose the internal switchView function
        updateHeaderCapacities
    };
})();

console.log("PI Planner header.js loaded and refactored.");
