import json
import time
from pathlib import Path

import pytest
from gltest import get_accounts, get_contract_factory, get_gl_client, get_validator_factory
from gltest.assertions import tx_execution_succeeded
from gltest.types import TransactionStatus
from gltest.utils import extract_contract_address
from genlayer_py.exceptions import GenLayerError
from genlayer_py.provider.provider import GenLayerProvider


CONTRACTS = Path(__file__).parents[2] / "contracts"
WAIT_FINAL = {
    "wait_transaction_status": TransactionStatus.FINALIZED,
    "wait_interval": 5000,
    "wait_retries": 180,
}
WAIT_FINAL_WITH_TRANSFERS = {
    **WAIT_FINAL,
    "wait_triggered_transactions": True,
    "wait_triggered_transactions_status": TransactionStatus.FINALIZED,
}
SOURCE_BODY = "public environmental pledge plan with target units, steward commitment, beneficiary, and deadline"
EVIDENCE_BODY = "dated receipts, beneficiary notes, and public evidence records supporting the claimed impact"
PUBLIC_SOURCE_URL = "https://example.com/"
PUBLIC_EVIDENCE_URL = "https://www.iana.org/help/example-domains"


@pytest.fixture(autouse=True)
def _retry_transient_studionet_gateway_errors(monkeypatch):
    original = GenLayerProvider.make_request

    def make_request_with_retry(self, method, params):
        last_error = None
        for attempt in range(6):
            try:
                return original(self, method, params)
            except GenLayerError as error:
                last_error = error
                if "502" not in str(error) and "invalid JSON" not in str(error):
                    raise
                time.sleep(2 + attempt)
        raise last_error

    monkeypatch.setattr(GenLayerProvider, "make_request", make_request_with_retry)
SUMMARY = (
    "Public receipts, dated implementation notes, and beneficiary-visible records support the reported "
    "environmental work for this pledge during the committed window."
)


def _hash(receipt):
    return str(receipt.get("hash") or receipt.get("transaction_hash") or receipt.get("tx_hash") or receipt.get("tx_id") or "UNKNOWN")


def _record(label, receipt):
    print(f"VERDANT_E2E {label}={_hash(receipt)}")
    print(
        "VERDANT_E2E_RECEIPT "
        + json.dumps(
            {
                "label": label,
                "result_name": receipt.get("result_name"),
                "execution_result": receipt.get("execution_result"),
                "triggered_transactions": receipt.get("triggered_transactions", []),
            },
            default=str,
            sort_keys=True,
        )
    )


def _accounts():
    accounts = get_accounts()
    if len(accounts) < 3:
        pytest.skip("Verdant e2e requires three configured StudioNet wallets: steward, reporter, beneficiary.")
    return accounts[0], accounts[1], accounts[2]


def _context(verdict, score, source_url, evidence_url, now):
    validator_factory = get_validator_factory()
    llm_response = {
        "nondet_exec_prompt": {
            "reviewing a Verdant Relay": json.dumps(
                {
                    "verdict": verdict,
                    "score": score,
                    "rationale": f"Mocked StudioNet validator assessment for {verdict.lower()} evidence.",
                }
            )
        }
    }
    web_response = {
        "nondet_web_request": {
            source_url: {"method": "GET", "status": 200, "body": SOURCE_BODY},
            evidence_url: {"method": "GET", "status": 200, "body": EVIDENCE_BODY},
        }
    }
    validators = validator_factory.batch_create_mock_validators(
        5,
        mock_llm_response=llm_response,
        mock_web_response=web_response,
    )
    return {"validators": [validator.to_dict() for validator in validators], "genvm_datetime": now}


def _deploy(steward):
    factory = get_contract_factory(contract_file_path=CONTRACTS / "VerdantRelay.py")
    receipt = factory.deploy_contract_tx(args=[], account=steward, **WAIT_FINAL)
    assert tx_execution_succeeded(receipt), receipt
    _record("deploy", receipt)
    return factory.build_contract(contract_address=extract_contract_address(receipt), account=steward)


def _open(relay, steward, beneficiary, pledge_id, deadline, context):
    receipt = relay.connect(steward).open_pledge(
        args=[
            pledge_id,
            f"Verified environmental relay {pledge_id}",
            "Waste diversion",
            "Lagos, Nigeria",
            "Verify at least 500 public environmental impact units with public evidence and beneficiary visibility.",
            500,
            deadline,
            PUBLIC_SOURCE_URL,
            beneficiary.address,
        ]
    ).transact(value=5, transaction_context=context, **WAIT_FINAL)
    assert tx_execution_succeeded(receipt), receipt
    _record(f"{pledge_id}:open", receipt)


def _submit(relay, reporter, pledge_id, evidence_id, context):
    receipt = relay.connect(reporter).submit_evidence(
        args=[
            evidence_id,
            pledge_id,
            PUBLIC_EVIDENCE_URL,
            SUMMARY,
            500,
        ]
    ).transact(value=1, transaction_context=context, **WAIT_FINAL)
    assert tx_execution_succeeded(receipt), receipt
    _record(f"{pledge_id}:submit", receipt)


def _review(relay, steward, evidence_id, context):
    receipt = relay.connect(steward).review_evidence(args=[evidence_id]).transact(
        transaction_context=context,
        **WAIT_FINAL_WITH_TRANSFERS,
    )
    assert tx_execution_succeeded(receipt), receipt
    _record(f"{evidence_id}:review", receipt)
    return receipt


def _expire(relay, steward, pledge_id, context):
    receipt = relay.connect(steward).expire_pledge(args=[pledge_id]).transact(
        transaction_context=context,
        **WAIT_FINAL_WITH_TRANSFERS,
    )
    assert tx_execution_succeeded(receipt), receipt
    _record(f"{pledge_id}:expire", receipt)
    return receipt


def _recover(relay, steward, evidence_id, context):
    receipt = relay.connect(steward).recover_unresolved_evidence(args=[evidence_id]).transact(
        transaction_context=context,
        **WAIT_FINAL_WITH_TRANSFERS,
    )
    assert tx_execution_succeeded(receipt), receipt
    _record(f"{evidence_id}:recover", receipt)
    return receipt


def _balances(client, steward, reporter, beneficiary):
    return {
        "steward": int(client.get_balance(steward.address)),
        "reporter": int(client.get_balance(reporter.address)),
        "beneficiary": int(client.get_balance(beneficiary.address)),
    }


def _assert_delta(before, after, key, amount):
    assert after[key] >= before[key] + amount, (key, before, after)


def test_studionet_e2e_accounts_for_all_payout_lanes():
    steward, reporter, beneficiary = _accounts()
    client = get_gl_client()
    relay = _deploy(steward)

    scenarios = [
        ("fulfilled", "FULFILLED", 96, "FULFILLED", {"steward": 5, "reporter": 1}),
        ("partial", "PARTIAL", 50, "PARTIAL", {"steward": 2, "beneficiary": 3, "reporter": 1}),
        ("failed", "FAILED", 10, "FAILED", {"beneficiary": 5, "reporter": 1}),
        ("inconclusive", "INCONCLUSIVE", 30, "ACTIVE", {"reporter": 1}),
    ]

    for label, verdict, score, final_status, expected_transfers in scenarios:
        pledge_id = f"e2e-{label}"
        evidence_id = f"{pledge_id}-evidence"
        source_url = PUBLIC_SOURCE_URL
        evidence_url = PUBLIC_EVIDENCE_URL
        context = _context(verdict, score, source_url, evidence_url, "2026-01-01T00:00:00Z")
        _open(relay, steward, beneficiary, pledge_id, "2026-12-31T23:59:59Z", context)
        _submit(relay, reporter, pledge_id, evidence_id, context)
        before_review = _balances(client, steward, reporter, beneficiary)
        _review(relay, steward, evidence_id, context)
        after_review = _balances(client, steward, reporter, beneficiary)
        pledge = relay.get_pledge(args=[pledge_id]).call()
        packet = relay.get_evidence(args=[evidence_id]).call()
        assert pledge["status"] == final_status
        assert packet["evidence_bond"] == "0"
        for key, amount in expected_transfers.items():
            _assert_delta(before_review, after_review, key, amount)

    expired_context = _context(
        "INCONCLUSIVE",
        0,
        PUBLIC_SOURCE_URL,
        PUBLIC_EVIDENCE_URL,
        "2026-01-01T00:00:00Z",
    )
    _open(relay, steward, beneficiary, "e2e-expired", "2026-01-02T00:00:00Z", expired_context)
    before_expire = _balances(client, steward, reporter, beneficiary)
    _expire(
        relay,
        steward,
        "e2e-expired",
        {**expired_context, "genvm_datetime": "2026-01-03T00:00:00Z"},
    )
    after_expire = _balances(client, steward, reporter, beneficiary)
    assert relay.get_pledge(args=["e2e-expired"]).call()["status"] == "EXPIRED"
    _assert_delta(before_expire, after_expire, "beneficiary", 5)

    timeout_context = _context(
        "INCONCLUSIVE",
        0,
        PUBLIC_SOURCE_URL,
        PUBLIC_EVIDENCE_URL,
        "2026-01-01T00:00:00Z",
    )
    _open(relay, steward, beneficiary, "e2e-timeout", "2026-12-31T23:59:59Z", timeout_context)
    _submit(relay, reporter, "e2e-timeout", "e2e-timeout-evidence", timeout_context)
    before_recover = _balances(client, steward, reporter, beneficiary)
    _recover(
        relay,
        steward,
        "e2e-timeout-evidence",
        {**timeout_context, "genvm_datetime": "2026-01-09T00:00:00Z"},
    )
    after_recover = _balances(client, steward, reporter, beneficiary)
    assert relay.get_pledge(args=["e2e-timeout"]).call()["status"] == "ACTIVE"
    assert relay.get_evidence(args=["e2e-timeout-evidence"]).call()["status"] == "INCONCLUSIVE"
    _assert_delta(before_recover, after_recover, "reporter", 1)

    summary = relay.get_relay(args=[]).call()
    assert summary["total_staked"] == "30"
    assert summary["total_evidence_bonded"] == "5"
    assert summary["evidence_bonds_paid"] == "5"
    print("VERDANT_E2E_SUMMARY " + json.dumps(summary, sort_keys=True))
