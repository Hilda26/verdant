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


def _open_pledge(direct_deploy, direct_vm, pledge_id="pledge-one", deadline="2026-12-31T23:59:59Z"):
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
        deadline,
        SOURCE_URL,
        BENEFICIARY,
    )
    direct_vm.value = 0
    pledge = relay.get_pledge(pledge_id)
    assert pledge["status"] == "ACTIVE"
    assert relay.get_relay()["active_pledges"] == "1"
    return relay


def _submit_evidence(relay, direct_vm, pledge_id="pledge-one", evidence_id="evidence-one", claimed=500, bond=1):
    direct_vm.mock_web("receipt\\.txt", {"status": 200, "body": "receipt and vendor proof for compostable serviceware"})
    direct_vm.value = bond
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
    assert packet["evidence_bond"] == "0"
    assert summary["fulfilled_pledges"] == "1"
    assert summary["total_evidence_bonded"] == "1"
    assert summary["evidence_bonds_paid"] == "1"
    assert summary["stake_returned"] == "5"
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
    assert packet["evidence_bond"] == "0"
    summary = relay.get_relay()
    assert summary["evidence_bonds_paid"] == "1"
    assert summary["stake_returned"] == "2"
    assert summary["stake_redirected"] == "3"


def test_failed_review_redirects_stake(direct_deploy, direct_vm):
    relay = _open_pledge(direct_deploy, direct_vm, "pledge-three")
    _submit_evidence(relay, direct_vm, "pledge-three", "evidence-three", 500)
    direct_vm.mock_llm("reviewing a Verdant Relay", _json(verdict="FAILED", score=10, rationale="Evidence does not support the pledge."))
    relay.review_evidence("evidence-three")
    summary = relay.get_relay()
    assert relay.get_pledge("pledge-three")["status"] == "FAILED"
    packet = relay.get_evidence("evidence-three")
    assert packet["status"] == "FAILED"
    assert packet["evidence_bond"] == "0"
    assert summary["failed_pledges"] == "1"
    assert summary["stake_redirected"] == "5"
    assert summary["evidence_bonds_paid"] == "1"


def test_inconclusive_review_returns_pledge_to_active(direct_deploy, direct_vm):
    relay = _open_pledge(direct_deploy, direct_vm, "pledge-four")
    _submit_evidence(relay, direct_vm, "pledge-four", "evidence-four", 500)
    direct_vm.mock_llm("reviewing a Verdant Relay", _json(verdict="INCONCLUSIVE", score=30, rationale="Evidence is ambiguous."))
    relay.review_evidence("evidence-four")
    packet = relay.get_evidence("evidence-four")
    summary = relay.get_relay()
    assert relay.get_pledge("pledge-four")["status"] == "ACTIVE"
    assert packet["status"] == "INCONCLUSIVE"
    assert packet["evidence_bond"] == "0"
    assert summary["active_pledges"] == "1"
    assert summary["evidence_bonds_paid"] == "1"


def test_unresolved_evidence_timeout_returns_to_active_without_locking_bond(direct_deploy, direct_vm):
    relay = _open_pledge(direct_deploy, direct_vm, "pledge-five")
    _submit_evidence(relay, direct_vm, "pledge-five", "evidence-five", 500, bond=2)
    direct_vm.warp("2026-01-09T00:00:00Z")
    relay.recover_unresolved_evidence("evidence-five")
    pledge = relay.get_pledge("pledge-five")
    packet = relay.get_evidence("evidence-five")
    summary = relay.get_relay()
    assert pledge["status"] == "ACTIVE"
    assert pledge["active_evidence_id"] == ""
    assert packet["status"] == "INCONCLUSIVE"
    assert packet["evidence_bond"] == "0"
    assert summary["active_pledges"] == "1"
    assert summary["total_evidence_bonded"] == "2"
    assert summary["evidence_bonds_paid"] == "2"


def test_expire_recovers_timed_out_evidence_and_redirects_stake_once(direct_deploy, direct_vm):
    relay = _open_pledge(direct_deploy, direct_vm, "pledge-six", "2026-01-05T00:00:00Z")
    _submit_evidence(relay, direct_vm, "pledge-six", "evidence-six", 500)
    direct_vm.warp("2026-01-09T00:00:00Z")
    relay.expire_pledge("pledge-six")
    pledge = relay.get_pledge("pledge-six")
    packet = relay.get_evidence("evidence-six")
    summary = relay.get_relay()
    assert pledge["status"] == "EXPIRED"
    assert pledge["stake"] == "0"
    assert packet["status"] == "INCONCLUSIVE"
    assert packet["evidence_bond"] == "0"
    assert summary["active_pledges"] == "0"
    assert summary["stake_redirected"] == "5"
    assert summary["evidence_bonds_paid"] == "1"


def test_inconclusive_after_deadline_expires_without_double_decrement(direct_deploy, direct_vm):
    relay = _open_pledge(direct_deploy, direct_vm, "pledge-seven", "2026-01-02T00:00:00Z")
    _submit_evidence(relay, direct_vm, "pledge-seven", "evidence-seven", 500)
    direct_vm.warp("2026-01-03T00:00:00Z")
    direct_vm.mock_llm("reviewing a Verdant Relay", _json(verdict="INCONCLUSIVE", score=30, rationale="Evidence remains ambiguous."))
    relay.review_evidence("evidence-seven")
    summary = relay.get_relay()
    assert relay.get_pledge("pledge-seven")["status"] == "EXPIRED"
    assert relay.get_evidence("evidence-seven")["evidence_bond"] == "0"
    assert summary["active_pledges"] == "0"
    assert summary["stake_redirected"] == "5"
    assert summary["evidence_bonds_paid"] == "1"


def test_review_equivalence_allows_minor_score_variance_but_preserves_boundaries(direct_deploy):
    relay = direct_deploy("contracts/VerdantRelay.py")
    assert relay._review_equivalent(("PARTIAL", 54), ("PARTIAL", 50)) is True
    assert relay._review_equivalent(("FULFILLED", 96), ("FULFILLED", 90)) is True
    assert relay._review_equivalent(("PARTIAL", 41), ("PARTIAL", 39)) is False
    assert relay._review_equivalent(("FULFILLED", 90), ("PARTIAL", 89)) is False
