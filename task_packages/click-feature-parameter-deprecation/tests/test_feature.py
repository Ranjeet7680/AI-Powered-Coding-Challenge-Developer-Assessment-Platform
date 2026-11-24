import click
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
