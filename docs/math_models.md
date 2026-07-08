# Mathematical Models

## Vector Matching (The "Swipe")
Cosine similarity is used to calculate the match percentage between a user's preferences $\vec{u}$ and a location's features $\vec{l}$:
$$ \text{Similarity}(\vec{u}, \vec{l}) = \frac{\vec{u} \cdot \vec{l}}{\|\vec{u}\| \|\vec{l}\|} $$

## Tour Routing (Itinerary) — Vector-Aware Cost Model

The Tour Builder optimises the visit order of a small set of stops (visit-all / TSP variant,
typically ≤10 stops) with **Nearest-Neighbour greedy** (from `start_lat/start_lng`) refined by
**2-opt** local search. Unlike a pure shortest-path solver, the edge cost is **personalised by the
user's taste vector** and contextual signals, so the route favours places the user actually likes
and that fit the time of day — not merely the closest ones.

For a move into candidate stop $s$ (location feature vector $\vec{l_s}$, current user vector
$\vec{u}$), the edge cost (in minutes, **lower is better**) is:

$$ \text{Cost}(s) = T_{\text{travel}} \;+\; w_W \cdot W_{\text{penalty}}(s) \;-\; w_S \cdot \widehat{\text{sim}}(s)\,M_S \;-\; w_R \cdot \widehat{r}(s)\,M_R \;-\; w_T \cdot \text{openfit}(s)\,M_T $$

- $T_{\text{travel}} = \dfrac{\text{haversine\_km}}{\text{SPEED\_KMH}} \times 60$ — travel time (minutes).
- $\widehat{\text{sim}}(s) = \dfrac{\cos(\vec{u}, \vec{l_s}) + 1}{2} \in [0,1]$ — taste match, persisted per stop as `match_score` $= \text{round}(\widehat{\text{sim}} \times 100)$.
- $\widehat{r}(s) = \text{clamp}(\text{rating}/5, 0, 1)$ — quality reward.
- $\text{openfit}(s) \in [0,1]$ — fit of `open_hours` to `time_context` (open-now / time-of-day).
- $W_{\text{penalty}}(s)$ — weather penalty (currently a mocked coefficient, isolated behind one helper for a future weather API).
- $M_S, M_R, M_T$ convert the unitless $[0,1]$ rewards into "minutes saved"; $w_S, w_R, w_T, w_W$ are tunable weights.

**Derived totals:** $\text{total\_duration\_min} = \sum T_{\text{travel}} + \sum \text{dwell\_min}$
(travel **plus** time spent at each stop), and $\text{estimated\_cost\_vnd} = \sum \text{parse\_price}(\text{price\_range})$.

Cross-link: API [`POST /tours/{id}/optimize`](api/discovery.md) · DB [`tour_stops`](database_schema/content.md).

## Minimax Algorithm
*(To be used for multi-agent game-theoretic pricing/competition)*
