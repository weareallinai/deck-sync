# Feature Roadmap

This document tracks potential features and enhancements for the Deck Sync application, organized by component.

---

## 🎨 EDITOR

### Core Editing (MVP)
- [x] **Deck Management**
  - Load existing deck (mock data)
  - Deck metadata display (title)
  - ⏳ Create new deck
  - ⏳ Save deck (auto-save + manual)
  - ⏳ Delete deck
  - ⏳ Duplicate deck
  - ⏳ Deck metadata editing (description, author, dates)

- [x] **Slide Management**
  - Add new slide ✅
  - Delete slide ✅
  - Duplicate slide ✅
  - Slide thumbnails in sidebar ✅
  - Navigate between slides ✅
  - ⏳ Reorder slides (drag-and-drop in sidebar)

- [x] **Element Management**
  - Add text elements ✅
  - Add shape elements (rectangle, circle, line) ✅
  - Add image elements (placeholder) ✅
  - Add video elements (placeholder) ✅
  - Select/deselect elements ✅
  - Move elements (drag) ✅
  - Resize elements (handles) ✅
  - Delete elements ✅
  - Duplicate elements ✅
  - Z-index control (bring forward/send backward) ✅
  - ⏳ Multi-select elements (Shift+click, drag-select box)

- [x] **Canvas Layer (Konva)**
  - 1280x720 canvas ✅
  - Selection tool ✅
  - Transform handles (resize/rotate) ✅
  - ⏳ Snap-to-grid
  - ⏳ Rulers and guides

- [x] **Text Editing**
  - Double-click to edit ✅
  - Font size ✅
  - Text color ✅
  - Text content editing ✅
  - Font family selection ✅
  - ⏳ Bold, italic, underline
  - ⏳ Text alignment (left, center, right)
  - ⏳ Line height
  - ⏳ Letter spacing

- [x] **Element Properties**
  - Position (x, y) ✅
  - Size (width, height) ✅
  - Color (fill) ✅
  - ⏳ Rotation
  - ⏳ Opacity
  - ⏳ Border (color, width, style)
  - ⏳ Shadow effects

- [ ] **Slide Properties**
  - ⏳ Background color picker
  - ⏳ Background gradient
  - ⏳ Background image upload
  - ⏳ Slide notes

- [ ] **Slide Transitions**
  - ⏳ Select transition type (fade, slide, none)
  - ⏳ Transition duration
  - ⏳ Transition easing

- [ ] **Animations Panel**
  - ⏳ Add animation to element
  - ⏳ Set animation type (fade-in, slide-in, zoom-in, etc.)
  - ⏳ Set animation trigger (on-step, on-load)
  - ⏳ Animation duration
  - ⏳ Animation delay
  - ⏳ Reorder animations (determines step sequence)

### Priority Polish Features (Next Up!)
- [x] **Font Selection** ✅
  - Font family dropdown in Inspector ✅
  - Apply to text elements ✅
  - Update font in Viewer's SlideRenderer to match ✅
  - 9 web-safe fonts (Arial, Helvetica, Times New Roman, Georgia, Courier New, Verdana, Trebuchet MS, Comic Sans MS, Impact) ✅

- [ ] **Multi-Select Elements**
  - Shift+click to add to selection
  - Drag-select box on canvas
  - Group transform (move/resize multiple)
  - Bulk actions (delete, duplicate, align)

- [x] **Slide Background Editing** ✅
  - Background color picker in Inspector/Slide Properties ✅
  - Background gradient editor (simple direction control) ✅
  - Background image (URL input, R2 upload coming soon) ✅
  - Preview in thumbnail ✅
  - Live preview in Inspector ✅

- [x] **Keyboard Shortcuts** ✅
  - Delete key to remove selected element ✅
  - Cmd/Ctrl+D to duplicate ✅
  - Cmd/Ctrl+Z for undo ✅
  - Cmd/Ctrl+Shift+Z for redo ✅
  - Arrow keys to nudge position (1px, or 10px with Shift) ✅
  - Escape to deselect ✅
  - ⏳ Cmd/Ctrl+A to select all

- [x] **Undo/Redo System** ✅
  - Track state history in editorStore ✅
  - Implement undo/redo actions ✅
  - Keyboard shortcuts (Cmd+Z / Cmd+Shift+Z) ✅
  - UI buttons in toolbar ✅
  - 50-item history limit ✅

### Advanced Features (Post-MVP)
- [ ] **Collaboration**
  - Real-time co-editing
  - User cursors/presence
  - Conflict resolution
  - Version history
  - Comments/annotations

- [ ] **Templates**
  - Template library
  - Save deck as template
  - Apply template to slide

- [ ] **Asset Library**
  - Reusable asset management
  - Search/filter assets
  - Asset tags
  - Bulk upload

- [ ] **Advanced Animations**
  - Custom animation curves
  - Path animations
  - Morph animations
  - Parallax effects

- [ ] **Design Tools**
  - Alignment helpers
  - Distribution tools
  - Smart guides
  - Color picker with swatches
  - Gradient fills
  - Pattern fills

- [ ] **Export/Import**
  - Export as PDF
  - Export as video
  - Import from PowerPoint/Keynote
  - Export individual slides as images

- [ ] **Accessibility**
  - Alt text for images
  - Slide notes for screen readers
  - High contrast mode
  - Keyboard navigation hints

---

## 🎤 PRESENTER

### Current Features (Implemented)
- [x] WebSocket connection to coordinator
- [x] Send commands (START, NEXT_STEP, PREV_STEP)
- [x] Live preview in iframe
- [x] Connection status indicator
- [x] Current step display

### Enhancements (Post-MVP)
- [ ] **Slide Overview**
  - Thumbnail sidebar showing all slides
  - Click to jump to specific slide
  - Visual indicator of current slide

- [ ] **Presenter Notes**
  - Display slide-specific notes
  - Rich text formatting
  - Timer per note section

- [ ] **Timer/Clock**
  - Elapsed time since presentation start
  - Countdown timer
  - Target time per slide
  - Visual warnings for time

- [ ] **Audience Engagement**
  - Live poll/quiz
  - Q&A queue
  - Emoji reactions
  - Viewer count

- [ ] **Advanced Controls**
  - Slide jump dropdown
  - Pause/resume presentation
  - Blank screen (black/white)
  - Spotlight/pointer tool (visible to viewers)

- [ ] **Multi-Monitor Support**
  - Separate window for preview
  - Dedicated notes window
  - Fullscreen controls

- [ ] **Recording**
  - Record presentation (video + audio)
  - Auto-generate recording metadata
  - Save to R2/download

- [ ] **Session Management**
  - End session
  - Regenerate viewer URL
  - View active viewers
  - Kick/mute viewers (if chat enabled)

---

## 👁️ VIEWER

### Current Features (Implemented)
- [x] WebSocket connection to coordinator
- [x] Receive and apply events
- [x] Clock synchronization (NTP-style)
- [x] Scheduled event execution
- [x] Slide rendering with transitions
- [x] Reconnect with exponential backoff
- [x] Snapshot recovery on reconnect
- [x] Sequence gap detection
- [x] Debug panel (toggle)

### Enhancements (Post-MVP)
- [ ] **Viewer Controls**
  - Toggle fullscreen
  - Adjust audio volume (for video slides)
  - Toggle captions (if available)

- [ ] **Accessibility**
  - Keyboard shortcuts
  - Screen reader support
  - High contrast mode toggle
  - Font size override

- [ ] **Engagement**
  - React with emoji
  - Submit questions (if enabled)
  - Vote in polls (if enabled)

- [ ] **Offline Support**
  - Download deck for offline viewing
  - Cache slides in IndexedDB
  - Offline indicator

- [ ] **Performance**
  - Adaptive quality (reduce resolution on slow connections)
  - Bandwidth usage indicator
  - Manual quality selection

- [ ] **Recording Playback**
  - View recorded presentations
  - Scrub timeline
  - Play/pause
  - Speed control (0.5x, 1x, 1.5x, 2x)

- [ ] **Personal Notes**
  - Take notes during presentation
  - Bookmark slides
  - Export notes

---

## 🌐 PLATFORM (Cross-cutting)

### Infrastructure
- [ ] **Authentication**
  - User registration/login
  - OAuth providers (Google, GitHub)
  - JWT token refresh
  - Role-based access control

- [ ] **Database Integration**
  - Store decks in Postgres
  - Store sessions in Postgres
  - Store user data
  - Migrations complete

- [ ] **R2 Integration**
  - Upload images to R2
  - Upload videos to R2
  - Signed URL generation
  - Asset cleanup (orphaned files)

- [ ] **API Development**
  - RESTful API for decks
  - RESTful API for slides
  - RESTful API for sessions
  - API documentation (OpenAPI/Swagger)

- [ ] **Deployment**
  - Deploy to Cloudflare Pages
  - Deploy Durable Object
  - Production environment config
  - CI/CD pipeline
  - Monitoring/logging

### Testing
- [ ] **Unit Tests**
  - Component tests (React Testing Library)
  - Utility function tests
  - Store tests

- [ ] **Integration Tests**
  - API endpoint tests
  - Database integration tests

- [ ] **E2E Tests**
  - Multi-viewer sync test (Playwright)
  - Reconnect test
  - Editor workflow test
  - Presenter workflow test

### Performance
- [ ] **Bundle Optimization**
  - Viewer bundle < 200KB gzipped
  - Code splitting verification
  - Tree shaking audit
  - Lazy load editor dependencies

- [ ] **Monitoring**
  - Bundle size CI check
  - Performance metrics (Core Web Vitals)
  - Error tracking (Sentry)
  - Analytics (privacy-respecting)

---

## 📝 NOTES

### Next Priorities
1. **Editor MVP**: Implement basic deck/slide/element editing
2. **Presenter enhancements**: Slide thumbnails + notes
3. **Viewer polish**: Fullscreen mode + keyboard shortcuts
4. **Database integration**: Connect editor to Postgres
5. **R2 integration**: Asset upload and management
6. **Authentication**: User accounts and deck ownership

### Design Principles
- **Performance first**: Keep viewer bundle lean
- **Offline-capable**: Editor should work offline with local storage
- **Accessible**: WCAG 2.1 AA compliance
- **Progressive enhancement**: Core features work without JS where possible
- **Security**: JWT validation, input sanitization, CSRF protection

