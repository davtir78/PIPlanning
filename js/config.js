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
const TASK_COLORS = {
    themeColors: [
        // Grays
        ['#FFFFFF', '#F2F2F2', '#E0E0E0', '#C0C0C0', '#A0A0A0', '#808080', '#606060', '#404040', '#202020', '#000000'],
        // Blues
        ['#E0F2F7', '#B3E0ED', '#80CCE6', '#4DB8DB', '#1AA3CC', '#008CB3', '#006B8A', '#004A61', '#002938', '#00080F'],
        // Oranges
        ['#FFF0E0', '#FFE0B3', '#FFC280', '#FFA34D', '#FF851A', '#CC6B00', '#995000', '#663400', '#331A00', '#1A0D00'],
        // Greens
        ['#E0FFE0', '#B3FFB3', '#80FF80', '#4DFF4D', '#1AFF1A', '#00CC00', '#009900', '#006600', '#003300', '#001A00'],
        // Pinks/Purples
        ['#FFE0F0', '#FFB3E0', '#FF80C2', '#FF4DA3', '#FF1A85', '#CC006B', '#990050', '#660034', '#33001A', '#1A000D'],
    ],
    standardColors: [
        '#FF0000', // Red
        '#FFA500', // Orange
        '#FFFF00', // Yellow
        '#008000', // Green
        '#0000FF', // Blue
        '#4B0082', // Indigo
        '#EE82EE', // Violet
        '#800000', // Maroon
        '#808000', // Olive
        '#008080'  // Teal
    ]
};

// Simple array of color values for input type="color" default or basic pickers
// This will now be generated dynamically or used for specific cases if needed.
// For the new picker, we'll directly use the structured TASK_COLORS.
const PREDEFINED_TASK_COLOR_VALUES = [].concat(...TASK_COLORS.themeColors, TASK_COLORS.standardColors);


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
