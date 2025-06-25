// PI Planner Main JavaScript File
console.log("PI Planner main.js loaded.");

/**
 * Initializes all core UI modules of the application.
 * This function should be called once the DOM is ready.
 * @private
 */
function _initializeModules() {
    // Initialize data storage (if it had an init method)
    // Storage.init(); 

    // Initialize configurations (if it had an init method)
    // Config.init();

    // Initialize utilities (if it had an init method)
    // Utils.init();
    
    // Initialize UI Modules
    Header.init();
    WelcomeModal.init();
    SprintBoardView.init();
    GanttView.init(); // Reverted to GanttView.init()
    TaskPropertyPanel.init();
    FeatureTemplateModal.init(); // Initialize the new modal
    SettingsView.init(); // Initialize the new settings view
    AddSprintModal.init(); // Initialize the new Add Sprint Modal
    // PIObjectivesView.init(); // When available

    console.log("All core modules initialized.");
}

/**
 * Determines and displays the initial view of the application.
 * This could be based on saved settings or a default view.
 * @private
 */
function _showInitialView() {
    // For now, default to Sprint Board View.
    // Later, this could check localStorage for a saved preference.
    // const lastView = Storage.getSetting('currentView') || 'sprint-board-view';
    // Header._switchView(lastView); // _switchView is private, so Header needs a public way or main calls show directly
    
    // The Header module's switchView now handles showing/hiding and button management.
    // We need to trigger the display of the default view.
    const initialViewId = document.querySelector('.header-nav button.active')?.dataset.view || 'sprint-board-view';
    Header.switchView(initialViewId);
    console.log("Initial view determined and shown.");
}


/**
 * Main application initialization function.
 * Orchestrates the setup of the PI Planner.
 */
function initializeApp() {
    console.log("Initializing PI Planner Application...");

    // Ad Banner Toggle
    const adBanner = document.getElementById('collapsible-ad-banner');
    const toggleButton = document.getElementById('toggle-ad-banner');

    if (adBanner && toggleButton) {
        toggleButton.addEventListener('click', () => {
            adBanner.classList.toggle('collapsed');
            if (adBanner.classList.contains('collapsed')) {
                toggleButton.textContent = 'Show Ad';
            } else {
                toggleButton.textContent = 'Hide Ad';
            }
        });
    }

    // Initialize Ezoic ad placements
    ezstandalone.cmd.push(function () {
        ezstandalone.showAds(103); // Assuming 103 is the ID for the top_of_page ad
    });

    _initializeModules();

    // Check if essential data exists (e.g., sprints from Storage)
    // The WelcomeModal will handle its own display logic based on data presence.
    // Always proceed to show the initial view, as WelcomeModal will overlay if needed.
    console.log("Proceeding to show initial view.");
    _showInitialView();
}

// Listen for the custom event dispatched when welcome modal is closed after setup/import
document.addEventListener('appDataInitialized', () => {
    console.log("Event 'appDataInitialized' received. Showing initial application view.");
    // Data should have been saved to localStorage by the welcome modal's setup process.
    // UI modules will fetch fresh data from Storage when they render.
    _showInitialView();
});

// DOMContentLoaded event listener to ensure the DOM is fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
