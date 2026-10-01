export type AgreementStatus = "OFFERED"|"ACTIVE"|"PAYABLE"|"CANCELLED"|"EXPIRED";
export type SettlementState = "NONE"|"REFUNDABLE"|"PAYABLE"|"PAYOUT_DISPATCHED"|"REFUND_DISPATCHED";
export type AttemptOutcome = "SATISFIED"|"NOT_SATISFIED"|"INCONCLUSIVE";
export type CiState = "NOT_REQUIRED"|"PENDING"|"FAILURE"|"SUCCESS";
export type Agreement = {id:string;requester:string;developer:string;repo:string;issue:number;clauses:string[];ci_required:boolean;reward:string;offer_deadline:number;delivery_deadline:number;status:AgreementStatus;accepted_at:number;winning_pr:number;winning_sha:string;outcome:string;explanation:string;attempt_count:number;created_at:number;closed_at:number;refund_dispatched:boolean;dispatched_amount:string;settlement_state:SettlementState};
export type Attempt = {pr:number;sha:string;base_sha:string;outcome:AttemptOutcome;explanation:string;at:number;ci_state:CiState;evidence_digest:string};
export type TxStage = "idle"|"wallet"|"submitted"|"accepted"|"finalized"|"tracking"|"unknown"|"failed";
