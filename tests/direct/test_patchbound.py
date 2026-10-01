import json
import pytest
from gltest.direct.loader import create_address

CONTRACT = "contracts/patchbound.py"
GEN = 10**18

def address_hex(address):
    return address.as_hex if hasattr(address, "as_hex") else "0x" + address.hex()

@pytest.fixture
def env(direct_vm, direct_deploy):
    direct_vm.warp("2030-01-01T00:00:00Z")
    requester, developer, outsider = create_address("requester"), create_address("developer"), create_address("outsider")
    c = direct_deploy(CONTRACT)
    direct_vm.sender = requester
    direct_vm.value = GEN
    aid = c.open_agreement(address_hex(developer), "acme/widget", 7, ["Parser rejects malformed configuration safely."], True, 1893628800, 1894665600)
    direct_vm.value = 0
    return c, requester, developer, outsider, aid

def test_funded_offer_and_roles(env):
    c, requester, developer, _, aid = env
    a = c.get_agreement(aid)
    assert a["status"] == "OFFERED"
    assert a["reward"] == str(GEN)
    assert a["requester"].lower() == address_hex(requester).lower()
    assert a["developer"].lower() == address_hex(developer).lower()

def test_only_designated_developer_accepts(direct_vm, env):
    c, _, developer, outsider, aid = env
    direct_vm.sender = outsider
    with direct_vm.expect_revert("Only the designated developer"):
        c.accept_terms(aid)
    direct_vm.sender = developer
    c.accept_terms(aid)
    assert c.get_agreement(aid)["status"] == "ACTIVE"

def test_requester_cannot_cancel_after_acceptance(direct_vm, env):
    c, requester, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    direct_vm.sender = requester
    with direct_vm.expect_revert("Accepted agreements cannot be cancelled"):
        c.cancel_offer(aid)

def test_cancel_before_acceptance_creates_refund_entitlement(direct_vm, env):
    c, requester, _, _, aid = env
    direct_vm.sender = requester
    c.cancel_offer(aid)
    assert c.get_agreement(aid)["status"] == "CANCELLED"
    assert c.get_claimable(address_hex(requester)) == str(GEN)

def test_duplicate_parties_rejected(direct_vm, direct_deploy):
    c = direct_deploy(CONTRACT)
    who = create_address("same")
    direct_vm.sender = who
    direct_vm.value = GEN
    with direct_vm.expect_revert("must differ"):
        c.open_agreement(address_hex(who), "acme/widget", 0, ["A bounded requirement exists."], False, 1893628800, 1894665600)

def test_bad_repo_and_clause_bounds(direct_vm, direct_deploy):
    c = direct_deploy(CONTRACT)
    a, b = create_address("a"), create_address("b")
    direct_vm.sender = a
    direct_vm.value = GEN
    with direct_vm.expect_revert("owner/name"):
        c.open_agreement(address_hex(b), "https://github.com/acme/widget", 0, ["A bounded requirement exists."], False, 1893628800, 1894665600)

def mock_pr(vm, marker, sha="abc123abc123abc123abc123abc123abc123abcd"):
    vm.mock_web(r"api\.github\.com/repos/acme/widget/pulls/9$", {"status": 200, "body": json.dumps({"body": marker, "head":{"sha":sha}, "base":{"repo":{"full_name":"acme/widget"}}})})
    vm.mock_web(r"api\.github\.com/repos/acme/widget/pulls/9/files", {"status": 200, "body": json.dumps([{"filename":"src/parser.ts","status":"modified","patch":"+if (!config) throw new Error('invalid')"}])})
    vm.mock_web(r"api\.github\.com/repos/acme/widget/commits/.*/status", {"status": 200, "body": json.dumps({"state":"success"})})

def test_satisfied_delivery_becomes_payable(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    marker = f"PATCHBOUND / agreement {aid} / developer {address_hex(developer)}"
    mock_pr(direct_vm, marker)
    direct_vm.mock_llm(r"independently adjudicating", json.dumps({"outcome":"SATISFIED","explanation":"The patch adds the required malformed-config rejection."}))
    out = c.evaluate_delivery(aid, 9)
    assert out["outcome"] == "SATISFIED"
    assert direct_vm.run_validator() is True
    assert c.get_agreement(aid)["status"] == "PAYABLE"

def test_missing_marker_is_not_satisfied(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    mock_pr(direct_vm, "unrelated")
    out = c.evaluate_delivery(aid, 9)
    assert out["outcome"] == "NOT_SATISFIED"
    assert c.get_agreement(aid)["status"] == "ACTIVE"

def test_unavailable_evidence_is_inconclusive(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    direct_vm.mock_web(r"api\.github\.com/repos/acme/widget/pulls/9$", {"status": 503, "body": ""})
    out = c.evaluate_delivery(aid, 9)
    assert out["outcome"] == "INCONCLUSIVE"
    assert c.get_agreement(aid)["status"] == "ACTIVE"

def test_exact_sha_replay_rejected(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    marker = f"PATCHBOUND / agreement {aid} / developer {address_hex(developer)}"
    mock_pr(direct_vm, marker)
    direct_vm.mock_llm(r"independently adjudicating", json.dumps({"outcome":"NOT_SATISFIED","explanation":"Requirement remains unmet."}))
    c.evaluate_delivery(aid, 9)
    with direct_vm.expect_revert("already evaluated"):
        c.evaluate_delivery(aid, 9)
