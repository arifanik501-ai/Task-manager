const STORAGE_KEY = "hisabnikash_state_v1";
const MONTH_NAMES = {
  bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};
const CATEGORY_COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#F44336", "#9C27B0", "#00BCD4", "#8BC34A", "#E91E63", "#795548", "#3F51B5", "#009688", "#FFC107", "#607D8B", "#673AB7", "#CDDC39"];
const THEMES = {
  royal: { primary: "#7C3AED", secondary: "#EC4899", accent: "#F97316" },
  ocean: { primary: "#3B82F6", secondary: "#06B6D4", accent: "#6366F1" },
  emerald: { primary: "#10B981", secondary: "#34D399", accent: "#06B6D4" },
  sunset: { primary: "#F97316", secondary: "#EF4444", accent: "#F59E0B" },
  gold: { primary: "#F59E0B", secondary: "#EAB308", accent: "#F97316" },
  rose: { primary: "#EC4899", secondary: "#F43F5E", accent: "#7C3AED" },
  amethyst: { primary: "#8B5CF6", secondary: "#A855F7", accent: "#D946EF" },
  sapphire: { primary: "#2563EB", secondary: "#1D4ED8", accent: "#60A5FA" },
  cyan: { primary: "#0891B2", secondary: "#22D3EE", accent: "#0EA5E9" },
  teal: { primary: "#0F766E", secondary: "#14B8A6", accent: "#2DD4BF" },
  mint: { primary: "#22C55E", secondary: "#86EFAC", accent: "#10B981" },
  lime: { primary: "#65A30D", secondary: "#A3E635", accent: "#84CC16" },
  amber: { primary: "#D97706", secondary: "#FBBF24", accent: "#F59E0B" },
  coral: { primary: "#FB7185", secondary: "#F97316", accent: "#FDBA74" },
  ruby: { primary: "#DC2626", secondary: "#F43F5E", accent: "#FB7185" },
  berry: { primary: "#BE185D", secondary: "#DB2777", accent: "#F472B6" },
  grape: { primary: "#6D28D9", secondary: "#9333EA", accent: "#C084FC" },
  indigo: { primary: "#4F46E5", secondary: "#6366F1", accent: "#818CF8" },
  midnight: { primary: "#1E3A8A", secondary: "#312E81", accent: "#7C3AED" },
  slate: { primary: "#475569", secondary: "#64748B", accent: "#94A3B8" },
  aurora: { primary: "#06B6D4", secondary: "#8B5CF6", accent: "#EC4899" }
};


const THEME_LABELS = {
  bn: { royal: "রয়্যাল", ocean: "ওশান", emerald: "এমেরাল্ড", sunset: "সানসেট", gold: "গোল্ড", rose: "রোজ", amethyst: "অ্যামেথিস্ট", sapphire: "স্যাফায়ার", cyan: "সায়ান", teal: "টিল", mint: "মিন্ট", lime: "লাইম", amber: "অ্যাম্বার", coral: "কোরাল", ruby: "রুবি", berry: "বেরি", grape: "গ্রেপ", indigo: "ইন্ডিগো", midnight: "মিডনাইট", slate: "স্লেট", aurora: "অরোরা" },
  en: { royal: "Royal", ocean: "Ocean", emerald: "Emerald", sunset: "Sunset", gold: "Gold", rose: "Rose", amethyst: "Amethyst", sapphire: "Sapphire", cyan: "Cyan", teal: "Teal", mint: "Mint", lime: "Lime", amber: "Amber", coral: "Coral", ruby: "Ruby", berry: "Berry", grape: "Grape", indigo: "Indigo", midnight: "Midnight", slate: "Slate", aurora: "Aurora" }
};

const ICON_PATHS = {
  home: '<path d="M5 10.5 12 4l7 6.5V20a1 1 0 0 1-1 1h-4v-6h-4v6H6a1 1 0 0 1-1-1z"/>',
  history: '<path d="M5 5h14M5 12h14M5 19h14M8 5v14"/>',
  add: '<path d="M12 5v14M5 12h14"/>',
  chart: '<path d="M4 19h16M7 16V9M12 16V5M17 16v-8"/>',
  settings: '<path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"/><path d="M3 12h2m14 0h2M12 3v2m0 14v2m6.4-15.4-1.4 1.4M7 17l-1.4 1.4m0-12.8L7 7m10 10 1.4 1.4"/>',
  palette: '<path d="M12 3a9 9 0 0 0 0 18h1.5a1.8 1.8 0 0 0 1.2-3.1 1.7 1.7 0 0 1 1.1-3h1.4A3.8 3.8 0 0 0 21 11.1 8.9 8.9 0 0 0 12 3Z"/><path d="M7.5 11h.01M9 7.5h.01M14 7.5h.01M16.5 11h.01"/>',
  calculator: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2M8 19h8"/>',
  bell: '<path d="M18 16H6l1.4-2V10a4.6 4.6 0 0 1 9.2 0v4z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  moon: '<path d="M20 14.2A7.5 7.5 0 0 1 9.8 4a8 8 0 1 0 10.2 10.2Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  save: '<path d="M5 5h12l2 2v12H5z"/><path d="M8 5v6h8V5M8 19v-5h8v5"/>',
  wallet: '<path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4z"/><path d="M4 7V5a2 2 0 0 1 2-2h11v4M16 13h5"/>',
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

const CATEGORY_LABELS = {
  bn: {
    food: ["খাবার", "খাবার"], groceries: ["বাজার", "বাজার"], transport: ["যাতায়াত", "যাতায়াত"], rent: ["বাসা ভাড়া", "ভাড়া"], electricity: ["বিদ্যুৎ বিল", "বিদ্যুৎ"], water: ["পানি বিল", "পানি"], mobile: ["মোবাইল / ইন্টারনেট", "মোবাইল"], medicine: ["ঔষধ / স্বাস্থ্য", "ঔষধ"], clothing: ["পোশাক", "পোশাক"], education: ["শিক্ষা", "শিক্ষা"], entertainment: ["বিনোদন", "বিনোদন"], gifts: ["উপহার", "উপহার"], family: ["পরিবার", "পরিবার"], savings: ["সঞ্চয় / জমা", "সঞ্চয়"], others: ["অন্যান্য", "অন্যান্য"]
  },
  en: {
    food: ["Food & Meals", "Food"], groceries: ["Groceries", "Groc"], transport: ["Transport", "Trans"], rent: ["Rent", "Rent"], electricity: ["Electricity Bill", "Bill"], water: ["Water Bill", "Water"], mobile: ["Mobile / Internet", "Mobile"], medicine: ["Medicine / Health", "Health"], clothing: ["Clothing", "Cloth"], education: ["Education", "Edu"], entertainment: ["Entertainment", "Fun"], gifts: ["Gifts", "Gifts"], family: ["Family", "Family"], savings: ["Savings / Deposit", "Save"], others: ["Miscellaneous / Others", "Other"]
  }
};

const UI_TEXT = {
  bn: {
    connected: "Connected", failed: "Failed", offline: "Offline", lastSync: "শেষ সিঙ্ক: {time}", noLastSync: "শেষ সিঙ্ক: —",
    versionUpdating: "নতুন ভার্সন আপডেট হচ্ছে…", syncNotReady: "সিঙ্ক প্রস্তুত নয়।", syncPulled: "সিঙ্ক হয়েছে। নতুন ডাটা এসেছে।", syncSaved: "সেভ ডাটা সিঙ্ক হয়েছে।", syncFailed: "সিঙ্ক ব্যর্থ। আবার চেষ্টা করুন।",
    invalidBudget: "সঠিক মাসিক বাজেট লিখুন।", budgetSet: "বাজেট সেট হয়েছে।", smoothOnToast: "স্মুথ মোড চালু: স্ক্রল দ্রুত হবে।", smoothOffToast: "অ্যানিমেশন আবার চালু।", noBudgetAlert: "এখন কোনো বাজেট সতর্কতা নেই।",
    invalidAmount: "সঠিক টাকা লিখুন।", expenseUpdated: "খরচ আপডেট হয়েছে।", expenseSaved: "খরচ সেভ হয়েছে।", invalidMoney: "সঠিক টাকার পরিমাণ লিখুন।", moneyAdded: "এই মাসে টাকা যোগ হয়েছে।", settingsSaved: "সেটিংস সেভ হয়েছে।", saveSettings: "সেটিংস সেভ",
    resetTitle: "এই মাসের ডাটা রিসেট করবেন?", resetCopy: "এতে এই মাসের সেভ খরচ মুছে যাবে এবং বাজেট রিসেট হবে।", reset: "রিসেট", languageSet: "ভাষা সেট হয়েছে: {language}।", securityOn: "সিকিউরিটি লক চালু।", securityOffToast: "সিকিউরিটি লক বন্ধ।",
    calculatorInvalid: "ক্যালকুলেটরের ফল সঠিক নয়।", languageToggle: "ভাষা: {language}", securityToggle: "সিকিউরিটি লক: {state}", on: "চালু", off: "বন্ধ", spentPercent: "{percent}% খরচ",
    noExpenseTitle: "এখনও কোনো খরচ নেই", noExpenseCopy: "{days} দিন বাকি আছে। প্রথম খরচ যোগ করলে ট্রেন্ড ও রিপোর্ট পরিষ্কার হবে।", addFirstExpense: "প্রথম খরচ যোগ করুন", noBudgetTitle: "বাজেট সেট করা হয়নি", noBudgetCopy: "মাসিক বাজেট দিলে বাকি টাকা, নিরাপদ দৈনিক খরচ এবং সতর্কতা দেখা যাবে।", setBudget: "বাজেট সেট করুন",
    budgetExceeded: "বাজেট ছাড়িয়ে গেছে", spendingPressure: "খরচের চাপ বেশি", beCareful: "সতর্ক থাকুন", budgetSafe: "বাজেট নিরাপদ", dashboardCopy: "আজ খরচ {today}। {days} দিন বাকি, নিরাপদ দৈনিক খরচ {daily}।", viewReports: "রিপোর্ট দেখুন", addExpense: "খরচ যোগ করুন", instantInsight: "তাৎক্ষণিক ইনসাইট",
    trend: "ট্রেন্ড", forecast: "ফোরকাস্ট", safePerDay: "নিরাপদ/দিন", alert: "সতর্কতা", budgetNeeded: "বাজেট দিন", overspendRisk: "ওভারস্পেন্ড ঝুঁকি", entries: "{count}টি এন্ট্রি • {total}", savedExpensesShowing: "সেভ খরচ দেখানো হচ্ছে", search: "সার্চ: {value}", dateFilter: "তারিখ ফিল্টার", amountFilter: "টাকার ফিল্টার",
    noHistory: "খরচ পাওয়া যায়নি।", addFirstShort: "প্রথম খরচ যোগ", total: "মোট: {total}", categoryCount: "{count} ক্যাটাগরি", highestDay: "শীর্ষ দিন: {date}", highestDayEmpty: "শীর্ষ দিন: —", previousMonth: "গত মাস", noData: "ডাটা নেই", savingsRate: "সঞ্চয় হার", unusual: "অস্বাভাবিক", none: "নেই", action: "অ্যাকশন", categoryChange: "ক্যাটাগরি বদল", allCategories: "সেভ ক্যাটাগরি",
    todayNoExpense: "আজ কোনো খরচ নেই।", noExpenseAdded: "এখনও কোনো খরচ যোগ হয়নি।", noDescription: "বিবরণ নেই", recurring: "বারবার", category: "ক্যাটাগরি", amount: "টাকা", description: "বিবরণ", date: "তারিখ", time: "সময়", editEntry: "এডিট এন্ট্রি", update: "আপডেট", newEntry: "নতুন এন্ট্রি", saveHome: "সেভ করে হোমে",
    deleteExpenseTitle: "এই খরচ ডিলিট করবেন?", deleteExpenseCopy: "খরচটি মুছে যাবে, বাকি টাকা আবার ঠিক হবে।", delete: "ডিলিট", undoDone: "খরচ ফিরিয়ে আনা হয়েছে।", monthReset: "মাসের ডাটা রিসেট হয়েছে।", categoryNoData: "ক্যাটাগরি ডাটা নেই।", budgetTransactions: "বাজেটের {percent}% • {count}টি লেনদেন", emptyCopy: "ডাটা যোগ করলে এখানে পরিষ্কার বিশ্লেষণ দেখাবে।",
    noTrend: "ট্রেন্ড নেই", increasing: "বাড়ছে", decreasing: "কমছে", stable: "স্থিতিশীল", notStarted: "খরচ শুরু হয়নি", withinBudget: "বাজেটের মধ্যে", exceedDays: "{days} দিনে ছাড়াবে", alreadyExceeded: "ইতিমধ্যে ছাড়িয়েছে", noBigChange: "বড় পরিবর্তন নেই", categoryIncreased: "{name} বেড়েছে {percent}%", categoryDecreased: "{name} কমেছে {percent}%",
    backupRestored: "ব্যাকআপ রিস্টোর হয়েছে।", restoreFailed: "রিস্টোর ব্যর্থ। ব্যাকআপ ফাইল সঠিক নয়।", popupBlocked: "PDF এক্সপোর্টের জন্য পপআপ allow করুন।", pdfTitle: "হিসাব রিপোর্ট", pdfHeading: "হিসাব মাসিক রিপোর্ট - {month}", budget: "বাজেট", spent: "খরচ", remaining: "বাকি",
    budgetOverToast: "বাজেট {amount} ছাড়িয়েছে।", budgetAlmostDone: "বাজেট প্রায় শেষ। বাকি {amount}।", budget75: "সতর্কতা: বাজেটের ২৫% বাকি।", budget50: "বাজেটের অর্ধেক খরচ হয়েছে।", budgetOverAlert: "বাজেট ছাড়িয়েছে — {amount} বেশি খরচ হয়েছে।", budget90Alert: "বাজেট প্রায় শেষ — বাকি {amount}।", budget75Alert: "বাজেট সতর্কতা: ৭৫% খরচ হয়েছে।", budget50Alert: "মনে রাখুন: বাজেটের অর্ধেক খরচ হয়েছে।",
    savedTo: "{amount} {category}-এ সেভ হয়েছে।", goodNight: "শুভ রাত্রি", goodMorning: "শুভ সকাল", goodAfternoon: "শুভ দুপুর", goodEvening: "শুভ সন্ধ্যা", todaySuffix: " (আজ)", yesterdaySuffix: " (গতকাল)", noPreviousData: "আগের ডাটা নেই", sameAsLastMonth: "গত মাসের সমান", monthMoreLess: "গত মাসের চেয়ে {amount} {direction} খরচ", more: "বেশি", less: "কম", smoothOn: "স্মুথ মোড চালু", smoothMode: "স্মুথ মোড",
    appDescription: "হিসাব একটি মোবাইল-ফার্স্ট মাসিক খরচ ট্র্যাকার।", appName: "হিসাব", setupTitle: "মাসিক বাজেট সেট করুন", onboardingBudget: "১. বাজেট", onboardingCategory: "২. ক্যাটাগরি", onboardingExpense: "৩. প্রথম খরচ", setupCopy: "আগে মাসিক বাজেট সেট করুন। এরপর ক্যাটাগরি বেছে প্রথম খরচ যোগ করুন।", setupBudgetLabel: "আপনার মাসিক বাজেট", custom: "নিজস্ব", carryForward: "গত মাসের বাকি টাকা যোগ করুন", startTracking: "শুরু করুন", thisMonth: "এই মাস", budgetAlerts: "বাজেট সতর্কতা", openSettings: "সেটিংস খুলুন", darkMode: "ডার্ক মোড", addMoney: "টাকা যোগ", edit: "এডিট", quickActions: "দ্রুত কাজ", money: "টাকা", reports: "রিপোর্ট", calc: "ক্যালক", today: "আজ", todayExpense: "আজকের খরচ", dailyAverage: "দৈনিক গড়", highestExpense: "সর্বোচ্চ খরচ", topCategory: "শীর্ষ ক্যাটাগরি", daysLeft: "দিন বাকি", spendingChart: "খরচের চিত্র", spendingHistory: "খরচের ইতিহাস", searchExpense: "খরচ খুঁজুন", sevenDays: "৭ দিন", highExpense: "বড় খরচ", clear: "ক্লিয়ার", filter: "ফিল্টার", close: "বন্ধ", from: "শুরু", to: "শেষ", min: "কম ৳", max: "বেশি ৳", sort: "সাজান", newest: "নতুন আগে", oldest: "পুরনো আগে", highest: "বেশি টাকা আগে", lowest: "কম টাকা আগে", saveFast: "দ্রুত সেভ", cancelEdit: "এডিট বাতিল", addMoneyTitle: "টাকা যোগ করুন", addToMonth: "এই মাসে যোগ হবে", optionalNote: "নোট (ঐচ্ছিক)", notePlaceholder: "বেতন, বোনাস, সঞ্চয়", compare: "বিশ্লেষণ", reportsTitle: "মাসিক রিপোর্ট", reportBudget: "মোট বাজেট", reportSpent: "মোট খরচ", categoryAnalysis: "ক্যাটাগরি বিশ্লেষণ", monthTrend: "মাসের ট্রেন্ড", topThree: "শীর্ষ ৩ একক খরচ", tools: "টুলস", morePage: "আরও", colors: "রং", accentColors: "অ্যাকসেন্ট রং", exportPdf: "PDF এক্সপোর্ট", calculator: "ক্যালকুলেটর", syncNow: "সিঙ্ক করুন", dataControl: "ডাটা কন্ট্রোল", settings: "সেটিংস", currencySymbol: "কারেন্সি চিহ্ন", resetMonth: "মাসের ডাটা রিসেট", cloudSync: "ক্লাউড সিঙ্ক", retrySync: "আবার সিঙ্ক করুন", backupData: "ডাটা ব্যাকআপ", restoreData: "ডাটা রিস্টোর", navHome: "হোম", navHistory: "ইতিহাস", navAdd: "যোগ", navReports: "রিপোর্ট", navMore: "আরও", modalTitle: "খরচের বিস্তারিত", modalEdit: "এডিট", modalDelete: "ডিলিট", confirmDefaultTitle: "আপনি নিশ্চিত?", confirmDefaultCopy: "এই কাজটি ফিরিয়ে নেওয়া যাবে না।", confirmCancel: "বাতিল", confirmAction: "ডিলিট", successTitle: "খরচ যোগ হয়েছে", undo: "ফিরিয়ে আনুন", amountKeypad: "টাকার কীপ্যাড", backspace: "এক ঘর মুছুন", quickCategories: "দ্রুত ক্যাটাগরি", onboardingSteps: "অনবোর্ডিং ধাপ", quickBudget: "দ্রুত বাজেট", budgetUsage: "বাজেট ব্যবহার",
  },
  en: {
    connected: "Connected", failed: "Failed", offline: "Offline", lastSync: "Last sync: {time}", noLastSync: "Last sync: —",
    versionUpdating: "Updating to the latest version…", syncNotReady: "Sync is not ready.", syncPulled: "Sync complete. New data arrived.", syncSaved: "Saved data synced.", syncFailed: "Sync failed. Try again.",
    invalidBudget: "Enter a valid monthly budget.", budgetSet: "Budget set.", smoothOnToast: "Smooth Mode on: scrolling will be faster.", smoothOffToast: "Animations restored.", noBudgetAlert: "No budget alert right now.",
    invalidAmount: "Enter a valid amount.", expenseUpdated: "Expense updated.", expenseSaved: "Expense saved.", invalidMoney: "Enter a valid amount.", moneyAdded: "Money added to this month.", settingsSaved: "Settings saved.", saveSettings: "Save Settings",
    resetTitle: "Reset this month’s data?", resetCopy: "This will delete this month’s saved expenses and reset the budget.", reset: "Reset", languageSet: "Language set to {language}.", securityOn: "Security lock enabled.", securityOffToast: "Security lock disabled.",
    calculatorInvalid: "Calculator result is not valid.", languageToggle: "Language: {language}", securityToggle: "Security lock: {state}", on: "On", off: "Off", spentPercent: "{percent}% spent",
    noExpenseTitle: "No expenses yet", noExpenseCopy: "{days} days remaining. Add the first expense to unlock trends and reports.", addFirstExpense: "Add first expense", noBudgetTitle: "Budget is not set", noBudgetCopy: "Set a monthly budget to see remaining money, safe daily spend, and alerts.", setBudget: "Set budget",
    budgetExceeded: "Budget exceeded", spendingPressure: "Spending pressure is high", beCareful: "Be careful", budgetSafe: "Budget is safe", dashboardCopy: "Today spent {today}. {days} days left, safe daily spend {daily}.", viewReports: "View reports", addExpense: "Add expense", instantInsight: "Immediate insight",
    trend: "Trend", forecast: "Forecast", safePerDay: "Safe/day", alert: "Alert", budgetNeeded: "Set budget", overspendRisk: "Overspend risk", entries: "{count} entries • {total}", savedExpensesShowing: "Showing saved expenses", search: "Search: {value}", dateFilter: "Date filter", amountFilter: "Amount filter",
    noHistory: "No expenses found.", addFirstShort: "Add first expense", total: "Total: {total}", categoryCount: "{count} categories", highestDay: "Top day: {date}", highestDayEmpty: "Top day: —", previousMonth: "Last month", noData: "No data", savingsRate: "Savings rate", unusual: "Unusual", none: "None", action: "Action", categoryChange: "Category change", allCategories: "All categories",
    todayNoExpense: "No expenses today.", noExpenseAdded: "No expenses added yet.", noDescription: "No description", recurring: "Recurring", category: "Category", amount: "Amount", description: "Description", date: "Date", time: "Time", editEntry: "Edit entry", update: "Update", newEntry: "New entry", saveHome: "Save and Home",
    deleteExpenseTitle: "Delete this expense?", deleteExpenseCopy: "This expense will be removed and remaining balance will update.", delete: "Delete", undoDone: "Expense restored.", monthReset: "Month data reset.", categoryNoData: "No category data.", budgetTransactions: "{percent}% of budget • {count} transactions", emptyCopy: "Add data to see clear insights here.",
    noTrend: "No trend", increasing: "Increasing", decreasing: "Decreasing", stable: "Stable", notStarted: "Spending has not started", withinBudget: "Within budget", exceedDays: "Will exceed in {days} days", alreadyExceeded: "Already exceeded", noBigChange: "No big change", categoryIncreased: "{name} increased {percent}%", categoryDecreased: "{name} decreased {percent}%",
    backupRestored: "Backup restored.", restoreFailed: "Restore failed. Backup file is invalid.", popupBlocked: "Allow popups to export PDF.", pdfTitle: "Hisab Report", pdfHeading: "Hisab Monthly Report - {month}", budget: "Budget", spent: "Spent", remaining: "Remaining",
    budgetOverToast: "Budget exceeded by {amount}.", budgetAlmostDone: "Budget almost done. Remaining {amount}.", budget75: "Alert: 25% of budget remaining.", budget50: "Half of the budget has been spent.", budgetOverAlert: "Budget exceeded — {amount} overspent.", budget90Alert: "Budget almost done — remaining {amount}.", budget75Alert: "Budget alert: 75% spent.", budget50Alert: "Reminder: half of the budget has been spent.",
    savedTo: "{amount} saved to {category}.", goodNight: "Good Night", goodMorning: "Good Morning", goodAfternoon: "Good Afternoon", goodEvening: "Good Evening", todaySuffix: " (Today)", yesterdaySuffix: " (Yesterday)", noPreviousData: "No previous data", sameAsLastMonth: "Same as last month", monthMoreLess: "You spent {amount} {direction} than last month", more: "more", less: "less", smoothOn: "Smooth Mode On", smoothMode: "Smooth Mode",
    appDescription: "Hisab is a mobile-first monthly expense tracker.", appName: "Hisab", setupTitle: "Set Monthly Budget", onboardingBudget: "1. Budget", onboardingCategory: "2. Category", onboardingExpense: "3. First Expense", setupCopy: "Set a monthly budget first. Then choose a category and add your first expense.", setupBudgetLabel: "Your monthly budget", custom: "Custom", carryForward: "Add last month’s remaining balance", startTracking: "Start", thisMonth: "This Month", budgetAlerts: "Budget alerts", openSettings: "Open settings", darkMode: "Dark mode", addMoney: "Add Money", edit: "Edit", quickActions: "Quick actions", money: "Money", reports: "Reports", calc: "Calc", today: "Today", todayExpense: "Today’s Expense", dailyAverage: "Daily Average", highestExpense: "Highest Expense", topCategory: "Top Category", daysLeft: "Days Left", spendingChart: "Spending Chart", spendingHistory: "Expense History", searchExpense: "Search expenses", sevenDays: "7 days", highExpense: "High expense", clear: "Clear", filter: "Filter", close: "Close", from: "From", to: "To", min: "Min ৳", max: "Max ৳", sort: "Sort", newest: "Newest first", oldest: "Oldest first", highest: "Highest amount first", lowest: "Lowest amount first", saveFast: "Quick Save", cancelEdit: "Cancel Edit", addMoneyTitle: "Add Money", addToMonth: "Add to this month", optionalNote: "Note (optional)", notePlaceholder: "Salary, bonus, savings", compare: "Analysis", reportsTitle: "Monthly Report", reportBudget: "Total Budget", reportSpent: "Total Spent", categoryAnalysis: "Category Analysis", monthTrend: "Monthly Trend", topThree: "Top 3 Single Expenses", tools: "Tools", morePage: "More", colors: "Colors", accentColors: "Accent Colors", exportPdf: "Export PDF", calculator: "Calculator", syncNow: "Sync Now", dataControl: "Data Control", settings: "Settings", currencySymbol: "Currency symbol", resetMonth: "Reset Month Data", cloudSync: "Cloud Sync", retrySync: "Sync Again", backupData: "Backup Data", restoreData: "Restore Data", navHome: "Home", navHistory: "History", navAdd: "Add", navReports: "Reports", navMore: "More", modalTitle: "Expense Details", modalEdit: "Edit", modalDelete: "Delete", confirmDefaultTitle: "Are you sure?", confirmDefaultCopy: "This action cannot be undone.", confirmCancel: "Cancel", confirmAction: "Delete", successTitle: "Expense Added", undo: "Undo", amountKeypad: "Amount keypad", backspace: "Backspace", quickCategories: "Quick categories", onboardingSteps: "Onboarding steps", quickBudget: "Quick budget", budgetUsage: "Budget usage",
  }
};

const CATEGORIES = Object.keys(CATEGORY_LABELS.en).map((id) => ({ id }));

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function lang() {
  return state?.settings?.language === "en" ? "en" : "bn";
}

function tr(key, values = {}) {
  const dictionary = UI_TEXT[lang()] || UI_TEXT.bn;
  let value = dictionary[key] || UI_TEXT.bn[key] || key;
  Object.entries(values).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}

function monthNames() {
  return MONTH_NAMES[lang()] || MONTH_NAMES.bn;
}

function themeLabel(id) {
  return THEME_LABELS[lang()]?.[id] || THEME_LABELS.en[id] || id;
}

function categoryLabel(id) {
  const labels = CATEGORY_LABELS[lang()]?.[id] || CATEGORY_LABELS.bn[id] || CATEGORY_LABELS.en.others;
  return { name: labels[0], short: labels[1] };
}

function localizeExpense(expense) {
  const label = categoryLabel(expense.category);
  return { ...expense, categoryName: label.name };
}

function languageName() {
  return state.settings.language === "bn" ? "বাংলা" : "English";
}

const defaultState = {
  budgets: {},
  expenses: [],
  settings: {
    currency: "৳",
    darkMode: true,
    reminder: false,
    reminderTime: "22:00",
    language: "bn",
    accentTheme: "royal",
    performanceMode: false,
    lastUsedCategory: "food",
    securityLock: false
  },
  activeMonth: monthKey(new Date())
};

let state = loadState();
let selectedCategory = CATEGORIES[0].id;
let currentExpenseId = null;
let pendingDelete = null;
let toastTimer = null;
let successOverlayTimer = null;
let undoTimer = null;
let calcExpression = "";
let amountInputRaw = "";
let activePage = "home";
let touchScrollTimer = null;

document.addEventListener("DOMContentLoaded", init);


function applyStaticText() {
  document.documentElement.lang = lang();
  document.title = tr("appName");
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = tr("appDescription");
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = tr(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.setAttribute("placeholder", tr(node.dataset.i18nPlaceholder));
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    node.setAttribute("aria-label", tr(node.dataset.i18nAria));
  });
  const ariaLabels = [
    ["#alert-bell", "budgetAlerts"], ["[data-open-settings='profile']", "openSettings"], ["#theme-toggle", "darkMode"], ["#mini-spending-chart", "spendingChart"],
    ["#amount-keypad", "amountKeypad"], ["[data-amount-key='back']", "backspace"], ["#quick-category-row", "quickCategories"], ["#accent-palette .theme-picker", "accentColors"],
    [".bottom-nav", "navMore"], ["#close-expense-modal", "close"], [".identity-hero", "appName"]
  ];
  ariaLabels.forEach(([selector, key]) => {
    const node = document.querySelector(selector);
    if (node) node.setAttribute("aria-label", tr(key));
  });
  document.querySelectorAll("[data-theme-pick]").forEach((button) => {
    const label = themeLabel(button.dataset.themePick);
    button.setAttribute("aria-label", label);
    const text = button.querySelector("span");
    if (text) text.textContent = label;
  });
}

function init() {
  applyStaticText();
  hydrateSvgIcons();
  bindNavigation();
  bindSetup();
  bindExpenseForm();
  bindFilters();
  bindSettings();
  bindCalculator();
  bindCloudSync();
  bindTouchScrollStabilizer();
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
    setTimeout(() => registration.update().catch(() => {}), 4000);
    setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});

  if (!hadController) return;

  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloading) return;
    reloading = true;
    showToast(tr("versionUpdating"));
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
  const moreStatus = $("#more-cloud-status");
  const syncButton = $("#sync-now");

  function applyStatus(next) {
    const normalized = normalizeCloudStatus(next);
    if (badge) {
      badge.dataset.status = normalized;
      badge.className = `cloud-status ${normalized}`;
      badge.textContent = formatCloudStatus(normalized);
    }
    if (moreStatus) {
      moreStatus.dataset.status = normalized;
      const label = moreStatus.querySelector("small");
      if (label) label.textContent = formatCloudStatus(normalized);
    }
    if (syncButton) {
      syncButton.disabled = syncButton.dataset.busy === "1";
      syncButton.classList.toggle("retry", normalized === "failed" || normalized === "offline");
    }
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
    applyStatus("offline");
  }

  syncButton?.addEventListener("click", async () => {
    if (!window.cloudSync) {
      applyStatus("offline");
      showToast(tr("syncNotReady"), "warning");
      return;
    }
    const button = syncButton;
    if (button.dataset.busy === "1") return;
    button.dataset.busy = "1";
    button.disabled = true;
    const localTsBefore = Number(state.lastUpdatedAt) || 0;
    try {
      const remote = await window.cloudSync.syncNow(state);
      const remoteTs = Number(remote?.lastUpdatedAt) || 0;
      if (remote && remoteTs > localTsBefore) {
        replaceStateFromCloud(remote);
        showToast(tr("syncPulled"));
      } else {
        state.settings.lastSyncedAt = Date.now();
        saveState();
        updateLastSyncTime();
        showToast(tr("syncSaved"));
      }
      applyStatus("online");
    } catch (error) {
      console.warn("[cloud] sync now failed", error);
      applyStatus("failed");
      showToast(tr("syncFailed"), "warning");
    } finally {
      button.dataset.busy = "0";
      button.disabled = false;
    }
  });
}

function normalizeCloudStatus(s) {
  if (s === "online" || s === "syncing") return "online";
  if (s === "error" || s === "failed") return "failed";
  return "offline";
}

function formatCloudStatus(s) {
  if (s === "online") return tr("connected");
  if (s === "failed") return tr("failed");
  return tr("offline");
}

function updateLastSyncTime() {
  const target = $("#last-sync-time");
  if (!target) return;
  const ts = Number(state.settings.lastSyncedAt) || Number(state.lastUpdatedAt) || 0;
  target.textContent = ts ? tr("lastSync", { time: new Date(ts).toLocaleString(lang() === "bn" ? "bn-BD" : "en-US", { dateStyle: "medium", timeStyle: "short" }) }) : tr("noLastSync");
}

function syncSettingsForm() {
  const budget = currentBudget();
  if ($("#settings-budget")) $("#settings-budget").value = budget.totalBudget || "";
  if ($("#money-amount")) $("#money-amount").value = "";
  if ($("#money-note")) $("#money-note").value = "";
  if ($("#settings-currency")) $("#settings-currency").value = state.settings.currency || "\u09F3";
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

function addMoney(amount, note = "") {
  const budget = currentBudget();
  const value = roundMoney(Math.max(0, Number(amount) || 0));
  if (!value) return false;
  budget.totalBudget = roundMoney((Number(budget.totalBudget) || 0) + value);
  budget.moneyAdds = [
    ...(Array.isArray(budget.moneyAdds) ? budget.moneyAdds : []),
    {
      id: createId(),
      amount: value,
      note: note.trim(),
      date: toDateInput(new Date()),
      time: `${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`,
      createdAt: new Date().toISOString()
    }
  ];
  saveState();
  return true;
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
      showToast(tr("invalidBudget"), "warning");
      return;
    }
    setBudget(amount, $("#setup-carry-forward").checked);
    $("#setup-screen").classList.add("hidden");
    $("#main-app").classList.remove("hidden");
    renderAll();
    showToast(tr("budgetSet"));
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

  $("#performance-toggle")?.addEventListener("click", () => {
    state.settings.performanceMode = !state.settings.performanceMode;
    saveState();
    applyTheme();
    showToast(state.settings.performanceMode ? tr("smoothOnToast") : tr("smoothOffToast"));
  });

  $("#accent-toggle")?.addEventListener("click", () => {
    const palette = $("#accent-palette");
    const isOpening = palette.classList.contains("hidden");
    palette.classList.toggle("hidden", !isOpening);
    $("#accent-toggle").setAttribute("aria-expanded", String(isOpening));
  });

  $$("[data-open-settings]").forEach((button) => {
    button.addEventListener("click", () => {
      switchPage("more");
      $("#settings-panel").scrollIntoView({ behavior: state.settings.performanceMode ? "auto" : "smooth", block: "start" });
    });
  });

  $$(".menu-card[data-panel]").forEach((button) => {
    button.addEventListener("click", () => {
      $(`#${button.dataset.panel}`).scrollIntoView({ behavior: state.settings.performanceMode ? "auto" : "smooth", block: "start" });
    });
  });

  $("#open-mini-calculator").addEventListener("click", () => {
    switchPage("calculator");
  });

  $("#more-open-calculator")?.addEventListener("click", () => {
    switchPage("calculator");
  });

  $("#more-sync-now")?.addEventListener("click", () => {
    switchPage("more");
    const cloudCard = $(".cloud-sync-card");
    if (cloudCard) cloudCard.scrollIntoView({ behavior: state.settings.performanceMode ? "auto" : "smooth", block: "center" });
    $("#sync-now")?.click();
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-target]");
    if (!button) return;
    switchPage(button.dataset.quickTarget);
    if (button.dataset.panelTarget) {
      $(`#${button.dataset.panelTarget}`).scrollIntoView({ behavior: state.settings.performanceMode ? "auto" : "smooth", block: "start" });
    }
  });

  $("#alert-bell").addEventListener("click", () => {
    const alert = $("#budget-alert");
    const hasAlert = alert.textContent.trim().length > 0;
    if (!hasAlert) {
      showToast(tr("noBudgetAlert"));
      return;
    }
    alert.classList.toggle("hidden");
  });
}

function bindTouchScrollStabilizer() {
  if (!window.matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  window.addEventListener("touchmove", () => {
    document.body.classList.add("is-touch-scrolling");
    clearTimeout(touchScrollTimer);
    touchScrollTimer = setTimeout(() => {
      document.body.classList.remove("is-touch-scrolling");
    }, 140);
  }, { passive: true });

  window.addEventListener("touchend", () => {
    clearTimeout(touchScrollTimer);
    touchScrollTimer = setTimeout(() => {
      document.body.classList.remove("is-touch-scrolling");
    }, 180);
  }, { passive: true });
}

function switchPage(page) {
  activePage = page;
  $$(".tab-page").forEach((tab) => tab.classList.toggle("active", tab.dataset.page === page));
  $$(".nav-button").forEach((button) => button.classList.toggle("active", button.dataset.target === page));
  window.scrollTo({ top: 0, behavior: state.settings.performanceMode ? "auto" : "smooth" });
  if (page === "add" && !$("#editing-expense-id").value) {
    setCurrentDateTime();
    selectCategory(state.settings.lastUsedCategory || CATEGORIES[0].id);
    $("#expense-amount").value = "";
    amountInputRaw = "";
    updateAmountPreview();
    requestAnimationFrame(() => $("#expense-amount").focus({ preventScroll: true }));
  }
  syncAmountRawFromInput();
  renderAll();
}

function bindExpenseForm() {
  let afterSaveTarget = "home";
  $("#save-expense")?.addEventListener("click", () => { afterSaveTarget = "home"; });
  $("#save-expense-fast")?.addEventListener("click", () => { afterSaveTarget = "add"; });

  $("#expense-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number(amountInputRaw || $("#expense-amount").value);
    if (!amount || amount <= 0) {
      showToast(tr("invalidAmount"), "warning");
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
      showToast(tr("expenseUpdated"));
    } else {
      state.expenses.push(expense);
      state.settings.lastUsedCategory = category.id;
      showToast(tr("expenseSaved"));
      showSuccessOverlay(expense);
      saveState();
      resetExpenseForm();
      if (afterSaveTarget === "add") {
        setCurrentDateTime();
        selectCategory(state.settings.lastUsedCategory || CATEGORIES[0].id);
        requestAnimationFrame(() => $("#expense-amount").focus({ preventScroll: true }));
        renderAll();
      } else {
        switchPage("home");
      }
      checkBudgetAlerts();
      afterSaveTarget = "home";
      return;
    }

    saveState();
    resetExpenseForm();
    switchPage("home");
    checkBudgetAlerts();
    afterSaveTarget = "home";
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

  $("#add-money-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const amount = Number($("#money-amount").value);
    if (!addMoney(amount, $("#money-note").value)) {
      showToast(tr("invalidMoney"), "warning");
      return;
    }
    $("#money-amount").value = "";
    $("#money-note").value = "";
    updateMoneyPreview();
    switchPage("home");
    showToast(tr("moneyAdded"));
  });

  $("#money-amount")?.addEventListener("input", updateMoneyPreview);
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

  $$(".preset-filters [data-filter-preset]").forEach((button) => {
    button.addEventListener("click", () => applyFilterPreset(button.dataset.filterPreset));
  });

  $("#report-month").addEventListener("input", renderReports);
}

function bindSettings() {
  $("#save-settings").addEventListener("click", () => {
    const budget = Number($("#settings-budget").value);
    if (budget > 0) currentBudget().totalBudget = budget;
    state.settings.currency = $("#settings-currency").value.trim() || "৳";
    state.settings.accentTheme = $(".theme-picker button.active")?.dataset.themePick || state.settings.accentTheme;
    saveState();
    applyTheme();
    renderAll();
    showToast(tr("settingsSaved"));
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
    $("#confirm-title").textContent = tr("resetTitle");
    $("#confirm-copy").textContent = tr("resetCopy");
    $("#confirm-action").textContent = tr("reset");
    $("#confirm-modal").classList.remove("hidden");
  });

  $("#backup-data")?.addEventListener("click", backupData);
  $("#restore-data")?.addEventListener("click", () => $("#restore-data-file").click());
  $("#restore-data-file")?.addEventListener("change", restoreData);
  $("#language-toggle")?.addEventListener("click", () => {
    state.settings.language = state.settings.language === "bn" ? "en" : "bn";
    saveState();
    renderCategories();
    applyStaticText();
    applyTheme();
    renderAll();
    resetExpenseForm();
    showToast(tr("languageSet", { language: languageName() }));
  });
  $("#security-toggle")?.addEventListener("click", () => {
    state.settings.securityLock = !state.settings.securityLock;
    saveState();
    syncInputs();
    showToast(state.settings.securityLock ? tr("securityOn") : tr("securityOffToast"));
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
      showToast(tr("calculatorInvalid"), "warning");
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
    $("#save-expense-fast")?.click();
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

function updateMoneyPreview() {
  const amount = Number($("#money-amount")?.value) || 0;
  $("#money-preview").textContent = money(amount);
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
  applyStaticText();
  syncInputs();
  renderDashboard();
  if (activePage === "history") renderHistory();
  if (activePage === "reports") renderReports();
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
  $("#money-currency").textContent = state.settings.currency;
  $("#settings-currency-prefix").textContent = state.settings.currency;
  $("#settings-budget").value = budget.totalBudget || "";
  $("#settings-currency").value = state.settings.currency;
  $("#language-toggle").textContent = tr("languageToggle", { language: languageName() });
  $("#security-toggle").textContent = tr("securityToggle", { state: state.settings.securityLock ? tr("on") : tr("off") });
  $$(".theme-picker button").forEach((button) => button.classList.toggle("active", button.dataset.themePick === state.settings.accentTheme));
  updateLastSyncTime();
  updateAmountPreview();
  updateMoneyPreview();
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
  $("#spent-percent").textContent = tr("spentPercent", { percent: Math.round(spentPercent) });
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
  renderDashboardBrief(summary, todaySpent);
  renderDashboardInsights(summary);

  const circumference = 365;
  $("#budget-progress").style.strokeDashoffset = String(circumference - (spentPercent / 100) * circumference);
  renderExpenseList($("#today-expenses"), todayExpenses.sort(byNewest).slice(0, 5), true);
}

function renderDashboardBrief(summary, todaySpent) {
  const daysLeft = daysRemainingInMonth();
  const percent = summary.budget ? (summary.spent / summary.budget) * 100 : 0;
  let title = tr("noExpenseTitle");
  let copy = tr("noExpenseCopy", { days: daysLeft });
  let action = tr("addFirstExpense");
  let target = "add";

  if (!summary.budget) {
    title = tr("noBudgetTitle");
    copy = tr("noBudgetCopy");
    action = tr("setBudget");
    target = "more";
  } else if (summary.expenses.length) {
    const safeDaily = Math.max(0, summary.remaining) / Math.max(1, daysLeft || 1);
    const pressure = percent >= 100 ? tr("budgetExceeded") : percent >= 85 ? tr("spendingPressure") : percent >= 70 ? tr("beCareful") : tr("budgetSafe");
    title = pressure;
    copy = tr("dashboardCopy", { today: money(todaySpent), days: daysLeft, daily: money(safeDaily) });
    action = percent >= 85 ? tr("viewReports") : tr("addExpense");
    target = percent >= 85 ? "reports" : "add";
  }

  $("#dashboard-brief").innerHTML = `
    <div>
      <span>${tr("instantInsight")}</span>
      <strong>${title}</strong>
      <p>${copy}</p>
    </div>
    <button class="primary-button compact-action" type="button" data-quick-target="${target}">${action}</button>
  `;
}

function renderDashboardInsights(summary) {
  const forecast = summary.dailyAverage * summary.daysInMonth;
  const safeDaily = Math.max(0, summary.remaining) / Math.max(1, daysRemainingInMonth() || 1);
  const percent = summary.budget ? (summary.spent / summary.budget) * 100 : 0;
  const trend = recentTrend(summary);
  const alertText = percent >= 100 ? tr("budgetExceeded") : percent >= 85 ? tr("overspendRisk") : percent >= 70 ? tr("beCareful") : tr("budgetSafe");
  $("#dashboard-insights").innerHTML = [
    insightCard(tr("trend"), trend),
    insightCard(tr("forecast"), summary.budget ? money(forecast) : tr("budgetNeeded")),
    insightCard(tr("safePerDay"), summary.budget ? money(safeDaily) : "—"),
    insightCard(tr("alert"), alertText, percent >= 85 ? "danger" : percent >= 70 ? "warning" : "success")
  ].join("");
}

function renderHistory() {
  const expenses = getFilteredExpenses();
  $("#history-total").textContent = money(sumExpenses(expenses));
  const grouped = groupByDate(expenses);
  const container = $("#history-groups");
  renderHistorySummary(expenses);
  renderHistoryCategoryBlocks(expenses);

  if (!expenses.length) {
    container.innerHTML = emptyStateHtml(tr("noHistory"), tr("addFirstShort"), "add");
    return;
  }

  container.innerHTML = Object.entries(grouped).map(([date, items]) => `
    <section class="history-date-group">
      <div class="date-divider">
        <span>${formatDateHeading(date)}</span>
        <strong>${tr("total", { total: money(sumExpenses(items)) })}</strong>
      </div>
      ${items.map(expenseCardHtml).join("")}
    </section>
  `).join("");
  bindExpenseCards(container);
}

function renderHistorySummary(expenses) {
  const filters = activeFilterLabels();
  const total = sumExpenses(expenses);
  $("#history-filter-summary").innerHTML = `
    <strong>${tr("entries", { count: expenses.length, total: money(total) })}</strong>
    <span>${filters.length ? filters.join(" • ") : tr("savedExpensesShowing")}</span>
  `;
}

function renderHistoryCategoryBlocks(expenses) {
  const rows = categoryTotals(expenses).slice(0, 4);
  $("#history-category-blocks").innerHTML = rows.map((row) => `
    <button type="button" data-filter-category-block="${row.id}">
      <span>${row.name}</span>
      <strong>${money(row.total)}</strong>
    </button>
  `).join("");
  $("#history-category-blocks").querySelectorAll("[data-filter-category-block]").forEach((button) => {
    button.addEventListener("click", () => {
      $("#filter-category").value = button.dataset.filterCategoryBlock;
      renderHistory();
    });
  });
}

function activeFilterLabels() {
  const labels = [];
  const search = $("#search-expense").value.trim();
  if (search) labels.push(tr("search", { value: search }));
  if ($("#filter-category").value) labels.push(getCategory($("#filter-category").value).name);
  if ($("#filter-from").value || $("#filter-to").value) labels.push(tr("dateFilter"));
  if ($("#filter-min").value || $("#filter-max").value) labels.push(tr("amountFilter"));
  return labels;
}

function renderReports() {
  const selectedMonth = $("#report-month").value || monthKey(new Date());
  const summary = getMonthSummary(selectedMonth);
  $("#report-budget").textContent = money(summary.budget);
  $("#report-spent").textContent = money(summary.spent);
  $("#report-remaining").textContent = money(summary.remaining);
  $("#report-average").textContent = money(summary.dailyAverage);
  $("#category-count").textContent = tr("categoryCount", { count: summary.categoryRows.length });
  $("#highest-day").textContent = summary.highestDay ? tr("highestDay", { date: shortDate(summary.highestDay.date) }) : tr("highestDayEmpty");
  $("#month-comparison").textContent = monthComparison(selectedMonth, summary.spent);
  renderReportInsights(summary);
  renderDonut(summary);
  renderDailyBars(summary);
  renderLineChart(summary);
  renderTopExpenses(summary);
}

function renderReportInsights(summary) {
  const previousKey = previousMonthKey(summary.key);
  const previousSpent = sumExpenses(getExpensesForMonth(previousKey));
  const diff = summary.spent - previousSpent;
  const savingsRate = summary.budget ? Math.max(0, (summary.remaining / summary.budget) * 100) : 0;
  const unusual = unusualExpense(summary);
  const forecast = summary.dailyAverage * summary.daysInMonth;
  const exceedText = budgetExceedText(summary, forecast);
  const categoryChange = strongestCategoryChange(summary, previousKey);
  $("#report-insights").innerHTML = [
    insightCard(tr("previousMonth"), previousSpent ? `${diff >= 0 ? "+" : "-"}${money(Math.abs(diff))}` : tr("noData"), diff > 0 ? "warning" : "success"),
    insightCard(tr("savingsRate"), summary.budget ? `${Math.round(savingsRate)}%` : tr("budgetNeeded")),
    insightCard(tr("unusual"), unusual ? `${localizeExpense(unusual).categoryName} ${money(unusual.amount)}` : tr("none")),
    insightCard(tr("action"), exceedText, forecast > summary.budget && summary.budget ? "danger" : "success")
  ].join("");
  if (categoryChange) {
    $("#report-insights").insertAdjacentHTML("beforeend", insightCard(tr("categoryChange"), categoryChange, "warning"));
  }
}

function renderCategories() {
  $("#category-grid").innerHTML = CATEGORIES.map((category) => `
    <button class="category-pill${category.id === selectedCategory ? " active" : ""}" type="button" data-category="${category.id}">
      <span class="cat-icon">${svgIcon(category.id)}</span>
      <small>${getCategory(category.id).short}</small>
    </button>
  `).join("");
  renderQuickCategories();

  $("#filter-category").innerHTML = `<option value="">${tr("allCategories")}</option>${CATEGORIES.map((category) => `<option value="${category.id}">${getCategory(category.id).name}</option>`).join("")}`;

  $("#category-grid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    selectCategory(button.dataset.category);
  });

  $("#quick-category-row")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-category]");
    if (!button) return;
    selectCategory(button.dataset.quickCategory);
  });
}

function renderQuickCategories() {
  const ids = [state.settings.lastUsedCategory, ...mostUsedCategories(), "food", "transport", "groceries"].filter(Boolean);
  const unique = [...new Set(ids)].slice(0, 4);
  $("#quick-category-row").innerHTML = unique.map((id) => {
    const category = getCategory(id);
    return `<button type="button" data-quick-category="${category.id}">${svgIcon(category.id)} ${category.short}</button>`;
  }).join("");
}

function selectCategory(id) {
  selectedCategory = getCategory(id).id;
  $$(".category-pill").forEach((item) => item.classList.toggle("active", item.dataset.category === selectedCategory));
  $$("#quick-category-row button").forEach((item) => item.classList.toggle("active", item.dataset.quickCategory === selectedCategory));
  $("#selected-category-name").textContent = getCategory(selectedCategory).name;
}

function renderExpenseList(container, expenses, compact = false) {
  if (!expenses.length) {
    container.innerHTML = emptyStateHtml(compact ? tr("todayNoExpense") : tr("noExpenseAdded"), tr("addExpense"), "add");
    return;
  }
  container.innerHTML = expenses.map(expenseCardHtml).join("");
  bindExpenseCards(container);
}

function expenseCardHtml(expense) {
  const localized = localizeExpense(expense);
  const recurring = isRecurringExpense(expense) ? `<small class="recurring-badge">${tr("recurring")}</small>` : "";
  return `
    <article class="expense-card" data-expense-id="${expense.id}" tabindex="0">
      <div class="expense-icon">${svgIcon(expense.category)}</div>
      <div class="expense-main">
        <strong>${escapeHtml(localized.categoryName)} ${recurring}</strong>
        <span>${escapeHtml(expense.description || tr("noDescription"))}</span>
        <small>${formatDateTime(expense.date, expense.time)}</small>
      </div>
      <div class="expense-amount">${money(expense.amount)}</div>
    </article>
  `;
}

function bindExpenseCards(container) {
  container.querySelectorAll(".expense-card").forEach((card) => {
    let startX = 0;
    let startY = 0;
    let isHorizontalSwipe = false;
    card.addEventListener("click", () => openExpenseModal(card.dataset.expenseId));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openExpenseModal(card.dataset.expenseId);
    });
    card.addEventListener("touchstart", (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      isHorizontalSwipe = false;
    }, { passive: true });
    card.addEventListener("touchmove", (event) => {
      const diff = event.touches[0].clientX - startX;
      const verticalDiff = Math.abs(event.touches[0].clientY - startY);
      if (Math.abs(diff) > 18 && Math.abs(diff) > verticalDiff * 1.4) isHorizontalSwipe = true;
      if (!isHorizontalSwipe) return;
      card.classList.toggle("swiping-left", diff < -45);
    }, { passive: true });
    card.addEventListener("touchend", (event) => {
      const diff = event.changedTouches[0].clientX - startX;
      const verticalDiff = Math.abs(event.changedTouches[0].clientY - startY);
      card.classList.remove("swiping-left");
      if (isHorizontalSwipe && Math.abs(diff) > verticalDiff * 1.4 && diff < -80) requestDelete(card.dataset.expenseId);
    });
  });
}

function openExpenseModal(id) {
  const expense = state.expenses.find((item) => item.id === id);
  if (!expense) return;
  currentExpenseId = id;
  const localized = localizeExpense(expense);
  $("#expense-details").innerHTML = `
    <div class="detail-grid">
      <div><span>${tr("category")}</span><strong class="detail-category">${svgIcon(expense.category)} ${escapeHtml(localized.categoryName)}</strong></div>
      <div><span>${tr("amount")}</span><strong>${money(expense.amount)}</strong></div>
      <div><span>${tr("description")}</span><strong>${escapeHtml(expense.description || tr("noDescription"))}</strong></div>
      <div><span>${tr("date")}</span><strong>${formatDateHeading(expense.date)}</strong></div>
      <div><span>${tr("time")}</span><strong>${formatTime(expense.time)}</strong></div>
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
  $("#expense-form-mode").textContent = tr("editEntry");
  $("#save-expense").innerHTML = `${svgIcon("save", "ui-icon")}${tr("update")}`;
  $("#cancel-edit").classList.remove("hidden");
  $("#selected-category-name").textContent = getCategory(selectedCategory).name;
  $$(".category-pill").forEach((item) => item.classList.toggle("active", item.dataset.category === selectedCategory));
  switchPage("add");
}

function resetExpenseForm() {
  $("#expense-form").reset();
  amountInputRaw = "";
  $("#editing-expense-id").value = "";
  $("#expense-form-mode").textContent = tr("newEntry");
  $("#save-expense").innerHTML = `${svgIcon("save", "ui-icon")}${tr("saveHome")}`;
  $("#cancel-edit").classList.add("hidden");
  selectCategory(state.settings.lastUsedCategory || CATEGORIES[0].id);
  setCurrentDateTime();
}

function requestDelete(id) {
  closeExpenseModal();
  pendingDelete = { type: "expense", id };
  $("#confirm-title").textContent = tr("deleteExpenseTitle");
  $("#confirm-copy").textContent = tr("deleteExpenseCopy");
  $("#confirm-action").textContent = tr("delete");
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
  showToast(tr("undoDone"));
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
  showToast(tr("monthReset"));
}

function getMonthSummary(key) {
  const expenses = getExpensesForMonth(key).map(localizeExpense).sort(byNewest);
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
  let expenses = getExpensesForMonth(monthKey(new Date())).map(localizeExpense);
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

function categoryTotals(expenses) {
  const rows = new Map();
  expenses.forEach((expense) => {
    const current = rows.get(expense.category) || { id: expense.category, name: getCategory(expense.category).name, total: 0, count: 0 };
    current.total += Number(expense.amount || 0);
    current.count += 1;
    rows.set(expense.category, current);
  });
  return [...rows.values()].sort((a, b) => b.total - a.total);
}

function applyFilterPreset(preset) {
  const today = new Date();
  if (preset === "clear") {
    ["search-expense", "filter-category", "filter-from", "filter-to", "filter-min", "filter-max"].forEach((id) => { $(`#${id}`).value = ""; });
  }
  if (preset === "today") {
    const date = toDateInput(today);
    $("#filter-from").value = date;
    $("#filter-to").value = date;
  }
  if (preset === "week") {
    $("#filter-from").value = toDateInput(new Date(Date.now() - 6 * 86400000));
    $("#filter-to").value = toDateInput(today);
  }
  if (preset === "high") {
    const summary = getMonthSummary(monthKey(today));
    $("#filter-min").value = Math.ceil(summary.dailyAverage || summary.spent / Math.max(1, summary.expenses.length) || 0);
  }
  renderHistory();
}

function renderDonut(summary) {
  if (!summary.categoryRows.length) {
    $("#donut-chart").style.background = `conic-gradient(var(--line) 0 100%)`;
    $("#category-breakdown").innerHTML = emptyStateHtml(tr("categoryNoData"), tr("addExpense"), "add");
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
      <button class="category-row" type="button" data-filter-category="${row.id}">
        <div class="category-row-head">
          <strong class="category-row-title">${svgIcon(row.id)} ${row.name}</strong>
          <strong>${money(row.total)}</strong>
        </div>
        <small>${tr("budgetTransactions", { percent: Math.round(percent), count: row.count })}</small>
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

function emptyStateHtml(message, action, target) {
  return `
    <div class="empty-state">
      ${svgIcon("empty", "ui-icon empty-icon")}
      <strong>${message}</strong>
      <span>${tr("emptyCopy")}</span>
      <button class="ghost-button compact" type="button" data-quick-target="${target}">${action}</button>
    </div>
  `;
}

function insightCard(label, value, tone = "") {
  return `<article class="${tone}"><span>${label}</span><strong>${escapeHtml(String(value))}</strong></article>`;
}

function recentTrend(summary) {
  const today = new Date();
  const last3 = [];
  const prev3 = [];
  for (let offset = 0; offset < 6; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const total = sumExpenses(state.expenses.filter((expense) => expense.date === toDateInput(date)));
    if (offset < 3) last3.push(total);
    else prev3.push(total);
  }
  const recent = sumExpenses(last3.map((amount) => ({ amount })));
  const previous = sumExpenses(prev3.map((amount) => ({ amount })));
  if (!recent && !previous) return tr("noTrend");
  if (recent > previous * 1.12) return tr("increasing");
  if (recent < previous * .88) return tr("decreasing");
  return tr("stable");
}

function mostUsedCategories() {
  const counts = new Map();
  getExpensesForMonth(monthKey(new Date())).forEach((expense) => counts.set(expense.category, (counts.get(expense.category) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

function isRecurringExpense(expense) {
  const base = (expense.description || expense.categoryName || "").trim().toLowerCase();
  if (!base) return false;
  return state.expenses.filter((item) => {
    const itemBase = (item.description || getCategory(item.category).name || "").trim().toLowerCase();
    return item.id !== expense.id && itemBase === base && Math.abs(Number(item.amount) - Number(expense.amount)) < 1;
  }).length >= 1;
}

function unusualExpense(summary) {
  if (summary.expenses.length < 3) return null;
  const average = summary.spent / summary.expenses.length;
  return summary.expenses.find((expense) => expense.amount > average * 2);
}

function budgetExceedText(summary, forecast) {
  if (!summary.budget) return tr("budgetNeeded");
  if (!summary.spent) return tr("notStarted");
  if (forecast <= summary.budget) return tr("withinBudget");
  const dailyAverage = Math.max(1, summary.dailyAverage);
  const daysToExceed = Math.max(0, Math.ceil((summary.budget - summary.spent) / dailyAverage));
  return daysToExceed ? tr("exceedDays", { days: daysToExceed }) : tr("alreadyExceeded");
}

function strongestCategoryChange(summary, previousKey) {
  const previousRows = categoryTotals(getExpensesForMonth(previousKey));
  if (!summary.categoryRows.length || !previousRows.length) return "";
  const changes = summary.categoryRows.map((row) => {
    const previous = previousRows.find((item) => item.id === row.id);
    if (!previous?.total) return null;
    return { name: row.name, pct: ((row.total - previous.total) / previous.total) * 100 };
  }).filter(Boolean).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));
  const top = changes[0];
  if (!top || Math.abs(top.pct) < 10) return tr("noBigChange");
  return tr(top.pct > 0 ? "categoryIncreased" : "categoryDecreased", { name: top.name, percent: Math.round(Math.abs(top.pct)) });
}

function previousMonthKey(key) {
  const [year, month] = key.split("-").map(Number);
  return monthKey(new Date(year, month - 2, 1));
}

function backupData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `hisab-backup-${toDateInput(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function restoreData(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      state = normalizeState(JSON.parse(reader.result));
      saveState();
      renderAll();
      showToast(tr("backupRestored"));
    } catch {
      showToast(tr("restoreFailed"), "warning");
    } finally {
      event.target.value = "";
    }
  });
  reader.readAsText(file);
}

function exportPdf() {
  const summary = getMonthSummary(monthKey(new Date()));
  const win = window.open("", "_blank");
  if (!win) {
    showToast(tr("popupBlocked"), "warning");
    return;
  }
  win.document.write(`
    <html><head><title>${tr("pdfTitle")}</title><style>
      body{font-family:"Plus Jakarta Sans",Arial,sans-serif;padding:24px;color:#212121}
      h1{color:#4CAF50;font-family:"Times New Roman",Times,serif;text-align:center} table{width:100%;border-collapse:collapse;margin-top:18px}
      td,th{border:1px solid #ddd;padding:8px;text-align:left;vertical-align:top}
      .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
      .summary div{padding:14px;border:1px solid #ddd;border-radius:12px}
    </style></head><body>
      <h1>${tr("pdfHeading", { month: monthLabelFromKey(summary.key) })}</h1>
      <div class="summary">
        <div><strong>${tr("budget")}</strong><br>${money(summary.budget)}</div>
        <div><strong>${tr("spent")}</strong><br>${money(summary.spent)}</div>
        <div><strong>${tr("remaining")}</strong><br>${money(summary.remaining)}</div>
      </div>
      <table><thead><tr><th>${tr("date")}</th><th>${tr("time")}</th><th>${tr("category")}</th><th>${tr("description")}</th><th>${tr("amount")}</th></tr></thead><tbody>
      ${summary.expenses.map((expense) => `<tr><td>${expense.date}</td><td>${formatTime(expense.time)}</td><td>${escapeHtml(localizeExpense(expense).categoryName)}</td><td>${escapeHtml(expense.description || "")}</td><td>${money(expense.amount)}</td></tr>`).join("")}
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
  if (percent >= 100) showToast(tr("budgetOverToast", { amount: money(Math.abs(summary.remaining)) }), "danger");
  else if (percent >= 90) showToast(tr("budgetAlmostDone", { amount: money(summary.remaining) }), "danger");
  else if (percent >= 75) showToast(tr("budget75"), "warning");
  else if (percent >= 50) showToast(tr("budget50"), "warning");
}

function renderBudgetAlert(summary, percent) {
  const alert = $("#budget-alert");
  const dot = $("#alert-dot");
  let message = "";
  if (summary.budget && percent >= 100) message = tr("budgetOverAlert", { amount: money(Math.abs(summary.remaining)) });
  else if (summary.budget && percent >= 90) message = tr("budget90Alert", { amount: money(summary.remaining) });
  else if (summary.budget && percent >= 75) message = tr("budget75Alert");
  else if (summary.budget && percent >= 50) message = tr("budget50Alert");
  alert.textContent = message;
  alert.classList.toggle("hidden", !message);
  dot.classList.toggle("hidden", !message);
}

function showSuccessOverlay(expense) {
  $("#success-copy").textContent = tr("savedTo", { amount: money(expense.amount), category: localizeExpense(expense).categoryName });
  $("#success-overlay").classList.remove("hidden");
  clearTimeout(successOverlayTimer);
  successOverlayTimer = setTimeout(() => $("#success-overlay").classList.add("hidden"), 1300);
}

function applyTheme() {
  const theme = THEMES[state.settings.accentTheme] || THEMES.royal;
  document.documentElement.style.setProperty("--primary", theme.primary);
  document.documentElement.style.setProperty("--secondary", theme.secondary);
  document.documentElement.style.setProperty("--accent", theme.accent);
  document.body.classList.toggle("dark", state.settings.darkMode);
  document.body.classList.toggle("performance-mode", !!state.settings.performanceMode);
  $("#theme-toggle").innerHTML = svgIcon(state.settings.darkMode ? "sun" : "moon", "ui-icon");
  const performanceToggle = $("#performance-toggle");
  if (performanceToggle) {
    performanceToggle.classList.toggle("active", !!state.settings.performanceMode);
    performanceToggle.setAttribute("aria-pressed", String(!!state.settings.performanceMode));
    const label = performanceToggle.querySelector("[data-performance-label]");
    if (label) label.textContent = state.settings.performanceMode ? tr("smoothOn") : tr("smoothMode");
  }
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
  if (hour < 5) return tr("goodNight");
  if (hour < 12) return tr("goodMorning");
  if (hour < 17) return tr("goodAfternoon");
  if (hour < 21) return tr("goodEvening");
  return tr("goodNight");
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
  const category = CATEGORIES.find((item) => item.id === id) || CATEGORIES[0];
  return { ...category, ...categoryLabel(category.id) };
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabelFromKey(key) {
  const [year, month] = key.split("-").map(Number);
  return `${monthNames()[month - 1]} ${year}`;
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
  const suffix = dateString === today ? tr("todaySuffix") : dateString === yesterday ? tr("yesterdaySuffix") : "";
  return `${date.getDate()} ${monthNames()[date.getMonth()]} ${date.getFullYear()}${suffix}`;
}

function shortDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getDate()} ${monthNames()[date.getMonth()].slice(0, 3)}`;
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
  if (!previousSpent) return tr("noPreviousData");
  const diff = spent - previousSpent;
  if (diff === 0) return tr("sameAsLastMonth");
  return tr("monthMoreLess", { amount: money(Math.abs(diff)), direction: diff > 0 ? tr("more") : tr("less") });
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}
