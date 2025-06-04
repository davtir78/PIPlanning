// PI Planner Configuration File

// Constants will be globally accessible due to script loading order.
const LOCAL_STORAGE_KEY_SPRINTS = 'piPlannerSprints';
const LOCAL_STORAGE_KEY_TASKS = 'piPlannerTasks';
const LOCAL_STORAGE_KEY_EPICS = 'piPlannerEpics'; // Renamed from LOCAL_STORAGE_KEY_COMPONENTS
const LOCAL_STORAGE_KEY_DEPENDENT_TEAMS = 'piPlannerDependentTeams'; // Added key for dependent teams
const LOCAL_STORAGE_KEY_OBJECTIVES = 'piPlannerObjectives';
const LOCAL_STORAGE_KEY_SETTINGS = 'piPlannerSettings'; // For things like last view, etc.
const LOCAL_STORAGE_KEY_FEATURE_TEMPLATES = 'piPlannerFeatureTemplates'; // New key for configurable feature templates

const DEFAULT_SPRINT_CAPACITY = 40; // Story points
const DEFAULT_SPRINT_LENGTH_WEEKS = 2; // Weeks

const DEFAULT_EPICS = [ // Renamed from DEFAULT_COMPONENTS
    "Frontend",
    "Backend",
    "Database",
    "Testing",
    "Design"
];

// Color palette for task cards (as per design or a sensible default)
const TASK_COLORS = [
    // Row 1: Pastels & Light
    { name: 'Light Blue', value: '#AEC6CF' },
    { name: 'Mint Green', value: '#B9E7AF' },
    { name: 'Pale Yellow', value: '#FFFFA7' },
    { name: 'Peach', value: '#FFDAB9' },
    { name: 'Lavender', value: '#CFB9E7' },
    { name: 'Light Pink', value: '#FFB6C1' },
    { name: 'Light Gray', value: '#D3D3D3' },
    // Row 2: Medium Tones
    { name: 'Sky Blue', value: '#87CEEB' },
    { name: 'Seafoam Green', value: '#98FB98' },
    { name: 'Khaki', value: '#F0E68C' },
    { name: 'Salmon', value: '#FA8072' },
    { name: 'Orchid', value: '#DA70D6' },
    { name: 'Coral', value: '#FF7F50' },
    { name: 'Silver', value: '#C0C0C0' },
    // Row 3: Bolder/Darker (but still somewhat muted for UI)
    { name: 'Steel Blue', value: '#4682B4' },
    { name: 'Forest Green', value: '#228B22' },
    { name: 'Gold', value: '#FFD700' },
    { name: 'Tomato', value: '#FF6347' },
    { name: 'Medium Purple', value: '#9370DB' },
    { name: 'Hot Pink', value: '#FF69B4' }, // A bit brighter
    { name: 'Slate Gray', value: '#708090' }
    // Total: 21 colors
];

// Simple array of color values for input type="color" default or basic pickers
const PREDEFINED_TASK_COLOR_VALUES = TASK_COLORS.map(c => c.value);

// Dependent teams for the dropdown in task property panel
const PREDEFINED_DEPENDENT_TEAMS = [
    "Frontend Team",
    "Backend Team",
    "QA Team",
    "DevOps Team",
    "Design Team",
    "Product Team",
    "External Team A",
    "External Team B"
];

// Standard task suffixes for feature templates
const FEATURE_TASK_TEMPLATES = [
    "Requirements",
    "Design",
    "Build and Unit Test",
    "Deploy to DEV",
    "Deploy to TEST",
    "Testing",
    "Deploy to PROD"
];

// Default story points for tasks generated from feature template
const DEFAULT_FEATURE_TASK_POINTS = 3;


// Add more configuration constants as needed
console.log("PI Planner config.js loaded.");
