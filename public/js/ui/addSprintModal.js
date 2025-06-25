// js/ui/addSprintModal.js

const AddSprintModal = (() => {
    let modalElement = null;
    let addSprintForm = null;
    let newSprintNameInput = null;
    let newSprintStartDateInput = null;
    let newSprintEndDateInput = null;
    let newSprintCapacityInput = null;
    let cancelAddSprintBtn = null;

    /**
     * Initializes the Add Sprint Modal.
     */
    function init() {
        modalElement = document.getElementById('add-sprint-modal');
        addSprintForm = document.getElementById('add-sprint-form');
        newSprintNameInput = document.getElementById('new-sprint-name');
        newSprintStartDateInput = document.getElementById('new-sprint-start-date');
        newSprintEndDateInput = document.getElementById('new-sprint-end-date');
        newSprintCapacityInput = document.getElementById('new-sprint-capacity');
        cancelAddSprintBtn = document.getElementById('cancel-add-sprint-btn');

        if (!modalElement || !addSprintForm || !newSprintNameInput || !newSprintStartDateInput || !newSprintEndDateInput || !newSprintCapacityInput || !cancelAddSprintBtn) {
            console.error("One or more Add Sprint Modal elements not found in DOM.");
            return;
        }

        addSprintForm.addEventListener('submit', handleAddSprintSubmit);
        cancelAddSprintBtn.addEventListener('click', closeModal);

        console.log("AddSprintModal initialized.");
    }

    /**
     * Opens the Add Sprint Modal.
     */
    function openModal() {
        if (!modalElement) {
            console.error("Add Sprint Modal element not found. Cannot open modal.");
            return;
        }
        // Reset form fields
        newSprintNameInput.value = '';
        newSprintStartDateInput.value = '';
        newSprintEndDateInput.value = '';
        newSprintCapacityInput.value = DEFAULT_SPRINT_CAPACITY || 40; // Set default capacity

        modalElement.style.display = 'flex';
        newSprintNameInput.focus();
    }

    /**
     * Closes the Add Sprint Modal.
     */
    function closeModal() {
        if (modalElement) {
            modalElement.style.display = 'none';
        }
    }

    /**
     * Handles the submission of the Add Sprint form.
     * @param {Event} event - The submit event.
     */
    function handleAddSprintSubmit(event) {
        event.preventDefault(); // Prevent default form submission

        const name = newSprintNameInput.value.trim();
        const startDateStr = newSprintStartDateInput.value;
        const endDateStr = newSprintEndDateInput.value;
        const capacity = parseInt(newSprintCapacityInput.value, 10);

        if (!name) {
            alert("Sprint name is required.");
            return;
        }
        if (!startDateStr || !endDateStr) {
            alert("Both start and end dates are required.");
            return;
        }
        if (new Date(endDateStr) <= new Date(startDateStr)) {
            alert("End date must be after start date.");
            return;
        }
        if (isNaN(capacity) || capacity < 0) {
            alert("Capacity must be a non-negative number.");
            return;
        }

        const newSprint = new Sprint(name, startDateStr, endDateStr, capacity);
        let currentSprints = Storage.getSprints();
        currentSprints.push(newSprint);
        Storage.saveSprints(currentSprints);

        closeModal();
        // Trigger re-render of the sprint board
        if (typeof SprintBoardView !== 'undefined') {
            SprintBoardView.render();
        }
        console.log("New sprint added via modal:", newSprint);
    }

    // Public API
    return {
        init,
        openModal,
        closeModal
    };
})();

// Initialize the modal when the DOM is ready
document.addEventListener('DOMContentLoaded', AddSprintModal.init);
