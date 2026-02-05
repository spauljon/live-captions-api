# Executive Deck — Speaker Notes
## Personal Health Device Metrics Program

---

## Slide 1 — Proven FHIR at Scale

**Speaker Notes:**

We’ve been operating a production FHIR platform since around 2020.  
This was not a greenfield or best-case deployment — it evolved in place.

We migrated from legacy FHIR standards to modern ones without downtime or data loss,  
and we scaled continuously to tens of millions of patient-generated data points.

The important takeaway here is not the exact numbers —  
it’s that this platform has lived through real growth, real change,  
and real operational pressure.

---

## Slide 2 — What Breaks at Scale

**Speaker Notes:**

Most FHIR platforms don’t fail all at once — they fail gradually.

Security models become inconsistent, documentation drifts from reality,  
performance degrades, and correcting historical data becomes risky.

The most dangerous failure is the quiet one:  
loss of trust in analytics.

Systems keep running, dashboards still load,  
but decision-makers stop relying on what they see.

---

## Slide 3 — Beyond a “Standard” FHIR Server

**Speaker Notes:**

Many organizations deploy a FHIR server and assume the hard work is done.  
In practice, compliance is just the starting point.

Real platforms must handle replay, correction, evolving rules,  
and long-term operational ownership.

What we’re describing here is the difference between  
standing up infrastructure and owning a durable platform.

---

## Slide 4 — Designed for Change

**Speaker Notes:**

Healthcare platforms don’t stand still.

Devices change, regulations evolve,  
and business requirements shift continuously.

We assumed change was inevitable and designed for it from day one —  
with replay-safe ingestion, controlled correction strategies,  
and no “stop-the-world” migrations as the system evolves.

---

## Slide 5 — Trust in Longitudinal Analytics

**Speaker Notes:**

Analytics only work when data can be reliably compared over time.

In many systems, repeated data, corrections, or reprocessing  
slowly distort trends.

Identity doesn’t fail dramatically — it breaks gradually.

When that happens, analytics may still look polished,  
but confidence erodes, and decision-makers quietly stop trusting them.

---

## Slide 6 — Avoiding Semantic Congestion

**Speaker Notes (30–45 seconds):**

In streaming health data systems, replay and correction are normal and healthy.

The hidden risk is what we call *semantic congestion* —  
when the same logical measurement appears multiple times,  
corrections look like new facts, and meaning becomes ambiguous.

Nothing crashes, but trust erodes quietly while systems keep running.

We designed the platform so replay and correction don’t undermine meaning.

---

## Slide 7 — Performance Without Surprises

**Speaker Notes:**

Success changes systems.

Data volume grows continuously, usage patterns evolve,  
and costs compound over time.

Performance can’t be something you tune later —  
it has to be designed in.

Our focus was predictable behavior as scale increases,  
so growth doesn’t introduce operational or financial surprises.

---

## Slide 8 — What This Enables for You

**Speaker Notes:**

All of this engineering ultimately serves outcomes.

Faster time to value, because the platform doesn’t need to be rebuilt as it grows.  
Lower risk, because trust and correction are designed in.  
Analytics that leaders can rely on.  
And predictable cost and performance as success scales.

---

## Slide 9 — From Execution to Governance

**Speaker Notes:**

Operating FHIR at scale reveals a simple truth: execution alone isn’t enough.

As platforms succeed, ambiguity grows —  
around access, responsibility, and meaning.

Those concerns can’t live only in code.

That realization led us to treat governance as a first-class concern —  
separate from, but complementary to, the FHIR service itself.
