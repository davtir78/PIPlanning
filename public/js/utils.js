// PI Planner Utility Functions

/**
 * Generates a simple unique ID.
 * For more robust scenarios, a library like UUID might be used,
 * but for a frontend-only app, this might suffice.
 * @returns {string} A unique string.
 */
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Creates a DOM element with specified tag, classes, and attributes.
 * @param {string} tag - The HTML tag for the element.
 * @param {string[]|string} [classes] - A string or array of strings for class names.
 * @param {Object} [attributes] - An object with key-value pairs for attributes.
 * @param {string} [textContent] - Text content for the element.
 * @returns {HTMLElement} The created DOM element.
 */
function createElement(tag, classes, attributes, textContent) {
    const element = document.createElement(tag);

    if (classes) {
        if (Array.isArray(classes)) {
            element.classList.add(...classes.filter(Boolean)); // Filter out empty strings if any
        } else if (typeof classes === 'string' && classes.trim() !== '') {
            // Split the string by spaces and add each class individually
            element.classList.add(...classes.trim().split(/\s+/).filter(Boolean));
        }
    }

    if (attributes) {
        for (const key in attributes) {
            if (Object.hasOwnProperty.call(attributes, key)) {
                element.setAttribute(key, attributes[key]);
            }
        }
    }

    if (textContent) {
        element.textContent = textContent;
    }

    return element;
}

// Add more utility functions as needed (e.g., date formatting, etc.)

/**
 * Formats a date string (YYYY-MM-DD) for display.
 * For now, it just returns the string, but can be expanded.
 * @param {string} dateString - The date string in YYYY-MM-DD format.
 * @returns {string} The formatted date string.
 */
function formatDate(dateString) {
    if (!dateString) return '';
    // Assuming dateString is already in 'YYYY-MM-DD' format from date pickers or storage
    // If it were a Date object:
    // const date = new Date(dateString);
    // const options = { year: 'numeric', month: 'short', day: 'numeric' };
    // return date.toLocaleDateString(undefined, options);
    return dateString; // Keep as YYYY-MM-DD for now
}

/**
 * Determines if a hex color is dark.
 * Used to decide if text on a colored background should be light or dark.
 * @param {string} hexColor - The color in hex format (e.g., "#RRGGBB").
 * @returns {boolean} True if the color is dark, false otherwise.
 */
function isColorDark(hexColor) {
    if (!hexColor) return false;
    let color = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
    if (color.length === 3) {
        color = color.split('').map(char => char + char).join('');
    }
    if (color.length !== 6) {
        return false; // Invalid hex color
    }
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    const hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );
    // Using 127.5 as the threshold (half of 255)
    return hsp < 127.5;
}


console.log("PI Planner utils.js loaded.");
