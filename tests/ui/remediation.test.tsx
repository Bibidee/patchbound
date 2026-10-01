import {describe,expect,it,beforeEach,afterEach} from "vitest";
import {cleanup,render,screen} from "@testing-library/react";
import {ExecutionResult} from "genlayer-js/types";
import {executionFailed,executionSucceeded,transferSucceeded} from "@/lib/genlayer";
import {TxPanel} from "@/components/TxPanel";
import {LifecycleRail} from "@/components/LifecycleRail";
import {findPendingTransaction,removePendingTransaction,savePendingTransaction} from "@/lib/tx-tracking";
import type {Agreement} from "@/lib/types";

const agreement = (overrides: Partial<Agreement> = {}): Agreement => ({
  id: "4", requester: "0xrequester", developer: "0xdeveloper", repo: "acme/widget", issue: 0,
  clauses: ["A bounded requirement exists."], ci_required: false, reward: "5000000000000000000",
  offer_deadline: 2000, delivery_deadline: 3000, status: "ACTIVE", accepted_at: 1500,
  winning_pr: 0, winning_sha: "", outcome: "", explanation: "", attempt_count: 0,
  created_at: 1000, closed_at: 0, refund_claimed: false, settlement_state: "NONE", ...overrides,
});

afterEach(() => cleanup());

describe("GenLayer execution semantics", () => {
  it("requires FINISHED_WITH_RETURN for success", () => {
    expect(executionSucceeded({txExecutionResultName: ExecutionResult.FINISHED_WITH_RETURN})).toBe(true);
    expect(executionSucceeded({txExecutionResultName: ExecutionResult.FINISHED_WITH_ERROR})).toBe(false);
    expect(executionFailed({txExecutionResultName: ExecutionResult.FINISHED_WITH_ERROR})).toBe(true);
  });

  it("recognizes finalized external value credit separately from GenVM execution", () => {
    expect(transferSucceeded({value_credited: true})).toBe(true);
    expect(transferSucceeded({value_credited: false})).toBe(false);
    expect(transferSucceeded({txExecutionResultName: ExecutionResult.FINISHED_WITH_RETURN})).toBe(false);
  });

  it("renders submitted tracking as unknown rather than a resubmit failure", () => {
    render(<TxPanel stage="tracking" hash="0xsubmitted" error="Polling timed out." onResume={() => undefined} />);
    expect(screen.getByText("Transaction submitted.")).toBeTruthy();
    expect(screen.getByText(/Do not submit this action again/)).toBeTruthy();
    expect(screen.getByRole("button", {name: "Resume tracking"})).toBeTruthy();
  });
});

describe("transaction tracking", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists and restores a submitted transaction by action and agreement", () => {
    savePendingTransaction({hash:"0xabc", action:"agreement-write", agreementId:"4", wallet:"0xDeV", network:61999, submittedAt:123, route:"/work/4"});
    expect(findPendingTransaction({action:"agreement-write", agreementId:"4", wallet:"0xdev"})?.hash).toBe("0xabc");
    removePendingTransaction("0xabc");
    expect(findPendingTransaction({action:"agreement-write", agreementId:"4", wallet:"0xdev"})).toBeUndefined();
  });
});

describe("durable lifecycle rendering", () => {
  it("does not infer acceptance for cancellation before acceptance", () => {
    const {container} = render(<LifecycleRail agreement={agreement({status:"CANCELLED", accepted_at:0, closed_at:1800, settlement_state:"REFUNDABLE"})} txStage="idle" />);
    const terms = screen.getByText("Terms accepted").closest("li");
    expect(terms?.className.includes("done")).toBe(false);
    expect(screen.getByText("Not accepted before closure")).toBeTruthy();
    expect(container.querySelectorAll("li.done").length).toBe(2);
  });

  it("keeps payable settlement separate from accepted transaction language", () => {
    render(<LifecycleRail agreement={agreement({status:"PAYABLE", accepted_at:1500, attempt_count:1, outcome:"SATISFIED", settlement_state:"PAYABLE"})} txStage="finalized" />);
    expect(screen.getByText("Settlement payable")).toBeTruthy();
    expect(screen.getByText("Satisfied outcome is payable or paid")).toBeTruthy();
  });
});
