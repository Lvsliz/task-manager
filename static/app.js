const NEW_PROJECT_VALUE = "__new_project__";
const VIEW_CURRENT = "current";
const VIEW_ALL = "all";
const VIEW_ATTENTION = "attention";
const VIEW_COMPLETED = "completed";
const VIEW_PROJECT_PREFIX = "project:";
const TASK_PANEL_WIDTH_KEY = "taskPanelWidthPx";
const THEME_KEY = "worklogTheme";
const MIN_TIMELINE_WIDTH = 360;
const MIN_TASKS_WIDTH = 360;
const QUICK_LOG_IDEAL_WIDTH = 860;
const QUICK_LOG_MIN_WIDTH = 700;
const QUICK_LOG_SAFE_GAP = 24;
const ANALYSIS_POLL_INTERVAL = 4000;

const THEMES = [
  {
    id: "default-blue",
    name: "默认蓝",
    accent: "#2f63ff",
    soft: "#eaf0ff",
  },
  {
    id: "calm-gray",
    name: "静谧灰",
    accent: "#596a80",
    soft: "#e9edf2",
  },
  {
    id: "forest-green",
    name: "森林绿",
    accent: "#2f7d5c",
    soft: "#e5f2ec",
  },
  {
    id: "warm-orange",
    name: "暖橙",
    accent: "#d97706",
    soft: "#fff0dc",
  },
  {
    id: "violet",
    name: "紫罗兰",
    accent: "#7357d8",
    soft: "#eee9ff",
  },
  {
    id: "teal",
    name: "湖青",
    accent: "#0f8b8d",
    soft: "#e0f2f2",
  },
  {
    id: "rose",
    name: "玫瑰",
    accent: "#c05678",
    soft: "#fae8ee",
  },
  {
    id: "indigo",
    name: "靛青",
    accent: "#4f46e5",
    soft: "#e8e7ff",
  },
  {
    id: "graphite",
    name: "石墨",
    accent: "#3f4756",
    soft: "#e8ebef",
  },
  {
    id: "mint",
    name: "薄荷",
    accent: "#159a7f",
    soft: "#ddf5ef",
  },
  {
    id: "amber",
    name: "琥珀",
    accent: "#b7791f",
    soft: "#fff3d6",
  },
  {
    id: "wine",
    name: "酒红",
    accent: "#9f3a5b",
    soft: "#f8e4ec",
  },
  {
    id: "navy",
    name: "海军",
    accent: "#1d4e89",
    soft: "#e3eef8",
  },
  {
    id: "lime",
    name: "青柠",
    accent: "#6b8e23",
    soft: "#eff6d8",
  },
  {
    id: "terracotta",
    name: "赤陶",
    accent: "#b55332",
    soft: "#fae8df",
  },
];

const DEFAULTS = {
  projectName: "General",
  inboxTaskName: "Inbox",
  categoryName: "Misc",
  categoryColor: "#9B9B9B",
  remindAfterDays: 3,
  progressPercent: 0,
  progressStep: 25,
  estimatedDays: 3,
};

const ICONS = {
  app: `
    <path class="brand-paper" d="M7.2 4.8h7.2l3.4 3.4v10.1c0 .9-.7 1.6-1.6 1.6h-9c-.9 0-1.6-.7-1.6-1.6V6.4c0-.9.7-1.6 1.6-1.6Z"></path>
    <path class="brand-fold" d="M14.3 5v3.5h3.5"></path>
    <path class="brand-line" d="M8.4 9.1h5.3"></path>
    <path class="brand-line" d="M8.4 12.2h3.6"></path>
    <path class="brand-line" d="M8.4 15.3h1.8"></path>
    <path class="brand-check" d="M12.8 13.1l2.1 2.2 4.6-5.2"></path>
  `,
  plus: `
    <path d="M12 5v14"></path>
    <path d="M5 12h14"></path>
  `,
  target: `
    <circle cx="12" cy="12" r="7"></circle>
    <circle cx="12" cy="12" r="2.4"></circle>
    <path d="M12 2.5v2.2"></path>
    <path d="M12 19.3v2.2"></path>
    <path d="M2.5 12h2.2"></path>
    <path d="M19.3 12h2.2"></path>
  `,
  list: `
    <path d="M9 7h10"></path>
    <path d="M9 12h10"></path>
    <path d="M9 17h10"></path>
    <circle cx="5" cy="7" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
    <circle cx="5" cy="17" r="1"></circle>
  `,
  lightbulb: `
    <path d="M9 18h6"></path>
    <path d="M10 21h4"></path>
    <path d="M8.2 14.6A6.2 6.2 0 1 1 15.8 14.6c-.8.6-1.3 1.5-1.5 2.4H9.7c-.2-.9-.7-1.8-1.5-2.4Z"></path>
    <path d="M12 6.8v4.1"></path>
    <path d="M10 10.9h4"></path>
  `,
  sparkles: `
    <path d="M12 3.5l1.4 4.1 4.1 1.4-4.1 1.4L12 14.5l-1.4-4.1-4.1-1.4 4.1-1.4Z"></path>
    <path d="M18.5 13.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z"></path>
    <path d="M5.5 14.8l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6Z"></path>
  `,
  checkCircle: `
    <circle cx="12" cy="12" r="8"></circle>
    <path d="M8.5 12.3l2.3 2.3 4.8-5.2"></path>
  `,
  folder: `
    <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"></path>
  `,
  upload: `
    <path d="M12 16V5"></path>
    <path d="M8 9l4-4 4 4"></path>
    <path d="M4.5 15.5v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"></path>
  `,
  gear: `
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19 12a7.3 7.3 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a7.5 7.5 0 0 0-1.8-1L14.4 3h-4.8l-.3 3.1a7.5 7.5 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a7.3 7.3 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a7.5 7.5 0 0 0 1.8 1l.3 3.1h4.8l.3-3.1a7.5 7.5 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5c.1-.3.1-.7.1-1Z"></path>
  `,
  note: `
    <path d="M7 4.5h7.2l3.3 3.3V19a1.5 1.5 0 0 1-1.5 1.5H7A1.5 1.5 0 0 1 5.5 19V6A1.5 1.5 0 0 1 7 4.5Z"></path>
    <path d="M14 4.8V8h3.2"></path>
    <path d="M8.5 12h7"></path>
    <path d="M8.5 15.5h4"></path>
  `,
  pencil: `
    <path d="M4.5 19.5l4.1-.9 9.8-9.8a2.1 2.1 0 0 0-3-3L5.6 15.6Z"></path>
    <path d="M14.3 6.9l2.8 2.8"></path>
  `,
  pin: `
    <path d="M14.5 4.5l5 5"></path>
    <path d="M9.5 14.5l-5 5"></path>
    <path d="M6.7 12.6l4.9-4.9-.8-2.4 2-2 8 8-2 2-2.4-.8-4.9 4.9Z"></path>
  `,
  rotateLeft: `
    <path d="M8 7H4V3"></path>
    <path d="M4.4 7.2A8 8 0 1 1 4 16"></path>
  `,
};

const state = {
  tasks: [],
  projects: [],
  selectedTaskId: null,
  inboxTaskId: null,
  staleTasks: [],
  pendingDuration: 0,
  editingTaskId: null,
  editingLog: null,
  activeView: localStorage.getItem("activeView") || VIEW_CURRENT,
  currentAnalysis: null,
  analysisPollTimer: null,
  boardSyncPollTimer: null,
  selectedAnalysisIds: new Set(),
  analysisExportMode: false,
  activePromptPreset: "custom",
  suppressPromptInputEvent: false,
};

const el = {
  timelineTaskName: document.getElementById("timelineTaskName"),
  timelineEmpty: document.getElementById("timelineEmpty"),
  timeline: document.getElementById("timeline"),
  taskList: document.getElementById("taskList"),
  taskListTitle: document.getElementById("taskListTitle"),
  editCurrentProjectButton: document.getElementById("editCurrentProjectButton"),
  logInput: document.getElementById("logInput"),
  quickLogForm: document.getElementById("quickLogForm"),
  boardSyncButton: document.getElementById("boardSyncButton"),
  newTaskButton: document.getElementById("newTaskButton"),
  sidebarNewTaskButton: document.getElementById("sidebarNewTaskButton"),
  projectNav: document.getElementById("projectNav"),
  allTaskCount: document.getElementById("allTaskCount"),
  attentionTaskCount: document.getElementById("attentionTaskCount"),
  completedTaskCount: document.getElementById("completedTaskCount"),
  navItems: [...document.querySelectorAll("[data-view]")],
  taskModal: document.getElementById("taskModal"),
  taskModalTitle: document.getElementById("taskModalTitle"),
  taskForm: document.getElementById("taskForm"),
  taskIdInput: document.getElementById("taskIdInput"),
  taskNameInput: document.getElementById("taskNameInput"),
  projectSelect: document.getElementById("projectSelect"),
  projectNameInput: document.getElementById("projectNameInput"),
  newProjectLabel: document.getElementById("newProjectLabel"),
  taskStatusLabel: document.getElementById("taskStatusLabel"),
  taskStatusSelect: document.getElementById("taskStatusSelect"),
  taskReminderLabel: document.getElementById("taskReminderLabel"),
  taskReminderSelect: document.getElementById("taskReminderSelect"),
  taskProgressLabel: document.getElementById("taskProgressLabel"),
  taskProgressInput: document.getElementById("taskProgressInput"),
  taskProgressStepLabel: document.getElementById("taskProgressStepLabel"),
  taskProgressStepInput: document.getElementById("taskProgressStepInput"),
  taskEstimatedDaysLabel: document.getElementById("taskEstimatedDaysLabel"),
  taskEstimatedDaysInput: document.getElementById("taskEstimatedDaysInput"),
  taskFolderLabel: document.getElementById("taskFolderLabel"),
  taskFolderInput: document.getElementById("taskFolderInput"),
  openTaskFolderFromModal: document.getElementById("openTaskFolderFromModal"),
  exportTaskButton: document.getElementById("exportTaskButton"),
  importTaskButton: document.getElementById("importTaskButton"),
  importTaskFileInput: document.getElementById("importTaskFileInput"),
  taskImportStatus: document.getElementById("taskImportStatus"),
  saveTaskButton: document.getElementById("saveTaskButton"),
  cancelTaskModal: document.getElementById("cancelTaskModal"),
  logEditModal: document.getElementById("logEditModal"),
  logEditForm: document.getElementById("logEditForm"),
  logEditContentInput: document.getElementById("logEditContentInput"),
  logEditHint: document.getElementById("logEditHint"),
  cancelLogEditModal: document.getElementById("cancelLogEditModal"),
  saveLogEditButton: document.getElementById("saveLogEditButton"),
  timeMode: document.getElementById("timeMode"),
  timeValue: document.getElementById("timeValue"),
  customDateTime: document.getElementById("customDateTime"),
  durationButton: document.getElementById("durationButton"),
  durationBadge: document.getElementById("durationBadge"),
  staleIndicator: document.getElementById("staleIndicator"),
  staleCount: document.getElementById("staleCount"),
  stalePanel: document.getElementById("stalePanel"),
  staleList: document.getElementById("staleList"),
  workspace: document.querySelector(".workspace"),
  sidebar: document.querySelector(".sidebar"),
  timelinePanel: document.querySelector(".timeline-panel"),
  analyzeCurrentTaskButton: document.getElementById("analyzeCurrentTaskButton"),
  panelResizeHandle: document.getElementById("panelResizeHandle"),
  settingsButton: document.getElementById("settingsButton"),
  settingsModal: document.getElementById("settingsModal"),
  closeSettingsModal: document.getElementById("closeSettingsModal"),
  themeOptions: document.getElementById("themeOptions"),
  resetLayoutWidthButton: document.getElementById("resetLayoutWidthButton"),
  boardSyncPersonInput: document.getElementById("boardSyncPersonInput"),
  boardSyncDirInput: document.getElementById("boardSyncDirInput"),
  boardSyncLogScopeSelect: document.getElementById("boardSyncLogScopeSelect"),
  boardSyncAutoEnabledInput: document.getElementById("boardSyncAutoEnabledInput"),
  boardSyncAutoTimeInput: document.getElementById("boardSyncAutoTimeInput"),
  saveBoardSyncSettingsButton: document.getElementById("saveBoardSyncSettingsButton"),
  syncBoardNowButton: document.getElementById("syncBoardNowButton"),
  boardSyncStatus: document.getElementById("boardSyncStatus"),
  aiBaseUrlInput: document.getElementById("aiBaseUrlInput"),
  aiModelInput: document.getElementById("aiModelInput"),
  aiApiKeyInput: document.getElementById("aiApiKeyInput"),
  clearAiApiKeyInput: document.getElementById("clearAiApiKeyInput"),
  saveAiSettingsButton: document.getElementById("saveAiSettingsButton"),
  testAiSettingsButton: document.getElementById("testAiSettingsButton"),
  aiSettingsStatus: document.getElementById("aiSettingsStatus"),
  projectModal: document.getElementById("projectModal"),
  projectForm: document.getElementById("projectForm"),
  projectIdInput: document.getElementById("projectIdInput"),
  projectNameEditInput: document.getElementById("projectNameEditInput"),
  cancelProjectModal: document.getElementById("cancelProjectModal"),
  analysisModal: document.getElementById("analysisModal"),
  analysisModalTitle: document.getElementById("analysisModalTitle"),
  analysisContent: document.getElementById("analysisContent"),
  closeAnalysisModal: document.getElementById("closeAnalysisModal"),
  analysisCenterModal: document.getElementById("analysisCenterModal"),
  closeAnalysisCenterModal: document.getElementById("closeAnalysisCenterModal"),
  analysisCenterCurrentTaskButton: document.getElementById("analysisCenterCurrentTaskButton"),
  analysisHistoryList: document.getElementById("analysisHistoryList"),
  startAnalysisExportButton: document.getElementById("startAnalysisExportButton"),
  exportSelectedAnalysisButton: document.getElementById("exportSelectedAnalysisButton"),
  exportAllAnalysisButton: document.getElementById("exportAllAnalysisButton"),
  cancelAnalysisExportButton: document.getElementById("cancelAnalysisExportButton"),
  weeklySummaryButton: document.getElementById("weeklySummaryButton"),
  halfMonthSummaryButton: document.getElementById("halfMonthSummaryButton"),
  monthlySummaryButton: document.getElementById("monthlySummaryButton"),
  halfYearSummaryButton: document.getElementById("halfYearSummaryButton"),
  yearSummaryButton: document.getElementById("yearSummaryButton"),
  summaryStartDate: document.getElementById("summaryStartDate"),
  summaryEndDate: document.getElementById("summaryEndDate"),
  customSummaryButton: document.getElementById("customSummaryButton"),
  periodSummaryStatus: document.getElementById("periodSummaryStatus"),
  analysisPromptTypeSelect: document.getElementById("analysisPromptTypeSelect"),
  analysisPromptPresetSelect: document.getElementById("analysisPromptPresetSelect"),
  taskAnalysisPromptInput: document.getElementById("taskAnalysisPromptInput"),
  saveTaskAnalysisPromptButton: document.getElementById("saveTaskAnalysisPromptButton"),
  resetTaskAnalysisPromptButton: document.getElementById("resetTaskAnalysisPromptButton"),
  taskAnalysisPromptStatus: document.getElementById("taskAnalysisPromptStatus"),
};

el.logInput.dataset.placeholder =
  "写下快速进展，Enter 提交，Shift+Enter 换行，Ctrl+B 加粗";

function setupAutoScrollbars() {
  document.querySelectorAll(".scroll-surface").forEach((surface) => {
    surface.addEventListener(
      "scroll",
      () => {
        flashScrollbar(surface);
      },
      { passive: true }
    );
  });
}

function canResizePanels() {
  return window.matchMedia("(min-width: 1101px)").matches;
}

function maxTaskPanelWidth() {
  const workspaceWidth = el.workspace ? el.workspace.getBoundingClientRect().width : 0;
  return Math.max(MIN_TASKS_WIDTH, Math.floor(workspaceWidth - MIN_TIMELINE_WIDTH));
}

function clampTaskPanelWidth(width) {
  const numericWidth = asNumber(width, 0);
  return Math.min(Math.max(numericWidth, MIN_TASKS_WIDTH), maxTaskPanelWidth());
}

function setTaskPanelWidth(width, shouldPersist = true) {
  if (!el.workspace || !canResizePanels()) {
    return;
  }
  const clamped = clampTaskPanelWidth(width);
  el.workspace.style.setProperty("--tasks-panel-width", `${clamped}px`);
  el.workspace.classList.add("is-custom-layout");
  if (shouldPersist) {
    localStorage.setItem(TASK_PANEL_WIDTH_KEY, String(clamped));
  }
}

function resetTaskPanelWidth() {
  if (!el.workspace) {
    return;
  }
  el.workspace.style.removeProperty("--tasks-panel-width");
  el.workspace.classList.remove("is-custom-layout");
  localStorage.removeItem(TASK_PANEL_WIDTH_KEY);
}

function applySavedTaskPanelWidth() {
  const saved = asNumber(localStorage.getItem(TASK_PANEL_WIDTH_KEY), null);
  if (saved) {
    setTaskPanelWidth(saved, false);
  }
}

function setupPanelResizer() {
  if (!el.workspace || !el.panelResizeHandle) {
    return;
  }

  applySavedTaskPanelWidth();

  el.panelResizeHandle.addEventListener("dblclick", () => {
    resetTaskPanelWidth();
    focusLogInput();
  });

  el.panelResizeHandle.addEventListener("pointerdown", (event) => {
    if (!canResizePanels()) {
      return;
    }
    event.preventDefault();
    el.panelResizeHandle.setPointerCapture(event.pointerId);
    el.panelResizeHandle.classList.add("is-dragging");
    document.body.classList.add("is-resizing-panels");

    const onPointerMove = (moveEvent) => {
      const rect = el.workspace.getBoundingClientRect();
      const width = rect.right - moveEvent.clientX;
      setTaskPanelWidth(width);
      positionQuickLogBar();
    };

    const stopDragging = () => {
      el.panelResizeHandle.classList.remove("is-dragging");
      document.body.classList.remove("is-resizing-panels");
      el.panelResizeHandle.removeEventListener("pointermove", onPointerMove);
      el.panelResizeHandle.removeEventListener("pointerup", stopDragging);
      el.panelResizeHandle.removeEventListener("pointercancel", stopDragging);
      focusLogInput();
    };

    el.panelResizeHandle.addEventListener("pointermove", onPointerMove);
    el.panelResizeHandle.addEventListener("pointerup", stopDragging);
    el.panelResizeHandle.addEventListener("pointercancel", stopDragging);
  });

  window.addEventListener("resize", () => {
    const saved = asNumber(localStorage.getItem(TASK_PANEL_WIDTH_KEY), null);
    if (saved && canResizePanels()) {
      setTaskPanelWidth(saved, false);
    }
    positionQuickLogBar();
  });
}

function positionQuickLogBar() {
  if (!el.quickLogForm || !el.timelinePanel) {
    return;
  }
  if (!canResizePanels()) {
    el.quickLogForm.style.left = "";
    el.quickLogForm.style.right = "";
    el.quickLogForm.style.width = "";
    return;
  }

  const timelineRect = el.timelinePanel.getBoundingClientRect();
  const sidebarRect = el.sidebar ? el.sidebar.getBoundingClientRect() : { right: 0 };
  const viewportAvailable = Math.max(0, window.innerWidth - sidebarRect.right - QUICK_LOG_SAFE_GAP * 2);
  const width = Math.max(
    Math.min(QUICK_LOG_MIN_WIDTH, viewportAvailable),
    Math.min(QUICK_LOG_IDEAL_WIDTH, viewportAvailable)
  );
  const center = timelineRect.left + timelineRect.width / 2;
  const minLeft = sidebarRect.right + QUICK_LOG_SAFE_GAP;
  const maxLeft = window.innerWidth - width - QUICK_LOG_SAFE_GAP;
  const left = Math.min(Math.max(center - width / 2, minLeft), maxLeft);

  el.quickLogForm.style.left = `${Math.round(left)}px`;
  el.quickLogForm.style.right = "auto";
  el.quickLogForm.style.width = `${Math.round(width)}px`;
}

function iconSvg(name) {
  const body = ICONS[name] || ICONS.note;
  return `<svg class="app-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}

function setIcon(target, name) {
  if (target) {
    target.innerHTML = iconSvg(name);
  }
}

function iconElement(name, className = "") {
  const span = document.createElement("span");
  span.className = className;
  setIcon(span, name);
  return span;
}

function renderStaticIcons() {
  document.querySelectorAll("[data-icon]").forEach((node) => {
    setIcon(node, node.dataset.icon);
  });
}

function currentThemeId() {
  return localStorage.getItem(THEME_KEY) || "default-blue";
}

function applyTheme(themeId) {
  const selectedTheme = THEMES.some((theme) => theme.id === themeId)
    ? themeId
    : "default-blue";
  if (selectedTheme === "default-blue") {
    document.body.removeAttribute("data-theme");
  } else {
    document.body.dataset.theme = selectedTheme;
  }
  localStorage.setItem(THEME_KEY, selectedTheme);
  renderThemeOptions();
}

function renderThemeOptions() {
  if (!el.themeOptions) {
    return;
  }
  const activeTheme = currentThemeId();
  el.themeOptions.innerHTML = "";
  THEMES.forEach((theme) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-option";
    button.classList.toggle("active", theme.id === activeTheme);
    button.style.setProperty("--swatch-accent", theme.accent);
    button.style.setProperty("--swatch-soft", theme.soft);

    const swatch = document.createElement("span");
    swatch.className = "theme-swatch";
    swatch.append(document.createElement("span"), document.createElement("span"));

    const label = document.createElement("strong");
    label.textContent = theme.name;

    button.append(swatch, label);
    button.addEventListener("click", () => applyTheme(theme.id));
    el.themeOptions.appendChild(button);
  });
}

function openSettingsModal() {
  renderThemeOptions();
  el.settingsModal.classList.remove("hidden");
  void loadBoardSyncSettings();
  void loadAiSettings();
}

function closeSettingsModal() {
  el.settingsModal.classList.add("hidden");
  focusLogInput();
}

function setAiSettingsStatus(message, type = "") {
  el.aiSettingsStatus.textContent = message || "";
  el.aiSettingsStatus.dataset.type = type;
}

function setBoardSyncStatus(message, type = "") {
  if (!el.boardSyncStatus) {
    return;
  }
  el.boardSyncStatus.textContent = message || "";
  el.boardSyncStatus.dataset.type = type;
}

function setBoardSyncBusy(isBusy) {
  if (el.boardSyncButton) {
    el.boardSyncButton.disabled = isBusy;
  }
  if (el.syncBoardNowButton) {
    el.syncBoardNowButton.disabled = isBusy;
  }
  if (el.saveBoardSyncSettingsButton) {
    el.saveBoardSyncSettingsButton.disabled = isBusy;
  }
}

function setTaskImportStatus(message, type = "") {
  if (!el.taskImportStatus) {
    return;
  }
  el.taskImportStatus.textContent = message || "";
  el.taskImportStatus.dataset.type = type;
}

async function loadBoardSyncSettings() {
  if (!el.boardSyncPersonInput) {
    return;
  }
  const response = await fetch("/api/settings/board-sync");
  const settings = await response.json().catch(() => ({}));
  if (!response.ok) {
    setBoardSyncStatus("无法读取看板同步设置。", "error");
    return;
  }
  el.boardSyncPersonInput.value = settings.person_name || "";
  el.boardSyncDirInput.value = settings.sync_dir || "";
  el.boardSyncLogScopeSelect.value = settings.log_scope || "all";
  el.boardSyncAutoEnabledInput.checked = Boolean(settings.auto_sync_enabled);
  el.boardSyncAutoTimeInput.value = settings.auto_sync_time || "18:00";
  setBoardSyncStatus("");
}

async function saveBoardSyncSettings({ silent = false } = {}) {
  if (!el.boardSyncPersonInput) {
    return false;
  }
  if (!silent) {
    setBoardSyncStatus("正在保存同步设置...", "pending");
  }
  const response = await fetch("/api/settings/board-sync", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      person_name: el.boardSyncPersonInput.value.trim(),
      sync_dir: el.boardSyncDirInput.value.trim(),
      log_scope: el.boardSyncLogScopeSelect.value,
      auto_sync_enabled: el.boardSyncAutoEnabledInput.checked,
      auto_sync_time: el.boardSyncAutoTimeInput.value || "18:00",
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    setBoardSyncStatus(data.error || "同步设置保存失败。", "error");
    return false;
  }
  if (!silent) {
    const autoText = el.boardSyncAutoEnabledInput.checked
      ? `每天 ${el.boardSyncAutoTimeInput.value || "18:00"} 自动同步。`
      : "自动同步未启用。";
    setBoardSyncStatus(`同步设置已保存。${autoText}`, "success");
  }
  return true;
}

function renderBoardSyncStatus(status) {
  if (!status || status.status === "idle") {
    return;
  }
  if (status.status === "running") {
    setBoardSyncBusy(true);
    setBoardSyncStatus("正在同步到看板目录...", "pending");
    return;
  }
  setBoardSyncBusy(false);
  if (status.status === "success") {
    const detail = [
      `同步成功：${status.task_count || 0} 个任务`,
      `${status.log_count || 0} 条日志`,
      status.duration_seconds != null ? `耗时 ${status.duration_seconds}s` : "",
      status.output_dir ? `目录：${status.output_dir}` : "",
    ]
      .filter(Boolean)
      .join("，");
    setBoardSyncStatus(detail, "success");
    return;
  }
  if (status.status === "failed") {
    setBoardSyncStatus(status.error || "同步失败。", "error");
  }
}

function stopBoardSyncPolling() {
  if (state.boardSyncPollTimer) {
    window.clearInterval(state.boardSyncPollTimer);
    state.boardSyncPollTimer = null;
  }
}

function startBoardSyncPolling() {
  stopBoardSyncPolling();
  state.boardSyncPollTimer = window.setInterval(async () => {
    const response = await fetch("/api/board-sync/status");
    const status = await response.json().catch(() => ({}));
    if (!response.ok) {
      stopBoardSyncPolling();
      setBoardSyncBusy(false);
      setBoardSyncStatus("无法读取同步状态。", "error");
      return;
    }
    renderBoardSyncStatus(status);
    if (status.status !== "running") {
      stopBoardSyncPolling();
    }
  }, 1000);
}

async function syncBoardNow({ saveSettings = false } = {}) {
  if (saveSettings) {
    const saved = await saveBoardSyncSettings({ silent: true });
    if (!saved) {
      return;
    }
  }
  setBoardSyncBusy(true);
  setBoardSyncStatus("正在启动同步...", "pending");
  const response = await fetch("/api/board-sync/export", { method: "POST" });
  const status = await response.json().catch(() => ({}));
  if (!response.ok) {
    setBoardSyncBusy(false);
    setBoardSyncStatus(status.error || "同步启动失败。", "error");
    return;
  }
  renderBoardSyncStatus(status);
  if (status.status === "running") {
    startBoardSyncPolling();
  }
}

async function loadAiSettings() {
  const response = await fetch("/api/settings/ai");
  if (!response.ok) {
    setAiSettingsStatus("无法读取 AI 设置。", "error");
    return;
  }
  const settings = await response.json();
  el.aiBaseUrlInput.value = settings.base_url || "";
  el.aiModelInput.value = settings.model || "";
  el.aiApiKeyInput.value = "";
  el.aiApiKeyInput.placeholder = settings.has_api_key
    ? `已保存 ${settings.api_key_preview}，留空不修改`
    : "请输入 API Key";
  if (el.taskAnalysisPromptInput) {
    const field = currentAnalysisPromptField();
    setPromptInputValue(settings[field] || "");
    syncPromptPresetFromContent();
  }
  el.clearAiApiKeyInput.checked = false;
  setAiSettingsStatus("");
}

async function saveAiSettings() {
  setAiSettingsStatus("正在保存...", "pending");
  const response = await fetch("/api/settings/ai", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      base_url: el.aiBaseUrlInput.value.trim(),
      model: el.aiModelInput.value.trim(),
      api_key: el.aiApiKeyInput.value.trim(),
      clear_api_key: el.clearAiApiKeyInput.checked,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    setAiSettingsStatus(data.error || "AI 设置保存失败。", "error");
    return false;
  }
  el.aiApiKeyInput.value = "";
  el.aiApiKeyInput.placeholder = data.has_api_key
    ? `已保存 ${data.api_key_preview}，留空不修改`
    : "请输入 API Key";
  el.clearAiApiKeyInput.checked = false;
  setAiSettingsStatus("AI 设置已保存。", "success");
  return true;
}

async function testAiSettings() {
  const saved = await saveAiSettings();
  if (!saved) {
    return;
  }
  setAiSettingsStatus("正在测试连接...", "pending");
  const response = await fetch("/api/settings/ai/test", { method: "POST" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) {
    setAiSettingsStatus(data.error || "测试连接失败。", "error");
    return;
  }
  setAiSettingsStatus(`连接成功：${data.message || "OK"}`, "success");
}

function setTaskAnalysisPromptStatus(message, type = "") {
  if (!el.taskAnalysisPromptStatus) {
    return;
  }
  el.taskAnalysisPromptStatus.textContent = message || "";
  el.taskAnalysisPromptStatus.dataset.type = type;
}

function setPeriodSummaryStatus(message, type = "") {
  if (!el.periodSummaryStatus) {
    return;
  }
  el.periodSummaryStatus.textContent = message || "";
  el.periodSummaryStatus.dataset.type = type;
}

function currentAnalysisPromptType() {
  return el.analysisPromptTypeSelect ? el.analysisPromptTypeSelect.value : "task";
}

function currentAnalysisPromptField() {
  const type = currentAnalysisPromptType();
  const fields = {
    task: "task_analysis_prompt",
    week: "weekly_summary_prompt",
    half_month: "half_month_summary_prompt",
    month: "monthly_summary_prompt",
    half_year: "half_year_summary_prompt",
    year: "year_summary_prompt",
    range: "range_summary_prompt",
  };
  return fields[type] || fields.task;
}

function currentAnalysisPromptLabel() {
  const labels = {
    task: "当前任务",
    week: "本周",
    half_month: "本半月",
    month: "本月",
    half_year: "本半年",
    year: "本年度",
    range: "所选阶段",
  };
  return labels[currentAnalysisPromptType()] || "当前任务";
}

function periodOutputTitle() {
  const titles = {
    task: "任务复盘",
    week: "周报",
    half_month: "半月报",
    month: "月报",
    half_year: "半年总结",
    year: "年度总结",
    range: "阶段总结",
  };
  return titles[currentAnalysisPromptType()] || "任务复盘";
}

function analysisPromptPresetText(presetId) {
  const scope = currentAnalysisPromptLabel();
  const outputTitle = periodOutputTitle();
  const commonRules = [
    "- 使用中文。",
    "- 只基于日志内容判断，不要编造事实。",
    "- 输出 Markdown。",
    "- 如果信息不足，请明确说明信息不足。",
  ].join("\n");

  const presets = {
    pragmatic: `你是一个务实的工作日志复盘助手。请基于${scope}的日志，生成一份清晰、可执行的${outputTitle}。
要求：
${commonRules}
- 重点说明已经推进了什么、卡在哪里、下一步应该做什么。
- 不要写空泛评价，优先写可以直接指导工作的结论。

请按以下结构输出：
## 总体判断
## 主要进展
## 关键问题
## 可能遗漏
## 下一步建议`,

    brief: `你是一个简洁的工作汇报整理助手。请基于${scope}的日志，生成一份适合直接填写汇报的${outputTitle}。
要求：
${commonRules}
- 尽量简短，只挑重点说。
- 不展开背景，不写长篇复盘。
- 优先写结果、进展、风险和下一步。
- 如果没有明确进展，请直接说明“暂无关键进展”或“信息不足”。

请按以下结构输出：
## 简要总结
## 重点进展
## 风险
## 下一步`,

    manager: `你是一个面向管理者的工作汇报助手。请把${scope}的日志整理成适合向上汇报的${outputTitle}。
要求：
${commonRules}
- 语言要简洁、客观、可汇报。
- 突出结果、进度、风险和需要协调的事项。
- 不要展开过多执行细节，保留管理者需要看到的信息。

请按以下结构输出：
## 汇报摘要
## 已完成事项
## 当前状态
## 风险与依赖
## 需要关注或协调`,

    risk: `你是一个偏风险管理视角的工作日志分析助手。请基于${scope}的日志，识别风险、阻塞和遗漏。
要求：
${commonRules}
- 优先找出延期风险、需求不清、反复返工、外部依赖、验证不足等问题。
- 区分“已经发生的问题”和“可能发生的风险”。
- 给出具体缓解建议。

请按以下结构输出：
## 当前风险等级
## 已暴露问题
## 潜在风险
## 缺失信息
## 缓解建议`,

    action: `你是一个行动计划整理助手。请基于${scope}的日志，把复盘结果转成下一步行动清单。
要求：
${commonRules}
- 重点输出下一步要做什么，而不是长篇总结。
- 每条行动尽量具体、可执行、可检查。
- 如果日志里无法判断负责人或截止时间，请不要编造。

请按以下结构输出：
## 当前结论
## 下一步行动
## 待确认问题
## 需要跟进的风险
## 建议记录到日志里的信息`,

    four_f: `你是一个使用 4F 复盘法的工作日志分析助手。请基于${scope}的日志进行复盘。
要求：
${commonRules}
- Facts 只写日志中能看到的事实。
- Feelings 可以理解为工作状态和推进感受，但不要过度揣测。
- Findings 提炼模式、问题和经验。
- Future 给出下一阶段建议。

请按以下结构输出：
## Facts 事实
## Feelings 状态
## Findings 发现
## Future 下一步`,
  };

  return presets[presetId] || "";
}

function detectPromptPreset(text) {
  const value = String(text || "").trim();
  const presetIds = ["pragmatic", "brief", "manager", "risk", "action", "four_f"];
  return presetIds.find((id) => analysisPromptPresetText(id).trim() === value) || "custom";
}

function analysisPromptPresetLabel(presetId) {
  const labels = {
    custom: "自定义",
    pragmatic: "务实复盘",
    brief: "简约总结",
    manager: "管理汇报",
    risk: "风险排查",
    action: "行动计划",
    four_f: "4F 复盘",
  };
  return labels[presetId] || "";
}

function setPromptInputValue(value) {
  if (!el.taskAnalysisPromptInput) {
    return;
  }
  state.suppressPromptInputEvent = true;
  el.taskAnalysisPromptInput.value = value || "";
  state.suppressPromptInputEvent = false;
}

function syncPromptPresetFromContent() {
  if (!el.analysisPromptPresetSelect || !el.taskAnalysisPromptInput) {
    return;
  }
  const preset = detectPromptPreset(el.taskAnalysisPromptInput.value);
  state.activePromptPreset = preset;
  el.analysisPromptPresetSelect.value = preset;
}

function formatAnalysisTime(value) {
  const time = parseTimeValue(value);
  if (!time) {
    return "时间未知";
  }
  const date = new Date(time);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function analysisStatusText(status) {
  if (status === "running" || status === "pending") {
    return "分析中";
  }
  if (status === "completed") {
    return "已完成";
  }
  if (status === "failed") {
    return "失败";
  }
  return "未知";
}

function analysisHistorySourceLabel(scopeType) {
  const labels = {
    task: "快速分析",
    period_week: "周报",
    period_half_month: "半月总结",
    period_month: "月报",
    period_half_year: "半年总结",
    period_year: "年度总结",
    period_range: "自定义总结",
  };
  return labels[scopeType] || "分析";
}

function analysisHistoryTitleText(analysis) {
  const sourceLabel = analysisHistorySourceLabel(analysis.scope_type);
  if (analysis.scope_type && analysis.scope_type.startsWith("period_")) {
    const rawTitle = analysis.title || sourceLabel;
    const colonIndex = rawTitle.indexOf("：");
    if (colonIndex >= 0) {
      return rawTitle.slice(colonIndex + 1).trim() || rawTitle;
    }
    return rawTitle === sourceLabel ? "" : rawTitle;
  }

  return analysis.task_name || analysis.title || "未知任务";
}

function renderAnalysisHistory(items) {
  if (!el.analysisHistoryList) {
    return;
  }
  el.analysisHistoryList.innerHTML = "";
  const visibleIds = new Set(items.map((analysis) => analysis.id));
  [...state.selectedAnalysisIds].forEach((id) => {
    if (!visibleIds.has(id)) {
      state.selectedAnalysisIds.delete(id);
    }
  });
  updateAnalysisExportButtons();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "analysis-placeholder";
    empty.textContent = "还没有分析记录。";
    el.analysisHistoryList.appendChild(empty);
    return;
  }

  items.forEach((analysis) => {
    const row = document.createElement("div");
    row.className = "analysis-history-row";
    row.classList.toggle("is-exporting", state.analysisExportMode);

    if (state.analysisExportMode) {
      const checkWrap = document.createElement("label");
      checkWrap.className = "analysis-history-check";
      checkWrap.title = "选择导出";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = state.selectedAnalysisIds.has(analysis.id);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          state.selectedAnalysisIds.add(analysis.id);
        } else {
          state.selectedAnalysisIds.delete(analysis.id);
        }
        updateAnalysisExportButtons();
      });
      checkWrap.appendChild(checkbox);
      row.appendChild(checkWrap);
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "analysis-history-item";

    const header = document.createElement("div");
    header.className = "analysis-history-title";

    const sourceTag = document.createElement("span");
    sourceTag.className = "analysis-history-tag";
    sourceTag.textContent = analysisHistorySourceLabel(analysis.scope_type);
    header.appendChild(sourceTag);

    if (analysis.prompt_preset_label) {
      const presetTag = document.createElement("span");
      presetTag.className = "analysis-history-tag analysis-history-tag-muted";
      presetTag.textContent = analysis.prompt_preset_label;
      header.appendChild(presetTag);
    }

    const title = document.createElement("strong");
    title.textContent = analysisHistoryTitleText(analysis);
    header.appendChild(title);

    const meta = document.createElement("span");
    meta.className = "analysis-history-meta";
    const project = analysis.project_name ? `${displayProjectName(analysis.project_name)} · ` : "";
    meta.textContent = `${project}${analysisStatusText(analysis.status)} · ${formatAnalysisTime(
      analysis.completed_at || analysis.created_at
    )}`;

    button.append(header, meta);
    button.addEventListener("click", async () => {
      const latest = await loadAnalysisRun(analysis.id);
      showAnalysisStatus(latest || analysis);
    });
    row.appendChild(button);
    el.analysisHistoryList.appendChild(row);
  });
}

function updateAnalysisExportButtons() {
  if (el.startAnalysisExportButton) {
    el.startAnalysisExportButton.classList.toggle("hidden", state.analysisExportMode);
  }
  if (el.exportSelectedAnalysisButton) {
    el.exportSelectedAnalysisButton.classList.toggle("hidden", !state.analysisExportMode);
    el.exportSelectedAnalysisButton.disabled = state.selectedAnalysisIds.size === 0;
  }
  if (el.exportAllAnalysisButton) {
    el.exportAllAnalysisButton.classList.toggle("hidden", !state.analysisExportMode);
  }
  if (el.cancelAnalysisExportButton) {
    el.cancelAnalysisExportButton.classList.toggle("hidden", !state.analysisExportMode);
  }
}

function setAnalysisExportMode(enabled) {
  state.analysisExportMode = Boolean(enabled);
  if (!state.analysisExportMode) {
    state.selectedAnalysisIds.clear();
  }
  updateAnalysisExportButtons();
  void loadAnalysisHistory();
}

function filenameFromDisposition(value, fallback) {
  const match = /filename\*=UTF-8''([^;]+)/i.exec(value || "");
  if (match) {
    try {
      return decodeURIComponent(match[1]);
    } catch (_error) {
      return match[1];
    }
  }
  return fallback;
}

async function downloadResponseMarkdown(response, fallbackName) {
  const blob = await response.blob();
  const filename = filenameFromDisposition(
    response.headers.get("Content-Disposition"),
    fallbackName
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function exportAnalysisRuns({ all = false } = {}) {
  const ids = [...state.selectedAnalysisIds];
  if (!all && !ids.length) {
    updateAnalysisExportButtons();
    return;
  }
  const response = await fetch("/api/analysis/runs/export.md", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(all ? { all: true } : { ids }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    window.alert(data.error || "导出分析日志失败");
    return;
  }
  await downloadResponseMarkdown(response, all ? "analysis-runs.md" : "selected-analysis-runs.md");
  setAnalysisExportMode(false);
}

function toDateInputValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function currentWeekRange() {
  const today = new Date();
  const day = today.getDay() || 7;
  const start = new Date(today);
  start.setDate(today.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

function currentMonthRange() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

function currentHalfYearRange() {
  const today = new Date();
  const startMonth = today.getMonth() < 6 ? 0 : 6;
  const endMonth = today.getMonth() < 6 ? 5 : 11;
  const start = new Date(today.getFullYear(), startMonth, 1);
  const end = new Date(today.getFullYear(), endMonth + 1, 0);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

function currentYearRange() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 1);
  const end = new Date(today.getFullYear(), 11, 31);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

function currentHalfMonthRange() {
  const today = new Date();
  const startDay = today.getDate() <= 15 ? 1 : 16;
  const endDay = today.getDate() <= 15
    ? 15
    : new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const start = new Date(today.getFullYear(), today.getMonth(), startDay);
  const end = new Date(today.getFullYear(), today.getMonth(), endDay);
  return { start: toDateInputValue(start), end: toDateInputValue(end) };
}

function setupSummaryDateDefaults() {
  if (!el.summaryStartDate || !el.summaryEndDate) {
    return;
  }
  const week = currentWeekRange();
  el.summaryStartDate.value = el.summaryStartDate.value || week.start;
  el.summaryEndDate.value = el.summaryEndDate.value || week.end;
}

async function pollAnalysisUntilDone(analysisId) {
  for (let i = 0; i < 120; i += 1) {
    const analysis = await loadAnalysisRun(analysisId);
    if (analysis && !isAnalysisRunning(analysis)) {
      return analysis;
    }
    await new Promise((resolve) => window.setTimeout(resolve, ANALYSIS_POLL_INTERVAL));
  }
  return null;
}

async function startPeriodSummary(rangeType, startDate, endDate) {
  if (!startDate || !endDate) {
    setPeriodSummaryStatus("请选择有效的时间范围。", "error");
    return;
  }
  setPeriodSummaryStatus("阶段总结已启动，可以先处理其他任务。", "pending");
  const response = await fetch("/api/analysis/periods", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      range_type: rangeType,
      start_date: startDate,
      end_date: endDate,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    setPeriodSummaryStatus(data.error || "阶段总结启动失败。", "error");
    return;
  }

  const analysis = normalizeAnalysis(data.analysis);
  if (!analysis) {
    setPeriodSummaryStatus("没有返回阶段总结任务。", "error");
    return;
  }
  setPeriodSummaryStatus("阶段总结分析中，完成后会自动打开结果。", "pending");
  await loadAnalysisHistory();
  const completed = await pollAnalysisUntilDone(analysis.id);
  await loadAnalysisHistory();
  if (!completed) {
    setPeriodSummaryStatus("阶段总结仍在后台分析中，稍后可在分析历史中查看。", "pending");
    return;
  }
  setPeriodSummaryStatus(
    completed.status === "failed" ? "阶段总结失败。" : "阶段总结已完成。",
    completed.status === "failed" ? "error" : "success"
  );
  showAnalysisStatus(completed);
}

async function loadAnalysisHistory() {
  if (!el.analysisHistoryList) {
    return;
  }
  el.analysisHistoryList.innerHTML = "";
  const loading = document.createElement("div");
  loading.className = "analysis-placeholder";
  loading.textContent = "正在读取分析历史...";
  el.analysisHistoryList.appendChild(loading);

  const response = await fetch("/api/analysis/runs?limit=30");
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    renderAnalysisHistory([]);
    return;
  }
  const items = Array.isArray(data.analyses) ? data.analyses.map(normalizeAnalysis) : [];
  renderAnalysisHistory(items.filter(Boolean));
}

async function openAnalysisCenterModal() {
  if (!el.analysisCenterModal) {
    return;
  }
  el.analysisCenterModal.classList.remove("hidden");
  setTaskAnalysisPromptStatus("");
  setPeriodSummaryStatus("");
  setupSummaryDateDefaults();
  await Promise.all([loadAiSettings(), loadAnalysisHistory()]);
}

function closeAnalysisCenterModal() {
  if (!el.analysisCenterModal) {
    return;
  }
  el.analysisCenterModal.classList.add("hidden");
  focusLogInput();
}

async function saveTaskAnalysisPrompt() {
  if (!el.taskAnalysisPromptInput) {
    return;
  }
  const prompt = el.taskAnalysisPromptInput.value.trim();
  if (!prompt) {
    setTaskAnalysisPromptStatus("提示词不能为空。", "error");
    return;
  }
  setTaskAnalysisPromptStatus("正在保存...", "pending");
  const field = currentAnalysisPromptField();
  const promptType = currentAnalysisPromptType();
  const preset = detectPromptPreset(prompt);
  const response = await fetch("/api/settings/ai", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      [field]: prompt,
      prompt_type: promptType,
      prompt_preset: preset,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    setTaskAnalysisPromptStatus(data.error || "提示词保存失败。", "error");
    return;
  }
  setPromptInputValue(data[field] || prompt);
  syncPromptPresetFromContent();
  setTaskAnalysisPromptStatus("提示词已保存。", "success");
}

async function resetTaskAnalysisPrompt() {
  if (!el.taskAnalysisPromptInput) {
    return;
  }
  setTaskAnalysisPromptStatus("正在恢复默认...", "pending");
  const response = await fetch(`/api/settings/ai/prompts/${currentAnalysisPromptType()}/reset`, {
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    setTaskAnalysisPromptStatus(data.error || "恢复默认失败。", "error");
    return;
  }
  setPromptInputValue(data[currentAnalysisPromptField()] || "");
  syncPromptPresetFromContent();
  setTaskAnalysisPromptStatus("已恢复默认提示词。", "success");
}

function openProjectModal(project) {
  if (!project || project.name === DEFAULTS.projectName) {
    return;
  }
  el.projectIdInput.value = String(project.id);
  el.projectNameEditInput.value = project.name;
  el.projectModal.classList.remove("hidden");
  window.requestAnimationFrame(() => el.projectNameEditInput.focus());
}

function closeProjectModal() {
  el.projectModal.classList.add("hidden");
  el.projectForm.reset();
  focusLogInput();
}

function openAnalysisModal(title, content, type = "markdown") {
  el.analysisModalTitle.lastChild.textContent = title || "任务分析";
  el.analysisModal.classList.remove("hidden");
  if (type === "status") {
    el.analysisContent.textContent = "";
    const status = document.createElement("p");
    status.className = "analysis-status";
    status.textContent = content;
    el.analysisContent.appendChild(status);
  } else {
    renderMarkdownBlock(el.analysisContent, content);
  }
}

function closeAnalysisModal() {
  el.analysisModal.classList.add("hidden");
  focusLogInput();
}

function updateAnalysisButton() {
  const task = currentTask() || inboxTask();
  const analysis =
    task && state.currentAnalysis && state.currentAnalysis.task_id === task.id
      ? state.currentAnalysis
      : null;

  el.analyzeCurrentTaskButton.classList.toggle("is-running", isAnalysisRunning(analysis));
  el.analyzeCurrentTaskButton.classList.remove("is-idle");
  el.analyzeCurrentTaskButton.disabled = false;

  if (isAnalysisRunning(analysis)) {
    el.analyzeCurrentTaskButton.replaceChildren(
      iconElement("sparkles", "button-icon"),
      document.createTextNode("分析中")
    );
    return;
  }
  if (analysis && analysis.status === "completed" && !isAnalysisStale(analysis, task)) {
    el.analyzeCurrentTaskButton.replaceChildren(
      iconElement("sparkles", "button-icon"),
      document.createTextNode("查看分析")
    );
    return;
  }
  if (analysis && analysis.status === "failed") {
    el.analyzeCurrentTaskButton.replaceChildren(
      iconElement("rotateLeft", "button-icon"),
      document.createTextNode("重新分析")
    );
    return;
  }
  el.analyzeCurrentTaskButton.replaceChildren(
    iconElement("sparkles", "button-icon"),
    document.createTextNode("快速分析")
  );
  el.analyzeCurrentTaskButton.classList.add("is-idle");
}

function stopAnalysisPolling() {
  if (state.analysisPollTimer) {
    window.clearInterval(state.analysisPollTimer);
    state.analysisPollTimer = null;
  }
}

async function loadAnalysisRun(analysisId) {
  const response = await fetch(`/api/analysis/runs/${analysisId}`);
  if (!response.ok) {
    return null;
  }
  const data = await response.json().catch(() => ({}));
  return normalizeAnalysis(data.analysis);
}

function showAnalysisStatus(analysis) {
  if (!analysis) {
    openAnalysisModal("任务分析", "还没有分析结果。", "status");
    return;
  }
  if (isAnalysisRunning(analysis)) {
    openAnalysisModal(
      analysis.title || "任务分析",
      "分析已在后台进行。你可以关闭这个窗口，继续记录或切换任务，稍后再回来查看结果。",
      "status"
    );
    return;
  }
  if (analysis.status === "failed") {
    openAnalysisModal(
      analysis.title || "任务分析",
      analysis.error_message ? `分析失败：${analysis.error_message}` : "分析失败，可以稍后重试。",
      "status"
    );
    return;
  }
  openAnalysisModal(
    analysis.title || "任务分析",
    analysis.result_markdown || "没有返回分析内容。"
  );
}

function startAnalysisPolling(analysisId) {
  stopAnalysisPolling();
  state.analysisPollTimer = window.setInterval(async () => {
    const analysis = await loadAnalysisRun(analysisId);
    if (!analysis) {
      return;
    }
    state.currentAnalysis = analysis;
    updateAnalysisButton();

    if (!isAnalysisRunning(analysis)) {
      stopAnalysisPolling();
      if (!el.analysisModal.classList.contains("hidden")) {
        showAnalysisStatus(analysis);
      }
    }
  }, ANALYSIS_POLL_INTERVAL);
}

async function refreshCurrentAnalysisStatus() {
  const task = currentTask() || inboxTask();
  stopAnalysisPolling();
  updateAnalysisButton();
  if (!task) {
    state.currentAnalysis = null;
    updateAnalysisButton();
    return;
  }

  const response = await fetch(`/api/analysis/tasks/${task.id}/latest`);
  if (!response.ok) {
    return;
  }
  const data = await response.json().catch(() => ({}));
  const analysis = normalizeAnalysis(data.analysis);
  if (!analysis || analysis.task_id !== task.id) {
    if (!isAnalysisRunning(state.currentAnalysis) || state.currentAnalysis.task_id !== task.id) {
      state.currentAnalysis = null;
      updateAnalysisButton();
    }
    return;
  }
  state.currentAnalysis = analysis;
  updateAnalysisButton();
  if (isAnalysisRunning(analysis)) {
    startAnalysisPolling(analysis.id);
  }
}

async function analyzeCurrentTask() {
  const task = currentTask() || inboxTask();
  if (!task) {
    return;
  }

  if (state.currentAnalysis && state.currentAnalysis.task_id === task.id) {
    if (isAnalysisRunning(state.currentAnalysis)) {
      showAnalysisStatus(state.currentAnalysis);
      startAnalysisPolling(state.currentAnalysis.id);
      return;
    }
    if (
      state.currentAnalysis.status === "completed" &&
      !isAnalysisStale(state.currentAnalysis, task)
    ) {
      showAnalysisStatus(state.currentAnalysis);
      return;
    }
  }

  openAnalysisModal(
    "任务分析",
    "分析任务已启动。你可以关闭这个窗口，继续处理其他任务。",
    "status"
  );
  el.analyzeCurrentTaskButton.disabled = true;
  try {
    const response = await fetch(`/api/analysis/tasks/${task.id}`, {
      method: "POST",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      openAnalysisModal("任务分析", data.error || "分析失败。", "status");
      return;
    }
    state.currentAnalysis = normalizeAnalysis(data.analysis);
    updateAnalysisButton();
    if (state.currentAnalysis) {
      showAnalysisStatus(state.currentAnalysis);
      if (isAnalysisRunning(state.currentAnalysis)) {
        startAnalysisPolling(state.currentAnalysis.id);
      }
    }
  } finally {
    el.analyzeCurrentTaskButton.disabled = false;
    updateAnalysisButton();
  }
}

async function saveProject(projectId, payload) {
  return fetch(`/api/projects/${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function asNumber(value, fallback = null) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeProject(project) {
  return {
    id: asNumber(project && project.id),
    name: (project && project.name) || DEFAULTS.projectName,
    created_at: (project && project.created_at) || null,
  };
}

function normalizeTask(task) {
  const status = task && task.status === "completed" ? "completed" : "active";
  const projectName = (task && task.project_name) || DEFAULTS.projectName;
  const name = (task && task.name) || "Untitled Task";
  const remindAfterDays = asNumber(
    task && task.remind_after_days,
    DEFAULTS.remindAfterDays
  );
  const progressPercent = Math.min(
    Math.max(asNumber(task && task.progress_percent, DEFAULTS.progressPercent), 0),
    100
  );
  const progressStep = Math.min(
    Math.max(asNumber(task && task.progress_step, DEFAULTS.progressStep), 1),
    100
  );
  const estimatedDays = Math.max(
    asNumber(task && task.estimated_days, DEFAULTS.estimatedDays),
    0.5
  );

  return {
    id: asNumber(task && task.id),
    name,
    project_id: asNumber(task && task.project_id),
    project_name: projectName,
    category_id: asNumber(task && task.category_id),
    category_name: (task && task.category_name) || DEFAULTS.categoryName,
    category_color: (task && task.category_color) || DEFAULTS.categoryColor,
    status,
    created_at: (task && task.created_at) || null,
    last_log_time: (task && task.last_log_time) || null,
    remind_after_days: remindAfterDays,
    progress_percent: progressPercent,
    progress_step: progressStep,
    estimated_days: estimatedDays,
    remaining_days: asNumber(task && task.remaining_days, null),
    folder_path: (task && task.folder_path) || "",
    stale_level: (task && task.stale_level) || null,
    stale_days: asNumber(task && task.stale_days, null),
    is_inbox:
      Boolean(task && task.is_inbox) ||
      (name === DEFAULTS.inboxTaskName && projectName === DEFAULTS.projectName),
  };
}

function normalizeLog(log) {
  return {
    id: asNumber(log && log.id),
    task_id: asNumber(log && log.task_id),
    content: (log && log.content) || "",
    log_time: (log && log.log_time) || null,
    time_label: (log && log.time_label) || "",
    date_label: (log && log.date_label) || "Today",
    duration: asNumber(log && log.duration, null),
    created_at: (log && log.created_at) || null,
    can_edit: Boolean(log && log.can_edit),
    editable_until: (log && log.editable_until) || null,
    is_pinned: Boolean(log && log.is_pinned),
    pinned_at: (log && log.pinned_at) || null,
  };
}

function normalizeAnalysis(analysis) {
  if (!analysis || !analysis.id) {
    return null;
  }
  const status = ["pending", "running", "completed", "failed"].includes(analysis.status)
    ? analysis.status
    : "completed";
  return {
    id: asNumber(analysis.id),
    scope_type: analysis.scope_type || "task",
    task_id: asNumber(analysis.task_id, null),
    title: analysis.title || "任务分析",
    result_markdown: analysis.result_markdown || "",
    status,
    error_message: analysis.error_message || "",
    prompt_preset: analysis.prompt_preset || "",
    prompt_preset_label: analysis.prompt_preset_label || "",
    prompt_snapshot: analysis.prompt_snapshot || "",
    created_at: analysis.created_at || null,
    completed_at: analysis.completed_at || null,
    task_name: analysis.task_name || "",
    project_name: analysis.project_name || "",
  };
}

function isAnalysisRunning(analysis) {
  return analysis && (analysis.status === "pending" || analysis.status === "running");
}

function parseTimeValue(value) {
  if (!value) {
    return null;
  }
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function isAnalysisStale(analysis, task) {
  if (!analysis || !task || analysis.status !== "completed") {
    return false;
  }
  const analyzedAt = parseTimeValue(analysis.completed_at) || parseTimeValue(analysis.created_at);
  const lastLogAt = parseTimeValue(task.last_log_time);
  return Boolean(analyzedAt && lastLogAt && lastLogAt > analyzedAt);
}

function displayTaskName(task) {
  if (!task) {
    return "快速记录";
  }
  return task.is_inbox ? "快速记录" : task.name;
}

function displayProjectName(name) {
  return name === DEFAULTS.projectName ? "常用分组" : name;
}

function displayDateLabel(label) {
  if (label === "Today") {
    return "今天";
  }
  if (label === "Yesterday") {
    return "昨天";
  }
  return label;
}

function focusLogInput() {
  window.requestAnimationFrame(() => el.logInput.focus());
}

function flashScrollbar(surface) {
  if (!surface) {
    return;
  }
  surface.classList.add("is-scrolling");
  window.clearTimeout(surface.scrollbarTimer);
  surface.scrollbarTimer = window.setTimeout(() => {
    surface.classList.remove("is-scrolling");
  }, 900);
}

function resizeLogInput() {
  el.logInput.style.height = "auto";
  el.logInput.style.height = `${Math.min(el.logInput.scrollHeight, 150)}px`;
  if (el.logInput.scrollHeight > el.logInput.clientHeight) {
    flashScrollbar(el.logInput);
  }
}

function markdownFromNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || "";
  }

  if (node.nodeName === "BR") {
    return "\n";
  }

  const childText = [...node.childNodes].map(markdownFromNode).join("");
  if (isBoldNode(node)) {
    return childText ? `**${childText}**` : "";
  }

  if (node !== el.logInput && (node.nodeName === "DIV" || node.nodeName === "P")) {
    return `${childText}\n`;
  }

  return childText;
}

function isBoldNode(node) {
  if (node.nodeName === "STRONG" || node.nodeName === "B") {
    return true;
  }
  if (!(node instanceof HTMLElement)) {
    return false;
  }
  const inlineWeight = node.style.fontWeight || "";
  if (inlineWeight === "bold" || inlineWeight === "bolder") {
    return true;
  }
  const numericInlineWeight = Number(inlineWeight);
  if (Number.isFinite(numericInlineWeight) && numericInlineWeight >= 600) {
    return true;
  }
  return false;
}

function logInputMarkdown() {
  return markdownFromNode(el.logInput).replace(/\n+$/g, "");
}

function setLogInputMarkdown(value) {
  renderInlineMarkdown(el.logInput, value || "");
  resizeLogInput();
}

function insertNodeAtLogSelection(node) {
  el.logInput.focus();
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) {
    el.logInput.appendChild(node);
    return;
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function insertLogInputNewline() {
  insertNodeAtLogSelection(document.createElement("br"));
  resizeLogInput();
}

function toggleLogInputBold() {
  el.logInput.focus();
  document.execCommand("bold", false);
  resizeLogInput();
}

function renderInlineMarkdown(container, content) {
  container.textContent = "";
  const text = content || "";
  const boldPattern = /\*\*(.+?)\*\*/gs;
  let lastIndex = 0;
  let match = boldPattern.exec(text);

  while (match) {
    if (match.index > lastIndex) {
      container.appendChild(
        document.createTextNode(text.slice(lastIndex, match.index))
      );
    }

    const strong = document.createElement("strong");
    strong.textContent = match[1];
    container.appendChild(strong);
    lastIndex = boldPattern.lastIndex;
    match = boldPattern.exec(text);
  }

  if (lastIndex < text.length) {
    container.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

function appendMarkdownInline(parent, text) {
  const span = document.createElement("span");
  renderInlineMarkdown(span, text || "");
  parent.appendChild(span);
}

function renderMarkdownBlock(container, markdown) {
  container.textContent = "";
  const lines = String(markdown || "").split(/\r?\n/);
  let list = null;

  function closeList() {
    if (list) {
      container.appendChild(list);
      list = null;
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      closeList();
      return;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length + 2, 4);
      const node = document.createElement(`h${level}`);
      appendMarkdownInline(node, heading[2]);
      container.appendChild(node);
      return;
    }

    const bullet = /^[-*]\s+(.+)$/.exec(trimmed);
    if (bullet) {
      if (!list) {
        list = document.createElement("ul");
      }
      const item = document.createElement("li");
      appendMarkdownInline(item, bullet[1]);
      list.appendChild(item);
      return;
    }

    closeList();
    const paragraph = document.createElement("p");
    appendMarkdownInline(paragraph, trimmed);
    container.appendChild(paragraph);
  });

  closeList();
}

function currentTask() {
  return state.tasks.find((task) => task.id === state.selectedTaskId) || null;
}

function inboxTask() {
  return state.tasks.find((task) => task.id === state.inboxTaskId) || null;
}

function defaultTaskId() {
  return state.selectedTaskId || state.inboxTaskId;
}

function currentProjectName() {
  const task = currentTask() || inboxTask();
  return task ? task.project_name : DEFAULTS.projectName;
}

function defaultProjectNameForNewTask() {
  const project = currentViewProject();
  return project ? project.name : currentProjectName();
}

function taskLastTouched(task) {
  const value = task.last_log_time || task.created_at;
  const time = value ? Date.parse(value) : Number.NaN;
  return Number.isFinite(time) ? time : 0;
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.is_inbox && !b.is_inbox) {
      return -1;
    }
    if (!a.is_inbox && b.is_inbox) {
      return 1;
    }
    const byTime = taskLastTouched(b) - taskLastTouched(a);
    if (byTime !== 0) {
      return byTime;
    }
    return displayTaskName(a).localeCompare(displayTaskName(b), "zh-CN");
  });
}

function viewTitle() {
  if (state.activeView === VIEW_CURRENT) {
    return "当前任务";
  }
  if (state.activeView === VIEW_ALL) {
    return "全部任务";
  }
  if (state.activeView === VIEW_ATTENTION) {
    return "需关注";
  }
  if (state.activeView === VIEW_COMPLETED) {
    return "已完成";
  }
  if (state.activeView.startsWith(VIEW_PROJECT_PREFIX)) {
    const projectId = asNumber(state.activeView.slice(VIEW_PROJECT_PREFIX.length));
    const project = state.projects.find((item) => item.id === projectId);
    return project ? displayProjectName(project.name) : "项目";
  }
  return "任务列表";
}

function currentViewProject() {
  if (!state.activeView.startsWith(VIEW_PROJECT_PREFIX)) {
    return null;
  }
  const projectId = asNumber(state.activeView.slice(VIEW_PROJECT_PREFIX.length));
  return state.projects.find((project) => project.id === projectId) || null;
}

function renderCurrentProjectAction() {
  const project = currentViewProject();
  const canEdit = project && project.name !== DEFAULTS.projectName;
  el.editCurrentProjectButton.classList.toggle("hidden", !canEdit);
  if (canEdit) {
    el.editCurrentProjectButton.setAttribute("aria-label", `编辑项目 ${project.name}`);
  }
}

function visibleTasksForView() {
  if (state.activeView === VIEW_ATTENTION) {
    return sortTasks(state.tasks.filter((task) => task.status === "active" && task.stale_level));
  }
  if (state.activeView === VIEW_COMPLETED) {
    return sortTasks(state.tasks.filter((task) => task.status === "completed"));
  }
  if (state.activeView.startsWith(VIEW_PROJECT_PREFIX)) {
    const projectId = asNumber(state.activeView.slice(VIEW_PROJECT_PREFIX.length));
    return sortTasks(state.tasks.filter((task) => task.project_id === projectId));
  }
  return sortTasks(state.tasks);
}

function setActiveView(view) {
  state.activeView = view || VIEW_CURRENT;
  localStorage.setItem("activeView", state.activeView);
  renderNavigation();
  renderTasks();
  renderStaleTasks();
  focusLogInput();
}

function setSelectedTask(taskId) {
  state.selectedTaskId = taskId || state.inboxTaskId;
  localStorage.setItem("selectedTaskId", String(state.selectedTaskId));
  renderTasks();
  renderCurrentTask();
  void loadLogs();
  void refreshCurrentAnalysisStatus();
  focusLogInput();
}

function renderCurrentTask() {
  const task = currentTask() || inboxTask();
  el.timelineTaskName.textContent = displayTaskName(task);
  updateAnalysisButton();
}

function renderNavigation() {
  el.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === state.activeView);
  });

  el.allTaskCount.textContent = String(state.tasks.length);
  el.attentionTaskCount.textContent = String(state.staleTasks.length);
  el.completedTaskCount.textContent = String(
    state.tasks.filter((task) => task.status === "completed").length
  );

  el.projectNav.innerHTML = "";
  state.projects.forEach((project) => {
    const item = document.createElement("div");
    const view = `${VIEW_PROJECT_PREFIX}${project.id}`;
    item.className = "nav-item project-nav-item";
    item.dataset.view = view;
    item.classList.toggle("active", state.activeView === view);

    const icon = iconElement("folder", "nav-icon");

    const main = document.createElement("button");
    main.type = "button";
    main.className = "project-nav-main";

    const label = document.createElement("span");
    label.textContent = displayProjectName(project.name);

    const count = document.createElement("span");
    count.className = "nav-count";
    count.textContent = String(state.tasks.filter((task) => task.project_id === project.id).length);

    main.append(icon, label);
    main.addEventListener("click", () => setActiveView(view));
    item.appendChild(main);
    if (project.name !== DEFAULTS.projectName) {
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "project-nav-edit";
      editButton.setAttribute("aria-label", `编辑项目 ${project.name}`);
      editButton.title = "编辑项目";
      editButton.appendChild(iconElement("pencil", "button-icon"));
      editButton.addEventListener("click", (event) => {
        event.stopPropagation();
        openProjectModal(project);
      });
      item.appendChild(editButton);
    }
    item.appendChild(count);
    el.projectNav.appendChild(item);
  });
}

function renderProjectOptions(selectedName) {
  el.projectSelect.innerHTML = "";

  state.projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.name;
    option.textContent = displayProjectName(project.name);
    el.projectSelect.appendChild(option);
  });

  const newOption = document.createElement("option");
  newOption.value = NEW_PROJECT_VALUE;
  newOption.textContent = "新建项目...";
  el.projectSelect.appendChild(newOption);

  const hasMatch = state.projects.some((project) => project.name === selectedName);
  if (hasMatch) {
    el.projectSelect.value = selectedName;
    el.projectNameInput.value = "";
  } else {
    el.projectSelect.value = NEW_PROJECT_VALUE;
    el.projectNameInput.value =
      selectedName && selectedName !== NEW_PROJECT_VALUE ? selectedName : "";
  }

  syncProjectInput();
}

function syncProjectInput() {
  const showInput = el.projectSelect.value === NEW_PROJECT_VALUE;
  el.newProjectLabel.classList.toggle("hidden", !showInput);
  el.projectNameInput.required = showInput;
}

function resolvedProjectName() {
  if (el.projectSelect.value === NEW_PROJECT_VALUE) {
    return el.projectNameInput.value.trim();
  }
  return el.projectSelect.value;
}

function openTaskModal(task = null) {
  state.editingTaskId = task ? task.id : null;
  el.taskModal.classList.remove("hidden");
  el.taskIdInput.value = task ? String(task.id) : "";
  el.taskNameInput.value = task ? task.name : "";
  renderProjectOptions(task ? task.project_name : defaultProjectNameForNewTask());
  el.taskStatusLabel.classList.toggle("hidden", !task);
  el.taskStatusSelect.value = task ? task.status : "active";
  el.taskReminderLabel.classList.toggle("hidden", !task);
  el.taskReminderSelect.value = String(
    task ? task.remind_after_days || DEFAULTS.remindAfterDays : DEFAULTS.remindAfterDays
  );
  el.taskProgressLabel.classList.toggle("hidden", !task);
  el.taskProgressInput.value = String(task ? task.progress_percent : DEFAULTS.progressPercent);
  el.taskProgressStepLabel.classList.toggle("hidden", !task);
  el.taskProgressStepInput.value = String(task ? task.progress_step : DEFAULTS.progressStep);
  el.taskEstimatedDaysLabel.classList.toggle("hidden", !task);
  el.taskEstimatedDaysInput.value = String(task ? task.estimated_days : DEFAULTS.estimatedDays);
  el.taskFolderLabel.classList.toggle("hidden", !task || task.is_inbox);
  el.taskFolderInput.value = task && !task.is_inbox ? task.folder_path || "" : "";
  el.openTaskFolderFromModal.disabled = !task || task.is_inbox || !task.folder_path;
  el.exportTaskButton.classList.toggle("hidden", !task);
  el.importTaskButton.classList.toggle("hidden", Boolean(task));
  setTaskImportStatus("");
  el.taskModalTitle.textContent = task ? "编辑任务" : "新建任务";
  el.saveTaskButton.textContent = task ? "保存修改" : "保存任务";
  window.requestAnimationFrame(() => el.taskNameInput.focus());
}

function closeTaskModal() {
  state.editingTaskId = null;
  el.taskModal.classList.add("hidden");
  el.taskForm.reset();
  el.newProjectLabel.classList.add("hidden");
  el.taskStatusLabel.classList.add("hidden");
  el.taskReminderLabel.classList.add("hidden");
  el.taskProgressLabel.classList.add("hidden");
  el.taskProgressStepLabel.classList.add("hidden");
  el.taskEstimatedDaysLabel.classList.add("hidden");
  el.taskFolderLabel.classList.add("hidden");
  el.exportTaskButton.classList.add("hidden");
  el.importTaskButton.classList.remove("hidden");
  setTaskImportStatus("");
  focusLogInput();
}

function openLogEditModal(log) {
  if (!log || !log.can_edit || !el.logEditModal) {
    focusLogInput();
    return;
  }
  state.editingLog = log;
  el.logEditContentInput.value = log.content || "";
  el.logEditHint.textContent = log.editable_until
    ? `可编辑至 ${formatAnalysisTime(log.editable_until)}。`
    : "日志创建后 1 小时内可编辑。";
  el.logEditModal.classList.remove("hidden");
  window.requestAnimationFrame(() => {
    el.logEditContentInput.focus();
    el.logEditContentInput.setSelectionRange(
      el.logEditContentInput.value.length,
      el.logEditContentInput.value.length
    );
  });
}

function closeLogEditModal() {
  state.editingLog = null;
  if (el.logEditModal) {
    el.logEditModal.classList.add("hidden");
  }
  if (el.logEditForm) {
    el.logEditForm.reset();
  }
  if (el.logEditHint) {
    el.logEditHint.textContent = "";
  }
  focusLogInput();
}

async function saveTask(payload) {
  const url = state.editingTaskId ? `/api/tasks/${state.editingTaskId}` : "/api/tasks";
  const method = state.editingTaskId ? "PATCH" : "POST";
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function importTaskFile(file) {
  if (!file) {
    return;
  }
  const formData = new FormData();
  formData.append("file", file);
  setTaskImportStatus("正在导入任务...", "pending");
  if (el.importTaskButton) {
    el.importTaskButton.disabled = true;
  }
  try {
    const response = await fetch("/api/tasks/import", {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.task) {
      setTaskImportStatus(data.error || "导入失败，请确认文件来自本工具导出。", "error");
      return;
    }
    localStorage.setItem("selectedTaskId", String(data.task.id));
    await loadBootstrap();
    setSelectedTask(data.task.id);
    closeTaskModal();
  } finally {
    if (el.importTaskButton) {
      el.importTaskButton.disabled = false;
    }
    if (el.importTaskFileInput) {
      el.importTaskFileInput.value = "";
    }
  }
}

async function updateTask(taskId, payload) {
  return fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function nextTaskProgress(task, direction) {
  const step = Math.max(Number(task.progress_step) || DEFAULTS.progressStep, 1);
  const current = Math.min(Math.max(Number(task.progress_percent) || 0, 0), 100);
  const next = current + step * direction;
  return Math.min(Math.max(next, 0), 100);
}

async function updateTaskProgress(task, direction) {
  const progress = nextTaskProgress(task, direction);
  await updateTask(task.id, {
    name: task.name,
    project_name: task.project_name,
    status: progress >= 100 ? "completed" : "active",
    progress_percent: progress,
    progress_step: task.progress_step,
    estimated_days: task.estimated_days,
  });
  await loadBootstrap();
  focusLogInput();
}

async function openTaskFolder(taskId) {
  const response = await fetch(`/api/tasks/${taskId}/open-folder`, {
    method: "POST",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    window.alert(data.error || "无法打开文件夹");
    return false;
  }
  return true;
}

function exportEditingTask() {
  if (!state.editingTaskId) {
    return;
  }
  window.location.href = `/api/tasks/${state.editingTaskId}/export.md`;
}

function taskMetaText(task) {
  const remindAfterDays = Number(task.remind_after_days) || DEFAULTS.remindAfterDays;
  const remaining = Number(task.remaining_days);
  const remainingText = Number.isFinite(remaining) ? ` · 剩余 ${remaining} 天` : "";
  const staleDays = Number(task.stale_days);
  const idleText = Number.isFinite(staleDays)
    ? `${staleDays} 天未更新`
    : "尚未记录";
  const project = displayProjectName(task.project_name);

  if (task.status === "completed") {
    return `${project} · 已完成${remainingText}`;
  }
  if (task.is_inbox) {
    return `进行中 · 默认记录入口 · 提醒 ${remindAfterDays} 天后`;
  }
  return `${project} · ${idleText}${remainingText}（提醒 ${remindAfterDays} 天后）`;
}

function taskRow(task) {
  const row = document.createElement("div");
  row.className = `task-item ${task.status === "completed" ? "completed" : ""}`;
  row.style.setProperty("--task-color", task.category_color || DEFAULTS.categoryColor);
  if (task.id === state.selectedTaskId) {
    row.classList.add("selected");
  }

  const main = document.createElement("button");
  main.type = "button";
  main.className = "task-main";
  main.addEventListener("click", () => setSelectedTask(task.id));

  const copy = document.createElement("span");
  copy.className = "task-copy";

  const name = document.createElement("span");
  name.className = "task-name";
  name.textContent = displayTaskName(task);

  const meta = document.createElement("span");
  meta.className = "task-meta";
  meta.textContent = taskMetaText(task);

  copy.append(name, meta);
  main.append(copy);

  const actions = document.createElement("div");
  actions.className = "task-actions";
  const isSystemTask = task.is_inbox || task.id === state.inboxTaskId;

  if (!isSystemTask && task.folder_path) {
    const folderButton = document.createElement("button");
    folderButton.type = "button";
    folderButton.className = "icon-button folder-button";
    folderButton.title = "打开文件夹";
    folderButton.setAttribute("aria-label", `打开 ${displayTaskName(task)} 的文件夹`);
    folderButton.append(iconElement("folder", "button-icon"));
    folderButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await openTaskFolder(task.id);
      focusLogInput();
    });
    actions.appendChild(folderButton);
  }

  if (!isSystemTask) {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "icon-button";
    editButton.title = "编辑任务";
    editButton.setAttribute("aria-label", `编辑 ${displayTaskName(task)}`);
    editButton.append(iconElement("pencil", "button-icon"));
    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openTaskModal(task);
    });

    const progressControl = document.createElement("div");
    progressControl.className = "task-progress-control";
    progressControl.setAttribute("aria-label", `${displayTaskName(task)} 当前进度 ${task.progress_percent}%`);

    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.className = "task-progress-step-button";
    decreaseButton.textContent = "-";
    decreaseButton.disabled = task.progress_percent <= 0;
    decreaseButton.title = `减少 ${task.progress_step}%`;
    decreaseButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await updateTaskProgress(task, -1);
    });

    const progressValue = document.createElement("span");
    progressValue.className = "task-progress-value";
    progressValue.textContent = `${task.progress_percent}%`;

    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.className = "task-progress-step-button";
    increaseButton.textContent = "+";
    increaseButton.disabled = task.progress_percent >= 100;
    increaseButton.title = `增加 ${task.progress_step}%`;
    increaseButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await updateTaskProgress(task, 1);
    });

    progressControl.append(decreaseButton, progressValue, increaseButton);
    actions.append(editButton, progressControl);
  }
  row.append(main, actions);
  return row;
}

function renderTaskSection(title, tasks) {
  const section = document.createElement("section");
  section.className = "task-section";

  if (title) {
    const heading = document.createElement("h3");
    heading.className = "task-section-title";
    heading.textContent = title;
    section.appendChild(heading);
  }

  const list = document.createElement("div");
  list.className = "task-list-card";
  tasks.forEach((task) => list.appendChild(taskRow(task)));
  section.appendChild(list);
  el.taskList.appendChild(section);
}

function renderCompletedToggle(tasks) {
  if (!tasks.length) {
    return;
  }

  const details = document.createElement("details");
  details.className = "completed-toggle";

  const summary = document.createElement("summary");
  summary.textContent = `已完成 (${tasks.length})`;
  details.appendChild(summary);

  const list = document.createElement("div");
  list.className = "task-list-card";
  tasks.forEach((task) => list.appendChild(taskRow(task)));
  details.appendChild(list);
  el.taskList.appendChild(details);
}

function renderTasks() {
  el.taskList.innerHTML = "";
  el.taskListTitle.textContent = viewTitle();
  renderCurrentProjectAction();

  const visibleTasks = visibleTasksForView();
  if (!visibleTasks.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = state.activeView === VIEW_ATTENTION ? "暂无需要关注的任务。" : "暂无任务。";
    el.taskList.appendChild(empty);
    return;
  }

  if (state.activeView === VIEW_ATTENTION || state.activeView === VIEW_COMPLETED) {
    renderTaskSection(null, visibleTasks);
    return;
  }

  const activeTasks = visibleTasks.filter((task) => task.status === "active");
  const completedTasks = visibleTasks.filter((task) => task.status === "completed");
  if (activeTasks.length) {
    renderTaskSection(null, activeTasks);
  }
  renderCompletedToggle(completedTasks);
}

function renderLogs(logs) {
  el.timeline.innerHTML = "";

  if (!logs.length) {
    el.timeline.classList.add("hidden");
    el.timelineEmpty.classList.remove("hidden");
    el.timelineEmpty.textContent = "这个任务还没有日志。";
    return;
  }

  el.timeline.classList.remove("hidden");
  el.timelineEmpty.classList.add("hidden");

  const pinnedLog = logs.find((log) => log.is_pinned);
  const normalLogs = logs.filter((log) => !log.is_pinned);

  if (pinnedLog) {
    const pinnedSection = document.createElement("section");
    pinnedSection.className = "timeline-group pinned-log-group";
    pinnedSection.appendChild(renderLogItem(pinnedLog));
    el.timeline.appendChild(pinnedSection);
  }

  const groups = normalLogs.reduce((acc, log) => {
    const label = displayDateLabel(log.date_label);
    if (!acc[label]) {
      acc[label] = [];
    }
    acc[label].push(log);
    return acc;
  }, {});

  Object.entries(groups).forEach(([label, items]) => {
    const section = document.createElement("section");
    section.className = "timeline-group";

    const title = document.createElement("h3");
    title.textContent = label;
    section.appendChild(title);

    items.forEach((item) => {
      section.appendChild(renderLogItem(item));
    });

    el.timeline.appendChild(section);
  });
}

function renderLogItem(item) {
  const row = document.createElement("div");
  row.className = `log-item${item.is_pinned ? " is-pinned" : ""}`;

  const time = document.createElement("div");
  time.className = "log-time";
  time.textContent = item.time_label;

  const body = document.createElement("div");
  body.className = "log-content";
  renderInlineMarkdown(body, item.content);

  if (item.duration) {
    const duration = document.createElement("div");
    duration.className = "log-duration";
    duration.textContent = `${item.duration}h`;
    body.appendChild(duration);
  }

  const actions = document.createElement("div");
  actions.className = "log-actions";

  if (item.can_edit) {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "log-pin-button";
    editButton.setAttribute("aria-label", "编辑日志");
    editButton.title = item.editable_until ? `编辑日志（${formatAnalysisTime(item.editable_until)} 前）` : "编辑日志";
    editButton.appendChild(iconElement("pencil", "button-icon"));
    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openLogEditModal(item);
    });
    actions.appendChild(editButton);
  }

  const pinButton = document.createElement("button");
  pinButton.type = "button";
  pinButton.className = "log-pin-button";
  pinButton.setAttribute("aria-pressed", String(Boolean(item.is_pinned)));
  pinButton.setAttribute("aria-label", item.is_pinned ? "取消置顶" : "置顶日志");
  pinButton.title = item.is_pinned ? "取消置顶" : "置顶日志";
  pinButton.appendChild(iconElement("pin", "button-icon"));
  pinButton.addEventListener("click", (event) => {
    event.stopPropagation();
    void toggleLogPinned(item);
  });
  actions.appendChild(pinButton);

  row.append(time, body, actions);
  return row;
}

async function saveLogEdit() {
  const log = state.editingLog;
  if (!log) {
    closeLogEditModal();
    return;
  }
  const content = el.logEditContentInput.value.trim();
  if (!content) {
    el.logEditHint.textContent = "日志内容不能为空。";
    el.logEditContentInput.focus();
    return;
  }
  if (content === log.content.trim()) {
    closeLogEditModal();
    return;
  }
  el.saveLogEditButton.disabled = true;
  const response = await fetch(`/api/logs/${log.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  el.saveLogEditButton.disabled = false;

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    el.logEditHint.textContent = data.error || "无法修改日志";
    el.logEditContentInput.focus();
    return;
  }

  closeLogEditModal();
  await loadLogs();
  await refreshCurrentAnalysisStatus();
  focusLogInput();
}

async function toggleLogPinned(log) {
  const response = await fetch(`/api/logs/${log.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ is_pinned: !log.is_pinned }),
  });

  if (!response.ok) {
    focusLogInput();
    return;
  }

  await loadLogs();
  focusLogInput();
}

function renderStaleTasks() {
  if (!state.staleTasks.length) {
    el.staleIndicator.classList.add("hidden");
    el.stalePanel.classList.add("hidden");
    el.staleList.innerHTML = "";
    return;
  }

  el.staleIndicator.classList.remove("hidden");
  el.staleCount.textContent = String(state.staleTasks.length);
  el.staleList.innerHTML = "";
  el.stalePanel.classList.toggle("hidden", state.activeView === VIEW_ATTENTION);

  state.staleTasks.slice(0, 4).forEach((task) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "stale-task";
    item.addEventListener("click", () => setSelectedTask(task.id));

    const title = document.createElement("strong");
    title.textContent = displayTaskName(task);

    const detail = document.createElement("small");
    const remindAfterDays = Number(task.remind_after_days) || DEFAULTS.remindAfterDays;
    const staleDays = Number(task.stale_days) || 0;
    detail.textContent = `${displayProjectName(task.project_name)} · ${staleDays} 天未更新（提醒 ${remindAfterDays} 天后）`;

    item.append(title, detail);
    el.staleList.appendChild(item);
  });
}

async function loadBootstrap() {
  const response = await fetch("/api/bootstrap");
  if (!response.ok) {
    throw new Error(`bootstrap failed: ${response.status}`);
  }
  const data = await response.json();
  const defaults = data.defaults || {};
  DEFAULTS.projectName = defaults.project_name || DEFAULTS.projectName;
  DEFAULTS.inboxTaskName = defaults.inbox_task_name || DEFAULTS.inboxTaskName;
  DEFAULTS.categoryName = defaults.category_name || DEFAULTS.categoryName;
  DEFAULTS.remindAfterDays = asNumber(
    defaults.remind_after_days,
    DEFAULTS.remindAfterDays
  );

  state.tasks = Array.isArray(data.tasks) ? data.tasks.map(normalizeTask) : [];
  state.projects = Array.isArray(data.projects)
    ? data.projects.map(normalizeProject)
    : [];
  state.inboxTaskId =
    asNumber(data.inbox_task_id) ||
    (state.tasks.find((task) => task.is_inbox) || {}).id ||
    null;
  state.staleTasks = Array.isArray(data.stale_tasks)
    ? data.stale_tasks.map(normalizeTask)
    : [];

  const saved = Number(localStorage.getItem("selectedTaskId"));
  const savedExists = state.tasks.some((task) => task.id === saved);
  state.selectedTaskId = savedExists ? saved : state.inboxTaskId;

  renderNavigation();
  renderTasks();
  renderCurrentTask();
  renderStaleTasks();
  positionQuickLogBar();
  await loadLogs();
  await refreshCurrentAnalysisStatus();
}

async function loadLogs() {
  const taskId = defaultTaskId();
  if (!taskId) {
    el.timeline.classList.add("hidden");
    el.timelineEmpty.classList.remove("hidden");
    el.timelineEmpty.textContent = "这个任务还没有日志。";
    return;
  }

  const response = await fetch(`/api/tasks/${taskId}/logs`);
  if (!response.ok) {
    renderLogs([]);
    return;
  }
  const data = await response.json();
  const logs = Array.isArray(data.logs) ? data.logs.map(normalizeLog) : [];
  renderLogs(logs);
}

function resolveLogTime() {
  const mode = el.timeMode.value;
  if (mode === "now") {
    return null;
  }

  if (mode === "custom") {
    return el.customDateTime.value || null;
  }

  const time = el.timeValue.value || "09:00";
  const base = new Date();
  if (mode === "yesterday") {
    base.setDate(base.getDate() - 1);
  }

  const [hours, minutes] = time.split(":").map(Number);
  base.setHours(hours, minutes, 0, 0);
  return base.toISOString().slice(0, 19);
}

function updateTimeInputs() {
  const mode = el.timeMode.value;
  el.timeValue.classList.toggle("hidden", mode === "now" || mode === "custom");
  el.customDateTime.classList.toggle("hidden", mode !== "custom");
  resizeTimeModeSelect();
}

function resizeTimeModeSelect() {
  const option = el.timeMode.options[el.timeMode.selectedIndex];
  const text = option ? option.textContent || "" : "";
  const measurer = resizeTimeModeSelect.measurer || document.createElement("span");

  if (!resizeTimeModeSelect.measurer) {
    measurer.style.position = "fixed";
    measurer.style.left = "-9999px";
    measurer.style.top = "-9999px";
    measurer.style.visibility = "hidden";
    measurer.style.whiteSpace = "pre";
    document.body.appendChild(measurer);
    resizeTimeModeSelect.measurer = measurer;
  }

  const style = window.getComputedStyle(el.timeMode);
  measurer.style.font = style.font;
  measurer.textContent = text;

  const textWidth = Math.ceil(measurer.getBoundingClientRect().width);
  const width = Math.min(Math.max(textWidth + 48, 84), 132);
  el.timeMode.style.width = `${width}px`;
}

function updateDurationBadge() {
  const visible = state.pendingDuration > 0;
  el.durationBadge.classList.toggle("hidden", !visible);
  el.durationBadge.textContent = `${state.pendingDuration}h`;
}

async function submitLog(event) {
  if (event) {
    event.preventDefault();
  }

  const content = logInputMarkdown().trim();
  if (!content) {
    focusLogInput();
    return;
  }

  const taskId = defaultTaskId();
  if (!taskId) {
    focusLogInput();
    return;
  }

  const response = await fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task_id: taskId,
      content,
      log_time: resolveLogTime(),
      duration: state.pendingDuration || null,
    }),
  });

  if (!response.ok) {
    focusLogInput();
    return;
  }

  setLogInputMarkdown("");
  state.pendingDuration = 0;
  updateDurationBadge();
  el.timeMode.value = "now";
  updateTimeInputs();
  await loadBootstrap();
  focusLogInput();
}

el.quickLogForm.addEventListener("submit", submitLog);
el.logInput.addEventListener("input", resizeLogInput);
el.logInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
    event.preventDefault();
    toggleLogInputBold();
    return;
  }

  if (event.key !== "Enter") {
    return;
  }
  if (event.shiftKey || event.ctrlKey) {
    event.preventDefault();
    insertLogInputNewline();
    return;
  }
  event.preventDefault();
  void submitLog();
});

el.navItems.forEach((item) => {
  item.addEventListener("click", () => setActiveView(item.dataset.view));
});
el.newTaskButton.addEventListener("click", () => openTaskModal());
el.sidebarNewTaskButton.addEventListener("click", () => {
  void openAnalysisCenterModal();
});
if (el.boardSyncButton) {
  el.boardSyncButton.addEventListener("click", async () => {
    openSettingsModal();
    await loadBoardSyncSettings();
    void syncBoardNow();
  });
}
el.settingsButton.addEventListener("click", openSettingsModal);
el.closeSettingsModal.addEventListener("click", closeSettingsModal);
el.exportTaskButton.addEventListener("click", exportEditingTask);
el.analyzeCurrentTaskButton.addEventListener("click", () => {
  void analyzeCurrentTask();
});
el.closeAnalysisModal.addEventListener("click", closeAnalysisModal);
if (el.closeAnalysisCenterModal) {
  el.closeAnalysisCenterModal.addEventListener("click", closeAnalysisCenterModal);
}
if (el.analysisCenterCurrentTaskButton) {
  el.analysisCenterCurrentTaskButton.addEventListener("click", () => {
    closeAnalysisCenterModal();
    void analyzeCurrentTask();
  });
}
if (el.startAnalysisExportButton) {
  el.startAnalysisExportButton.addEventListener("click", () => {
    setAnalysisExportMode(true);
  });
}
if (el.exportSelectedAnalysisButton) {
  el.exportSelectedAnalysisButton.addEventListener("click", () => {
    void exportAnalysisRuns();
  });
}
if (el.exportAllAnalysisButton) {
  el.exportAllAnalysisButton.addEventListener("click", () => {
    void exportAnalysisRuns({ all: true });
  });
}
if (el.cancelAnalysisExportButton) {
  el.cancelAnalysisExportButton.addEventListener("click", () => {
    setAnalysisExportMode(false);
  });
}
if (el.weeklySummaryButton) {
  el.weeklySummaryButton.addEventListener("click", () => {
    const range = currentWeekRange();
    void startPeriodSummary("week", range.start, range.end);
  });
}
if (el.halfMonthSummaryButton) {
  el.halfMonthSummaryButton.addEventListener("click", () => {
    const range = currentHalfMonthRange();
    void startPeriodSummary("half_month", range.start, range.end);
  });
}
if (el.monthlySummaryButton) {
  el.monthlySummaryButton.addEventListener("click", () => {
    const range = currentMonthRange();
    void startPeriodSummary("month", range.start, range.end);
  });
}
if (el.halfYearSummaryButton) {
  el.halfYearSummaryButton.addEventListener("click", () => {
    const range = currentHalfYearRange();
    void startPeriodSummary("half_year", range.start, range.end);
  });
}
if (el.yearSummaryButton) {
  el.yearSummaryButton.addEventListener("click", () => {
    const range = currentYearRange();
    void startPeriodSummary("year", range.start, range.end);
  });
}
if (el.customSummaryButton) {
  el.customSummaryButton.addEventListener("click", () => {
    void startPeriodSummary(
      "range",
      el.summaryStartDate ? el.summaryStartDate.value : "",
      el.summaryEndDate ? el.summaryEndDate.value : ""
    );
  });
}
if (el.analysisPromptTypeSelect) {
  el.analysisPromptTypeSelect.addEventListener("change", () => {
    if (el.analysisPromptPresetSelect) {
      el.analysisPromptPresetSelect.value = "custom";
    }
    void loadAiSettings();
    setTaskAnalysisPromptStatus("");
  });
}
if (el.analysisPromptPresetSelect) {
  el.analysisPromptPresetSelect.addEventListener("change", () => {
    const presetId = el.analysisPromptPresetSelect.value;
    const presetText = analysisPromptPresetText(presetId);
    if (presetText && el.taskAnalysisPromptInput) {
      setPromptInputValue(presetText);
      state.activePromptPreset = presetId;
      setTaskAnalysisPromptStatus("已应用预设。你可以继续编辑，然后保存。", "pending");
    } else {
      state.activePromptPreset = "custom";
      setTaskAnalysisPromptStatus("");
    }
  });
}
if (el.taskAnalysisPromptInput) {
  el.taskAnalysisPromptInput.addEventListener("input", () => {
    if (state.suppressPromptInputEvent) {
      return;
    }
    syncPromptPresetFromContent();
  });
}
if (el.saveTaskAnalysisPromptButton) {
  el.saveTaskAnalysisPromptButton.addEventListener("click", () => {
    void saveTaskAnalysisPrompt();
  });
}
if (el.resetTaskAnalysisPromptButton) {
  el.resetTaskAnalysisPromptButton.addEventListener("click", () => {
    void resetTaskAnalysisPrompt();
  });
}
el.saveAiSettingsButton.addEventListener("click", () => {
  void saveAiSettings();
});
el.testAiSettingsButton.addEventListener("click", () => {
  void testAiSettings();
});
el.resetLayoutWidthButton.addEventListener("click", () => {
  resetTaskPanelWidth();
  focusLogInput();
});
if (el.saveBoardSyncSettingsButton) {
  el.saveBoardSyncSettingsButton.addEventListener("click", () => {
    void saveBoardSyncSettings();
  });
}
if (el.syncBoardNowButton) {
  el.syncBoardNowButton.addEventListener("click", () => {
    void syncBoardNow({ saveSettings: true });
  });
}
el.editCurrentProjectButton.addEventListener("click", () => {
  const project = currentViewProject();
  if (project && project.name !== DEFAULTS.projectName) {
    openProjectModal(project);
  }
});
el.cancelProjectModal.addEventListener("click", closeProjectModal);
el.cancelTaskModal.addEventListener("click", closeTaskModal);
if (el.cancelLogEditModal) {
  el.cancelLogEditModal.addEventListener("click", closeLogEditModal);
}
el.projectSelect.addEventListener("change", syncProjectInput);
el.taskFolderInput.addEventListener("input", () => {
  const task = state.tasks.find((item) => item.id === state.editingTaskId);
  el.openTaskFolderFromModal.disabled =
    !task || !task.folder_path || el.taskFolderInput.value.trim() !== task.folder_path;
});
el.openTaskFolderFromModal.addEventListener("click", async () => {
  if (!state.editingTaskId) {
    return;
  }
  await openTaskFolder(state.editingTaskId);
});
el.importTaskButton.addEventListener("click", () => {
  el.importTaskFileInput.click();
});
el.importTaskFileInput.addEventListener("change", () => {
  const file = el.importTaskFileInput.files && el.importTaskFileInput.files[0];
  void importTaskFile(file);
});

el.taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: el.taskNameInput.value.trim(),
    project_name: resolvedProjectName(),
  };

  if (state.editingTaskId) {
    payload.status = el.taskStatusSelect.value;
    payload.remind_after_days = Number(el.taskReminderSelect.value);
    payload.progress_percent = Number(el.taskProgressInput.value);
    payload.progress_step = Number(el.taskProgressStepInput.value);
    payload.estimated_days = Number(el.taskEstimatedDaysInput.value);
    payload.folder_path = el.taskFolderInput.value.trim();
  }

  if (!payload.name || !payload.project_name) {
    return;
  }

  const response = await saveTask(payload);
  if (!response.ok) {
    return;
  }

  const data = await response.json();
  await loadBootstrap();
  setSelectedTask(data.task.id);
  closeTaskModal();
});

if (el.logEditForm) {
  el.logEditForm.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveLogEdit();
  });
}

el.projectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const projectId = Number(el.projectIdInput.value);
  const name = el.projectNameEditInput.value.trim();
  if (!projectId || !name) {
    return;
  }

  const response = await saveProject(projectId, { name });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    window.alert(data.error || "无法保存项目");
    return;
  }

  await loadBootstrap();
  closeProjectModal();
});

el.timeMode.addEventListener("change", updateTimeInputs);

el.durationButton.addEventListener("click", () => {
  state.pendingDuration += 1;
  updateDurationBadge();
  focusLogInput();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  if (!el.settingsModal.classList.contains("hidden")) {
    closeSettingsModal();
    return;
  }
  if (!el.projectModal.classList.contains("hidden")) {
    closeProjectModal();
    return;
  }
  if (el.logEditModal && !el.logEditModal.classList.contains("hidden")) {
    closeLogEditModal();
    return;
  }
  if (el.analysisCenterModal && !el.analysisCenterModal.classList.contains("hidden")) {
    closeAnalysisCenterModal();
    return;
  }
  if (!el.analysisModal.classList.contains("hidden")) {
    closeAnalysisModal();
    return;
  }
  if (!el.taskModal.classList.contains("hidden")) {
    closeTaskModal();
  }
});

window.addEventListener("load", async () => {
  applyTheme(currentThemeId());
  renderStaticIcons();
  setupAutoScrollbars();
  setupPanelResizer();
  positionQuickLogBar();
  updateTimeInputs();
  updateDurationBadge();
  resizeLogInput();
  try {
    await loadBootstrap();
  } catch (error) {
    console.error(error);
  }
  focusLogInput();
});
