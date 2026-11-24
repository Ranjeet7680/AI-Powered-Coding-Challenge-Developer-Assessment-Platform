import click
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
