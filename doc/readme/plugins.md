## Plugin Guide

Plugin functionality is provided by [zephyr][] see the [zephyr plugins][zephyr-plugins] documentation.

Plugin implementations that encapsulate a stream should export a function that creates a new stream so that the plugin is fully compatible with calling `pipe()` and define a `plugin` function that defines the plugin functionality, see [argv](/lib/plugin/argv/index.js).

For plugins that do not expose a stream they can export the plugin function directly, see [core](/lib/plugin/core/index.js).

The design of the system is such that the plugins and stream implementations are separate modules so that the streams may be used outside of the plugin system if required. The majority of the plugins are thin wrappers for the stream to support chained method calls without always calling `pipe()` directly.
