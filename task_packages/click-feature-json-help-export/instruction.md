# Feature Request: Structured JSON Help Output (--help-format=json)

## Background
Developer tools, IDE plugins, and agentic coding frameworks frequently need to introspect CLI tool command trees, available parameters, data types, and help descriptions without fragile text parsing of human-targeted ANSI terminal output.

## Requirements
Add native structured JSON help output generation to Click:

1. **Context & Command Help Format Configuration**:
   - In `click.Context`:
     - Add `help_format: str = "text"` (supports `"text"` and `"json"`).
   - In `click.Command`:
     - Add `to_help_dict(self, ctx: Context) -> Dict[str, Any]` which returns a dictionary representing the command specification:
       - `name`: Command name string.
       - `description`: Clean help description or docstring.
       - `usage`: Standard usage line string.
       - `options`: List of option metadata dictionaries:
         - `names`: List of option flags (e.g. `["-c", "--count"]`).
         - `type`: String type name (e.g. `"INT"`, `"TEXT"`, `"BOOLEAN"`).
         - `required`: Boolean indicating if required.
         - `default`: Default value or `None`.
         - `help`: Option help text.
       - `subcommands`: List of child subcommand dictionaries (if the command is a Group / MultiCommand).

2. **Automatic JSON Output Trigger**:
   - In `click.Command.get_help(ctx)`:
     - If `ctx.help_format == "json"` or `getattr(ctx, "help_format", None) == "json"`:
       Return formatted JSON using `json.dumps(self.to_help_dict(ctx), indent=2)`.
   - Also allow passing `--help-format=json` when `--help` is invoked if `add_help_format_option=True` is enabled on the command or when configured on context.

3. **Backward Compatibility**:
   - The default `help_format` remains `"text"`. Standard text output is unaffected.
