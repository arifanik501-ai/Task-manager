const STORAGE_KEY = "hisabnikash_state_v1";
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CATEGORY_COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0", "#00BCD4", "#8BC34A", "#E91E63", "#795548", "#3F51B5", "#009688", "#FFC107", "#607D8B", "#673AB7", "#CDDC39"];
const THEMES = {
  royal: { primary: "#7C3AED", secondary: "#EC4899", accent: "#F97316" },
  ocean: { primary: "#3B82F6", secondary: "#06B6D4", accent: "#6366F1" },
  emerald: { primary: "#10B981", secondary: "#34D399", accent: "#06B6D4" },
  sunset: { primary: "#F97316", secondary: "#EF4444", accent: "#F59E0B" },
  gold: { primary: "#F59E0B", secondary: "#EAB308", accent: "#F97316" },
  rose: { primary: "#EC4899", secondary: "#F43F5E", accent: "#7C3AED" }
};

const ICON_PATHS = {
  home: '<path d="M5 10.5 12 4l7 6.5V20a1 1 0 0 1-1 1h-4v-6h-4v6H6a1 1 0 0 1-1-1z"/>',
  history: '<path d="M5 5h14M5 12h14M5 19h14M8 5v14"/>',
  add: '<path d="M12 5v14M5 12h14"/>',
  chart: '<path d="M4 19h16M7 16V9M12 16V5M17 16v-8"/>',
  settings: '<path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/><path d="M3 12h2m14 0h2M12 3v2m0 14v2m6.4-15.4-1.4 1.4M7 17l-1.4 1.4m0-12.8L7 7m10 10 1.4 1.4"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2M8 19h8"/>',
  bell: '<path d="M18 16H6l1.4-2V10a4.6 4.6 0 0 1 9.2 0v4z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  moon: '<path d="M20 14.2A7.5 7.5 0 0 1 9.8 4a8 8 0 1 0 10.2 10.2Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  save: '<path d="M5 5h12l2 2v12H5z"/><path d="M8 5v6h8V5M8 19v-5h8v5"/>',
  file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  print: '<path d="M7 8V3h10v5M7 17H5v-6h14v6h-2"/><path d="M7 14h10v7H7z"/>',
  backspace: '<path d="M20 6H9l-5 6 5 6h11z"/><path d="m12 10 4 4m0-4-4 4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  empty: '<path d="M5 7h14v12H5z"/><path d="M8 7a4 4 0 0 1 8 0M9 13h6"/>',
  food: '<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M16 3c2 2 3 4.2 3 7 0 2.2-1.2 4-3 4zM16 14v7"/>',
  groceries: '<path d="M6 7h14l-2 10H8z"/><path d="M6 7 5 4H2M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>',
  transport: '<path d="M6 5h12l2 6v7H4v-7z"/><path d="M7 15h.01M17 15h.01M6 11h12M8 18v2m8-2v2"/>',
  rent: '<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10M10 20v-6h4v6"/>',
  electricity: '<path d="M13 2 5 13h6l-1 9 9-13h-6z"/>',
  water: '<path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11Z"/>',
  mobile: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',
  medicine: '<path d="M10 21 21 10a4 4 0 0 0-6-6L4 15a4 4 0 0 0 6 6Z"/><path d="m8 11 5 5"/>',
  clothing: '<path d="M8 4 4 7l3 4 2-1v11h6V10l2 1 3-4-4-3-2 3h-4z"/>',
  education: '<path d="m3 8 9-4 9 4-9 4z"/><path d="M7 10v5c2.8 2 7.2 2 10 0v-5"/>',
  entertainment: '<path d="M6 8h12l-1 10H7z"/><path d="M8 8l1-3m3 3 1-3m3 3 1-3M9 14h6"/>',
  gifts: '<path d="M4 10h16v11H4zM3 7h18v3H3z"/><path d="M12 7v14M8 7c-2-2-.5-5 4 0m4 0c2-2 .5-5-4 0"/>',
  family: '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M3 21a5 5 0 0 1 10 0M11 21a5 5 0 0 1 10 0"/>',
  savings: '<path d="M4 9h16v10H4z"/><path d="M12 9V5m-5 4V6h10v3M9 14h6"/>',
  others: '<path d="M14 7 7 14l3 3 7-7"/><path d="m15 6 3-3 3 3-3 3zM4 20l3-6 3 3z"/>'
};

function svgIcon(id, className = "ui-icon") {
  const path = ICON_PATHS[id] || ICON_PATHS.others;
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
}

const CATEGORIES = [
  { id: "food", name: "Food & Meals", short: "Food" },
  { id: "groceries", name: "Groceries", short: "Groc" },
  { id: "transport", name: "Transport", short: "Trans" },
  { id: "rent", name: "Rent", short: "Rent" },
  { id: "electricity", name: "Electricity Bill", short: "Bill" },
  { id: "water", name: "Water Bill", short: "Water" },
  { id: "mobile", name: "Mobile / Internet", short: "Mob" },
  { id: "medicine", name: "Medicine / Health", short: "Med" },
  { id: "clothing", name: "Clothing", short: "Clth" },
  { id: "education", name: "Education", short: "Edu" },
  { id: "entertainment", name: "Entertainment", short: "Fun" },
  { id: "gifts", name: "Gifts", short: "Gift" },
  { id: "family", name: "Family", short: "Fam" },
  { id: "savings", name: "Savings / Deposit", short: "Save" },
  { id: "others", name: "Miscellaneous / Others", short: "Other" }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const defaultState = {
  budgets: {},
  expenses: [],
  settings: {
    currency: "৳",
    darkMode: true,
    reminder: false,
    reminderTime: "22:00",
    language: "en",
    accentTheme: "royal"
  },
  activeMonth: monthKey(new Date())
};

let state = loadState();
let selectedCategory = CATEGORIES[0].id;
let currentExpenseId = null;
let pendingDelete = null;
let toastTimer = null;
let undoTimer = null;
let calcExpression = "";
let amountInputRaw = "";

document.addEventListener("DOMContentLoaded", init);

function init() {
  hydrateSvgIcons();
  bindNavigation();
  bindSetup();
  bindExpenseForm();
  bindFilters();
  bindSettings();
  bindCalculator();
  bindCloudSync();
  renderCategories();
  applyTheme();
  setCurrentDateTime();

  setTimeout(() => {
    $("#splash-screen").classList.add("hidden");
    if (hasCurrentBudget()) {
      $("#main-app").classList.remove("hidden");
      renderAll();
    } else {
      $("#setup-screen").classList.remove("hidden");
    }
    hydrateFromCloud();
  }, 2000);

  registerServiceWorker();
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  // Capture controller presence BEFORE registering so we only reload on
  // genuine updates, not on the first install when clients.claim() flips
  // the controller from null to the new worker.
  const hadController = !!navigator.serviceWorker.controller;

  navigator.serviceWorker.register("service-worker.js").then((registration) => {
    registration.addEventListener("updatefound", () => {
      const incoming = registration.installing;
      if (!incoming) return;
      incoming.addEventListener("statechange", () => {
        if (incoming.state === "installed" && navigator.serviceWorker.controller) {
          incoming.postMessage({ type: "SKIP_WAITING" });
        }
      });
    });
    // Periodically poll for new versions so the user does not stay on a
    // stale shell after deploys.
    setTimeout(() => registration.update().catch(() => {}), 4000);
    setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});

  if (!hadController) return;

  // When a fresh SW takes control we reload exactly once so the new
  // HTML/CSS/JS is shown without the user pulling-to-refresh. Skipped
  // on the very first install (hadController === false) to avoid a
  // jarring reload on the user's first visit.
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    showToast("Updating to latest version\u2026");
    setTimeout(() => window.location.reload(), 600);
  });
}

function hydrateSvgIcons() {
  $$("[data-icon]").forEach((element) => {
    element.outerHTML = svgIcon(element.dataset.icon, element.className || "ui-icon");
  });
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return normalizeState(saved);
  } catch {
    return structuredClone(defaultState);
  }
}

function normalizeState(raw) {
  return {
    ...defaultState,
    ...raw,
    budgets: raw?.budgets || {},
    expenses: Array.isArray(raw?.expenses) ? raw.expenses : [],
    settings: { ...defaultState.settings, ...(raw?.settings || {}) },
    activeMonth: monthKey(new Date()),
    lastUpdatedAt: typeof raw?.lastUpdatedAt === "number" ? raw.lastUpdatedAt : 0
  };
}

function saveState() {
  state.activeMonth = monthKey(new Date());
  state.lastUpdatedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  // Every save fires an immediate cloud write (debounce bypassed) so
  // adding an expense or updating the budget propagates instantly.
  if (window.cloudSync) {
    if (typeof window.cloudSync.pushNow === "function") {
      window.cloudSync.pushNow(state);
    } else if (typeof window.cloudSync.push === "function") {
      window.cloudSync.push(state);
    }
  }
}

function replaceStateFromCloud(remote) {
  if (!remote || typeof remote !== "object") return;
  // Drop any in-flight debounced push first: pendingPush still holds a
  // reference to the *old* state object and would overwrite the newer
  // remote data we are about to install if we let its timer fire.
  if (window.cloudSync && typeof window.cloudSync.cancelPending === "function") {
    window.cloudSync.cancelPending();
  }
  const cleaned = normalizeState(remote);
  delete cleaned._origin;
  delete cleaned._updatedAt;
  state = cleaned;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  applyTheme();
  renderAll();
  if (!hasCurrentBudget()) {
    $("#main-app").classList.add("hidden");
    $("#setup-screen").classList.remove("hidden");
  } else {
    $("#setup-screen").classList.add("hidden");
    $("#main-app").classList.remove("hidden");
  }
  syncSettingsForm();
}

async function hydrateFromCloud() {
  if (!window.cloudSync || !window.cloudSync.ready) return;
  try {
    const remote = await window.cloudSync.ready;
    if (!remote) {
      // Cloud is empty for this Sync ID — seed it with the local state
      // so future devices using the same ID pull the existing data.
      const hasAnyLocal = (state.expenses?.length || 0) > 0 || Object.keys(state.budgets || {}).length > 0;
      if (hasAnyLocal) window.cloudSync.push(state);
      return;
    }
    const remoteTs = Number(remote.lastUpdatedAt) || 0;
    const localTs = Number(state.lastUpdatedAt) || 0;
    if (remoteTs > localTs) {
      replaceStateFromCloud(remote);
    } else if (localTs > remoteTs) {
      window.cloudSync.push(state);
    }
  } catch (error) {
    console.warn("[cloud] hydrate failed", error);
  }
}

function bindCloudSync() {
  const badge = $("#cloud-status-badge");

  function applyStatus(next) {
    if (!badge) return;
    badge.dataset.status = next;
    badge.className = `cloud-status ${next}`;
    badge.textContent = formatCloudStatus(next);
  }

  if (window.cloudSync) {
    applyStatus(window.cloudSync.status());
    window.addEventListener("cloud-status-change", (event) => applyStatus(event.detail));
    window.addEventListener("cloud-state-update", (event) => {
      const remote = event.detail;
      if (!remote) return;
      const remoteTs = Number(remote.lastUpdatedAt) || 0;
      const localTs = Number(state.lastUpdatedAt) || 0;
      if (remoteTs >= localTs) replaceStateFromCloud(remote);
    });
  } else {
    applyStatus("error");
  }

  $("#sync-now")?.addEventListener("click", async () => {
    if (!window.cloudSync) {
      showToast("Cloud sync not ready.", "warning");
      return;
    }
    const button = $("#sync-now");
    if (button.dataset.busy === "1") return;
    button.dataset.busy = "1";
    button.disabled = true;
    // Snapshot the local timestamp BEFORE syncNow runs. pullNow inside
    // syncNow synchronously dispatches cloud-state-update, which the
    // global listener uses to replace state — so reading
    // state.lastUpdatedAt afterwards would always equal the remote
    // timestamp and the "newer pulled" branch could never fire.
    const localTsBefore = Number(state.lastUpdatedAt) || 0;
    try {
      const remote = await window.cloudSync.syncNow(state);
      const remoteTs = Number(remote?.lastUpdatedAt) || 0;
      if (remote && remoteTs > localTsBefore) {
        replaceStateFromCloud(remote);
        showToast("Synced. Newer data pulled from cloud.");
      } else {
        showToast("All data synced!");
      }
    } catch (error) {
      console.warn("[cloud] sync now failed", error);
      showToast("Sync failed. Check your connection.", "warning");
    } finally {
      button.dataset.busy = "0";
      button.disabled = false;
    }
  });
}

function formatCloudStatus(s) {
  if (s === "connecting") return "Connecting\u2026";
  if (s === "syncing") return "Syncing\u2026";
  if (s === "online") return "Synced";
  if (s === "error") return "Offline";
  return s || "Idle";
}

function syncSettingsForm() {
  const budget = currentBudget();
  if ($("#settings-budget")) $("#settings-budget").value = budget.totalBudget || "";
  if ($("#settings-currency")) $("#settings-currency").value = state.settings.currency || "\u09F3";
  if ($("#settings-dark")) $("#settings-dark").checked = !!state.settings.darkMode;
  if ($("#settings-reminder")) $("#settings-reminder").checked = !!state.settings.reminder;
  if ($("#settings-reminder-time")) $("#settings-reminder-time").value = state.settings.reminderTime || "22:00";
  if ($("#settings-language")) $("#settings-language").value = state.settings.language || "en";
}

function hasCurrentBudget() {
  return Number(currentBudget().totalBudget) > 0;
}

function currentBudget() {
  const key = monthKey(new Date());
  if (!state.budgets[key]) {
    state.budgets[key] = {
      month: monthLabelFromKey(key),
      totalBudget: 0,
      createdDate: toDateInput(new Date())
    };
  }
  return state.budgets[key];
}

function setBudget(amount, carryForward = false) {
  const key = monthKey(new Date());
  const previousRemaining = carryForward ? getPreviousMonthRemaining() : 0;
  state.budgets[key] = {
    month: monthLabelFromKey(key),
    totalBudget: Math.max(0, Number(amount) || 0) + previousRemaining,
    createdDate: toDateInput(new Date())
  };
  saveState();
}

function getPreviousMonthRemaining() {
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const key = monthKey(previous);
  const budget = Number(state.budgets[key]?.totalBudget) || 0;
  const spent = getExpensesForMonth(key).reduce((sum, expense) => sum + expense.amount, 0);
  return Math.max(0, budget - spent);
}

function bindSetup() {
  $$("[data-budget-chip]").forEach((button) => {
    button.addEventListener("click", () => {
      $("#setup-budget").value = button.dataset.budgetChip;
      $("#setup-budget").focus();
    });
  });

  $("#start-tracking").addEventListener("click", () => {
    const amount = Number($("#setup-budget").value);
    if (!amount || amount <= 0) {
      showToast("Please enter a valid monthly budget.", "warning");
      return;
    }
    setBudget(amount, $("#setup-carry-forward").checked);
    $("#setup-screen").classList.add("hidden");
    $("#main-app").classList.remove("hidden");
    renderAll();
    showToast("Budget set successfully!");
  });
}

function bindNavigation() {
  $$(".nav-button").forEach((button) => {
    button.addEventListener("click", () => switchPage(button.dataset.target));
  });

  $("#theme-toggle").addEventListener("click", () => {
    state.settings.darkMode = !state.settings.darkMode;
    saveState();
    applyTheme();
  });

  $$("[data-open-settings]").forEach((button) => {
    button.addEventListener("click", () => {
      switchPage("more");
      $("#settings-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  $$(".menu-card[data-panel]").forEach((button) => {
    button.addEventListener("click", () => {
      $(`#${button.dataset.panel}`).scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  $("#open-mini-calculator").addEventListener("click", () => {
    switchPage("calculator");
  });

  $$(".quick-actions [data-quick-target]").forEach((button) => {
    button.addEventListener("click", () => {
      switchPage(button.dataset.quickTarget);
      if (button.dataset.panelTarget) {
        $(`#${button.dataset.panelTarget}`).scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  $("#alert-bell").addEventListener("click", () => {
    const alert = $("#budget-alert");
    alert.classList.toggle("hidden");
  });
}

function switchPage(page) {
  $$(".tab-page").forEach((tab) => tab.classList.toggle("active", tab.dataset.page === page));
  $$(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.target === page));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (page === "add" && !$("#editing-expense-id").value) setCurrentDateTime();
  syncAmountRawFromInput();
  renderAll();
}

function bindExpenseForm() {
  $("#expense-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number(amountInputRaw || $("#expense-amount").value);
    if (!amount || amount <= 0) {
      showToast("Enter a valid amount.", "warning");
      return;
    }

    const category = getCategory(selectedCategory);
    const expense = {
      id: $("#editing-expense-id").value || createId(),
      amount,
      category: category.id,
      categoryName: category.name,
      description: $("#expense-description").value.trim(),
      date: $("#expense-date").value,
      time: $("#expense-time").value,
      createdAt: new Date(`${$("#expense-date").value}T${$("#expense-time").value || "00:00"}`).toISOString()
    };

    const editingId = $("#editing-expense-id").value;
    if (editingId) {
      state.expenses = state.expenses.map((item) => item.id === editingId ? expense : item);
      showToast("Expense updated successfully!");
    } else {
      state.expenses.push(expense);
      showToast("Expense Added Successfully!");
      showSuccessOverlay(expense);
    }

    saveState();
    resetExpenseForm();
    renderAll();
    checkBudgetAlerts();
    switchPage("home");
  });

  $("#cancel-edit").addEventListener("click", resetExpenseForm);
  $("#close-expense-modal").addEventListener("click", closeExpenseModal);
  $("#modal-edit-expense").addEventListener("click", () => {
    if (currentExpenseId) startEdit(currentExpenseId);
  });
  $("#modal-delete-expense").addEventListener("click", () => {
    if (currentExpenseId) requestDelete(currentExpenseId);
  });
  $("#confirm-cancel").addEventListener("click", hideConfirm);
  $("#confirm-action").addEventListener("click", () => {
    if (pendingDelete?.type === "expense") {
      const { id } = pendingDelete;
      $("#confirm-modal").classList.add("hidden");
      deleteExpense(id);
      return;
    }
    if (pendingDelete?.type === "reset") resetCurrentMonth();
    hideConfirm();
  });
  $("#undo-toast").addEventListener("click", undoDelete);

  $("#expense-amount").addEventListener("input", () => {
    amountInputRaw = $("#expense-amount").value;
    updateAmountPreview();
  });
  $("#amount-keypad").addEventListener("click", (event) => {
    const button = event.target.closest("[data-amount-key]");
    if (!button) return;
    handleAmountKey(button.dataset.amountKey);
  });
}

function bindFilters() {
  $("#filter-toggle").addEventListener("click", () => {
    const panel = $("#filters-panel");
    panel.classList.toggle("hidden");
    $("#filter-toggle").setAttribute("aria-expanded", String(!panel.classList.contains("hidden")));
  });

  $("#filter-close").addEventListener("click", () => {
    $("#filters-panel").classList.add("hidden");
    $("#filter-toggle").setAttribute("aria-expanded", "false");
  });

  ["search-expense", "filter-category", "filter-from", "filter-to", "filter-min", "filter-max", "sort-expenses"].forEach((id) => {
    $(`#${id}`).addEventListener("input", renderHistory);
  });

  $("#report-month").addEventListener("input", renderReports);
}

function bindSettings() {
  $("#save-settings").addEventListener("click", () => {
    const budget = Number($("#settings-budget").value);
    if (budget > 0) currentBudget().totalBudget = budget;
    state.settings.currency = $("#settings-currency").value.trim() || "৳";
    state.settings.darkMode = $("#settings-dark").checked;
    state.settings.reminder = $("#settings-reminder").checked;
    state.settings.reminderTime = $("#settings-reminder-time").value || "22:00";
    state.settings.language = $("#settings-language").value;
    state.settings.accentTheme = $(".theme-picker button.active")?.dataset.themePick || state.settings.accentTheme;
    saveState();
    applyTheme();
    renderAll();
    requestReminderPermission();
    showToast("Settings saved successfully!");
  });

  $("#settings-dark").addEventListener("change", () => {
    state.settings.darkMode = $("#settings-dark").checked;
    saveState();
    applyTheme();
  });

  $$(".theme-picker button").forEach((button) => {
    button.addEventListener("click", () => {
      state.settings.accentTheme = button.dataset.themePick;
      saveState();
      applyTheme();
    });
  });

  $("#reset-month").addEventListener("click", () => {
    pendingDelete = { type: "reset" };
    $("#confirm-title").textContent = "Reset monthly data?";
    $("#confirm-copy").textContent = "This will clear all expenses for the current month and reset the budget.";
    $("#confirm-action").textContent = "Reset";
    $("#confirm-modal").classList.remove("hidden");
  });

  $("#export-pdf").addEventListener("click", exportPdf);
}

function bindCalculator() {
  const buttons = ["AC", "C", "⌫", "÷", "7", "8", "9", "×", "4", "5", "6", "-", "1", "2", "3", "+", "%", "0", ".", "="];
  $("#calculator-grid").innerHTML = buttons.map((label) => {
    const operator = ["÷", "×", "-", "+", "%"].includes(label) ? " operator" : "";
    const equals = label === "=" ? " equals" : "";
    return `<button class="calc-button${operator}${equals}" type="button" data-calc="${label}">${label}</button>`;
  }).join("");

  $("#calculator-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-calc]");
    if (!button) return;
    handleCalcInput(button.dataset.calc);
  });

  $("#calculator-add-result").addEventListener("click", () => {
    const result = Number($("#calc-result").textContent.replaceAll(",", ""));
    if (!Number.isFinite(result)) {
      showToast("Calculator result is not valid.", "warning");
      return;
    }
    resetExpenseForm();
    $("#expense-amount").value = roundMoney(result);
    switchPage("add");
  });
}

function handleCalcInput(label) {
  if (label === "AC") calcExpression = "";
  else if (label === "C") calcExpression = "";
  else if (label === "⌫") calcExpression = calcExpression.slice(0, -1);
  else if (label === "=") calcExpression = String(evaluateExpression(calcExpression));
  else calcExpression += label;

  const result = evaluateExpression(calcExpression);
  $("#calc-expression").textContent = calcExpression || "0";
  $("#calc-result").textContent = Number.isFinite(result) ? formatPlain(result) : "0";
}

function handleAmountKey(key) {
  const input = $("#expense-amount");
  if (key === "done") {
    input.blur();
    return;
  }
  if (key === "clear") amountInputRaw = "";
  else if (key === "back") amountInputRaw = amountInputRaw.slice(0, -1);
  else if (key === "." && amountInputRaw.includes(".")) return;
  else if (key === "." && !amountInputRaw) amountInputRaw = "0.";
  else amountInputRaw += key;
  input.value = amountInputRaw;
  updateAmountPreview();
}

function updateAmountPreview() {
  const amount = Number(amountInputRaw || $("#expense-amount").value) || 0;
  $("#amount-preview").textContent = money(amount);
}

function syncAmountRawFromInput() {
  amountInputRaw = $("#expense-amount").value;
}

function evaluateExpression(expression) {
  if (!expression) return 0;
  const normalized = expression.replaceAll("×", "*").replaceAll("÷", "/").replaceAll("%", "/100");
  if (!/^[\d+\-*/.() /]+$/.test(normalized)) return 0;
  try {
    const value = Function(`"use strict"; return (${normalized})`)();
    return Number.isFinite(value) ? roundMoney(value) : 0;
  } catch {
    return 0;
  }
}

function renderAll() {
  syncInputs();
  renderDashboard();
  renderHistory();
  renderReports();
}

function syncInputs() {
  const budget = currentBudget();
  const currentMonth = monthKey(new Date());
  $("#current-month-label").textContent = monthLabelFromKey(currentMonth);
  $("#balance-month").textContent = monthLabelFromKey(currentMonth);
  $("#time-greeting").textContent = greeting();
  if (!$("#report-month").value) $("#report-month").value = currentMonth;
  $("#setup-currency").textContent = state.settings.currency;
  $("#expense-currency").textContent = state.settings.currency;
  $("#settings-currency-prefix").textContent = state.settings.currency;
  $("#settings-budget").value = budget.totalBudget || "";
  $("#settings-currency").value = state.settings.currency;
  $("#settings-dark").checked = state.settings.darkMode;
  $("#settings-reminder").checked = state.settings.reminder;
  $("#settings-reminder-time").value = state.settings.reminderTime;
  $("#settings-language").value = state.settings.language;
  $$(".theme-picker button").forEach((button) => button.classList.toggle("active", button.dataset.themePick === state.settings.accentTheme));
  updateAmountPreview();
}

function renderDashboard() {
  const summary = getMonthSummary(monthKey(new Date()));
  const today = toDateInput(new Date());
  const todayExpenses = summary.expenses.filter((expense) => expense.date === today);
  const todaySpent = sumExpenses(todayExpenses);
  const spentPercent = summary.budget > 0 ? Math.min(100, (summary.spent / summary.budget) * 100) : 0;
  const balanceCard = $("#balance-card");

  balanceCard.classList.toggle("warning", spentPercent >= 50 && spentPercent < 75);
  balanceCard.classList.toggle("danger", spentPercent >= 75);
  $("#remaining-balance").textContent = money(summary.remaining);
  $("#spent-percent").textContent = `${Math.round(spentPercent)}% spent`;
  $("#total-budget").textContent = money(summary.budget);
  $("#total-spent").textContent = money(summary.spent);
  $("#balance-left").textContent = money(summary.remaining);
  $("#today-total").textContent = money(todaySpent);
  $("#daily-average").textContent = money(summary.dailyAverage);
  $("#highest-expense").textContent = money(summary.highestExpense?.amount || 0);
  $("#top-category").textContent = summary.topCategory ? summary.topCategory.short : "—";
  $("#days-left").textContent = daysRemainingInMonth();
  $("#mini-chart-total").textContent = money(summary.spent);
  renderBudgetAlert(summary, spentPercent);
  renderMiniChart(summary);

  const circumference = 365;
  $("#budget-progress").style.strokeDashoffset = String(circumference - (spentPercent / 100) * circumference);
  renderExpenseList($("#today-expenses"), todayExpenses.sort(byNewest).slice(0, 5), true);
}

function renderHistory() {
  const expenses = getFilteredExpenses();
  $("#history-total").textContent = money(sumExpenses(expenses));
  const grouped = groupByDate(expenses);
  const container = $("#history-groups");

  if (!expenses.length) {
    container.innerHTML = `<div class="empty-state">${svgIcon("empty", "ui-icon empty-icon")}No expenses found.</div>`;
    return;
  }

  container.innerHTML = Object.entries(grouped).map(([date, items]) => `
    <section class="history-date-group">
      <div class="date-divider">
        <span>${formatDateHeading(date)}</span>
        <strong>Total: ${money(sumExpenses(items))}</strong>
      </div>
      ${items.map(expenseCardHtml).join("")}
    </section>
  `).join("");
  bindExpenseCards(container);
}

function renderReports() {
  const selectedMonth = $("#report-month").value || monthKey(new Date());
  const summary = getMonthSummary(selectedMonth);
  $("#report-budget").textContent = money(summary.budget);
  $("#report-spent").textContent = money(summary.spent);
  $("#report-remaining").textContent = money(summary.remaining);
  $("#report-average").textContent = money(summary.dailyAverage);
  $("#category-count").textContent = `${summary.categoryRows.length} categories`;
  $("#highest-day").textContent = summary.highestDay ? `Top day: ${shortDate(summary.highestDay.date)}` : "Top day: —";
  $("#month-comparison").textContent = monthComparison(selectedMonth, summary.spent);
  renderDonut(summary);
  renderDailyBars(summary);
  renderLineChart(summary);
  renderTopExpenses(summary);
}

function renderCategories() {
  $("#category-grid").innerHTML = CATEGORIES.map((category) => `
    <button class="category-pill${category.id === selectedCategory ? " active" : ""}" type="button" data-category="${category.id}">
      <span class="cat-icon">${svgIcon(category.id)}</span>
      <small>${category.short}</small>
    </button>
  `).join("");

  $("#filter-category").innerHTML = `<option value="">All categories</option>${CATEGORIES.map((category) => `<option value="${category.id}">${category.name}</option>`).join("")}`;

  $("#category-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    selectedCategory = button.dataset.category;
    $$(".category-pill").forEach((item) => item.classList.toggle("active", item.dataset.category === selectedCategory));
    $("#selected-category-name").textContent = getCategory(selectedCategory).name;
  });
}

function renderExpenseList(container, expenses, compact = false) {
  if (!expenses.length) {
    container.innerHTML = `<div class="empty-state">${svgIcon("empty", "ui-icon empty-icon")}${compact ? "No expenses today." : "No expenses added yet."}</div>`;
    return;
  }
  container.innerHTML = expenses.map(expenseCardHtml).join("");
  bindExpenseCards(container);
}

function expenseCardHtml(expense) {
  return `
    <article class="expense-card" data-expense-id="${expense.id}" tabindex="0">
      <div class="expense-icon">${svgIcon(expense.category)}</div>
      <div class="expense-main">
        <strong>${escapeHtml(expense.categoryName)}</strong>
        <span>${escapeHtml(expense.description || "No description")}</span>
        <small>${formatDateTime(expense.date, expense.time)}</small>
      </div>
      <div class="expense-amount">${money(expense.amount)}</div>
    </article>
  `;
}

function bindExpenseCards(container) {
  container.querySelectorAll(".expense-card").forEach((card) => {
    let startX = 0;
    card.addEventListener("click", () => openExpenseModal(card.dataset.expenseId));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openExpenseModal(card.dataset.expenseId);
    });
    card.addEventListener("touchstart", (event) => {
      startX = event.touches[0].clientX;
    }, { passive: true });
    card.addEventListener("touchmove", (event) => {
      const diff = event.touches[0].clientX - startX;
      card.classList.toggle("swiping-left", diff < -45);
      card.classList.toggle("swiping-right", diff > 45);
    }, { passive: true });
    card.addEventListener("touchend", (event) => {
      const diff = event.changedTouches[0].clientX - startX;
      card.classList.remove("swiping-left", "swiping-right");
      if (diff < -80) requestDelete(card.dataset.expenseId);
      if (diff > 80) duplicateExpense(card.dataset.expenseId);
    });
  });
}

function openExpenseModal(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) return;
  currentExpenseId = id;
  $("#expense-details").innerHTML = `
    <div class="detail-grid">
      <div><span>Category</span><strong class="detail-category">${svgIcon(expense.category)} ${escapeHtml(expense.categoryName)}</strong></div>
      <div><span>Amount</span><strong>${money(expense.amount)}</strong></div>
      <div><span>Description</span><strong>${escapeHtml(expense.description || "No description")}</strong></div>
      <div><span>Date</span><strong>${formatDateHeading(expense.date)}</strong></div>
      <div><span>Time</span><strong>${formatTime(expense.time)}</strong></div>
    </div>
  `;
  $("#expense-modal").classList.remove("hidden");
}

function closeExpenseModal() {
  currentExpenseId = null;
  $("#expense-modal").classList.add("hidden");
}

function startEdit(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) return;
  closeExpenseModal();
  selectedCategory = expense.category;
  $("#editing-expense-id").value = expense.id;
  $("#expense-amount").value = expense.amount;
  amountInputRaw = String(expense.amount);
  updateAmountPreview();
  $("#expense-description").value = expense.description;
  $("#expense-date").value = expense.date;
  $("#expense-time").value = expense.time;
  $("#expense-form-mode").textContent = "Edit Entry";
  $("#save-expense").innerHTML = `${svgIcon("save", "ui-icon")}Update Expense`;
  $("#cancel-edit").classList.remove("hidden");
  $("#selected-category-name").textContent = getCategory(selectedCategory).name;
  $$(".category-pill").forEach((item) => item.classList.toggle("active", item.dataset.category === selectedCategory));
  switchPage("add");
}

function resetExpenseForm() {
  $("#expense-form").reset();
  amountInputRaw = "";
  $("#editing-expense-id").value = "";
  $("#expense-form-mode").textContent = "New Entry";
  $("#save-expense").innerHTML = `${svgIcon("save", "ui-icon")}Save Expense`;
  $("#cancel-edit").classList.add("hidden");
  selectedCategory = CATEGORIES[0].id;
  $("#selected-category-name").textContent = CATEGORIES[0].name;
  $$(".category-pill").forEach((item) => item.classList.toggle("active", item.dataset.category === selectedCategory));
  setCurrentDateTime();
}

function requestDelete(id) {
  closeExpenseModal();
  pendingDelete = { type: "expense", id };
  $("#confirm-title").textContent = "Delete this expense?";
  $("#confirm-copy").textContent = "The amount will be added back to your remaining balance.";
  $("#confirm-action").textContent = "Delete";
  $("#confirm-modal").classList.remove("hidden");
}

function deleteExpense(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) return;
  state.expenses = state.expenses.filter((item) => item.id !== id);
  saveState();
  renderAll();
  pendingDelete = { type: "undo", expense };
  $("#undo-toast").classList.remove("hidden");
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    $("#undo-toast").classList.add("hidden");
    pendingDelete = null;
  }, 5000);
}

function duplicateExpense(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) return;
  const copy = {
    ...expense,
    id: createId(),
    date: toDateInput(new Date()),
    time: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
    createdAt: new Date().toISOString()
  };
  state.expenses.push(copy);
  saveState();
  renderAll();
  showToast("Expense duplicated.");
}

function undoDelete() {
  if (pendingDelete?.type !== "undo") return;
  state.expenses.push(pendingDelete.expense);
  saveState();
  pendingDelete = null;
  $("#undo-toast").classList.add("hidden");
  renderAll();
  showToast("Expense restored.");
}

function hideConfirm() {
  $("#confirm-modal").classList.add("hidden");
  pendingDelete = null;
}

function resetCurrentMonth() {
  const key = monthKey(new Date());
  state.expenses = state.expenses.filter((expense) => expense.date.slice(0, 7) !== key);
  state.budgets[key] = {
    month: monthLabelFromKey(key),
    totalBudget: 0,
    createdDate: toDateInput(new Date())
  };
  saveState();
  $("#main-app").classList.add("hidden");
  $("#setup-screen").classList.remove("hidden");
  showToast("Monthly data reset.");
}

function getMonthSummary(key) {
  const expenses = getExpensesForMonth(key).sort(byNewest);
  const budget = Number(state.budgets[key]?.totalBudget) || 0;
  const spent = sumExpenses(expenses);
  const daysInMonth = getDaysInMonth(key);
  const today = new Date();
  const isCurrent = key === monthKey(today);
  const elapsed = isCurrent ? today.getDate() : daysInMonth;
  const categoryMap = new Map();
  const dailyMap = new Map();

  expenses.forEach((expense) => {
    const category = getCategory(expense.category);
    const existing = categoryMap.get(expense.category) || { ...category, total: 0, count: 0 };
    existing.total += expense.amount;
    existing.count += 1;
    categoryMap.set(expense.category, existing);
    dailyMap.set(expense.date, (dailyMap.get(expense.date) || 0) + expense.amount);
  });

  const categoryRows = Array.from(categoryMap.values()).sort((a, b) => b.total - a.total);
  const dailyRows = Array.from(dailyMap.entries()).map(([date, total]) => ({ date, total })).sort((a, b) => a.date.localeCompare(b.date));
  return {
    key,
    budget,
    expenses,
    spent,
    remaining: budget - spent,
    dailyAverage: elapsed ? spent / elapsed : 0,
    highestExpense: expenses.slice().sort((a, b) => b.amount - a.amount)[0],
    highestDay: dailyRows.slice().sort((a, b) => b.total - a.total)[0],
    topCategory: categoryRows[0],
    categoryRows,
    dailyRows,
    daysInMonth
  };
}

function getFilteredExpenses() {
  let expenses = getExpensesForMonth(monthKey(new Date()));
  const search = $("#search-expense").value.trim().toLowerCase();
  const category = $("#filter-category").value;
  const from = $("#filter-from").value;
  const to = $("#filter-to").value;
  const min = Number($("#filter-min").value);
  const max = Number($("#filter-max").value);
  const sort = $("#sort-expenses").value;

  if (search) {
    expenses = expenses.filter((expense) =>
      expense.categoryName.toLowerCase().includes(search) ||
      expense.description.toLowerCase().includes(search)
    );
  }
  if (category) expenses = expenses.filter((expense) => expense.category === category);
  if (from) expenses = expenses.filter((expense) => expense.date >= from);
  if (to) expenses = expenses.filter((expense) => expense.date <= to);
  if (min) expenses = expenses.filter((expense) => expense.amount >= min);
  if (max) expenses = expenses.filter((expense) => expense.amount <= max);

  return expenses.sort((a, b) => {
    if (sort === "oldest") return byOldest(a, b);
    if (sort === "highest") return b.amount - a.amount;
    if (sort === "lowest") return a.amount - b.amount;
    return byNewest(a, b);
  });
}

function renderDonut(summary) {
  if (!summary.categoryRows.length) {
    $("#donut-chart").style.background = `conic-gradient(var(--line) 0 100%)`;
    $("#category-breakdown").innerHTML = `<div class="empty-state">No category data yet.</div>`;
    return;
  }

  let start = 0;
  const segments = summary.categoryRows.map((row, index) => {
    const percent = summary.spent ? (row.total / summary.spent) * 100 : 0;
    const end = start + percent;
    const segment = `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} ${start}% ${end}%`;
    start = end;
    return segment;
  });
  $("#donut-chart").style.background = `conic-gradient(${segments.join(", ")})`;
  $("#category-breakdown").innerHTML = summary.categoryRows.map((row, index) => {
    const percent = summary.budget ? Math.min(100, (row.total / summary.budget) * 100) : 0;
    return `
      <button class="category-row" data-filter-category="${row.id}">
        <div class="category-row-head">
          <strong class="category-row-title">${svgIcon(row.id)} ${row.name}</strong>
          <strong>${money(row.total)}</strong>
        </div>
        <small>${Math.round(percent)}% of budget • ${row.count} transaction${row.count === 1 ? "" : "s"}</small>
        <div class="progress-bar"><span style="width:${percent}%; background:${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}"></span></div>
      </button>
    `;
  }).join("");

  $("#category-breakdown").querySelectorAll("[data-filter-category]").forEach((button) => {
    button.addEventListener("click", () => {
      $("#filter-category").value = button.dataset.filterCategory;
      switchPage("history");
    });
  });
}

function renderDailyBars(summary) {
  const max = Math.max(...summary.dailyRows.map((row) => row.total), 1);
  const days = Array.from({ length: summary.daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${summary.key}-${String(day).padStart(2, "0")}`;
    const total = summary.dailyRows.find((row) => row.date === date)?.total || 0;
    const height = total ? Math.max(8, (total / max) * 130) : 4;
    return `<div class="bar" title="${shortDate(date)}: ${money(total)}" style="height:${height}px"></div>`;
  });
  $("#daily-bar-chart").innerHTML = days.join("");
}

function renderMiniChart(summary) {
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = toDateInput(date);
    days.push({
      label: String(date.getDate()),
      total: sumExpenses(state.expenses.filter((expense) => expense.date === key))
    });
  }
  const max = Math.max(...days.map((day) => day.total), 1);
  $("#mini-spending-chart").innerHTML = days.map((day) => `
    <div>
      <span style="height:${day.total ? Math.max(10, (day.total / max) * 86) : 5}px"></span>
      <small>${day.label}</small>
    </div>
  `).join("");
}

function renderLineChart(summary) {
  const svg = $("#line-chart");
  const days = summary.daysInMonth;
  const totals = [];
  let cumulative = 0;
  for (let day = 1; day <= days; day += 1) {
    const date = `${summary.key}-${String(day).padStart(2, "0")}`;
    cumulative += summary.dailyRows.find((row) => row.date === date)?.total || 0;
    totals.push(cumulative);
  }
  const max = Math.max(...totals, summary.budget, 1);
  const points = totals.map((total, index) => {
    const x = days === 1 ? 0 : (index / (days - 1)) * 320;
    const y = 150 - (total / max) * 140;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const fillPoints = `0,160 ${points} 320,160`;
  svg.innerHTML = `
    <line class="grid-line" x1="0" x2="320" y1="20" y2="20"></line>
    <line class="grid-line" x1="0" x2="320" y1="80" y2="80"></line>
    <line class="grid-line" x1="0" x2="320" y1="140" y2="140"></line>
    <polyline points="${fillPoints}"></polyline>
    <path d="M ${points.replaceAll(" ", " L ")}"></path>
  `;
}

function renderTopExpenses(summary) {
  const top = summary.expenses.slice().sort((a, b) => b.amount - a.amount).slice(0, 3);
  renderExpenseList($("#top-expenses"), top);
}

function exportPdf() {
  const summary = getMonthSummary(monthKey(new Date()));
  const win = window.open("", "_blank");
  if (!win) {
    showToast("Allow popups to export PDF.", "warning");
    return;
  }
  win.document.write(`
    <html><head><title>HisabNikash Report</title><style>
      body{font-family:"Plus Jakarta Sans",Arial,sans-serif;padding:24px;color:#212121}
      h1{color:#4CAF50;font-family:"Times New Roman",Times,serif;text-align:center} table{width:100%;border-collapse:collapse;margin-top:18px}
      td,th{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}
      .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .summary div{padding:14px;border:1px solid #ddd;border-radius:12px}
    </style></head><body>
      <h1>HisabNikash Monthly Report - ${monthLabelFromKey(summary.key)}</h1>
      <div class="summary">
        <div><strong>Budget</strong><br>${money(summary.budget)}</div>
        <div><strong>Spent</strong><br>${money(summary.spent)}</div>
        <div><strong>Remaining</strong><br>${money(summary.remaining)}</div>
      </div>
      <table><thead><tr><th>Date</th><th>Time</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead><tbody>
      ${summary.expenses.map((expense) => `<tr><td>${expense.date}</td><td>${formatTime(expense.time)}</td><td>${escapeHtml(expense.categoryName)}</td><td>${escapeHtml(expense.description || "")}</td><td>${money(expense.amount)}</td></tr>`).join("")}
      </tbody></table>
      <script>window.print();</script>
    </body></html>
  `);
  win.document.close();
}

function checkBudgetAlerts() {
  const summary = getMonthSummary(monthKey(new Date()));
  if (!summary.budget) return;
  const percent = (summary.spent / summary.budget) * 100;
  if (percent >= 100) showToast(`You've exceeded your budget by ${money(Math.abs(summary.remaining))}!`, "danger");
  else if (percent >= 90) showToast(`Almost out of budget! Only ${money(summary.remaining)} left!`, "danger");
  else if (percent >= 75) showToast("Warning! Only 25% budget remaining!", "warning");
  else if (percent >= 50) showToast("You've spent half your budget!", "warning");
}

function renderBudgetAlert(summary, percent) {
  const alert = $("#budget-alert");
  const dot = $("#alert-dot");
  let message = "";
  if (summary.budget && percent >= 100) message = `Budget Exceeded! You're ${money(Math.abs(summary.remaining))} over budget.`;
  else if (summary.budget && percent >= 90) message = `Almost out of budget — only ${money(summary.remaining)} left.`;
  else if (summary.budget && percent >= 75) message = "Budget Warning! You have spent 75% of your budget.";
  else if (summary.budget && percent >= 50) message = "Heads up: you have spent half your budget.";
  alert.textContent = message;
  alert.classList.toggle("hidden", !message);
  dot.classList.toggle("hidden", !message);
}

function showSuccessOverlay(expense) {
  $("#success-copy").textContent = `${money(expense.amount)} saved to ${expense.categoryName}.`;
  $("#success-overlay").classList.remove("hidden");
  setTimeout(() => $("#success-overlay").classList.add("hidden"), 1300);
}

function requestReminderPermission() {
  if (!state.settings.reminder || !("Notification" in window)) return;
  if (Notification.permission === "default") Notification.requestPermission();
}

function applyTheme() {
  const theme = THEMES[state.settings.accentTheme] || THEMES.royal;
  document.documentElement.style.setProperty("--primary", theme.primary);
  document.documentElement.style.setProperty("--secondary", theme.secondary);
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.body.classList.toggle("dark", state.settings.darkMode);
  $("#theme-toggle").innerHTML = svgIcon(state.settings.darkMode ? "sun" : "moon", "ui-icon");
  $$(".theme-picker button").forEach((button) => button.classList.toggle("active", button.dataset.themePick === state.settings.accentTheme));
}

function showToast(message, type = "success") {
  const toast = $("#toast");
  toast.textContent = message;
  toast.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2400);
}

function setCurrentDateTime() {
  const now = new Date();
  $("#expense-date").value = toDateInput(now);
  $("#expense-time").value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good Night";
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getExpensesForMonth(key) {
  return state.expenses.filter((expense) => expense.date?.slice(0, 7) === key);
}

function sumExpenses(expenses) {
  return expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function groupByDate(expenses) {
  return expenses.reduce((groups, expense) => {
    groups[expense.date] ||= [];
    groups[expense.date].push(expense);
    return groups;
  }, {});
}

function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) || CATEGORIES[0];
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabelFromKey(key) {
  const [year, month] = key.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

function toDateInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDaysInMonth(key) {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function daysRemainingInMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
}

function money(value) {
  return `${state.settings.currency}${formatPlain(value)}`;
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatPlain(value) {
  return roundMoney(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function byNewest(a, b) {
  return `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`);
}

function byOldest(a, b) {
  return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
}

function formatDateHeading(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const today = toDateInput(new Date());
  const yesterday = toDateInput(new Date(Date.now() - 86400000));
  const suffix = dateString === today ? " (Today)" : dateString === yesterday ? " (Yesterday)" : "";
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}${suffix}`;
}

function shortDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()].slice(0, 3)}`;
}

function formatTime(time) {
  if (!time) return "";
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function formatDateTime(date, time) {
  return `${formatDateHeading(date).replace(` ${new Date(`${date}T00:00:00`).getFullYear()}`, "")}, ${formatTime(time)}`;
}

function monthComparison(key, spent) {
  const [year, month] = key.split("-").map(Number);
  const previousKey = monthKey(new Date(year, month - 2, 1));
  const previousSpent = sumExpenses(getExpensesForMonth(previousKey));
  if (!previousSpent) return "No previous data";
  const diff = spent - previousSpent;
  if (diff === 0) return "Same as last month";
  return `You spent ${money(Math.abs(diff))} ${diff > 0 ? "more" : "less"} than last month`;
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
