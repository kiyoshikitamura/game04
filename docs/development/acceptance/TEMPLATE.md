# Database delivery acceptance — TASK-ID

## Delivery identity

- Task ID:
- Environment (non-secret name only):
- Source commit:
- Application deployment commit:
- Migration version and filename:
- Contract test filename:
- Executed by:
- Started at (UTC):
- Completed at (UTC):

## Expected authority

- Authority owner:
- Permitted actors and operations:
- Denied actors and operations:
- RLS expectation:
- Function security expectation:
- Direct table grant expectation:
- Transaction and idempotency expectation:

## Results

| Stage | Result | Secret-free evidence |
| --- | --- | --- |
| Offline repository contract | NOT RUN | Command and CI/job reference |
| Migration apply | NOT RUN | Environment, version, timestamp |
| Catalog contract | NOT RUN | Test filename and sanitized result |
| Behavioral replay | NOT RUN | Scenario IDs and sanitized result |
| Application deployment | NOT RUN | Deployment and commit reference |
| Final smoke check | NOT RUN | Route/scenario and result |

## Behavioral replay cases

| Case | Expected | Actual | Result |
| --- | --- | --- | --- |
| Permitted actor | | | NOT RUN |
| Denied actor | | | NOT RUN |
| First mutation | | | NOT RUN |
| Exact retry | Same canonical result; no duplicate effect | | NOT RUN |
| Conflicting retry | Rejected; no partial effect | | NOT RUN |
| Transaction failure | No partial write | | NOT RUN |

## Rollback posture

- Last known compatible application commit:
- Pre-apply posture: branch can be revised without database action.
- Post-apply correction: new forward-only migration required.
- Application recovery action:
- Data repair required: YES / NO / UNKNOWN
- Residual risk:

## Final decision

- Overall result: PASS / FAIL / BLOCKED
- Accepted by:
- Accepted at (UTC):
- Follow-up task or issue:

Do not add passwords, API keys, access tokens, private connection strings, test-user credentials, email addresses, or raw user data to this record.
