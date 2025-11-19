# Technical Context

This application is a client-side PI Planner built with vanilla JavaScript, HTML, and CSS. It utilizes the following key technologies and patterns:

## Core Technologies
- **HTML5:** For structuring the application's user interface.
- **CSS3:** For styling the application, including responsive design and custom components.
- **JavaScript (ES6+):** The primary language for application logic, DOM manipulation, and interactivity.

## Key Libraries and Frameworks
- **jsPDF:** Used for generating PDF reports (both landscape and portrait orientations).
- **pdf.js:** Integrated for rendering PDF pages to canvas elements, enabling a high-fidelity print preview within the browser.
- **SortableJS:** Implemented for drag-and-drop functionality in task lists, allowing users to reorder tasks and sprints.
- **Marked.js:** Used for rendering Markdown content, potentially for descriptions or notes.
- **DHTMLX Gantt:** Integrated for the Roadmap view, providing advanced Gantt chart features.
- **SheetJS (xlsx):** Used for importing and exporting data in XLSX format.

## Application Architecture and Patterns
- **IIFE (Immediately Invoked Function Expression):** Used to create module scopes for different UI components (e.g., `ReportingView`, `SprintBoardView`, `Header`), preventing global scope pollution and organizing code.
- **Modular Design:** Components are structured as independent modules with public APIs (e.g., `init`, `show`, `hide`), promoting reusability and maintainability.
- **DOM Manipulation:** Extensive use of `document.createElement` and direct DOM manipulation for dynamic UI updates.
- **Event Listeners:** Used for user interactions like button clicks and dropdown changes.
- **localStorage:** Employed for client-side data persistence, ensuring the application works offline and data is saved between sessions.

## Reporting Feature Implementation
- **PDF Preview:** Leverages `pdf.js` to render PDF pages onto HTML canvas elements, providing an accurate preview of the generated reports.
- **jsPDF for Generation:** `jsPDF` is used for the actual PDF generation and download.
- **Dynamic Layouts:** The `_createPdfDocument` function dynamically adjusts layout based on report type (landscape/portrait) and the number of sprints, aiming for a visual representation of the sprint board or a structured list of sprints and backlog items.
- **CSS for Preview:** Specific CSS rules are applied to simulate PDF pages (`.preview-page`, `.preview-orientation`), ensuring a visual representation of page dimensions and orientation.

## Development Environment
- **IDE:** VSCode
- **Operating System:** Windows 11
- **Default Shell:** cmd.exe (though commands are often compatible with Git Bash)

## Key Learnings and Decisions
- **Client-Side Focus:** The application is designed to be entirely client-side, relying on `localStorage` for data persistence and avoiding backend dependencies.
- **jsPDF Initialization:** Correct initialization of `jsPDF` was crucial for its functionality.
- **Preview Fidelity:** The use of `pdf.js` for preview aims to achieve high fidelity with the final PDF output.
- **Code Quality:** Adherence to modular design principles and clear commenting is maintained.

## Current Development Focus
- **Enhanced PDF Rendering:** Actively refining the `_createPdfDocument` function to improve the visual representation of reports, particularly the landscape view. This involves:
    - Drawing distinct rectangles for task cards with background colors.
    - Implementing text wrapping for task details within card boundaries.
    - Adjusting vertical and horizontal spacing for optimal layout.
    - Ensuring graceful handling of page breaks and column overflows.
    - Applying similar card-like rendering to the portrait report.

This technical context provides an overview of the application's structure, technologies, and recent development efforts, particularly concerning the reporting feature.
