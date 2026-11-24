# Feature Request: First-Class Parameter Deprecation Lifecycle

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
