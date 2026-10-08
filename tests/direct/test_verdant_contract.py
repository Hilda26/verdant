def test_verdant_deploys_and_starts_empty(direct_deploy):
    relay = direct_deploy("contracts/VerdantRelay.py")
    summary = relay.get_relay()
    assert summary["pledges_created"] == "0"
    assert summary["active_pledges"] == "0"
    assert summary["evidence_packets"] == "0"
    assert summary["total_staked"] == "0"
    assert relay.list_pledges("", 0, 50) == []
    assert relay.list_evidence("", 0, 50) == []


def test_unknown_pledge_read_reverts(direct_deploy, direct_vm):
    relay = direct_deploy("contracts/VerdantRelay.py")
    with direct_vm.expect_revert("Unknown pledge"):
      relay.get_pledge("missing")
