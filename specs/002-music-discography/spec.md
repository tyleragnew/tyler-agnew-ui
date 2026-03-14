# Feature Specification: Music Discography Browser

**Feature Branch**: `002-music-discography`
**Created**: 2026-03-14
**Status**: Draft
**Input**: User description: "A discography browser for the Music page spanning all of Tyler's Bandcamp projects, with an in-page streaming player, sorted descending by release date."

## User Scenarios & Testing *(mandatory)*

<!--
  TDD/BDD MANDATE (Constitution II — NON-NEGOTIABLE):
  The Acceptance Scenarios below (Given/When/Then) are the PRIMARY design artifact.
  They MUST be committed as failing tests before ANY implementation code is written.
  The Red-Green-Refactor cycle begins here.
-->

### User Story 1 - Browse the Full Discography (Priority: P1)

A visitor arrives at the Music page and immediately sees a unified view of all releases
across Tyler's seven musical projects — cover art, artist name, title, and release year
— sorted from newest to oldest. They can take in the full creative output at a glance
without having to visit each project's page separately.

**Why this priority**: This is the core value of the feature. Every other capability
(streaming, auto-updating) depends on the releases being visible and well-organised.
Without a browsable discography, the page has no content at all.

**Independent Test**: Can be fully tested by visiting `/music`, confirming releases from
all seven artists appear, checking that each release shows cover art, artist name, title,
and year, and verifying the list is sorted newest-first.

**Acceptance Scenarios**:

1. **Given** a visitor navigates to the Music page, **When** the page loads, **Then** a
   grid of releases is displayed with at least one release visible.

2. **Given** the discography grid is visible, **When** the visitor inspects any release
   card, **Then** it shows the release cover art, artist name, album title, and release year.

3. **Given** the discography grid is visible, **When** the visitor compares release dates
   across cards, **Then** releases are ordered from most recent to oldest.

4. **Given** the discography grid is visible, **When** the visitor scans the artist names,
   **Then** releases from all seven projects — Tyler Agnew, Scarry Burdz, Howling Boil,
   Blue Plutos, Toy Factory, Pesci Devito, and Covered Bridges — are represented.

5. **Given** a visitor uses a screen reader, **When** they navigate the discography,
   **Then** each release card is fully accessible with meaningful labels for all elements.

---

### User Story 2 - Stream a Release Inline (Priority: P2)

A visitor who finds a release they want to hear can play it directly on the page without
being redirected away. They click a release, a player appears, and they can listen
without losing their place in the discography.

**Why this priority**: Streaming is the defining differentiator from a plain links list.
It keeps visitors engaged on the site and directly fulfils the purpose of an
"in-page streaming player."

**Independent Test**: Can be fully tested by clicking a release card, confirming a player
appears, verifying audio begins streaming, and confirming the rest of the discography
remains visible and scrollable while playing.

**Acceptance Scenarios**:

1. **Given** a visitor views the discography, **When** they click on a release card,
   **Then** an embedded audio player for that release appears on the page.

2. **Given** an embedded player is visible, **When** the visitor uses the player controls,
   **Then** they can play, pause, and adjust volume without leaving the Music page.

3. **Given** a player is active for one release, **When** the visitor clicks a different
   release card, **Then** the player switches to the newly selected release.

4. **Given** a visitor is playing a release, **When** they scroll through the discography,
   **Then** the player remains accessible and playback is not interrupted.

5. **Given** a visitor uses keyboard navigation, **When** they activate a release card,
   **Then** the player opens and focus is managed appropriately.

---

### User Story 3 - Discography Stays Current Automatically (Priority: P3)

When Tyler publishes a new release on any of his Bandcamp pages, it appears on the
Music page within 24 hours — no manual site update required. If the data source
becomes temporarily unavailable, the last-known release list is still shown so the
page never goes blank.

**Why this priority**: Automatic freshness is a quality-of-life feature — important for
long-term maintainability but not required for initial launch. The discography browser
is fully valuable even with a manually-refreshed data source.

**Independent Test**: Can be tested by confirming the release data reflects current
content from all seven sources, and by simulating a data-source outage and confirming
the page still renders with a graceful fallback state rather than an error.

**Acceptance Scenarios**:

1. **Given** a new release is published on any of the seven artist pages, **When** at
   most 24 hours pass, **Then** the release appears in the discography without any
   manual intervention.

2. **Given** the external data source is unavailable, **When** a visitor loads the Music
   page, **Then** previously cached releases are shown and the page does not display an
   error or go blank.

3. **Given** the external data source is unavailable for an extended period, **When** a
   maintainer provides a manually-curated fallback release list, **Then** that list is
   displayed with no visible difference to the visitor.

---

### Edge Cases

- What happens when a release has no cover art? → A tasteful placeholder image is shown
  in place of missing artwork.
- What happens when the page is loading? → A skeleton layout is displayed so the page
  does not shift abruptly when content arrives.
- What happens when all data sources fail simultaneously? → A friendly message is shown
  ("Check back soon") rather than a blank page or error state.
- What happens on a narrow mobile viewport? → Release cards reflow to a single or
  two-column layout; the embedded player remains fully usable.
- What happens if a visitor clicks a release while another is playing? → The previous
  player stops and the new release loads — only one player is active at a time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Music page MUST display a browsable grid of all releases across all
  seven artist projects.
- **FR-002**: Each release card MUST display: cover art, artist name, album title, and
  release year.
- **FR-003**: Releases MUST be sorted in descending order by release date (newest first).
- **FR-004**: A visitor MUST be able to activate an inline audio player for any release
  by clicking its card.
- **FR-005**: Only one release player MUST be active at a time; selecting a new release
  replaces the current one.
- **FR-006**: The inline player MUST allow play, pause, and volume control without
  leaving the Music page.
- **FR-007**: The discography data MUST refresh automatically — new releases appear
  within 24 hours of being published, with no manual site updates.
- **FR-008**: The Music page MUST display a usable release list even when the primary
  data source is unavailable, using a fallback data set.
- **FR-009**: All release cards and player controls MUST be fully keyboard-navigable
  and screen-reader accessible.
- **FR-010**: The release grid MUST be responsive — usable and legible at 320px, 768px,
  and 1280px viewport widths.
- **FR-011**: When release data is loading, the page MUST show a skeleton or loading
  state rather than a blank layout.

### Key Entities

- **Release**: A single album or EP. Attributes: cover art, artist name, title, release
  date, and a unique identifier linking to the streaming source.
- **Artist**: One of the seven musical projects. Attributes: display name, source
  location for their release catalogue.
- **Player State**: Tracks which release is currently selected and whether playback is
  active. Only one player is active at a time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All releases from all seven artists are visible on the Music page in a
  single visit — no pagination or separate pages required.
- **SC-002**: A visitor can go from landing on the Music page to streaming a release
  in two interactions or fewer (view page → click release).
- **SC-003**: New releases appear on the Music page within 24 hours of being published,
  with no manual intervention.
- **SC-004**: The Music page displays release cards within 2.5 seconds on a standard
  broadband connection.
- **SC-005**: The Music page renders a usable release list 100% of the time — even
  during data-source outages — by falling back to a curated static list.
- **SC-006**: All release cards and player controls pass automated accessibility audit
  with zero critical or serious violations.
- **SC-007**: The release grid is fully usable at 320px viewport width with no
  horizontal overflow and no truncated content.

## Assumptions

- The seven artist Bandcamp pages are the authoritative source for Tyler's releases;
  no other platforms need to be included in this feature.
- All releases are public and can be streamed via Bandcamp's official embed mechanism;
  pay-gated or download-only releases are out of scope.
- The fallback static release list will be manually maintained by Tyler and stored in
  the repository; keeping it current is an accepted maintenance responsibility.
- Release volume across all seven artists is expected to be under 100 items total,
  so pagination is not required at launch.
- The embedded player's visual appearance is controlled by the streaming source;
  custom styling of the player itself is out of scope.
- No user accounts, favourites, or playback history are required for this feature.
