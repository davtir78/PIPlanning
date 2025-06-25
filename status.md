### 2025-06-25 - Import Issue Resolution

**Issue:** When importing an XLSX file from the welcome screen, tasks assigned to sprints were incorrectly moved to the backlog, while importing from the settings screen worked as expected.

**Analysis:**
- Both the welcome modal (`public/js/ui/welcomeModal.js`) and the settings view (`public/js/ui/settingsView.js`) use the `window.PIPlanner.ImportExport.importJIRA` function.
- The `_parseJIRAData` function within `importJIRA` (in `public/js/importExport.js`) explicitly sets `task.sprintId = null` if a sprint name from the JIRA data is not found in `Storage.getSprintByName()`.
- The root cause was identified as the order of operations within `importJIRA`. Sprints were being saved to `Storage` *after* tasks were processed, meaning that during an initial import (e.g., from the welcome screen where no sprints exist yet), `Storage.getSprintByName()` would fail to find the sprints, leading tasks to be assigned to the backlog. When importing from the settings screen, sprints might already exist, leading to correct assignment.

**Resolution:**
- Modified `public/js/importExport.js`.
- Reordered the saving process within the `importJIRA` function to ensure that `importedSprints` are saved to `Storage` *before* `importedTasks` are processed and saved. This guarantees that sprints are available in `Storage` when tasks are being linked, allowing for correct sprint assignment.

**File Modified:**
- `public/js/importExport.js`

### 2025-06-25 - Ezoic Advertising Integration - Header Scripts

**Task:** Integrate Ezoic advertising by adding necessary header scripts to the `public/index.html` file.

**Action:**
- Added Ezoic privacy scripts and the main Ezoic header script to the `<head>` section of `public/index.html`. The scripts were placed at the very top of the `<head>` tag to ensure proper loading order and compliance.

**Files Modified:**
- `public/index.html`

### 2025-06-25 - Ezoic Advertising Integration - Ads.txt Setup (Firebase Redirect)

**Task:** Set up the `ads.txt` file for Ezoic advertising using Firebase Hosting redirects.

**Action:**
- Modified `firebase.json` to include a redirect for `/ads.txt` to the Ezoic-managed `ads.txt` file. This is the recommended approach for Firebase-hosted sites.
- The previous `public/ads.txt` file created for the `curl` method is no longer needed and can be removed.

**Next Steps for User:**
- Deploy your changes to Firebase Hosting by running: `firebase deploy --only hosting`
- Verify the setup by visiting `https://piplanner.net/ads.txt` in your browser to confirm it redirects properly and displays the authorized ad sellers.

**Files Modified:**
- `firebase.json`

### 2025-06-25 - Ezoic Advertising Integration - Collapsible Ad Banner

**Task:** Add a collapsible banner at the top of the page for Ezoic ads.

**Action:**
- Added the Ezoic ad placeholder HTML within a new `div` with `id="collapsible-ad-banner"` and a toggle button (`id="toggle-ad-banner"`) to `public/index.html`, right after the `<body>` tag.
- Added CSS rules to `public/style.css` for `#collapsible-ad-banner` and `#toggle-ad-banner` to control their appearance and implement the collapsible behavior using `max-height` and `overflow: hidden`.
- Added JavaScript code to `public/js/main.js` within the `initializeApp` function to handle the click event on the toggle button, adding/removing the `collapsed` class and updating the button text.
- Added `ezstandalone.cmd.push(function () { ezstandalone.showAds(103); });` to `public/js/main.js` to explicitly show the ad for the `top_of_page` placeholder.

**Files Modified:**
- `public/index.html`
- `public/style.css`
- `public/js/main.js`

### 2025-06-25 - Ezoic Advertising Integration - Console Errors

**Issue:** Console errors observed related to Ezoic ad loading: `403 Forbidden` and `Monetization not allowed for site`, along with `ERR_BLOCKED_BY_CLIENT`.

**Analysis:**
- The `403 Forbidden` and "Monetization not allowed for site" errors indicate that the Ezoic server is actively rejecting ad requests for the site. This is not a code integration issue but points to a configuration problem within the Ezoic account or the site's approval status with Ezoic.
- The `ERR_BLOCKED_BY_CLIENT` error suggests that an ad blocker or browser extension on the user's machine is preventing certain scripts (like `id5-sync.com`) from loading. This is also not a code issue that can be resolved through application code changes.

**Resolution:**
- No code changes are required from the application side as the integration steps have been completed as per Ezoic's instructions.
- The issue lies with the Ezoic account setup or external factors (ad blockers).

**Next Steps for User:**
- **Contact Ezoic Support:** The primary action should be to contact Ezoic's support team to resolve the "Monetization not allowed for site" issue. They can verify the site's approval status and troubleshoot any account-specific configurations.
- **Check Ad Blockers:** Advise checking if any ad blockers or browser extensions are enabled that might be interfering with ad scripts. Temporarily disabling them can help confirm if this is the cause of the `ERR_BLOCKED_BY_CLIENT` error.

### 2025-06-25 - Privacy Policy Integration

**Task:** Create a privacy policy for the website and display it in the settings tab.

**Action:**
- Generated a generic privacy policy and saved it to `public/privacy-policy.html`.
- Modified `public/js/ui/settingsView.js` to:
    - Add a new tab link for "Privacy Policy" in the settings navigation.
    - Add a new `tab-pane` for the privacy policy content.
    - Implement JavaScript to fetch the content of `public/privacy-policy.html` and inject its body content into the `privacy-policy-content` div within the settings tab.

**Files Modified:**
- `public/privacy-policy.html`
- `public/js/ui/settingsView.js`

### 2025-06-25 - Privacy Policy Content Update

**Task:** Update the privacy policy to reflect that PI Planner has no accounts and stores data only in the browser.

**Action:**
- Revised the content of `public/privacy-policy.html` to remove references to server-side data storage, user accounts, and server-side processing of personal data.
- Emphasized that all user-inputted data is stored exclusively in the browser's local storage.
- Clarified the roles of third-party services (Firebase Hosting, Ezoic, CDNs) in data collection, directing users to their respective privacy policies.
- Updated sections on data collection, use, disclosure, retention, transfer, deletion, and security to align with the client-side nature of the application.

**Files Modified:**
- `public/privacy-policy.html`

### 2025-06-25 - Welcome Screen Description Update

**Task:** Update the welcome screen to provide a brief description of what PI Planner is, how to get started, and how it works.

**Action:**
- Modified `public/js/ui/welcomeModal.js` to insert descriptive paragraphs explaining PI Planner's purpose, its client-side data storage mechanism, and how users can get started, right below the main title.

**Files Modified:**
- `public/js/ui/welcomeModal.js`

### 2025-06-25 - Welcome Screen Width Adjustment

**Task:** Make the welcome screen modal twice as wide.

**Action:**
- Modified `public/js/ui/welcomeModal.js` to set the `max-width` of the `modal-container` element to `960px` (twice the original `480px`) directly via JavaScript after the element is created.

**Files Modified:**
- `public/js/ui/welcomeModal.js`
