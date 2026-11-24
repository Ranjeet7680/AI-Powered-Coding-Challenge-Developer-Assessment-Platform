"""
Feature Definitions for the 5 Substantively Different Tasks
Target: pallets/click @ 934813e4d421071a1b3db3973c02fe2721359a6e
"""

from typing import Dict, Any, List

TASKS_DATA: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # Task 1: Password Option Minimum Length & Custom Validator
    # -------------------------------------------------------------------------
    {
        "id": "click-feature-password-minlen-validator",
        "title": "Interactive Password Option Minimum Length and Custom Validator",
        "description": "Enhance click.password_option with min_length and custom validator callback support during interactive prompt and CLI parsing.",
        "instruction": """# Feature Request: Password Option Minimum Length & Custom Validator

## Background
`click.password_option` is widely used to prompt users securely for passwords with hidden terminal input and confirmation checks. However, applications requiring password complexity (e.g. minimum character length or character class rules) currently must write custom prompt loops outside Click or reject the password after the entire command invocation.

## Requirements
Enhance Click's password option and terminal prompt functionality with `min_length` and `validator`:

1. **`click.password_option` Parameters**:
   - Add `min_length: Optional[int] = None`: When provided, the entered password must have at least this number of characters.
   - Add `validator: Optional[Callable[[str], Any]] = None`: An optional callback that accepts the candidate password string. If the password fails validation, the callback should raise either `click.UsageError(message)` or `ValueError(message)`.

2. **Interactive Prompt Behavior (`click.prompt`)**:
   - In `click.prompt(hide_input=True)` and `click.password_option`:
     - When `min_length` is set and the user enters a password shorter than `min_length`, Click must print:
       `Error: Password must be at least {min_length} characters long.`
       and immediately reprompt the user without terminating.
     - When `validator` is provided and raises `click.UsageError(msg)` or `ValueError(msg)`, Click must print:
       `Error: {msg}`
       and immediately reprompt the user.
     - Confirmation prompting must only prompt for confirmation *after* the initial password passes length and validator checks.

3. **Non-interactive / Flag Value Validation**:
   - If a password value is supplied directly via command-line option (e.g. `--password secret`), Click must validate `min_length` and `validator`. If validation fails, Click must raise `click.BadParameter` with the appropriate error message.

4. **Backward Compatibility**:
   - If neither `min_length` nor `validator` is provided, behavior remains identical to existing `click.password_option`.
""",
        "solution_patch": """diff --git a/src/click/core.py b/src/click/core.py
--- a/src/click/core.py
+++ b/src/click/core.py
@@ -2526,6 +2526,8 @@ class Option(Parameter):
         prompt_required: bool = True,
         count: bool = False,
         show_choices: bool = True,
+        min_length: t.Optional[int] = None,
+        validator: t.Optional[t.Callable[[str], t.Any]] = None,
         **attrs: t.Any,
     ) -> None:
         super().__init__(param_decls, type=type, **attrs)
@@ -2544,6 +2546,8 @@ class Option(Parameter):
         self.count = count
         self.show_default = show_default
         self.show_choices = show_choices
+        self.min_length = min_length
+        self.validator = validator
 
         if count:
             if type is None:
@@ -2620,6 +2624,20 @@ class Option(Parameter):
                 self.name,
             )
 
+    def process_value(self, ctx: Context, value: t.Any) -> t.Any:
+        value = super().process_value(ctx, value)
+        if value is not None and isinstance(value, str):
+            if self.min_length is not None and len(value) < self.min_length:
+                raise BadParameter(
+                    f"Password must be at least {self.min_length} characters long.", ctx, self
+                )
+            if self.validator is not None:
+                try:
+                    self.validator(value)
+                except Exception as e:
+                    raise BadParameter(str(e), ctx, self) from e
+        return value
+
     def to_info_dict(self) -> t.Dict[str, t.Any]:
         info_dict = super().to_info_dict()
         info_dict.update(
@@ -2896,6 +2914,8 @@ class Option(Parameter):
             show_choices=self.show_choices,
             confirmation_prompt=self.confirmation_prompt,
             value_proc=lambda x: self.process_value(ctx, x),
+            min_length=self.min_length,
+            validator=self.validator,
         )
 
     def resolve_envvar_value(self, ctx: Context) -> t.Optional[str]:
diff --git a/src/click/decorators.py b/src/click/decorators.py
--- a/src/click/decorators.py
+++ b/src/click/decorators.py
@@ -392,7 +392,12 @@ def confirmation_option(*param_decls: str, **kwargs: t.Any) -> t.Callable[[FC],
     return option(*param_decls, **kwargs)
 
 
-def password_option(*param_decls: str, **kwargs: t.Any) -> t.Callable[[FC], FC]:
+def password_option(
+    *param_decls: str,
+    min_length: t.Optional[int] = None,
+    validator: t.Optional[t.Callable[[str], t.Any]] = None,
+    **kwargs: t.Any,
+) -> t.Callable[[FC], FC]:
     \"\"\"Add a ``--password`` option which prompts for a password, hiding
     input and asking to enter the value again for confirmation.
 
@@ -406,6 +411,10 @@ def password_option(*param_decls: str, **kwargs: t.Any) -> t.Callable[[FC], FC]
     kwargs.setdefault("prompt", True)
     kwargs.setdefault("confirmation_prompt", True)
     kwargs.setdefault("hide_input", True)
+    if min_length is not None:
+        kwargs["min_length"] = min_length
+    if validator is not None:
+        kwargs["validator"] = validator
     return option(*param_decls, **kwargs)
 
 
diff --git a/src/click/termui.py b/src/click/termui.py
--- a/src/click/termui.py
+++ b/src/click/termui.py
@@ -88,6 +88,8 @@ def prompt(
     err: bool = False,
     show_choices: bool = True,
+    min_length: t.Optional[int] = None,
+    validator: t.Optional[t.Callable[[str], t.Any]] = None,
 ) -> t.Any:
     \"\"\"Prompts a user for input.  This is a convenience function that can
     be used to prompt a user for input later.
@@ -167,6 +169,18 @@ def prompt(
             elif default is not None:
                 value = default
                 break
+            if min_length is not None and len(value) < min_length:
+                echo(_(f"Error: Password must be at least {min_length} characters long."), err=err)
+                continue
+            if validator is not None:
+                try:
+                    validator(value)
+                except (UsageError, ValueError) as err_obj:
+                    msg = getattr(err_obj, "message", None) or str(err_obj)
+                    echo(_(f"Error: {msg}"), err=err)
+                    continue
+                except Exception as err_obj:
+                    echo(_(f"Error: {err_obj}"), err=err)
+                    continue
         try:
             result = value_proc(value)
         except UsageError as e:
""",
        "test_feature": """import click
from click.testing import CliRunner
import pytest

def test_password_option_min_length_interactive():
    @click.command()
    @click.password_option(min_length=8)
    def cli(password):
        click.echo(f"Valid password: {len(password)} chars")

    runner = CliRunner()
    # 1st try: "short" (5 chars) -> rejected with Error
    # 2nd try: "valid_pass" (10 chars), confirmation matches
    result = runner.invoke(cli, input="short\\nvalid_pass\\nvalid_pass\\n")
    assert result.exit_code == 0
    assert "Error: Password must be at least 8 characters long." in result.output
    assert "Valid password: 10 chars" in result.output

def test_password_option_min_length_flag_validation():
    @click.command()
    @click.password_option(min_length=8)
    def cli(password):
        click.echo(password)

    runner = CliRunner()
    result = runner.invoke(cli, ["--password", "short"])
    assert result.exit_code != 0
    assert "Password must be at least 8 characters long" in result.output

def test_password_option_custom_validator():
    def must_have_digit(val):
        if not any(c.isdigit() for c in val):
            raise ValueError("Must contain at least one digit")

    @click.command()
    @click.password_option(validator=must_have_digit)
    def cli(password):
        click.echo("Success")

    runner = CliRunner()
    result = runner.invoke(cli, input="nodigits\\npass123\\npass123\\n")
    assert result.exit_code == 0
    assert "Error: Must contain at least one digit" in result.output
    assert "Success" in result.output
""",
        "fail_to_pass": [
            "tests/test_feature.py::test_password_option_min_length_interactive",
            "tests/test_feature.py::test_password_option_min_length_flag_validation",
            "tests/test_feature.py::test_password_option_custom_validator"
        ],
        "pass_to_pass": [
            "tests/test_basic.py::test_basic_functionality",
            "tests/test_basic.py::test_prompts",
            "tests/test_options.py::test_custom_values"
        ]
    },

    # -------------------------------------------------------------------------
    # Task 2: First-Class Command Aliases in Click Groups
    # -------------------------------------------------------------------------
    {
        "id": "click-feature-command-aliases",
        "title": "First-Class Command Aliases in Click Groups",
        "description": "Add native aliases support to click.Group commands, enabling multiple invocation aliases, prefix resolution, collision detection, and help formatting.",
        "instruction": """# Feature Request: First-Class Command Aliases in Click Groups

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
""",
        "solution_patch": """diff --git a/src/click/core.py b/src/click/core.py
--- a/src/click/core.py
+++ b/src/click/core.py
@@ -1245,6 +1245,7 @@ class Command(BaseCommand):
         help: t.Optional[str] = None,
         epilog: t.Optional[str] = None,
         short_help: t.Optional[str] = None,
+        aliases: t.Optional[t.List[str]] = None,
         options_metavar: t.Optional[str] = "[OPTIONS]",
         add_help_option: bool = True,
         no_args_is_help: bool = False,
@@ -1263,6 +1264,7 @@ class Command(BaseCommand):
         self.params: t.List[Parameter] = params or []
         self.callback = callback
         self.help = help
+        self.aliases: t.List[str] = list(aliases) if aliases else []
         self.epilog = epilog
         self.options_metavar = options_metavar
         self.short_help = short_help
@@ -1763,6 +1765,11 @@ class MultiCommand(Command):
         self.commands: t.Dict[str, Command] = {}
         if commands is not None:
             self.commands.update(commands)
+        self._alias_mapping: t.Dict[str, str] = {}
+        for cmd_name, cmd in self.commands.items():
+            for alias in getattr(cmd, "aliases", []):
+                self._alias_mapping[alias] = cmd_name
+
         self.chain = chain
         self.result_callback = result_callback
 
@@ -1792,6 +1799,13 @@ class MultiCommand(Command):
         \"\"\"
         name = name or cmd.name
         if name is None:
             raise TypeError("Command has no name.")
+        if name in self._alias_mapping:
+            raise ValueError(f"Command name '{name}' conflicts with an existing alias.")
+        for alias in getattr(cmd, "aliases", []):
+            if alias in self.commands or alias in self._alias_mapping:
+                raise ValueError(f"Alias '{alias}' conflicts with an existing command or alias.")
+            self._alias_mapping[alias] = name
         _check_multicommand(self, name, cmd, register=True)
         self.commands[name] = cmd
 
@@ -1838,6 +1852,9 @@ class MultiCommand(Command):
         \"\"\"
         if cmd_name in self.commands:
             return self.commands[cmd_name]
+        if cmd_name in self._alias_mapping:
+            real_name = self._alias_mapping[cmd_name]
+            return self.commands.get(real_name)
         return None
 
     def list_commands(self, ctx: Context) -> t.List[str]:
@@ -1865,7 +1882,11 @@ class MultiCommand(Command):
             help = cmd.get_short_help_str(limit)
+            aliases = getattr(cmd, "aliases", [])
+            if aliases:
+                display_name = f"{subcommand} ({', '.join(aliases)})"
+            else:
+                display_name = subcommand
-            rows.append((subcommand, help))
+            rows.append((display_name, help))
 
         if rows:
             with formatter.section(_("Commands")):
""",
        "test_feature": """import click
from click.testing import CliRunner
import pytest

def test_command_alias_dispatch():
    @click.group()
    def cli():
        pass

    @cli.command("checkout", aliases=["co", "switch"])
    def checkout():
        click.echo("Checked out branch")

    runner = CliRunner()
    # Main name
    res1 = runner.invoke(cli, ["checkout"])
    assert res1.exit_code == 0
    assert "Checked out branch" in res1.output

    # Alias 1
    res2 = runner.invoke(cli, ["co"])
    assert res2.exit_code == 0
    assert "Checked out branch" in res2.output

    # Alias 2
    res3 = runner.invoke(cli, ["switch"])
    assert res3.exit_code == 0
    assert "Checked out branch" in res3.output

def test_command_alias_help_formatting():
    @click.group()
    def cli():
        pass

    @cli.command("checkout", aliases=["co"], help="Switch branches.")
    def checkout():
        pass

    runner = CliRunner()
    res = runner.invoke(cli, ["--help"])
    assert res.exit_code == 0
    assert "checkout (co)" in res.output
    assert "Switch branches." in res.output

def test_alias_conflict_detection():
    @click.group()
    def cli():
        pass

    @cli.command("first", aliases=["shared"])
    def first():
        pass

    with pytest.raises(ValueError, match="conflicts with an existing"):
        @cli.command("second", aliases=["shared"])
        def second():
            pass
""",
        "fail_to_pass": [
            "tests/test_feature.py::test_command_alias_dispatch",
            "tests/test_feature.py::test_command_alias_help_formatting",
            "tests/test_feature.py::test_alias_conflict_detection"
        ],
        "pass_to_pass": [
            "tests/test_commands.py::test_command_execution",
            "tests/test_commands.py::test_command_return_values"
        ]
    },

    # -------------------------------------------------------------------------
    # Task 3: Structured JSON Help Output (--help-format=json)
    # -------------------------------------------------------------------------
    {
        "id": "click-feature-json-help-export",
        "title": "Structured JSON Help Output for CLI Introspection",
        "description": "Add structured JSON help output formatting via --help-format or context option, enabling tooling and IDEs to inspect command schemas programmatically.",
        "instruction": """# Feature Request: Structured JSON Help Output (--help-format=json)

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
""",
        "solution_patch": """diff --git a/src/click/core.py b/src/click/core.py
--- a/src/click/core.py
+++ b/src/click/core.py
@@ -1,4 +1,5 @@
 import enum
+import json
 import inspect
 import os
 import sys
@@ -486,6 +487,7 @@ class Context:
         resilient_parsing: bool = False,
         auto_envvar_prefix: t.Optional[str] = None,
+        help_format: str = "text",
         **extra: t.Any,
     ) -> None:
         self.parent = parent
@@ -524,6 +526,7 @@ class Context:
         self.show_default = show_default
         self.resilient_parsing = resilient_parsing
         self.auto_envvar_prefix = auto_envvar_prefix
+        self.help_format = help_format
 
         if color is None:
             color = parent.color if parent else None
@@ -1347,6 +1350,37 @@ class Command(BaseCommand):
             formatter.write_usage(prog_name, self.format_usage(ctx))
         return formatter.getvalue().rstrip("\\n")
 
+    def to_help_dict(self, ctx: Context) -> t.Dict[str, t.Any]:
+        opts = []
+        for param in self.get_params(ctx):
+            if isinstance(param, Option):
+                opts.append({
+                    "names": list(param.opts) + list(param.secondary_opts),
+                    "type": param.type.name.upper() if hasattr(param.type, "name") else "TEXT",
+                    "required": bool(param.required),
+                    "default": param.default,
+                    "help": param.help or "",
+                })
+        data: t.Dict[str, t.Any] = {
+            "name": self.name,
+            "description": self.help or "",
+            "usage": self.get_usage(ctx),
+            "options": opts,
+            "subcommands": []
+        }
+        if isinstance(self, MultiCommand):
+            for sub_name in self.list_commands(ctx):
+                sub_cmd = self.get_command(ctx, sub_name)
+                if sub_cmd:
+                    data["subcommands"].append({
+                        "name": sub_name,
+                        "help": sub_cmd.get_short_help_str()
+                    })
+        return data
+
     def get_help(self, ctx: Context) -> str:
+        if getattr(ctx, "help_format", "text") == "json":
+            return json.dumps(self.to_help_dict(ctx), indent=2)
         formatter = ctx.make_formatter()
         self.format_help(ctx, formatter)
         return formatter.getvalue().rstrip("\\n")
""",
        "test_feature": """import click
import json
from click.testing import CliRunner
import pytest

def test_json_help_formatting():
    @click.command(help="Test greeting command.")
    @click.option("--count", "-c", default=1, type=int, help="Number of repetitions.")
    @click.option("--name", required=True, help="Person to greet.")
    def cli(count, name):
        pass

    runner = CliRunner()
    ctx = click.Context(cli, help_format="json")
    help_text = cli.get_help(ctx)

    data = json.loads(help_text)
    assert data["description"] == "Test greeting command."
    assert "options" in data
    assert len(data["options"]) >= 2

    # Check count option
    count_opt = next(o for o in data["options"] if "--count" in o["names"])
    assert count_opt["type"] == "INTEGER"
    assert count_opt["default"] == 1
    assert count_opt["required"] is False

    # Check name option
    name_opt = next(o for o in data["options"] if "--name" in o["names"])
    assert name_opt["required"] is True

def test_json_help_group_subcommands():
    @click.group(help="Root service CLI.")
    def group():
        pass

    @group.command("deploy", help="Deploy service.")
    def deploy():
        pass

    ctx = click.Context(group, help_format="json")
    help_text = group.get_help(ctx)
    data = json.loads(help_text)

    assert data["name"] is None or data["name"] == "group"
    sub_names = [sub["name"] for sub in data["subcommands"]]
    assert "deploy" in sub_names
""",
        "fail_to_pass": [
            "tests/test_feature.py::test_json_help_formatting",
            "tests/test_feature.py::test_json_help_group_subcommands"
        ],
        "pass_to_pass": [
            "tests/test_formatting.py::test_basic_formatting",
            "tests/test_context.py::test_basic_context"
        ]
    },

    # -------------------------------------------------------------------------
    # Task 4: Hierarchical Nested Environment Variable Prefixing
    # -------------------------------------------------------------------------
    {
        "id": "click-feature-nested-envvar-prefix",
        "title": "Hierarchical Nested Environment Variable Prefix Propagation",
        "description": "Add nested subcommand environment variable prefix propagation with configurable delimiter to Click commands.",
        "instruction": """# Feature Request: Hierarchical Nested Environment Variable Prefix Propagation

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
""",
        "solution_patch": """diff --git a/src/click/core.py b/src/click/core.py
--- a/src/click/core.py
+++ b/src/click/core.py
@@ -486,6 +486,8 @@ class Context:
         resilient_parsing: bool = False,
         auto_envvar_prefix: t.Optional[str] = None,
+        nested_auto_envvar: bool = False,
+        nested_envvar_delimiter: str = "_",
         **extra: t.Any,
     ) -> None:
         self.parent = parent
@@ -524,6 +526,16 @@ class Context:
         self.show_default = show_default
         self.resilient_parsing = resilient_parsing
         self.auto_envvar_prefix = auto_envvar_prefix
+        self.nested_auto_envvar = nested_auto_envvar
+        self.nested_envvar_delimiter = nested_envvar_delimiter
+
+        if self.parent is not None and getattr(self.parent, "nested_auto_envvar", False):
+            self.nested_auto_envvar = True
+            self.nested_envvar_delimiter = self.parent.nested_envvar_delimiter
+            if self.parent.auto_envvar_prefix and self.command and self.command.name:
+                delim = self.nested_envvar_delimiter
+                cmd_part = self.command.name.upper()
+                self.auto_envvar_prefix = f"{self.parent.auto_envvar_prefix}{delim}{cmd_part}"
 
         if color is None:
             color = parent.color if parent else None
""",
        "test_feature": """import click
from click.testing import CliRunner
import pytest

def test_nested_auto_envvar_default_delimiter(monkeypatch):
    @click.group()
    def cli():
        pass

    @cli.group()
    def db():
        pass

    @db.command()
    @click.option("--host")
    def migrate(host):
        click.echo(f"Host: {host}")

    monkeypatch.setenv("APP_DB_MIGRATE_HOST", "db.internal.net")
    runner = CliRunner()
    result = runner.invoke(cli, ["db", "migrate"], auto_envvar_prefix="APP", nested_auto_envvar=True)
    assert result.exit_code == 0
    assert "Host: db.internal.net" in result.output

def test_nested_auto_envvar_double_underscore(monkeypatch):
    @click.group()
    def cli():
        pass

    @cli.command()
    @click.option("--port", type=int)
    def serve(port):
        click.echo(f"Port: {port}")

    monkeypatch.setenv("ACME__SERVE_PORT", "9090")
    runner = CliRunner()
    result = runner.invoke(
        cli,
        ["serve"],
        auto_envvar_prefix="ACME",
        nested_auto_envvar=True,
        nested_envvar_delimiter="__"
    )
    assert result.exit_code == 0
    assert "Port: 9090" in result.output
""",
        "fail_to_pass": [
            "tests/test_feature.py::test_nested_auto_envvar_default_delimiter",
            "tests/test_feature.py::test_nested_auto_envvar_double_underscore"
        ],
        "pass_to_pass": [
            "tests/test_options.py::test_multiple_options",
            "tests/test_basic.py::test_basic_functionality"
        ]
    },

    # -------------------------------------------------------------------------
    # Task 5: First-Class Parameter Deprecation Lifecycle & Warnings
    # -------------------------------------------------------------------------
    {
        "id": "click-feature-parameter-deprecation",
        "title": "First-Class Parameter Deprecation Lifecycle & Warnings",
        "description": "Add native parameter deprecation support with ClickDeprecationWarning and [Deprecated] help formatting.",
        "instruction": """# Feature Request: First-Class Parameter Deprecation Lifecycle

## Background
When evolving production CLI applications, commands and options frequently need to be deprecated before complete removal. Currently in Click, developers must implement custom callbacks or print ad-hoc warnings to stderr, with no standard warning class or help decoration.

## Requirements
Implement native first-class parameter deprecation in `click.core.Parameter` and `click.core.Option`:

1. **`click.ClickDeprecationWarning`**:
   - In `click.exceptions`:
     - Add `class ClickDeprecationWarning(UserWarning):` as a standard warning class.

2. **Parameter Attributes**:
   - In `click.core.Parameter.__init__`:
     - Add `deprecated: Union[bool, str] = False`:
       - If `True`: Marks the parameter as deprecated with a default message.
       - If `str`: Marks the parameter as deprecated with a custom message (e.g. `"Use --target instead"`).
     - Expose attributes `self.deprecated: bool` and `self.deprecated_message: Optional[str]`.

3. **Runtime Warning Emission**:
   - In `click.core.Parameter.handle_parse_result`:
     - If the parameter is provided by the user on the command-line (or resolved) and `self.deprecated` is `True`:
       Emit a `ClickDeprecationWarning` via `warnings.warn(message, ClickDeprecationWarning, stacklevel=2)`.
       - If a custom string was passed to `deprecated`, the warning message should be:
         `f"Option '{self.name}' is deprecated: {self.deprecated_message}"`
       - Otherwise:
         `f"Option '{self.name}' is deprecated and will be removed in a future release."`

4. **Help Output Decoration**:
   - In `Option.get_help_record(ctx)`:
     - When `self.deprecated` is `True`, append `[Deprecated]` or `[Deprecated: {self.deprecated_message}]` to the help text displayed to users.

5. **Backward Compatibility**:
   - Existing parameters without `deprecated` behave completely normally with zero warnings.
""",
        "solution_patch": """diff --git a/src/click/exceptions.py b/src/click/exceptions.py
--- a/src/click/exceptions.py
+++ b/src/click/exceptions.py
@@ -308,3 +308,8 @@ class MissingParameter(BadParameter):
             _("Missing {param_type}").format(param_type=self.param_type),
         )
         return f"{title}: {msg}"
+
+
+class ClickDeprecationWarning(UserWarning):
+    \"\"\"Warning emitted when a deprecated Click parameter or feature is used.\"\"\"
+    pass
diff --git a/src/click/core.py b/src/click/core.py
--- a/src/click/core.py
+++ b/src/click/core.py
@@ -5,6 +5,7 @@ import os
 import sys
 import typing as t
+import warnings
 from collections import deque
 from contextlib import ExitStack
 from functools import update_wrapper
@@ -35,6 +36,7 @@ from .exceptions import BadArgumentUsage
 from .exceptions import BadParameter
 from .exceptions import ClickException
 from .exceptions import Exit
+from .exceptions import ClickDeprecationWarning
 from .exceptions import MissingParameter
 from .exceptions import NoSuchOption
 from .exceptions import UsageError
@@ -2366,6 +2368,7 @@ class Parameter:
         autocompletion: t.Optional[
             t.Callable[[Context, t.List[str], str], t.List[t.Union[str, t.Tuple[str, str]]]]
         ] = None,
+        deprecated: t.Union[bool, str] = False,
     ) -> None:
         self.name: t.Optional[str] = name
         self.opts: t.List[str] = []
@@ -2380,6 +2383,13 @@ class Parameter:
         self.default = default
         self.callback = callback
         self.nargs = nargs
+        self.deprecated = bool(deprecated)
+        self.deprecated_message = deprecated if isinstance(deprecated, str) else None
         self.multiple = multiple
         self.expose_value = expose_value
         self.is_eager = is_eager
@@ -2448,6 +2458,13 @@ class Parameter:
     def handle_parse_result(
         self, ctx: Context, opts: t.Mapping[str, t.Any], args: t.List[t.Any]
     ) -> t.Tuple[t.Any, t.List[t.Any]]:
+        if self.deprecated and self.name in opts:
+            msg = (
+                f"Option '{self.name}' is deprecated: {self.deprecated_message}"
+                if self.deprecated_message
+                else f"Option '{self.name}' is deprecated and will be removed in a future release."
+            )
+            warnings.warn(msg, ClickDeprecationWarning, stacklevel=2)
         value, args = self.consume_value(ctx, opts)
         try:
             value = self.process_value(ctx, value)
@@ -2799,6 +2816,11 @@ class Option(Parameter):
         help = self.help or ""
         extra = []
 
+        if self.deprecated:
+            extra.append(
+                f"Deprecated: {self.deprecated_message}" if self.deprecated_message else "Deprecated"
+            )
+
         if self.show_envvar:
             envvar = self.resolve_envvar_value(ctx)
             if envvar is not None:
""",
        "test_feature": """import click
from click.testing import CliRunner
from click.exceptions import ClickDeprecationWarning
import pytest

def test_deprecated_option_warning():
    @click.command()
    @click.option("--old-flag", deprecated=True, is_flag=True)
    def cli(old_flag):
        click.echo(f"Flag is {old_flag}")

    runner = CliRunner()
    with pytest.deprecated_call(match="Option 'old_flag' is deprecated"):
        result = runner.invoke(cli, ["--old-flag"])
        assert result.exit_code == 0
        assert "Flag is True" in result.output

def test_deprecated_option_custom_message():
    @click.command()
    @click.option("--legacy", deprecated="Use --modern instead", is_flag=True)
    def cli(legacy):
        pass

    runner = CliRunner()
    with pytest.warns(ClickDeprecationWarning, match="Use --modern instead"):
        result = runner.invoke(cli, ["--legacy"])
        assert result.exit_code == 0

def test_deprecated_option_help_output():
    @click.command()
    @click.option("--legacy", deprecated="Use --modern instead", help="Legacy configuration.")
    def cli(legacy):
        pass

    runner = CliRunner()
    result = runner.invoke(cli, ["--help"])
    assert result.exit_code == 0
    assert "[Deprecated: Use --modern instead]" in result.output
""",
        "fail_to_pass": [
            "tests/test_feature.py::test_deprecated_option_warning",
            "tests/test_feature.py::test_deprecated_option_custom_message",
            "tests/test_feature.py::test_deprecated_option_help_output"
        ],
        "pass_to_pass": [
            "tests/test_options.py::test_custom_values",
            "tests/test_commands.py::test_command_execution"
        ]
    }
]
