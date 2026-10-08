import os
import re
from pathlib import Path

from gltest import get_contract_factory
from gltest.assertions import tx_execution_succeeded
from gltest.types import TransactionStatus
from gltest.utils import extract_contract_address
from gltest_cli.config.general import get_general_config
from gltest_cli.config.types import PluginConfig
from gltest_cli.config.user import load_user_config


ROOT = Path(__file__).parents[1]
ENV_LOCAL = ROOT / ".env.local"


def update_env(address: str) -> None:
    text = ENV_LOCAL.read_text() if ENV_LOCAL.exists() else ""
    line = f"NEXT_PUBLIC_VERDANT_RELAY_CONTRACT={address}"
    if "NEXT_PUBLIC_VERDANT_RELAY_CONTRACT=" in text:
        text = re.sub(r"NEXT_PUBLIC_VERDANT_RELAY_CONTRACT=.*", line, text)
    else:
        text = (text.rstrip() + "\n" + line + "\n").lstrip()
    ENV_LOCAL.write_text(text)


def configure_gltest() -> None:
    general = get_general_config()
    general.user_config = load_user_config(str(ROOT / "gltest.config.yaml"))
    general.plugin_config = PluginConfig()


def main() -> None:
    configure_gltest()
    if not os.environ.get("GLYPHWORK_DEPLOYER_PRIVATE_KEY"):
        print("warning: GLYPHWORK_DEPLOYER_PRIVATE_KEY is not set; gltest may use its default account")
    factory = get_contract_factory(contract_file_path="VerdantRelay.py")
    receipt = factory.deploy_contract_tx(
        args=[],
        wait_transaction_status=TransactionStatus.FINALIZED,
        wait_interval=5000,
        wait_retries=180,
    )
    if not tx_execution_succeeded(receipt):
        raise SystemExit(f"Verdant Relay deploy failed: {receipt}")
    address = extract_contract_address(receipt)
    update_env(address)
    print(f"VERDANT_RELAY_ADDRESS={address}")
    print(f"VERDANT_RELAY_DEPLOY_TX={receipt.get('hash') or receipt.get('transaction_hash') or receipt.get('tx_hash') or receipt.get('tx_id')}")


if __name__ == "__main__":
    main()
