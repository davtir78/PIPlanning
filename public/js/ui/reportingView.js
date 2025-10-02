const ReportingView = (() => {
    let reportingViewElement = null;
    let currentReportType = 'landscape';

    function init() {
        reportingViewElement = document.getElementById('reporting-view');
        if (!reportingViewElement) {
            console.error("Reporting view element not found in DOM for ReportingView.init().");
            return;
        }
        console.log("ReportingView initialized.");
    }

    function _renderInternal() {
        if (!reportingViewElement) {
            console.error("Reporting view element not found for _renderInternal.");
            init();
            if (!reportingViewElement) return;
        }
        reportingViewElement.innerHTML = '';

        // Controls container
        const controlsContainer = createElement('div', 'reporting-controls');
        const dropdownLabel = createElement('label', null, { for: 'report-type-select' }, 'Report Type:');
        const dropdown = createElement('select', 'report-type-select', { id: 'report-type-select' });
        const landscapeOption = createElement('option', null, { value: 'landscape' }, 'Landscape PDF Export (Sprint Board Mirror)');
        const portraitOption = createElement('option', null, { value: 'portrait' }, 'Portrait PDF Export (Vertical Sprints + Backlog)');
        dropdown.appendChild(landscapeOption);
        dropdown.appendChild(portraitOption);
        dropdown.value = currentReportType;
        dropdown.addEventListener('change', (e) => {
            currentReportType = e.target.value;
            _generatePreview(currentReportType);
        });

        controlsContainer.appendChild(dropdownLabel);
        controlsContainer.appendChild(dropdown);

        // Preview area
        const previewContainer = createElement('div', 'report-preview', { id: 'report-preview' });
        previewContainer.style.flexGrow = '1';
        previewContainer.style.overflow = 'auto';

        reportingViewElement.appendChild(controlsContainer);
        reportingViewElement.appendChild(previewContainer);

        // Initial preview
        _generatePreview(currentReportType);

        console.log("Reporting UI rendered.");
    }

    // Helper to convert hex to RGB for jsPDF fill color
    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return { r, g, b };
    }

    function _createPdfDocument(reportType) {
        const { jsPDF } = window.jspdf;
        const sprints = Storage.getSprints();
        const tasks = Storage.getTasks();
        const epics = Storage.getEpics();

        const doc = new jsPDF({ orientation: reportType, unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 10;

        // Helper function to draw all landscape headers and vertical lines
        const _drawLandscapeHeaders = (doc, sprints, headerRgb, margin, columnWidth, headerHeight, pageHeight, isContinuation = false, continuationId = null) => {
            let currentX = margin;

            // Backlog header
            doc.setFillColor(headerRgb.r, headerRgb.g, headerRgb.b);
            doc.rect(currentX, margin, columnWidth, headerHeight, 'F');
            doc.setDrawColor(180, 180, 180);
            doc.rect(currentX, margin, columnWidth, headerHeight, 'S');
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            const backlogText = (isContinuation && continuationId === 'Backlog') ? 'Backlog (cont.)' : 'Backlog';
            doc.text(backlogText, currentX + columnWidth / 2, margin + 4, { align: 'center' });

            // Sprint headers
            for (let i = 0; i < sprints.length; i++) {
                const sprint = sprints[i];
                currentX = margin + (i + 1) * columnWidth;
                doc.setFillColor(headerRgb.r, headerRgb.g, headerRgb.b);
                doc.rect(currentX, margin, columnWidth, headerHeight, 'F');
                doc.setDrawColor(180, 180, 180);
                doc.rect(currentX, margin, columnWidth, headerHeight, 'S');
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                const sprintHeaderText = (isContinuation && continuationId === sprint.id) ? `${sprint.name} (cont.)` : sprint.name;
                doc.text(sprintHeaderText, currentX + columnWidth / 2, margin + 4, { align: 'center' });
            }

            // Draw vertical lines between columns
            for (let i = 0; i < sprints.length; i++) {
                const lineX = margin + (i + 1) * columnWidth;
                doc.setDrawColor(200, 200, 200);
                doc.line(lineX, margin, lineX, pageHeight);
            }
        };

        if (reportType === 'landscape') {
            const columnWidth = (pageWidth - 2 * margin) / (sprints.length + 1); // Backlog + sprints
            const cardPadding = 1.5; // mm
            const lineHeight = 3.5; // mm per line of text
            const cardGap = 1; // mm gap between cards
            const fixedCardHeight = 18; // mm, consistent size
            const headerHeight = 8;
            const headerRgb = hexToRgb('#F0F0F0');
            const maxLines = 4; // Limit to fit fixed height

            // Calculate how many cards can fit on a page vertically
            const availableHeightForCards = pageHeight - (2 * margin) - headerHeight - 4; // Total height minus top/bottom margin and header
            const cardsPerPage = Math.floor(availableHeightForCards / (fixedCardHeight + cardGap));

            // Pre-process tasks for each column into pages
            const tasksByColumnAndPage = {};
            let maxPages = 1;

            // Backlog tasks
            const backlogTasks = tasks.filter(t => t.sprintId === 'Backlog' || !t.sprintId);
            tasksByColumnAndPage['Backlog'] = [];
            for (let i = 0; i < backlogTasks.length; i += cardsPerPage) {
                tasksByColumnAndPage['Backlog'].push(backlogTasks.slice(i, i + cardsPerPage));
            }
            if (tasksByColumnAndPage['Backlog'].length > maxPages) {
                maxPages = tasksByColumnAndPage['Backlog'].length;
            }

            // Sprint tasks
            sprints.forEach(sprint => {
                const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
                tasksByColumnAndPage[sprint.id] = [];
                for (let i = 0; i < sprintTasks.length; i += cardsPerPage) {
                    tasksByColumnAndPage[sprint.id].push(sprintTasks.slice(i, i + cardsPerPage));
                }
                if (tasksByColumnAndPage[sprint.id].length > maxPages) {
                    maxPages = tasksByColumnAndPage[sprint.id].length;
                }
            });

            // Loop through pages
            for (let pageIndex = 0; pageIndex < maxPages; pageIndex++) {
                if (pageIndex > 0) {
                    doc.addPage(reportType);
                }

                // Draw headers for the current page
                _drawLandscapeHeaders(doc, sprints, headerRgb, margin, columnWidth, headerHeight, pageHeight);

                // Draw tasks for Backlog column on current page
                let currentX = margin;
                let currentY = margin + headerHeight + 4; // Start below header
                const backlogTasksForPage = tasksByColumnAndPage['Backlog'][pageIndex] || [];
                backlogTasksForPage.forEach(task => {
                    const epic = epics.find(e => e.id === task.epicId);
                    const epicName = epic ? epic.name : 'N/A';
                    const textWidth = columnWidth - 4 * cardPadding;
                    const textX = currentX + 2 * cardPadding;
                    const taskLines = doc.splitTextToSize(task.name, textWidth);
                    const epicText = `Epic: ${epicName}`;
                    const epicLines = doc.splitTextToSize(epicText, textWidth);
                    const pointsText = `Points: ${task.storyPoints || 0}`;
                    const pointsLines = doc.splitTextToSize(pointsText, textWidth);

                    // Draw card background
                    const rgb = hexToRgb(task.color || '#D3D3D3'); // Default light grey
                    doc.setFillColor(rgb.r, rgb.g, rgb.b);
                    doc.rect(currentX + cardPadding, currentY, columnWidth - 2 * cardPadding, fixedCardHeight, 'F');
                    doc.setDrawColor(180, 180, 180);
                    doc.rect(currentX + cardPadding, currentY, columnWidth - 2 * cardPadding, fixedCardHeight, 'S');

                    // Draw text with styling
                    doc.setFontSize(8);
                    doc.setTextColor(0, 0, 0); // Black text
                    let textY = currentY + cardPadding + lineHeight;

                    // Task name bold
                    doc.setFont('helvetica', 'bold');
                    taskLines.forEach(line => {
                        doc.text(line, textX, textY);
                        textY += lineHeight;
                    });

                    // Epic normal
                    doc.setFont('helvetica', 'normal');
                    epicLines.forEach(line => {
                        doc.text(line, textX, textY);
                        textY += lineHeight;
                    });

                    // Points normal, left-aligned
                    pointsLines.forEach(line => {
                        doc.text(line, textX, textY);
                        textY += lineHeight;
                    });

                    currentY += fixedCardHeight + cardGap; // Move Y for next card
                });

                // Draw tasks for each Sprint column on current page
                for (let i = 0; i < sprints.length; i++) {
                    const sprint = sprints[i];
                    currentX = margin + (i + 1) * columnWidth;
                    currentY = margin + headerHeight + 4; // Reset Y for each sprint column on the current page
                    const sprintTasksForPage = tasksByColumnAndPage[sprint.id][pageIndex] || [];

                    sprintTasksForPage.forEach(task => {
                        const epic = epics.find(e => e.id === task.epicId);
                        const epicName = epic ? epic.name : 'N/A';
                        const textWidth = columnWidth - 4 * cardPadding;
                        const textX = currentX + 2 * cardPadding;
                        const taskLines = doc.splitTextToSize(task.name, textWidth);
                        const epicText = `Epic: ${epicName}`;
                        const epicLines = doc.splitTextToSize(epicText, textWidth);
                        const pointsText = `Points: ${task.storyPoints || 0}`;
                        const pointsLines = doc.splitTextToSize(pointsText, textWidth);

                        // Draw card background
                        const rgb = hexToRgb(task.color || '#D3D3D3');
                        doc.setFillColor(rgb.r, rgb.g, rgb.b);
                        doc.rect(currentX + cardPadding, currentY, columnWidth - 2 * cardPadding, fixedCardHeight, 'F');
                        doc.setDrawColor(180, 180, 180);
                        doc.rect(currentX + cardPadding, currentY, columnWidth - 2 * cardPadding, fixedCardHeight, 'S');

                        // Draw text with styling
                        doc.setFontSize(8);
                        doc.setTextColor(0, 0, 0); // Black text
                        let textY = currentY + cardPadding + lineHeight;

                        // Task name bold
                        doc.setFont('helvetica', 'bold');
                        taskLines.forEach(line => {
                            doc.text(line, textX, textY);
                            textY += lineHeight;
                        });

                        // Epic normal
                        doc.setFont('helvetica', 'normal');
                        epicLines.forEach(line => {
                            doc.text(line, textX, textY);
                            textY += lineHeight;
                        });

                        // Points normal, left-aligned
                        pointsLines.forEach(line => {
                            doc.text(line, textX, textY);
                            textY += lineHeight;
                        });

                        currentY += fixedCardHeight + cardGap; // Move Y for next card
                    });
                }
            }
        } else if (reportType === 'portrait') {
            const numColumns = 2;
            const columnWidth = (pageWidth - 2 * margin) / numColumns;
            const cardPadding = 1.5; // mm
            const lineHeight = 3.5; // mm per line of text
            const cardGap = 1; // mm gap between cards
            const fixedCardHeight = 18; // mm, consistent size
            const headerHeight = 10; // Increased for longer headers
            const headerRgb = hexToRgb('#F0F0F0');
            const maxLines = 4; // Limit to fit fixed height

            let y = margin;
            sprints.forEach(sprint => {
                // Sprint header box - full width
                const fullHeaderWidth = pageWidth - 2 * margin;
                const headerText = `${sprint.name} (${sprint.startDate} - ${sprint.endDate})`;
                doc.setFontSize(10); // Smaller font for longer headers
                const headerSplit = doc.splitTextToSize(headerText, fullHeaderWidth - 4 * cardPadding);
                const headerTextHeight = headerSplit.length * lineHeight + 2;
                const actualHeaderHeight = Math.max(headerHeight, headerTextHeight + 2);
                doc.setFillColor(headerRgb.r, headerRgb.g, headerRgb.b);
                doc.rect(margin, y, fullHeaderWidth, actualHeaderHeight, 'F');
                doc.setDrawColor(180, 180, 180);
                doc.rect(margin, y, fullHeaderWidth, actualHeaderHeight, 'S');
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                // Center text vertically and horizontally in header
                const headerCenterY = y + (actualHeaderHeight / 2);
                const textHeight = headerSplit.length * lineHeight;
                let headerTextY = headerCenterY - (textHeight / 2) + (lineHeight / 2);
                headerSplit.forEach(line => {
                    doc.text(line, margin + fullHeaderWidth / 2, headerTextY, { align: 'center' });
                    headerTextY += lineHeight;
                });
                y += actualHeaderHeight + cardGap;

                // Check for page overflow
                if (y > pageHeight - margin - fixedCardHeight - cardGap) {
                    doc.addPage(reportType);
                    y = margin;
                    // Continued header
                    const contHeaderText = `${sprint.name} (cont.)`;
                    doc.setFillColor(headerRgb.r, headerRgb.g, headerRgb.b);
                    doc.rect(margin, y, fullHeaderWidth, headerHeight, 'F');
                    doc.setDrawColor(180, 180, 180);
                    doc.rect(margin, y, fullHeaderWidth, headerHeight, 'S');
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(0, 0, 0);
                    // Center continued header text
                    const contHeaderCenterY = y + (headerHeight / 2) + (lineHeight / 2);
                    doc.text(contHeaderText, margin + fullHeaderWidth / 2, contHeaderCenterY, { align: 'center' });
                    y += headerHeight + cardGap;
                }

                const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
                let taskIndex = 0;
                while (taskIndex < sprintTasks.length) {
                    let currentY = y;
                    let col = 0;
                    let tasksInRow = 0;
                    while (col < numColumns && taskIndex < sprintTasks.length && tasksInRow < numColumns) {
                        const task = sprintTasks[taskIndex];
                        const epic = epics.find(e => e.id === task.epicId);
                        const epicName = epic ? epic.name : 'N/A';
                        const textWidth = columnWidth - 4 * cardPadding;
                        const textX = margin + col * columnWidth + 2 * cardPadding;
                        const taskLines = doc.splitTextToSize(task.name, textWidth);
                        const epicText = `Epic: ${epicName}`;
                        const epicLines = doc.splitTextToSize(epicText, textWidth);
                        const pointsText = `Points: ${task.storyPoints || 0}`;
                        const pointsLines = doc.splitTextToSize(pointsText, textWidth);
                        const totalLines = taskLines.length + epicLines.length + pointsLines.length;
                        const availableLines = Math.floor((fixedCardHeight - 2 * cardPadding) / lineHeight);
                        const displayLines = Math.min(totalLines, availableLines);

                        // Check for page overflow before drawing row
                        if (currentY + fixedCardHeight + cardGap > pageHeight - margin) {
                            doc.addPage(reportType);
                            currentY = margin;
                        }

                        // Draw card background
                        const rgb = hexToRgb(task.color || '#D3D3D3');
                        doc.setFillColor(rgb.r, rgb.g, rgb.b);
                        doc.rect(margin + col * columnWidth + cardPadding, currentY, columnWidth - 2 * cardPadding, fixedCardHeight, 'F');
                        doc.setDrawColor(180, 180, 180);
                        doc.rect(margin + col * columnWidth + cardPadding, currentY, columnWidth - 2 * cardPadding, fixedCardHeight, 'S');

                        // Draw text
                        doc.setFontSize(8);
                        doc.setTextColor(0, 0, 0);
                        let textY = currentY + cardPadding + lineHeight;

                        // Task name bold
                        doc.setFont('helvetica', 'bold');
                        taskLines.slice(0, availableLines).forEach(line => {
                            doc.text(line, textX, textY);
                            textY += lineHeight;
                        });

                        // Epic normal
                        doc.setFont('helvetica', 'normal');
                        epicLines.slice(0, availableLines - taskLines.length).forEach(line => {
                            doc.text(line, textX, textY);
                            textY += lineHeight;
                        });

                        // Points normal
                        pointsLines.slice(0, availableLines - taskLines.length - epicLines.length).forEach(line => {
                            doc.text(line, textX, textY);
                            textY += lineHeight;
                        });

                        taskIndex++;
                        col++;
                        tasksInRow++;
                    }
                    y = currentY + fixedCardHeight + cardGap;
                }
            });

            // Backlog section for portrait mode - similar column layout
            const backlogTasks = tasks.filter(t => t.sprintId === 'Backlog' || !t.sprintId);
            if (backlogTasks.length > 0) {
                if (y > pageHeight - margin - fixedCardHeight - cardGap) {
                    doc.addPage(reportType);
                    y = margin;
                }
                // Backlog header - full width
                const fullHeaderWidth = pageWidth - 2 * margin;
                const headerText = 'Backlog';
                doc.setFontSize(12);
                const headerSplit = doc.splitTextToSize(headerText, fullHeaderWidth - 4 * cardPadding);
                const headerTextHeight = headerSplit.length * lineHeight + 2;
                const actualHeaderHeight = Math.max(headerHeight, headerTextHeight + 2);
                doc.setFillColor(headerRgb.r, headerRgb.g, headerRgb.b);
                doc.rect(margin, y, fullHeaderWidth, actualHeaderHeight, 'F');
                doc.setDrawColor(180, 180, 180);
                doc.rect(margin, y, fullHeaderWidth, actualHeaderHeight, 'S');
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
                // Center backlog header text vertically and horizontally
                const backlogHeaderCenterY = y + (actualHeaderHeight / 2);
                const backlogTextHeight = headerSplit.length * lineHeight;
                let headerTextY = backlogHeaderCenterY - (backlogTextHeight / 2) + (lineHeight / 2);
                headerSplit.forEach(line => {
                    doc.text(line, margin + fullHeaderWidth / 2, headerTextY, { align: 'center' });
                    headerTextY += lineHeight;
                });
                y += actualHeaderHeight + cardGap;

                let taskIndex = 0;
                while (taskIndex < backlogTasks.length) {
                    let currentY = y;
                    let col = 0;
                    let tasksInRow = 0;
                    while (col < numColumns && taskIndex < backlogTasks.length && tasksInRow < numColumns) {
                        const task = backlogTasks[taskIndex];
                        const epic = epics.find(e => e.id === task.epicId);
                        const epicName = epic ? epic.name : 'N/A';
                        const textWidth = columnWidth - 4 * cardPadding;
                        const textX = margin + col * columnWidth + 2 * cardPadding;
                        const taskLines = doc.splitTextToSize(task.name, textWidth);
                        const epicText = `Epic: ${epicName}`;
                        const epicLines = doc.splitTextToSize(epicText, textWidth);
                        const pointsText = `Points: ${task.storyPoints || 0}`;
                        const pointsLines = doc.splitTextToSize(pointsText, textWidth);
                        const totalLines = taskLines.length + epicLines.length + pointsLines.length;
                        const availableLines = Math.floor((fixedCardHeight - 2 * cardPadding) / lineHeight);
                        const displayLines = Math.min(totalLines, availableLines);

                        // Check for page overflow
                        if (currentY + fixedCardHeight + cardGap > pageHeight - margin) {
                            doc.addPage(reportType);
                            currentY = margin;
                        }

                        // Draw card background
                        const rgb = hexToRgb(task.color || '#D3D3D3');
                        doc.setFillColor(rgb.r, rgb.g, rgb.b);
                        doc.rect(margin + col * columnWidth + cardPadding, currentY, columnWidth - 2 * cardPadding, fixedCardHeight, 'F');
                        doc.setDrawColor(180, 180, 180);
                        doc.rect(margin + col * columnWidth + cardPadding, currentY, columnWidth - 2 * cardPadding, fixedCardHeight, 'S');

                        // Draw text
                        doc.setFontSize(8);
                        doc.setTextColor(0, 0, 0);
                        let textY = currentY + cardPadding + lineHeight;

                        // Task name bold
                        doc.setFont('helvetica', 'bold');
                        taskLines.slice(0, availableLines).forEach(line => {
                            doc.text(line, textX, textY);
                            textY += lineHeight;
                        });

                        // Epic normal
                        doc.setFont('helvetica', 'normal');
                        epicLines.slice(0, availableLines - taskLines.length).forEach(line => {
                            doc.text(line, textX, textY);
                            textY += lineHeight;
                        });

                        // Points normal
                        pointsLines.slice(0, availableLines - taskLines.length - epicLines.length).forEach(line => {
                            doc.text(line, textX, textY);
                            textY += lineHeight;
                        });

                        taskIndex++;
                        col++;
                        tasksInRow++;
                    }
                    y = currentY + fixedCardHeight + cardGap;
                }
            }
        }

        return doc;
    }

    async function _generatePreview(reportType) {
        const previewContainer = document.getElementById('report-preview');
        if (!previewContainer) {
            console.error("Report preview container not found.");
            return;
        }
        previewContainer.innerHTML = '<p>Generating preview...</p>';

        try {
            const doc = _createPdfDocument(reportType);
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);

            const iframe = createElement('iframe', 'pdf-preview-iframe', {
                src: pdfUrl,
                width: '100%',
                height: '100%',
                frameborder: '0'
            });
            previewContainer.innerHTML = '';
            previewContainer.appendChild(iframe);
            console.log("PDF preview generated.");
        } catch (error) {
            console.error("Error generating PDF preview:", error);
            previewContainer.innerHTML = `<p class="error-message">Error generating preview: ${error.message}. Check console for details.</p>`;
        }
    }

    async function _generateAndDownloadPDF(reportType) {
        try {
            const doc = _createPdfDocument(reportType);
            doc.save(`PI_Planner_Report_${reportType}_${new Date().toISOString().slice(0, 10)}.pdf`);
            console.log("PDF generated and downloaded.");
        } catch (error) {
            console.error("Error generating and downloading PDF:", error);
            alert(`Error generating PDF: ${error.message}. Check console for details.`);
        }
    }

    function show() {
        if (!reportingViewElement) {
            init();
            if (!reportingViewElement) {
                console.error("Cannot show ReportingView: element not found.");
                return;
            }
        }
        reportingViewElement.style.display = 'flex';
        reportingViewElement.style.flexDirection = 'column';
        reportingViewElement.style.height = '100%';
        reportingViewElement.classList.add('active-view');
        _renderInternal();
        console.log("ReportingView shown.");
    }

    function hide() {
        if (reportingViewElement) {
            reportingViewElement.style.display = 'none';
            reportingViewElement.classList.remove('active-view');
        }
        console.log("ReportingView hidden.");
    }

    return {
        init: init,
        render: _renderInternal,
        show: show,
        hide: hide
    };
})();
console.log("PI Planner reportingView.js loaded.");
