// PI Planner LocalStorage Interaction Module

// PI Planner LocalStorage Interaction Module

window.Storage = (() => { // Assign the returned object to the global window.Storage variable
    // Constants from config.js (e.g., LOCAL_STORAGE_KEY_SPRINTS) are now globally available.
    console.log("storage.js: Initializing Storage module.");
    if (typeof LOCAL_STORAGE_KEY_SPRINTS === 'undefined') {
        console.error("storage.js: LOCAL_STORAGE_KEY_SPRINTS is UNDEFINED at Storage module initialization!");
    } else {
        console.log("storage.js: LOCAL_STORAGE_KEY_SPRINTS is DEFINED at Storage module initialization.");
    }

    /**
     * Retrieves an item from localStorage and parses it as JSON.
     * @param {string} key - The key of the item to retrieve.
     * @returns {any|null} The parsed item, or null if not found or error.
     */
    function getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Error getting item ${key} from localStorage:`, error);
            return null;
        }
    }

    /**
     * Stores an item in localStorage after serializing it to JSON.
     * @param {string} key - The key under which to store the item.
     * @param {any} value - The value to store.
     */
    function setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting item ${key} in localStorage:`, error);
        }
    }

    /**
     * Removes an item from localStorage.
     * @param {string} key - The key of the item to remove.
     */
    function removeItem(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item ${key} from localStorage:`, error);
        }
    }

    // Specific getter/setter functions for different data types

    // Sprints
    function getSprints() {
        return getItem(LOCAL_STORAGE_KEY_SPRINTS) || [];
    }
    function saveSprints(sprints) {
        setItem(LOCAL_STORAGE_KEY_SPRINTS, sprints);
    }

    // Tasks
    function getTasks() {
        return getItem(LOCAL_STORAGE_KEY_TASKS) || [];
    }
    function saveTasks(tasks) {
        setItem(LOCAL_STORAGE_KEY_TASKS, tasks);
    }

    // Epics
    function getEpics() {
        return getItem(LOCAL_STORAGE_KEY_EPICS) || [];
    }
    function saveEpics(epics) {
        setItem(LOCAL_STORAGE_KEY_EPICS, epics);
    }

    // Dependent Teams
    function getDependentTeams() {
        return getItem(LOCAL_STORAGE_KEY_DEPENDENT_TEAMS) || [];
    }
    function saveDependentTeams(dependentTeams) {
        setItem(LOCAL_STORAGE_KEY_DEPENDENT_TEAMS, dependentTeams);
    }

    // PI Objectives
    function getObjectives() {
        return getItem(LOCAL_STORAGE_KEY_OBJECTIVES) || [];
    }
    function saveObjectives(objectives) {
        setItem(LOCAL_STORAGE_KEY_OBJECTIVES, objectives);
    }

    // Settings
    function getSettings() {
        return getItem(LOCAL_STORAGE_KEY_SETTINGS) || {};
    }
    function saveSettings(settings) {
        setItem(LOCAL_STORAGE_KEY_SETTINGS, settings);
    }

    // Feature Templates
    function getFeatureTemplates() {
        let templates = getItem(LOCAL_STORAGE_KEY_FEATURE_TEMPLATES);

        // Migration Check 1: If templates is an array of strings (oldest format), convert to new object format
        if (Array.isArray(templates) && templates.length > 0 && typeof templates[0] === 'string') {
            console.log("storage.js: Detected legacy feature templates (strings). Migrating to new format...");
            const defaultTemplate = {
                id: 'default-template-' + Date.now(),
                name: 'Default Template',
                items: templates.map(suffix => ({
                    taskName: suffix, // Map string directly to taskName
                    points: 0
                }))
            };
            templates = [defaultTemplate];
            saveFeatureTemplates(templates);
            console.log("storage.js: Migration complete (Stage 1).", templates);
        }

        // Migration Check 2: If templates have 'suffix' property (intermediate format), rename to 'taskName'
        if (Array.isArray(templates) && templates.length > 0 && typeof templates[0] === 'object') {
            let changed = false;
            templates.forEach(t => {
                if (t.items && t.items.length > 0 && t.items[0].hasOwnProperty('suffix')) {
                    console.log(`storage.js: Migrating template "${t.name}" items from 'suffix' to 'taskName'...`);
                    t.items = t.items.map(item => ({
                        taskName: item.suffix,
                        points: item.points
                    }));
                    changed = true;
                }
            });
            if (changed) {
                saveFeatureTemplates(templates);
                console.log("storage.js: Migration complete (Stage 2 - suffix rename).", templates);
            }
        }

        return templates || [];
    }
    function saveFeatureTemplates(templates) {
        setItem(LOCAL_STORAGE_KEY_FEATURE_TEMPLATES, templates);
    }

    // Helper functions to get a specific item by ID
    /**
     * Retrieves a single task by its ID.
     * @param {string} taskId - The ID of the task to retrieve.
     * @returns {Task|null} The task object or null if not found.
     */
    function getTaskById(taskId) {
        const tasks = getTasks();
        return tasks.find(task => task.id === taskId) || null;
    }

    /**
     * Retrieves a single sprint by its ID.
     * @param {string} sprintId - The ID of the sprint to retrieve.
     * @returns {Sprint|null} The sprint object or null if not found.
     */
    function getSprintById(sprintId) {
        const sprints = getSprints();
        return sprints.find(sprint => sprint.id === sprintId) || null;
    }

    /**
     * Retrieves a single sprint by its name.
     * @param {string} sprintName - The name of the sprint to retrieve.
     * @returns {Sprint|null} The sprint object or null if not found.
     */
    function getSprintByName(sprintName) {
        const sprints = getSprints();
        return sprints.find(sprint => sprint.name === sprintName) || null;
    }

    /**
     * Retrieves tasks for a specific sprint ID.
     * @param {string} sprintId - The ID of the sprint.
     * @returns {Task[]} An array of tasks for that sprint.
     */
    function getTasksBySprintId(sprintId) {
        const tasks = getTasks();
        return tasks.filter(task => task.sprintId === sprintId);
    }

    /**
     * Retrieves a single epic by its ID.
     * @param {string} epicId - The ID of the epic to retrieve.
     * @returns {Epic|null} The epic object or null if not found.
     */
    function getEpicById(epicId) {
        const epics = getEpics();
        return epics.find(epic => epic.id === epicId) || null;
    }


    /**
     * Clears all PI Planner related data from localStorage.
     */
    function clearAllData() {
        removeItem(LOCAL_STORAGE_KEY_SPRINTS);
        removeItem(LOCAL_STORAGE_KEY_TASKS);
        removeItem(LOCAL_STORAGE_KEY_EPICS);
        removeItem(LOCAL_STORAGE_KEY_DEPENDENT_TEAMS); // Added dependent teams key
        removeItem(LOCAL_STORAGE_KEY_OBJECTIVES);
        removeItem(LOCAL_STORAGE_KEY_SETTINGS);
        removeItem(LOCAL_STORAGE_KEY_FEATURE_TEMPLATES); // Added feature templates key
        console.log("All PI Planner data cleared from localStorage.");
    }

    console.log("PI Planner storage.js module fully loaded.");

    // Public API
    return {
        getItem,
        setItem,
        removeItem,
        getSprints,
        saveSprints,
        getTasks,
        saveTasks,
        getEpics,
        saveEpics,
        getDependentTeams, // Added public function
        saveDependentTeams, // Added public function
        getObjectives,
        saveObjectives,
        getSettings,
        saveSettings,
        getFeatureTemplates, // Added public function
        saveFeatureTemplates, // Added public function
        getTaskById,
        getSprintById,
        getSprintByName, // Added public function
        getTasksBySprintId,
        getEpicById, // Added getEpicById to public API
        clearAllData
    };
})();
