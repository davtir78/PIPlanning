// js/ui/featureTemplateModal.js

const FeatureTemplateModal = (() => {
    let modalElement = null;
    let formElement = null;
    let featureNameInput = null;
    let templateSelect = null; // New template selector
    let colorPaletteContainer = null;
    let selectedColorInput = null; // Hidden input
    let componentSelect = null;
    let dependentTeamSelect = null;
    let generateBtn = null;
    let cancelBtn = null;

    /**
     * Initializes the modal, gets DOM elements, and sets up event listeners.
     */
    function init() {
        // The modal structure will be added to index.html later or created dynamically on open.
        // For now, assume it will be in index.html.
        modalElement = document.getElementById('feature-template-modal');

        if (!modalElement) {
            // Create the modal if it doesn't exist in HTML (alternative to adding to index.html manually)
            // This makes the module more self-contained.
            _createModalStructure();
            modalElement = document.getElementById('feature-template-modal');
        }

        // Get other elements once modal structure is confirmed/created
        formElement = modalElement.querySelector('#feature-template-form');
        featureNameInput = modalElement.querySelector('#feature-name-input');
        templateSelect = modalElement.querySelector('#feature-template-select'); // New element
        colorPaletteContainer = modalElement.querySelector('#feature-color-palette-container');
        selectedColorInput = modalElement.querySelector('#feature-selected-color-value');
        componentSelect = modalElement.querySelector('#feature-component-select');
        dependentTeamSelect = modalElement.querySelector('#feature-dependent-team-select');
        generateBtn = modalElement.querySelector('#generate-feature-tasks-btn');
        cancelBtn = modalElement.querySelector('#cancel-feature-template-btn');

        if (!formElement || !generateBtn || !cancelBtn) {
            console.error("Feature Template Modal critical form elements not found.");
            return;
        }

        formElement.addEventListener('submit', _handleGenerateFeatureTasks);
        cancelBtn.addEventListener('click', closeModal);

        // Populate color palette (can also be done in openModal if colors might change)
        _populateColorPalette();

        console.log("FeatureTemplateModal initialized.");
    }

    /**
     * Creates the modal's HTML structure and appends it to the body.
     * This is an alternative if not adding the div directly to index.html.
     * @private
     */
    function _createModalStructure() {
        const modalDiv = createElement('div', 'modal', { id: 'feature-template-modal', style: 'display: none;' });
        const modalContent = createElement('div', 'modal-content');
        modalContent.innerHTML = `
            <h2>Add New Feature from Template</h2>
            <form id="feature-template-form">
                <div>
                    <label for="feature-name-input">Feature Name:</label>
                    <input type="text" id="feature-name-input" required>
                </div>
                <div>
                    <label for="feature-template-select">Select Template:</label>
                    <select id="feature-template-select" required>
                        <!-- Options here -->
                    </select>
                </div>
                <div>
                    <label>Color (for all tasks):</label>
                    <div id="feature-color-palette-container" class="color-palette-container">
                        <!-- Swatches here -->
                    </div>
                    <input type="hidden" id="feature-selected-color-value">
                </div>
                <div>
                    <label for="feature-component-select">Component:</label>
                    <select id="feature-component-select" required>
                        <!-- Options here -->
                    </select>
                </div>
                <div>
                    <label for="feature-dependent-team-select">Dependent Team:</label>
                    <select id="feature-dependent-team-select">
                        <!-- Options here -->
                    </select>
                </div>
                <div class="modal-footer" style="text-align: right; margin-top: 20px;">
                    <button type="submit" id="generate-feature-tasks-btn" class="btn btn-primary">Generate Tasks</button>
                    <button type="button" id="cancel-feature-template-btn" class="btn btn-secondary">Cancel</button>
                </div>
            </form>
        `;
        modalDiv.appendChild(modalContent);
        document.body.appendChild(modalDiv);
    }


    /**
     * Populates the color palette with swatches.
     * @private
     */
    function _populateColorPalette() {
        if (!colorPaletteContainer) return;
        colorPaletteContainer.innerHTML = ''; // Clear existing swatches

        // Theme Colors section
        TASK_COLORS.themeColors.forEach(colorRow => {
            const colorGroupDiv = createElement('div', 'color-swatch-group');
            colorRow.forEach(colorValue => {
                const swatch = createElement('div', 'color-swatch', { 'data-color': colorValue });
                swatch.style.backgroundColor = colorValue;
                swatch.title = colorValue; // Tooltip for individual swatch

                swatch.addEventListener('click', () => {
                    _setActiveColorSwatch(colorValue);
                });
                colorGroupDiv.appendChild(swatch);
            });
            colorPaletteContainer.appendChild(colorGroupDiv);
        });

        // Standard Colors section
        const standardColorGroupDiv = createElement('div', 'color-swatch-group');
        TASK_COLORS.standardColors.forEach(colorValue => {
            const swatch = createElement('div', 'color-swatch', { 'data-color': colorValue });
            swatch.style.backgroundColor = colorValue;
            swatch.title = colorValue; // Tooltip for individual swatch

            swatch.addEventListener('click', () => {
                _setActiveColorSwatch(colorValue);
            });
            standardColorGroupDiv.appendChild(swatch);
        });
        colorPaletteContainer.appendChild(standardColorGroupDiv);

        // Set a default active swatch
        const defaultColor = (PREDEFINED_TASK_COLOR_VALUES && PREDEFINED_TASK_COLOR_VALUES.length > 0)
            ? PREDEFINED_TASK_COLOR_VALUES[0]
            : (defaultTaskColor || '#D3D3D3');
        _setActiveColorSwatch(defaultColor);
    }

    /**
     * Sets the active color swatch and updates the hidden input.
     * @param {string} colorValue - The hex color value to set as active.
     * @private
     */
    function _setActiveColorSwatch(colorValue) {
        if (!selectedColorInput || !colorPaletteContainer) return;
        selectedColorInput.value = colorValue;

        const swatches = colorPaletteContainer.querySelectorAll('.color-swatch');
        swatches.forEach(sw => {
            if (sw.dataset.color === colorValue) {
                sw.classList.add('active-swatch');
            } else {
                sw.classList.remove('active-swatch');
            }
        });
    }

    /**
     * Populates select dropdowns (Component, Dependent Team).
     * @private
     */
    function _populateSelects() {
        // Populate Epics (formerly Components)
        if (componentSelect) {
            componentSelect.innerHTML = '<option value="">Select Epic</option>';
            const epics = Storage.getEpics(); // Use Storage object, renamed from getComponents
            epics.forEach(epic => {
                componentSelect.appendChild(createElement('option', null, { value: epic.id }, epic.name));
            });
        }

        // Populate Dependent Teams
        if (dependentTeamSelect) {
            dependentTeamSelect.innerHTML = '<option value="">None</option>';
            const dependentTeams = Storage.getDependentTeams(); // Use Storage object
            dependentTeams.forEach(teamName => {
                dependentTeamSelect.appendChild(createElement('option', null, { value: teamName }, teamName));
            });
        }
    }

    /**
     * Opens the modal.
     */
    function openModal() {
        if (!modalElement) {
            console.error("Feature Template Modal element not found. Ensure init() was called or structure exists.");
            // Attempt to initialize if not done (e.g. if called before DOMContentLoaded completion for main.js)
            init();
            if (!modalElement) return; // Still not found
        }

        _populateSelects();
        _populateTemplateSelect(); // New population function
        _populateColorPalette(); // Re-populate or ensure default is set

        // Reset form fields
        if (formElement) formElement.reset();

        if (PREDEFINED_TASK_COLOR_VALUES.length > 0) {
            _setActiveColorSwatch(PREDEFINED_TASK_COLOR_VALUES[0]);
        }


        modalElement.style.display = 'flex';
        if (featureNameInput) featureNameInput.focus();
    }

    /**
     * Populates the template select dropdown.
     * @private
     */
    function _populateTemplateSelect() {
        if (!templateSelect) return;
        templateSelect.innerHTML = '<option value="">Select a Template</option>';
        const templates = Storage.getFeatureTemplates();
        templates.forEach(t => {
            // handle migration case on the fly just in case, though Storage should handle simple strings
            const id = typeof t === 'string' ? t : t.id;
            const name = typeof t === 'string' ? t : t.name;
            templateSelect.appendChild(createElement('option', null, { value: id }, name));
        });
    }

    /**
     * Closes the modal.
     */
    function closeModal() {
        if (modalElement) {
            modalElement.style.display = 'none';
        }
    }

    /**
     * Handles the generation of feature tasks.
     * @param {Event} event - The form submission event.
     * @private
     */
    function _handleGenerateFeatureTasks(event) {
        event.preventDefault();
        const featureName = featureNameInput.value.trim();
        const templateId = templateSelect.value;
        const color = selectedColorInput.value;
        const componentId = componentSelect.value;
        const dependentTeam = dependentTeamSelect.value || null;

        if (!featureName) {
            alert("Feature Name is required.");
            featureNameInput.focus();
            return;
        }
        if (!templateId) {
            alert("Please select a Template.");
            templateSelect.focus();
            return;
        }
        if (!componentId) {
            alert("Please select a Component.");
            componentSelect.focus();
            return;
        }
        if (!color) {
            alert("Please select a Color.");
            return;
        }

        let allTasks = Storage.getTasks();
        const newTasks = [];
        const featureTemplates = Storage.getFeatureTemplates();
        // find template by ID, or if legacy string list, find by name match (unlikely if migration works)
        let template = featureTemplates.find(t => (t.id && t.id === templateId) || t === templateId);

        if (!template) {
            alert("Selected template not found.");
            return;
        }

        // Handle legacy case if for some reason we have a string template (should have migrated but safety first)
        let templateItems = [];
        if (typeof template === 'string') {
            // Treat string template as a single task suffix? Or unsupported?
            // Since migration ensures object structure, we assume object.
            // But if we encounter a string in the *list*, our populate logic used it as both ID and Name.
            // In that fallback case, we can't really do much without items.
            // We'll treat it as a task suffix itself with 0 points?
            templateItems = [{ suffix: template, points: 0 }];
        } else {
            templateItems = template.items;
        }


        if (!templateItems || templateItems.length === 0) {
            alert("The selected template has no tasks defined.");
            return;
        }

        templateItems.forEach(item => {
            // Updated to use taskName, falling back to suffix for safety during migration
            const itemSuffix = item.taskName || item.suffix || 'Task';
            const taskName = `${featureName} - ${itemSuffix}`;
            const newTaskId = generateUniqueId();
            const newTask = new Task(
                taskName,
                item.points, // Use per-item points
                componentId,
                'Backlog', // All template tasks go to backlog
                color,
                dependentTeam,
                newTaskId
            );
            newTasks.push(newTask);
        });

        allTasks = allTasks.concat(newTasks);
        Storage.saveTasks(allTasks);

        alert(`${newTasks.length} tasks generated for feature "${featureName}".`);
        closeModal();

        // Refresh views
        if (typeof SprintBoardView !== 'undefined') SprintBoardView.render();
        const roadmapViewElement = document.getElementById('roadmap-view');
        if (typeof RoadmapView !== 'undefined' && roadmapViewElement && roadmapViewElement.classList.contains('active-view')) {
            RoadmapView.renderRoadmapGrid();
        }
        if (typeof Header !== 'undefined') Header.updateHeaderCapacities();
    }

    // Public API
    return {
        init,
        openModal,
        closeModal
    };
})();

console.log("PI Planner FeatureTemplateModal.js loaded.");
