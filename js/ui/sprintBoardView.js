// PI Planner Sprint Board View UI Logic

const SprintBoardView = (() => {
    let sprintBoardViewElement = null;

    /**
     * Initializes the Sprint Board View.
     * Sets up the main element reference.
     */
    function init() {
        sprintBoardViewElement = document.getElementById('sprint-board-view');
        if (!sprintBoardViewElement) {
            console.error("Sprint Board view element not found in DOM for SprintBoardView.init().");
            return;
        }
        console.log("SprintBoardView initialized.");
    }

    /**
     * Updates the story points display for a given sprint column.
     * @param {string} sprintId - The ID of the sprint to update.
     * @param {number} usedPoints - The total story points used in the sprint.
     * @param {number} capacity - The total capacity of the sprint.
     * @param {HTMLElement} [container=document] - The container to search for the sprint column. Defaults to document.
     * @private
     */
    function _updateSprintStoryPointsDisplay(sprintId, usedPoints, capacity, container = document) {
        const sprintColumn = container.querySelector(`.sprint-column[data-sprint-id="${sprintId}"]`);
        if (!sprintColumn) {
            console.warn(`Sprint column with ID "${sprintId}" not found for updating story points.`);
            return;
        }

        const storyPointsElement = sprintColumn.querySelector('.sprint-story-points');
        if (storyPointsElement) {
            storyPointsElement.textContent = `${usedPoints} / ${capacity} points`;
            if (usedPoints > capacity) {
                storyPointsElement.classList.add('over-capacity');
                sprintColumn.querySelector('.sprint-column-header').classList.add('over-capacity-header');
            } else {
                storyPointsElement.classList.remove('over-capacity');
                sprintColumn.querySelector('.sprint-column-header').classList.remove('over-capacity-header');
            }
        }
    }

    /**
     * Handles the deletion of a sprint.
     * @param {string} sprintId - The ID of the sprint to delete.
     * @private
     */
    function _handleDeleteSprint(sprintId) {
        // Prevent deleting the Backlog column
        if (sprintId === 'Backlog') {
            alert("The Backlog column cannot be deleted.");
            return;
        }

        const sprintToDelete = Storage.getSprintById(sprintId);
        if (!sprintToDelete) {
            console.error(`Sprint with ID ${sprintId} not found for deletion.`);
            return;
        }

        const confirmDelete = confirm(`Are you sure you want to delete the sprint "${sprintToDelete.name}"? All tasks in this sprint will be moved to the Backlog.`);
        if (!confirmDelete) {
            return; // User cancelled deletion
        }

        // Remove the sprint from the sprints array
        let currentSprints = Storage.getSprints();
        const updatedSprints = currentSprints.filter(sprint => sprint.id !== sprintId);
        Storage.saveSprints(updatedSprints);

        // Move tasks from the deleted sprint to the Backlog
        let allTasks = Storage.getTasks();
        allTasks.forEach(task => {
            if (task.sprintId === sprintId) {
                task.sprintId = 'Backlog';
            }
        });
        Storage.saveTasks(allTasks);

        _renderInternal(); // Re-render the board
        console.log(`Sprint "${sprintToDelete.name}" (ID: ${sprintId}) deleted and tasks moved to Backlog.`);
    }


    /**
     * Renders a single sprint column.
     * @param {Sprint} sprint - The sprint object to render.
     * @returns {HTMLElement} The created sprint column element.
     * @private
     */
    function _renderSprintColumn(sprint) {
        const column = createElement('div', 'sprint-column', { 'data-sprint-id': sprint.id });

        // Column Header
        const header = createElement('div', 'sprint-column-header');
        const nameElement = createElement('h3', 'sprint-name', null, sprint.name);
        nameElement.title = "Click to edit sprint name"; // Tooltip
        nameElement.addEventListener('click', () => _makeSprintNameEditable(sprint, nameElement));

        const dateRangeElement = createElement('p', 'sprint-dates', null, `${formatDate(sprint.startDate)} - ${formatDate(sprint.endDate)}`);
        dateRangeElement.title = "Click to edit sprint dates"; // Tooltip
        dateRangeElement.addEventListener('click', () => _makeSprintDatesEditable(sprint, dateRangeElement));

        const storyPointsElement = createElement('p', 'sprint-story-points');
        // Story points will be calculated and set by _updateSprintStoryPointsDisplay or during initial full render

        // Create a container for sprint info (name, dates, points)
        const sprintInfoContainer = createElement('div', 'sprint-info-container');
        sprintInfoContainer.appendChild(nameElement);
        sprintInfoContainer.appendChild(dateRangeElement);
        sprintInfoContainer.appendChild(storyPointsElement);

        header.appendChild(sprintInfoContainer);

        // Add Delete Sprint button (only for non-backlog sprints)
        if (sprint.id !== 'Backlog') {
            const deleteButton = createElement('button', 'delete-sprint-btn', null, '✖');
            deleteButton.title = "Delete Sprint"; // Tooltip
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent click from triggering sprint name/date edits
                _handleDeleteSprint(sprint.id);
            });
            header.appendChild(deleteButton);
        }

        column.appendChild(header);

        // Task List Area
        const taskList = createElement('div', 'task-list', { 'data-sprint-id': sprint.id });
        // Tasks will be populated by the main _renderInternal function
        column.appendChild(taskList);

        // Add Task Button for this specific sprint (only for non-backlog sprints)
        if (sprint.id !== 'Backlog') {
            const addTaskButton = createElement('button', 'add-task-sprint-btn', null, '+ Add Task');
            addTaskButton.addEventListener('click', () => {
                TaskPropertyPanel.openPanel(null, sprint.id); // Open panel for new task in this sprint
            });
            column.appendChild(addTaskButton);
        }

        return column;
    }

    /**
     * Renders a single task card.
     * @param {Task} task - The task object to render.
     * @param {Epic[]} epics - Array of all epic objects to find epic name.
     * @returns {HTMLElement} The created task card element.
     * @private
     */
    function _renderTaskCard(task, epics) { // Renamed components to epics
        const card = createElement('div', 'task-card', { 'data-task-id': task.id }); // Corrected
        const cardColor = task.color || defaultTaskColor || '#D3D3D3'; // Get task color

        card.style.backgroundColor = cardColor; // Set background color of the entire card

        // Determine if the background color is dark to adjust text color for readability
        if (isColorDark(cardColor)) { // Assuming isColorDark utility function exists
            card.classList.add('dark-background');
        }

        const nameElement = createElement('h4', 'task-name', null, task.name); // Corrected
        card.appendChild(nameElement);

        const storyPointsElement = createElement('p', 'task-story-points'); // Corrected
        storyPointsElement.textContent = `Points: ${task.storyPoints || 0}`;
        card.appendChild(storyPointsElement);

        const epic = epics.find(e => e.id === task.epicId); // Renamed component to epic, task.componentId to task.epicId
        const epicName = epic ? epic.name : 'N/A'; // Renamed componentName to epicName
        const epicElement = createElement('p', 'task-epic'); // Renamed task-component to task-epic
        epicElement.textContent = `Epic: ${epicName}`; // Renamed Component to Epic
        card.appendChild(epicElement);

        // Dependent team display is removed as per request

        card.addEventListener('click', () => {
            const taskData = Storage.getTaskById(task.id); // Use Storage object
            if (taskData) {
                TaskPropertyPanel.openPanel(task.id);
            } else {
                console.error(`Task data for ID ${task.id} not found.`);
            }
        });

        return card;
    }

    /**
     * Renders the entire Sprint Board.
     * This is the main rendering function for this view.
     * @private
     */
    function _renderInternal() {
        if (!sprintBoardViewElement) {
            console.error("Sprint Board view element not found in DOM for _renderInternal.");
            init(); // Attempt to re-initialize if element is lost
            if (!sprintBoardViewElement) return;
        }
        sprintBoardViewElement.innerHTML = ''; // Clear previous content

        const sprints = Storage.getSprints(); // Use Storage object
        const tasks = Storage.getTasks(); // Use Storage object
        const epics = Storage.getEpics(); // Renamed from Storage.getComponents()

        // Create a container for sprint columns to manage layout (e.g., flex, scroll)
        const columnsContainer = createElement('div', 'sprint-columns-container'); // Corrected

        // Render Backlog Column (special case)
        const backlogColumn = createElement('div', 'sprint-column backlog-column', { 'data-sprint-id': 'Backlog' }); // Corrected
        const backlogHeader = createElement('div', 'sprint-column-header'); // Corrected
        backlogHeader.appendChild(createElement('h3', 'sprint-name', null, 'Backlog')); // Corrected
        const addBacklogTaskButton = createElement('button', 'add-task-backlog-btn', null, '+ Add Task to Backlog'); // Corrected
        addBacklogTaskButton.addEventListener('click', () => {
            TaskPropertyPanel.openPanel(null, 'Backlog'); // Open panel for new task in Backlog
        });
        backlogHeader.appendChild(addBacklogTaskButton);

        // Add "Add Feature from Template" button
        const addFeatureTemplateButton = createElement('button', 'add-task-backlog-btn add-feature-template-btn', null, '+ Add Feature from Template'); // Use same base class for styling
        addFeatureTemplateButton.addEventListener('click', () => {
            if (typeof FeatureTemplateModal !== 'undefined') {
                FeatureTemplateModal.openModal();
            } else {
                console.error("FeatureTemplateModal is not defined. Ensure it's loaded and initialized.");
                alert("Error: Feature template functionality is currently unavailable.");
            }
        });
        backlogHeader.appendChild(addFeatureTemplateButton);

        backlogColumn.appendChild(backlogHeader);
        const backlogTaskList = createElement('div', 'task-list', { 'data-sprint-id': 'Backlog' }); // Corrected
        backlogColumn.appendChild(backlogTaskList);
        columnsContainer.appendChild(backlogColumn);

        // Render actual sprint columns
        if (sprints && sprints.length > 0) {
            sprints.forEach(sprint => {
                const sprintColumnElement = _renderSprintColumn(sprint);
                columnsContainer.appendChild(sprintColumnElement);
            });
        } else {
            columnsContainer.appendChild(createElement('p', null, null, 'No sprints available. Please add sprints or perform setup.')); // Corrected
        }

        // Populate tasks into their respective columns (including backlog) and calculate initial story points
        if (sprints && sprints.length > 0) {
            sprints.forEach(sprint => {
                const sprintTasks = tasks.filter(task => task.sprintId === sprint.id);
                let usedPoints = 0;
                sprintTasks.forEach(task => {
                    usedPoints += (task.storyPoints || 0);
                    const taskCardElement = _renderTaskCard(task, epics); // Renamed components to epics
                    const sprintColumnElement = columnsContainer.querySelector(`.sprint-column[data-sprint-id="${sprint.id}"] .task-list`);
                    if (sprintColumnElement) {
                        sprintColumnElement.appendChild(taskCardElement);
                    }
                });
                _updateSprintStoryPointsDisplay(sprint.id, usedPoints, sprint.capacity, columnsContainer);
            });
        }

        // Populate backlog tasks
        const backlogTasks = tasks.filter(task => !task.sprintId || task.sprintId === 'Backlog');
        const backlogTaskListElement = columnsContainer.querySelector('.task-list[data-sprint-id="Backlog"]');
        if (backlogTaskListElement) {
            backlogTasks.forEach(task => {
                const taskCardElement = _renderTaskCard(task, epics); // Renamed components to epics
                backlogTaskListElement.appendChild(taskCardElement);
            });
        }


        sprintBoardViewElement.appendChild(columnsContainer);

        _initializeSortableJS(columnsContainer);

        console.log("Sprint Board rendered with current data.");
    }

    /**
     * Handles adding a new sprint.
     * This function is now exposed publicly via the module's return.
     * @public
     */
    function addSprint() {
        const name = prompt("Enter new sprint name (e.g., PI 24.1 - Sprint X):");
        if (!name) return;

        const startDateStr = prompt("Enter sprint start date (YYYY-MM-DD):");
        if (!startDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(startDateStr)) {
            alert("Invalid start date format. Please use YYYY-MM-DD.");
            return;
        }

        const endDateStr = prompt("Enter sprint end date (YYYY-MM-DD):");
        if (!endDateStr || !/^\d{4}-\d{2}-\d{2}$/.test(endDateStr)) {
            alert("Invalid end date format. Please use YYYY-MM-DD.");
            return;
        }
        if (new Date(endDateStr) <= new Date(startDateStr)) {
            alert("End date must be after start date.");
            return;
        }

        const capacityStr = prompt(`Enter sprint capacity (default: ${defaultSprintCapacity || 40}):`, (defaultSprintCapacity || 40).toString());
        const capacity = parseInt(capacityStr, 10);
        if (isNaN(capacity) || capacity < 0) {
            alert("Capacity must be a non-negative number.");
            return;
        }

        const newSprint = new Sprint(name, startDateStr, endDateStr, capacity);
        let currentSprints = Storage.getSprints();
        currentSprints.push(newSprint);
        Storage.saveSprints(currentSprints);

        _renderInternal(); // Re-render
        console.log("New sprint added:", newSprint);
    }

    /**
     * Makes a sprint name editable in place.
     * @param {Sprint} sprint - The sprint object to edit.
     * @param {HTMLElement} nameElement - The H3 element displaying the name.
     * @private
     */
    function _makeSprintNameEditable(sprint, nameElement) {
        const oldName = sprint.name;
        const input = createElement('input', 'sprint-name-edit', { type: 'text', value: oldName }); // Corrected

        nameElement.replaceWith(input);
        input.focus();
        input.select();

        function saveSprintName() {
            const newName = input.value.trim();
            let currentSprints = Storage.getSprints(); // Use Storage object
            const sprintToUpdate = currentSprints.find(s => s.id === sprint.id);

            if (sprintToUpdate && newName && newName !== oldName) {
                sprintToUpdate.name = newName;
                Storage.saveSprints(currentSprints); // Use Storage object
            } else {
                nameElement.textContent = oldName;
            }
            input.replaceWith(nameElement);
        }

        input.addEventListener('blur', saveSprintName);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                saveSprintName();
            } else if (event.key === 'Escape') {
                nameElement.textContent = oldName;
                input.replaceWith(nameElement);
            }
        });
    }

    /**
     * Makes sprint dates editable in place.
     * @param {Sprint} sprint - The sprint object to edit.
     * @param {HTMLElement} dateRangeElement - The P element displaying the dates.
     * @private
     */
    function _makeSprintDatesEditable(sprint, dateRangeElement) {
        const oldStartDate = sprint.startDate;
        const oldEndDate = sprint.endDate;

        const dateEditorContainer = createElement('div', 'sprint-date-editor'); // Corrected
        const startDateInput = createElement('input', null, { type: 'date', value: oldStartDate }); // Corrected
        const endDateInput = createElement('input', null, { type: 'date', value: oldEndDate }); // Corrected
        const saveButton = createElement('button', null, null, 'Save'); // Corrected
        const cancelButton = createElement('button', null, null, 'Cancel'); // Corrected

        dateEditorContainer.appendChild(startDateInput);
        dateEditorContainer.appendChild(document.createTextNode(' to '));
        dateEditorContainer.appendChild(endDateInput);
        dateEditorContainer.appendChild(saveButton);
        dateEditorContainer.appendChild(cancelButton);

        dateRangeElement.replaceWith(dateEditorContainer);

        function restoreDateDisplay() {
            // Fetch the potentially updated sprint from storage to reflect current state
            const currentSprintsData = Storage.getSprints(); // Use Storage object
            const updatedSprint = currentSprintsData.find(s => s.id === sprint.id) || sprint;
            dateRangeElement.textContent = `${formatDate(updatedSprint.startDate)} - ${formatDate(updatedSprint.endDate)}`; // Corrected
            dateEditorContainer.replaceWith(dateRangeElement);
        }

        saveButton.addEventListener('click', () => {
            const newStartDate = startDateInput.value;
            const newEndDate = endDateInput.value;

            if (!newStartDate || !newEndDate) {
                alert("Both start and end dates are required.");
                return;
            }
            if (new Date(newEndDate) <= new Date(newStartDate)) {
                alert("End date must be after start date.");
                return;
            }
            let currentSprints = Storage.getSprints(); // Use Storage object
            const sprintToUpdate = currentSprints.find(s => s.id === sprint.id);
            if (sprintToUpdate) {
                sprintToUpdate.startDate = newStartDate;
                sprintToUpdate.endDate = newEndDate;
                Storage.saveSprints(currentSprints); // Use Storage object
            }
            restoreDateDisplay();
        });

        cancelButton.addEventListener('click', restoreDateDisplay);
    }

    /**
     * Initializes SortableJS on all task lists within the provided container.
     * @param {HTMLElement} container - The container element holding the sprint columns.
     * @private
     */
    function _initializeSortableJS(container) {
        const taskLists = container.querySelectorAll('.task-list');
        taskLists.forEach(taskList => {
            new Sortable(taskList, {
                group: 'shared-tasks',
                animation: 150,
                ghostClass: 'task-ghost',
                chosenClass: 'task-chosen',
                dragClass: 'task-drag',
                onEnd: function (event) {
                    const taskId = event.item.dataset.taskId;
                    const newSprintId = event.to.dataset.sprintId;
                    const oldSprintId = event.from.dataset.sprintId;

                    const task = Storage.getTaskById(taskId); // Use Storage object
                    if (!task) {
                        console.error(`Task with ID ${taskId} not found for drag & drop.`);
                        _renderInternal(); // Re-render to correct potential UI inconsistency
                        return;
                    }

                    // Capacity Check
                    if (newSprintId !== 'Backlog' && newSprintId !== oldSprintId) {
                        const targetSprint = Storage.getSprintById(newSprintId); // Use Storage object
                        if (targetSprint) {
                            const tasksInTargetSprint = Storage.getTasksBySprintId(newSprintId); // Use Storage object
                            // Exclude the current task if it was already in the target list (e.g., reordering within the same list)
                            // This filter is more accurate if the task is not yet updated in storage.
                            const pointsInTargetSprint = tasksInTargetSprint
                                .filter(t => t.id !== taskId) // Points of other tasks
                                .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

                            if ((pointsInTargetSprint + (task.storyPoints || 0)) > targetSprint.capacity) {
                                // Instead of alert, the _updateSprintStoryPointsDisplay function will handle visual indication (e.g., turning red)
                                // SortableJS often reverts automatically if an error is thrown or if the operation is cancelled.
                                // For a more explicit revert, a full re-render is safest.
                                _renderInternal(); // Re-render to reflect the state and trigger capacity styling
                                // Do NOT return here, allow the task to be moved even if over capacity
                            }
                        }
                    }

                    // task.sprintId = newSprintId; // Update the task in the main array
                    // saveTask(task); // Corrected: Save the individual task - This needs to be saveTasks(allTasks)

                    let allTasks = Storage.getTasks(); // Use Storage object
                    const taskToUpdate = allTasks.find(t => t.id === taskId);
                    if (taskToUpdate) {
                        taskToUpdate.sprintId = newSprintId;
                        Storage.saveTasks(allTasks); // Use Storage object
                    } else {
                        console.error(`Task with ID ${taskId} not found in allTasks for saving.`);
                    }

                    // Re-render the entire board to reflect changes and update all story points
                    _renderInternal();
                    // Also, if RoadmapView is active and linked, it might need an update.
                    const roadmapViewElement = document.getElementById('roadmap-view');
                    if (typeof RoadmapView !== 'undefined' && roadmapViewElement && roadmapViewElement.style.display !== 'none') {
                        RoadmapView.renderRoadmapGrid();
                    }
                    Header.updateHeaderCapacities(); // Update global capacity indicators if any
                }
            });
        });
        console.log("SortableJS initialized on task lists.");
    }

    /**
     * Shows the Sprint Board View and renders its content.
     */
    function show() {
        if (!sprintBoardViewElement) init(); // Ensure initialized
        if (sprintBoardViewElement) {
            sprintBoardViewElement.style.display = 'block'; // Or 'flex' if container is flex
            _renderInternal(); // Render/refresh content when shown
        }
        // Hide other views (this might be better handled by a central view manager)
        if (typeof RoadmapView !== 'undefined') RoadmapView.hide();
        // if (typeof PIObjectivesView !== 'undefined') PIObjectivesView.hide();
        const piObjectivesViewEl = document.getElementById('pi-objectives-view');
        if (piObjectivesViewEl) piObjectivesViewEl.style.display = 'none';
    }

    /**
     * Hides the Sprint Board View.
     */
    function hide() {
        if (sprintBoardViewElement) {
            sprintBoardViewElement.style.display = 'none';
        }
    }

    // Public API
    return {
        init,
        render: _renderInternal, // Expose main render function
        show,
        hide,
        addSprint, // Expose the addSprint function
        updateSprintStoryPointsDisplay: _updateSprintStoryPointsDisplay // Expose if needed externally
    };
})();

console.log("PI Planner sprintBoardView.js loaded and refactored.");
