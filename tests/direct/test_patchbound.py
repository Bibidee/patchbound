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

def mock_pr(vm, marker, sha="abc123abc123abc123abc123abc123abc123abcd", ci_state="success", files=None):
    vm.mock_web(r"api\.github\.com/repos/acme/widget/pulls/9$", {"status": 200, "body": json.dumps({"body": marker, "head":{"sha":sha}, "base":{"repo":{"full_name":"acme/widget"}}})})
    vm.mock_web(r"api\.github\.com/repos/acme/widget/pulls/9/files", {"status": 200, "body": json.dumps(files if files is not None else [{"filename":"src/parser.ts","status":"modified","patch":"+if (!config) throw new Error('invalid')"}])})
    vm.mock_web(r"api\.github\.com/repos/acme/widget/commits/.*/status", {"status": 200, "body": json.dumps({"state":ci_state})})

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

def test_claim_requires_agreement_entitlement_and_confirmation(direct_vm, env):
    c, requester, _, _, aid = env
    direct_vm.sender = requester
    c.cancel_offer(aid)
    assert c.get_agreement(aid)["settlement_state"] == "REFUNDABLE"
    c.claim_funds(aid)
    pending = c.get_agreement(aid)
    assert pending["settlement_state"] == "REFUND_PENDING"
    assert pending["refund_claimed"] is False
    assert c.get_claimable(address_hex(requester)) == str(GEN)
    c.confirm_transfer(aid)
    settled = c.get_agreement(aid)
    assert settled["settlement_state"] == "REFUNDED"
    assert settled["refund_claimed"] is True
    assert c.get_claimable(address_hex(requester)) == "0"
    with direct_vm.expect_revert("No funds"):
        c.claim_funds(aid)

def test_satisfied_claim_is_pending_until_recipient_confirmation(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    marker = f"PATCHBOUND / agreement {aid} / developer {address_hex(developer)}"
    mock_pr(direct_vm, marker)
    direct_vm.mock_llm(r"independently adjudicating", json.dumps({"outcome":"SATISFIED","explanation":"Bound requirements are met."}))
    c.evaluate_delivery(aid, 9)
    c.claim_funds(aid)
    assert c.get_agreement(aid)["status"] == "PAYABLE"
    assert c.get_agreement(aid)["settlement_state"] == "PAYOUT_PENDING"
    assert c.get_claimable(address_hex(developer)) == str(GEN)
    c.confirm_transfer(aid)
    assert c.get_agreement(aid)["status"] == "PAID"
    assert c.get_agreement(aid)["settlement_state"] == "PAID"
    assert c.get_claimable(address_hex(developer)) == "0"

def test_claim_cannot_cross_agreement_entitlement(direct_vm, direct_deploy):
    c = direct_deploy(CONTRACT)
    requester, developer = create_address("requester-a"), create_address("developer-a")
    direct_vm.sender = requester
    direct_vm.value = GEN
    first = c.open_agreement(address_hex(developer), "acme/widget", 1, ["The first agreement has a bounded requirement."], False, 1893628800, 1894665600)
    direct_vm.value = GEN
    second = c.open_agreement(address_hex(developer), "acme/widget", 2, ["The second agreement has a bounded requirement."], False, 1893628800, 1894665600)
    direct_vm.value = 0
    c.cancel_offer(first)
    direct_vm.sender = developer
    with direct_vm.expect_revert("No funds"):
        c.claim_funds(second)
    direct_vm.sender = requester
    c.claim_funds(first)
    assert c.get_agreement(first)["settlement_state"] == "REFUND_PENDING"

def test_malicious_leader_outcome_sha_ci_and_digest_are_rejected(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    marker = f"PATCHBOUND / agreement {aid} / developer {address_hex(developer)}"
    mock_pr(direct_vm, marker)
    direct_vm.mock_llm(r"independently adjudicating", json.dumps({"outcome":"NOT_SATISFIED","explanation":"The required behavior is absent."}))
    result = c.evaluate_delivery(aid, 9)
    assert direct_vm.run_validator(leader_result={**result, "outcome":"SATISFIED"}) is False
    assert direct_vm.run_validator(leader_result={**result, "sha":"f" * 40}) is False
    assert direct_vm.run_validator(leader_result={**result, "ci_state":"FAILURE"}) is False
    assert direct_vm.run_validator(leader_result={**result, "evidence_digest":"0" * 64}) is False
    assert direct_vm.run_validator(leader_result={**result, "explanation":"A different non-critical explanation."}) is True

def test_missing_and_invalid_llm_outcomes_are_safe(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    marker = f"PATCHBOUND / agreement {aid} / developer {address_hex(developer)}"
    mock_pr(direct_vm, marker)
    direct_vm.mock_llm(r"independently adjudicating", json.dumps({"outcome":"MADE_UP","explanation":"Invalid label."}))
    result = c.evaluate_delivery(aid, 9)
    assert result["outcome"] == "INCONCLUSIVE"
    assert c.get_agreement(aid)["status"] == "ACTIVE"

def test_pr_head_change_during_evidence_collection_is_inconclusive(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    marker = f"PATCHBOUND / agreement {aid} / developer {address_hex(developer)}"
    calls = {"pr": 0}

    def live_web(request):
        url = request["url"]
        if url.endswith("/pulls/9"):
            calls["pr"] += 1
            sha = "a" * 40 if calls["pr"] == 1 else "b" * 40
            body = {"body": marker, "head":{"sha":sha}, "base":{"repo":{"full_name":"acme/widget"},"sha":"c" * 40}}
        elif "/pulls/9/files" in url:
            body = [{"filename":"src/parser.ts","status":"modified","patch":"+safe validation"}]
        else:
            body = {"state":"success"}
        return {"ok":{"response":{"status":200,"headers":{},"body":json.dumps(body).encode("utf-8")}}}

    direct_vm._live_web_handler = live_web
    out = c.evaluate_delivery(aid, 9)
    assert out["outcome"] == "INCONCLUSIVE"
    assert "PR_HEAD_CHANGED_DURING_EVALUATION" in out["explanation"]
    assert out["evidence_digest"]

def test_creation_rejects_zero_reward_empty_or_oversized_terms_and_bad_deadlines(direct_vm, direct_deploy):
    c = direct_deploy(CONTRACT)
    requester, developer = create_address("creation-requester"), create_address("creation-developer")
    direct_vm.sender = requester
    direct_vm.value = 0
    with direct_vm.expect_revert("Attach a GEN reward"):
        c.open_agreement(address_hex(developer), "acme/widget", 0, ["A bounded requirement exists."], False, 1893628800, 1894665600)
    direct_vm.value = GEN
    with direct_vm.expect_revert("1 to 5"):
        c.open_agreement(address_hex(developer), "acme/widget", 0, [], False, 1893628800, 1894665600)
    with direct_vm.expect_revert("8 to 420"):
        c.open_agreement(address_hex(developer), "acme/widget", 0, ["short"], False, 1893628800, 1894665600)
    with direct_vm.expect_revert("1 to 5"):
        c.open_agreement(address_hex(developer), "acme/widget", 0, ["A bounded requirement exists."] * 6, False, 1893628800, 1894665600)
    with direct_vm.expect_revert("future"):
        c.open_agreement(address_hex(developer), "acme/widget", 0, ["A bounded requirement exists."], False, 1, 1894665600)
    with direct_vm.expect_revert("follow offer"):
        c.open_agreement(address_hex(developer), "acme/widget", 0, ["A bounded requirement exists."], False, 1893628800, 1893628800)

def test_acceptance_is_single_use_and_expires_at_offer_deadline(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.warp("2040-01-04T00:00:00Z")
    direct_vm.sender = developer
    with direct_vm.expect_revert("Offer deadline has passed"):
        c.accept_terms(aid)
    direct_vm.warp("2030-01-01T00:00:00Z")
    c.accept_terms(aid)
    with direct_vm.expect_revert("not awaiting acceptance"):
        c.accept_terms(aid)

def test_only_requester_can_cancel_and_expiry_is_permissionless_refundable(direct_vm, env):
    c, requester, _, outsider, aid = env
    direct_vm.sender = outsider
    with direct_vm.expect_revert("Only the requester"):
        c.cancel_offer(aid)
    direct_vm.warp("2040-01-04T00:00:00Z")
    c.close_expired(aid)
    expired = c.get_agreement(aid)
    assert expired["status"] == "EXPIRED"
    assert expired["settlement_state"] == "REFUNDABLE"
    direct_vm.sender = requester
    c.claim_funds(aid)
    assert c.get_agreement(aid)["settlement_state"] == "REFUND_PENDING"

def test_active_agreement_expires_only_after_delivery_deadline(direct_vm, env):
    c, requester, developer, outsider, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    direct_vm.sender = outsider
    with direct_vm.expect_revert("Deadline has not passed"):
        c.close_expired(aid)
    direct_vm.warp("2040-02-01T00:00:00Z")
    c.close_expired(aid)
    assert c.get_agreement(aid)["status"] == "EXPIRED"
    direct_vm.sender = developer
    with direct_vm.expect_revert("No funds"):
        c.claim_funds(aid)
    direct_vm.sender = requester
    c.claim_funds(aid)
    assert c.get_agreement(aid)["settlement_state"] == "REFUND_PENDING"

def test_evaluation_role_positive_pr_and_delivery_deadline_are_enforced(direct_vm, env):
    c, _, developer, outsider, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    direct_vm.sender = outsider
    with direct_vm.expect_revert("Only the designated developer"):
        c.evaluate_delivery(aid, 9)
    direct_vm.sender = developer
    with direct_vm.expect_revert("positive"):
        c.evaluate_delivery(aid, 0)
    direct_vm.warp("2040-02-01T00:00:00Z")
    with direct_vm.expect_revert("Delivery deadline has passed"):
        c.evaluate_delivery(aid, 9)

def test_required_ci_pending_cannot_be_satisfied(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    marker = f"PATCHBOUND / agreement {aid} / developer {address_hex(developer)}"
    mock_pr(direct_vm, marker, sha="1" * 40, ci_state="pending")
    pending = c.evaluate_delivery(aid, 9)
    assert pending["outcome"] == "INCONCLUSIVE"
    assert pending["ci_state"] == "PENDING"

def test_oversized_diff_is_inconclusive(direct_vm, env):
    c, _, developer, _, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    marker = f"PATCHBOUND / agreement {aid} / developer {address_hex(developer)}"
    mock_pr(direct_vm, marker, files=[{"filename":f"file-{i}.ts","status":"modified","patch":"+line"} for i in range(21)])
    out = c.evaluate_delivery(aid, 9)
    assert out["outcome"] == "INCONCLUSIVE"
    assert "PATCH_TOO_LARGE" in out["explanation"]

def test_pending_transfer_retry_and_confirmation_are_recipient_only(direct_vm, env):
    c, _, developer, outsider, aid = env
    direct_vm.sender = developer
    c.accept_terms(aid)
    marker = f"PATCHBOUND / agreement {aid} / developer {address_hex(developer)}"
    mock_pr(direct_vm, marker)
    direct_vm.mock_llm(r"independently adjudicating", json.dumps({"outcome":"SATISFIED","explanation":"Bound requirements are met."}))
    c.evaluate_delivery(aid, 9)
    c.claim_funds(aid)
    direct_vm.sender = outsider
    with direct_vm.expect_revert("Only an agreement participant"):
        c.retry_pending_transfer(aid)
    with direct_vm.expect_revert("confirmed by this wallet"):
        c.confirm_transfer(aid)
    direct_vm.sender = developer
    c.retry_pending_transfer(aid)
    c.confirm_transfer(aid)
    with direct_vm.expect_revert("No pending transfer"):
        c.confirm_transfer(aid)

def test_two_refunds_keep_agreement_entitlements_separate(direct_vm, direct_deploy):
    c = direct_deploy(CONTRACT)
    requester, developer = create_address("two-refund-requester"), create_address("two-refund-developer")
    direct_vm.sender = requester
    direct_vm.value = GEN
    first = c.open_agreement(address_hex(developer), "acme/widget", 1, ["The first agreement has a bounded requirement."], False, 1893628800, 1894665600)
    direct_vm.value = GEN
    second = c.open_agreement(address_hex(developer), "acme/widget", 2, ["The second agreement has a bounded requirement."], False, 1893628800, 1894665600)
    c.cancel_offer(first)
    c.cancel_offer(second)
    c.claim_funds(first)
    c.claim_funds(second)
    assert c.get_claimable(address_hex(requester)) == str(2 * GEN)
    c.confirm_transfer(first)
    assert c.get_claimable(address_hex(requester)) == str(GEN)
    c.confirm_transfer(second)
    assert c.get_claimable(address_hex(requester)) == "0"
