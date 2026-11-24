import click
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
    result = runner.invoke(cli, input="short\nvalid_pass\nvalid_pass\n")
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
    result = runner.invoke(cli, input="nodigits\npass123\npass123\n")
    assert result.exit_code == 0
    assert "Error: Must contain at least one digit" in result.output
    assert "Success" in result.output
