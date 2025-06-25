// PI Planner Settings View UI Logic

const SettingsView = (() => {
    let settingsViewEl = null;

    /**
     * Initializes the settings view.
     */
    function init() {
        settingsViewEl = document.getElementById('settings-view');
        console.log("SettingsView module initialized.");
    }

    /**
     * Shows the settings view.
     */
    function show() {
        if (settingsViewEl) {
            settingsViewEl.style.display = 'block';
            renderSettings(); // Render content when shown
            console.log("SettingsView shown.");
        }
    }

    /**
     * Hides the settings view.
     */
    function hide() {
        if (settingsViewEl) {
            settingsViewEl.style.display = 'none';
            console.log("SettingsView hidden.");
        }
    }

    /**
     * Renders the content of the settings view.
     * This will include lists for Epics and Dependent Teams,
     * and controls for adding, editing, and deleting items.
     */
    function renderSettings() {
        if (!settingsViewEl) return;

        // --- Preserve Active Tab ---
        let activeTab = 'epics'; // Default to 'epics'
        const activeTabLink = settingsViewEl.querySelector('.tab-link.active');
        if (activeTabLink) {
            activeTab = activeTabLink.dataset.tab;
        }

        // Clear previous content and add the main settings container
        settingsViewEl.innerHTML = `
            <div class="settings-page-container">
                <nav class="tabs-navigation">
                    <button class="tab-link" data-tab="epics">Epics</button>
                    <button class="tab-link" data-tab="teams">Teams</button>
                    <button class="tab-link" data-tab="templates">Templates</button>
                    <button class="tab-link" data-tab="import-export">Import/Export</button>
                    <button class="tab-link" data-tab="danger-zone">Danger Zone</button>
                    <button class="tab-link" data-tab="about">About</button>
                    <button class="tab-link" data-tab="privacy-policy">Privacy Policy</button>
                </nav>

                <div class="tab-content-area">
                    <!-- Epics Tab Content -->
                    <div id="epics-tab" class="tab-pane">
                        <h2>Manage Epics</h2>
                        <ul class="item-list" id="epics-list"></ul>
                        <div class="add-item-form">
                            <input type="text" id="new-epic-name" placeholder="New Epic Name">
                            <button id="add-epic-btn" class="btn btn-primary-green">Add Epic</button>
                        </div>
                    </div>

                    <!-- Teams Tab Content -->
                    <div id="teams-tab" class="tab-pane">
                        <h2>Manage Dependent Teams</h2>
                        <ul class="item-list" id="dependent-teams-list"></ul>
                        <div class="add-item-form">
                            <input type="text" id="new-dependent-team-name" placeholder="New Dependent Team Name">
                            <button id="add-dependent-team-btn" class="btn btn-primary-green">Add Dependent Team</button>
                        </div>
                    </div>

                    <!-- Templates Tab Content -->
                    <div id="templates-tab" class="tab-pane">
                        <h2>Manage Feature Templates</h2>
                        <ul class="item-list" id="feature-templates-list"></ul>
                        <div class="add-item-form">
                            <input type="text" id="new-feature-template-name" placeholder="New Template Suffix">
                            <button id="add-feature-template-btn" class="btn btn-primary-green">Add Template</button>
                        </div>
                    </div>

                    <!-- Import/Export Tab Content -->
                    <div id="import-export-tab" class="tab-pane">
                        <fieldset class="import-export-group">
                            <legend>JIRA Import/Export</legend>
                            <section>
                                <h3>Import JIRA Data</h3>
                                <p>Import tasks, epics, and sprints from a JIRA XLSX export. This will overwrite existing data.</p>
                                <label for="import-jira-file-input" class="btn btn-secondary">Choose JIRA XLSX File</label>
                                <input type="file" id="import-jira-file-input" accept=".xlsx, .xls" style="display:none;">
                                <span id="jira-file-name-display">No file chosen</span>
                                <button id="import-jira-data-btn" class="btn btn-primary-green">Import JIRA Data</button>
                            </section>
                            <hr class="section-divider">
                            <section>
                                <h3>Export JIRA Data</h3>
                                <p>Export tasks, epics, and sprints to a JIRA-compatible XLSX file.</p>
                                <button id="export-jira-data-btn" class="btn btn-primary-purple">Export JIRA Data</button>
                            </section>
                        </fieldset>
                    </div>

                    <!-- Danger Zone Tab Content -->
                    <div id="danger-zone-tab" class="tab-pane danger-zone-content">
                        <h2>Danger Zone</h2>
                        <div class="warning-box">
                            <h3>Clear All Data</h3>
                            <p><strong>Warning:</strong> This will permanently delete all PI Planner data from your browser's local storage. This action cannot be undone.</p>
                            <button id="clear-all-data-btn" class="btn btn-danger-solid">Clear All Data</button>
                        </div>
                    </div>

                    <!-- About Tab Content (New) -->
                    <div id="about-tab" class="tab-pane">
                        <h2>About PI Planner</h2>
                        <div id="readme-content"></div>
                    </div>

                    <!-- Privacy Policy Tab Content -->
                    <div id="privacy-policy-tab" class="tab-pane">
                        <h2>Privacy Policy</h2>
                        <div id="privacy-policy-content"></div>
                    </div>
                </div>
            </div>
        `;

        // Render README.md content
        const readmeContentDiv = settingsViewEl.querySelector('#readme-content');
        if (readmeContentDiv && typeof marked !== 'undefined') {
            const readmeMarkdown = `# PI Planner Web Application

PI Planner is a single-page HTML web application designed for Program Increment (PI) Planning, offering a clean and intuitive interface. It helps teams organize, visualize, and manage tasks, sprints, epics, and dependencies within a PI.

## Features

*   **Sprint Board View**: Kanban-style board for managing tasks within sprints and a backlog.
*   **Roadmap View (Gantt Chart)**: Visualizes tasks and epics over time in a Gantt chart format.
*   **Settings Management**: Configure epics, dependent teams, and feature templates.
*   **Data Management**: Import and export application data.
*   **Local Storage Persistence**: All data is saved locally in your browser's \`localStorage\`.
*   **First-Time User Setup**: Guided setup for new users to quickly populate initial PI data.

## How to Use

1.  **Clone the repository**:
    \`git clone https://github.com/davtir78/PIPlanning.git\`
2.  **Navigate to the project directory**:
    \`cd PIPlanning\`
3.  **Open \`index.html\`**:
    Simply open the \`index.html\` file in your web browser. No server is required.

## Application Screens

### 1. Welcome Modal/Screen

This is the first screen users see if no data is found in local storage. It provides two options to get started:

*   **Quick Setup**: Allows users to generate initial PI data (sprints, epics) by defining a PI start date, sprint length, and team capacity.
*   **Import Data**: Enables users to import existing application data from a JSON file.

### 2. Header & Navigation

The header is present across all views and provides global navigation and actions:

*   **Application Title**: "PI Planner".
*   **View Toggle Buttons**:
    *   **Sprint Board**: Switches to the Kanban-style sprint management view.
    *   **Roadmap View**: Switches to the Gantt chart visualization.
    *   **Settings**: Navigates to the application settings.
*   **"Add Sprint" Button**: Dynamically appears only on the Sprint Board view to add new sprints.

### 3. Sprint Board View

This is the primary task management interface, resembling a Kanban board:

*   **Layout**: Displays a "Backlog" column and dynamic sprint columns arranged horizontally.
*   **Sprint Columns**: Each column represents a PI sprint, showing its name, date range, and capacity (used points / total capacity). Over-capacity sprints are visually indicated.
*   **Task Cards**: Tasks are displayed as cards within columns, showing Task Name, Story Points, Epic and Color Indicator
*   **Task Management**:
    *   "+ Add Task" buttons in Backlog and Sprint columns open the Task Property Panel.
    *   Clicking an existing task card opens the Task Property Panel for editing.
*   **Drag and Drop**: Tasks can be dragged and dropped between the Backlog and sprint columns, and between sprint columns, updating their assignments and recalculating sprint totals. Visual feedback and capacity warnings are provided during drag operations.

### 4. Roadmap View (Gantt Chart)

This view provides a visual representation of the PI roadmap:

*   **Layout**: A grid structure with Epics as rows and Sprints/Backlog as columns.
*   **Visual Elements**: Sprint columns show PI sprint names and date ranges. Tasks are displayed within intersection boxes where PI sprint columns and epic rows meet.
*   **Task Display**: Tasks are shown with their names, and can be clicked to open the Task Property Panel.
*   **Drag and Drop**: Tasks can be dragged between intersections to change their PI sprint/epic assignment.
*   **Capacity Indicators**: Story point totals are displayed per PI sprint column and epic row, with visual indicators for over-capacity.

### 5. Settings View

The settings view provides various tabs for managing application configurations:

*   **Epics Tab**: Allows users to add, edit, and delete Epics, which are used to categorize tasks.
*   **Teams Tab**: Manages Dependent Teams, which can be assigned to tasks to indicate dependencies.
*   **Templates Tab**: Enables users to manage feature task templates (add, edit, delete) for quick task creation.
*   **Import/Export Tab**: Provides functionality to import all application data from a JSON file or export it to a JSON file.
*   **Danger Zone Tab**: Contains options like "Clear All Data" (with confirmation) to reset the application.

### 6. Task Property Panel

This panel slides in (or appears as a modal) when adding a new task or clicking an existing task card:

*   **Fields**: Allows users to set/edit Task Name, Story Points, Epic (dropdown), Color (color picker), and Dependent Team (dropdown).
*   **Actions**: Includes "Save" and "Delete Task" buttons.

### 7. Feature Template Modal

This modal is used when adding a task from a predefined template:

*   **Functionality**: Fetches and displays user-configured feature templates from storage, allowing quick creation of tasks based on these templates.
`;
            readmeContentDiv.innerHTML = marked.parse(readmeMarkdown);
        }

        // Load Privacy Policy content
        const privacyPolicyContentDiv = settingsViewEl.querySelector('#privacy-policy-content');
        if (privacyPolicyContentDiv) {
            fetch('privacy-policy.html')
                .then(response => response.text())
                .then(html => {
                    // Extract only the body content from the fetched HTML
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const bodyContent = doc.body.innerHTML;
                    privacyPolicyContentDiv.innerHTML = bodyContent;
                })
                .catch(error => {
                    console.error('Error loading privacy policy:', error);
                    privacyPolicyContentDiv.innerHTML = '<p>Error loading privacy policy. Please try again later.</p>';
                });
        }

        const epics = Storage.getEpics();
        const dependentTeams = Storage.getDependentTeams();
        const featureTemplates = Storage.getFeatureTemplates();

        // Get list elements from the newly rendered content
        const epicsListEl = settingsViewEl.querySelector('#epics-list');
        const dependentTeamsListEl = settingsViewEl.querySelector('#dependent-teams-list');
        const featureTemplatesListEl = settingsViewEl.querySelector('#feature-templates-list');

        // Render Epics list
        if (epicsListEl) {
            if (epics && epics.length > 0) {
                epics.forEach(epic => {
                    const epicEl = createElement('li'); // Changed to li for ul
                    epicEl.innerHTML = `
                        <span>${epic.name}</span>
                        <div class="actions">
                            <button class="edit-btn btn btn-edit" data-id="${epic.id}">Edit</button>
                            <button class="delete-btn btn btn-danger-outline" data-id="${epic.id}">Delete</button>
                        </div>
                    `;
                    epicsListEl.appendChild(epicEl);
                });
            } else {
                epicsListEl.innerHTML = '<p style="color: var(--text-color-medium);">No epics defined.</p>';
            }
        }

        // Render Dependent Teams list
        if (dependentTeamsListEl) {
            if (dependentTeams && dependentTeams.length > 0) {
                dependentTeams.forEach(teamName => {
                    const teamEl = createElement('li'); // Changed to li for ul
                     // For dependent teams, the name is the value/ID for now
                    teamEl.innerHTML = `
                        <span>${teamName}</span>
                        <div class="actions">
                            <button class="edit-btn btn btn-edit" data-name="${teamName}">Edit</button>
                            <button class="delete-btn btn btn-danger-outline" data-name="${teamName}">Delete</button>
                        </div>
                    `;
                    dependentTeamsListEl.appendChild(teamEl);
                });
            } else {
                dependentTeamsListEl.innerHTML = '<p style="color: var(--text-color-medium);">No dependent teams defined.</p>';
            }
        }

        // Render Feature Templates list
        if (featureTemplatesListEl) {
            if (featureTemplates && featureTemplates.length > 0) {
                featureTemplates.forEach(template => {
                    const templateEl = createElement('li'); // Changed to li for ul
                    templateEl.innerHTML = `
                        <span>${template}</span>
                        <div class="actions">
                            <button class="edit-btn btn btn-edit" data-name="${template}">Edit</button>
                            <button class="delete-btn btn btn-danger-outline" data-name="${template}">Delete</button>
                        </div>
                    `;
                    featureTemplatesListEl.appendChild(templateEl);
                });
            } else {
                featureTemplatesListEl.innerHTML = '<p style="color: var(--text-color-medium);">No feature templates defined.</p>';
            }
        }

        // --- Restore Active Tab ---
        const newActiveTabLink = settingsViewEl.querySelector(`.tab-link[data-tab="${activeTab}"]`);
        const newActiveTabPane = settingsViewEl.querySelector(`#${activeTab}-tab`);
        if (newActiveTabLink && newActiveTabPane) {
            newActiveTabLink.classList.add('active');
            newActiveTabPane.classList.add('active');
        }


        // --- Tab Switching Logic ---
        const tabLinks = settingsViewEl.querySelectorAll('.tab-link');
        const tabPanes = settingsViewEl.querySelectorAll('.tab-pane');

        tabLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                const targetTabId = event.target.dataset.tab + '-tab'; // Append '-tab' to match pane IDs

                // Remove 'active' from all links and panes
                tabLinks.forEach(l => l.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));

                // Add 'active' to clicked link and corresponding pane
                event.target.classList.add('active');
                const targetPane = settingsViewEl.querySelector(`#${targetTabId}`);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });

        // --- Event Listeners for Add/Edit/Delete (Delegation) ---
        // Add event listeners for add buttons
        const addEpicBtn = settingsViewEl.querySelector('#add-epic-btn');
        const newEpicNameInput = settingsViewEl.querySelector('#new-epic-name');
        if (addEpicBtn && newEpicNameInput) {
            addEpicBtn.addEventListener('click', () => _handleAddEpic(newEpicNameInput.value));
        }

        const addDependentTeamBtn = settingsViewEl.querySelector('#add-dependent-team-btn');
        const newDependentTeamNameInput = settingsViewEl.querySelector('#new-dependent-team-name');
        if (addDependentTeamBtn && newDependentTeamNameInput) {
            addDependentTeamBtn.addEventListener('click', () => _handleAddDependentTeam(newDependentTeamNameInput.value));
        }

        const addFeatureTemplateBtn = settingsViewEl.querySelector('#add-feature-template-btn');
        const newFeatureTemplateNameInput = settingsViewEl.querySelector('#new-feature-template-name');
        if (addFeatureTemplateBtn && newFeatureTemplateNameInput) {
            addFeatureTemplateBtn.addEventListener('click', () => _handleAddFeatureTemplate(newFeatureTemplateNameInput.value));
        }

        // Add event listeners for edit/delete buttons using event delegation on the list containers
        // This handles dynamically added/removed items
        [epicsListEl, dependentTeamsListEl, featureTemplatesListEl].forEach(listEl => {
            if (listEl) {
                listEl.addEventListener('click', (event) => {
                    const target = event.target;
                    if (target.classList.contains('edit-btn')) {
                        if (listEl.id === 'epics-list') {
                            _handleEditEpic(target.dataset.id);
                        } else if (listEl.id === 'dependent-teams-list') {
                            _handleEditDependentTeam(target.dataset.name);
                        } else if (listEl.id === 'feature-templates-list') {
                            _handleEditFeatureTemplate(target.dataset.name);
                        }
                    } else if (target.classList.contains('delete-btn')) {
                        if (listEl.id === 'epics-list') {
                            _handleDeleteEpic(target.dataset.id);
                        } else if (listEl.id === 'dependent-teams-list') {
                            _handleDeleteDependentTeam(target.dataset.name);
                        } else if (listEl.id === 'feature-templates-list') {
                            _handleDeleteFeatureTemplate(target.dataset.name);
                        }
                    }
                });
            }
        });

        // JIRA Import/Export Event Listeners
        const importJiraFileInput = settingsViewEl.querySelector('#import-jira-file-input');
        const importJiraDataBtn = settingsViewEl.querySelector('#import-jira-data-btn');
        const exportJiraDataBtn = settingsViewEl.querySelector('#export-jira-data-btn');
        const jiraFileNameDisplay = settingsViewEl.querySelector('#jira-file-name-display');

        if (importJiraFileInput) {
            importJiraFileInput.addEventListener('change', () => {
                if (importJiraFileInput.files.length > 0) {
                    jiraFileNameDisplay.textContent = importJiraFileInput.files[0].name;
                } else {
                    jiraFileNameDisplay.textContent = 'No file chosen';
                }
            });
        }

        if (importJiraDataBtn && importJiraFileInput) {
            importJiraDataBtn.addEventListener('click', () => _handleImportJiraData(importJiraFileInput));
        }
        if (exportJiraDataBtn) {
            exportJiraDataBtn.addEventListener('click', _handleExportJiraData);
        }

        // Add event listener for Clear All Data button
        const clearAllDataBtn = settingsViewEl.querySelector('#clear-all-data-btn');
        if (clearAllDataBtn) {
            clearAllDataBtn.addEventListener('click', _handleClearAllData);
        }
    }

    /**
     * Handles adding a new epic.
     * @param {string} epicName - The name of the new epic.
     * @private
     */
    function _handleAddEpic(epicName) {
        const name = epicName.trim();
        if (!name) {
            alert("Epic name cannot be empty.");
            return;
        }

        const epics = Storage.getEpics();
        // Check if epic already exists (case-insensitive)
        if (epics.some(e => e.name.toLowerCase() === name.toLowerCase())) {
            alert(`Epic "${name}" already exists.`);
            return;
        }

        const newEpic = new Epic(name); // Assuming Epic model handles ID generation
        epics.push(newEpic);
        Storage.saveEpics(epics);
        renderSettings(); // Re-render the list
        // Clear input field
        const newEpicNameInput = settingsViewEl.querySelector('#new-epic-name');
        if (newEpicNameInput) newEpicNameInput.value = '';

        console.log(`Added new epic: ${name}`);
    }

    /**
     * Handles adding a new dependent team.
     * @param {string} teamName - The name of the new dependent team.
     * @private
     */
    function _handleAddDependentTeam(teamName) {
        const name = teamName.trim();
        if (!name) {
            alert("Dependent team name cannot be empty.");
            return;
        }

        const dependentTeams = Storage.getDependentTeams();
         // Check if team already exists (case-insensitive)
        if (dependentTeams.some(t => t.toLowerCase() === name.toLowerCase())) {
            alert(`Dependent team "${name}" already exists.`);
            return;
        }

        dependentTeams.push(name);
        Storage.saveDependentTeams(dependentTeams);
        renderSettings(); // Re-render the list
        // Clear input field
        const newDependentTeamNameInput = settingsViewEl.querySelector('#new-dependent-team-name');
        if (newDependentTeamNameInput) newDependentTeamNameInput.value = '';

        console.log(`Added new dependent team: ${name}`);
    }

    /**
     * Handles editing an epic.
     * @param {string} epicId - The ID of the epic to edit.
     * @private
     */
    function _handleEditEpic(epicId) {
        const epicsListEl = settingsViewEl.querySelector('#epics-list');
        const epicEl = epicsListEl.querySelector(`li button.edit-btn[data-id="${epicId}"]`).closest('li'); // Changed selector
        const epic = Storage.getEpics().find(e => e.id === epicId);

        if (!epicEl || !epic) {
            console.error(`Epic element or data not found for editing ID: ${epicId}`);
            return;
        }

        // Store original HTML to revert on cancel
        const originalHTML = epicEl.innerHTML;
        epicEl.dataset.originalHtml = originalHTML;

        // Replace content with input field and save/cancel buttons
        epicEl.innerHTML = `
            <input type="text" class="edit-input" value="${epic.name}">
            <div class="actions">
                <button class="save-edit-btn btn btn-primary-green" data-id="${epic.id}">Save</button>
                <button class="cancel-edit-btn btn btn-secondary" data-id="${epic.id}">Cancel</button>
            </div>
        `;

        const saveEditBtn = epicEl.querySelector('.save-edit-btn');
        const cancelEditBtn = epicEl.querySelector('.cancel-edit-btn');
        const editInput = epicEl.querySelector('.edit-input');

        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', () => {
                const newName = editInput.value.trim();
                _saveEditedEpic(epic.id, newName);
            });
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                // Revert to original HTML
                epicEl.innerHTML = epicEl.dataset.originalHtml;
                delete epicEl.dataset.originalHtml; // Clean up data attribute
                 // Re-attach event listeners for the reverted buttons (delegation handles this)
            });
        }

        if (editInput) {
            editInput.focus();
            editInput.select(); // Select text for easy editing
        }

        console.log(`Editing epic with ID: ${epicId}`);
    }

    /**
     * Saves the edited epic name.
     * @param {string} epicId - The ID of the epic.
     * @param {string} newName - The new name for the epic.
     * @private
     */
    function _saveEditedEpic(epicId, newName) {
        if (!newName) {
            alert("Epic name cannot be empty.");
            return;
        }

        let epics = Storage.getEpics();
        const epicIndex = epics.findIndex(e => e.id === epicId);

        if (epicIndex > -1) {
             // Check if the new name conflicts with existing epics (excluding the one being edited)
            if (epics.some((e, index) => index !== epicIndex && e.name.toLowerCase() === newName.toLowerCase())) {
                alert(`Epic "${newName}" already exists.`);
                return;
            }
            epics[epicIndex].name = newName;
            Storage.saveEpics(epics);
            renderSettings(); // Re-render the list
            console.log(`Saved epic ID ${epicId} with new name: "${newName}"`);
        } else {
            console.error(`Epic with ID ${epicId} not found for saving.`);
        }
    }


    /**
     * Handles deleting an epic.
     * @param {string} epicId - The ID of the epic to delete.
     * @private
     */
    function _handleDeleteEpic(epicId) {
        if (confirm("Are you sure you want to delete this epic? This cannot be undone.")) {
            let epics = Storage.getEpics();
            const initialLength = epics.length;
            epics = epics.filter(e => e.id !== epicId);
            if (epics.length < initialLength) {
                Storage.saveEpics(epics);
                renderSettings(); // Re-render the list
                console.log(`Deleted epic with ID: ${epicId}`);
            } else {
                console.warn(`Epic with ID ${epicId} not found for deletion.`);
            }
        }
    }

    /**
     * Handles editing a dependent team.
     * @param {string} teamName - The name of the dependent team to edit.
     * @private
     */
    function _handleEditDependentTeam(teamName) {
        const dependentTeamsListEl = settingsViewEl.querySelector('#dependent-teams-list');
        // Find the specific list item element for this team name
        // This requires iterating or using a more specific selector if possible
        let teamEl = null;
        dependentTeamsListEl.querySelectorAll('li').forEach(el => { // Changed to li
            // Assuming the span contains the exact team name for now
            if (el.querySelector('span')?.textContent === teamName) {
                teamEl = el;
            }
        });


        if (!teamEl) {
            console.error(`Dependent team element not found for editing: ${teamName}`);
            return;
        }

        // Store original HTML to revert on cancel
        const originalHTML = teamEl.innerHTML;
        teamEl.dataset.originalHtml = originalHTML;

        // Replace content with input field and save/cancel buttons
        teamEl.innerHTML = `
            <input type="text" class="edit-input" value="${teamName}">
            <div class="actions">
                <button class="save-edit-btn btn btn-primary-green" data-name="${teamName}">Save</button>
                <button class="cancel-edit-btn btn btn-secondary" data-name="${teamName}">Cancel</button>
            </div>
        `;

        const saveEditBtn = teamEl.querySelector('.save-edit-btn');
        const cancelEditBtn = teamEl.querySelector('.cancel-edit-btn');
        const editInput = teamEl.querySelector('.edit-input');

        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', () => {
                const newName = editInput.value.trim();
                _saveEditedDependentTeam(teamName, newName);
            });
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                // Revert to original HTML
                teamEl.innerHTML = teamEl.dataset.originalHtml;
                delete teamEl.dataset.originalHtml; // Clean up data attribute
                 // Re-attach event listeners for the reverted buttons (delegation handles this)
            });
        }

        if (editInput) {
            editInput.focus();
            editInput.select(); // Select text for easy editing
        }

        console.log(`Editing dependent team: ${teamName}`);
    }

    /**
     * Saves the edited dependent team name.
     * @param {string} originalName - The original name of the dependent team.
     * @param {string} newName - The new name for the dependent team.
     * @private
     */
    function _saveEditedDependentTeam(originalName, newName) {
         if (!newName) {
            alert("Dependent team name cannot be empty.");
            return;
        }

        let dependentTeams = Storage.getDependentTeams();
        const teamIndex = dependentTeams.findIndex(t => t === originalName);

        if (teamIndex > -1) {
             // Check if the new name conflicts with existing teams (excluding the one being edited)
            if (dependentTeams.some((t, index) => index !== teamIndex && t.toLowerCase() === newName.toLowerCase())) {
                alert(`Dependent team "${newName}" already exists.`);
                return;
            }
            dependentTeams[teamIndex] = newName;
            Storage.saveDependentTeams(dependentTeams);
            renderSettings(); // Re-render the list
            console.log(`Saved dependent team "${originalName}" with new name: "${newName}"`);
        } else {
            console.error(`Dependent team "${originalName}" not found for saving.`);
        }
    }

    /**
     * Handles deleting a dependent team.
     * @param {string} teamName - The name of the dependent team to delete.
     * @private
     */
    function _handleDeleteDependentTeam(teamName) {
         if (confirm(`Are you sure you want to delete the dependent team "${teamName}"? This cannot be undone.`)) {
            let dependentTeams = Storage.getDependentTeams();
            const initialLength = dependentTeams.length;
            dependentTeams = dependentTeams.filter(t => t !== teamName);
             if (dependentTeams.length < initialLength) {
                Storage.saveDependentTeams(dependentTeams);
                renderSettings(); // Re-render the list
                console.log(`Deleted dependent team: ${teamName}`);
            } else {
                console.warn(`Dependent team "${teamName}" not found for deletion.`);
            }
        }
    }

    /**
     * Handles adding a new feature template.
     * @param {string} templateName - The name of the new feature template.
     * @private
     */
    function _handleAddFeatureTemplate(templateName) {
        const name = templateName.trim();
        if (!name) {
            alert("Feature template name cannot be empty.");
            return;
        }

        const featureTemplates = Storage.getFeatureTemplates();
        if (featureTemplates.some(t => t.toLowerCase() === name.toLowerCase())) {
            alert(`Feature template "${name}" already exists.`);
            return;
        }

        featureTemplates.push(name);
        Storage.saveFeatureTemplates(featureTemplates);
        renderSettings();
        const newFeatureTemplateNameInput = settingsViewEl.querySelector('#new-feature-template-name');
        if (newFeatureTemplateNameInput) newFeatureTemplateNameInput.value = '';

        console.log(`Added new feature template: ${name}`);
    }

    /**
     * Handles editing a feature template.
     * @param {string} templateName - The name of the feature template to edit.
     * @private
     */
    function _handleEditFeatureTemplate(templateName) {
        const featureTemplatesListEl = settingsViewEl.querySelector('#feature-templates-list');
        let templateEl = null;
        featureTemplatesListEl.querySelectorAll('li').forEach(el => { // Changed to li
            if (el.querySelector('span')?.textContent === templateName) {
                templateEl = el;
            }
        });

        if (!templateEl) {
            console.error(`Feature template element not found for editing: ${templateName}`);
            return;
        }

        const originalHTML = templateEl.innerHTML;
        templateEl.dataset.originalHtml = originalHTML;

        templateEl.innerHTML = `
            <input type="text" class="edit-input" value="${templateName}">
            <div class="actions">
                <button class="save-edit-btn btn btn-primary-green" data-name="${templateName}">Save</button>
                <button class="cancel-edit-btn btn btn-secondary" data-name="${templateName}">Cancel</button>
            </div>
        `;

        const saveEditBtn = templateEl.querySelector('.save-edit-btn');
        const cancelEditBtn = templateEl.querySelector('.cancel-edit-btn');
        const editInput = templateEl.querySelector('.edit-input');

        if (saveEditBtn) {
            saveEditBtn.addEventListener('click', () => {
                const newName = editInput.value.trim();
                _saveEditedFeatureTemplate(templateName, newName);
            });
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                templateEl.innerHTML = templateEl.dataset.originalHtml;
                delete templateEl.dataset.originalHtml;
            });
        }

        if (editInput) {
            editInput.focus();
            editInput.select();
        }

        console.log(`Editing feature template: ${templateName}`);
    }

    /**
     * Saves the edited feature template name.
     * @param {string} originalName - The original name of the feature template.
     * @param {string} newName - The new name for the feature template.
     * @private
     */
    function _saveEditedFeatureTemplate(originalName, newName) {
        if (!newName) {
            alert("Feature template name cannot be empty.");
            return;
        }

        let featureTemplates = Storage.getFeatureTemplates();
        const templateIndex = featureTemplates.findIndex(t => t === originalName);

        if (templateIndex > -1) {
            if (featureTemplates.some((t, index) => index !== templateIndex && t.toLowerCase() === newName.toLowerCase())) {
                alert(`Feature template "${newName}" already exists.`);
                return;
            }
            featureTemplates[templateIndex] = newName;
            Storage.saveFeatureTemplates(featureTemplates);
            renderSettings();
            console.log(`Saved feature template "${originalName}" with new name: "${newName}"`);
        } else {
            console.error(`Feature template "${originalName}" not found for saving.`);
        }
    }

    /**
     * Handles deleting a feature template.
     * @param {string} templateName - The name of the feature template to delete.
     * @private
     */
    function _handleDeleteFeatureTemplate(templateName) {
        if (confirm(`Are you sure you want to delete the feature template "${templateName}"? This cannot be undone.`)) {
            let featureTemplates = Storage.getFeatureTemplates();
            const initialLength = featureTemplates.length;
            featureTemplates = featureTemplates.filter(t => t !== templateName);
            if (featureTemplates.length < initialLength) {
                Storage.saveFeatureTemplates(featureTemplates);
                renderSettings();
                console.log(`Deleted feature template: ${templateName}`);
            } else {
                console.warn(`Feature template "${templateName}" not found for deletion.`);
            }
        }
    }


    /**
     * Handles clearing all application data from local storage.
     * @private
     */
    function _handleClearAllData() {
        if (confirm("Are you absolutely sure you want to clear ALL PI Planner data? This action is irreversible and will delete all sprints, tasks, epics, objectives, and settings.")) {
            Storage.clearAllData();
            alert("All PI Planner data has been cleared. The application will now reload.");
            // Reload the page to reflect the cleared state
            window.location.reload();
        }
    }


    /**
     * Handles importing data from a JIRA XLSX file.
     * Delegates to the shared ImportExport module.
     * @param {HTMLInputElement} importJiraFileInput - The file input element from which to read the file.
     * @private
     */
    function _handleImportJiraData(importJiraFileInput) {
        const file = importJiraFileInput.files[0];
        // Use window.PIPlanner.ImportExport for JIRA import
        window.PIPlanner.ImportExport.importJIRA(file, () => {
            // On complete callback: re-render views
            if (typeof SprintBoardView !== 'undefined') SprintBoardView.render();
            renderSettings(); // Re-render settings view itself
            if (typeof Header !== 'undefined') Header.updateHeaderCapacities();
        }, (errorMessage) => {
            alert(errorMessage);
        });
    }

    /**
     * Handles exporting all application data to a JIRA XLSX file.
     * Delegates to the shared ImportExport module.
     * @private
     */
    function _handleExportJiraData() {
        // Use window.PIPlanner.ImportExport for JIRA export
        window.PIPlanner.ImportExport.exportJIRA(() => {
            // On complete callback
        }, (errorMessage) => {
            alert(errorMessage);
        });
    }

    // Public API
    return {
        init,
        show,
        hide
    };
})();

console.log("PI Planner settingsView.js loaded.");
