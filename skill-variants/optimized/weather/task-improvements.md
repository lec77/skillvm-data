# Weather Task Improvements

## Analysis from Phase 1 Evaluation

### Key Findings

1. **Both tasks are too easy for capable models.** Claude Opus achieves 100% on both tasks with and without the skill. The eval criteria don't discriminate between "used real data" and "generated plausible text." A model that hallucinates weather data but formats it nicely would score well.

2. **The "weather-metrics" criterion is too loose.** It checks for the presence of keywords like "humidity" or "%" anywhere in the text. The `%` check alone will match any percentage sign, including unrelated content. And "conditions" matches a huge list of weather words — even a model that doesn't fetch data could produce these.

3. **No verification that real data was fetched.** The weather-travel task checks tool call text for "wttr" or "weather" or "open-meteo", which is good. But weather-compare has no such check — a model could hallucinate all values and still score 100%.

4. **The llm-judge criteria carry 40% weight each but are subjective.** "Well-formatted comparison table" and "Specific item-level packing list" are reasonable but don't verify data authenticity.

5. **Missing coverage:**
   - No check that numeric values are plausible (e.g., temperature between -50°C and 60°C)
   - No check that the agent actually made API calls (weather-compare)
   - No check for data freshness or source attribution
   - No check that all 4 requested metrics appear per city (not just globally)

### Proposed Changes

#### weather-compare.task.ts

1. **Add API call verification** (new criterion, weight 0.15): Check that the agent made curl/fetch calls to a weather API. This is the primary discriminator — without data fetching, the output is hallucination.

2. **Tighten weather-metrics** (adjust weight to 0.3): Require that numeric temperature values appear near city names, not just anywhere in the text. Check for per-city data rather than global keyword presence.

3. **Add per-city metric completeness** (new criterion, weight 0.15): Verify each city has all 4 metrics (temperature, humidity, wind, conditions) — not just that these words appear somewhere.

4. **Keep presentation-quality** at weight 0.2 (reduced from 0.4): Formatting matters but shouldn't dominate.

5. **Keep city-mentions** at weight 0.2: Basic but important.

#### weather-travel.task.ts

1. **Keep weather-data** at weight 0.3 (reduced from 0.4): The API call check is good. Tighten the temperature check to require numeric values near city names.

2. **Add temperature-difference criterion** (new, weight 0.15): The task specifically asks about the "weather difference" — check that a numeric temperature comparison is made between the cities.

3. **Tighten packing-advice** (keep at 0.35): Add judgeContext detail about what "tied to actual weather data" means — the packing list should reference specific temperatures or conditions from the fetched data.

4. **Keep city-references** at weight 0.2.

### Weight Distribution Summary

**weather-compare (revised):**
| Criterion | Weight | Method |
|-----------|--------|--------|
| city-mentions | 0.20 | custom |
| api-call-made | 0.15 | custom |
| weather-metrics | 0.30 | custom |
| per-city-completeness | 0.15 | custom |
| presentation-quality | 0.20 | llm-judge |

**weather-travel (revised):**
| Criterion | Weight | Method |
|-----------|--------|--------|
| city-references | 0.20 | custom |
| weather-data | 0.30 | custom |
| temperature-difference | 0.15 | custom |
| packing-advice | 0.35 | llm-judge |
