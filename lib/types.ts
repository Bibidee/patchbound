export type AgreementStatus = "OFFERED"|"ACTIVE"|"PAYABLE"|"PAID"|"CANCELLED"|"EXPIRED";
export type AttemptOutcome = "SATISFIED"|"NOT_SATISFIED"|"INCONCLUSIVE";
export type Agreement = {id:string;requester:string;developer:string;repo:string;issue:number;clauses:string[];ci_required:boolean;reward:string;offer_deadline:number;delivery_deadline:number;status:AgreementStatus;accepted_at:number;winning_pr:number;winning_sha:string;outcome:string;explanation:string;attempt_count:number;created_at:number;closed_at:number};
export type Attempt = {pr:number;sha:string;outcome:AttemptOutcome;explanation:string;at:number;ci_state:string};
export type TxStage = "idle"|"wallet"|"submitted"|"accepted"|"finalized"|"failed";
