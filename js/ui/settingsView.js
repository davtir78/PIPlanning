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
                        <section>
                            <h3>Import Data</h3>
                            <p>Import your PI Planner data from an XLSX file. This will overwrite existing data.</p>
                            <label for="import-file-input" class="btn btn-secondary">Choose File</label>
                            <input type="file" id="import-file-input" accept=".xlsx, .xls" style="display:none;">
                            <span id="file-name-display">No file chosen</span>
                            <button id="import-data-btn" class="btn btn-primary-green">Import Data</button>
                        </section>
                        <hr class="section-divider">
                        <section>
                            <h3>Export Data</h3>
                            <p>Export all your PI Planner data to an XLSX file.</p>
                            <button id="export-data-btn" class="btn btn-primary-purple">Export All Data</button>
                        </section>
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
                </div>
            </div>
        `;

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

        // Add event listeners for Import/Export buttons
        const importFileInput = settingsViewEl.querySelector('#import-file-input');
        const importDataBtn = settingsViewEl.querySelector('#import-data-btn');
        const exportDataBtn = settingsViewEl.querySelector('#export-data-btn');
        const fileNameDisplay = settingsViewEl.querySelector('#file-name-display');

        if (importFileInput) {
            importFileInput.addEventListener('change', () => {
                if (importFileInput.files.length > 0) {
                    fileNameDisplay.textContent = importFileInput.files[0].name;
                } else {
                    fileNameDisplay.textContent = 'No file chosen';
                }
            });
        }

        if (importDataBtn && importFileInput) {
            importDataBtn.addEventListener('click', () => _handleImportData(importFileInput));
        }
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', _handleExportData);
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
            console.log(`Saved epic ID ${epicId} with new name: ${newName}`);
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
     * Handles importing data from an XLSX file.
     * Delegates to the shared ImportExport module.
     * @param {HTMLInputElement} importFileInput - The file input element from which to read the file.
     * @private
     */
    function _handleImportData(importFileInput) {
        const file = importFileInput.files[0];
        ImportExport.importXLSX(file, () => {
            // On complete callback: re-render views
            if (typeof SprintBoardView !== 'undefined') SprintBoardView.render();
            if (typeof GanttView !== 'undefined') GanttView.show(); // Reverted to GanttView.show()
            renderSettings(); // Re-render settings view itself
            if (typeof Header !== 'undefined') Header.updateHeaderCapacities(); // Update header if it shows capacities
        }, (errorMessage) => {
            alert(errorMessage);
        });
    }

    /**
     * Handles exporting all application data to an XLSX file.
     * Delegates to the shared ImportExport module.
     * @private
     */
    function _handleExportData() {
        ImportExport.exportXLSX(() => {
            // On complete callback
        }, (errorMessage) => {
            alert(errorMessage);
        });
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


    // Public API
    return {
        init,
        show,
        hide
    };
})();

console.log("PI Planner settingsView.js loaded.");
