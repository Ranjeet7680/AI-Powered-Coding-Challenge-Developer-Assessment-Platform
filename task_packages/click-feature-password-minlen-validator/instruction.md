# Feature Request: Password Option Minimum Length & Custom Validator

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
