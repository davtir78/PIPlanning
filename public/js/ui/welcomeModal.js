// PI Planner Welcome Modal UI Logic

const WelcomeModal = (() => {
    let welcomeModalElement = null;
    let currentStep = 0; // Track the current step of the wizard
    let modalContainer = null; // Reference to the modal-container div

    // Define the steps of the wizard
    const steps = [
        {
            name: 'welcome',
            render: _renderWelcomeStep,
            showNextButton: false, // Button rendered directly in step content
            showBackButton: false
        },
        {
            name: 'choice',
            render: _renderChoiceStep,
            showNextButton: false, // Do not show Next button for choice
            showBackButton: true
        },
        {
            name: 'quickSetup',
            render: _renderQuickSetupStep,
            showNextButton: false, // Handled by form submit
            showBackButton: true
        },
        {
            name: 'importData',
            render: _renderImportStep,
            showNextButton: false, // Handled by button click
            showBackButton: true
        }
    ];

    /**
     * Initializes the Welcome Modal module.
     * Checks for existing data and displays the modal if none is found.
     * @private
     */
    function _init() {
        welcomeModalElement = document.getElementById('welcome-modal');
        if (!welcomeModalElement) {
            console.error("Welcome modal element not found in DOM for WelcomeModal.init().");
            return;
        }

        // Create the main modal container once
        modalContainer = createElement('div', 'modal-container');
        welcomeModalElement.appendChild(modalContainer);

        // Check if essential data exists (e.g., sprints from Storage)
        const sprints = Storage.getSprints();
        if (!sprints || sprints.length === 0) {
            console.log("No existing sprint data found. Displaying welcome modal.");
            display(); // Call the public display function
        } else {
            console.log("Existing data found. Welcome modal will not be displayed automatically.");
            welcomeModalElement.style.display = 'none'; // Ensure it's hidden if data exists
        }
        console.log("WelcomeModal initialized.");
    }

    /**
     * Closes the welcome modal and dispatches an event.
     * @private
     */
    function _close() {
        console.log("Attempting to close welcome modal.");
        if (welcomeModalElement) {
            welcomeModalElement.style.display = 'none';
            // No need to clear innerHTML here, _showStep will handle content
            console.log("Welcome modal hidden.");
        } else {
            console.warn("welcomeModalElement is null or undefined when _close() was called.");
        }
        document.dispatchEvent(new CustomEvent('appDataInitialized'));
    }

    /**
     * Renders the content for a specific wizard step.
     * @param {number} stepIndex - The index of the step to render.
     * @private
     */
    function _showStep(stepIndex) {
        if (!modalContainer) {
            console.error("Modal container not found. Cannot show step.");
            return;
        }

        currentStep = stepIndex;
        const step = steps[currentStep];

        if (!step) {
            console.error(`Step with index ${stepIndex} not found.`);
            return;
        }

        modalContainer.innerHTML = ''; // Clear previous content

        const contentDiv = createElement('div', 'modal-step-content');
        contentDiv.innerHTML = step.render(); // Render content for the current step
        modalContainer.appendChild(contentDiv);

        // Add navigation buttons
        const modalFooter = createElement('div', 'modal-footer');

        if (step.showBackButton) {
            const backButton = createElement('button', 'btn btn-secondary', null, 'Back');
            backButton.id = 'welcome-modal-back-btn';
            backButton.addEventListener('click', _goBack);
            modalFooter.appendChild(backButton);
        }

        // Show next button based on step configuration
        if (step.showNextButton) {
            const nextButton = createElement('button', 'btn btn-primary', null, step.nextButtonText);
            nextButton.id = 'welcome-modal-next-btn';
            nextButton.addEventListener('click', _goNext);
            modalFooter.appendChild(nextButton);
        }

        modalContainer.appendChild(modalFooter);

        // Re-attach event listeners for the current step's content
        _attachStepListeners(step.name);

        welcomeModalElement.style.display = 'flex'; // Ensure modal is visible
    }

    /**
     * Navigates to the next step in the wizard.
     * @private
     */
    function _goNext() {
        if (currentStep < steps.length - 1) {
            _showStep(currentStep + 1);
        }
    }

    /**
     * Navigates to the previous step in the wizard.
     * @private
     */
    function _goBack() {
        if (currentStep > 0) {
            // Special handling for going back from quickSetup or importData
            // Always go back to the choice step (index 1)
            if (steps[currentStep].name === 'quickSetup' || steps[currentStep].name === 'importData') {
                _showStep(1); // Go back to the choice step
            } else {
                _showStep(currentStep - 1);
            }
        }
    }

    /**
     * Attaches event listeners specific to the current step's content.
     * @param {string} stepName - The name of the current step.
     * @private
     */
    function _attachStepListeners(stepName) {
        if (!modalContainer) return;

        switch (stepName) {
            case 'welcome':
                const welcomeNextBtn = modalContainer.querySelector('#welcome-next-btn');
                if (welcomeNextBtn) {
                    welcomeNextBtn.addEventListener('click', _goNext);
                }
                break;
            case 'choice':
                const quickSetupChoiceBtn = modalContainer.querySelector('#quick-setup-choice-btn');
                if (quickSetupChoiceBtn) {
                    quickSetupChoiceBtn.addEventListener('click', () => _showStep(steps.findIndex(s => s.name === 'quickSetup')));
                }
                const importDataChoiceBtn = modalContainer.querySelector('#import-data-choice-btn');
                if (importDataChoiceBtn) {
                    importDataChoiceBtn.addEventListener('click', () => _showStep(steps.findIndex(s => s.name === 'importData')));
                }
                break;
            case 'quickSetup':
                const quickSetupForm = modalContainer.querySelector('#quick-setup-form');
                if (quickSetupForm) {
                    quickSetupForm.addEventListener('submit', _handleQuickSetup);
                }
                // Adjust initial date value
                const piStartDateInput = modalContainer.querySelector('#piStartDate');
                if (piStartDateInput) {
                    piStartDateInput.value = new Date().toISOString().split('T')[0];
                }
                break;
            case 'importData':
                const importJiraDataWelcomeBtn = modalContainer.querySelector('#import-jira-data-welcome-btn');
                if (importJiraDataWelcomeBtn) {
                    importJiraDataWelcomeBtn.addEventListener('click', _handleImportData);
                }
                break;
        }
    }

    /**
     * Handles the quick setup form submission.
     * @param {Event} event - The form submission event.
     * @private
     */
    function _handleQuickSetup(event) {
        event.preventDefault();
        const form = event.target;
        const piStartDate = form.elements['piStartDate'].value;
        const sprintLength = parseInt(form.elements['sprintLength'].value, 10);
        const teamCapacity = parseInt(form.elements['teamCapacity'].value, 10);

        if (!piStartDate) {
            alert("Please select a PI Start Date.");
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        if (piStartDate < today) {
            alert("PI Start Date cannot be in the past.");
            return;
        }
        if (isNaN(sprintLength) || sprintLength <= 0) {
            alert("Sprint Length must be a positive number.");
            return;
        }
        if (isNaN(teamCapacity) || teamCapacity <= 0) {
            alert("Team Capacity must be a positive number.");
            return;
        }

        // Assuming InitialSetup.performQuickSetup is available (from js/data/initialSetup.js)
        performQuickSetup(new Date(piStartDate), sprintLength, teamCapacity, 6); // Pass 6 for numberOfSprints
        alert("Quick setup complete! Your PI Planner is ready.");
        _close();
    }

    /**
     * Handles the import data button click.
     * @private
     */
    function _handleImportData() {
        // Create a hidden file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx, .xls';
        fileInput.style.display = 'none'; // Hide it

        // Append to body to make it part of the DOM
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            // Call the importJIRA function from ImportExport module with callbacks
            window.PIPlanner.ImportExport.importJIRA(file, () => {
                // Success callback: close modal and re-render app
                _close();
                // Trigger a re-render of main app components
                if (typeof SprintBoardView !== 'undefined') SprintBoardView.render();
                if (typeof RoadmapView !== 'undefined') RoadmapView.renderRoadmapGrid();
                if (typeof Header !== 'undefined') Header.updateHeaderCapacities();
            }, (errorMessage) => {
                // Error callback: show alert
                alert(errorMessage);
            });
            // Clean up the dynamically created input
            document.body.removeChild(fileInput);
        });

        // Programmatically click the hidden file input to open the file dialog
        fileInput.click();
    }

    /**
     * Renders the initial welcome message step.
     * @returns {string} HTML string for the welcome step.
     * @private
     */
    function _renderWelcomeStep() {
        return `
            <h1>Welcome to PI Planner</h1>
            <p class="subtitle">PI Planner is a simple, client-side web application designed to help agile teams with Program Increment (PI) planning. It provides a visual way to organize tasks, manage sprints, track epics, and visualize your roadmap.</p>
            <p class="subtitle"><strong>How it works:</strong> All your data is stored directly in your browser's local storage, meaning it's private to you and never leaves your device. You can easily import/export your data for backup or sharing.</p>
            <p class="subtitle">Get started by setting up your Program Increment.</p>
            <div class="welcome-next-button-container">
                <button type="button" id="welcome-next-btn" class="btn btn-primary">Continue</button>
            </div>
        `;
    }

    /**
     * Renders the choice step (Quick Setup vs. Import Data).
     * @returns {string} HTML string for the choice step.
     * @private
     */
    function _renderChoiceStep() {
        return `
            <h2>Getting Started</h2>
            <p class="subtitle">Choose how you'd like to set up your PI Planner:</p>
            <div class="option-section">
                <button type="button" id="quick-setup-choice-btn" class="btn btn-primary">Quick Setup</button>
                <p>Generate initial sprints and capacity.</p>
            </div>
            <hr class="section-divider">
            <div class="option-section">
                <button type="button" id="import-data-choice-btn" class="btn btn-secondary">Import Existing Data</button>
                <p>Import data from a JIRA-compatible XLSX file.</p>
            </div>
        `;
    }

    /**
     * Renders the quick setup form step.
     * @returns {string} HTML string for the quick setup step.
     * @private
     */
    function _renderQuickSetupStep() {
        const defaultCapacity = DEFAULT_SPRINT_CAPACITY || 40;
        return `
            <h2>Quick Setup</h2>
            <form id="quick-setup-form">
                <div class="form-group">
                    <label for="piStartDate">PI Start Date:</label>
                    <input type="date" id="piStartDate" name="piStartDate" required>
                </div>
                <div class="form-group">
                    <label for="sprintLength">Sprint Length (weeks):</label>
                    <select id="sprintLength" name="sprintLength">
                        <option value="1">1 week</option>
                        <option value="2" selected>2 weeks</option>
                        <option value="3">3 weeks</option>
                        <option value="4">4 weeks</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="teamCapacity">Team Capacity per Sprint (story points):</label>
                    <input type="number" id="teamCapacity" name="teamCapacity" value="${defaultCapacity}" min="1" required>
                </div>
                <button type="submit" class="btn btn-primary">Generate 6 Sprints</button>
            </form>
        `;
    }

    /**
     * Renders the import data step.
     * @returns {string} HTML string for the import data step.
     * @private
     */
    function _renderImportStep() {
        return `
            <h2>Import Data</h2>
            <p class="subtitle">Import your existing PI Planner data from a JIRA-compatible XLSX file.</p>
            <button type="button" id="import-jira-data-welcome-btn" class="btn btn-primary">Import JIRA Data (XLSX)</button>
            <a href="pi_planner_sample_data.xlsx" class="download-link" download="pi_planner_sample_data.xlsx">Download Sample Data (XLSX)</a>
        `;
    }

    /**
     * Displays the welcome modal with setup options.
     */
    function display() {
        if (!welcomeModalElement) {
            _init(); // Attempt to initialize if not already
            if (!welcomeModalElement) return; // Still not found, exit
        }
        _showStep(0); // Start with the first step
    }

    // Public API
    return {
        init: _init, // Expose init for main.js to call
        display
    };
})();

console.log("PI Planner welcomeModal.js loaded and refactored.");
