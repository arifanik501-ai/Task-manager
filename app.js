// app.js

const STORAGE_KEY = "taskflow_data_v1";

let state = {
    tasks: [],
    settings: {
        sortOrder: "newest", // newest, oldest, overdue
        completedSectionOpen: false,
        theme: "ember" // ember, arctic, verdant
    }
};

let currentDate = new Date();
let currentDisplayMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

// DOM Elements
const els = {
    input: document.getElementById('new-task-input'),
    addBtn: document.getElementById('add-task-btn'),
    activeList: document.getElementById('active-tasks-list'),
    completedList: document.getElementById('completed-tasks-list'),
    completedToggle: document.getElementById('completed-toggle'),
    completedWrapper: document.getElementById('completed-tasks-list-wrapper'),
    completedCountBadge: document.getElementById('completed-count-text'),
    activeCountBadge: document.getElementById('active-count-text'),
    activeEmpty: document.getElementById('active-empty-state'),

    // Calendar
    calMonthYear: document.getElementById('cal-month-year'),
    calGrid: document.getElementById('cal-grid'),
    calSummary: document.getElementById('cal-summary'),
    prevMonthBtn: document.querySelector('.prev-month'),
    nextMonthBtn: document.querySelector('.next-month'),

    // Stats
    statActive: document.getElementById('stat-active'),
    statDone: document.getElementById('stat-done'),
    statOverdue: document.getElementById('stat-overdue'),
    statProgress: document.getElementById('stat-progress'),
    statProgressText: document.getElementById('stat-progress-text'),

    // Reminders
    remindersList: document.getElementById('reminders-list'),
    remindersEmpty: document.getElementById('reminders-empty'),
    bellBadge: document.getElementById('bell-badge'),
    bellIcon: document.getElementById('bell-icon'),

    // Clock
    clockPanel: document.getElementById('clock-panel'),
    hourIndices: document.getElementById('hour-indices'),
    minuteMarkers: document.getElementById('minute-markers'),
    hourHand: document.getElementById('hour-hand'),
    minuteHand: document.getElementById('minute-hand'),
    secondHand: document.getElementById('second-hand'),
    subDayText: document.getElementById('sub-day-text'),
    subDate: document.getElementById('sub-date'),
    clockAmpmInd: document.getElementById('clock-ampm-ind'),
    digitalTooltip: document.getElementById('digital-tooltip'),
    dtHour1: document.getElementById('dt-hour-1'),
    dtHour2: document.getElementById('dt-hour-2'),
    dtMin1: document.getElementById('dt-min-1'),
    dtMin2: document.getElementById('dt-min-2'),
    dtSec1: document.getElementById('dt-sec-1'),
    dtSec2: document.getElementById('dt-sec-2'),
    dtAmpm: document.getElementById('dt-ampm'),
    dtDate: document.getElementById('digital-date'),
    dtTz: document.getElementById('digital-tz'),
    activityBarContainer: document.querySelector('.activity-bar-container'),
    activityDot: document.getElementById('activity-dot'),

    // Filter
    filterBar: document.getElementById('filter-bar'),
    filterText: document.getElementById('filter-text'),
    clearFilter: document.getElementById('clear-filter-btn'),

    // Theme Switch Buttons
    themeTriggerBtn: document.getElementById('theme-trigger-btn'),
    themeDropdown: document.getElementById('theme-dropdown'),
    themeBtns: document.querySelectorAll('.theme-btn'),

    taskDropdown: document.getElementById('task-dropdown'),
    calTooltip: document.getElementById('cal-tooltip'),
    toastContainer: document.getElementById('toast-container')
};

let filterDate = null; // if set, shows only tasks from this date (start of day timestamp)
let dropdownTargetId = null;
let undoTimer = null;
let deletedTaskHold = null;
let isThemeTransitioning = false;

// --- Initialization ---
function init() {
    generateMinuteMarkers();
    loadData();
    applyThemeInitial();
    setupEventListeners();
    setupDragAndDrop();

    // Initial Render
    renderAll();

    // Start continuous loops
    setInterval(secTick, 1000);
    requestAnimationFrame(updateClockHands);

    // initial set of the digital clock content
    updateDigitalClock(new Date());
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            console.error("Failed to parse local storage", e);
        }
    }
    if (state.settings.completedSectionOpen) {
        els.completedToggle.classList.add('expanded');
        els.completedWrapper.classList.add('expanded');
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('taskDataChanged', { detail: state }));
}

window.getSyncData = () => state;
window.loadDataFromCloud = (newData) => {
    if (newData.tasks) state.tasks = newData.tasks;
    if (newData.settings && newData.settings.theme) {
        if (state.settings.theme !== newData.settings.theme) {
            state.settings.theme = newData.settings.theme;
            // apply theme directly without animating
            document.documentElement.className = state.settings.theme === 'ember' ? '' : `theme-${state.settings.theme}`;
            els.themeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.theme === state.settings.theme);
            });
            showToast("Theme synced securely", "sync");
        }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    renderAll();
    showToast("Tasks synced securely", "sync");
};

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// --- Theming ---
function applyThemeInitial() {
    const theme = state.settings.theme || 'ember';
    document.documentElement.className = theme === 'ember' ? '' : `theme-${theme}`;

    // Update button states
    els.themeBtns.forEach(btn => {
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function switchTheme(newTheme, clickedBtn, e) {
    isThemeTransitioning = true;

    // 1. Button active state swap
    els.themeBtns.forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');

    // Save state
    state.settings.theme = newTheme;
    saveData();

    // 2. Prepare the Wipe Transition
    // Get click coordinates relative to viewport
    const rect = clickedBtn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Calculate max radius needed to cover screen
    const maxDistX = Math.max(x, window.innerWidth - x);
    const maxDistY = Math.max(y, window.innerHeight - y);
    const radius = Math.sqrt(maxDistX * maxDistX + maxDistY * maxDistY);

    // We create a temporary full-screen div with the NEW theme,
    // place it OVER everything, clip it to a circle at the button,
    // and animate the clip-path expanding.
    // Wait, it's easier to put the OLD theme in a screenshot overlay,
    // change the real DOM instantly behind it, and wipe the overlay away.
    // But CSS clip-path animation is better on a pseudo element or wrapper.

    // Better approach without canvas/screenshots:
    // Create a massive div fixed to viewport, colored with new theme background.
    // Actually, background isn't enough, we need all elements.
    // Standard web trick: we use View Transitions API if available!

    if (document.startViewTransition) {
        // Use native View Transitions (Chrome 111+) for the perfect circular wipe
        const transition = document.startViewTransition(() => {
            document.documentElement.className = newTheme === 'ember' ? '' : `theme-${newTheme}`;
            // Let the DOM update
        });

        transition.ready.then(() => {
            // Animate the pseudo-elements generated by the API
            const clipPath = [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${radius}px at ${x}px ${y}px)`
            ];

            document.documentElement.animate(
                {
                    clipPath: clipPath,
                },
                {
                    duration: 500,
                    easing: 'ease-out',
                    pseudoElement: '::view-transition-new(root)',
                }
            );

            // Wait for completion to trigger secondary settling animations
            setTimeout(() => {
                triggerThemeSettlingAnimations();
                isThemeTransitioning = false;
            }, 600);
        });
    } else {
        // Fallback for browsers without View Transitions
        document.documentElement.className = newTheme === 'ember' ? '' : `theme-${newTheme}`;
        triggerThemeSettlingAnimations();
        isThemeTransitioning = false;
    }
}

function triggerThemeSettlingAnimations() {
    // Cards briefly pulse
    const cards = document.querySelectorAll('.panel, .task-card');
    cards.forEach(card => {
        card.style.transition = 'transform 0.2s';
        card.style.transform = 'scale(0.99)';
        setTimeout(() => {
            card.style.transform = ''; // reset
        }, 200);
    });

    // Stat numbers flip to celebrate
    document.querySelectorAll('.stat-number').forEach(el => {
        const val = el.innerText;
        updateCountAnimation(el, val); // flip digits to same value
    });
}

// --- Interactions ---
function setupEventListeners() {
    els.addBtn.addEventListener('click', handleAddTask);
    els.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAddTask();
    });

    const inputContainer = document.getElementById('input-container');
    els.input.addEventListener('focus', () => inputContainer.classList.add('focused'));
    els.input.addEventListener('blur', () => inputContainer.classList.remove('focused'));

    els.completedToggle.addEventListener('click', () => {
        state.settings.completedSectionOpen = !state.settings.completedSectionOpen;
        if (state.settings.completedSectionOpen) {
            els.completedToggle.classList.add('expanded');
            els.completedWrapper.classList.add('expanded');
        } else {
            els.completedToggle.classList.remove('expanded');
            els.completedWrapper.classList.remove('expanded');
        }
        saveData();
    });

    els.prevMonthBtn.addEventListener('click', () => {
        currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() - 1);
        renderCalendar('right');
    });
    els.nextMonthBtn.addEventListener('click', () => {
        currentDisplayMonth.setMonth(currentDisplayMonth.getMonth() + 1);
        renderCalendar('left');
    });

    els.clearFilter.addEventListener('click', () => {
        filterDate = null;
        els.filterBar.style.display = 'none';
        renderActiveTasks();
    });

    // Theme Switcher Dropdown Toggle
    els.themeTriggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        els.themeDropdown.classList.toggle('show');
    });

    // Theme Switcher Buttons
    els.themeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (isThemeTransitioning) return;
            const newTheme = btn.dataset.theme;

            // Close dropdown immediately
            els.themeDropdown.classList.remove('show');

            if (newTheme === state.settings.theme) return;
            switchTheme(newTheme, btn, e);
        });
    });

    // Clock Proximity (Five-Tier)
    let currentClockTier = 0;
    const clockSpotlight = document.createElement('div');
    clockSpotlight.className = 'clock-spotlight';
    els.clockPanel.querySelector('.analog-clock').appendChild(clockSpotlight);

    document.addEventListener('mousemove', (e) => {
        const rect = els.clockPanel.getBoundingClientRect();
        const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
        const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
        const distToPanel = Math.sqrt(dx * dx + dy * dy);

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + 28 + 115; // padding top + clock radius
        const distToClockCenter = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));

        let newTier = 0;
        if (distToClockCenter <= 115) {
            newTier = 5;
        } else if (distToPanel <= 0) {
            newTier = 4;
        } else if (distToPanel <= 40) {
            newTier = 3;
        } else if (distToPanel <= 80) {
            newTier = 2;
        } else if (distToPanel <= 120) {
            newTier = 1;
        } else {
            newTier = 0;
        }

        if (newTier !== currentClockTier) {
            els.clockPanel.classList.remove(`prox-tier-${currentClockTier}`);
            if (newTier > 0) els.clockPanel.classList.add(`prox-tier-${newTier}`);

            // Typewriter effect for Timezone when crossing into Tier >= 4
            if (newTier >= 4 && currentClockTier < 4) {
                const tzStr = els.dtTz.dataset.tz || els.dtTz.innerText;
                els.dtTz.innerText = '';
                let i = 0;
                const typeInterval = setInterval(() => {
                    if (i < tzStr.length) {
                        els.dtTz.innerText += tzStr[i];
                        i++;
                    } else {
                        clearInterval(typeInterval);
                    }
                }, Math.max(50, 400 / Math.max(1, tzStr.length)));
            }

            currentClockTier = newTier;

            // Adjust speeds based on tier
            if (newTier >= 2) window.minuteWaveSpeedMultiplier = 0.7; // 30% faster
            else window.minuteWaveSpeedMultiplier = 1.0;
        }

        // Spotlight and Hand Tracking logic in Tier 5
        if (newTier === 5) {
            const clockRect = els.clockPanel.querySelector('.analog-clock').getBoundingClientRect();
            // Spotlight
            clockSpotlight.style.opacity = '1';
            clockSpotlight.style.transform = `translate(${e.clientX - clockRect.left - 50}px, ${e.clientY - clockRect.top - 50}px)`;

            // Hand Tracking
            const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI + 90;
            const normAngle = (angle + 360) % 360;

            const now = new Date();
            const secDeg = ((now.getSeconds() + now.getMilliseconds() / 1000) / 60) * 360;
            const minDeg = ((now.getMinutes() / 60) * 360);
            const hrDeg = ((((now.getHours() % 12) + now.getMinutes() / 60) / 12) * 360);

            const getDist = (a, b) => {
                const d = Math.abs(a - b) % 360;
                return d > 180 ? 360 - d : d;
            };

            const dS = getDist(normAngle, secDeg);
            const dM = getDist(normAngle, minDeg);
            const dH = getDist(normAngle, hrDeg);

            els.secondHand.classList.remove('hand-hover');
            els.minuteHand.classList.remove('hand-hover');
            els.hourHand.classList.remove('hand-hover');

            if (dS <= dM && dS <= dH) els.secondHand.classList.add('hand-hover');
            else if (dM <= dS && dM <= dH) els.minuteHand.classList.add('hand-hover');
            else els.hourHand.classList.add('hand-hover');
        } else {
            clockSpotlight.style.opacity = '0';
            els.secondHand.classList.remove('hand-hover');
            els.minuteHand.classList.remove('hand-hover');
            els.hourHand.classList.remove('hand-hover');
        }
    });

    window.clockPaused = false;
    let clockPauseTimer = null;
    let showingSecondaryTz = false;

    els.clockPanel.addEventListener('dblclick', (e) => {
        showingSecondaryTz = !showingSecondaryTz;
        const analog = els.clockPanel.querySelector('.analog-clock');
        if (showingSecondaryTz) {
            analog.classList.add('flipped');
        } else {
            analog.classList.remove('flipped');
        }
        e.preventDefault();
        e.stopPropagation();
    });

    els.clockPanel.addEventListener('click', (e) => {
        if (showingSecondaryTz) return; // don't trigger shockwaves on the back

        // 1. Shockwave
        const rect = els.clockPanel.getBoundingClientRect();
        const shock = document.createElement('div');
        shock.className = 'clock-shockwave';
        shock.style.left = `${e.clientX - rect.left}px`;
        shock.style.top = `${e.clientY - rect.top}px`;
        els.clockPanel.appendChild(shock);
        setTimeout(() => shock.remove(), 400);

        // 2. Time-Stop
        window.clockPaused = true;
        els.clockPanel.classList.add('time-stopped');
        clearTimeout(clockPauseTimer);
        clockPauseTimer = setTimeout(() => {
            window.clockPaused = false;
            els.clockPanel.classList.remove('time-stopped');
        }, 1500);

        // 3. Mark Flash
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + 28 + 115;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI + 90;
        const normAngle = (angle + 360) % 360;
        const minIndex = Math.round(normAngle / 6) % 60;
        const dots = els.minuteMarkers.querySelectorAll('.marker');
        if (dots[minIndex]) {
            dots[minIndex].classList.add('mark-flash');
            setTimeout(() => dots[minIndex].classList.remove('mark-flash'), 2000);
        }

        // 4. Digital reveal max
        els.clockPanel.classList.add('prox-tier-5');
        setTimeout(() => els.clockPanel.classList.remove('prox-tier-5'), 1500);
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        // Task Context Menu
        if (!e.target.closest('.dropdown-menu') && !e.target.closest('.btn-more')) {
            closeDropdown();
        }

        // Theme Dropdown
        if (!e.target.closest('.theme-dropdown') && !e.target.closest('#theme-trigger-btn')) {
            els.themeDropdown.classList.remove('show');
        }
    });

    // Delegated task list clicks
    els.activeList.addEventListener('click', handleTaskClick);
    els.completedList.addEventListener('click', handleTaskClick);

    // Dropdown Actions
    document.getElementById('dd-edit').addEventListener('click', () => {
        if (!dropdownTargetId) return;
        const task = state.tasks.find(t => t.id === dropdownTargetId);
        if (task) {
            const newName = prompt('Edit Task Name:', task.title);
            if (newName !== null && newName.trim() !== '') {
                task.title = newName.trim();
                saveData();
                renderAll();
            }
        }
        closeDropdown();
    });

    document.getElementById('dd-priority').addEventListener('click', () => {
        if (!dropdownTargetId) return;
        const task = state.tasks.find(t => t.id === dropdownTargetId);
        if (task) {
            task.isUrgent = !task.isUrgent;
            saveData();
            renderAll();
        }
        closeDropdown();
    });

    document.getElementById('dd-duplicate').addEventListener('click', () => {
        if (!dropdownTargetId) return;
        const task = state.tasks.find(t => t.id === dropdownTargetId);
        if (task) {
            const newTask = {
                id: uuid(),
                title: task.title + ' (Copy)',
                createdAt: Date.now(),
                isCompleted: task.isCompleted,
                completedAt: task.completedAt,
                isUrgent: task.isUrgent,
                order: state.tasks.length
            };
            if (newTask.isCompleted) {
                state.tasks.push(newTask);
            } else {
                state.tasks.unshift(newTask);
            }
            saveData();
            renderAll();
        }
        closeDropdown();
    });

    // Drag and drop events would be attached to individual cards during render
}

function handleAddTask() {
    const text = els.input.value.trim();
    if (!text) return;

    // Add Animation
    els.input.style.opacity = '0';
    setTimeout(() => {
        els.input.value = '';
        els.input.style.opacity = '1';
    }, 100);

    const newTask = {
        id: uuid(),
        title: text,
        createdAt: Date.now(),
        isCompleted: false,
        completedAt: null,
        order: state.tasks.filter(t => !t.isCompleted).length
    };

    state.tasks.unshift(newTask); // prepend
    saveData();

    // Re-render
    renderAll();

    // Trigger entrance animation manually if possible, or reliance on CSS
    const card = document.getElementById(`task-${newTask.id}`);
    if (card) {
        card.style.transform = 'translateY(-12px)';
        card.style.opacity = '0';
        requestAnimationFrame(() => {
            card.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
            card.style.transform = 'translateY(0)';
            card.style.opacity = '1';
        });
    }
}

function handleTaskClick(e) {
    const cardRow = e.target.closest('.task-card');
    if (!cardRow) return;
    const taskId = cardRow.dataset.id;
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Checkbox click
    if (e.target.closest('.custom-checkbox')) {
        if (!task.isCompleted) {
            completeTaskFlow(taskId, cardRow);
        }
    }

    // Restore click
    if (e.target.closest('.btn-restore')) {
        restoreTask(taskId, cardRow);
    }

    // Delete click
    const deleteBtn = e.target.closest('.btn-delete');
    if (deleteBtn) {
        const confirmGroup = cardRow.querySelector('.delete-confirm-group');
        deleteBtn.style.display = 'none';
        confirmGroup.style.display = 'flex';
        // Add opactiy transition
        requestAnimationFrame(() => {
            confirmGroup.classList.add('show');
        });

        // timeout to revert
        setTimeout(() => {
            if (document.body.contains(confirmGroup)) {
                confirmGroup.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(confirmGroup)) confirmGroup.style.display = 'none';
                    if (document.body.contains(deleteBtn)) deleteBtn.style.display = 'flex';
                }, 150);
            }
        }, 3000);
    }

    // Confirm delete click
    if (e.target.closest('.confirm-yes')) {
        deleteTaskFlow(taskId, cardRow);
    }

    // Cancel delete click
    if (e.target.closest('.confirm-no')) {
        const confirmGroup = cardRow.querySelector('.delete-confirm-group');
        const dBtn = cardRow.querySelector('.btn-delete');

        if (confirmGroup) confirmGroup.classList.remove('show');
        setTimeout(() => {
            if (confirmGroup && document.body.contains(confirmGroup)) confirmGroup.style.display = 'none';
            if (dBtn && document.body.contains(dBtn)) dBtn.style.display = 'flex';
        }, 150);
    }

    // More Options click
    if (e.target.closest('.btn-more')) {
        openDropdown(e.target.closest('.btn-more'), taskId);
    }
}

function completeTaskFlow(taskId, cardEl) {
    cardEl.classList.add('anim-completing');
    // Add completed styles early for animation
    cardEl.classList.add('completed');

    setTimeout(() => {
        cardEl.classList.add('anim-collapsing');

        setTimeout(() => {
            const taskIndex = state.tasks.findIndex(t => t.id === taskId);
            if (taskIndex > -1) {
                state.tasks[taskIndex].isCompleted = true;
                state.tasks[taskIndex].completedAt = Date.now();
                saveData();
                renderAll();
            }
        }, 300);
    }, 600);
}

function restoreTask(taskId, cardEl) {
    cardEl.classList.add('anim-collapsing');
    setTimeout(() => {
        const taskIndex = state.tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            state.tasks[taskIndex].isCompleted = false;
            state.tasks[taskIndex].completedAt = null;
            saveData();
            renderAll();
        }
    }, 300);
}

function deleteTaskFlow(taskId, cardEl) {
    cardEl.classList.add('anim-deleting');

    const taskIndex = state.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    deletedTaskHold = state.tasks[taskIndex];
    state.tasks.splice(taskIndex, 1);

    setTimeout(() => {
        cardEl.classList.add('anim-collapsing');
        setTimeout(() => {
            saveData();
            renderAll();
            showToast("Task deleted", "undo");

            undoTimer = setTimeout(() => {
                deletedTaskHold = null; // permanent
            }, 5000);

        }, 300);
    }, 250);
}

function undoDelete() {
    if (deletedTaskHold) {
        clearTimeout(undoTimer);
        state.tasks.unshift(deletedTaskHold);
        saveData();
        deletedTaskHold = null;
        renderAll();
        hideToast();
    }
}

// --- Dynamic Rendering ---

function formatTaskAge(createdAt) {
    const diff = (Date.now() - createdAt) / 1000; // secs
    if (diff < 60) return "0m";
    const m = Math.floor((diff / 60) % 60);
    const h = Math.floor((diff / 3600) % 24);
    const d = Math.floor(diff / 86400);

    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

function createTaskHTML(task) {
    const isCompleted = task.isCompleted;
    const dateObj = new Date(task.createdAt);
    const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    let ageHtml = '';
    let urgentClass = '';
    if (!isCompleted) {
        const ageHours = (Date.now() - task.createdAt) / 3600000;
        if (ageHours > 48) urgentClass = 'urgent';

        let warningDot = (ageHours > 24) ? `<div class="warning-dot"></div>` : '';
        ageHtml = `
            <div class="live-counter">
                ${warningDot}
                <div class="age-text" id="age-${task.id}">${formatTaskAge(task.createdAt)}</div>
            </div>`;
    } else {
        const cDate = new Date(task.completedAt);
        const diffHrs = (Date.now() - task.completedAt) / 3600000;
        let cStr = diffHrs < 24 ? `Completed ${Math.floor(diffHrs)}h ago` : `Completed ${cDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`;
        if (diffHrs < 1) cStr = "Completed just now";
        ageHtml = `<div class="live-counter">${cStr}</div>`;
    }

    return `
        <div class="task-card ${isCompleted ? 'completed' : ''} ${urgentClass}" data-id="${task.id}" id="task-${task.id}" ${!isCompleted ? 'draggable="true"' : ''}>
            <!-- Ambient Corner Dots -->
            <div class="card-corner-dot tl"></div>
            <div class="card-corner-dot tr"></div>
            <div class="card-corner-dot bl"></div>
            <div class="card-corner-dot br"></div>

            ${!isCompleted ? `
            <div class="drag-handle">
                <div class="drag-dots">
                    <div class="d-dot"></div>
                    <div class="d-dot"></div>
                    <div class="d-dot"></div>
                    <div class="d-dot"></div>
                    <div class="d-dot"></div>
                    <div class="d-dot"></div>
                </div>
            </div>` : ''}
            
            <div class="checkbox-zone">
                <div class="custom-checkbox">
                    <svg viewBox="0 0 16 16"><polyline points="3 8 7 12 13 4"></polyline></svg>
                </div>
            </div>
            
            <div class="task-content">
                <div class="task-name">
                    ${escapeHtml(task.title)}
                    <div class="task-name-strikethrough"></div>
                </div>
                <div class="task-meta">Created ${dateStr}</div>
            </div>
            
            ${ageHtml}
            
            <div class="task-actions">
                ${isCompleted ?
            `<div class="action-btn btn-restore" title="Restore" aria-label="Restore task">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
                     </div>` : ''}
                <div class="action-btn btn-delete" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </div>
                <!-- Delete Confirmation state, hidden by default -->
                <div class="delete-confirm-group" style="display: none;">
                    <span class="sure-text">Sure?</span>
                    <div class="confirm-circle confirm-yes"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                    <div class="confirm-circle confirm-no"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></div>
                </div>
                
                ${!isCompleted ?
            `<div class="action-btn btn-more" title="Options">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                     </div>` : ''}
            </div>
        </div>
    `;
}

function renderActiveTasks() {
    let actives = state.tasks.filter(t => !t.isCompleted);

    // sorting
    if (state.settings.sortOrder === 'newest') {
        actives.sort((a, b) => b.createdAt - a.createdAt);
    }

    // filter
    if (filterDate) {
        const start = new Date(filterDate).setHours(0, 0, 0, 0);
        const end = start + 86400000;
        actives = actives.filter(t => t.createdAt >= start && t.createdAt < end);
    }

    if (actives.length === 0) {
        els.activeList.innerHTML = `<div class="empty-state" id="active-empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M9 12l2 2 4-4"></path></svg>
            <div class="empty-title">No active tasks</div>
            <div class="empty-subtitle">Add a task above to get started</div>
        </div>`;
    } else {
        els.activeList.innerHTML = actives.map(createTaskHTML).join('');
    }

    updateActiveCountBadge(actives.length);
}

function renderCompletedTasks() {
    let completed = state.tasks.filter(t => t.isCompleted);
    completed.sort((a, b) => b.completedAt - a.completedAt); // recently completed first

    if (completed.length === 0) {
        els.completedList.innerHTML = '';
        els.completedWrapper.style.display = 'none';
        els.completedToggle.style.pointerEvents = 'none';
        els.completedToggle.style.opacity = '0.5';
    } else {
        els.completedList.innerHTML = completed.map(createTaskHTML).join('');
        els.completedWrapper.style.display = 'block';
        els.completedToggle.style.pointerEvents = 'auto';
        els.completedToggle.style.opacity = '1';
    }

    updateCountAnimation(els.completedCountBadge, completed.length);
}

function renderStats() {
    const actives = state.tasks.filter(t => !t.isCompleted).length;
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const doneToday = state.tasks.filter(t => t.isCompleted && t.completedAt >= todayStart).length;
    const overdue = state.tasks.filter(t => !t.isCompleted && (Date.now() - t.createdAt > 86400000)).length;
    const critical = state.tasks.filter(t => !t.isCompleted && (Date.now() - t.createdAt > 172800000)).length;

    animateNumber(els.statActive, actives);
    animateNumber(els.statDone, doneToday);
    animateNumber(els.statOverdue, overdue);

    const overdueDot = document.getElementById('stat-overdue-dot');
    els.statOverdue.className = 'stat-number ' + (critical > 0 ? 'stat-danger' : (overdue > 0 ? 'stat-warning' : ''));
    overdueDot.className = 'stat-dot ' + (critical > 0 ? 'dot-danger' : (overdue > 0 ? 'dot-warning' : ''));

    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.isCompleted).length;
    const progressPerc = total === 0 ? 0 : (completed / total) * 100;
    els.statProgress.style.width = `${progressPerc}%`;
    els.statProgressText.innerText = `${completed} of ${total} tasks completed`;
}

function renderCalendar(direction = null) {
    const year = currentDisplayMonth.getFullYear();
    const month = currentDisplayMonth.getMonth();

    // Title
    els.calMonthYear.innerText = currentDisplayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Grid
    const startDay = new Date(year, month, 1).getDay(); // 0 is Sunday
    const startOffset = startDay === 0 ? 6 : startDay - 1; // shift so Monday is 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    let html = '';
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    let currentGridDate = new Date(year, month, 1 - startOffset);

    for (let i = 0; i < 42; i++) {
        if (i >= startOffset + daysInMonth && i % 7 === 0) break; // no extra row if not needed

        const cellDate = new Date(currentGridDate);
        const y = cellDate.getFullYear();
        const m = cellDate.getMonth();
        const d = cellDate.getDate();

        const isOtherMonth = m !== month;
        const isToday = isCurrentMonth && !isOtherMonth && d === today.getDate();
        const dayOfWeek = cellDate.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        // Check for tasks
        const cellStart = cellDate.setHours(0, 0, 0, 0);
        const cellEnd = cellStart + 86400000;
        const tasksOnDay = state.tasks.filter(t => t.createdAt >= cellStart && t.createdAt < cellEnd).length;

        let dots = '';
        if (tasksOnDay > 0) {
            const numDots = Math.min(tasksOnDay, 3);
            let dotsHtml = '';
            for (let j = 0; j < numDots; j++) dotsHtml += `<div class="cal-dot"></div>`;
            dots = `<div class="cal-dots">${dotsHtml}</div>`;
        }

        let classes = ['cal-cell'];
        if (isOtherMonth) classes.push('other-month');
        if (isWeekend) classes.push('weekend');
        if (isToday) classes.push('today');

        let msg = `${tasksOnDay} tasks`;
        if (tasksOnDay === 0) msg = "Free day";

        html += `<div class="${classes.join(' ')}" data-date="${cellStart}" data-tooltip="${msg}">
                    <span class="date-num">${d}</span>
                    ${dots}
                 </div>`;

        currentGridDate.setDate(currentGridDate.getDate() + 1);
    }

    if (direction) {
        els.calGrid.classList.remove('slide-left', 'slide-right');
        // Force reflow
        void els.calGrid.offsetWidth;
        els.calGrid.classList.add(`slide-${direction}`);
    }

    els.calGrid.innerHTML = html;

    // Attach click and hover events for filter and tooltip
    let tooltipTimeout;
    els.calGrid.querySelectorAll('.cal-cell').forEach(cell => {
        cell.addEventListener('mouseenter', (e) => {
            const msg = cell.dataset.tooltip;
            els.calTooltip.innerText = msg;
            els.calTooltip.style.display = 'block';

            const rect = cell.getBoundingClientRect();
            els.calTooltip.style.left = (rect.left + rect.width / 2 - els.calTooltip.offsetWidth / 2) + 'px';
            els.calTooltip.style.top = (rect.top - 30) + 'px';

            clearTimeout(tooltipTimeout);
            els.calTooltip.classList.add('show');
        });

        cell.addEventListener('mouseleave', () => {
            els.calTooltip.classList.remove('show');
            tooltipTimeout = setTimeout(() => {
                els.calTooltip.style.display = 'none';
            }, 150);
        });

        cell.addEventListener('click', () => {

            const cellStart = parseInt(cell.dataset.date);
            const dObj = new Date(cellStart);
            filterDate = dObj;
            els.filterBar.style.display = 'flex';
            els.filterText.innerText = `Showing: ${dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

            // brief highlight
            cell.style.backgroundColor = 'var(--surface-top)';
            setTimeout(() => cell.style.backgroundColor = '', 150);

            renderActiveTasks();
        });
    });
}

function renderReminders() {
    const overdueTasks = state.tasks.filter(t => !t.isCompleted && (Date.now() - t.createdAt > 86400000));

    if (overdueTasks.length === 0) {
        els.remindersEmpty.style.display = 'flex';
        els.remindersList.innerHTML = '';
        els.remindersList.appendChild(els.remindersEmpty);
        els.bellBadge.style.display = 'none';
        els.bellIcon.className = 'bell-icon';
    } else {
        els.remindersEmpty.style.display = 'none';

        overdueTasks.sort((a, b) => a.createdAt - b.createdAt); // oldest first

        let criticalCount = 0;
        const html = overdueTasks.map(task => { // we could limit to top 5
            const ageHrs = (Date.now() - task.createdAt) / 3600000;
            const isDanger = ageHrs > 48;
            if (isDanger) criticalCount++;
            return `
                <div class="reminder-card ${isDanger ? 'danger' : ''}">
                    <div class="reminder-content">
                        <div class="reminder-title">${escapeHtml(task.title)}</div>
                        <div class="reminder-time">Overdue: ${formatTaskAge(task.createdAt)}</div>
                    </div>
                    <div class="goto-btn" title="View in list">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </div>
                </div>
            `;
        }).join('');

        els.remindersList.innerHTML = html;

        els.bellBadge.style.display = 'flex';
        els.bellBadge.innerText = overdueTasks.length;
        if (criticalCount > 0) {
            els.bellBadge.className = 'bell-badge danger pop';
            els.bellIcon.className = 'bell-icon danger bell-shake';
        } else {
            els.bellBadge.className = 'bell-badge pop';
            els.bellIcon.className = 'bell-icon warning';
        }
        // remove pop class
        setTimeout(() => {
            els.bellBadge.classList.remove('pop');
            els.bellIcon.classList.remove('bell-shake');
        }, 500);
    }
}

function renderAll() {
    renderActiveTasks();
    renderCompletedTasks();
    renderStats();
    renderCalendar();
    renderReminders();
}

// --- Live Counters ---
function secTick() {
    // Update task ages visually
    const activeTasks = state.tasks.filter(t => !t.isCompleted);
    activeTasks.forEach(t => {
        const span = document.getElementById(`age-${t.id}`);
        if (span) {
            span.innerText = formatTaskAge(t.createdAt);
        }
    });

    const now = new Date();
    updateDigitalClock(now);
}

// --- Animations and Visuals ---

function updateActiveCountBadge(newVal) {
    updateCountAnimation(els.activeCountBadge, newVal);
}

function updateCountAnimation(element, newVal) {
    const current = element.innerText;
    if (current == newVal) return;

    // Slide transition logic for single container
    const newDiv = document.createElement('div');
    newDiv.className = 'digit-slide sliding-in';
    newDiv.innerText = newVal;

    const oldDiv = document.createElement('div');
    oldDiv.className = 'digit-slide settled';
    oldDiv.innerText = current;

    element.innerHTML = '';
    element.appendChild(oldDiv);
    element.appendChild(newDiv);

    // Force reflow
    void element.offsetWidth;

    oldDiv.classList.remove('settled');
    oldDiv.classList.add('sliding-out');

    newDiv.classList.remove('sliding-in');
    newDiv.classList.add('settled');

    setTimeout(() => {
        element.innerHTML = newVal;
    }, 200);
}

function animateNumber(element, finalVal) {
    const current = parseInt(element.dataset.value || "0");
    if (current === finalVal) return;

    // simple lerp for visuals, but we'll do an immediate snap if small diff
    // or just the slide animation if it's stats over time
    element.dataset.value = finalVal;

    // Real count up
    let startTimestamp = null;
    const duration = 400;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // ease out
        const easeProgress = progress * (2 - progress);
        const currentVal = Math.floor(current + (finalVal - current) * easeProgress);
        element.innerText = currentVal;

        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.innerText = finalVal;
        }
    };
    window.requestAnimationFrame(step);
}


// --- Analog Clock ---
function generateMinuteMarkers() {
    let htMarkers = '';
    let htIndices = '';

    for (let i = 0; i < 60; i++) {
        const deg = i * 6;

        if (i % 5 === 0) {
            // 5 min mark 
            htMarkers += `<div class="minute-dot five-min marker" style="transform: rotate(${deg}deg) translate(0, -106px)"></div>`;

            // Hour indices handling via separate container
            const hour = i / 5;
            let indexClass = 'minor';
            if (hour === 0) {
                htIndices += `<div class="hour-marker twelve-left marker" style="transform: rotate(0deg) translate(-2px, -92px)" id="hm-0-l"></div>
                              <div class="hour-marker twelve-right marker" style="transform: rotate(0deg) translate(2px, -92px)" id="hm-0-r"></div>`;
            } else {
                if (hour === 3 || hour === 6 || hour === 9) indexClass = 'major';
                const yOffset = indexClass === 'major' ? -92 : -89; // major is 20px long, minor is 14px long (aligned tips inner)
                htIndices += `<div class="hour-marker ${indexClass} marker" style="transform: rotate(${deg}deg) translate(0, ${yOffset}px)" id="hm-${hour}"></div>`;
            }
        } else {
            // regular min mark
            htMarkers += `<div class="minute-dot marker" style="transform: rotate(${deg}deg) translate(0, -108px)"></div>`;
        }
    }

    els.minuteMarkers.innerHTML = htMarkers;
    els.hourIndices.innerHTML = htIndices;

    // Load sequence
    // Note: CSS default hour-marker opacity is 0
    setTimeout(() => {
        const markers = Array.from(els.hourIndices.querySelectorAll('.hour-marker'));
        markers.forEach((m, idx) => {
            setTimeout(() => {
                m.style.opacity = '1'; /* reveal sweep */
            }, idx * 15);
        });

        setTimeout(() => {
            els.secondHand.style.opacity = '1';
            els.subDayText.parentNode.parentNode.style.opacity = '1';
            els.clockAmpmInd.style.opacity = '1';

            // Start ambient animations after entrance
            initAmbientClockAnimations();
        }, 180 + 300); // after sweep + hour/min hands
    }, 200); // delay start

    // Inject 8 trail segments for the second hand
    let htTrail = '';
    for (let t = 1; t <= 8; t++) {
        const tw = 1.0 - (t / 8) * 0.5;
        const top = 0.15 - (t / 8) * 0.15;
        htTrail += `<div class="trail-segment" style="transform: rotate(${-t}deg); opacity: ${top}; width: ${tw}px; height: 72px; left: calc(50% - ${tw / 2}px);"></div>`;
    }
    // We append this before the needle so it's behind
    els.secondHand.insertAdjacentHTML('afterbegin', htTrail);
}

let currentBreathIndex = 0;
let waveDirection = 1;

function initAmbientClockAnimations() {
    // Minute Track Wave
    function playMinuteWave() {
        const dots = Array.from(els.minuteMarkers.querySelectorAll('.minute-dot'));
        if (dots.length === 0) return;

        let orderedDots = waveDirection === 1 ? dots : [...dots].reverse();

        orderedDots.forEach((dot, idx) => {
            setTimeout(() => {
                dot.classList.add('wave-active');
                setTimeout(() => {
                    dot.classList.remove('wave-active');
                }, 80);
            }, idx * 50);
        });

        waveDirection *= -1;
    }

    // Initial wave, then every 5s (3s wave + 2s pause)
    setTimeout(() => {
        playMinuteWave();
        setInterval(playMinuteWave, 5000);
    }, 1000);

    // Hour Indices Breathing
    function playHourBreath() {
        let targetIds;
        if (currentBreathIndex === 0) {
            targetIds = ['hm-0-l', 'hm-0-r'];
        } else {
            targetIds = [`hm-${currentBreathIndex}`];
        }

        const isCardinal = (currentBreathIndex === 0 || currentBreathIndex === 3 || currentBreathIndex === 6 || currentBreathIndex === 9);
        const activeClass = isCardinal ? 'breathe-active-cardinal' : 'breathe-active';
        const holdTime = isCardinal ? 500 : 300;

        targetIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.classList.add(activeClass);
                setTimeout(() => {
                    el.classList.remove(activeClass);
                }, holdTime);
            }
        });

        currentBreathIndex = (currentBreathIndex + 1) % 12;
    }

    setTimeout(() => {
        playHourBreath();
        setInterval(playHourBreath, 5000);
    }, 2000);
}

let lastTickMinute = -1;

function updateClockHands() {
    if (window.clockPaused) {
        return requestAnimationFrame(updateClockHands);
    }

    const now = new Date();
    const ms = now.getMilliseconds();
    const sec = now.getSeconds();
    const min = now.getMinutes();
    const hr = now.getHours();

    // Continuous sweep for seconds
    const secDeg = ((sec + ms / 1000) / 60) * 360;

    // Escapement logic for Minute Hand
    let minDegBase = (min / 60) * 360;
    let actualMinDeg = minDegBase;

    if (sec >= 58) {
        // tension: 0 to -0.3 deg
        const p = ((sec - 58) + (ms / 1000)) / 2;
        actualMinDeg = minDegBase - (0.3 * p);
    } else if (sec === 0 && ms < 200) {
        // snap and overshoot
        const p = ms / 200;
        if (p < 0.5) {
            const snapP = p / 0.5; // 0 to 1
            actualMinDeg = (minDegBase - 6.3) + (6.8 * snapP); // -6.3 to +0.5
        } else {
            const settleP = (p - 0.5) / 0.5; // 0 to 1
            actualMinDeg = (minDegBase + 0.5) - (0.5 * settleP); // +0.5 to 0
        }
    }

    // Trigger tick flash (shimmer effect and ghosts)
    if (sec === 0 && min !== lastTickMinute) {
        lastTickMinute = min;

        // 1. Radial Shimmer
        const shimmer = document.createElement('div');
        shimmer.className = 'tick-shimmer';
        els.minuteHand.appendChild(shimmer);
        setTimeout(() => shimmer.remove(), 200);

        // 2. Phantom Motion Blur Ghosts
        const parent = els.minuteHand.parentNode;
        const offsets = [-0.3, -0.2, -0.1]; // degrees behind the final position (0)
        const opacities = [0.08, 0.05, 0.02];
        offsets.forEach((off, i) => {
            const ghost = els.minuteHand.cloneNode(true);
            ghost.removeAttribute('id');
            ghost.classList.add('ghost-hand');
            ghost.style.transform = `rotate(${minDegBase + off}deg)`;
            ghost.style.opacity = opacities[i];
            parent.insertBefore(ghost, els.minuteHand);
            // fade out over 300ms
            setTimeout(() => {
                ghost.style.opacity = '0';
                setTimeout(() => ghost.remove(), 300);
            }, 50); // slight delay to ensure it renders before fading
        });
    }

    // Second hand tip flash on passing minute mark (ms < 50)
    if (ms < 50) {
        els.secondHand.classList.add('tick-flash');
    } else if (ms > 50 && ms < 100) {
        els.secondHand.classList.remove('tick-flash');
    }

    // Hour Index Reaction (Repel)
    const nearestHourIdx = Math.round(secDeg / 30) % 12;
    const nearestHourDeg = nearestHourIdx * 30;
    let distToNearest = Math.abs(secDeg - nearestHourDeg);
    if (distToNearest > 180) distToNearest = 360 - distToNearest;

    if (distToNearest <= 3) {
        let targetIds = nearestHourIdx === 0 ? ['hm-0-l', 'hm-0-r'] : [`hm-${nearestHourIdx}`];
        targetIds.forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.classList.contains('hour-repel')) el.classList.add('hour-repel');
        });
        window.lastRepelHourIdx = nearestHourIdx;
    } else if (window.lastRepelHourIdx !== undefined) {
        let targetIds = window.lastRepelHourIdx === 0 ? ['hm-0-l', 'hm-0-r'] : [`hm-${window.lastRepelHourIdx}`];
        targetIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('hour-repel');
        });
    }

    // Minute Mark Sympathetic Flash (180 deg)
    if (ms < 50 && sec !== window.lastSympatheticSec) {
        window.lastSympatheticSec = sec;
        const oppositeIndex = (sec + 30) % 60;
        const dots = els.minuteMarkers.querySelectorAll('.marker'); // gets all 60
        if (dots[oppositeIndex]) {
            dots[oppositeIndex].classList.add('mark-sympathetic-flash');
            setTimeout(() => dots[oppositeIndex].classList.remove('mark-sympathetic-flash'), 1000);
        }

        // Quarter-Hour Celebration (Cardinal index burst)
        if (sec % 15 === 0) {
            // Create a laser line element
            const laser = document.createElement('div');
            laser.className = 'cardinal-laser';
            laser.style.setProperty('--rot', `${sec * 6}deg`);
            els.minuteMarkers.appendChild(laser);
            setTimeout(() => laser.remove(), 400);
        }
    }

    // Hour hand continuous smooth, plus micro-breathing scaleY (10s cycle)
    const hrDeg = (((hr % 12) + min / 60) / 12) * 360;
    const hScale = 1.0 + Math.sin(Date.now() / 1591.5) * 0.02;

    els.secondHand.style.transform = `rotate(${secDeg}deg)`;
    els.minuteHand.style.transform = `rotate(${actualMinDeg}deg)`;
    els.hourHand.style.transform = `rotate(${hrDeg}deg) scaleY(${hScale})`;

    // Activity Line logic
    if (!window.actProg) {
        window.actProg = document.getElementById('activity-prog');
        window.actDotL = document.getElementById('act-dot-l');
        window.actDotR = document.getElementById('act-dot-r');
        window.actFlash = document.getElementById('act-flash');
        window.actCont = window.actProg ? window.actProg.parentElement : null;
    }

    if (window.actProg && window.actDotL && window.actDotR && window.actFlash && window.actCont) {
        const sf = sec + (ms / 1000);

        window.actProg.style.width = `${(sf / 60) * 100}%`;

        if (sec % 5 === 0 && ms < 50 && sec !== window.lastHeartbeatSec) {
            window.lastHeartbeatSec = sec;
            window.actCont.classList.remove('activity-heartbeat');
            void window.actCont.offsetWidth;
            window.actCont.classList.add('activity-heartbeat');
        }

        const cycleProgress = sf / 30; // 0 to 2
        let dotDispPos = cycleProgress <= 1 ? cycleProgress : 2 - cycleProgress; // 0 to 1

        window.actDotL.style.left = `calc(${dotDispPos * 50}% - 2px)`;
        window.actDotR.style.right = `calc(${dotDispPos * 50}% - 2px)`;

        if (sec === 30 && ms < 50 && sec !== window.lastFlashSec) {
            window.lastFlashSec = sec;
            window.actFlash.classList.remove('cross-flash-active');
            void window.actFlash.offsetWidth;
            window.actFlash.classList.add('cross-flash-active');
        }
    }

    // Sub-dial AM/PM fade
    const newAmPm = hr >= 12 ? 'PM' : 'AM';
    if (els.clockAmpmInd.innerText !== newAmPm) {
        els.clockAmpmInd.style.opacity = '0';
        setTimeout(() => {
            els.clockAmpmInd.innerText = newAmPm;
            els.clockAmpmInd.style.opacity = '1';
        }, 300);
    }

    // Hourly Chime check could go here
    if (min === 0 && sec === 0 && ms < 50) {
        triggerHourlyChime();
    }

    requestAnimationFrame(updateClockHands);
}

function triggerHourlyChime() {
    // 1. Flash Hour Indices
    const indices = Array.from(els.hourIndices.querySelectorAll('.hour-marker'));
    indices.forEach(idx => {
        idx.style.opacity = '1';
        idx.style.boxShadow = '0 0 8px rgba(232, 168, 124, 0.3)';
    });

    // 2. Fade out in cascade
    setTimeout(() => {
        indices.forEach((idx, i) => {
            setTimeout(() => {
                idx.style.opacity = '';
                idx.style.boxShadow = '';
            }, i * 30);
        });
    }, 200);

    // 3. Center Hub Pulse
    const outer = document.querySelector('.center-plate');
    const inner = document.querySelector('.center-pin');
    if (outer) outer.classList.add('chime-pulse-outer');
    if (inner) inner.classList.add('chime-pulse-inner');
    setTimeout(() => {
        if (outer) outer.classList.remove('chime-pulse-outer');
        if (inner) inner.classList.remove('chime-pulse-inner');
    }, 400);

    // 4. Bezel Accelerate
    const bezel = document.querySelector('.bezel-ring');
    if (bezel) bezel.classList.add('chime-spin');
    setTimeout(() => { if (bezel) bezel.classList.remove('chime-spin'); }, 3000);

    // 5. Subdial Flip
    const subdial = els.subDayText.parentNode.parentNode;
    if (subdial) subdial.classList.add('chime-flip');
    setTimeout(() => { if (subdial) subdial.classList.remove('chime-flip'); }, 800);

    // 6. Particle Burst
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const container = document.createElement('div');
            container.className = 'marker';
            container.style.transform = `rotate(${i * 30}deg)`;
            const part = document.createElement('div');
            part.className = 'chime-particle';
            container.appendChild(part);
            els.minuteMarkers.appendChild(container);
            setTimeout(() => container.remove(), 400);
        }, i * 25);
    }
}

function updateDigitalClock(now) {
    let h = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');

    // Hour digits slide
    const hStr = String(h).padStart(2, '0');
    if (els.dtHour1.textContent !== hStr[0]) updateCountAnimation(els.dtHour1, hStr[0]);
    if (els.dtHour2.textContent !== hStr[1]) updateCountAnimation(els.dtHour2, hStr[1]);

    // Minute digits slide
    if (els.dtMin1.textContent !== m[0]) updateCountAnimation(els.dtMin1, m[0]);
    if (els.dtMin2.textContent !== m[1]) updateCountAnimation(els.dtMin2, m[1]);

    els.dtAmpm.innerText = ampm;

    // Date
    const oldDateStr = els.dtDate.innerText;
    const newDateStr = now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (oldDateStr !== newDateStr) {
        els.dtDate.innerText = newDateStr;

        // Update sub dial
        const dAbbr = now.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
        updateCountAnimation(els.subDayText, dAbbr);
        els.subDate.innerText = now.getDate();

        // Update calendar bottom summary
        if (els.calSummary) {
            els.calSummary.innerText = `Today: ${newDateStr}`;
        }
    }

    // TZ
    try {
        const tzText = Intl.DateTimeFormat().resolvedOptions().timeZone.toUpperCase();
        if (els.dtTz.dataset.tz !== tzText) {
            els.dtTz.dataset.tz = tzText;
            els.dtTz.innerText = tzText; // set default fully typed
        }
    } catch (e) { }

    // Colons
    const colons = document.querySelectorAll('.colon');
    if (s === '00' || s === '15' || s === '30' || s === '45') {
        colons.forEach(c => {
            c.classList.remove('blink-alt');
            c.classList.remove('flicker');
            void c.offsetWidth; // reflow
            c.classList.add('flicker');
        });
    } else {
        colons.forEach(c => {
            if (!c.classList.contains('blink-alt')) {
                c.classList.add('blink-alt');
            }
        });
    }

    updateSecondDigits(s);

    // Tokyo Time (Back face)
    try {
        const tokyoTime = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const tokyoDate = now.toLocaleDateString('en-US', { timeZone: 'Asia/Tokyo', weekday: 'short', month: 'short', day: 'numeric' });
        const backTimeEl = document.getElementById('clock-back-time');
        const backDateEl = document.getElementById('clock-back-date');
        if (backTimeEl) backTimeEl.innerText = tokyoTime;
        if (backDateEl) backDateEl.innerText = tokyoDate.toUpperCase() + ', ' + now.toLocaleDateString('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric' });
    } catch (e) { }
}

function updateSecondDigits(strSeconds) {
    const s1 = strSeconds[0];
    const s2 = strSeconds[1];

    if (els.dtSec1.textContent !== s1) {
        updateCountAnimation(els.dtSec1, s1);
    }
    if (els.dtSec2.textContent !== s2) {
        updateCountAnimation(els.dtSec2, s2);
    }
}

function updateCountAnimation(container, newValue) {
    if (container.textContent.trim() === String(newValue)) return;

    if (!container.querySelector('.digit-slide')) {
        // Initial setup
        const oContent = container.textContent;
        container.textContent = '';
        const oldWrap = document.createElement('span');
        oldWrap.className = 'digit-slide settled';
        oldWrap.textContent = oContent;
        container.appendChild(oldWrap);
    }

    const newSlide = document.createElement('span');
    newSlide.className = 'digit-slide sliding-in';
    newSlide.textContent = newValue;

    const currentSettled = container.querySelector('.digit-slide.settled');
    container.appendChild(newSlide);

    // Reflow
    void newSlide.offsetWidth;

    if (currentSettled) {
        currentSettled.classList.remove('settled');
        currentSettled.classList.add('sliding-out');
    }
    newSlide.classList.remove('sliding-in');
    newSlide.classList.add('settled');

    setTimeout(() => {
        if (currentSettled && currentSettled.parentNode === container) {
            container.removeChild(currentSettled);
        }
    }, 200);
}

// --- Tooltips & Dropdowns & Toasts ---
function openDropdown(triggerEl, taskId) {
    dropdownTargetId = taskId;
    const rect = triggerEl.getBoundingClientRect();

    els.taskDropdown.style.display = 'block';

    // Position
    let top = rect.bottom + 4;
    let left = rect.right - els.taskDropdown.offsetWidth;

    // Flip if needed
    if (top + 120 > window.innerHeight) top = rect.top - 120 - 4;

    els.taskDropdown.style.top = top + 'px';
    els.taskDropdown.style.left = left + 'px';

    // animate in
    requestAnimationFrame(() => {
        els.taskDropdown.classList.add('show');
    });
}
function closeDropdown() {
    els.taskDropdown.classList.remove('show');
    setTimeout(() => {
        els.taskDropdown.style.display = 'none';
        dropdownTargetId = null;
    }, 150);
}

function showToast(msg, actionText) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <svg class="toast-icon success" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        <span class="toast-msg">${msg}</span>
        ${actionText ? `<button class="toast-undo">${actionText}</button>` : ''}
    `;

    if (actionText === 'undo') {
        toast.querySelector('.toast-undo').addEventListener('click', () => {
            undoDelete();
            closeToast(toast);
        });
    }

    els.toastContainer.appendChild(toast);

    setTimeout(() => {
        if (document.body.contains(toast)) closeToast(toast);
    }, 5000);
}

function closeToast(toastEl) {
    toastEl.classList.add('toast-exit');
    setTimeout(() => {
        if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
    }, 200);
}
function hideToast() {
    // immediately hide the first toast
    if (els.toastContainer.firstChild) {
        closeToast(els.toastContainer.firstChild);
    }
}

// Utils
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// DOM Ready
document.addEventListener("DOMContentLoaded", init);

// --- Drag and Drop ---
let draggedTaskId = null;
let draggedElement = null;

function setupDragAndDrop() {
    els.activeList.addEventListener('dragstart', (e) => {
        if (!e.target.classList.contains('task-card')) return;

        draggedTaskId = e.target.dataset.id;
        draggedElement = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', draggedTaskId);
        }
    });

    els.activeList.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';

        const card = e.target.closest('.task-card');
        if (card && card !== draggedElement && !card.classList.contains('completed')) {
            const rect = card.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
                card.parentNode.insertBefore(draggedElement, card);
            } else {
                card.parentNode.insertBefore(draggedElement, card.nextSibling);
            }
        }
    });

    els.activeList.addEventListener('dragend', (e) => {
        if (draggedElement) draggedElement.classList.remove('dragging');

        const newOrderIds = Array.from(els.activeList.querySelectorAll('.task-card')).map(el => el.dataset.id);

        const sortedActive = [];
        const nonActive = state.tasks.filter(t => t.isCompleted);

        newOrderIds.forEach((id, index) => {
            const task = state.tasks.find(t => t.id === id);
            if (task) {
                task.order = index;
                sortedActive.push(task);
            }
        });

        state.tasks = [...sortedActive, ...nonActive];
        saveData();

        draggedElement = null;
        draggedTaskId = null;
    });
}
