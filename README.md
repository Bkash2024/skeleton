# Cadence · Focused Routine & Reflection Tracker

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/platform-Web-orange.svg" alt="Platform">
  <img src="https://img.shields.io/badge/status-active-success.svg" alt="Status">
</p>

<p align="center">
  <strong>A minimal, elegant routine tracker for focused reflection and intentional living.</strong>
</p>

---

## Overview

Cadence is a lightweight, privacy-first web application designed to help you build consistent routines through daily check-ins and structured reflection. Built with simplicity in mind, it runs entirely in your browser with zero external dependencies and complete data ownership.

### Key Features

- **📋 Custom Question Templates** — Create personalized question banks with multiple input types
- **🗂️ Flexible Tab Organization** — Organize routines into contextual tabs (Morning, Evening, etc.)
- **📅 Calendar History View** — Visualize your consistency with an intuitive calendar interface
- **🔍 Powerful Search** — Quickly find past entries across all your logs
- **📤 Export Options** — Download your data as CSV, Markdown, or JSON backup
- **🔄 Template Sharing** — Share your setup with others (no personal data included)
- **💾 Offline-First** — All data stored locally in your browser, no cloud required
- **🔒 Privacy-Focused** — Your data never leaves your device

---

## Screenshots

### Welcome View
<p align="center">
  <em>Clean, focused home screen with custom routine tabs</em>
</p>

### Logger Interface
<p align="center">
  <em>Step-through question flow with progress tracking</em>
</p>

### Calendar History
<p align="center">
  <em>Visual consistency tracking with daily logs</em>
</p>

---

## Input Types Supported

| Type | Description | Use Case |
|------|-------------|----------|
| **Text** | Free-form text input | Journaling, notes |
| **Range** | Slider (0-10, 0.5 step) | Mood, energy levels |
| **Yes/No** | Toggle button | Habit tracking |
| **Select** | Single choice | Structured responses |
| **Multi-Select** | Multiple choices | Tags, categories |
| **Time** | Time picker | Wake times, duration |

---

## Quick Start

### Option 1: Direct Use

1. **Clone or Download**
   ```bash
   git clone https://github.com/yourusername/cadence-tracker.git
   ```

2. **Open in Browser**
   ```bash
   cd cadence-tracker
   open index.html
   ```

3. **Start Tracking**
   - Click the default "Morning" tab or create your own
   - Answer questions and build your routine

### Option 2: GitHub Pages

Deploy your own instance:
1. Fork this repository
2. Go to Settings → Pages
3. Select "Deploy from a branch" → main → root
4. Access at `https://yourusername.github.io/cadence-tracker`

---

## Usage Guide

### Creating Questions

1. Navigate to **Settings** (⚙️)
2. Expand **Question Bank**
3. Click **"+ Create New Question"**
4. Configure:
   - Label: The question text
   - Type: Choose from text, range, toggle, select, multi, time
   - Options: (For select/multi) comma-separated choices

### Organizing Tabs

1. In Settings, expand **Manage Tabs**
2. Create new tabs with custom icons
3. Assign questions to tabs via **Tab Assignments**
4. Reorder questions within each tab

### Viewing History

1. Click the calendar icon (📅)
2. Select a date to view entries
3. Search across all logs using the search bar
4. Export specific days or full history

### Data Management

#### Export Backup
Creates a complete JSON backup including all data:
- Contexts (tabs)
- Question bank
- Assignments
- Full history

#### Export Template
Shares your structure without personal data:
- Contexts
- Question bank
- Assignments
- **Excludes:** All history/logs

#### Import Template
Two options when importing:
- **Replace**: Completely replaces your current setup
- **Merge**: Adds to your existing setup (IDs remapped)

---

## File Structure

```
cadence-tracker/
├── index.html          # Main HTML structure
├── style.css           # iOS-inspired styling
├── app.js              # Application logic
├── README.md           # This file
└── LICENSE             # MIT License
```

---

## Technical Details

### Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 80+ | ✅ Full support |
| Safari | 13+ | ✅ Full support |
| Firefox | 75+ | ✅ Full support |
| Edge | 80+ | ✅ Full support |
| Mobile Safari | 13+ | ✅ Full support |
| Chrome Android | 80+ | ✅ Full support |

### Storage Architecture

All data stored in `localStorage` with namespaced keys:

```javascript
sk_ctx_v5      // Contexts (tabs)
sk_bank_v5     // Question bank
sk_assign_v5   // Tab-question assignments
sk_h_v5        // History logs
sk_p_v5        // In-progress sessions
sk_settings_v5 // UI preferences
```

### Data Format

**Question Object:**
```json
{
  "id": "q1699999999999",
  "l": "How are you feeling?",
  "t": "range",
  "o": ""
}
```

**Context Object:**
```json
{
  "id": "morn",
  "l": "Morning",
  "i": "🌅",
  "order": 0
}
```

**History Entry:**
```json
{
  "ctx": "morn",
  "ans": {
    "q1699999999999": 7
  },
  "time": "08:30"
}
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + ]` | Open last artifact (CLI) |
| `Esc` | Close modal |

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Keep the codebase dependency-free
- Maintain iOS-inspired design language
- Test across major browsers
- Update documentation for new features

---

## Roadmap

- [ ] Dark mode support
- [ ] Keyboard navigation shortcuts
- [ ] Drag-and-drop reordering
- [ ] Weekly/monthly summary exports
- [ ] PWA support for offline access
- [ ] Cloud sync (optional, privacy-focused)

---

## Privacy Policy

**TL;DR: Your data stays on your device.**

- **No accounts required** — Use immediately without signup
- **No external servers** — Everything runs locally
- **No analytics** — We don't track anything
- **No cookies** — Only localStorage for your data
- **Full data ownership** — Export anytime, delete anytime

When you export backups or templates, the data is in your hands. Share at your discretion.

---

## License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Acknowledgments

- Design inspired by Apple Human Interface Guidelines
- Built with vanilla JavaScript (no frameworks needed)
- Typography: SF Pro (system font stack)

---

<p align="center">
  Made with focus and intention
</p>

<p align="center">
  <a href="#overview">Back to Top</a>
</p>
