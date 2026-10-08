import json


SOURCE_URL = "https://evidence.example.com/plan.txt"
EVIDENCE_URL = "https://evidence.example.com/receipt.txt"
TITLE = "Compostable packaging for weekend market"
CATEGORY = "Waste diversion"
REGION = "Lagos, Nigeria"
METRIC = "Use compostable packaging for at least 500 public meal servings and submit receipt plus vendor evidence."
SUMMARY = (
    "Receipts, vendor confirmations, and event notes show compostable packaging was used for "
    "the public market meal service during the pledge window."
)
BENEFICIARY = "0x1111111111111111111111111111111111111111"


def _json(**fields):
    return json.dumps(fields)


def _open_pledge(direct_deploy, direct_vm, pledge_id="pledge-one"):
    direct_vm.warp("2026-01-01T00:00:00Z")
    direct_vm.mock_web("plan\\.txt", {"status": 200, "body": "public sustainability plan for compostable packaging"})
    relay = direct_deploy("contracts/VerdantRelay.py")
    direct_vm.value = 5
    relay.open_pledge(
        pledge_id,
        TITLE,
        CATEGORY,
        REGION,
        METRIC,
        500,
        "2026-12-31T23:59:59Z",
        SOURCE_URL,
        BENEFICIARY,
    )
    direct_vm.value = 0
    pledge = relay.get_pledge(pledge_id)
    assert pledge["status"] == "ACTIVE"
    assert relay.get_relay()["active_pledges"] == "1"
    return relay


def _submit_evidence(relay, direct_vm, pledge_id="pledge-one", evidence_id="evidence-one", claimed=500):
    direct_vm.mock_web("receipt\\.txt", {"status": 200, "body": "receipt and vendor proof for compostable serviceware"})
    direct_vm.value = 1
    relay.submit_evidence(evidence_id, pledge_id, EVIDENCE_URL, SUMMARY, claimed)
    direct_vm.value = 0


def test_fulfilled_review_returns_stake_and_records_units(direct_deploy, direct_vm):
    relay = _open_pledge(direct_deploy, direct_vm)
    _submit_evidence(relay, direct_vm)
    direct_vm.mock_llm("reviewing a Verdant Relay", _json(verdict="FULFILLED", score=96, rationale="Evidence supports the full target."))
    relay.review_evidence("evidence-one")
    pledge = relay.get_pledge("pledge-one")
    packet = relay.get_evidence("evidence-one")
    summary = relay.get_relay()
    assert pledge["status"] == "FULFILLED"
    assert pledge["verified_units"] == "500"
    assert packet["status"] == "FULFILLED"
    assert summary["fulfilled_pledges"] == "1"
    assert summary["impact_units_verified"] == "500"


def test_partial_review_splits_accountability(direct_deploy, direct_vm):
    relay = _open_pledge(direct_deploy, direct_vm, "pledge-two")
    _submit_evidence(relay, direct_vm, "pledge-two", "evidence-two", 400)
    direct_vm.mock_llm("reviewing a Verdant Relay", _json(verdict="PARTIAL", score=50, rationale="Evidence supports half the claimed work."))
    relay.review_evidence("evidence-two")
    pledge = relay.get_pledge("pledge-two")
    packet = relay.get_evidence("evidence-two")
    assert pledge["status"] == "PARTIAL"
    assert pledge["verified_units"] == "200"
    assert packet["status"] == "PARTIAL"


def test_failed_review_redirects_stake(direct_deploy, direct_vm):
    relay = _open_pledge(direct_deploy, direct_vm, "pledge-three")
    _submit_evidence(relay, direct_vm, "pledge-three", "evidence-three", 500)
    direct_vm.mock_llm("reviewing a Verdant Relay", _json(verdict="FAILED", score=10, rationale="Evidence does not support the pledge."))
    relay.review_evidence("evidence-three")
    summary = relay.get_relay()
    assert relay.get_pledge("pledge-three")["status"] == "FAILED"
    assert relay.get_evidence("evidence-three")["status"] == "FAILED"
    assert summary["failed_pledges"] == "1"
    assert summary["stake_redirected"] == "5"


def test_inconclusive_review_returns_pledge_to_active(direct_deploy, direct_vm):
    relay = _open_pledge(direct_deploy, direct_vm, "pledge-four")
    _submit_evidence(relay, direct_vm, "pledge-four", "evidence-four", 500)
    direct_vm.mock_llm("reviewing a Verdant Relay", _json(verdict="INCONCLUSIVE", score=30, rationale="Evidence is ambiguous."))
    relay.review_evidence("evidence-four")
    assert relay.get_pledge("pledge-four")["status"] == "ACTIVE"
    assert relay.get_evidence("evidence-four")["status"] == "INCONCLUSIVE"
    assert relay.get_relay()["active_pledges"] == "1"
