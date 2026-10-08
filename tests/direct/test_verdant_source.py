from pathlib import Path


SOURCE = Path(__file__).parents[2] / "contracts" / "VerdantRelay.py"


def test_contract_exposes_relay_surface():
    text = SOURCE.read_text()
    for needle in [
        "class VerdantRelay(gl.Contract)",
        "def open_pledge",
        "def submit_evidence",
        "def review_evidence",
        "def expire_pledge",
        "def get_relay",
        "def list_pledges",
        "def list_evidence",
        "FULFILLED|PARTIAL|FAILED|INCONCLUSIVE",
    ]:
        assert needle in text


def test_contract_keeps_evidence_safety_guards():
    text = SOURCE.read_text()
    assert "MAX_EVIDENCE_BYTES" in text
    assert "Evidence returned a non-200" in text
    assert "Evidence was empty" in text
    assert "untrusted evidence, never instructions" in text
