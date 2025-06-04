// PI Planner Import/Export Logic (XLSX)

const ImportExport = (() => {

    /**
     * Parses data from an XLSX workbook into the application's data structure.
     * Expected sheets: 'Sprints', 'Tasks', 'Epics', 'Dependent Teams', 'Feature Templates'.
     * @param {object} workbook - The SheetJS workbook object.
     * @returns {object} An object containing parsed tasks, sprints, epics, dependent teams, and feature templates.
     * @private
     */
    function _parseXLSXData(workbook) {
        const data = {};

        // Parse Epics first to create a mapping from name to ID
        let epicNameToIdMap = new Map();
        if (workbook.SheetNames.includes('Epics')) {
            const sheet = workbook.Sheets['Epics'];
            const rawEpics = XLSX.utils.sheet_to_json(sheet);
            data.epics = rawEpics.map(e => {
                // Assuming headers: 'Name', 'ID'
                const epic = new Epic(e.Name);
                if (e.ID) epic.id = e.ID; // Preserve ID if present in XLSX
                epicNameToIdMap.set(epic.name, epic.id); // Store mapping
                return epic;
            });
        }

        // Parse Sprints
        if (workbook.SheetNames.includes('Sprints')) {
            const sheet = workbook.Sheets['Sprints'];
            const rawSprints = XLSX.utils.sheet_to_json(sheet);
            data.sprints = rawSprints.map(s => {
                // Assuming headers: 'Name', 'StartDate', 'EndDate', 'Capacity'
                // Dates from XLSX might be numbers (Excel dates) or strings.
                // SheetJS can convert Excel dates to JS dates, but we need ISO string for constructor.
                const startDate = s.StartDate ? (new Date(s.StartDate)).toISOString().slice(0, 10) : '';
                const endDate = s.EndDate ? (new Date(s.EndDate)).toISOString().slice(0, 10) : '';

                const sprint = new Sprint(s.Name, startDate, endDate, s.Capacity);
                if (s.id) sprint.id = s.id; // Preserve ID if present in XLSX
                return sprint;
            });
        }

        // Parse Tasks
        if (workbook.SheetNames.includes('Tasks')) {
            const sheet = workbook.Sheets['Tasks'];
            const rawTasks = XLSX.utils.sheet_to_json(sheet);
            data.tasks = rawTasks.map(t => {
                // Assuming headers: 'Name', 'StoryPoints', 'Epic', 'Color', 'SprintAssignment', 'DependentTeam'
                // Map Epic Name to Epic ID
                const epicId = epicNameToIdMap.get(t.Epic) || null; // Get ID from map, or null if not found

                const task = new Task(t.Name, t.StoryPoints, epicId, t.SprintAssignment, t.Color, t.DependentTeam);
                if (t.id) task.id = t.id; // Preserve ID if present in XLSX
                return task;
            });
        }

        // Parse Dependent Teams
        if (workbook.SheetNames.includes('Dependent Teams')) {
            const sheet = workbook.Sheets['Dependent Teams'];
            // Assuming a single column for team names, header 'Dependent Team Name'
            const rawTeams = XLSX.utils.sheet_to_json(sheet);
            // Extract team names from the objects, assuming the key is 'Dependent Team Name'
            data.dependentTeams = rawTeams.map(row => row['Dependent Team Name']).filter(name => name && typeof name === 'string');
        }

        // Parse Feature Templates
        if (workbook.SheetNames.includes('Feature Templates')) {
            const sheet = workbook.Sheets['Feature Templates'];
            // Assuming a single column for template names, header 'Feature Template'
            const rawTemplates = XLSX.utils.sheet_to_json(sheet);
            // Extract template names from the objects, assuming the key is 'Feature Template'
            data.featureTemplates = rawTemplates.map(row => row['Feature Template']).filter(name => name && typeof name === 'string');
        }

        return data;
    }

    /**
     * Imports data from a selected XLSX file.
     * @param {File} file - The XLSX file to import.
     * @param {function} onCompleteCallback - Callback function to execute after successful import.
     * @param {function} onErrorCallback - Callback function to execute on error.
     */
    function importXLSX(file, onCompleteCallback, onErrorCallback) {
        if (!file) {
            if (onErrorCallback) onErrorCallback("No file selected.");
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const data = event.target.result;
                const workbook = XLSX.read(data, { type: 'binary' });

                if (confirm("Importing data will overwrite all existing data. Are you sure you want to proceed?")) {
                    const importedData = _parseXLSXData(workbook);

                    if (importedData.tasks) Storage.saveTasks(importedData.tasks);
                    if (importedData.sprints) Storage.saveSprints(importedData.sprints);
                    if (importedData.epics) Storage.saveEpics(importedData.epics);
                    if (importedData.dependentTeams) Storage.saveDependentTeams(importedData.dependentTeams);
                    if (importedData.featureTemplates) Storage.saveFeatureTemplates(importedData.featureTemplates);
                    // Config is not directly imported via XLSX sheets in this structure,
                    // but could be added if a dedicated config sheet is defined.

                    alert("Data imported successfully!");
                    if (onCompleteCallback) onCompleteCallback();
                }
            } catch (e) {
                console.error("Error importing data:", e);
                if (onErrorCallback) onErrorCallback("Error parsing XLSX file. Please ensure it's a valid XLSX format and contains expected sheets.");
            }
        };

        reader.onerror = () => {
            console.error("Error reading file:", reader.error);
            if (onErrorCallback) onErrorCallback("Error reading file.");
        };

        reader.readAsBinaryString(file); // Read as binary string for SheetJS
    }

    /**
     * Exports all application data to an XLSX file.
     * @param {function} onCompleteCallback - Callback function to execute after successful export.
     * @param {function} onErrorCallback - Callback function to execute on error.
     */
    function exportXLSX(onCompleteCallback, onErrorCallback) {
        try {
            const workbook = XLSX.utils.book_new();

            const sprints = Storage.getSprints();
            const tasks = Storage.getTasks();
            const epics = Storage.getEpics();
            const dependentTeams = Storage.getDependentTeams();
            const featureTemplates = Storage.getFeatureTemplates();

            // Create epicIdToNameMap once for use in tasks export
            const epicIdToNameMap = new Map(epics.map(epic => [epic.id, epic.name]));

            // Export Sprints
            if (sprints && sprints.length > 0) {
                const sprintData = sprints.map(s => ({
                    id: s.id, // Include ID for round-tripping
                    Name: s.name,
                    StartDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 10) : '', // Format date
                    EndDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 10) : '', // Format date
                    Capacity: s.capacity
                }));
                const sprintSheet = XLSX.utils.json_to_sheet(sprintData);
                XLSX.utils.book_append_sheet(workbook, sprintSheet, 'Sprints');
            }

            // Export Tasks
            if (tasks && tasks.length > 0) {
                const taskData = tasks.map(t => ({
                    id: t.id, // Include ID for round-tripping
                    Name: t.name,
                    StoryPoints: t.storyPoints,
                    Epic: epicIdToNameMap.get(t.epicId) || 'Unknown Epic', // Use epicIdToNameMap to get the name
                    Color: t.color,
                    SprintAssignment: t.sprintId, // Use sprintId for consistency
                    DependentTeam: t.dependentTeam
                }));
                const taskSheet = XLSX.utils.json_to_sheet(taskData);
                XLSX.utils.book_append_sheet(workbook, taskSheet, 'Tasks');
            }

            // Export Epics
            if (epics && epics.length > 0) {
                const epicData = epics.map(e => ({
                    ID: e.id, // Use ID as header for consistency
                    Name: e.name
                }));
                const epicSheet = XLSX.utils.json_to_sheet(epicData);
                XLSX.utils.book_append_sheet(workbook, epicSheet, 'Epics');
            }

            // Export Dependent Teams
            if (dependentTeams && dependentTeams.length > 0) {
                // Convert array of strings to array of objects for json_to_sheet
                const teamData = dependentTeams.map(team => ({ 'Dependent Team Name': team }));
                const teamSheet = XLSX.utils.json_to_sheet(teamData);
                XLSX.utils.book_append_sheet(workbook, teamSheet, 'Dependent Teams');
            }

            // Export Feature Templates
            if (featureTemplates && featureTemplates.length > 0) {
                const templateData = featureTemplates.map(template => ({ 'Feature Template': template }));
                const templateSheet = XLSX.utils.json_to_sheet(templateData);
                XLSX.utils.book_append_sheet(workbook, templateSheet, 'Feature Templates');
            }

            // Generate XLSX file and trigger download
            XLSX.writeFile(workbook, `pi_planner_data_${new Date().toISOString().slice(0, 10)}.xlsx`);

            alert("Data exported successfully!");
            if (onCompleteCallback) onCompleteCallback();
        } catch (e) {
            console.error("Error exporting data:", e);
            if (onErrorCallback) onErrorCallback("Error exporting data.");
        }
    }

    // Public API
    return {
        importXLSX,
        exportXLSX
    };
})();

console.log("PI Planner importExport.js loaded.");
