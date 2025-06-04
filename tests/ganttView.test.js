// Unit tests for GanttView module

// Mocking document.getElementById and console for testing purposes
document.getElementById = jest.fn((id) => {
    if (id === 'gantt-view') {
        return {
            style: { display: '' },
            innerHTML: ''
        };
    }
    return null;
});

console.error = jest.fn();
console.log = jest.fn();
console.warn = jest.fn();

// Mock FrappeGantt constructor
const mockFrappeGanttInstance = {
    change_view_mode: jest.fn(),
    // Add other methods if they are called and need to be mocked
};
global.FrappeGantt = jest.fn(() => mockFrappeGanttInstance);


describe('GanttView', () => {
    let ganttViewModule;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Re-require the module to get a fresh instance for each test
        // This assumes GanttView is structured as an IIFE that returns its public API
        // If it's a global, you might need to reset its internal state differently
        ganttViewModule = require('../js/ui/ganttView'); // Adjust path as necessary
    });

    test('init should find the gantt-view container', () => {
        ganttViewModule.init();
        expect(document.getElementById).toHaveBeenCalledWith('gantt-view');
        expect(console.log).toHaveBeenCalledWith("GanttView initialized.");
    });

    test('init should log an error if gantt-view container is not found', () => {
        document.getElementById.mockReturnValueOnce(null); // Simulate container not found
        ganttViewModule.init();
        expect(console.error).toHaveBeenCalledWith("Gantt view container not found!");
    });

    test('show should display the gantt-view container and render chart', () => {
        ganttViewModule.init(); // Initialize first
        ganttViewModule.show();
        const ganttContainer = document.getElementById('gantt-view');
        expect(ganttContainer.style.display).toBe('block');
        expect(console.log).toHaveBeenCalledWith("GanttView shown.");
        expect(global.FrappeGantt).toHaveBeenCalled(); // Expect FrappeGantt to be called
        expect(mockFrappeGanttInstance.change_view_mode).toHaveBeenCalledWith('Month');
    });

    test('hide should hide the gantt-view container', () => {
        ganttViewModule.init(); // Initialize first
        ganttViewModule.hide();
        const ganttContainer = document.getElementById('gantt-view');
        expect(ganttContainer.style.display).toBe('none');
        expect(console.log).toHaveBeenCalledWith("GanttView hidden.");
    });

    test('_renderGanttChart should warn if FrappeGantt is not defined', () => {
        const originalFrappeGantt = global.FrappeGantt;
        global.FrappeGantt = undefined; // Simulate FrappeGantt not loaded

        ganttViewModule.init(); // Initialize to get container reference
        ganttViewModule.show(); // This will call _renderGanttChart internally

        expect(console.warn).toHaveBeenCalledWith("FrappeGantt library not loaded or ganttContainer not available.");
        const ganttContainer = document.getElementById('gantt-view');
        expect(ganttContainer.innerHTML).toContain('Gantt chart library not loaded.');

        global.FrappeGantt = originalFrappeGantt; // Restore
    });

    // Add more tests for data transformation, event handling, etc. as the module grows
});
