"""
Patch Generator & Verifier
Applies each of the 5 features in-tree to repos/click, verifies tests pass,
extracts clean unified diffs with git diff, and writes solution.patch.
"""

import os
import subprocess
from pathlib import Path

REPOS_DIR = Path("repos/click").resolve()
TASK_PACKAGES_DIR = Path("task_packages").resolve()

def clean_repo():
    subprocess.run(["git", "clean", "-fd"], cwd=str(REPOS_DIR), check=True, capture_output=True)
    subprocess.run(["git", "reset", "--hard", "934813e4d421071a1b3db3973c02fe2721359a6e"], cwd=str(REPOS_DIR), check=True, capture_output=True)

# -----------------------------------------------------------------------------
# TASK 1: Password Option Minimum Length & Custom Validator
# -----------------------------------------------------------------------------
def apply_task1():
    print("[1/5] Applying Task 1: Password min_length & validator...")
    clean_repo()

    # 1. src/click/termui.py
    termui_path = REPOS_DIR / "src/click/termui.py"
    t_content = termui_path.read_text(encoding="utf-8")
    t_content = t_content.replace(
        "    show_choices: bool = True,\n) -> t.Any:",
        "    show_choices: bool = True,\n    min_length: t.Optional[int] = None,\n    validator: t.Optional[t.Callable[[str], t.Any]] = None,\n) -> t.Any:"
    )
    t_content = t_content.replace(
        "        while True:\n            value = prompt_func(prompt)\n            if value:\n                break\n            elif default is not None:\n                value = default\n                break\n        try:",
        "        while True:\n            value = prompt_func(prompt)\n            if value:\n                break\n            elif default is not None:\n                value = default\n                break\n        if min_length is not None and len(value) < min_length:\n            echo(_(f\"Error: Password must be at least {min_length} characters long.\"), err=err)\n            continue\n        if validator is not None:\n            try:\n                validator(value)\n            except (UsageError, ValueError) as err_obj:\n                msg = getattr(err_obj, \"message\", None) or str(err_obj)\n                echo(_(f\"Error: {msg}\"), err=err)\n                continue\n            except Exception as err_obj:\n                echo(_(f\"Error: {err_obj}\"), err=err)\n                continue\n        try:"
    )
    termui_path.write_text(t_content, encoding="utf-8")

    # 2. src/click/decorators.py
    dec_path = REPOS_DIR / "src/click/decorators.py"
    d_content = dec_path.read_text(encoding="utf-8")
    d_content = d_content.replace(
        "def password_option(*param_decls: str, **kwargs: t.Any) -> t.Callable[[FC], FC]:",
        "def password_option(\n    *param_decls: str,\n    min_length: t.Optional[int] = None,\n    validator: t.Optional[t.Callable[[str], t.Any]] = None,\n    **kwargs: t.Any,\n) -> t.Callable[[FC], FC]:"
    )
    d_content = d_content.replace(
        "    kwargs.setdefault(\"hide_input\", True)\n    return option(*param_decls, **kwargs)",
        "    kwargs.setdefault(\"hide_input\", True)\n    if min_length is not None:\n        kwargs[\"min_length\"] = min_length\n    if validator is not None:\n        kwargs[\"validator\"] = validator\n    return option(*param_decls, **kwargs)"
    )
    dec_path.write_text(d_content, encoding="utf-8")

    # 3. src/click/core.py
    core_path = REPOS_DIR / "src/click/core.py"
    c_content = core_path.read_text(encoding="utf-8")
    c_content = c_content.replace(
        "        show_choices: bool = True,\n        show_envvar: bool = False,\n        **attrs: t.Any,\n    ) -> None:\n        if help:\n            help = inspect.cleandoc(help)\n\n        default_is_missing = \"default\" not in attrs\n        super().__init__(param_decls, type=type, multiple=multiple, **attrs)",
        "        show_choices: bool = True,\n        show_envvar: bool = False,\n        min_length: t.Optional[int] = None,\n        validator: t.Optional[t.Callable[[str], t.Any]] = None,\n        **attrs: t.Any,\n    ) -> None:\n        if help:\n            help = inspect.cleandoc(help)\n\n        default_is_missing = \"default\" not in attrs\n        super().__init__(param_decls, type=type, multiple=multiple, **attrs)\n\n        self.min_length = min_length\n        self.validator = validator"
    )
    c_content = c_content.replace(
        "            value_proc=lambda x: self.process_value(ctx, x),\n        )",
        "            value_proc=lambda x: self.process_value(ctx, x),\n            min_length=self.min_length,\n            validator=self.validator,\n        )\n\n    def process_value(self, ctx: Context, value: t.Any) -> t.Any:\n        value = super().process_value(ctx, value)\n        if value is not None and isinstance(value, str):\n            if self.min_length is not None and len(value) < self.min_length:\n                raise BadParameter(\n                    f\"Password must be at least {self.min_length} characters long.\", ctx, self\n                )\n            if self.validator is not None:\n                try:\n                    self.validator(value)\n                except Exception as e:\n                    msg = getattr(e, \"message\", None) or str(e)\n                    raise BadParameter(msg, ctx, self) from e\n        return value"
    )
    core_path.write_text(c_content, encoding="utf-8")

    save_patch_and_verify("click-feature-password-minlen-validator")

# -----------------------------------------------------------------------------
# TASK 2: First-Class Command Aliases
# -----------------------------------------------------------------------------
def apply_task2():
    print("[2/5] Applying Task 2: Command Aliases in Groups...")
    clean_repo()

    core_path = REPOS_DIR / "src/click/core.py"
    c_content = core_path.read_text(encoding="utf-8")

    # In Command.__init__:
    c_content = c_content.replace(
        "        short_help: t.Optional[str] = None,\n        options_metavar: t.Optional[str] = \"[OPTIONS]\",",
        "        short_help: t.Optional[str] = None,\n        aliases: t.Optional[t.List[str]] = None,\n        options_metavar: t.Optional[str] = \"[OPTIONS]\","
    )
    c_content = c_content.replace(
        "        self.help = help\n        self.epilog = epilog",
        "        self.help = help\n        self.aliases: t.List[str] = list(aliases) if aliases else []\n        self.epilog = epilog"
    )

    # In Group.__init__:
    c_content = c_content.replace(
        "        #: The registered subcommands by their exported names.\n        self.commands: t.MutableMapping[str, Command] = commands",
        "        #: The registered subcommands by their exported names.\n        self.commands: t.MutableMapping[str, Command] = commands\n        self._alias_mapping: t.Dict[str, str] = {}\n        for cmd_name, cmd in self.commands.items():\n            for a in getattr(cmd, \"aliases\", []):\n                self._alias_mapping[a] = cmd_name"
    )

    # In Group.add_command:
    c_content = c_content.replace(
        "    def add_command(self, cmd: Command, name: t.Optional[str] = None) -> None:\n        \"\"\"Registers another :class:`Command` with this group.  If the name\n        is not provided, the name of the command is used.\n        \"\"\"\n        name = name or cmd.name\n        if name is None:\n            raise TypeError(\"Command has no name.\")\n        _check_multicommand(self, name, cmd, register=True)\n        self.commands[name] = cmd",
        "    def add_command(self, cmd: Command, name: t.Optional[str] = None) -> None:\n        \"\"\"Registers another :class:`Command` with this group.  If the name\n        is not provided, the name of the command is used.\n        \"\"\"\n        name = name or cmd.name\n        if name is None:\n            raise TypeError(\"Command has no name.\")\n        if not hasattr(self, \"_alias_mapping\"):\n            self._alias_mapping = {}\n        if name in self._alias_mapping:\n            raise ValueError(f\"Command name '{name}' conflicts with an existing alias.\")\n        for a in getattr(cmd, \"aliases\", []):\n            if a in self.commands or a in self._alias_mapping:\n                raise ValueError(f\"Alias '{a}' conflicts with an existing command or alias.\")\n            self._alias_mapping[a] = name\n        _check_multicommand(self, name, cmd, register=True)\n        self.commands[name] = cmd"
    )

    # In Group.get_command:
    c_content = c_content.replace(
        "    def get_command(self, ctx: Context, cmd_name: str) -> t.Optional[Command]:\n        return self.commands.get(cmd_name)",
        "    def get_command(self, ctx: Context, cmd_name: str) -> t.Optional[Command]:\n        if cmd_name in self.commands:\n            return self.commands[cmd_name]\n        if hasattr(self, \"_alias_mapping\") and cmd_name in self._alias_mapping:\n            return self.commands.get(self._alias_mapping[cmd_name])\n        return None"
    )

    # In MultiCommand.format_commands:
    c_content = c_content.replace(
        "            rows = []\n            for subcommand, cmd in commands:\n                help = cmd.get_short_help_str(limit)\n                rows.append((subcommand, help))",
        "            rows = []\n            for subcommand, cmd in commands:\n                help = cmd.get_short_help_str(limit)\n                aliases = getattr(cmd, \"aliases\", [])\n                if aliases:\n                    display_name = f\"{subcommand} ({', '.join(aliases)})\"\n                else:\n                    display_name = subcommand\n                rows.append((display_name, help))"
    )

    core_path.write_text(c_content, encoding="utf-8")
    save_patch_and_verify("click-feature-command-aliases")

# -----------------------------------------------------------------------------
# TASK 3: Structured JSON Help Output
# -----------------------------------------------------------------------------
def apply_task3():
    print("[3/5] Applying Task 3: JSON Help Output...")
    clean_repo()

    core_path = REPOS_DIR / "src/click/core.py"
    c_content = core_path.read_text(encoding="utf-8")

    # Add json import
    c_content = c_content.replace(
        "import inspect",
        "import inspect\nimport json"
    )

    # Add help_format parameter to Context.__init__
    c_content = c_content.replace(
        "        color: t.Optional[bool] = None,\n        show_default: t.Optional[bool] = None,\n    ) -> None:",
        "        color: t.Optional[bool] = None,\n        show_default: t.Optional[bool] = None,\n        help_format: str = \"text\",\n        **extra: t.Any,\n    ) -> None:"
    )
    c_content = c_content.replace(
        "        #: Show option default values when formatting help text.\n        self.show_default: t.Optional[bool] = show_default",
        "        #: Show option default values when formatting help text.\n        self.show_default: t.Optional[bool] = show_default\n        self.help_format = help_format"
    )

    # Add to_help_dict and update get_help on Command
    c_content = c_content.replace(
        """    def get_help(self, ctx: Context) -> str:
        \"\"\"Formats the help into a string and returns it.

        Calls :meth:`format_help` internally.
        \"\"\"
        formatter = ctx.make_formatter()
        self.format_help(ctx, formatter)
        return formatter.getvalue().rstrip("\\n")""",
        """    def to_help_dict(self, ctx: Context) -> t.Dict[str, t.Any]:
        opts = []
        for param in self.get_params(ctx):
            if isinstance(param, Option):
                t_name = param.type.name.upper() if hasattr(param.type, "name") else "TEXT"
                opts.append({
                    "names": list(param.opts) + list(param.secondary_opts),
                    "type": t_name,
                    "required": bool(param.required),
                    "default": param.default,
                    "help": param.help or "",
                })
        data: t.Dict[str, t.Any] = {
            "name": self.name,
            "description": self.help or "",
            "usage": self.get_usage(ctx),
            "options": opts,
            "subcommands": []
        }
        if isinstance(self, MultiCommand):
            for sub_name in self.list_commands(ctx):
                sub_cmd = self.get_command(ctx, sub_name)
                if sub_cmd:
                    data["subcommands"].append({
                        "name": sub_name,
                        "help": sub_cmd.get_short_help_str()
                    })
        return data

    def get_help(self, ctx: Context) -> str:
        if getattr(ctx, "help_format", "text") == "json":
            return json.dumps(self.to_help_dict(ctx), indent=2)
        formatter = ctx.make_formatter()
        self.format_help(ctx, formatter)
        return formatter.getvalue().rstrip("\\n")"""
    )

    core_path.write_text(c_content, encoding="utf-8")
    save_patch_and_verify("click-feature-json-help-export")

# -----------------------------------------------------------------------------
# TASK 4: Hierarchical Nested Environment Variable Prefix
# -----------------------------------------------------------------------------
def apply_task4():
    print("[4/5] Applying Task 4: Nested Environment Variable Prefix...")
    clean_repo()

    core_path = REPOS_DIR / "src/click/core.py"
    c_content = core_path.read_text(encoding="utf-8")

    c_content = c_content.replace(
        "        color: t.Optional[bool] = None,\n        show_default: t.Optional[bool] = None,\n    ) -> None:",
        "        color: t.Optional[bool] = None,\n        show_default: t.Optional[bool] = None,\n        nested_auto_envvar: bool = False,\n        nested_envvar_delimiter: str = \"_\",\n        **extra: t.Any,\n    ) -> None:"
    )
    c_content = c_content.replace(
        """        # If there is no envvar prefix yet, but the parent has one and
        # the command on this level has a name, we can expand the envvar
        # prefix automatically.
        if auto_envvar_prefix is None:
            if (
                parent is not None
                and parent.auto_envvar_prefix is not None
                and self.info_name is not None
            ):
                auto_envvar_prefix = (
                    f"{parent.auto_envvar_prefix}_{self.info_name.upper()}"
                )
        else:
            auto_envvar_prefix = auto_envvar_prefix.upper()

        if auto_envvar_prefix is not None:
            auto_envvar_prefix = auto_envvar_prefix.replace("-", "_")

        self.auto_envvar_prefix: t.Optional[str] = auto_envvar_prefix""",
        """        if parent is not None:
            if not nested_auto_envvar:
                nested_auto_envvar = getattr(parent, "nested_auto_envvar", False)
            if nested_envvar_delimiter == "_":
                nested_envvar_delimiter = getattr(parent, "nested_envvar_delimiter", "_")

        self.nested_auto_envvar: bool = nested_auto_envvar
        self.nested_envvar_delimiter: str = nested_envvar_delimiter

        # If there is no envvar prefix yet, but the parent has one and
        # the command on this level has a name, we can expand the envvar
        # prefix automatically.
        if auto_envvar_prefix is None:
            if (
                parent is not None
                and parent.auto_envvar_prefix is not None
                and self.info_name is not None
            ):
                delim = self.nested_envvar_delimiter if self.nested_auto_envvar else "_"
                auto_envvar_prefix = (
                    f"{parent.auto_envvar_prefix}{delim}{self.info_name.upper()}"
                )
        else:
            auto_envvar_prefix = auto_envvar_prefix.upper()

        if auto_envvar_prefix is not None and not self.nested_auto_envvar:
            auto_envvar_prefix = auto_envvar_prefix.replace("-", "_")

        self.auto_envvar_prefix: t.Optional[str] = auto_envvar_prefix"""
    )

    core_path.write_text(c_content, encoding="utf-8")
    save_patch_and_verify("click-feature-nested-envvar-prefix")

# -----------------------------------------------------------------------------
# TASK 5: Parameter Deprecation Lifecycle & Warnings
# -----------------------------------------------------------------------------
def apply_task5():
    print("[5/5] Applying Task 5: Parameter Deprecation Lifecycle...")
    clean_repo()

    # 1. src/click/exceptions.py
    exc_path = REPOS_DIR / "src/click/exceptions.py"
    e_content = exc_path.read_text(encoding="utf-8")
    e_content += """

class ClickDeprecationWarning(DeprecationWarning):
    \"\"\"Warning emitted when a deprecated Click parameter or feature is used.\"\"\"
    pass
"""
    exc_path.write_text(e_content, encoding="utf-8")

    # 2. src/click/__init__.py
    init_path = REPOS_DIR / "src/click/__init__.py"
    i_content = init_path.read_text(encoding="utf-8")
    i_content = i_content.replace(
        "from .exceptions import BadParameter as BadParameter",
        "from .exceptions import BadParameter as BadParameter\nfrom .exceptions import ClickDeprecationWarning as ClickDeprecationWarning"
    )
    init_path.write_text(i_content, encoding="utf-8")

    # 3. src/click/core.py
    core_path = REPOS_DIR / "src/click/core.py"
    c_content = core_path.read_text(encoding="utf-8")
    c_content = c_content.replace(
        "import typing as t\nfrom collections import abc",
        "import typing as t\nimport warnings\nfrom collections import abc"
    )
    c_content = c_content.replace(
        "from .exceptions import Exit\nfrom .exceptions import MissingParameter",
        "from .exceptions import Exit\nfrom .exceptions import ClickDeprecationWarning\nfrom .exceptions import MissingParameter"
    )
    c_content = c_content.replace(
        """        shell_complete: t.Optional[
            t.Callable[
                [Context, "Parameter", str],
                t.Union[t.List["CompletionItem"], t.List[str]],
            ]
        ] = None,
    ) -> None:""",
        """        shell_complete: t.Optional[
            t.Callable[
                [Context, "Parameter", str],
                t.Union[t.List["CompletionItem"], t.List[str]],
            ]
        ] = None,
        deprecated: t.Union[bool, str] = False,
    ) -> None:"""
    )
    c_content = c_content.replace(
        "        self.type: types.ParamType = types.convert_type(type, default)",
        "        self.type: types.ParamType = types.convert_type(type, default)\n        self.deprecated = deprecated"
    )
    c_content = c_content.replace(
        """        with augment_usage_errors(ctx, param=self):
            value, source = self.consume_value(ctx, opts)
            ctx.set_parameter_source(self.name, source)  # type: ignore

            try:""",
        """        with augment_usage_errors(ctx, param=self):
            value, source = self.consume_value(ctx, opts)
            ctx.set_parameter_source(self.name, source)  # type: ignore

            if getattr(self, "deprecated", False) and self.name in opts:
                if isinstance(self.deprecated, str):
                    msg = f"Option '{self.name}' is deprecated: {self.deprecated}"
                else:
                    msg = f"Option '{self.name}' is deprecated and will be removed in a future release."
                warnings.warn(msg, ClickDeprecationWarning, stacklevel=2)

            try:"""
    )
    c_content = c_content.replace(
        "        help = self.help or \"\"\n        extra = []",
        """        help = self.help or ""
        extra = []
        if getattr(self, "deprecated", False):
            if isinstance(self.deprecated, str):
                extra.append(f"Deprecated: {self.deprecated}")
            else:
                extra.append("Deprecated")"""
    )

    core_path.write_text(c_content, encoding="utf-8")
    save_patch_and_verify("click-feature-parameter-deprecation")

def save_patch_and_verify(task_name: str):
    # Test with pytest
    env = os.environ.copy()
    env["PYTHONPATH"] = str(REPOS_DIR / "src")
    test_src = TASK_PACKAGES_DIR / task_name / "tests" / "test_feature.py"
    test_dst = REPOS_DIR / "tests" / "test_feature.py"
    test_dst.write_text(test_src.read_text(encoding="utf-8"), encoding="utf-8")

    test_proc = subprocess.run(
        ["uv", "run", "pytest", "tests/test_feature.py", "-q"],
        cwd=str(REPOS_DIR),
        env=env,
        capture_output=True,
        text=True
    )
    if test_proc.returncode != 0:
        print(f"FAILED tests for {task_name}:")
        print(test_proc.stdout)
        print(test_proc.stderr)
        raise RuntimeError(f"Tests failed for {task_name}")

    print(f"  -> Verified test_feature.py PASSED (100% success)")
    test_dst.unlink()

    # Extract diff
    diff_proc = subprocess.run(
        ["git", "diff", "src/"],
        cwd=str(REPOS_DIR),
        capture_output=True,
        text=True
    )
    patch_text = diff_proc.stdout
    if not patch_text.strip():
        raise RuntimeError(f"Empty patch for {task_name}")

    out_patch = TASK_PACKAGES_DIR / task_name / "solution" / "solution.patch"
    out_patch.write_text(patch_text, encoding="utf-8")
    print(f"  -> Extracted unified git diff: {len(patch_text.splitlines())} lines written to {out_patch}")

    # Check git apply --check
    clean_repo()
    check_proc = subprocess.run(
        ["git", "apply", "--check", str(out_patch.resolve())],
        cwd=str(REPOS_DIR),
        capture_output=True,
        text=True
    )
    if check_proc.returncode != 0:
        print(f"git apply check failed for {task_name}: {check_proc.stderr}")
        raise RuntimeError(f"git apply check failed for {task_name}")

    print(f"  -> Verified 'git apply --check' PASSED with 0 errors!")

def main():
    apply_task1()
    apply_task2()
    apply_task3()
    apply_task4()
    apply_task5()
    clean_repo()
    print("\nALL 5 TASK PATCHES SUCCESSFULLY GENERATED AND VERIFIED!")

if __name__ == "__main__":
    main()
