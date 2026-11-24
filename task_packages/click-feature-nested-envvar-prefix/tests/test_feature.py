import click
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
