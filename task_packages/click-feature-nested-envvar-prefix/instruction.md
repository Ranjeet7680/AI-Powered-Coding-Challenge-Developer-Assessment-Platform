# Feature Request: Hierarchical Nested Environment Variable Prefix Propagation

## Background
Click supports `auto_envvar_prefix` on `click.Context` which allows options to read values from environment variables automatically (e.g. `MYCLI_PORT=8000` for `--port`). However, for subcommands in a `click.Group` (such as `mycli db create --host localhost`), subcommands do not naturally inherit and chain the group and subcommand names into a nested envvar prefix (e.g. `MYCLI_DB_CREATE_HOST`).

## Requirements
Implement hierarchical nested environment variable prefix propagation:

1. **Context Parameters**:
   - Add `nested_auto_envvar: bool = False` to `click.Context.__init__`.
   - Add `nested_envvar_delimiter: str = "_"` to `click.Context.__init__`.

2. **Hierarchical Prefix Inheritance**:
   - When a child `Context` is created from a parent context (e.g. when executing a subcommand in `Group.invoke`):
     - If parent `ctx.nested_auto_envvar` is `True` and `parent.auto_envvar_prefix` is set:
       - Child context inherits `nested_auto_envvar = True` and `nested_envvar_delimiter`.
       - Child context's `auto_envvar_prefix` is automatically constructed as:
         `f"{parent.auto_envvar_prefix}{delimiter}{child_command_name.upper()}"`
     - When `Option.resolve_envvar_value` is called in the child context, it automatically searches for:
       `f"{ctx.auto_envvar_prefix}_{param_name.upper()}"`.

3. **Delimiter Customization**:
   - Supports custom delimiters such as `"__"` (double underscore, common in 12-factor apps and Docker environment mappings).

4. **Backward Compatibility**:
   - When `nested_auto_envvar=False` (the default), existing `auto_envvar_prefix` behavior is completely preserved.
