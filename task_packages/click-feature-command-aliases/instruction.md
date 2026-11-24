# Feature Request: First-Class Command Aliases in Click Groups

## Background
CLI tools frequently support short aliases for commands (e.g. `git co` for `git checkout`, or `docker rm` / `docker remove`). Currently in Click, developers must subclass `click.Group` and manually override `get_command` and `resolve_command`.

## Requirements
Implement native first-class command alias support in `click.Group` and `click.Command`:

1. **`click.Command` and `@group.command` Parameter**:
   - Add `aliases: Optional[List[str]] = None` parameter to `click.Command.__init__` and `@group.command(...)`.
   - Store aliases as a list of strings on the command instance (`cmd.aliases`).

2. **Group Command Resolution**:
   - In `click.Group`:
     - When `get_command(ctx, cmd_name)` is called:
       - First check standard command names in `self.commands`.
       - If not found directly, look for any registered command whose `aliases` contains `cmd_name`.
       - If found, return the command.
     - Collision Detection:
       - If an alias matches an existing command name or another registered alias in the same group, `group.add_command` must raise `ValueError(f"Alias '{alias}' conflicts with an existing command or alias.")`.

3. **Help Formatting**:
   - In `click.Group.format_commands(ctx, formatter)`:
     - When a command has aliases, format the command name with its aliases in parentheses or comma-separated:
       `checkout (co)   Switch branches or restore files`
     - Aliases themselves should not be listed as separate duplicate rows in the command table.

4. **Backward Compatibility**:
   - Existing groups without aliases behave completely unchanged.
