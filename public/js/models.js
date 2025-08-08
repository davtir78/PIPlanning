// PI Planner Data Models
// generateUniqueId is now globally available from utils.js

/**
 * Represents a Sprint.
 */
class Sprint {
    /**
     * @param {string} name
     * @param {string} startDate - ISO date string
     * @param {string} endDate - ISO date string
     * @param {number} capacity - Story points
     * @param {string} [id] - Optional ID, will be generated if not provided.
     */
    constructor(name, startDate, endDate, capacity, id = generateUniqueId()) {
        this.id = id;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.capacity = capacity; // Available capacity
        // Tasks will be associated by sprintId on the Task object itself or managed in a central task list.
        // We can add a 'tasks' array here if we decide to store tasks directly within sprint objects.
        // For now, keeping tasks separate and linking via sprintId is often more flexible.
    }
}

/**
 * Represents a Task.
 */
class Task {
    /**
     * @param {string} name
     * @param {number} storyPoints
     * @param {string} epicId - ID of the epic this task belongs to.
     * @param {string} [sprintId] - ID of the sprint this task is assigned to (null or 'Backlog' if unassigned).
     * @param {string} [color] - Color indicator for the task.
     * @param {string} [dependentTeam] - Name of the team this task has a dependency on.
     * @param {string|null} [trafficLightStatus] - Traffic light status: null, 'red', 'amber', or 'green'.
     * @param {string} [id] - Optional ID, will be generated if not provided.
     */
    constructor(name, storyPoints, epicId, sprintId = null, color = '#D3D3D3', dependentTeam = null, trafficLightStatus = null, id = generateUniqueId()) {
        this.id = id;
        this.name = name;
        this.storyPoints = storyPoints;
        this.epicId = epicId;
        this.sprintId = sprintId; // Can be null or a special "Backlog" identifier
        this.color = color;
        this.dependentTeam = dependentTeam; // e.g., "Frontend Team", "Backend Team", null
        this.trafficLightStatus = trafficLightStatus; // Traffic light status: null, 'red', 'amber', 'green'
    }
}

/**
 * Represents an Epic (e.g., Frontend, Backend, a large feature).
 */
class Epic {
    /**
     * @param {string} name
     * @param {string} [id] - Optional ID, will be generated if not provided.
     */
    constructor(name, id = generateUniqueId()) {
        this.id = id;
        this.name = name;
    }
}

/**
 * Represents a PI Objective.
 */
class PIObjective {
    /**
     * @param {string} teamName
     * @param {string} description
     * @param {number} businessValue - Typically a 1-10 scale.
     * @param {string} [id] - Optional ID, will be generated if not provided.
     */
    constructor(teamName, description, businessValue, id = generateUniqueId()) {
        this.id = id;
        this.teamName = teamName;
        this.description = description;
        this.businessValue = businessValue;
    }
}

console.log("PI Planner models.js loaded.");
