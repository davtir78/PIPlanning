// js/ui/helpModal.js

const HelpModal = (() => {
    let modalElement = null;
    let helpContentContainer = null;
    let closeBtn = null;

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

*   **Fields**: Allows users to set/edit Task Name, Story Points, Epic (dropdown), Dependent Team (dropdown), Color (color picker), and **Traffic Light Status** (Red, Amber, Green, None).
*   **Actions**: Includes "Save", "Duplicate Task", and "Delete Task" buttons.

### 7. Feature Template Modal

This modal is used when adding a task from a predefined template:

*   **Functionality**: Fetches and displays user-configured feature templates from storage, allowing quick creation of tasks based on these templates.
`;

    function init() {
        modalElement = document.getElementById('help-modal');
        if (!modalElement) {
            _createModalStructure();
            modalElement = document.getElementById('help-modal');
        }

        helpContentContainer = modalElement.querySelector('#help-modal-content-area');
        closeBtn = modalElement.querySelector('#close-help-modal-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Close on outside click
        window.addEventListener('click', (event) => {
            if (event.target === modalElement) {
                closeModal();
            }
        });

        console.log("HelpModal initialized.");
    }

    function _createModalStructure() {
        const modalDiv = createElement('div', 'modal', { id: 'help-modal', style: 'display: none;' });
        const modalContent = createElement('div', 'modal-content', { style: 'max-width: 800px; height: 80vh;' });

        modalContent.innerHTML = `
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">Help & Documentation</h2>
                <button id="close-help-modal-btn" class="close-btn" style="font-size: 1.5rem; background: none; border: none; cursor: pointer;">&times;</button>
            </div>
            <div id="help-modal-content-area" style="overflow-y: auto; padding-right: 10px; flex: 1;"></div>
        `;

        modalDiv.appendChild(modalContent);
        document.body.appendChild(modalDiv);
    }

    function openModal() {
        if (!modalElement) init();

        // Render content if not already rendered
        if (helpContentContainer && helpContentContainer.innerHTML.trim() === '') {
            if (typeof marked !== 'undefined') {
                console.log("Parsing markdown for Help Modal...");
                const htmlContent = marked.parse(readmeMarkdown);
                helpContentContainer.innerHTML = htmlContent;
                // Force dark text color to ensure visibility against glass background
                helpContentContainer.style.color = '#1a1a1a';
            } else {
                console.error("Marked.js not found!");
                helpContentContainer.innerHTML = '<p style="color: red;">Error: Markdown parser not loaded.</p>';
            }
        }

        modalElement.style.display = 'flex';
    }

    function closeModal() {
        if (modalElement) {
            modalElement.style.display = 'none';
        }
    }

    return {
        init,
        openModal
    };
})();
