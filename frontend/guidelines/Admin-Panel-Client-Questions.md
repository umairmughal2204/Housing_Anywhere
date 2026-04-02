# Admin Panel Client Discovery Questions

Use this checklist before building the admin panel. The goal is to lock policy, workflow, and edge-case decisions first, then implement.

## How to use this document
- For each question, capture:
  - Decision
  - Owner (client/admin/legal/finance)
  - Priority (Must Have / Should Have / Nice to Have)
  - Effective date

## 1. Listing Publication and Admin Oversight
1. Should every new listing require admin approval before it becomes live, or should it auto-publish?
2. If approval is required, what is the SLA for review (for example, within 24 hours)?
3. Should approval rules differ by landlord type (new landlord vs verified landlord)?
4. Should edits to an already live listing trigger re-approval?
5. Which listing changes should trigger review:
   - Price change
   - Address/location change
   - Photos/videos change
   - Description change
   - Amenities/rules change
6. Should the platform support partial approval (approve with required changes)?
7. Can admin unpublish a live listing instantly?
8. Should there be an audit trail for listing actions (who approved/rejected and why)?
9. Do we need separate admin roles for reviewer vs super-admin?
10. Should rejected listings include mandatory rejection reasons and suggested fixes?

## 2. Permission Protocol for Landlords
1. Is explicit admin permission mandatory before first listing goes live?
2. Should landlord onboarding include any verification before posting?
3. If verification is required, what levels exist and what actions are unlocked at each level?
4. Can a landlord create drafts before verification?
5. Can unverified landlords receive inquiries/messages?
6. Should posting limits exist for new landlords (for example max 1 live listing until verified)?
7. Should repeat violations automatically suspend publishing rights?
8. Should admin be able to whitelist trusted landlords to bypass manual approval?
9. What documents are required from landlords by country/jurisdiction?
10. Should the system auto-expire permissions and force periodic re-verification?

## 3. Fraud, Trust, and Safety Policy
1. What events mark a landlord as potentially fraudulent?
2. Should we use automated fraud scoring, manual review, or both?
3. What immediate actions are allowed for admin:
   - Freeze payouts
   - Hide listings
   - Suspend account
   - Permanent ban
4. Who can execute fraud actions and who can reverse them?
5. What evidence must be stored before account suspension/ban?
6. Is there an appeal process for suspended landlords?
7. What is the target resolution timeline for fraud investigations?
8. Should tenants be proactively notified when a landlord is under investigation?
9. Should fraudulent activity be shared with payment provider risk tools?
10. Do we need a public trust badge for verified landlords?

## 4. Payment Dispute Resolution Workflow
1. What dispute categories are supported:
   - Unauthorized transaction
   - Property not as described
   - Landlord no-show
   - Refund delay
   - Technical payment failure
2. What is the first response SLA for payment disputes?
3. What is the maximum resolution SLA?
4. Should dispute intake be self-service in app, support-only, or both?
5. What documents/evidence are required from tenant and landlord?
6. During dispute, should payout be automatically held?
7. Who makes final decisions on refunds/chargebacks?
8. Are partial refunds allowed?
9. Can admin override payment provider decision?
10. What communication templates are required for each dispute stage?

## 5. Escrow-Style Release Logic
1. Do you want escrow-like holding where funds are released only after tenant approval?
2. What exactly is the tenant release trigger:
   - "I like it" button
   - Check-in confirmed
   - No complaint within X hours/days
3. If tenant does not respond, when is auto-release triggered?
4. Should there be a cooling-off period after release confirmation?
5. Can admin release funds manually in exceptional cases?
6. Should release logic differ by booking type (short-term vs long-term)?
7. If tenant rejects property, what are the allowed outcomes:
   - Full refund
   - Partial refund
   - Rebooking credit
8. How should escrow status be visible to landlord and tenant in UI?
9. Are there legal restrictions in target countries for holding funds?
10. Which payment provider capabilities are required to support escrow behavior?

## 6. Payout Policy and Timing
1. Is payout still planned for 5-7 days after transaction, or should this change?
2. Should payout timing start from payment date, move-in date, or tenant release date?
3. Should payout timing differ for trusted vs new landlords?
4. Should weekends/holidays affect payout windows?
5. What payout frequencies are supported:
   - Per booking
   - Daily batch
   - Weekly batch
6. What happens if landlord verification status changes before payout date?
7. Should negative events auto-delay payout:
   - Active dispute
   - Chargeback warning
   - Fraud flag
8. Do we need instant payout option with additional fee?
9. What payout methods are required (bank transfer, wallets, etc.)?
10. What payout failure retry policy is required?

## 7. Refund Rules
1. Who can initiate refunds (tenant, landlord, admin)?
2. Can landlord approve/deny refund requests before admin intervention?
3. What are refund windows for each cancellation scenario?
4. Are service fees refundable?
5. Are protection/guarantee fees refundable?
6. Can refunds be split across multiple payment methods?
7. Are manual/offline refunds allowed by admins?
8. What anti-abuse checks should run before refund approval?
9. How are refund statuses exposed to users?
10. Should refund actions require two-step admin approval for high amounts?

## 8. Admin Roles, Permissions, and Governance
1. Which admin roles are needed:
   - Support agent
   - Listing reviewer
   - Risk analyst
   - Finance admin
   - Super-admin
2. What exact permissions does each role have?
3. Which actions require dual approval?
4. Should sensitive actions require reason notes?
5. Do we need IP restrictions or SSO for admin login?
6. How long should admin activity logs be retained?
7. Should deleted/edited records be recoverable?
8. Should admins be able to impersonate users for support?
9. What masking rules apply to PII in admin UI?
10. What compliance reviews are required for admin access?

## 9. Compliance and Regulatory Requirements
1. Which jurisdictions are in scope at launch?
2. What legal/compliance standards must be followed (AML/GDPR/PCI/local rental laws)?
3. What user data must be stored, encrypted, and masked?
4. What is the document retention and deletion policy?
5. Should compliance checks be provider-based or custom flow?
6. What triggers enhanced due diligence?
7. How should sanctions/PEP screening be handled?
8. Who is responsible for compliance reporting?
9. What consent texts and legal disclosures are required in product UI?
10. What audit exports are required for legal requests?

## 10. Support Operations
1. Will there be an internal ticketing workflow in admin panel or external tool integration?
2. What ticket statuses and priorities are required?
3. What escalation matrix is needed (support -> risk -> legal -> finance)?
4. What macros/templates should support team use?
5. Should tenants/landlords be able to track complaint status in app?
6. Do we need SLA breach alerts for unresolved cases?
7. Should admin be able to trigger notifications (email/SMS/in-app)?
8. Which events require mandatory outbound communication?
9. Should support calls/notes be logged in admin panel?
10. Do we need multilingual support in admin communication templates?

## 11. Notifications and Communication
1. Which events trigger notifications:
   - Listing approved/rejected
   - Payout released/held
   - Dispute opened/resolved
   - Fraud review started/completed
2. Which channels are required (email, SMS, push, in-app)?
3. Should notifications be customizable by admin?
4. Should legal/compliance notices bypass user notification preferences?
5. Do we need country/language-specific message templates?
6. Should message delivery status be visible to admins?
7. Should retries happen for failed notifications?
8. Should high-risk events notify internal teams instantly?
9. What is the policy for notification frequency caps?
10. Who approves template content changes?

## 12. Reporting and Analytics for Admin Panel
1. Which KPIs matter most:
   - Approval turnaround time
   - Fraud detection rate
   - Dispute rate
   - Refund rate
   - Payout delay rate
2. What drill-down dimensions are needed (country, city, landlord cohort)?
3. Which reports must be exportable (CSV/PDF)?
4. Are real-time dashboards required or daily summaries enough?
5. Who should have access to financial reports?
6. What retention period is needed for analytics data?
7. Do we need anomaly alerts for unusual activity?
8. Should report filters be saved/shareable?
9. What reconciliation reports are required for finance?
10. Which metrics are required for board/investor updates?

## 13. Technical and Integration Decisions
1. Which payment provider(s) will be used at launch?
2. Are webhooks available for payout, refund, and dispute events?
3. What retry and idempotency policy should be implemented?
4. Should admin actions be event-sourced for full traceability?
5. What is the rollback strategy for failed critical admin actions?
6. Are there API rate limits that affect dispute/payout automation?
7. Do we need multi-currency settlement handling at admin level?
8. Should admin panel include feature flags for policy rollouts?
9. What environments are needed for UAT with client stakeholders?
10. Which actions require background jobs and queue monitoring?

## 14. Launch and Rollout Strategy
1. Should admin panel launch in phases or all at once?
2. Which features are phase-1 mandatory before going live?
3. What fallback manual process exists if admin tools fail?
4. What training is needed for admin/support teams?
5. What go-live checklist must be signed off by client?
6. What post-launch monitoring windows and owners are defined?
7. What incident severity levels and response playbooks are required?
8. What is the communication protocol for platform-wide incidents?
9. Should we run a pilot with limited landlords first?
10. What is the success criteria for first 30 days?

## 15. Immediate Clarification Questions (from your message)
1. Admin Oversight: Should listing publication be manual approval or auto-live with post-moderation?
2. Permission Protocol: Must landlord seek explicit admin permission before first post goes live?
3. Dispute Resolution: What exact workflow applies to payment disputes and fraud reports?
4. Escrow Feature: Should payment release require tenant confirmation trigger?
5. Payout Timing: Is the policy still release in 5-7 days, and from which reference date?

## Suggested Client Sign-Off Format
- Policy owner:
- Decision date:
- Effective date:
- Product impact:
- Engineering impact:
- Legal/compliance impact:
- Open risks:
- Final approved rule text:
