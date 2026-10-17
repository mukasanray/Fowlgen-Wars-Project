# Channel plan template and worked examples

The output of this skill is one plan document in the structure below. Scenario inputs in the examples (prices, margins, budgets) are hypothetical; every benchmark figure they are checked against comes from the profiles file and carries its caveats - directional ranges, not targets.

## Template

```
# Channel plan  - {business}, {date}

## 1. Economics
AOV/ACV:  - | Gross margin:  - | Contribution per sale:  -
Break-even ROAS (1 / contribution margin rate):  -
Monthly gross profit per customer:  - | LTV / retention (if known):  -
Allowable CAC:  - (derivation: payback target  - months × monthly gross profit; or org guardrail, source)
Payback at allowable CAC:  - months (discounted:  - months at  -% retention)
Results due by:  - | One-off win or compounding asset:  - | Effort ceiling:  - assets/month,  - hours/week, reversibility required:  -

## 2. Deleted channels
| Family | Gate failed (affordability / disqualifier / funding floor) | Specifics, dated |
(Deleted means out of the candidate set for this account  - none of these reappear in section 3.)

## 3. Candidates ranked by efficiency  - survivors only
| Rank | Family | Value subtotal (presence, reachability, reach, measurability) | Effort subtotal (creative burn, skill/coordination, reversibility) | Value ÷ effort | Headroom vs. allowable CAC (tiebreak only) |
(Evidence note next to every 4-5 value score and every 1-2 effort score.)
Departures from the step 4 default ordering, and what moved each row:  - (unfair advantage / in-house skill / owned asset / answer to Q15-17).
Starved family promoted against its rank:  - (which of podcast/audio, connected TV or short-form video, and which of the four promotion conditions held). None, if the ratio order stands.
Price-discovery bucket, unranked by design: native/discovery, programmatic display, paid review listings  - second-channel candidates only, after a tiny test returns a real number.

## 4. Primary recommendation
Family:  - . Rationale: demand state, value ÷ effort ratio, benchmark CPA/CPL vs. allowable CAC.

## 5. Funding plan
Budget:  - /month. Primary's signal threshold:  - . Share to primary:  - (≥ threshold; ~80% for first 90 days is the default pattern).

## 6. Test design
Price discovery: ~$ - to learn real CPC/CPM for this targeting.
Real test:  - (3-5x target CPA per concept) over  - weeks (≥ full purchase cycle; same weekday start/end).
Pass: CPA/CPL ≤ allowable CAC at 90-95% confidence. Kill: 2-3x target CPA spent, zero conversions, after a readable sample.

## 7. Second-channel triggers
Add one channel only when: primary CPA rises  - % on saturation signals, or budget crosses ~$ - /month with payback still ≤  - months. Next-ranked candidate:  - .

## 8. Measurement approach
Attribution model, self-reported question (if creation channel), MER vs. platform ROAS (ecommerce), incrementality cadence. Known signal gaps (EU consent, mobile-OS tracking loss).
```

## Worked example - B2B

Workflow-automation SaaS. ACV $18,000, 80% gross margin, LTV ~$45,000, ~90-day sales cycle, budget $12,000/month, US + UK, demo-led (lead-gen), sales follow-up same-day, 4 net-new static assets + 1 video per month, tracking verified. Results needed by the end of next quarter. Wants a compounding asset but will take the fast win first. Effort ceiling is roughly 5 assets/month, with no committed flights.

1. **Economics**: monthly gross profit per customer = ($18,000 / 12) × 0.80 = $1,200. Allowable CAC at a 5-month payback target = $6,000 (well inside the 3-12 month band; discounted variant not binding at ~90% logo retention). Break-even ROAS not the operative metric - pipeline and payback are (B2B column).
2. **Deleted**:
   - Retail media: product not sold on marketplaces.
   - Short-form video and connected TV: creative capacity (one video/month cannot feed families that fatigue in days), and CTV production at $1,500-$15,000+ per asset is out of budget.
   - Podcast: budget $12K < ~$15K measurability floor across 3+ shows.

   All four are out of the candidate set for this account - they do not appear in the ranking below, and adding one back means re-running the gate that removed it.

3. **Ranked by efficiency**:
   - Paid search: value 17 / effort 5 → 3.4 (buyers search the category; CPL benchmark ~$67 average, category-checked; a week of setup then near-zero ongoing, pausable in minutes).
   - B2B professional networks: value 16 / effort 9 → 1.8 (LTV $45K clears the ~$10-15K floor; budget clears the ~$5K/month floor; CPL ~$110 → at a 10% lead-to-customer rate, CAC ~$1,100 ≪ $6,000, but a quarter of committed spend before a verdict, against a deadline this quarter).

   No departure from the default ordering: nothing in this business's assets or skills moves a row, and the Q15 deadline reinforces the capture-first order rather than changing it. Paid review listings sit in the unranked price-discovery bucket (high intent, no cost benchmark).

4. **Primary**: paid search - capture first: the category has search volume, capture is unfunded, and it returns the most per hour spent before any creation budget moves.
5. **Funding**: $9,600/month (80%) to paid search - supports ~$300+/day, comfortably above the ~10 clicks/day and 3-5x target-CPA floor at the expected CPC.
6. **Test**: ~$100 price discovery on exact-match category terms; then $3,000-$5,000 per concept (3-5x a $1,000 blended target CPA at expected lead→customer rates) over 12 weeks - one full sales cycle, honoring the ~3-month B2B commitment norm. Pass: cost per customer ≤ $6,000 at 90% confidence. Kill: $2,000-$3,000 spent on a concept with zero SQLs after a readable sample.
7. **Second channel**: professional networks, added only when search CPA rises on impression-share saturation or budget crosses ~$50K/month with payback ≤ 12 months.
8. **Measurement**:
   - CRM as source of truth.
   - Self-reported attribution on the demo form (long cycles break last-click).
   - First-touch and last-touch read side by side.

## Worked example - B2C

DTC fitness-accessories brand. AOV $90, 60% gross margin → $54 contribution; no reliable repeat-purchase data yet; impulse-to-days cycle; budget $9,000/month; US only; ~10 UGC-style videos/month (at the ~$150-$300/asset norm) plus statics; tracking verified. No hard external date; wants a compounding creative library, not a one-quarter spike; effort ceiling ~10 videos/month with one person owning production.

1. **Economics**: break-even ROAS = 1 / 0.60 ≈ 1.67x. With no proven LTV, allowable CAC is first-order: $38 (≈70% of contribution, leaving margin for variable costs). Payback: immediate at first order or never - the discounted-payback machinery is not binding.
2. **Deleted**:
   - B2B professional networks: no LTV near the $10-15K floor, instant fail.
   - Connected TV: $54 contribution cannot clear $20-40 CPMs plus $1,500+ production.
   - Podcast: budget < ~$15K floor.
   - Retail media: not yet sold on marketplaces.

   No starved-family promotion applies: podcast and connected TV are the two the ratio normally starves, but the promotion condition requires that no other family reaches the buyer, and paid social demonstrably does.

3. **Ranked by efficiency**:
   - Paid search: value 11 / effort 5 → 2.2 (reach scores 1, category search volume is thin and branded-skewed, but measurability and setup cost are unbeatable).
   - Paid social prospecting: value 17 / effort 11 → 1.55 (audience demonstrably there; median CPA ~$38 sits exactly at the $38 ceiling, so it passes only with mandatory price discovery; the 8-15-variant burn is a standing job this team can just carry).
   - Short-form video: value 16 / effort 13 → 1.23 (10 videos/month meets the 10-20-variant floor with no refresh headroom at scale).

   The axes disagree and the plan says so: paid search wins the ratio on a ceiling that exhausts within weeks, so it earns a small always-on slice, not the funded primary. Q16's compounding answer promotes paid social and short-form video, both of which leave a reusable creative library behind; Q17's ceiling keeps short-form video third.

4. **Primary**: paid social - creation channel for a category nobody searches yet, with the capacity to feed it and the only value ceiling large enough to absorb the budget. Margin note in the plan: at the dataset's median 1.86x ROAS, paid social is profitable above ~50% margin - this brand's 60% clears it, thinly.
5. **Funding**: $7,600/month (~84%) to one consolidated prospecting ad set: the ~50-events/week threshold at a $38 CPA implies ~$1,900/week. Remainder to retargeting and the branded-search capture slice. No second prospecting ad set - it would split events below threshold.
6. **Test**: ~$100 price discovery against the exact audience; then $114-$190 per concept (3-5x the $38 target CPA) across the 8-12 concepts capacity allows, over 4-6 weeks (social norm, covers the short cycle, same-weekday start/end). Pass: CPA ≤ $38 at 95% confidence on the account's real numbers, not the platform dashboard alone. Kill: ~$76-$114 spent on a concept with zero purchases.
7. **Second channel**: short-form video, only after paid social saturates (frequency-driven CPA rise) - not before, and never by splitting the $9K.
8. **Measurement**:
   - MER (total revenue / total ad spend) as the deciding metric - platform ROAS is inflated post-tracking-changes.
   - "How did you hear about us?" at checkout.
   - Quarterly geo-lift once spend is material.

## Negative example - what a failing plan looks like

Bootstrapped B2B tool, plans at $9/month and $199/month, blended "ARPU $58", 85% margin, budget $10,000/month, team of two, two static assets a month, tracking not yet verified. The draft plan: "$2,000 each to paid search, paid social, professional networks, podcast, and native - diversify and see what sticks."

Every gate fails:

- **Affordability**: blended ARPU hides the split. At a plausible $300 CAC, the $9 plan pays back in ~39 months (unaffordable - route to organic/product-led); only the $199 plan (~$169/month gross profit, ~1.8-month payback) can carry paid at all. The plan targets a blended customer who does not exist.
- **Gates ignored**: professional networks fail twice ($2K < ~$5K/month floor; no LTV near $10-15K on a $199/month plan without proven multi-year retention). Two statics/month cannot feed paid social's 8-15-variant burn. Tracking is unverified, so every learning phase is wasted by design.
- **Funding floors**: $2,000/month ≈ $66/day per channel - the textbook anti-pattern ($10K split five ways lands at $60-80/day, below every family's learning threshold). Podcast at $2K is 13% of its ~$15K measurability floor. Five experiments, all below minimum sample size; total spend $10K/month, total learning zero.
- **No test design**: no price discovery, no pass/fail, no kill criteria, no duration tied to the sales cycle - "see what sticks" is unfalsifiable.
- **No ranking at all**: an equal split is what a menu with no ordering produces. Even the instinct behind it is backwards - it treats the five families as interchangeable when their effort loads span a week of setup to a standing creative job, and the team is two people producing two statics a month.

The correct rewrite:

1. Verify tracking first.
2. Gate paid to the $199 tier only.
3. Delete professional networks and podcast outright - they failed the floor and the LTV gate, so they are named as deleted, not ranked last where the next budget conversation revives them.
4. Rank the remaining survivors by value ÷ effort and take the top one.
5. Fund it above its threshold with ~80% of budget.
6. Run one designed test.
7. Park only the still-eligible families as ranked candidates with explicit add-triggers.
