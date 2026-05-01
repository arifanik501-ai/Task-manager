const STORAGE_KEY = "hisabnikash_state_v1";
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const CATEGORY_COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0", "#00BCD4", "#8BC34A", "#E91E63", "#795548", "#3F51B5", "#009688", "#FFC107", "#607D8B", "#673AB7", "#CDDC39"];
const CATEGORIES = [
  { id: "food", icon: "🍚", name: "Food & Meals", short: "Food" },
  { id: "groceries", icon: "🛒", name: "Groceries", short: "Groc" },
  { id: "transport", icon: "🚌", name: "Transport", short: "Trans" },
  { id: "rent", icon: "🏠", name: "Rent", short: "Rent" },
  { id: "electricity", icon: "⚡", name: "Electricity Bill", short: "Bill" },
  { id: "water", icon: "💧", name: "Water Bill", short: "Water" },
  { id: "mobile", icon: "📱", name: "Mobile / Internet", short: "Mob" },
  { id: "medicine", icon: "💊", name: "Medicine / Health", short: "Med" },
  { id: "clothing", icon: "👕", name: "Clothing", short: "Clth" },
  { id: "education", icon: "🎓", name: "Education", short: "Edu" },
  { id: "entertainment", icon: "🎉", name: "Entertainment", short: "Fun" },
  { id: "gifts", icon: "🎁", name: "Gifts", short: "Gift" },
  { id: "family", icon: "👨‍👩‍👧", name: "Family", short: "Fam" },
  { id: "savings", icon: "🏦", name: "Savings / Deposit", short: "Save" },
  { id: "others", icon: "🔧", name: "Miscellaneous / Others", short: "Other" }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const defaultState = {
  budgets: {},
  expenses: [],
  settings: {
    currency: "৳",
    darkMode: false,
    reminder: false,
    reminderTime: "22:00",
    language: "en"
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

document.addEventListener("DOMContentLoaded", init);

function init() {
  bindNavigation();
  bindSetup();
  bindExpenseForm();
  bindFilters();
  bindSettings();
  bindCalculator();
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
  }, 2000);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      ...defaultState,
      ...saved,
      budgets: saved?.budgets || {},
      expenses: saved?.expenses || [],
      settings: { ...defaultState.settings, ...saved?.settings },
      activeMonth: monthKey(new Date())
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  state.activeMonth = monthKey(new Date());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    switchPage("more");
    $("#calculator-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function switchPage(page) {
  $$(".tab-page").forEach((tab) => tab.classList.toggle("active", tab.dataset.page === page));
  $$(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.target === page));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (page === "add") setCurrentDateTime();
  renderAll();
}

function bindExpenseForm() {
  $("#expense-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number($("#expense-amount").value);
    if (!amount || amount <= 0) {
      showToast("Enter a valid amount.", "warning");
      return;
    }

    const category = getCategory(selectedCategory);
    const expense = {
      id: $("#editing-expense-id").value || crypto.randomUUID(),
      amount,
      category: category.id,
      categoryName: category.name,
      categoryIcon: category.icon,
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
    if (pendingDelete?.type === "expense") deleteExpense(pendingDelete.id);
    if (pendingDelete?.type === "reset") resetCurrentMonth();
    hideConfirm();
  });
  $("#undo-toast").addEventListener("click", undoDelete);
}

function bindFilters() {
  $("#filter-toggle").addEventListener("click", () => {
    const panel = $("#filters-panel");
    panel.classList.toggle("hidden");
    $("#filter-toggle").setAttribute("aria-expanded", String(!panel.classList.contains("hidden")));
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

  $("#reset-month").addEventListener("click", () => {
    pendingDelete = { type: "reset" };
    $("#confirm-title").textContent = "Reset monthly data?";
    $("#confirm-copy").textContent = "This will clear all expenses for the current month and reset the budget.";
    $("#confirm-action").textContent = "Reset";
    $("#confirm-modal").classList.remove("hidden");
  });

  $("#export-csv").addEventListener("click", exportCsv);
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
    const result = Number($("#calc-result").textContent);
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
  $("#top-category").textContent = summary.topCategory ? `${summary.topCategory.icon} ${summary.topCategory.short}` : "—";
  $("#days-left").textContent = daysRemainingInMonth();

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
    container.innerHTML = `<div class="empty-state">No expenses found. 🎉</div>`;
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
      <span class="cat-icon">${category.icon}</span>
      <small>${category.short}</small>
    </button>
  `).join("");

  $("#filter-category").innerHTML = `<option value="">All categories</option>${CATEGORIES.map((category) => `<option value="${category.id}">${category.icon} ${category.name}</option>`).join("")}`;

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
    container.innerHTML = `<div class="empty-state">${compact ? "No expenses today! 🎉" : "No expenses added yet."}</div>`;
    return;
  }
  container.innerHTML = expenses.map(expenseCardHtml).join("");
  bindExpenseCards(container);
}

function expenseCardHtml(expense) {
  return `
    <article class="expense-card" data-expense-id="${expense.id}" tabindex="0">
      <div class="expense-icon">${expense.categoryIcon}</div>
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
      if (diff > 80) startEdit(card.dataset.expenseId);
    });
  });
}

function openExpenseModal(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) return;
  currentExpenseId = id;
  $("#expense-details").innerHTML = `
    <div class="detail-grid">
      <div><span>Category</span><strong>${expense.categoryIcon} ${escapeHtml(expense.categoryName)}</strong></div>
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
  $("#expense-description").value = expense.description;
  $("#expense-date").value = expense.date;
  $("#expense-time").value = expense.time;
  $("#expense-form-mode").textContent = "Edit Entry";
  $("#save-expense").textContent = "Update Expense";
  $("#cancel-edit").classList.remove("hidden");
  $("#selected-category-name").textContent = getCategory(selectedCategory).name;
  $$(".category-pill").forEach((item) => item.classList.toggle("active", item.dataset.category === selectedCategory));
  switchPage("add");
}

function resetExpenseForm() {
  $("#expense-form").reset();
  $("#editing-expense-id").value = "";
  $("#expense-form-mode").textContent = "New Entry";
  $("#save-expense").textContent = "💾 Save Expense";
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
          <strong>${row.icon} ${row.name}</strong>
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

function exportCsv() {
  const rows = [["id", "amount", "category", "description", "date", "time", "createdAt"]];
  getExpensesForMonth(monthKey(new Date())).forEach((expense) => {
    rows.push([expense.id, expense.amount, expense.categoryName, expense.description, expense.date, expense.time, expense.createdAt]);
  });
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `hisabnikash-${monthKey(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
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
      body{font-family:Arial,sans-serif;padding:24px;color:#212121}
      h1{color:#4CAF50} table{width:100%;border-collapse:collapse;margin-top:18px}
      td,th{border:1px solid #ddd;padding:8px;text-align:left}
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
      ${summary.expenses.map((expense) => `<tr><td>${expense.date}</td><td>${formatTime(expense.time)}</td><td>${expense.categoryIcon} ${expense.categoryName}</td><td>${escapeHtml(expense.description || "")}</td><td>${money(expense.amount)}</td></tr>`).join("")}
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

function requestReminderPermission() {
  if (!state.settings.reminder || !("Notification" in window)) return;
  if (Notification.permission === "default") Notification.requestPermission();
}

function applyTheme() {
  document.body.classList.toggle("dark", state.settings.darkMode);
  $("#theme-toggle").textContent = state.settings.darkMode ? "☀️" : "🌙";
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
