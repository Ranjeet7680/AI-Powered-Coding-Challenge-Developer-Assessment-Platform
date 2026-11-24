import click
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
