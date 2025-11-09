# 🔍 CaseBandit

<div align="center">

![Version](https://img.shields.io/badge/version-2.5-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/chrome-extension-orange.svg)
![Security](https://img.shields.io/badge/security-A+-brightgreen.svg)

**A powerful Chrome extension for tracking, organizing, and managing URLs during OSINT investigations.**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Security](#-security) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

CaseBandit is a professional-grade Chrome extension designed specifically for OSINT investigators, security researchers, and digital investigators. It provides a comprehensive solution for organizing evidence, tracking investigation progress, and managing multiple cases simultaneously.

### ✨ Key Highlights

- 🗂️ **Multi-Case Management** - Organize URLs into separate investigation cases
- 📸 **Auto Screenshot Capture** - Automatically capture page screenshots for evidence preservation
- ⌨️ **Quick Save Shortcut** - Customizable keyboard shortcut for instant URL saving
- 🔔 **Smart Notifications** - Visual and audio feedback when URLs are saved
- 🎯 **Priority & Status Tracking** - Mark URLs by priority and investigation status
- 🏷️ **Tagging System** - Organize evidence with custom tags
- 🔍 **Advanced Search & Filtering** - Quickly find specific URLs across cases
- 📊 **Investigation Statistics** - Track your progress with visual dashboards
- 💾 **Export/Import** - Backup your data in JSON or CSV formats
- 🔒 **Secure by Design** - Built with security best practices (CSP, XSS protection, URL validation)

---

## 🎯 Features

### Case Management
- **Create Multiple Cases** - Organize investigations into separate cases
- **Default Case** - Set a default case for quick saving
- **Case Statistics** - View URL counts, status breakdown per case

### URL Tracking
- **Quick Save** - Press your custom shortcut (default: Ctrl+<) to instantly save the current page
- **Automatic Metadata** - Captures URL, title, domain, timestamp, and visit count
- **Priority Levels** - Mark URLs as High/Medium/Low priority with color indicators
- **Status Workflow** - Track progress: To Do → In Progress → Done
- **Custom Notes** - Add investigation notes to each URL
- **Tag System** - Organize with unlimited custom tags

### Screenshot Capture
- **Auto-Capture** - Optionally capture screenshots when saving URLs
- **Manual Capture** - Capture screenshots on-demand
- **Preview & Click** - View thumbnails, click to open full-size in new tab

### Search & Sort
- **Full-Text Search** - Search across URLs, titles, notes, and tags
- **Advanced Sorting** - Sort by:
  - 🕒 Recently Viewed
  - 🆕 Newest First
  - ⏳ Oldest First
  - 🔤 Title (A-Z / Z-A)
  - ⚡ Priority (High→Low)
  - 🎯 Status
  - 🌐 Domain
- **Quick Filters** - Filter by: All, To Do, In Progress, Done, High Priority

### Data Management
- **Export JSON** - Full backup with all metadata
- **Export CSV** - Spreadsheet-friendly format for analysis
- **Import Data** - Restore from JSON backups

### User Experience
- **Dark Theme** - Easy on the eyes during long investigations
- **Emoji Icons** - Visual, intuitive interface
- **Responsive Design** - Adapts to different screen sizes
- **Notifications** - Desktop notifications for saves (optional)
- **Audio Feedback** - Success/error sounds (optional)
- **Badge Indicators** - Extension icon shows ✓ or ! for success/errors

---

## 🚀 Installation

### Method 1: Manual Installation (Recommended for Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gl0bal01/CaseBandit.git
   cd CaseBandit
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `CaseBandit` folder

3. **Pin the extension:**
   - Click the puzzle icon in Chrome toolbar
   - Find "CaseBandit"
   - Click the pin icon to keep it visible

### Method 2: From Release (Coming Soon)
- Download the latest `.crx` file from [Releases](https://github.com/gl0bal01/CaseBandit/releases)
- Drag and drop into `chrome://extensions/`

---

## 📚 Usage

### Getting Started

1. **Create Your First Case**
   - Click the extension icon
   - Go to ⚙️ Settings tab
   - Click **➕ Create New Case**
   - Enter a case name (e.g., "Target Company Investigation")

2. **Save Your First URL**
   - **Method 1:** Click extension icon → ➕ Add URL tab → Fill details → 💾 Save URL
   - **Method 2:** Press **Ctrl+<** (or your custom shortcut) on any webpage

3. **Organize Your Investigation**
   - Add notes, tags, priority, and status to each URL
   - Use 📸 Capture Screenshot to preserve evidence
   - Switch between cases as needed

### Quick Save Shortcut

The fastest way to save URLs during active investigations:

1. Navigate to any webpage
2. Press **Ctrl+<** (default) or your custom shortcut
3. URL is instantly saved to your active case
4. See confirmation: ✓ badge + notification + sound

**Customize the shortcut:**
- Go to ⚙️ Settings → ⌨️ Quick Save Shortcut
- Choose modifier (Ctrl/Alt/Shift/Meta) + key
- Click 💾 Save
- Reload your open tabs

### Advanced Filtering

Combine search with filters and sorting for powerful queries:

**Example 1: Find high-priority Twitter URLs**
- Enter "twitter.com" in 🔍 Search
- Click 🔴 High Priority filter
- Sort by 🕒 Recently Viewed

**Example 2: Review all completed items**
- Click ✅ Done filter
- Sort by 🆕 Newest First

### Data Export

**For Backup:**
1. Go to ⚙️ Settings → 💾 Data Management
2. Click **📤 Export JSON**
3. Save the file securely

**For Analysis:**
1. Click **📊 Export CSV**
2. Open in Excel/Google Sheets for reporting

---

## 🔒 Security

CaseBandit is built with security as a top priority. It implements multiple layers of protection:

### Security Features

✅ **XSS Protection** - All user input is sanitized and HTML-escaped
✅ **Content Security Policy** - Strict CSP prevents inline script execution
✅ **URL Validation** - Only HTTP/HTTPS URLs allowed (blocks javascript:, data:, file:)
✅ **Message Origin Validation** - Background script only accepts messages from own extension
✅ **Screenshot Validation** - Validates data URLs before rendering
✅ **Error Handling** - Try-catch blocks prevent crashes from malformed data
✅ **Local Storage Only** - No cloud sync, all data stays on your machine
✅ **No External Requests** - Extension doesn't phone home or track users

### Security Audit Results

**Rating: A+ (Production Ready)**

- ✅ No eval() or Function() constructor usage
- ✅ No inline event handlers
- ✅ No unsafe innerHTML without sanitization
- ✅ Manifest V3 compliance
- ✅ Minimal permissions (only what's needed)

### Permissions Explained

The extension requires these permissions:

- **storage** - Save your cases and URLs locally
- **activeTab** - Read URL and title of current tab for quick-save
- **notifications** - Show save confirmations
- **scripting** - Play audio feedback sounds
- **host_permissions: <all_urls>** - Required for screenshot capture and page title reading

**Note:** Your data never leaves your computer. This is a fully offline extension.

---

## 🛠️ Technical Details

### Architecture

- **Manifest Version:** 3 (latest standard)
- **Storage:** chrome.storage.local (isolated per-extension)
- **Background:** Service Worker (background.js)
- **Content Script:** Keyboard shortcut handler (content.js)
- **UI:** Vanilla JavaScript + CSS (no frameworks = lightweight)

### Browser Compatibility

- ✅ **Chrome** 88+ (fully supported)
- ✅ **Edge** 88+ (Chromium-based)
- ✅ **Brave** (Chromium-based)
- ❓ **Opera** (untested but likely works)
- ❌ **Firefox** (uses different extension API)

### File Structure

```
CaseBandit/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI (500px popup)
├── popup.js              # Application logic
├── background.js         # Service worker (quick-save handler)
├── content.js            # Content script (keyboard shortcuts)
├── icons/                # Extension icons
│   ├── icon.svg         # Source SVG
│   ├── icon16.png       # Toolbar icon
│   ├── icon48.png       # Extension management
│   └── icon128.png      # Chrome Web Store
└── README.md            # This file
```

### Data Schema

```javascript
{
  "osint-case-data": {
    "cases": [
      {
        "id": "1234567890",
        "name": "Investigation Name",
        "urls": [
          {
            "id": "0987654321",
            "url": "https://example.com",
            "title": "Page Title",
            "notes": "Investigation notes",
            "tags": ["tag1", "tag2"],
            "status": "todo|in-progress|done",
            "priority": 0-3,
            "domain": "example.com",
            "created": "2025-01-15T10:00:00.000Z",
            "lastSeen": "2025-01-15T12:30:00.000Z",
            "visitCount": 5,
            "screenshot": "data:image/png;base64,...",
            "screenshotTakenAt": "2025-01-15T10:00:00.000Z"
          }
        ]
      }
    ],
    "defaultCaseId": "1234567890"
  }
}
```

---

## 🎨 Screenshots

### Main Interface
![Main Interface](https://via.placeholder.com/800x500/1e1e1e/4fc3f7?text=Add+URL+Tab)

*Add URLs with full metadata, notes, tags, and screenshots*

### URL List View
![URL List](https://via.placeholder.com/800x500/1e1e1e/4fc3f7?text=URL+List+View)

*Advanced filtering, sorting, and search with visual priority indicators*

### Statistics Dashboard
![Statistics](https://via.placeholder.com/800x500/1e1e1e/4fc3f7?text=Statistics+Dashboard)

*Track investigation progress with visual metrics*

### Settings Panel
![Settings](https://via.placeholder.com/800x500/1e1e1e/4fc3f7?text=Settings+Panel)

*Customize shortcuts, notifications, and manage cases*

---

## 🤝 Contributing

Contributions are welcome! Whether it's bug reports, feature requests, or code contributions.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly** (load extension, test all features)
5. **Commit with clear messages:**
   ```bash
   git commit -m "Add amazing feature"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/CaseBandit.git
cd CaseBandit

# Create a branch
git checkout -b your-feature

# Load extension in Chrome for testing
# (chrome://extensions/ → Developer mode → Load unpacked)

# Make changes and test

# Commit and push
git add .
git commit -m "Your changes"
git push origin your-feature
```

### Bug Reports

Found a bug? [Open an issue](https://github.com/gl0bal01/CaseBandit/issues) with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser version
- Extension version

### Feature Requests

Have an idea? [Open an issue](https://github.com/gl0bal01/CaseBandit/issues) with:
- Clear description of the feature
- Use case / why it's needed
- Example workflow

---

## 📋 Roadmap

### Planned Features

- [ ] **Export to Timeline** - Generate investigation timelines
- [ ] **URL Deduplication** - Detect and merge duplicate URLs
- [ ] **Bulk Import** - Import URLs from text files
- [ ] **Custom Status Labels** - Define your own workflow stages
- [ ] **Collaboration** - Share cases (encrypted JSON)
- [ ] **Advanced Analytics** - Domain frequency, investigation patterns
- [ ] **Firefox Support** - Port to Firefox WebExtensions
- [ ] **Chrome Web Store** - Official listing

### Completed ✅

- [x] Multi-case management
- [x] Screenshot capture
- [x] Advanced filtering & sorting
- [x] Export/Import functionality
- [x] Security hardening (XSS, CSP, URL validation)
- [x] Audio feedback
- [x] Custom keyboard shortcuts

---

## 🐛 Known Issues

- Keyboard shortcut may conflict with website shortcuts (limitation of Chrome API)
- Screenshot capture doesn't work on chrome:// pages (Chrome security restriction)
- Large screenshots (>5MB) may slow down the extension (browser limitation)

---

## 👤 Author

**gl0bal01**

- GitHub: [@gl0bal01](https://github.com/gl0bal01)
- Extension: CaseBandit v2.5

---

## 💙 Acknowledgments

Made with 💙 for OSINT investigators and security researchers worldwide.

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/gl0bal01/CaseBandit/issues)
- **Discussions:** [GitHub Discussions](https://github.com/gl0bal01/CaseBandit/discussions)
- **Email:** Create an issue on GitHub

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

<div align="center">

**[⬆ Back to Top](#-casebandit)**

Made with 💙 by [gl0bal01](https://github.com/gl0bal01)

</div>
