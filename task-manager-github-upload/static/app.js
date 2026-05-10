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
];

const DEFAULTS = {
  projectName: "General",
  inboxTaskName: "Inbox",
  categoryName: "Misc",
  categoryColor: "#9B9B9B",
  remindAfterDays: 3,
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
  checkCircle: `
    <circle cx="12" cy="12" r="8"></circle>
    <path d="M8.5 12.3l2.3 2.3 4.8-5.2"></path>
  `,
  folder: `
    <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"></path>
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
  activeView: localStorage.getItem("activeView") || VIEW_CURRENT,
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
  taskFolderLabel: document.getElementById("taskFolderLabel"),
  taskFolderInput: document.getElementById("taskFolderInput"),
  openTaskFolderFromModal: document.getElementById("openTaskFolderFromModal"),
  saveTaskButton: document.getElementById("saveTaskButton"),
  cancelTaskModal: document.getElementById("cancelTaskModal"),
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
  panelResizeHandle: document.getElementById("panelResizeHandle"),
  settingsButton: document.getElementById("settingsButton"),
  settingsModal: document.getElementById("settingsModal"),
  closeSettingsModal: document.getElementById("closeSettingsModal"),
  themeOptions: document.getElementById("themeOptions"),
  resetLayoutWidthButton: document.getElementById("resetLayoutWidthButton"),
  projectModal: document.getElementById("projectModal"),
  projectForm: document.getElementById("projectForm"),
  projectIdInput: document.getElementById("projectIdInput"),
  projectNameEditInput: document.getElementById("projectNameEditInput"),
  cancelProjectModal: document.getElementById("cancelProjectModal"),
};

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
}

function closeSettingsModal() {
  el.settingsModal.classList.add("hidden");
  focusLogInput();
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
  };
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

function insertLogInputNewline() {
  const start = el.logInput.selectionStart;
  const end = el.logInput.selectionEnd;
  const value = el.logInput.value;
  el.logInput.value = `${value.slice(0, start)}\n${value.slice(end)}`;
  el.logInput.selectionStart = start + 1;
  el.logInput.selectionEnd = start + 1;
  resizeLogInput();
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
  focusLogInput();
}

function renderCurrentTask() {
  const task = currentTask() || inboxTask();
  el.timelineTaskName.textContent = displayTaskName(task);
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
  renderProjectOptions(task ? task.project_name : currentProjectName());
  el.taskStatusLabel.classList.toggle("hidden", !task);
  el.taskStatusSelect.value = task ? task.status : "active";
  el.taskReminderLabel.classList.toggle("hidden", !task);
  el.taskReminderSelect.value = String(
    task ? task.remind_after_days || DEFAULTS.remindAfterDays : DEFAULTS.remindAfterDays
  );
  el.taskFolderLabel.classList.toggle("hidden", !task || task.is_inbox);
  el.taskFolderInput.value = task && !task.is_inbox ? task.folder_path || "" : "";
  el.openTaskFolderFromModal.disabled = !task || task.is_inbox || !task.folder_path;
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
  el.taskFolderLabel.classList.add("hidden");
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

async function updateTask(taskId, payload) {
  return fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
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

function taskMetaText(task) {
  const remindAfterDays = Number(task.remind_after_days) || DEFAULTS.remindAfterDays;
  const staleDays = Number(task.stale_days);
  const idleText = Number.isFinite(staleDays)
    ? `${staleDays} 天未更新`
    : "尚未记录";
  const project = displayProjectName(task.project_name);

  if (task.status === "completed") {
    return `${project} · 已完成`;
  }
  if (task.is_inbox) {
    return `进行中 · 默认记录入口 · 提醒 ${remindAfterDays} 天后`;
  }
  return `${project} · ${idleText}（提醒 ${remindAfterDays} 天后）`;
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
    editButton.append(iconElement("pencil", "button-icon"), document.createTextNode("编辑"));
    editButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openTaskModal(task);
    });

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.className = "icon-button";
    toggleButton.append(
      iconElement(task.status === "active" ? "checkCircle" : "rotateLeft", "button-icon"),
      document.createTextNode(task.status === "active" ? "完成" : "恢复")
    );
    toggleButton.addEventListener("click", async (event) => {
      event.stopPropagation();
      await updateTask(task.id, {
        status: task.status === "active" ? "completed" : "active",
        name: task.name,
        project_name: task.project_name,
      });
      await loadBootstrap();
      focusLogInput();
    });

    actions.append(editButton, toggleButton);
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

  const groups = logs.reduce((acc, log) => {
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
      const row = document.createElement("div");
      row.className = "log-item";

      const time = document.createElement("div");
      time.className = "log-time";
      time.textContent = item.time_label;

      const body = document.createElement("div");
      body.className = "log-content";
      body.textContent = item.content;

      if (item.duration) {
        const duration = document.createElement("div");
        duration.className = "log-duration";
        duration.textContent = `${item.duration}h`;
        body.appendChild(duration);
      }

      row.append(time, body);
      section.appendChild(row);
    });

    el.timeline.appendChild(section);
  });
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

  const content = el.logInput.value.trim();
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

  el.logInput.value = "";
  resizeLogInput();
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
el.sidebarNewTaskButton.addEventListener("click", () => openTaskModal());
el.settingsButton.addEventListener("click", openSettingsModal);
el.closeSettingsModal.addEventListener("click", closeSettingsModal);
el.resetLayoutWidthButton.addEventListener("click", () => {
  resetTaskPanelWidth();
  focusLogInput();
});
el.editCurrentProjectButton.addEventListener("click", () => {
  const project = currentViewProject();
  if (project && project.name !== DEFAULTS.projectName) {
    openProjectModal(project);
  }
});
el.cancelProjectModal.addEventListener("click", closeProjectModal);
el.cancelTaskModal.addEventListener("click", closeTaskModal);
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

el.taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: el.taskNameInput.value.trim(),
    project_name: resolvedProjectName(),
  };

  if (state.editingTaskId) {
    payload.status = el.taskStatusSelect.value;
    payload.remind_after_days = Number(el.taskReminderSelect.value);
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
