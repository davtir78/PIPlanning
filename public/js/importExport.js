/**
 * importExport.js
 *
 * This module handles the import and export of data, including JIRA data
 * using XLSX format, and general application data.
 * It leverages the SheetJS library for XLSX operations.
 */
(function () {
    'use strict';

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
            const sprintAssignment = row['SprintAssignment']; // Support old format with SprintAssignment column
            // Prefer SprintAssignment (old format) if present, otherwise use Sprint (newer format)
            const sprintField = (typeof sprintAssignment !== 'undefined' && sprintAssignment !== null && String(sprintAssignment).trim() !== '') ? String(sprintAssignment).trim() : (sprintName ? String(sprintName).trim() : null);
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
                const trafficLightStatus = row['Custom field (Traffic Light Status)'] || row['Traffic Light Status'] || null; // Map traffic light status
                const dependentTeam = row['Custom field (Dependent Team)'] || row['Dependent Team'] || null; // Map dependent team
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
                    sprintName: sprintName || null, // Link to sprint if available (from 'Sprint' column)
                    sprintRef: sprintField || null, // Unified sprint reference (could be SprintAssignment or Sprint)
                    color: issueColor, // Map issue color to task color
                    trafficLightStatus: trafficLightStatus, // Map traffic light status
                    dependentTeam: dependentTeam // Map dependent team
                };
                tasks.push(task);

                if (epicLink && epics[epicLink]) {
                    epics[epicLink].tasks.push(task.id);
                }
            }

            // Handle Sprints: If a sprint reference is present (SprintAssignment or Sprint),
            // try to find an existing sprint by that reference (name or id).
            // If not found, a new sprint object is created for internal use during import,
            // but it's not saved to Storage here. Sprints are saved as a whole later.
            if (sprintField) {
                // Use the sprintField value as the key in the temporary sprints map.
                // This preserves whatever the incoming file contained (name or id).
                let sprint = sprints[sprintField];
                if (!sprint) {
                    sprint = {
                        id: sprintField, // Using the provided reference as ID for temporary import purposes
                        name: sprintField,
                        startDate: null,
                        endDate: null,
                        status: 'Planned',
                        tasks: []
                    };
                    sprints[sprintField] = sprint;
                }
                sprint.tasks.push(issueKey); // Associate task with this sprint object
            }
        });

        // After parsing all rows, ensure tasks have correct sprintId if a sprint reference was provided
        tasks.forEach(task => {
            // sprintRef may come from either the SprintAssignment column (old files) or Sprint column
            const sprintRef = task.sprintRef || task.sprintName || null;

            if (sprintRef) {
                // Explicit 'Backlog' reference should map to the special Backlog identifier
                if (String(sprintRef).toLowerCase() === 'backlog') {
                    task.sprintId = 'Backlog';
                    return;
                }

                // Try to resolve by Sprint ID first (if storage provides a matching ID)
                const sprintById = Storage.getSprintById(sprintRef);
                if (sprintById) {
                    task.sprintId = sprintById.id;
                    return;
                }

                // Fallback: try to resolve by Sprint Name
                const sprintByName = Storage.getSprintByName(sprintRef);
                if (sprintByName) {
                    task.sprintId = sprintByName.id;
                    return;
                }

                // If no matching sprint found, leave unassigned (null)
                task.sprintId = null;
            } else {
                // No sprint reference provided; leave as null
                task.sprintId = null;
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
        reader.onload = function (e) {
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
        reader.onerror = function (e) {
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
        reader.onload = function (e) {
            try {
                const arrayBuffer = e.target.result;
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                console.log('Workbook loaded. Sheet names:', workbook.SheetNames);

                let importedTasks = [];
                let importedEpics = [];
                let importedSprints = []; // Collect all sprints first
                let importedDependentTeams = [];
                let importedFeatureTemplates = [];

                // --- FIRST PASS: Collect all data, especially sprints ---
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    const normalizedSheetName = sheetName.trim().toLowerCase();

                    switch (normalizedSheetName) {
                        case 'jira tasks':
                            // Temporarily parse tasks to extract derived sprints and epics
                            // We'll re-process tasks later after sprints are saved
                            const { epics: derivedEpics, sprints: derivedSprints } = _parseJIRAData(json);
                            derivedEpics.forEach(epic => {
                                if (!importedEpics.some(e => e.id === epic.id)) importedEpics.push(epic);
                            });
                            derivedSprints.forEach(sprint => {
                                if (!importedSprints.some(s => s.id === sprint.id)) importedSprints.push(sprint);
                            });
                            break;
                        case 'jira epics':
                            importedEpics = importedEpics.concat(json.map(row => ({
                                id: row['Issue key'],
                                name: row['Summary'],
                                description: row['Summary'],
                                status: row['Status'] || 'Planned',
                                storyPoints: parseFloat(row['Story Points']) || 0,
                                tasks: []
                            })));
                            break;
                        case 'sprints':
                            importedSprints = importedSprints.concat(json);
                            break;
                        case 'dependent teams':
                            importedDependentTeams = importedDependentTeams.concat(json.map(row => row['Team Name']));
                            break;
                        case 'feature templates':
                            importedFeatureTemplates = importedFeatureTemplates.concat(json.map(row => {
                                // Check for new format first
                                if (row['Items (JSON)']) {
                                    try {
                                        return {
                                            id: row['Template ID'] || 'template-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
                                            name: row['Template Name'],
                                            items: JSON.parse(row['Items (JSON)'])
                                        };
                                    } catch (e) {
                                        console.warn("Error parsing feature template items JSON:", e);
                                        return null;
                                    }
                                }
                                // Fallback to legacy format (just name/suffix string)
                                return row['Template Name'];
                            }).filter(t => t));
                            break;
                        default:
                            console.warn(`Unknown sheet name encountered during JIRA import: ${sheetName}. Skipping.`);
                    }
                });

                // --- CRITICAL STEP: Save all collected sprints to Storage NOW ---
                Storage.saveSprints(importedSprints);

                // --- SECOND PASS: Process tasks, now that sprints are in Storage ---
                workbook.SheetNames.forEach(sheetName => {
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    const normalizedSheetName = sheetName.trim().toLowerCase();

                    if (normalizedSheetName === 'jira tasks') {
                        const { tasks: parsedTasks } = _parseJIRAData(json); // _parseJIRAData will now find sprints
                        importedTasks = importedTasks.concat(parsedTasks);
                    }
                });

                // --- FINAL SAVE: Save remaining data ---
                Storage.saveEpics(importedEpics);
                Storage.saveTasks(importedTasks);
                Storage.saveDependentTeams(importedDependentTeams);
                Storage.saveDependentTeams(importedDependentTeams);

                // Normalization for Feature Templates (Legacy vs New)
                const simpleStrings = importedFeatureTemplates.filter(t => typeof t === 'string');
                const complexObjects = importedFeatureTemplates.filter(t => typeof t === 'object' && t !== null);

                if (simpleStrings.length > 0) {
                    const defaultTemplate = {
                        id: 'imported-legacy-' + Date.now(),
                        name: 'Imported (Legacy)',
                        items: simpleStrings.map(s => ({ taskName: s, points: 0 }))
                    };
                    complexObjects.push(defaultTemplate);
                }

                // Ensure converted objects use taskName if they came from intermediate format
                complexObjects.forEach(t => {
                    if (t.items) {
                        t.items = t.items.map(i => ({
                            taskName: i.taskName || i.suffix,
                            points: i.points
                        }));
                    }
                });

                Storage.saveFeatureTemplates(complexObjects);
                console.log('Feature Templates saved:', complexObjects.length);

                alert('JIRA data imported successfully!');
                if (callback && typeof callback === 'function') {
                    callback();
                }
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error processing JIRA XLSX workbook:', error);
                alert('Failed to import JIRA data. Please ensure it is a valid XLSX file with correct sheet names.');
                if (errorCallback && typeof errorCallback === 'function') {
                    errorCallback('Failed to import JIRA data. Please ensure it is a valid XLSX file with correct sheet names.');
                }
            }
        };
        reader.onerror = function (e) {
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
                'Custom field (Dependent Team)': task.dependentTeam || '', // Export dependent team
                'Custom field (Traffic Light Status)': task.trafficLightStatus || '' // Export traffic light status
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
        // Export with support for new object structure
        if (featureTemplates.length > 0) {
            const templatesForSheet = featureTemplates.map(template => {
                if (typeof template === 'string') {
                    // Should verify storage migration happened, but handle just in case
                    return { 'Template Name': template };
                }
                return {
                    'Template ID': template.id,
                    'Template Name': template.name,
                    'Items (JSON)': JSON.stringify(template.items)
                };
            });
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
        reader.onload = function (e) {
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
                                trafficLightStatus: t['Traffic Light Status'] || null, // Add traffic light status
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
                            tempFeatureTemplates = json.map(f => {
                                if (f['Items (JSON)']) {
                                    try {
                                        return {
                                            id: f['Template ID'] || 'template-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
                                            name: f['Template Name'],
                                            items: JSON.parse(f['Items (JSON)'])
                                        };
                                    } catch (e) { return null; }
                                }
                                return f['Feature Template'] || f['Template Name']; // Support legacy column names
                            }).filter(t => t);
                            break;
                        default:
                            console.warn(`Unknown sheet name encountered during import: ${sheetName}. Normalized: ${normalizedSheetName}`);
                    }
                });

                // Now, process tasks to link epics and sprints by ID
                const finalTasks = tempTasks.map(task => {
                    const epic = tempEpics.find(e => e.name === task.epicName);
                    // Resolve sprintAssignment which may be a sprint ID, sprint name, or 'Backlog'
                    let resolvedSprintId = null;
                    if (task.sprintName) {
                        if (String(task.sprintName).toLowerCase() === 'backlog') {
                            resolvedSprintId = 'Backlog';
                        } else {
                            // Attempt by ID first
                            const byId = tempSprints.find(s => String(s.id) === String(task.sprintName));
                            if (byId) {
                                resolvedSprintId = byId.id;
                            } else {
                                // Fallback to matching by name
                                const byName = tempSprints.find(s => s.name === task.sprintName);
                                if (byName) resolvedSprintId = byName.id;
                            }
                        }
                    }

                    return {
                        ...task,
                        epicId: epic ? epic.id : null,
                        sprintId: resolvedSprintId,
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
                // Access Storage here to ensure it's fully initialized
                const Storage = window.Storage;
                Storage.saveSprints(tempSprints);
                console.log('Sprints saved:', tempSprints.length);
                Storage.saveEpics(finalEpics); // Save finalEpics with linked tasks
                console.log('Epics saved:', finalEpics.length);
                Storage.saveTasks(finalTasks); // Save finalTasks with resolved IDs
                console.log('Tasks saved:', finalTasks.length);
                Storage.saveDependentTeams(tempDependentTeams);
                console.log('Dependent Teams saved:', tempDependentTeams.length);
                console.log('Dependent Teams saved:', tempDependentTeams.length);

                // Normalization for All Data Import as well
                const simpleStringsAll = tempFeatureTemplates.filter(t => typeof t === 'string');
                const complexObjectsAll = tempFeatureTemplates.filter(t => typeof t === 'object' && t !== null);

                if (simpleStringsAll.length > 0) {
                    const defaultTemplateAll = {
                        id: 'imported-legacy-' + Date.now(),
                        name: 'Imported (Legacy)',
                        items: simpleStringsAll.map(s => ({ taskName: s, points: 0 }))
                    };
                    complexObjectsAll.push(defaultTemplateAll);
                }

                // Ensure converted objects use taskName if they came from intermediate format
                complexObjectsAll.forEach(t => {
                    if (t.items) {
                        t.items = t.items.map(i => ({
                            taskName: i.taskName || i.suffix,
                            points: i.points
                        }));
                    }
                });

                Storage.saveFeatureTemplates(complexObjectsAll);
                console.log('Feature Templates saved:', complexObjectsAll.length);

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
        reader.onerror = function (e) {
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
