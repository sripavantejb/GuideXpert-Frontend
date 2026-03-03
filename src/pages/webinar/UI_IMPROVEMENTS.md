# Webinar Platform – UI Improvement Plan

Quick reference for future UI polish and feature updates.

## Done in this pass
- **Day nav:** Names only, no cards/boxes; simple text tabs with sliding underline.
- **Sidebar:** Training items (Dashboard, Videos, Progress, Doubts, Resources) in the middle; Profile & Settings under “Account” at bottom; cleaner header and spacing.
- **Doubts:** Available in nav → `/webinar/doubts`; users can ask questions and see answers there.
- **Sessions list:** Refined cards (thumbnail + title + duration + status); clearer active/locked states.
- **Video block:** Cleaner container (section, border, shadow); resume banner and certificate bar styling updated.

## Suggested next steps (priority order)
1. **Micro-interactions:** Subtle hover/focus transitions on session cards and sidebar items; optional skeleton loaders for video.
2. **Empty states:** Illustrations or short copy for “No sessions,” “No doubts,” and “No notes” to feel more polished.
3. **Responsive:** Test day tabs and session list on small screens; consider a compact “list only” session view on mobile.
4. **Accessibility:** Ensure all interactive elements have visible focus rings and that video controls are keyboard-friendly.
5. **Dark mode (optional):** If the app gets a theme, add a webinar-specific palette for dark background + contrast-safe text.
6. **Progress feedback:** Optional confetti or toast when a day is completed or certificate is unlocked.

## Notes
- Doubts are stored in context + `localStorage`; backend integration can be added later for real Q&A.
- Session thumbnails and video URLs come from `data/mockWebinarData.js`.
