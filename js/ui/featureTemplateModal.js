// js/ui/featureTemplateModal.js

const FeatureTemplateModal = (() => {
    let modalElement = null;
    let formElement = null;
    let featureNameInput = null;
    let defaultPointsInput = null;
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
        defaultPointsInput = modalElement.querySelector('#feature-default-points-input');
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
                    <label for="feature-default-points-input">Default Story Points (per task):</label>
                    <input type="number" id="feature-default-points-input" value="${DEFAULT_FEATURE_TASK_POINTS}" min="0" required>
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
                    <button type="submit" id="generate-feature-tasks-btn" class="button-primary">Generate Tasks</button>
                    <button type="button" id="cancel-feature-template-btn" class="button-secondary">Cancel</button>
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

        PREDEFINED_TASK_COLOR_VALUES.forEach(colorValue => {
            const swatch = createElement('div', 'color-swatch', { 'data-color': colorValue });
            swatch.style.backgroundColor = colorValue;
            swatch.title = colorValue; 

            swatch.addEventListener('click', () => {
                _setActiveColorSwatch(colorValue);
            });
            colorPaletteContainer.appendChild(swatch);
        });
        // Set a default active swatch
        if (PREDEFINED_TASK_COLOR_VALUES.length > 0) {
            _setActiveColorSwatch(PREDEFINED_TASK_COLOR_VALUES[0]);
        }
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
        _populateColorPalette(); // Re-populate or ensure default is set

        // Reset form fields
        if (formElement) formElement.reset();
        if (defaultPointsInput) defaultPointsInput.value = DEFAULT_FEATURE_TASK_POINTS;
        if (PREDEFINED_TASK_COLOR_VALUES.length > 0) {
             _setActiveColorSwatch(PREDEFINED_TASK_COLOR_VALUES[0]);
        }


        modalElement.style.display = 'flex';
        if(featureNameInput) featureNameInput.focus();
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
        const defaultPoints = parseInt(defaultPointsInput.value, 10);
        const color = selectedColorInput.value;
        const componentId = componentSelect.value;
        const dependentTeam = dependentTeamSelect.value || null;

        if (!featureName) {
            alert("Feature Name is required.");
            featureNameInput.focus();
            return;
        }
        if (isNaN(defaultPoints) || defaultPoints < 0) {
            alert("Default Story Points must be a non-negative number.");
            defaultPointsInput.focus();
            return;
        }
        if (!componentId) {
            alert("Please select a Component.");
            componentSelect.focus();
            return;
        }
        if (!color) {
            alert("Please select a Color.");
            // No specific element to focus, but palette should be visible
            return;
        }

        let allTasks = Storage.getTasks(); // Use Storage object
        const newTasks = [];
        const featureTemplates = Storage.getFeatureTemplates(); // Get configurable templates

        if (featureTemplates.length === 0) {
            alert("No feature templates configured. Please add some in Settings.");
            return;
        }

        featureTemplates.forEach(templateSuffix => {
            const taskName = `${featureName} - ${templateSuffix}`;
            const newTaskId = generateUniqueId();
            const newTask = new Task(
                taskName,
                defaultPoints,
                componentId,
                'Backlog', // All template tasks go to backlog
                color,
                dependentTeam,
                newTaskId
            );
            newTasks.push(newTask);
        });

        allTasks = allTasks.concat(newTasks);
        Storage.saveTasks(allTasks); // Use Storage object

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
