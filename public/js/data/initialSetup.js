// PI Planner Initial Setup Logic
// Imported items (Sprint, Epic, Task, DEFAULT_EPICS, saveSprints, etc.)
// are now globally available due to script loading order.

/**
 * Generates a series of sprints based on user input.
 * @param {Date} piStartDate - The start date of the Program Increment.
 * @param {number} sprintLengthWeeks - The length of each sprint in weeks.
 * @param {number} teamCapacityPerSprint - The capacity for each sprint.
 * @param {number} numberOfSprints - The number of sprints to generate (default 12).
 * @returns {Sprint[]} An array of generated Sprint objects.
 */
function generateSprints(piStartDate, sprintLengthDays, teamCapacityPerSprint, numberOfSprints = 12) {
    const sprints = [];
    let currentStartDate = new Date(piStartDate.valueOf());

    for (let i = 0; i < numberOfSprints; i++) {
        const sprintName = `PI ${currentStartDate.getFullYear()}.${Math.floor((currentStartDate.getMonth() / 3) + 1)} - Sprint ${i + 1}`;
        const sprintEndDate = new Date(currentStartDate.valueOf());
        sprintEndDate.setDate(sprintEndDate.getDate() + sprintLengthDays - 1); // -1 because start date is inclusive

        sprints.push(new Sprint(
            sprintName,
            currentStartDate.toISOString().split('T')[0], // YYYY-MM-DD
            sprintEndDate.toISOString().split('T')[0],   // YYYY-MM-DD
            teamCapacityPerSprint
        ));

        // Set start date for the next sprint
        currentStartDate.setDate(currentStartDate.getDate() + sprintLengthDays);
    }
    return sprints;
}

/**
 * Creates default epics.
 * @returns {Epic[]} An array of default Epic objects.
 */
function createDefaultEpics() { // Renamed from createDefaultComponents
    return DEFAULT_EPICS.map(name => new Epic(name)); // Renamed DEFAULT_COMPONENTS to DEFAULT_EPICS, Component to Epic
}

/**
 * Performs the quick setup: generates sprints and default epics, and saves them.
 * Also creates some sample backlog tasks.
 * @param {Date} piStartDate
 * @param {number} sprintLengthWeeks
 * @param {number} teamCapacityPerSprint
 */
function performQuickSetup(piStartDate, sprintLengthWeeks, teamCapacityPerSprint, numberOfSprints = 12) {
    const sprintLengthDays = sprintLengthWeeks * 7;
    const newSprints = generateSprints(piStartDate, sprintLengthDays, teamCapacityPerSprint, numberOfSprints);
    const newEpics = createDefaultEpics(); // Renamed newComponents to newEpics, createDefaultComponents to createDefaultEpics
    const defaultDependentTeams = PREDEFINED_DEPENDENT_TEAMS; // Get default teams from config
    const defaultFeatureTemplates = FEATURE_TASK_TEMPLATES; // Get default feature templates from config

    Storage.saveSprints(newSprints);
    Storage.saveEpics(newEpics); // Renamed Storage.saveComponents to Storage.saveEpics
    Storage.saveDependentTeams(defaultDependentTeams);

    // Initialize feature templates if not already present
    if (Storage.getFeatureTemplates().length === 0) {
        Storage.saveFeatureTemplates(defaultFeatureTemplates);
    }

    // Removed automatic generation of sample tasks as per user request.
    // const existingTasks = Storage.getTasks();
    // Storage.saveTasks([...existingTasks, ...sampleTasks]);

    console.log("Quick setup performed. Sprints, epics, dependent teams, and feature templates created. Sample tasks were not generated."); // Updated log message
    return { sprints: newSprints, epics: newEpics, tasks: [], dependentTeams: defaultDependentTeams, featureTemplates: defaultFeatureTemplates }; // Return empty tasks array and feature templates
}

console.log("PI Planner initialSetup.js loaded.");
