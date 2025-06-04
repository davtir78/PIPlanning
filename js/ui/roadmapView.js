// PI Planner Roadmap View UI Logic

const RoadmapView = (() => {
    let roadmapViewElement = null;

    /**
     * Initializes the Roadmap View.
     */
    function init() {
        roadmapViewElement = document.getElementById('roadmap-view');
        if (!roadmapViewElement) {
            console.error("Roadmap view element not found in DOM for RoadmapView.init().");
            return;
        }
        console.log("RoadmapView initialized.");
    }

    /**
     * Renders the Roadmap Grid.
     * This function will be responsible for drawing the matrix of epics and sprints.
     */
    function renderRoadmapGrid() {
        if (!roadmapViewElement) {
            console.error("Roadmap view element not found for renderRoadmapGrid.");
            return;
        }
        roadmapViewElement.innerHTML = ''; // Clear previous content

        const sprints = Storage.getSprints();
        const tasks = Storage.getTasks();
        const epics = Storage.getEpics(); // Will use epics for rows

        // Placeholder for actual rendering logic
        let content = '<p>Roadmap View - Under Construction</p>';

        if (epics.length === 0) {
            content += '<p>No epics defined. Please add epics in Settings.</p>';
        }
        if (sprints.length === 0) {
            content += '<p>No sprints defined. Please add sprints or perform setup.</p>';
        }

        roadmapViewElement.innerHTML = content;
        console.log("Roadmap View rendered.");
    }

    /**
     * Shows the Roadmap View.
     */
    function show() {
        if (!roadmapViewElement) init();
        if (roadmapViewElement) {
            roadmapViewElement.style.display = 'block';
            renderRoadmapGrid(); // Render content when shown
        }
        // Hide other views
        if (typeof SprintBoardView !== 'undefined') SprintBoardView.hide();
        const piObjectivesViewEl = document.getElementById('pi-objectives-view');
        if (piObjectivesViewEl) piObjectivesViewEl.style.display = 'none';
    }

    /**
     * Hides the Roadmap View.
     */
    function hide() {
        if (roadmapViewElement) {
            roadmapViewElement.style.display = 'none';
        }
    }

    // Public API
    return {
        init,
        renderRoadmapGrid,
        show,
        hide
    };
})();

console.log("PI Planner roadmapView.js loaded.");
