// PI Planner Task Property Panel UI Logic

const TaskPropertyPanel = (() => {
    let taskPropertyPanelElement = null;
    let taskPanelTitleElement = null;
    let closeTaskPanelBtn = null;
    let taskIdInput = null;
    let taskTargetSprintIdInput = null;
    let taskNameInput = null;
    let taskStoryPointsInput = null;
    let taskEpicSelect = null; // Renamed from taskComponentSelect
    let taskDependentTeamSelect = null;
    // let taskColorInput = null; // Original input, will be replaced by palette
    let taskColorPaletteContainer = null; // New container for swatches
    let selectedTaskColorValueInput = null; // Hidden input to store selected color
    let saveTaskBtn = null;
    let cancelTaskBtn = null;
    let deleteTaskBtn = null; // Added delete button reference
    let duplicateTaskBtn = null; // Added duplicate button reference

    // let currentEditingTask = null; // This is not needed if task data is fetched on open

    /**
     * Populates the epic dropdown in the task panel.
     * @param {Epic[]} epics - Array of epic objects.
     * @private
     */
    function _populateEpicSelect(epics) { // Renamed from _populateComponentSelect
        if (!taskEpicSelect) return;
        taskEpicSelect.innerHTML = '<option value="">Select Epic</option>'; // Default option, Renamed
        if (epics && epics.length > 0) {
            epics.forEach(epic => {
                const option = createElement('option', null, { value: epic.id }, epic.name); // Renamed
                taskEpicSelect.appendChild(option);
            });
        }
    }

    /**
     * Populates the dependent team dropdown in the task panel.
     * @param {string[]} dependentTeams - Array of dependent team names.
     * @private
     */
    function _populateDependentTeamSelect(dependentTeams) {
        if (!taskDependentTeamSelect) return;
        taskDependentTeamSelect.innerHTML = '<option value="">None</option>'; // Default option
        if (dependentTeams && dependentTeams.length > 0) {
            dependentTeams.forEach(teamName => {
                const option = createElement('option', null, { value: teamName }, teamName);
                taskDependentTeamSelect.appendChild(option);
            });
        }
    }

    /**
     * Opens the task property panel.
     * @param {string|null} taskIdToEdit - The ID of the task to edit, or null for a new task.
     * @param {string} [targetSprintId='Backlog'] - The sprint ID if creating a new task.
     */
    function openPanel(taskIdToEdit = null, targetSprintId = 'Backlog') {
        if (!taskPropertyPanelElement) {
            console.error("Task Property Panel not initialized.");
            return;
        }

        const epics = Storage.getEpics(); // Renamed from Storage.getComponents()
        _populateEpicSelect(epics); // Renamed from _populateComponentSelect

        const dependentTeams = Storage.getDependentTeams();
        _populateDependentTeamSelect(dependentTeams);

        const taskToEdit = taskIdToEdit ? Storage.getTaskById(taskIdToEdit) : null;

        if (taskToEdit) {
            taskPanelTitleElement.textContent = 'Edit Task';
            taskIdInput.value = taskToEdit.id;
            taskNameInput.value = taskToEdit.name;
            taskStoryPointsInput.value = taskToEdit.storyPoints || 0;
            taskEpicSelect.value = taskToEdit.epicId || ''; // Renamed from taskComponentSelect.value = taskToEdit.componentId
            taskDependentTeamSelect.value = taskToEdit.dependentTeam || '';
            _setActiveColorSwatch(taskToEdit.color || PREDEFINED_TASK_COLOR_VALUES[0] || '#D3D3D3');
            taskTargetSprintIdInput.value = taskToEdit.sprintId || 'Backlog';
            if (deleteTaskBtn) deleteTaskBtn.style.display = 'inline-block';
            if (duplicateTaskBtn) duplicateTaskBtn.style.display = 'inline-block'; // Show duplicate button
        } else {
            taskPanelTitleElement.textContent = 'Add New Task';
            taskIdInput.value = '';
            taskNameInput.value = '';
            taskStoryPointsInput.value = '0';
            taskEpicSelect.value = ''; // Renamed from taskComponentSelect.value
            taskDependentTeamSelect.value = '';
            const defaultColor = (PREDEFINED_TASK_COLOR_VALUES && PREDEFINED_TASK_COLOR_VALUES.length > 0)
                                   ? PREDEFINED_TASK_COLOR_VALUES[0]
                                   : (defaultTaskColor || '#D3D3D3');
            _setActiveColorSwatch(defaultColor);
            taskTargetSprintIdInput.value = targetSprintId;
            if (deleteTaskBtn) deleteTaskBtn.style.display = 'none';
            if (duplicateTaskBtn) duplicateTaskBtn.style.display = 'none'; // Hide duplicate button
        }
        taskPropertyPanelElement.classList.add('open');
        taskPropertyPanelElement.style.zIndex = '900'; // Ensure it's on top when open
        taskNameInput.focus();

        // Add event listener to close panel when clicking outside, with a small delay
        // to prevent immediate closure from stray events during panel opening.
        setTimeout(() => {
            document.addEventListener('click', _handleOutsideClick);
        }, 50); // 50ms delay
    }

    /**
     * Handles clicks outside the panel to close it.
     * @param {Event} event - The click event.
     * @private
     */
    function _handleOutsideClick(event) {
        // Check if the click was outside the panel and not on a task card (which opens the panel)
        if (taskPropertyPanelElement && !taskPropertyPanelElement.contains(event.target) && !event.target.closest('.task-card')) {
            console.log("Outside click detected. Attempting to close panel.");
            _closePanel();
        }
    }

    /**
     * Closes the task property panel.
     * @private
     */
    function _closePanel() {
        console.log("Attempting to close panel.");
        if (taskPropertyPanelElement) {
            console.log("Panel element found. Current classList:", taskPropertyPanelElement.classList.value);
            taskPropertyPanelElement.classList.remove('open');
            console.log("After classList.remove('open'), classList:", taskPropertyPanelElement.classList.value);
            taskPropertyPanelElement.style.zIndex = '1'; // Set a low z-index when closed
            console.log("After style.display = 'none', style.display:", taskPropertyPanelElement.style.display);
        } else {
            console.log("Panel element not found when trying to close.");
        }
        // Remove the outside click listener when panel is closed
        document.removeEventListener('click', _handleOutsideClick);
    }

    /**
     * Handles saving task properties from the panel.
     * @private
     */
    function _handleSave() {
        const id = taskIdInput.value;
        const name = taskNameInput.value.trim();
        const storyPoints = parseInt(taskStoryPointsInput.value, 10);
        const epicId = taskEpicSelect.value; // Renamed from componentId
        const color = selectedTaskColorValueInput.value;
        const dependentTeam = taskDependentTeamSelect.value;

        if (!name) {
            alert("Task Name is required.");
            taskNameInput.focus();
            return;
        }
        if (isNaN(storyPoints) || storyPoints < 0) {
            alert("Story Points must be a non-negative number.");
            taskStoryPointsInput.focus();
            return;
        }
        if (!epicId) { // Renamed from componentId
            alert("Please select an Epic."); // Renamed
            // Re-fetch the element to ensure it's not null before focusing
            const currentTaskEpicSelect = document.getElementById('task-epic-select');
            if (currentTaskEpicSelect) {
                currentTaskEpicSelect.focus();
            }
            return;
        }

        let task;
        if (id) {
            task = Storage.getTaskById(id);
            if (task) {
                task.name = name;
                task.storyPoints = storyPoints;
                task.epicId = epicId; // Renamed from task.componentId
                task.color = color;
                task.dependentTeam = dependentTeam;
            } else {
                console.error("Task to edit not found with ID:", id);
                return;
            }
        } else {
            const newTaskId = generateUniqueId();
            const sprintIdForNewTask = taskTargetSprintIdInput.value || 'Backlog';
            task = new Task(name, storyPoints, epicId, sprintIdForNewTask, color, dependentTeam, newTaskId); // Renamed componentId to epicId
        }

        let allTasks = Storage.getTasks();
        if (id) {
            const taskIndex = allTasks.findIndex(t => t.id === id);
            if (taskIndex > -1) {
                allTasks[taskIndex] = task;
            } else {
                console.error("Task to update not found in allTasks array during save.");
                allTasks.push(task);
            }
        } else {
            allTasks.push(task);
        }
        Storage.saveTasks(allTasks);

        _closePanel();

                const sprintBoardViewElement = document.getElementById('sprint-board-view');
                if (typeof SprintBoardView !== 'undefined' && sprintBoardViewElement && sprintBoardViewElement.classList.contains('active-view')) {
                    SprintBoardView.render();
                }
                const roadmapViewElement = document.getElementById('roadmap-view');
                if (typeof RoadmapView !== 'undefined' && roadmapViewElement && roadmapViewElement.classList.contains('active-view')) {
                    RoadmapView.renderRoadmapGrid();
                }
        Header.updateHeaderCapacities();
    }

    /**
     * Handles deleting the current task.
     * @private
     */
    function _handleDelete() {
        const taskId = taskIdInput.value;
        if (!taskId) {
            console.error("No task ID found for deletion.");
            return;
        }

        if (confirm("Are you sure you want to delete this task? This cannot be undone.")) {
            let allTasks = Storage.getTasks();
            const initialLength = allTasks.length;
            allTasks = allTasks.filter(task => task.id !== taskId);

            if (allTasks.length < initialLength) {
                Storage.saveTasks(allTasks);
                _closePanel();
                const sprintBoardViewElement = document.getElementById('sprint-board-view');
                if (typeof SprintBoardView !== 'undefined' && sprintBoardViewElement && sprintBoardViewElement.classList.contains('active-view')) {
                    SprintBoardView.render();
                }
                const roadmapViewElement = document.getElementById('roadmap-view');
                if (typeof RoadmapView !== 'undefined' && roadmapViewElement && roadmapViewElement.classList.contains('active-view')) {
                    RoadmapView.renderRoadmapGrid();
                }
                 Header.updateHeaderCapacities();
                console.log(`Deleted task with ID: ${taskId}`);
            } else {
                console.warn(`Task with ID ${taskId} not found for deletion.`);
            }
        }
    }


    /**
     * Initializes the Task Property Panel, gets DOM elements, and sets up event listeners.
     */
    function init() {
        taskPropertyPanelElement = document.getElementById('task-property-panel');
        taskPanelTitleElement = document.getElementById('task-panel-title');
        closeTaskPanelBtn = document.getElementById('close-task-panel-btn');
        taskIdInput = document.getElementById('task-id-input');
        taskTargetSprintIdInput = document.getElementById('task-target-sprint-id-input');
        taskNameInput = document.getElementById('task-name-input');
        taskStoryPointsInput = document.getElementById('task-story-points-input');
        taskEpicSelect = document.getElementById('task-epic-select'); // Renamed from task-component-select
        taskDependentTeamSelect = document.getElementById('task-dependent-team-select');
        taskColorPaletteContainer = document.getElementById('task-color-palette-container');
        selectedTaskColorValueInput = document.getElementById('selected-task-color-value');
        saveTaskBtn = document.getElementById('save-task-btn');
        cancelTaskBtn = document.getElementById('cancel-task-btn');
        deleteTaskBtn = document.getElementById('delete-task-btn');
        duplicateTaskBtn = document.getElementById('duplicate-task-btn');


        if (!taskPropertyPanelElement) { console.error("Task Property Panel element not found."); return; }
        if (!closeTaskPanelBtn) { console.error("Close Task Panel button not found."); return; }
        if (!saveTaskBtn) { console.error("Save Task button not found."); return; }
        if (!cancelTaskBtn) { console.error("Cancel Task button not found."); return; }
        if (!taskColorPaletteContainer) { console.error("Task Color Palette Container not found."); return; }
        if (!selectedTaskColorValueInput) { console.error("Selected Task Color Value input not found."); return; }
        if (!deleteTaskBtn) { console.error("Delete Task button not found."); return; }
        if (!duplicateTaskBtn) { console.error("Duplicate Task button not found."); return; }
        if (!taskDependentTeamSelect) { console.error("Task Dependent Team Select not found."); return; }
        if (!taskEpicSelect) { console.error("Task Epic Select not found."); return; }

        console.log("All critical Task Property Panel elements found.");
        _populateColorPalette();

        closeTaskPanelBtn.addEventListener('click', () => {
            console.log("Close button clicked.");
            _closePanel();
        });
        cancelTaskBtn.addEventListener('click', () => {
            console.log("Cancel button clicked.");
            _closePanel();
        });
        saveTaskBtn.addEventListener('click', _handleSave);
        deleteTaskBtn.addEventListener('click', _handleDelete);
        duplicateTaskBtn.addEventListener('click', _handleDuplicate); // Add event listener for duplicate button


        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && taskPropertyPanelElement.classList.contains('open')) {
                _closePanel();
            }
        });
        console.log("TaskPropertyPanel initialized.");
    }

    /**
     * Handles duplicating the current task.
     * @private
     */
    function _handleDuplicate() {
        const taskId = taskIdInput.value;
        if (!taskId) {
            console.error("No task ID found for duplication.");
            return;
        }

        const taskToDuplicate = Storage.getTaskById(taskId);
        if (!taskToDuplicate) {
            console.error("Task to duplicate not found with ID:", taskId);
            return;
        }

        // Create a new Task object with a new ID and modified name
        const newTaskId = generateUniqueId();
        const duplicatedTask = new Task(
            `${taskToDuplicate.name} (Copy)`,
            taskToDuplicate.storyPoints,
            taskToDuplicate.epicId,
            taskToDuplicate.sprintId,
            taskToDuplicate.color,
            taskToDuplicate.dependentTeam,
            newTaskId
        );

        let allTasks = Storage.getTasks();
        allTasks.push(duplicatedTask);
        Storage.saveTasks(allTasks);

        _closePanel();

        // Re-render views and update capacities
        const sprintBoardViewElement = document.getElementById('sprint-board-view');
        if (typeof SprintBoardView !== 'undefined' && sprintBoardViewElement && sprintBoardViewElement.classList.contains('active-view')) {
            SprintBoardView.render();
        }
        const roadmapViewElement = document.getElementById('roadmap-view');
        if (typeof RoadmapView !== 'undefined' && roadmapViewElement && roadmapViewElement.classList.contains('active-view')) {
            RoadmapView.renderRoadmapGrid();
        }
        Header.updateHeaderCapacities();
        console.log(`Duplicated task with ID: ${taskId} to new ID: ${newTaskId}`);
    }

    /**
     * Populates the color palette with swatches.
     * @private
     */
    function _populateColorPalette() {
        if (!taskColorPaletteContainer) return;
        taskColorPaletteContainer.innerHTML = '';

        PREDEFINED_TASK_COLOR_VALUES.forEach(colorValue => {
            const swatch = createElement('div', 'color-swatch', { 'data-color': colorValue });
            swatch.style.backgroundColor = colorValue;
            swatch.title = colorValue;

            swatch.addEventListener('click', () => {
                _setActiveColorSwatch(colorValue);
            });
            taskColorPaletteContainer.appendChild(swatch);
        });
    }

    /**
     * Sets the active color swatch and updates the hidden input.
     * @param {string} colorValue - The hex color value to set as active.
     * @private
     */
    function _setActiveColorSwatch(colorValue) {
        if (!selectedTaskColorValueInput || !taskColorPaletteContainer) return;
        selectedTaskColorValueInput.value = colorValue;

        const swatches = taskColorPaletteContainer.querySelectorAll('.color-swatch');
        swatches.forEach(sw => {
            if (sw.dataset.color === colorValue) {
                sw.classList.add('active-swatch');
            } else {
                sw.classList.remove('active-swatch');
            }
        });
    }


    // Public API
    return {
        init,
        openPanel
    };
})();

console.log("PI Planner taskPropertyPanel.js loaded and refactored.");
