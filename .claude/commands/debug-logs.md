# Debug Artifact Engine Logs

Analyze and debug error logs from the Artifact Engine application.

Log files are located at: `~/.artifact-engine/logs/`
Log format: `main-YYYY-MM-DD.log`
Log entry format: `[timestamp] [level] [scope] message`

## Instructions

1. First, list available log files to understand what's available:
   ```bash
   ls -lh ~/.artifact-engine/logs/
   ```

2. Read the most recent log file and identify any errors or warnings:
   ```bash
   cat ~/.artifact-engine/logs/main-$(date +%Y-%m-%d).log
   ```

3. Look for patterns in the logs:
   - `[error]` - Error level logs that need attention
   - `[warn]` - Warnings that may indicate issues
   - `[info]` - Informational messages
   - `[debug]` - Debug-level details

4. Common scopes to filter by:
   - `[main]` - Main process startup and lifecycle
   - `[ipc]` - IPC communication between main and renderer
   - `[mastra]` - Mastra AI/workflow integration
   - `[watcher]` - Desktop file watcher for screenshots

5. Analyze errors and provide:
   - A summary of what errors occurred
   - When they occurred (timestamps)
   - Potential root causes
   - Suggested fixes or next debugging steps

## User request
$ARGUMENTS
