# ADR-005: Stack — React, uPlot, ECharts

## Context

The webapp needs to render dozens of real-time widgets (line charts, gauges, pies, heatmaps, …) at up to 1000 rows/s (APP-NFR-01) while staying approachable to future contributors — including AI coding assistants, which do much of the early implementation work on this project.

## Decision

- **React 18 + Zustand** for the UI and state — a large, well-documented ecosystem that both humans and AI assistants are broadly familiar with, keeping the barrier to contribution low.
- **uPlot** specifically for time-series line charts — it's the fastest canvas-based charting library available for streaming thousands of points/second, which generic charting libraries aren't built for.
- **Apache ECharts** (imported modularly, lazy-loaded) for everything else — gauge, pie, heatmap, polar, histogram — since it covers the rest of the catalog (SPEC.md §4) without needing a different library per widget kind.
- **react-grid-layout** for the dashboard grid (drag/resize), **Vite** for the build, **vite-plugin-pwa** for offline support.

## Consequences

- Two charting libraries in the bundle instead of one is deliberate: uPlot alone can't do gauges/pies, and ECharts alone can't sustain uPlot's streaming line-chart throughput. The initial bundle budget (SPEC.md §2.2, ≤400 KB gzip) relies on ECharts and heavy widgets being lazy-loaded, not on avoiding the second library.
- Any dependency beyond the SPEC.md §2.2 list needs to be justified in the commit that adds it (SPEC.md §2.2, CLAUDE.md).
- This is a v1 decision, not a permanent one — a future ADR can revisit it if a widget kind outgrows what ECharts offers.
