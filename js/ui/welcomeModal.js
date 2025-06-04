// PI Planner Welcome Modal UI Logic

const WelcomeModal = (() => {
    let welcomeModalElement = null;

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
        if (welcomeModalElement) {
            welcomeModalElement.style.display = 'none';
            welcomeModalElement.innerHTML = ''; // Clear content after closing
        }
        document.dispatchEvent(new CustomEvent('appDataInitialized'));
    }

    /**
     * Handles the quick setup form submission.
     * @param {Event} event - The form submission event.
     * @private
     */
    function _handleQuickSetup(event) {
        event.preventDefault();
        const form = event.target;
        const piStartDate = form.elements['pi-start-date'].value;
        const sprintLength = parseInt(form.elements['sprint-length'].value, 10);
        const teamCapacity = parseInt(form.elements['team-capacity'].value, 10);

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
     * Displays the welcome modal with setup options.
     */
    function display() {
        if (!welcomeModalElement) {
            _init(); // Attempt to initialize if not already
            if (!welcomeModalElement) return; // Still not found, exit
        }

        welcomeModalElement.innerHTML = ''; // Clear previous content

        const modalContainer = createElement('div', 'modal-container'); // Use new container class
        // Use Config.DEFAULT_SPRINT_CAPACITY
        const defaultCapacity = DEFAULT_SPRINT_CAPACITY || 40; // Corrected
        modalContainer.innerHTML = `
            <h1>Welcome to PI Planner</h1>
            <p class="subtitle">Get started by setting up your Program Increment.</p>

            <div class="option-section">
                <h2>Option 1: Quick Setup</h2>
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
            </div>

            <hr class="section-divider">

            <div class="option-section">
                <h2>Option 2: Import Data</h2>
                <button type="button" id="import-xlsx-welcome-btn" class="btn btn-secondary">Import XLSX</button>
                <a href="pi_planner_sample_data.xlsx" class="download-link" download="pi_planner_sample_data.xlsx">Download Sample Data (XLSX)</a>
            </div>
        `;

        welcomeModalElement.appendChild(modalContainer); // Append the new container
        welcomeModalElement.style.display = 'flex'; // Keep flex for centering

        const quickSetupForm = modalContainer.querySelector('#quick-setup-form');
        if (quickSetupForm) {
            quickSetupForm.addEventListener('submit', _handleQuickSetup);
        }

        const importXlsxBtnWelcome = modalContainer.querySelector('#import-xlsx-welcome-btn');
        if (importXlsxBtnWelcome) {
            importXlsxBtnWelcome.addEventListener('click', () => {
                // Create a hidden file input element
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.xlsx, .xls';
                fileInput.style.display = 'none'; // Hide it

                // Append to body to make it part of the DOM
                document.body.appendChild(fileInput);

                fileInput.addEventListener('change', (event) => {
                    const file = event.target.files[0];
                    ImportExport.importXLSX(file, () => {
                        // On complete callback: close modal and re-render app
                        _close();
                        // Trigger a re-render of main app components
                        if (typeof SprintBoardView !== 'undefined') SprintBoardView.render();
                        if (typeof RoadmapView !== 'undefined') RoadmapView.renderRoadmapGrid();
                        if (typeof Header !== 'undefined') Header.updateHeaderCapacities();
                    }, (errorMessage) => {
                        alert(errorMessage);
                    });
                    // Clean up the dynamically created input
                    document.body.removeChild(fileInput);
                });

                // Programmatically click the hidden file input to open the file dialog
                fileInput.click();
            });
        }
        
        // Adjust initial date value for the new ID
        const piStartDateInput = modalContainer.querySelector('#piStartDate');
        if (piStartDateInput) {
            piStartDateInput.value = new Date().toISOString().split('T')[0];
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
        // Use new IDs for form elements
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

    // Call _init internally or ensure it's called by main.js
    // For direct usage like `WelcomeModal.display()`, _init should be robust.
    // _init(); // Or call from main.js

    // Public API
    return {
        init: _init, // Expose init for main.js to call
        display
    };
})();

console.log("PI Planner welcomeModal.js loaded and refactored.");
