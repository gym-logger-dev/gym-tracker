# STORY-002 design spec: app shell

Story: docs/backlog/STORY-002-expo-app-shell.md · W1 · R7 · Author: ux-designer · Build: mobile-dev
Scope: navigation chrome, three placeholder screens, error screen. No data, no network, no auth.

## 1. Navigation
- Bottom tab bar, three tabs in this order: Log (default, launch tab), History, Settings.
- Tab label = screen title. Each tab has an icon plus a visible text label (never icon-only).
- Back button/gesture: platform default. Tabs are siblings; Android back from a tab exits the app per platform convention. No custom handling.
- Dark-first with light theme following the system setting. Shell may use platform/system colours until `src/ui/theme/` tokens land (follow-up, not blocking this story).

## 2. Screen layout (all three tabs)
Header: screen title (display numeral face is not needed here; use body face, bold, large). Body: vertically centred empty state: icon (decorative), heading, one supporting line. No buttons on placeholders (nothing to act on yet).

| Tab | Header title | Empty heading | Supporting line |
|---|---|---|---|
| Log | Log | Nothing logged yet | Your sets will appear here once you start a session. |
| History | History | No sessions yet | Past sessions will show up here when you have logged some. |
| Settings | Settings | Nothing to set up yet | Preferences will live here in a later update. |

## 3. States
- Empty: as above (this is the only content state in this story).
- Loading: none. Nothing is fetched; screens render synchronously.
- Offline: identical to online. No offline banner, no network error copy (AC5).
- Error: any throw in a route shows the ErrorBoundary screen (section 4).
- Success: not applicable (no actions).

## 4. ErrorBoundary screen (root `_layout.tsx`)
- Full-screen, centred, no tab bar. Neutral tone, no blame, no technical detail, no stack trace, no error message text from the exception (may contain data).
- Heading: Something went wrong
- Body: This screen couldn't load. Your logged data isn't affected.
  - Note for mobile-dev/compliance: the data-safety sentence is accurate only while the shell has no data layer. When STORY-012 lands, re-confirm or remove it.
- Primary action: button "Try again" (calls the boundary's `retry`). Full-width, min height 48dp, blue action colour with white text.
- No secondary action in this story. If retry throws again, the same screen shows again; no loop counter or auto-retry.
- Focus: on show, screen reader focus moves to the heading.

## 5. Interactions
- Tap tab: switch, keep each tab's own state. No animation beyond platform default; respect "reduce motion".
- "Try again": re-renders the failed route. Haptics optional; not required.

## 6. Accessibility
- Touch targets: tab bar items and "Try again" at least 48 x 48dp (above the 44pt baseline; applies to both platforms).
- Labels: tab accessibilityLabel equals the tab title ("Log", "History", "Settings"); selected tab exposes selected state. Decorative icons `accessibilityElementsHidden` / `importantForAccessibility="no"`.
- Headings: empty-state and error headings use `accessibilityRole="header"`. "Try again" uses role `button`.
- Dynamic Type / font scale: all text scales; no fixed heights on text containers; layouts must remain usable at 200% scale (content scrolls if it overflows; tab labels may wrap to two lines or truncate with the icon still identifying the tab).
- Contrast: text >= 4.5:1 against its background, icons and the selected-tab indicator >= 3:1, in both light and dark. Verify the unselected tab label (commonly too faint) meets 4.5:1.
- No colour-only meaning: selected tab is marked by weight/indicator shape plus colour; nothing in this story uses green/red/yellow status colours.
- Screen reader order: header, icon (skipped), heading, supporting line.

## 7. Copy rules (R7)
Plain en-AU. Wellness-only: no diagnosis, disease, treatment, injury, or outcome promises ("get stronger", "lose weight", and similar). Suggestions, not prescriptions. No exclamation marks, no emoji.

## 8. User-visible strings (flat list, for security-compliance)
Tab and header titles:
1. Log
2. History
3. Settings

Empty states:
4. Nothing logged yet
5. Your sets will appear here once you start a session.
6. No sessions yet
7. Past sessions will show up here when you have logged some.
8. Nothing to set up yet
9. Preferences will live here in a later update.

ErrorBoundary:
10. Something went wrong
11. This screen couldn't load. Your logged data isn't affected.
12. Try again

Not user-visible but must be set (accessibility): tab accessibilityLabels reuse strings 1 to 3; no other strings. App name and locale (`en-AU`) in `app.config.ts` are Sev's placeholders; the display name is not covered here and needs the same R7 skim if it changes.

## 9. Review checklist (for design review of the built screens)
- Launches on Log; tab order and titles match section 2.
- Strings are exactly those in section 8 (grep the build for any extras).
- ErrorBoundary: no exception text shown; "Try again" is >= 48dp and re-renders the route.
- Font scale 200% and TalkBack: nothing clipped, tabs announced with name and selected state.
- Contrast measured in both themes.
