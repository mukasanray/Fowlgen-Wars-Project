# Worked shapes: inventory, funnel map, collision calendar, kill criteria and recipe test, sponsor-bundle test

Five artifacts the workflow produces, each with the shape to copy and the mistake to avoid. Every figure below is illustrative - none is a benchmark, and none should be carried into a plan as a target.

## Contents

- Property inventory
- Pairwise funnel map
- Build-up collision calendar
- Add and kill criteria, and the recipe test when one fires
- The sponsor-bundle test

## Property inventory

One row per property. The purpose sentence is the load-bearing column: it is written first, and a property that cannot fill it is the first kill candidate before any metric is consulted.

| Property        | Cadence          | Size         | Audience                          | Rough cost                         | End-to-end owner | What it is for                                          |
| --------------- | ---------------- | ------------ | --------------------------------- | ---------------------------------- | ---------------- | ------------------------------------------------------- |
| City conference | Annual, June     | ~400         | Working practitioners             | Largest line; ticketed + sponsored | Ana              | The one day the whole local scene is in a room together |
| Meetup          | Monthly          | ~60          | Practitioners + curious newcomers | Hosted venue, near-zero            | Ana              | Keeps the audience warm and finds next year's speakers  |
| Hackathon       | Annual, November | ~120         | Students and beginners            | Mid; sponsor-funded                | _(nobody)_       | (no purpose)                                            |
| Podcast         | Fortnightly      | ~800 listens | Regional, beyond the city         | Ana's evenings                     | Ana              | (no purpose)                                            |

Read this table the way it reads here. Three of four properties have the same owner, and two cannot state a purpose. This is not a portfolio problem to be solved by adding a fifth property; it is a portfolio with two retirement candidates and one bus factor.

Negative example: an inventory listing only names, dates and headcounts. It looks complete, and it silently drops the two columns - purpose and owner - that the pass threshold is written against.

## Pairwise funnel map

For each ordered pair, name the mechanism and mark it. Order matters: a meetup feeding a conference is a different mechanism from a conference feeding a meetup, and most portfolios have one direction working and the other empty.

```
meetup      -> conference   EXISTS       announced from the stage; the meetup list is the conference's first email
conference  -> meetup       ASPIRATIONAL nothing said on the day; no follow-up to attendees
hackathon   -> meetup       ASPIRATIONAL assumed, never mentioned at either
podcast     -> conference   ASPIRATIONAL a link in the show notes, never measured
conference  -> podcast      EXISTS       talks re-cut as episodes; the archive stays alive between editions
```

The reading: this portfolio has exactly two working paths and both start or end at the conference. The hackathon connects to nothing in either direction, which is a stronger retirement signal than its attendance.

Negative example: writing "cross-promotion" as the mechanism. It names a category, not a thing that happens on a date to a person - and it cannot be marked _exists_ or _aspirational_, which is the entire point of the map.

## Build-up collision calendar

Mark each property's build-up window, not its date. The build-up is when its owner is unavailable, and that is where the collision actually lands.

```
        Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep   Oct   Nov   Dec
Conf                        [=====build=====][JUN]
Hack                                                  [==build==][NOV]
Meetup  x     x     x     x     x     -     x     x     x     x     -     x
Podcast ------------------------------------------------------------------
```

Two readings this shape makes visible that a date-only calendar does not:

- The meetup silently skips the two months its owner is inside another property's build-up - a gap nobody decided.
- If the hackathon's build-up started six weeks earlier, it would sit inside the conference's, with one owner across both.

Negative example: a calendar with four dates on it and no windows. It shows no collision at all, because the dates genuinely do not collide. The people do.

## Add and kill criteria

Written per property, in advance, dated. All three parts are required:

- A named metric.
- A floor.
- The number of consecutive editions below the floor that triggers a retirement conversation.

The conversation is the trigger, not the retirement: the criterion exists to schedule a decision, not to make it automatically.

```
Hackathon - written 2026-08-31, reviewed each November
  Metric: participants who appear at any other property within 12 months
  Floor:  15 of them
  Trigger: two consecutive editions below the floor
  Also kills it immediately: no end-to-end owner at the season's start
```

The floor is self-set; 15 carries no authority of its own. Its value is that it was chosen while the property was healthy and by the people who would otherwise argue about it later.

Negative example: "we'll reassess if attendance drops." Every part is missing - no metric with a definition, no floor, no count of editions, no date. It reads like a criterion and functions as a deferral.

### When the trigger fires

The conversation ends in one written decision: change the recipe as a bounded test, merge, or retire. A recipe change is written in the same shape as the criterion that fired it:

```
Meetup - trigger fired 2027-03-15
  Demand read: done (event-market-fit) - people still ask for the topic, not for this evening
  Decision: change the recipe for 3 editions
  Change:   weeknight talks -> one hands-on session per edition
  Must move: attendance back above the floor in at least 2 of the 3
  Keep-or-retire date: 2027-09-30, decided at the next team meeting
```

Every figure is illustrative. The load-bearing parts are the single named change, the bounded edition count, and the end date on which the team keeps or retires the property without reopening the question.

Negative example: "let's try something different next time." No named change, no count, no end date - the slow drift in one sentence, and the team pays for each extra edition in volunteer hours.

## The sponsor-bundle test

Applies only when the shared-infrastructure menu's cross-property package rung is being promoted. Treat the first bundle as a test with a stated fallback, never as a standard offer.

Before offering it, all four must hold:

1. The same sponsor already renews on two of your properties **separately** - the bundle formalizes a relationship, it does not create one.
2. One person can own fulfilment across every property in the bundle. Split fulfilment is how a bundle becomes three broken promises.
3. Each property in the bundle has a per-property price that still stands if the sponsor takes only one. That is the fallback, and it is written down before the conversation.
4. The bundle is described to the sponsor as new. Presenting it as how this is normally done is the failure mode: it is not a standard package anyone else is buying.

A real precedent exists for one piece of this test. A cloud-native foundation's own flagship-conference sponsorship terms discount a sponsor 5% for signing two regional editions of the same conference in one contract cycle, and 8% for three or more. That bundles the same conference format across regions, not different formats under one team, so it evidences multi-edition sponsor discounts rather than the cross-format bundle this rung describes.

Negative example: quoting a bundled figure as a market rate, or as a discount off one. There is no market rate here to discount from, and inventing one is how a first bundle sets a price the portfolio cannot sustain.
