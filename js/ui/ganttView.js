// PI Planner Gantt View UI Logic

const GanttView = (() => {
    let ganttContainer = null;
    let ganttChartContainer = null;
    let scaleSelect = null;
    let teamFilterSelect = null;
    let areControlsSetup = false; // Flag to ensure controls are set up only once
    let isGanttInitialized = false; // Flag to track if Gantt has been initialized

    /**
     * Initializes the Gantt view.
     * Fetches the container element and sets up any initial state.
     */
    function init() {
        ganttContainer = document.getElementById('gantt-view');
        ganttChartContainer = document.getElementById('gantt_chart_container');
        scaleSelect = document.getElementById('gantt-scale-select');
        teamFilterSelect = document.getElementById('gantt-team-filter-select');

        if (!ganttContainer || !ganttChartContainer || !scaleSelect || !teamFilterSelect) {
            console.error("Gantt view, chart container, or select elements not found!");
            return;
        }

        ganttContainer.style.height = '100%';
        ganttContainer.style.width = '100%';

        // Attach _setupControls to onGanttReady event
        // This ensures controls are set up only when Gantt is fully initialized
        if (typeof gantt !== 'undefined') {
            gantt.attachEvent("onGanttReady", () => {
                if (!areControlsSetup) {
                    console.log("Gantt is ready, setting up controls.");
                    _setupControls();
                    areControlsSetup = true;
                }
            });
        } else {
            console.error("DHTMLX Gantt 'gantt' object not found at GanttView.init().");
        }
        
        console.log("GanttView initialized. Controls setup will occur on onGanttReady.");
    }

    /**
     * Sets up event listeners and populates dropdowns.
     * This should only be called once Gantt is fully initialized.
     * @private
     */
    function _setupControls() {
        // Populate Dependent Team dropdown
        _populateTeamFilterDropdown();

        // Event listener for Time Scale dropdown
        scaleSelect.addEventListener('change', () => {
            _renderGanttChart(); // Re-render the chart to apply the new scale.
        });

        // Event listener for Dependent Team dropdown (now for sorting)
        teamFilterSelect.addEventListener('change', (event) => {
            const selectedTeam = event.target.value;
            // Directly re-render the Gantt chart with the filtered data.
            // _setupControls is called only after onGanttReady, so gantt should be available.
            _renderGanttChart(selectedTeam);
            console.log(`Filtered Gantt chart by Dependent Team: ${selectedTeam}`);
        });
        console.log("GanttView controls setup complete.");
    }

    /**
     * Populates the Dependent Team filter dropdown with unique team names.
     * @private
     */
    function _populateTeamFilterDropdown() {
        const tasks = Storage.getTasks();
        const uniqueTeams = new Set();
        tasks.forEach(task => {
            if (task.dependentTeam) {
                uniqueTeams.add(task.dependentTeam);
            }
        });

        // Clear existing options except "All Teams"
        teamFilterSelect.innerHTML = '<option value="All">All Teams</option>';

        uniqueTeams.forEach(team => {
            const option = document.createElement('option');
            option.value = team;
            option.textContent = team;
            teamFilterSelect.appendChild(option);
        });
    }

    /**
     * Shows the Gantt view.
     * Renders the Gantt chart if not already rendered or updates it.
     */
    function show() {
        if (ganttContainer) {
            ganttContainer.style.display = 'block';
            console.log("GanttView shown.");
            _renderGanttChart();
        }
    }

    /**
     * Hides the Gantt view.
     */
    function hide() {
        if (ganttContainer) {
            ganttContainer.style.display = 'none';
            console.log("GanttView hidden.");
        }
    }

    /**
     * Transforms application epics and tasks into DHTMLX Gantt format.
     * @param {string} [filterTeam] - Optional team name to filter tasks by.
     * @returns {object} An object containing data and links arrays for DHTMLX Gantt.
     */
    function _prepareGanttData(filterTeam) {
        const epics = Storage.getEpics(); // Renamed from Storage.getComponents()
        let allTasks = Storage.getTasks();
        const sprints = Storage.getSprints();
        const ganttTasks = [];
        const ganttLinks = [];

        // Apply filter if a specific team is selected
        if (filterTeam && filterTeam !== "All") {
            allTasks = allTasks.filter(task => task.dependentTeam === filterTeam);
        }

        // Map to store epic's min start date and max end date
        const epicDateRanges = {}; // Renamed from componentDateRanges

        // Add all tasks as child tasks, linked to their epics
        allTasks.forEach(task => {
            const parentSprint = sprints.find(sprint => sprint.id === task.sprintId);
            if (parentSprint) {
                const taskStartDate = parentSprint.startDate;
                const taskEndDate = parentSprint.endDate;

                ganttTasks.push({
                    id: task.id,
                    text: `${task.name} (${task.storyPoints} SP)`,
                    start_date: taskStartDate,
                    end_date: taskEndDate,
                    parent: task.epicId, // Renamed task.componentId to task.epicId
                    progress: 0,
                    color: task.color,
                    dependentTeam: task.dependentTeam,
                    type: 'task' // Use string literal 'task'
                });

                // Update epic date ranges for all tasks
                if (!epicDateRanges[task.epicId]) { // Renamed componentDateRanges to epicDateRanges, task.componentId to task.epicId
                    epicDateRanges[task.epicId] = { // Renamed componentDateRanges to epicDateRanges, task.componentId to task.epicId
                        minStartDate: new Date(taskStartDate),
                        maxEndDate: new Date(new Date(taskEndDate).setDate(new Date(taskEndDate).getDate() + 1)) // Add 1 day to end date for DHTMLX Gantt
                    };
                } else {
                    const currentMin = epicDateRanges[task.epicId].minStartDate; // Renamed componentDateRanges to epicDateRanges, task.componentId to task.epicId
                    const currentMax = epicDateRanges[task.epicId].maxEndDate; // Renamed componentDateRanges to epicDateRanges, task.componentId to task.epicId
                    if (new Date(taskStartDate) < currentMin) {
                        epicDateRanges[task.epicId].minStartDate = new Date(taskStartDate); // Renamed componentDateRanges to epicDateRanges, task.componentId to task.epicId
                    }
                    if (new Date(taskEndDate) > currentMax) {
                        epicDateRanges[task.epicId].maxEndDate = new Date(new Date(taskEndDate).setDate(new Date(taskEndDate).getDate() + 1)); // Renamed componentDateRanges to epicDateRanges, task.componentId to task.epicId
                    }
                }
            }
        });

        // Add epics as parent tasks, but only if they have associated tasks
        epics.forEach(epic => { // Renamed components to epics, component to epic
            // Check if this epic has any tasks associated with it
            // Note: tasksForEpic should now be filtered if filterTeam was applied to allTasks
            const tasksForEpic = allTasks.filter(task => task.epicId === epic.id); // Renamed tasksForComponent to tasksForEpic, task.componentId to task.epicId

            if (tasksForEpic.length > 0) {
                const dateRange = epicDateRanges[epic.id]; // Renamed componentDateRanges to epicDateRanges, component.id to epic.id
                let startDate = null;
                let endDate = null;
                let epicColor = '#A9A9A9'; // Default color for epics (DarkGray) // Renamed componentColor to epicColor

                if (dateRange) {
                    startDate = dateRange.minStartDate.toISOString().split('T')[0];
                    endDate = dateRange.maxEndDate.toISOString().split('T')[0];

                    // Find the first task for this epic to get its color
                    const firstTaskOfEpic = tasksForEpic.find(task => task.epicId === epic.id); // Renamed firstTaskOfComponent to firstTaskOfEpic, task.componentId to task.epicId
                    if (firstTaskOfEpic && firstTaskOfEpic.color) {
                        epicColor = firstTaskOfEpic.color; // Renamed componentColor to epicColor
                    }
                } else {
                    // This case should ideally not be hit if tasksForEpic.length > 0,
                    // but as a fallback, give it a default date range.
                    startDate = new Date().toISOString().split('T')[0];
                    endDate = new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0];
                }

                ganttTasks.push({
                    id: epic.id,
                    text: epic.name,
                    start_date: startDate,
                    end_date: endDate,
                    open: true,
                    type: 'project', // Use string literal 'project'
                    color: epicColor // Renamed componentColor to epicColor
                });
            }
        });

        return {
            data: ganttTasks,
            links: ganttLinks
        };
    }

    /**
     * Renders the Gantt chart using DHTMLX Gantt.
     * @param {string} [selectedTeam] - Optional team name to filter tasks by.
     */
    function _renderGanttChart(selectedTeam) {
        const ganttData = _prepareGanttData(selectedTeam); // Pass selectedTeam to data preparation

        if (typeof gantt !== 'undefined' && ganttChartContainer) {
            // Configure Gantt settings (can be done before init or re-applied if needed)
            gantt.config.date_format = "%Y-%m-%d";
            gantt.config.xml_date = "%Y-%m-%d";

            // Determine the current scale based on the dropdown selection
            const currentScaleMode = scaleSelect.value; // Ensure scaleSelect is defined and has a value
            if (currentScaleMode === "Day") {
                gantt.config.scales = [
                    { unit: "day", step: 1, format: "%D, %M %d" }
                ];
            } else if (currentScaleMode === "Week") {
                gantt.config.scales = [
                    { unit: "month", step: 1, format: "%F, %Y" },
                    { unit: "week", step: 1, format: (date) => {
                        let weekStart = gantt.date.date_to_str("%j/%n")(date);
                        return `WS ${weekStart}`;
                    }}
                ];
            } else if (currentScaleMode === "Month") {
                gantt.config.scales = [
                    { unit: "year", step: 1, format: "%Y" },
                    { unit: "month", step: 1, format: "%M" }
                ];
            } else if (currentScaleMode === "Quarter") {
                gantt.config.scales = [
                    { unit: "year", step: 1, format: "%Y" },
                    { unit: "quarter", step: 1, format: (date) => {
                        const quarterNum = Math.floor((date.getMonth() / 3)) + 1;
                        return `Q${quarterNum}`;
                    }}
                ];
            } else if (currentScaleMode === "Year") {
                gantt.config.scales = [
                    { unit: "year", step: 1, format: "%Y" }
                ];
            }
            gantt.config.min_column_width = 50;

            gantt.config.columns = [
                {name:"text", label:"Task name", tree:true, width:'*', resize:true },
                {name:"start_date", label:"Start Time", align: "center", resize:true },
                {name:"duration", label:"Duration", align: "center" },
                {name:"dependentTeam", label:"Dependent Team", align: "center", resize:true },
                {name:"add", label:""}
            ];
            gantt.config.readonly = true;
            gantt.config.fit_tasks = true; // Ensure tasks fit when changing view

            if (!isGanttInitialized) {
                gantt.init(ganttChartContainer.id); // Initialize Gantt only once
                isGanttInitialized = true;
                console.log("DHTMLX Gantt initialized for the first time (in _renderGanttChart).");
            } else {
                gantt.clearAll(); // Clear existing data if already initialized
                console.log("DHTMLX Gantt data cleared for refresh.");
            }

            gantt.parse(ganttData); // Load new data
            gantt.render(); // Render the chart with new data
            gantt.setSizes(); // Ensure Gantt chart takes full available space

            // REMOVED: Logic to call _setupControls and manage areControlsSetup
            // This is now handled by the onGanttReady event in init()

            // Apply the current filter if a team is selected
            // This logic might need refinement if a filter should be auto-applied on first load after controls are set.
            // For now, it relies on the user interaction post-setup.
            const currentSelectedTeam = teamFilterSelect.value;
            if (currentSelectedTeam && currentSelectedTeam !== "All" && gantt._onBeforeTaskDisplayEventId) {
                // This ensures if a filter was somehow set before full setup, it's re-evaluated.
                // However, with deferred setup, this might be less critical.
                // gantt.render(); // Potentially re-render if needed, but might be redundant
            } else if (currentSelectedTeam === "All" && gantt._onBeforeTaskDisplayEventId) {
                // Similar to above
            }

            console.log("DHTMLX Gantt chart rendered/refreshed with application data (Epic hierarchy)."); // Renamed Component hierarchy to Epic hierarchy
        } else {
            console.warn("DHTMLX Gantt library not loaded or ganttChartContainer not available.");
            if (ganttChartContainer && !ganttChartContainer.innerHTML) {
                ganttChartContainer.innerHTML = '<p>DHTMLX Gantt library not loaded. Please ensure the CDN links are added to index.html.</p>';
            }
        }
    }

    // Public API
    return {
        init,
        show,
        hide
    };
})();
