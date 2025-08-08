// PI Planner Sprint Board View UI Logic

const SprintBoardView = (() => {
    let sprintBoardViewElement = null;
    let currentFilterString = ''; // Stores the current filter string
    let currentTrafficLightFilter = 'all'; // Stores the current traffic light filter
    let filterTimeout = null;    // For debouncing the filter input

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
        storyPointsElement.title = "Click to edit sprint capacity"; // Tooltip
        storyPointsElement.addEventListener('click', () => _makeSprintCapacityEditable(sprint, storyPointsElement));
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
        // Use the globally defined DEFAULT_TASK_COLOR from config.js
        const cardColor = task.color || window.DEFAULT_TASK_COLOR || '#D3D3D3'; // Get task color

        card.style.backgroundColor = cardColor; // Set background color of the entire card

        // Determine if the background color is dark to adjust text color for readability
        if (isColorDark(cardColor)) { // Assuming isColorDark utility function exists
            card.classList.add('dark-background');
        }

        // Add traffic light component
        const trafficLightContainer = _createTrafficLightComponent(task);
        card.appendChild(trafficLightContainer);

        const nameElement = createElement('h4', 'task-name', null, task.name); // Corrected
        card.appendChild(nameElement);

        const epic = epics.find(e => e.id === task.epicId);
        const epicName = epic ? epic.name : 'N/A';
        const combinedInfoElement = createElement('p', 'task-epic-points');
        combinedInfoElement.textContent = `Epic: ${epicName} - Points: ${task.storyPoints || 0}`;
        card.appendChild(combinedInfoElement);

        // Dependent team display is removed as per request

        card.addEventListener('click', (event) => {
            // Don't open task panel if clicking on traffic light
            if (!event.target.closest('.traffic-light-container')) {
                const taskData = Storage.getTaskById(task.id); // Use Storage object
                if (taskData) {
                    TaskPropertyPanel.openPanel(task.id);
                } else {
                    console.error(`Task data for ID ${task.id} not found.`);
                }
            }
        });

        return card;
    }

    /**
     * Creates the traffic light component for a task card.
     * @param {Task} task - The task object.
     * @returns {HTMLElement} The traffic light container element.
     * @private
     */
    function _createTrafficLightComponent(task) {
        const container = createElement('div', 'traffic-light-container');
        
        const redLight = createElement('div', 'traffic-light', { 'data-color': 'red' });
        const amberLight = createElement('div', 'traffic-light', { 'data-color': 'amber' });
        const greenLight = createElement('div', 'traffic-light', { 'data-color': 'green' });

        // Set active state and apply color class based on current traffic light status
        if (task.trafficLightStatus === 'red') {
            redLight.classList.add('red', 'active');
        } else {
            redLight.classList.add('off');
        }
        
        if (task.trafficLightStatus === 'amber') {
            amberLight.classList.add('amber', 'active');
        } else {
            amberLight.classList.add('off');
        }
        
        if (task.trafficLightStatus === 'green') {
            greenLight.classList.add('green', 'active');
        } else {
            greenLight.classList.add('off');
        }

        // Add click event listeners for traffic light interaction
        redLight.addEventListener('click', (event) => {
            event.stopPropagation();
            _handleTrafficLightClick(task.id, 'red');
        });

        amberLight.addEventListener('click', (event) => {
            event.stopPropagation();
            _handleTrafficLightClick(task.id, 'amber');
        });

        greenLight.addEventListener('click', (event) => {
            event.stopPropagation();
            _handleTrafficLightClick(task.id, 'green');
        });

        container.appendChild(redLight);
        container.appendChild(amberLight);
        container.appendChild(greenLight);

        return container;
    }

    /**
     * Handles traffic light click events and updates the task status.
     * @param {string} taskId - The ID of the task.
     * @param {string} color - The color that was clicked ('red', 'amber', 'green').
     * @private
     */
    function _handleTrafficLightClick(taskId, color) {
        const allTasks = Storage.getTasks();
        const task = allTasks.find(t => t.id === taskId);
        
        if (!task) {
            console.error(`Task with ID ${taskId} not found.`);
            return;
        }

        // Toggle logic: if the clicked color is already active, turn it off (set to null)
        // Otherwise, set the clicked color as active
        if (task.trafficLightStatus === color) {
            task.trafficLightStatus = null;
        } else {
            task.trafficLightStatus = color;
        }

        // Save the updated tasks
        Storage.saveTasks(allTasks);

        // Re-render the sprint board to reflect the changes
        _renderInternal();
    }

    /**
     * Renders the entire Sprint Board.
     * This is the main rendering function for this view.
     * @private
     */
    function _renderInternal() {
        let allTasks = Storage.getTasks(); // Ensure allTasks is defined at the start
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

        // Add filter input field inside backlogHeader
        const filterContainer = createElement('div', 'sprint-board-filter-container');
        
        // Create input row container
        const filterInputRow = createElement('div', 'filter-input-row');
        
        const filterInput = createElement('input', 'sprint-board-filter-input', {
            type: 'text',
            id: 'sprint-board-filter-input',
            placeholder: 'Filter tasks by description, epic, or team...'
        });
        filterInput.value = currentFilterString; // Set initial value from state
        
        // Create traffic light filter buttons
        const trafficLightFilterContainer = createElement('div', 'traffic-light-filter-container');
        
        const allFilterBtn = createElement('button', 'traffic-light-filter-btn', { 'data-filter': 'all' });
        allFilterBtn.textContent = 'All';
        allFilterBtn.title = 'Show all tasks';
        
        const redFilterBtn = createElement('button', 'traffic-light-filter-btn traffic-light-filter-red', { 'data-filter': 'red' });
        redFilterBtn.innerHTML = '●';
        redFilterBtn.title = 'Show only red status tasks';
        
        const amberFilterBtn = createElement('button', 'traffic-light-filter-btn traffic-light-filter-amber', { 'data-filter': 'amber' });
        amberFilterBtn.innerHTML = '●';
        amberFilterBtn.title = 'Show only amber status tasks';
        
        const greenFilterBtn = createElement('button', 'traffic-light-filter-btn traffic-light-filter-green', { 'data-filter': 'green' });
        greenFilterBtn.innerHTML = '●';
        greenFilterBtn.title = 'Show only green status tasks';
        
        const noStatusFilterBtn = createElement('button', 'traffic-light-filter-btn traffic-light-filter-none', { 'data-filter': 'none' });
        noStatusFilterBtn.innerHTML = '○';
        noStatusFilterBtn.title = 'Show only tasks with no traffic light status';
        
        // Add a toggle button for traffic light visibility
        const toggleTrafficLightsBtn = createElement('button', 'toggle-traffic-lights-btn');
        toggleTrafficLightsBtn.textContent = 'Hide'; // Start with 'Hide' since lights are visible by default
        toggleTrafficLightsBtn.title = 'Toggle traffic light visibility';
        
        // Add click event listener for the toggle button
        toggleTrafficLightsBtn.addEventListener('click', () => {
            const taskCards = document.querySelectorAll('.task-card');
            let areHidden = true; // Will be updated based on actual state
            
            taskCards.forEach(card => {
                const trafficLightContainer = card.querySelector('.traffic-light-container');
                if (trafficLightContainer) {
                    trafficLightContainer.classList.toggle('hidden');
                }
            });
            
            // Check the state after toggling to determine button text
            const firstCard = document.querySelector('.task-card');
            if (firstCard) {
                const firstTrafficLight = firstCard.querySelector('.traffic-light-container');
                if (firstTrafficLight) {
                    areHidden = firstTrafficLight.classList.contains('hidden');
                }
            }
            
            // Update button text based on current state
            toggleTrafficLightsBtn.textContent = areHidden ? 'Show' : 'Hide';
        });
        
        // Add click event listeners for traffic light filters
        [allFilterBtn, redFilterBtn, amberFilterBtn, greenFilterBtn, noStatusFilterBtn].forEach(btn => {
            btn.addEventListener('click', (event) => {
                // Remove active class from all filter buttons
                trafficLightFilterContainer.querySelectorAll('.traffic-light-filter-btn').forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                event.target.classList.add('active');
                // Set the traffic light filter
                currentTrafficLightFilter = event.target.dataset.filter;
                _renderInternal(); // Re-render with new filter
            });
        });
        
        // Set initial active state
        if (currentTrafficLightFilter === 'all') {
            allFilterBtn.classList.add('active');
        } else if (currentTrafficLightFilter === 'red') {
            redFilterBtn.classList.add('active');
        } else if (currentTrafficLightFilter === 'amber') {
            amberFilterBtn.classList.add('active');
        } else if (currentTrafficLightFilter === 'green') {
            greenFilterBtn.classList.add('active');
        } else if (currentTrafficLightFilter === 'none') {
            noStatusFilterBtn.classList.add('active');
        }
        
        // Create filter button
        const filterButton = createElement('button', 'filter-apply-btn', null, '🔍');
        filterButton.title = 'Apply filter';
        filterButton.addEventListener('click', () => {
            currentFilterString = filterInput.value.toLowerCase();
            _renderInternal(); // Re-render the board with the new filter
        });

        // Event listener for filter input (Enter key)
        filterInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                currentFilterString = filterInput.value.toLowerCase();
                _renderInternal(); // Re-render the board with the new filter
            }
        });

        trafficLightFilterContainer.appendChild(toggleTrafficLightsBtn);
        trafficLightFilterContainer.appendChild(allFilterBtn);
        trafficLightFilterContainer.appendChild(redFilterBtn);
        trafficLightFilterContainer.appendChild(amberFilterBtn);
        trafficLightFilterContainer.appendChild(greenFilterBtn);
        trafficLightFilterContainer.appendChild(noStatusFilterBtn);
        
        // Add input and button to the input row
        filterInputRow.appendChild(filterInput);
        filterInputRow.appendChild(filterButton);
        
        // Add both rows to the filter container
        filterContainer.appendChild(filterInputRow);
        filterContainer.appendChild(trafficLightFilterContainer);
        backlogHeader.appendChild(filterContainer); // Add filter inside backlogHeader

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

        // Filter tasks based on currentFilterString and traffic light filter
        const filteredTasks = allTasks.filter(task => {
            // Apply text filter
            let textFilterPassed = true;
            if (currentFilterString) {
                const taskName = task.name ? task.name.toLowerCase() : '';
                const epic = epics.find(e => e.id === task.epicId);
                const epicName = epic ? epic.name.toLowerCase() : '';
                const dependentTeam = task.dependentTeam ? task.dependentTeam.toLowerCase() : '';

                textFilterPassed = taskName.includes(currentFilterString) ||
                                 epicName.includes(currentFilterString) ||
                                 dependentTeam.includes(currentFilterString);
            }

            // Apply traffic light filter
            let trafficLightFilterPassed = true;
            if (currentTrafficLightFilter !== 'all') {
                if (currentTrafficLightFilter === 'none') {
                    // Show tasks that have no traffic light status (i.e., not red, amber, or green)
                    const status = task.trafficLightStatus;
                    trafficLightFilterPassed = !(status && (status === 'red' || status === 'amber' || status === 'green'));
                } else {
                    trafficLightFilterPassed = task.trafficLightStatus === currentTrafficLightFilter;
                }
            }

            return textFilterPassed && trafficLightFilterPassed;
        });

        // Populate tasks into their respective columns (including backlog) and calculate initial story points
        if (sprints && sprints.length > 0) {
            sprints.forEach(sprint => {
                const sprintTasks = filteredTasks.filter(task => task && task.sprintId === sprint.id);
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
        const sprintIds = new Set(sprints.map(s => s.id));
        const backlogTasks = filteredTasks.filter(task => {
            if (!task) return false;
            // A task is in the backlog if it has no sprintId, its sprintId is 'Backlog',
            // or its sprintId points to a sprint that no longer exists.
            return !task.sprintId || task.sprintId === 'Backlog' || !sprintIds.has(task.sprintId);
        });
        const backlogTaskListElement = columnsContainer.querySelector('.task-list[data-sprint-id="Backlog"]');
        if (backlogTaskListElement) {
            backlogTasks.forEach(task => {
                const taskCardElement = _renderTaskCard(task, epics); // Renamed components to epics
                backlogTaskListElement.appendChild(taskCardElement);
            });
        }

        // Add the "Add Sprint" button after the last sprint column
        const addSprintButton = createElement('button', 'global-add-sprint-btn', null, '+ Add Sprint');
        addSprintButton.addEventListener('click', () => {
            if (typeof AddSprintModal !== 'undefined') {
                AddSprintModal.openModal();
            } else {
                console.error("AddSprintModal is not defined. Ensure it's loaded and initialized.");
                alert("Error: Add Sprint functionality is currently unavailable.");
            }
        });
        columnsContainer.appendChild(addSprintButton);


        sprintBoardViewElement.appendChild(columnsContainer);

        _initializeSortableJS(columnsContainer);

        console.log("Sprint Board rendered with current data.");
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
                // Immediately update the text content of the original element and replace the input
                nameElement.textContent = newName;
                input.replaceWith(nameElement);
                _renderInternal(); // Re-render to ensure consistency across the board
            } else {
                // If no change or invalid input, revert the text and replace input
                nameElement.textContent = oldName;
                input.replaceWith(nameElement);
                _renderInternal(); // Re-render to ensure consistency across the board
            }
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
     * Makes sprint capacity editable in place.
     * @param {Sprint} sprint - The sprint object to edit.
     * @param {HTMLElement} storyPointsElement - The P element displaying the story points.
     * @private
     */
    function _makeSprintCapacityEditable(sprint, storyPointsElement) {
        const oldCapacity = sprint.capacity;
        const input = createElement('input', 'sprint-capacity-edit', { type: 'number', value: oldCapacity, min: "0" });

        storyPointsElement.replaceWith(input);
        input.focus();
        input.select();

        function saveSprintCapacity() {
            const newCapacity = parseInt(input.value, 10);
            let currentSprints = Storage.getSprints();
            const sprintToUpdate = currentSprints.find(s => s.id === sprint.id);

            if (sprintToUpdate && !isNaN(newCapacity) && newCapacity >= 0 && newCapacity !== oldCapacity) {
                sprintToUpdate.capacity = newCapacity;
                Storage.saveSprints(currentSprints);
                _renderInternal(); // Re-render to update display and capacity check
            } else {
                // Revert to old display if input is invalid or not changed
                _updateSprintStoryPointsDisplay(sprint.id, Storage.getTasksBySprintId(sprint.id).reduce((sum, t) => sum + (t.storyPoints || 0), 0), oldCapacity);
            }
            input.replaceWith(storyPointsElement);
        }

        input.addEventListener('blur', saveSprintCapacity);
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                saveSprintCapacity();
            } else if (event.key === 'Escape') {
                _updateSprintStoryPointsDisplay(sprint.id, Storage.getTasksBySprintId(sprint.id).reduce((sum, t) => sum + (t.storyPoints || 0), 0), oldCapacity);
                input.replaceWith(storyPointsElement);
            }
        });
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

                    // 1. Get all tasks from storage, filtering out any nulls
                    let allTasks = Storage.getTasks().filter(Boolean);

                    // 2. Find the task that was moved
                    const movedTask = allTasks.find(t => t.id === taskId);
                    if (!movedTask) {
                        console.error(`Task with ID ${taskId} not found in storage. Re-rendering to prevent state corruption.`);
                        _renderInternal();
                        return;
                    }

                    // 3. Update the sprint ID of the moved task
                    movedTask.sprintId = newSprintId;

                    // 4. Re-order the tasks array based on the new DOM order
                    const reorderedTasks = [];
                    const taskMap = new Map(allTasks.map(t => [t.id, t]));
                    
                    const allTaskListElements = container.querySelectorAll('.task-list');
                    allTaskListElements.forEach(listElement => {
                        const orderedIds = Array.from(listElement.children).map(child => child.dataset.taskId);
                        orderedIds.forEach(id => {
                            if (taskMap.has(id)) {
                                reorderedTasks.push(taskMap.get(id));
                                taskMap.delete(id); // Remove from map to avoid duplicates
                            }
                        });
                    });

                    // Add any remaining tasks from the map (shouldn't happen in a consistent state)
                    if (taskMap.size > 0) {
                        console.warn("Some tasks were not found in the DOM during re-ordering. Appending them to the end.", [...taskMap.values()]);
                        reorderedTasks.push(...taskMap.values());
                    }

                    // 5. Save the newly ordered and updated tasks
                    Storage.saveTasks(reorderedTasks);

                    // 6. Re-render the entire board to reflect the new state
                    _renderInternal();
                    
                    // 7. Update other views if necessary
                    const roadmapViewElement = document.getElementById('roadmap-view');
                    if (typeof RoadmapView !== 'undefined' && roadmapViewElement && roadmapViewElement.style.display !== 'none') {
                        RoadmapView.renderRoadmapGrid();
                    }
                    Header.updateHeaderCapacities();
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
        updateSprintStoryPointsDisplay: _updateSprintStoryPointsDisplay // Expose if needed externally
    };
})();
