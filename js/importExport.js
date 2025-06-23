/**
 * importExport.js
 *
 * This module handles the import and export of data, including JIRA data
 * using XLSX format, and general application data.
 * It leverages the SheetJS library for XLSX operations.
 */
(function() {
    'use strict';

    // Dependencies
    const Storage = window.Storage; // Access the global Storage module

    // --- Private Functions ---

    /**
     * Parses JIRA data from a structured array (e.g., from XLSX) into PI Planner's internal format.
     * @param {Array<Object>} jiraData - Array of objects, where each object represents a JIRA row.
     * @returns {Object} An object containing parsed tasks, epics, and sprints.
     */
    function _parseJIRAData(jiraData) {
        const tasks = [];
        const epics = {}; // Store epics by Epic Link for easy lookup
        const sprints = {}; // Store sprints by name

        jiraData.forEach(row => {
            const issueType = row['Issue Type'];
            const issueKey = row['Issue key'];
            const summary = row['Summary'];
            // Flexible field mapping for import
            const storyPoints = parseFloat(row['Custom field (Story Points)'] || row['Story Points']) || 0;
            const epicLink = row['Epic Link'] || row['Parent key']; // Prioritize 'Epic Link', fallback to 'Parent key'
            const sprintName = row['Sprint'];
            const status = row['Status'];
            const assignee = row['Assignee'];
            const reporter = row['Reporter'];
            const created = row['Created'];
            const updated = row['Updated'];
            const dueDate = row['Due date'] || row['Due Date']; // Prioritize 'Due date', fallback to 'Due Date'
            const labels = (row['Labels'] || row['Custom field (Labels)']) ? (row['Labels'] || row['Custom field (Labels)']).split(',').map(l => l.trim()) : [];

            if (issueType === 'Epic') {
                if (epicLink && !epics[epicLink]) {
                    epics[epicLink] = {
                        id: epicLink, // Using Epic Link as ID for now
                        name: summary,
                        description: summary,
                        status: status,
                        storyPoints: storyPoints,
                        tasks: []
                    };
                }
            } else if (issueType === 'Story' || issueType === 'Task' || issueType === 'Bug') {
                const issueColor = row['Custom field (Issue color)'] || row['Issue color'] || ''; // Flexible mapping for issue color
                const task = {
                    id: issueKey,
                    name: summary,
                    description: summary,
                    issueType: issueType,
                    storyPoints: storyPoints,
                    status: status,
                    assignee: assignee,
                    reporter: reporter,
                    created: created,
                    updated: updated,
                    dueDate: dueDate,
                    labels: labels,
                    epicId: epicLink || null, // Link to epic if available
                    sprintName: sprintName || null, // Link to sprint if available
                    color: issueColor // Map issue color to task color
                };
                tasks.push(task);

                if (epicLink && epics[epicLink]) {
                    epics[epicLink].tasks.push(task.id);
                }
            }

            // Handle Sprints: If a sprint name is present, try to find an existing sprint by name.
            // If not found, a new sprint object is created for internal use during import,
            // but it's not saved to Storage here. Sprints are saved as a whole later.
            if (sprintName) {
                let sprint = sprints[sprintName];
                if (!sprint) {
                    sprint = {
                        id: sprintName, // Using sprint name as ID for now, will be replaced by actual ID if saved
                        name: sprintName,
                        startDate: null,
                        endDate: null,
                        status: 'Planned',
                        tasks: []
                    };
                    sprints[sprintName] = sprint;
                }
                sprint.tasks.push(issueKey); // Associate task with this sprint object
            }
        });

        // After parsing all rows, ensure tasks have correct sprintId if a sprint object was found/created
        tasks.forEach(task => {
            if (task.sprintName) { // task.sprintName holds the JIRA sprint name
                const foundSprint = Storage.getSprintByName(task.sprintName);
                if (foundSprint) {
                    task.sprintId = foundSprint.id;
                } else {
                    // If sprint not found in Storage, but was in JIRA data,
                    // we might want to create it or just leave sprintId as null.
                    // For now, if not found, it remains unassigned (sprintId: null).
                    // The _parseJIRAData function already creates a temporary sprint object
                    // in the 'sprints' map, but that's not saved to Storage yet.
                    // The user's current setup doesn't automatically create sprints on import.
                    // So, if it's not in Storage, it's effectively a backlog item.
                    task.sprintId = null; // Explicitly set to null if no matching sprint in Storage
                }
            }
        });

        // Convert epics and sprints objects to arrays
        const epicArray = Object.values(epics);
        const sprintArray = Object.values(sprints);

        return { tasks, epics: epicArray, sprints: sprintArray };
    }

    /**
     * Reads an XLSX file and parses its content.
     * @param {File} file - The XLSX file to read.
     * @param {Function} callback - Callback function (err, data) called after parsing.
     */
    function _parseXLSX(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                callback(null, json);
            } catch (error) {
                callback(error, null);
            }
        };
        reader.onerror = function(e) {
            callback(e, null);
        };
        reader.readAsArrayBuffer(file);
    }

    // --- Public Functions ---

    /**
     * Imports JIRA data from an XLSX file.
     * This function now handles multi-sheet XLSX files, processing each sheet
     * based on its name to import tasks, epics, sprints, dependent teams, and feature templates.
     * @param {File} file - The XLSX file selected by the user.
     * @param {Function} [callback] - Optional callback function to execute after successful import.
     * @param {Function} [errorCallback] - Optional callback function to execute on import error.
     */
    function importJIRA(file, callback, errorCallback) {
        console.log('Starting JIRA XLSX import for file:', file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const arrayBuffer = e.target.result;
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                console.log('Workbook loaded. Sheet names:', workbook.SheetNames);

                let importedTasks = [];
                let importedEpics = [];
                let importedSprints = [];
                let importedDependentTeams = [];
                let importedFeatureTemplates = [];

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    console.log(`Processing sheet: ${sheetName}, rows: ${json.length}`);

                    // Normalize sheet name for robust matching (trim whitespace and convert to lowercase)
                    const normalizedSheetName = sheetName.trim().toLowerCase();

                    switch (normalizedSheetName) {
                        case 'jira tasks':
                            // _parseJIRAData is designed for a flat list of JIRA issues.
                            // It will extract tasks and derive epics/sprints from them.
                            // We'll use its task parsing, but handle epics/sprints from dedicated sheets if available.
                            const { tasks: parsedTasks, epics: derivedEpics, sprints: derivedSprints } = _parseJIRAData(json);
                            importedTasks = importedTasks.concat(parsedTasks);
                            // For derived epics/sprints, only add if not already present from a dedicated sheet
                            derivedEpics.forEach(epic => {
                                if (!importedEpics.some(e => e.id === epic.id)) importedEpics.push(epic);
                            });
                            derivedSprints.forEach(sprint => {
                                if (!importedSprints.some(s => s.id === sprint.id)) importedSprints.push(sprint);
                            });
                            console.log(`Parsed ${parsedTasks.length} tasks from '${sheetName}' sheet.`);
                            break;
                        case 'jira epics':
                            // Directly map from 'JIRA Epics' sheet, assuming it contains full epic objects
                            // This data should take precedence over epics derived from tasks.
                            importedEpics = importedEpics.concat(json.map(row => ({
                                id: row['Issue key'],
                                name: row['Summary'],
                                description: row['Summary'],
                                status: row['Status'] || 'Planned',
                                storyPoints: parseFloat(row['Story Points']) || 0,
                                tasks: [] // Tasks will be linked via task.epicId
                            })));
                            console.log(`Parsed ${json.length} epics from '${sheetName}' sheet.`);
                            break;
                        case 'sprints':
                            // Directly map from 'Sprints' sheet, assuming it contains full sprint objects
                            importedSprints = importedSprints.concat(json);
                            console.log(`Parsed ${json.length} sprints from '${sheetName}' sheet.`);
                            break;
                        case 'dependent teams':
                            // Assuming 'Dependent Teams' sheet contains objects like { 'Team Name': '...' }
                            importedDependentTeams = importedDependentTeams.concat(json.map(row => row['Team Name']));
                            console.log(`Parsed ${json.length} dependent teams from '${sheetName}' sheet.`);
                            break;
                        case 'feature templates':
                            // Assuming 'Feature Templates' sheet contains objects like { 'Template Name': '...' }
                            importedFeatureTemplates = importedFeatureTemplates.concat(json.map(row => row['Template Name']));
                            console.log(`Parsed ${json.length} feature templates from '${sheetName}' sheet.`);
                            break;
                        default:
                            console.warn(`Unknown sheet name encountered during JIRA import: ${sheetName}. Skipping.`);
                    }
                });

                // Log data before saving for debugging
                console.log('--- Data before saving to Storage ---');
                console.log('Imported Sprints:', importedSprints);
                console.log('Imported Epics:', importedEpics);
                console.log('Imported Tasks:', importedTasks);
                console.log('Imported Dependent Teams:', importedDependentTeams);
                console.log('Imported Feature Templates:', importedFeatureTemplates);
                console.log('------------------------------------');

                // Save data to Storage in correct order
                console.log('Saving imported data to Storage...');
                Storage.saveSprints(importedSprints);
                console.log('Sprints saved:', importedSprints.length);
                Storage.saveEpics(importedEpics);
                console.log('Epics saved:', importedEpics.length);
                Storage.saveTasks(importedTasks);
                console.log('Tasks saved:', importedTasks.length);
                Storage.saveDependentTeams(importedDependentTeams);
                console.log('Dependent Teams saved:', importedDependentTeams.length);
                Storage.saveFeatureTemplates(importedFeatureTemplates);
                console.log('Feature Templates saved:', importedFeatureTemplates.length);

                alert('JIRA data imported successfully!');
                // Execute callback if provided
                if (callback && typeof callback === 'function') {
                    callback();
                }
                // Trigger UI refresh if necessary
                window.dispatchEvent(new CustomEvent('dataUpdated'));
            } catch (error) {
                console.error('Error processing JIRA XLSX workbook:', error);
                alert('Failed to import JIRA data. Please ensure it is a valid XLSX file with correct sheet names.');
                if (errorCallback && typeof errorCallback === 'function') {
                    errorCallback('Failed to import JIRA data. Please ensure it is a valid XLSX file with correct sheet names.');
                }
            }
        };
        reader.onerror = function(e) {
            console.error('FileReader error during JIRA import:', e);
            alert('Failed to read JIRA file.');
            if (errorCallback && typeof errorCallback === 'function') {
                errorCallback('Failed to read JIRA file.');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    /**
     * Exports current PI Planner data to an XLSX file with multiple sheets,
     * formatted for JIRA where applicable (Tasks, Epics) and raw for others.
     *
     * This function gathers all relevant data from the application's storage
     * (tasks, epics, sprints, dependent teams, and feature templates) and
     * organizes it into separate sheets within a single XLSX workbook.
     *
     * The sheets are structured as follows:
     * - 'JIRA Tasks': Contains task-related data formatted for JIRA import,
     *   including issue type, key, summary, story points, epic link, sprint name,
     *   issue color, and dependent team.
     * - 'JIRA Epics': Contains epic-related data formatted for JIRA,
     *   including issue type, key, and summary.
     * - 'Sprints': Contains raw sprint data.
     * - 'Dependent Teams': Contains a list of dependent team names.
     * - 'Feature Templates': Contains a list of feature template names.
     *
     * If no data is available for export, an alert is displayed.
     * Upon successful export, an XLSX file named 'PIPlanner_JIRA_Export_MultiSheet.xlsx'
     * is downloaded, and a success alert is shown to the user.
     */
    function exportJIRA() {
        // Retrieve all necessary data from Storage
        const tasks = Storage.getTasks();
        const epics = Storage.getEpics();
        const sprints = Storage.getSprints();
        const dependentTeams = Storage.getDependentTeams();
        const featureTemplates = Storage.getFeatureTemplates();

        // Create a new workbook instance
        const workbook = XLSX.utils.book_new();

        // --- Sheet 1: JIRA Tasks ---
        // Map task data to a JIRA-friendly format for export
        const jiraTasksData = tasks.map(task => {
            // Look up sprint name using sprintId from Storage
            const sprint = task.sprintId ? Storage.getSprintById(task.sprintId) : null;
            const sprintName = sprint ? sprint.name : '';

            return {
                'Issue Type': task.issueType || 'Story', // Default to 'Story' if not specified
                'Issue key': task.id,
                'Summary': task.name,
                'Story Points': task.storyPoints,
                'Epic Link': task.epicId || '', // Link to epic if available
                'Sprint': sprintName, // Use the resolved sprint name
                'Custom field (Issue color)': task.color || '', // Export custom issue color
                'Custom field (Dependent Team)': task.dependentTeam || '' // Export dependent team
                // Other JIRA fields (Status, Assignee, Reporter, Created, Updated, Due Date, Labels)
                // are intentionally omitted based on previous feedback/requirements.
            };
        });
        // Add 'JIRA Tasks' sheet to the workbook if there is data
        if (jiraTasksData.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(jiraTasksData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'JIRA Tasks');
        }

        // --- Sheet 2: JIRA Epics ---
        // Map epic data to a JIRA-friendly format for export
        const jiraEpicsData = epics.map(epic => ({
            'Issue Type': 'Epic',
            'Issue key': epic.id,
            'Summary': epic.name
            // Other JIRA fields for epics are omitted as per feedback.
        }));
        // Add 'JIRA Epics' sheet to the workbook if there is data
        if (jiraEpicsData.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(jiraEpicsData);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'JIRA Epics');
        }

        // --- Sheet 3: Sprints (raw data) ---
        // Export raw sprint data as is
        if (sprints.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(sprints);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sprints');
        }

        // --- Sheet 4: Dependent Teams (raw data) ---
        // Convert array of strings to array of objects for XLSX export
        if (dependentTeams.length > 0) {
            const teamsForSheet = dependentTeams.map(team => ({ 'Team Name': team }));
            const worksheet = XLSX.utils.json_to_sheet(teamsForSheet);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Dependent Teams');
        }

        // --- Sheet 5: Feature Templates (raw data) ---
        // Convert array of strings to array of objects for XLSX export
        if (featureTemplates.length > 0) {
            const templatesForSheet = featureTemplates.map(template => ({ 'Template Name': template }));
            const worksheet = XLSX.utils.json_to_sheet(templatesForSheet);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Feature Templates');
        }

        // Check if any sheets were added to the workbook
        if (workbook.SheetNames.length === 0) {
            alert('No data to export.');
            return;
        }

        // Write the workbook to an XLSX file and trigger download
        XLSX.writeFile(workbook, 'PIPlanner_JIRA_Export_MultiSheet.xlsx');
        alert('JIRA data exported successfully to multiple sheets!');
    }

    /**
     * Exports all PI Planner application data (tasks, epics, sprints, etc.) to a single XLSX file.
     */
    function exportAllData() {
        const allData = {
            tasks: Storage.getTasks(),
            epics: Storage.getEpics(),
            sprints: Storage.getSprints(),
            dependentTeams: Storage.getDependentTeams(),
            featureTemplates: Storage.getFeatureTemplates()
        };

        const workbook = XLSX.utils.book_new();

        for (const sheetName in allData) {
            if (allData.hasOwnProperty(sheetName)) {
                const data = allData[sheetName];
                if (data && data.length > 0) {
                    const worksheet = XLSX.utils.json_to_sheet(data);
                    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.charAt(0).toUpperCase() + sheetName.slice(1));
                }
            }
        }

        if (workbook.SheetNames.length === 0) {
            alert('No data to export.');
            return;
        }

        XLSX.writeFile(workbook, 'PIPlanner_All_Data_Export.xlsx');
        alert('All application data exported successfully!');
    }

    /**
     * Imports all PI Planner application data from an XLSX file.
     * Assumes each sheet in the XLSX corresponds to a data type (e.g., 'Tasks', 'Epics').
     * @param {File} file - The XLSX file selected by the user.
     * @param {Function} [callback] - Optional callback function to execute after successful import.
     * @param {Function} [errorCallback] - Optional callback function to execute on import error.
     */
    function importAllData(file, callback, errorCallback) {
        console.log('Starting All Data XLSX import for file:', file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const arrayBuffer = e.target.result;
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                console.log('Workbook loaded. Sheet names:', workbook.SheetNames);

                let tempSprints = [];
                let tempEpics = [];
                let tempTasks = [];
                let tempDependentTeams = [];
                let tempFeatureTemplates = [];

                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);

                    const normalizedSheetName = sheetName.trim().toLowerCase();
                    console.log(`Original sheet name: "${sheetName}"`);
                    console.log(`Normalized sheet name: "${normalizedSheetName}"`);
                    console.log(`JSON data for sheet "${sheetName}":`, json); // Keep for now, remove after debugging

                    switch (normalizedSheetName) {
                        case 'sprints':
                            tempSprints = json.map(s => ({
                                id: s.id,
                                name: s.Name,
                                startDate: s.StartDate,
                                endDate: s.EndDate,
                                capacity: s.Capacity
                            }));
                            break;
                        case 'epics':
                            tempEpics = json.map(e => ({
                                id: e.ID,
                                name: e.Name,
                                description: e.Description || '',
                                status: e.Status || 'Planned',
                                storyPoints: parseFloat(e['Story Points']) || 0,
                                tasks: []
                            }));
                            break;
                        case 'tasks':
                            tempTasks = json.map(t => ({
                                id: t.id,
                                name: t.Name,
                                color: t.Color,
                                dependentTeam: t.DependentTeam,
                                epicName: t.Epic, // Store epic name temporarily for lookup
                                sprintName: t.SprintAssignment, // Store sprint name temporarily for lookup
                                storyPoints: t.StoryPoints,
                                issueType: t['Issue Type'] || 'Story',
                                assignee: t.Assignee || '',
                                reporter: t.Reporter || '',
                                created: t.Created || '',
                                updated: t.Updated || '',
                                dueDate: t['Due Date'] || t['Due date'] || '',
                                labels: (t.Labels || t['Custom field (Labels)']) ? (t.Labels || t['Custom field (Labels)']).split(',').map(l => l.trim()) : [],
                            }));
                            break;
                        case 'dependent teams':
                            tempDependentTeams = json.map(d => d['Dependent Team Name']);
                            break;
                        case 'feature templates':
                            tempFeatureTemplates = json.map(f => f['Feature Template']);
                            break;
                        default:
                            console.warn(`Unknown sheet name encountered during import: ${sheetName}. Normalized: ${normalizedSheetName}`);
                    }
                });

                // Now, process tasks to link epics and sprints by ID
                const finalTasks = tempTasks.map(task => {
                    const epic = tempEpics.find(e => e.name === task.epicName);
                    const sprint = tempSprints.find(s => s.name === task.sprintName);
                    return {
                        ...task,
                        epicId: epic ? epic.id : null,
                        sprintId: sprint ? sprint.id : null,
                        epicName: undefined, // Remove temporary property
                        sprintName: undefined // Remove temporary property
                    };
                });

                // Ensure epics also have their tasks linked if they were derived from JIRA import
                const finalEpics = tempEpics.map(epic => {
                    const tasksForEpic = finalTasks.filter(task => task.epicId === epic.id).map(task => task.id);
                    return {
                        ...epic,
                        tasks: tasksForEpic
                    };
                });


                // Log data before saving for debugging
                console.log('--- Data before saving to Storage ---');
                console.log('Imported Sprints:', tempSprints);
                console.log('Imported Epics:', finalEpics);
                console.log('Imported Tasks:', finalTasks);
                console.log('Imported Dependent Teams:', tempDependentTeams);
                console.log('Imported Feature Templates:', tempFeatureTemplates);
                console.log('------------------------------------');

                // Save data to Storage in correct order
                console.log('Saving imported data to Storage...');
                Storage.saveSprints(tempSprints);
                console.log('Sprints saved:', tempSprints.length);
                Storage.saveEpics(finalEpics); // Save finalEpics with linked tasks
                console.log('Epics saved:', finalEpics.length);
                Storage.saveTasks(finalTasks); // Save finalTasks with resolved IDs
                console.log('Tasks saved:', finalTasks.length);
                Storage.saveDependentTeams(tempDependentTeams);
                console.log('Dependent Teams saved:', tempDependentTeams.length);
                Storage.saveFeatureTemplates(tempFeatureTemplates);
                console.log('Feature Templates saved:', tempFeatureTemplates.length);

                alert('All application data imported successfully!');
                // Execute callback if provided
                if (callback && typeof callback === 'function') {
                    callback();
                }
                window.dispatchEvent(new CustomEvent('dataUpdated'));
            } catch (error) {
                console.error('Error processing all data XLSX workbook:', error);
                alert('Failed to import all data. Please ensure it is a valid XLSX file with correct sheet names.');
                if (errorCallback && typeof errorCallback === 'function') {
                    errorCallback('Failed to import all data. Please ensure it is a valid XLSX file with correct sheet names.');
                }
            }
        };
        reader.onerror = function(e) {
            console.error('FileReader error during all data import:', e);
            alert('Failed to read all data file.');
            if (errorCallback && typeof errorCallback === 'function') {
                errorCallback('Failed to read all data file.');
            }
        };
        reader.readAsArrayBuffer(file);
    }


    // --- Public API ---
    window.PIPlanner = window.PIPlanner || {};
    window.PIPlanner.ImportExport = {
        importJIRA: importJIRA,
        exportJIRA: exportJIRA,
        exportAllData: exportAllData, // Re-added
        importAllData: importAllData // Re-added
    };

    // Add clear, concise comments for all sections of code.
    // Add unit test for each new major functionality (This will be a separate step, not part of this file write)
    // Document the status of all your activities in a md file after each major change update/append to the status file dont overwrite (This will be a separate step)

})();
