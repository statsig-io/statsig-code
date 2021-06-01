# Statsig's VSCode Extension

[Statsig](https://www.statsig.com) is an experimentation platform where you can set up Feature Flags and Dynamic Configs with automated A/B tests. You get the benefits of rigorous product experimentation with little to no overhead. This extension has several features to bring insights from your Feature Flags into your development environment.

## Features

- Summary of your Flags and Configs.

  ![Config Summary](media/summary.gif)

- Insights when Hovering over a Feature Flag or Dynamic Config.

  ![Hover Insights: Feature Flags](media/hover_gate.gif)
  ![Hover Insights: Dynamic Configs](media/hover_config.gif)

- CodeLens (enable in Settings).

  ![CodeLens](media/codelens.png)

- Keyboard Shortcuts.

  ![Keyboard Shortcuts](media/keyboard.gif)

## Extension Settings

This extension contributes the following settings:

- `statsig.refresh.InBackground`: enable/disable incremental background refreshes of your flags and configs (refreshes while you're not interacting with the extension, so things are always up-to-date).
- `statsig.refresh.interval`: interval in minutes between each background refresh.
- `statsig.textEditor.enableHoverTooltips`: enable/disable tooltips when hovering over strings that match flag/config names.
- `statsig.textEditor.enableCodeLens`: enable/disable CodeLens on strings that match flag/config names. Disabled by default.
- `statsig.web.tier`: selects the set of web servers to hit when querying Statsig for data.

## Release Notes

Only major releases are documented here. See [CHANGELOG.md](CHANGELOG.md) for more details.

### 1.0.0

Initial release. Features:

- Summary of your Flags and Configs.
- Insights when Hovering over a Feature Flag or Dynamic Config.
- CodeLens (enable in Settings).
- Keyboard Shortcuts.
