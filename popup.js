document.addEventListener("DOMContentLoaded", () => {
  const app = {
    data: { cases: [], defaultCaseId: null },
    currentCaseId: null,
    currentScreenshot: null,
    editingItemId: null,
    currentFilter: "all",

    init: function () {
      this.loadData();
      this.setupEventListeners();
      this.render();
      this.captureCurrentPage();
    },

    showCustomNotification: function (message, duration = 2000) {
      const notificationEl = document.getElementById("custom-notification");
      if (!notificationEl) return;
      notificationEl.textContent = message;
      notificationEl.classList.add("show");
      setTimeout(() => {
        notificationEl.classList.remove("show");
      }, duration);
    },

    loadData: function () {
      chrome.storage.local.get(
        [
          "osint-case-data",
          "customShortcut",
          "activeCaseId",
          "autoCaptureSetting",
          "notificationSetting",
          "audioFeedbackSetting",
        ],
        (result) => {
          if (chrome.runtime.lastError) {
            console.error("Error getting data:", chrome.runtime.lastError);
            return;
          }
          if (result["osint-case-data"]) this.data = result["osint-case-data"];
          this.currentCaseId =
            result["activeCaseId"] ||
            this.data.defaultCaseId ||
            (this.data.cases.length > 0 ? this.data.cases[0].id : null);

          const modifierEl = document.getElementById("shortcut-modifier");
          const keyEl = document.getElementById("shortcut-key");
          if (result.customShortcut && modifierEl && keyEl) {
            modifierEl.value = result.customShortcut.modifier;
            keyEl.value = result.customShortcut.key;
            this.updateShortcutDisplay();
          }

          const autoCaptureEl = document.getElementById(
            "auto-capture-screenshot",
          );
          if (result.autoCaptureSetting !== undefined && autoCaptureEl) {
            autoCaptureEl.checked = result.autoCaptureSetting;
          }

          const notificationEl = document.getElementById(
            "notification-setting",
          );
          if (result.notificationSetting !== undefined && notificationEl) {
            notificationEl.checked = result.notificationSetting;
          } else if (notificationEl) {
            notificationEl.checked = true;
          }

          const audioFeedbackEl = document.getElementById(
            "audio-feedback-setting",
          );
          if (result.audioFeedbackSetting !== undefined && audioFeedbackEl) {
            audioFeedbackEl.checked = result.audioFeedbackSetting;
          } else if (audioFeedbackEl) {
            audioFeedbackEl.checked = true;
          }
          this.render();
        },
      );
    },

    saveData: function () {
      chrome.storage.local.set({ "osint-case-data": this.data }, () => {
        if (chrome.runtime.lastError)
          console.error("Error saving data:", chrome.runtime.lastError);
      });
    },

    setupEventListeners: function () {
      document.querySelectorAll(".tab").forEach((tab) => {
        tab.addEventListener("click", (e) => {
          document
            .querySelectorAll(".tab")
            .forEach((t) => t.classList.remove("active"));
          document
            .querySelectorAll(".tab-content")
            .forEach((c) => (c.style.display = "none"));
          e.target.classList.add("active");
          const tabName = e.target.getAttribute("data-tab");
          const tabContent = document.getElementById(`tab-${tabName}`);
          if (tabContent) tabContent.style.display = "block";
          if (tabName === "settings") {
            this.renderCaseManagement();
          }
          if (tabName === "list") {
            // Initialize filter chips
            document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
            const allChip = document.querySelector('.filter-chip[data-filter="all"]');
            if (allChip) allChip.classList.add("active");
          }
        });
      });

      const caseSelectEl = document.getElementById("case-select");
      if (caseSelectEl) {
        caseSelectEl.addEventListener("change", (e) => {
          this.currentCaseId = e.target.value;
          chrome.storage.local.set({ activeCaseId: this.currentCaseId });
          this.renderUrlsList();
        });
      }

      const saveUrlBtn = document.getElementById("btn-save-url");
      if (saveUrlBtn)
        saveUrlBtn.addEventListener("click", () => this.saveUrl());

      const captureScreenshotBtn = document.getElementById(
        "btn-capture-screenshot",
      );
      if (captureScreenshotBtn)
        captureScreenshotBtn.addEventListener("click", () =>
          this.captureScreenshot(),
        );

      const manageCasesBtn = document.getElementById("btn-manage-cases");
      if (manageCasesBtn)
        manageCasesBtn.addEventListener("click", () =>
          this.showCaseManagementDialog(),
        );

      const searchInput = document.getElementById("search-input");
      if (searchInput)
        searchInput.addEventListener("input", () => this.renderUrlsList());

      const sortSelect = document.getElementById("url-list-sort");
      if (sortSelect)
        sortSelect.addEventListener("change", () => this.renderUrlsList());

      const autoCaptureEl = document.getElementById("auto-capture-screenshot");
      if (autoCaptureEl) {
        autoCaptureEl.addEventListener("change", (e) => {
          chrome.storage.local.set({ autoCaptureSetting: e.target.checked });
        });
      }

      const saveShortcutBtn = document.getElementById("btn-save-shortcut");
      if (saveShortcutBtn)
        saveShortcutBtn.addEventListener("click", () => this.saveShortcut());

      const modifierEl = document.getElementById("shortcut-modifier");
      const keyEl = document.getElementById("shortcut-key");
      if (modifierEl)
        modifierEl.addEventListener("change", () =>
          this.updateShortcutDisplay(),
        );
      if (keyEl)
        keyEl.addEventListener("input", () => this.updateShortcutDisplay());

      const exportJsonBtn = document.getElementById("btn-export-json");
      if (exportJsonBtn)
        exportJsonBtn.addEventListener("click", () => this.exportData("json"));

      const exportCsvBtn = document.getElementById("btn-export-csv");
      if (exportCsvBtn)
        exportCsvBtn.addEventListener("click", () => this.exportData("csv"));

      const importBtn = document.getElementById("btn-import-data");
      const importFile = document.getElementById("import-data-file");
      if (importBtn && importFile) {
        importBtn.addEventListener("click", () => importFile.click());
        importFile.addEventListener("change", (e) =>
          this.importData(e.target.files[0]),
        );
      }

      const createCaseBtn = document.getElementById("btn-create-case");
      if (createCaseBtn)
        createCaseBtn.addEventListener("click", () =>
          this.showCaseManagementDialog(),
        );

      const notificationEl = document.getElementById("notification-setting");
      if (notificationEl) {
        notificationEl.addEventListener("change", (e) => {
          chrome.storage.local.set({ notificationSetting: e.target.checked });
        });
      }

      const audioFeedbackEl = document.getElementById("audio-feedback-setting");
      if (audioFeedbackEl) {
        audioFeedbackEl.addEventListener("change", (e) => {
          chrome.storage.local.set({ audioFeedbackSetting: e.target.checked });
        });
      }

      // Filter chip event listeners
      document.querySelectorAll(".filter-chip").forEach((chip) => {
        chip.addEventListener("click", (e) => {
          const filter = e.target.getAttribute("data-filter");
          this.currentFilter = filter;

          // Update active state
          document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
          e.target.classList.add("active");

          this.renderUrlsList();
        });
      });
    },

    captureScreenshot: function (callback) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url.startsWith("http")) {
          chrome.tabs.captureVisibleTab(
            tabs[0].windowId,
            { format: "png" },
            (dataUrl) => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                alert("Could not capture screenshot.");
                if (callback) callback(null);
                return;
              }
              this.currentScreenshot = dataUrl;
              const preview = document.getElementById("screenshot-preview");
              if (preview) {
                preview.src = dataUrl;
                preview.style.display = "block";
              }
              if (callback) callback(dataUrl);
            },
          );
        } else {
          alert("Cannot capture screenshots on non-HTTP pages.");
          if (callback) callback(null);
        }
      });
    },

    saveUrl: function () {
      if (!this.currentCaseId) {
        alert("Please create or select a case first.");
        return;
      }
      const currentCase = this.getCurrentCase();
      if (!currentCase) return;
      const urlInput = document.getElementById("url-input");
      const titleInput = document.getElementById("title-input");
      const url = urlInput ? urlInput.value.trim() : "";
      const title = titleInput ? titleInput.value.trim() : "";
      if (!url) {
        alert("Please enter a URL");
        return;
      }
      if (!this.isValidUrl(url)) {
        alert("⚠️ Invalid or unsafe URL. Please enter a valid HTTP or HTTPS URL.");
        return;
      }

      const saveBtn = document.getElementById("btn-save-url");
      const originalText = saveBtn ? saveBtn.textContent : "Save URL";

      const doSave = (screenshotData) => {
        const notesInput = document.getElementById("notes-input");
        const tagsInput = document.getElementById("tags-input");
        const statusSelect = document.getElementById("status-select");
        const prioritySelect = document.getElementById("priority-select");

        const now = new Date().toISOString();
        let domain = "";
        try {
          domain = new URL(url).hostname;
        } catch (e) {
          console.error("Error parsing URL:", e);
          domain = "unknown";
        }

        const updatedData = {
          url,
          title: title || url,
          notes: notesInput ? notesInput.value.trim() : "",
          tags: tagsInput
            ? tagsInput.value
                .split(",")
                .map((t) => t.trim())
                .filter((t) => t)
            : [],
          status: statusSelect ? statusSelect.value : "todo",
          priority: prioritySelect ? parseInt(prioritySelect.value) : 0,
          domain: domain,
          lastSeen: now,
          screenshot: screenshotData,
        };

        if (this.editingItemId) {
          const itemIndex = currentCase.urls.findIndex(
            (item) => item.id === this.editingItemId,
          );
          if (itemIndex !== -1) {
            const currentItem = currentCase.urls[itemIndex];
            if (screenshotData) {
              updatedData.screenshotTakenAt = now;
            } else {
              updatedData.screenshotTakenAt = currentItem.screenshotTakenAt;
            }
            currentCase.urls[itemIndex] = { ...currentItem, ...updatedData };
            this.showCustomNotification(`URL updated in "${currentCase.name}"`);
          }
        } else {
          if (screenshotData) {
            updatedData.screenshotTakenAt = now;
          }
          const newItem = {
            id: Date.now().toString(),
            ...updatedData,
            created: now,
            visitCount: 1,
          };
          const existingIndex = currentCase.urls.findIndex(
            (item) => item.url === url,
          );
          if (existingIndex !== -1) {
            currentCase.urls[existingIndex] = {
              ...currentCase.urls[existingIndex],
              ...newItem,
              visitCount: currentCase.urls[existingIndex].visitCount + 1,
            };
          } else {
            currentCase.urls.push(newItem);
          }
          this.showCustomNotification(`URL saved to "${currentCase.name}"`);
        }

        this.saveData();
        this.resetForm();
        this.renderUrlsList();
      };

      const autoCaptureEl = document.getElementById("auto-capture-screenshot");
      if (
        autoCaptureEl &&
        autoCaptureEl.checked &&
        saveBtn &&
        !this.editingItemId
      ) {
        saveBtn.textContent = "Capturing...";
        saveBtn.disabled = true;
        this.captureScreenshot((dataUrl) => {
          doSave(dataUrl);
        });
      } else {
        doSave(this.currentScreenshot);
      }
    },

    resetForm: function () {
      const inputs = ["url-input", "title-input", "notes-input", "tags-input"];
      inputs.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
      const statusSelect = document.getElementById("status-select");
      if (statusSelect) statusSelect.value = "todo";
      const prioritySelect = document.getElementById("priority-select");
      if (prioritySelect) prioritySelect.value = "0";

      this.currentScreenshot = null;
      this.editingItemId = null;
      const preview = document.getElementById("screenshot-preview");
      if (preview) {
        preview.style.display = "none";
        preview.src = "";
      }
      const saveBtn = document.getElementById("btn-save-url");
      if (saveBtn) {
        saveBtn.textContent = "💾 Save URL";
        saveBtn.disabled = false;
      }
    },

    editUrl: function (id) {
      const currentCase = this.getCurrentCase();
      if (!currentCase) return;

      const item = currentCase.urls.find((i) => i.id === id);
      if (!item) return;

      document.querySelector('.tab[data-tab="add"]').click();

      const urlInput = document.getElementById("url-input");
      const titleInput = document.getElementById("title-input");
      const notesInput = document.getElementById("notes-input");
      const tagsInput = document.getElementById("tags-input");
      const statusSelect = document.getElementById("status-select");
      const prioritySelect = document.getElementById("priority-select");

      if (urlInput) urlInput.value = item.url;
      if (titleInput) titleInput.value = item.title;
      if (notesInput) notesInput.value = item.notes || "";
      if (tagsInput) tagsInput.value = (item.tags || []).join(", ");
      if (statusSelect) statusSelect.value = item.status;
      if (prioritySelect) prioritySelect.value = item.priority.toString();

      this.currentScreenshot = item.screenshot || null;
      const preview = document.getElementById("screenshot-preview");
      if (preview) {
        if (this.currentScreenshot) {
          preview.src = this.currentScreenshot;
          preview.style.display = "block";
        } else {
          preview.style.display = "none";
          preview.src = "";
        }
      }

      this.editingItemId = id;
      const saveBtn = document.getElementById("btn-save-url");
      if (saveBtn) saveBtn.textContent = "✏️ Update URL";
    },

    exportData: function (format) {
      if (format === "json") {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "osint-cases-backup.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        const headers = [
          "Case Name",
          "URL",
          "Title",
          "Notes",
          "Tags",
          "Status",
          "Priority",
          "Has Screenshot",
          "Screenshot Taken At",
          "Created",
          "Last Seen",
          "Visit Count",
        ];
        const rows = this.data.cases.flatMap((c) =>
          c.urls.map((item) => [
            c.name,
            item.url || "",
            item.title || "",
            item.notes || "",
            (item.tags || []).join("; "),
            item.status || "",
            item.priority || 0,
            item.screenshot ? "Yes" : "No",
            item.screenshotTakenAt || "",
            item.created || "",
            item.lastSeen || "",
            item.visitCount || 1,
          ]),
        );
        const csvContent = [
          headers.join(","),
          ...rows.map((row) =>
            row
              .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
              .join(","),
          ),
        ].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "osint-cases-export.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },

    updateShortcutDisplay: function () {
      const modifierEl = document.getElementById("shortcut-modifier");
      const keyEl = document.getElementById("shortcut-key");
      const displayEl = document.getElementById("current-shortcut");
      if (modifierEl && keyEl && displayEl) {
        const modifier = modifierEl.value;
        const key = keyEl.value.toUpperCase();
        displayEl.textContent = `${modifier.charAt(0).toUpperCase() + modifier.slice(1)}+${key || "?"}`;
      }
    },
    saveShortcut: function () {
      const modifierEl = document.getElementById("shortcut-modifier");
      const keyEl = document.getElementById("shortcut-key");
      if (!modifierEl || !keyEl) return;
      const modifier = modifierEl.value;
      const key = keyEl.value.toLowerCase();
      if (!key) {
        alert("Please enter a key for the shortcut.");
        return;
      }
      const shortcut = { modifier, key };
      chrome.storage.local.set({ customShortcut: shortcut }, () => {
        this.updateShortcutDisplay();
        alert(
          "Shortcut saved! Reload your open tabs for the change to take effect.",
        );
      });
    },
    importData: function (file) {
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.data = JSON.parse(e.target.result);
          this.saveData();
          this.render();
          alert("Import successful!");
        } catch (error) {
          alert("Error importing data: Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    },
    render: function () {
      this.renderCaseSelector();
      this.renderUrlsList();
      this.renderStats();
    },
    renderCaseSelector: function () {
      const selector = document.getElementById("case-select");
      if (!selector) return;
      selector.innerHTML = "";
      if (this.data.cases.length === 0) {
        selector.innerHTML = '<option value="">📂 No cases yet</option>';
      } else {
        this.data.cases.forEach((c) => {
          const option = document.createElement("option");
          option.value = c.id;
          option.textContent = c.name;
          if (c.id === this.data.defaultCaseId) option.textContent += " ⭐";
          selector.appendChild(option);
        });
        selector.value = this.currentCaseId;
      }
    },
    getCurrentCase: function () {
      return this.data.cases.find((c) => c.id === this.currentCaseId);
    },
    captureCurrentPage: function () {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          const urlInput = document.getElementById("url-input");
          const titleInput = document.getElementById("title-input");
          if (urlInput) urlInput.value = tabs[0].url;
          if (titleInput) titleInput.value = tabs[0].title;
        }
      });
    },
    renderUrlsList: function () {
      const container = document.getElementById("url-list");
      if (!container) return;
      const currentCase = this.getCurrentCase();
      if (!currentCase) {
        container.innerHTML =
          '<div class="empty">📁 Select or create a case to view URLs.</div>';
        return;
      }

      const searchInput = document.getElementById("search-input");
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
      let filteredUrls = currentCase.urls.filter((item) => {
        // Apply search filter
        const matchesSearch = !searchTerm || (
          (item.title && item.title.toLowerCase().includes(searchTerm)) ||
          (item.url && item.url.toLowerCase().includes(searchTerm)) ||
          (item.notes && item.notes.toLowerCase().includes(searchTerm)) ||
          (item.tags &&
            item.tags.some((tag) => tag.toLowerCase().includes(searchTerm)))
        );

        // Apply status/priority filter
        let matchesFilter = true;
        if (this.currentFilter === "todo") {
          matchesFilter = item.status === "todo";
        } else if (this.currentFilter === "in-progress") {
          matchesFilter = item.status === "in-progress";
        } else if (this.currentFilter === "done") {
          matchesFilter = item.status === "done";
        } else if (this.currentFilter === "high-priority") {
          matchesFilter = item.priority === 3;
        }

        return matchesSearch && matchesFilter;
      });

      const sortSelect = document.getElementById("url-list-sort");
      const sortBy = sortSelect ? sortSelect.value : "lastSeen-desc";

      filteredUrls.sort((a, b) => {
        switch (sortBy) {
          case "lastSeen-desc":
            return new Date(b.lastSeen) - new Date(a.lastSeen);
          case "created-desc":
            return new Date(b.created) - new Date(a.created);
          case "created-asc":
            return new Date(a.created) - new Date(b.created);
          case "title-asc":
            return a.title.localeCompare(b.title);
          case "title-desc":
            return b.title.localeCompare(a.title);
          case "status":
            const statusOrder = { todo: 1, "in-progress": 2, done: 3 };
            return statusOrder[a.status] - statusOrder[b.status];
          case "priority-desc":
            return b.priority - a.priority;
          case "domain":
            const domainA = a.domain || "";
            const domainB = b.domain || "";
            return domainA.localeCompare(domainB);
          default:
            return 0;
        }
      });

      // Update URL count display
      const countEl = document.getElementById("url-count");
      if (countEl) {
        const totalUrls = currentCase.urls.length;
        countEl.textContent = this.currentFilter === "all"
          ? `${totalUrls} URL${totalUrls !== 1 ? 's' : ''}`
          : `${filteredUrls.length} of ${totalUrls} URL${totalUrls !== 1 ? 's' : ''}`;
      }

      if (filteredUrls.length === 0) {
        container.innerHTML =
          '<div class="empty">🔍 No URLs found for this case.</div>';
        return;
      }

      container.innerHTML = filteredUrls
        .map((item) => {
          const priorityClass =
            item.priority === 3
              ? "priority-high"
              : item.priority === 2
                ? "priority-medium"
                : item.priority === 1
                  ? "priority-low"
                  : "";
          const lastSeen = this.formatRelativeTime(item.lastSeen);
          const screenshotTime = item.screenshotTakenAt
            ? this.formatRelativeTime(item.screenshotTakenAt)
            : null;
          const tagsHtml = item.tags
            .map((tag) => `<span class="tag">${this.escapeHtml(tag)}</span>`)
            .join("");

          // Validate screenshot is a data URL (security)
          const screenshotHtml = item.screenshot && item.screenshot.startsWith("data:image/")
            ? `<img src="${this.escapeHtml(item.screenshot)}" class="url-item-screenshot" alt="screenshot">`
            : '';

          // Format status with icon
          const statusIcons = {
            'todo': '📋',
            'in-progress': '⏳',
            'done': '✅'
          };
          const statusIcon = statusIcons[item.status] || '📋';
          const statusText = item.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());

          // Priority indicator
          let priorityIndicator = '';
          if (item.priority === 3) {
            priorityIndicator = '<span class="priority-indicator high"></span>';
          } else if (item.priority === 2) {
            priorityIndicator = '<span class="priority-indicator medium"></span>';
          } else if (item.priority === 1) {
            priorityIndicator = '<span class="priority-indicator low"></span>';
          }

          // Build metadata items
          let metaItems = [
            `<div class="url-item-meta-item"><span>${statusIcon}</span><span>${statusText}</span></div>`,
            `<div class="url-item-meta-item"><span>👁️</span><span>${item.visitCount || 1} visit${(item.visitCount || 1) !== 1 ? 's' : ''}</span></div>`,
            `<div class="url-item-meta-item"><span>🕒</span><span>${lastSeen}</span></div>`
          ];

          if (screenshotTime) {
            metaItems.push(`<div class="url-item-meta-item"><span>📸</span><span>${screenshotTime}</span></div>`);
          }

          return `
            <div class="url-item ${priorityClass}">
              <div class="url-item-content">
                <div class="url-item-header">
                  <div class="url-item-title">${priorityIndicator}<span>${this.escapeHtml(item.title)}</span></div>
                  <div class="url-item-actions">
                    <button class="url-item-action" data-id="${this.escapeHtml(item.id)}" data-action="visit" title="Visit">🔗</button>
                    <button class="url-item-action" data-id="${this.escapeHtml(item.id)}" data-action="edit" title="Edit">✏️</button>
                    <button class="url-item-action" data-id="${this.escapeHtml(item.id)}" data-action="delete" title="Delete">🗑️</button>
                  </div>
                </div>
                <div class="url-item-url">${this.escapeHtml(item.url)}</div>
                ${item.notes ? `<div class="url-item-notes">📝 ${this.escapeHtml(item.notes)}</div>` : ''}
                ${tagsHtml ? `<div class="url-item-tags">${tagsHtml}</div>` : ''}
                <div class="url-item-meta">
                  ${metaItems.join('')}
                </div>
              </div>
              ${screenshotHtml}
            </div>
          `;
        })
        .join("");

      container.querySelectorAll(".url-item-action").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const action = e.target.getAttribute("data-action");
          const item = currentCase.urls.find((i) => i.id === id);
          if (!item) return;
          if (action === "visit") {
            if (this.isValidUrl(item.url)) {
              chrome.tabs.create({ url: item.url });
              item.visitCount = (item.visitCount || 1) + 1;
              item.lastSeen = new Date().toISOString();
              this.saveData();
              this.renderUrlsList();
            } else {
              alert("⚠️ Invalid or unsafe URL. Only HTTP and HTTPS URLs are allowed.");
            }
          }
          if (action === "edit") {
            this.editUrl(id);
          }
          if (action === "delete") {
            if (confirm("Delete this URL?")) {
              currentCase.urls = currentCase.urls.filter((i) => i.id !== id);
              this.saveData();
              this.renderUrlsList();
            }
          }
        });
      });
      container.querySelectorAll(".url-item-screenshot").forEach((img) => {
        img.addEventListener("click", (e) =>
          chrome.tabs.create({ url: e.target.src }),
        );
      });
    },
    renderStats: function () {
      const container = document.getElementById("stats-container");
      if (!container) return;
      const currentCase = this.getCurrentCase();
      if (!currentCase) {
        container.innerHTML =
          '<div class="empty">📊 Select a case to view statistics.</div>';
        return;
      }
      const urls = currentCase.urls;
      const totalCount = urls.length;
      const todoCount = urls.filter((item) => item.status === "todo").length;
      const progressCount = urls.filter(
        (item) => item.status === "in-progress",
      ).length;
      const doneCount = urls.filter((item) => item.status === "done").length;
      container.innerHTML = `<div class="stats-grid"><div class="stat-card"><div class="stat-value">${totalCount}</div><div class="stat-label">Total URLs</div></div><div class="stat-card"><div class="stat-value">${todoCount}</div><div class="stat-label">To Do</div></div><div class="stat-card"><div class="stat-value">${progressCount}</div><div class="stat-label">In Progress</div></div><div class="stat-card"><div class="stat-value">${doneCount}</div><div class="stat-label">Done</div></div></div>`;
    },
    showCaseManagementDialog: function () {
      const caseName = prompt("Enter new case name:");
      if (caseName) {
        const newCase = { id: Date.now().toString(), name: caseName, urls: [] };
        this.data.cases.push(newCase);
        if (this.data.cases.length === 1) {
          this.data.defaultCaseId = newCase.id;
          this.currentCaseId = newCase.id;
        }
        this.saveData();
        this.render();
      }
    },
    renderCaseManagement: function () {
      const container = document.getElementById("case-management-list");
      if (!container) return;
      if (this.data.cases.length === 0) {
        container.innerHTML = '<p class="empty">📂 No cases created yet.</p>';
        return;
      }
      container.innerHTML = this.data.cases
        .map((c) => {
          const isDefault = c.id === this.data.defaultCaseId;
          return `<div class="case-item ${isDefault ? "default" : ""}"><span class="case-name">${this.escapeHtml(c.name)} ${isDefault ? "⭐ (Default)" : ""}</span><div class="case-actions">${!isDefault ? `<button class="btn btn-small btn-secondary" data-id="${this.escapeHtml(c.id)}" data-action="set-default">⭐ Set Default</button>` : ""}<button class="btn btn-small btn-danger" data-id="${this.escapeHtml(c.id)}" data-action="delete">🗑️ Delete</button></div></div>`;
        })
        .join("");
      container.querySelectorAll(".case-actions button").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const id = e.target.getAttribute("data-id");
          const action = e.target.getAttribute("data-action");
          if (action === "delete") {
            this.deleteCase(id);
          } else if (action === "set-default") {
            this.setDefaultCase(id);
          }
        });
      });
    },
    deleteCase: function (caseId) {
      const caseToDelete = this.data.cases.find((c) => c.id === caseId);
      if (!caseToDelete) return;
      const warningMessage = `Are you sure you want to permanently delete the case "${caseToDelete.name}" and all ${caseToDelete.urls.length} URLs inside it? This action cannot be undone.`;
      if (!confirm(warningMessage)) {
        return;
      }
      this.data.cases = this.data.cases.filter((c) => c.id !== caseId);
      if (this.data.defaultCaseId === caseId) {
        this.data.defaultCaseId =
          this.data.cases.length > 0 ? this.data.cases[0].id : null;
      }
      if (this.currentCaseId === caseId) {
        this.currentCaseId =
          this.data.defaultCaseId ||
          (this.data.cases.length > 0 ? this.data.cases[0].id : null);
      }
      this.saveData();
      this.render();
      alert(`Case "${caseToDelete.name}" has been deleted.`);
    },
    setDefaultCase: function (caseId) {
      this.data.defaultCaseId = caseId;
      this.saveData();
      this.renderCaseManagement();
    },
    formatRelativeTime: function (dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 30) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    },
    escapeHtml: function (text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    isValidUrl: function (url) {
      if (!url || typeof url !== "string") return false;
      try {
        const parsed = new URL(url);
        // Only allow http and https protocols for security
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
  };
  app.init();
});
