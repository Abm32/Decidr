# Requirements Document

## Introduction

The Comparison Engine is the analytical module of the Decision Intelligence Engine (Multi-Future Simulator). It takes the generated scenarios from the Simulation Engine and produces normalized metrics, visual comparison data, and AI-generated insights to help users compare futures across multiple dimensions. The engine extracts raw metrics from scenario data (timeline events, emotional tones, outcomes), normalizes them to a 0–100 scale, generates radar/spider chart data for visual comparison, and produces AI-powered summary insights. It supports comparing 2–4 scenarios in a single comparison and provides both visual and textual output.

## Glossary

- **Comparison_Engine**: The core module responsible for orchestrating multi-scenario comparison, metric extraction, normalization, chart data generation, and insight generation
- **Scenario**: A generated future path from the Simulation Engine containing a scenario_id, title, path_type, timeline, summary, and confidence_score
- **Scenario_Set**: A collection of 2–4 scenarios to be compared
- **Dimension**: A named axis of comparison (e.g., Happiness, Risk, Financial_Outcome, Personal_Growth); the set of dimensions is extensible
- **Raw_Metric**: An unnormalized numeric value extracted from scenario data for a specific Dimension
- **Normalized_Metric**: A Raw_Metric scaled to the 0–100 range
- **Scenario_Metrics**: A structured object containing a scenario's identifier, title, and an array of per-dimension normalized scores with labels
- **Radar_Chart_Data**: A structured object containing dimension names and per-scenario value arrays, formatted for rendering a radar/spider chart
- **Comparison_Result**: The complete output of a comparison, containing Scenario_Metrics for each scenario, Radar_Chart_Data, and a textual insight summary
- **Metric_Extractor**: The sub-component that derives Raw_Metric values from scenario timeline events, emotional tones, and outcome summaries
- **Normalizer**: The sub-component that scales Raw_Metric values to the 0–100 range
- **Chart_Generator**: The sub-component that transforms Scenario_Metrics into Radar_Chart_Data
- **Insight_Generator**: The sub-component that produces AI-powered textual summaries comparing scenarios, with a template-based fallback
- **LLM_Client**: The interface used to communicate with an external large language model for insight generation

## Requirements

### Requirement 1: Accept Scenario Sets for Comparison

**User Story:** As a user, I want to submit a set of generated scenarios for comparison, so that the engine can analyze and compare them across multiple dimensions.

#### Acceptance Criteria

1. WHEN a user submits a Scenario_Set containing 2 to 4 valid scenarios, THE Comparison_Engine SHALL accept the input and initiate comparison processing
2. WHEN a user submits a Scenario_Set containing fewer than 2 scenarios, THE Comparison_Engine SHALL reject the input and return a descriptive validation error
3. WHEN a user submits a Scenario_Set containing more than 4 scenarios, THE Comparison_Engine SHALL reject the input and return a descriptive validation error
4. WHEN a Scenario_Set contains a scenario missing required fields (scenario_id, title, timeline, summary), THE Comparison_Engine SHALL reject the input and return a validation error identifying the failing scenario and fields

### Requirement 2: Extract Raw Metrics from Scenario Data

**User Story:** As a user, I want the engine to analyze each scenario's timeline events, emotional tones, and outcomes, so that meaningful numeric metrics are derived for comparison.

#### Acceptance Criteria

1. WHEN a valid Scenario is provided, THE Metric_Extractor SHALL produce a Raw_Metric value for each configured Dimension
2. THE Metric_Extractor SHALL extract a Happiness metric by analyzing the emotional tone progression across the scenario's timeline entries
3. THE Metric_Extractor SHALL extract a Risk metric by analyzing the presence of negative emotional tones and adverse events in the scenario's timeline
4. THE Metric_Extractor SHALL extract a Financial_Outcome metric by analyzing financial indicators in the scenario's timeline events and summary
5. THE Metric_Extractor SHALL extract a Personal_Growth metric by analyzing progression and development indicators in the scenario's timeline
6. WHEN the same Scenario is provided twice, THE Metric_Extractor SHALL produce identical Raw_Metric values (deterministic extraction)

### Requirement 3: Normalize Metrics to 0–100 Scale

**User Story:** As a user, I want all metrics normalized to a common scale, so that I can compare dimensions fairly across scenarios.

#### Acceptance Criteria

1. THE Normalizer SHALL scale all Raw_Metric values to the 0–100 range (inclusive)
2. WHEN a Raw_Metric value is at the minimum of its dimension's range, THE Normalizer SHALL produce a Normalized_Metric of 0
3. WHEN a Raw_Metric value is at the maximum of its dimension's range, THE Normalizer SHALL produce a Normalized_Metric of 100
4. WHEN the same Raw_Metric value and dimension range are provided twice, THE Normalizer SHALL produce identical Normalized_Metric values (deterministic normalization)
5. THE Normalizer SHALL preserve the relative ordering of Raw_Metric values within a dimension after normalization

### Requirement 4: Generate Radar Chart Data

**User Story:** As a user, I want chart-ready data for a radar/spider chart, so that I can visually compare scenarios across all dimensions.

#### Acceptance Criteria

1. WHEN Scenario_Metrics are provided for 2 to 4 scenarios, THE Chart_Generator SHALL produce a Radar_Chart_Data object containing all configured dimension names
2. THE Radar_Chart_Data SHALL contain one series entry per scenario, each with values corresponding to the dimension order
3. THE Radar_Chart_Data dimensions array SHALL match the order of values in each series entry
4. WHEN the same Scenario_Metrics are provided twice, THE Chart_Generator SHALL produce identical Radar_Chart_Data (deterministic generation)

### Requirement 5: Generate AI-Powered Insights

**User Story:** As a user, I want an AI-generated textual summary comparing the scenarios, so that I can understand the key trade-offs and differences between futures.

#### Acceptance Criteria

1. WHEN Scenario_Metrics and Radar_Chart_Data are provided, THE Insight_Generator SHALL produce a non-empty textual summary comparing the scenarios
2. THE Insight_Generator SHALL reference specific dimension scores and scenario titles in the generated summary
3. IF the LLM_Client returns an error or times out, THEN THE Insight_Generator SHALL fall back to a template-based summary using the available metric data
4. WHEN the template-based fallback is used, THE Insight_Generator SHALL produce a summary that includes each scenario's title and its highest and lowest scoring dimensions

### Requirement 6: Support Extensible Dimensions

**User Story:** As a developer, I want the dimension set to be extensible, so that new comparison axes can be added without modifying core engine logic.

#### Acceptance Criteria

1. THE Comparison_Engine SHALL accept a configurable list of Dimension definitions at initialization
2. WHEN a new Dimension is added to the configuration, THE Metric_Extractor SHALL extract a Raw_Metric for the new Dimension without changes to existing extraction logic
3. WHEN a new Dimension is added, THE Normalizer, Chart_Generator, and Insight_Generator SHALL process the new Dimension alongside existing ones

### Requirement 7: Produce Complete Comparison Results

**User Story:** As a user, I want a single structured result containing metrics, chart data, and insights, so that I can consume the comparison output in one response.

#### Acceptance Criteria

1. THE Comparison_Engine SHALL produce a Comparison_Result containing Scenario_Metrics for each input scenario, Radar_Chart_Data, and an insights string
2. THE Comparison_Result SHALL include one Scenario_Metrics entry per input scenario, each containing the scenario's identifier, title, and per-dimension scores with labels
3. WHEN the same Scenario_Set is provided twice, THE Comparison_Engine SHALL produce identical Scenario_Metrics and Radar_Chart_Data (deterministic output, excluding LLM-generated insights)

### Requirement 8: Validate Input and Output Schemas

**User Story:** As a developer, I want all inputs and outputs validated against strict schemas, so that downstream consumers can reliably parse and use the data.

#### Acceptance Criteria

1. THE Comparison_Engine SHALL validate every input Scenario_Set against the defined input schema before processing
2. THE Comparison_Engine SHALL validate every Comparison_Result against the defined output schema before returning it
3. WHEN input validation fails, THE Comparison_Engine SHALL return a descriptive error identifying the failing fields
4. FOR ALL valid Comparison_Result objects, serializing then deserializing SHALL produce an equivalent Comparison_Result object (round-trip property)

### Requirement 9: Handle Errors Gracefully

**User Story:** As a developer, I want the engine to handle all error conditions gracefully, so that failures are reported clearly without crashing.

#### Acceptance Criteria

1. IF the LLM_Client returns an error during insight generation, THEN THE Comparison_Engine SHALL use the template-based fallback and include the complete Comparison_Result
2. IF metric extraction fails for a specific Dimension, THEN THE Comparison_Engine SHALL assign a default score of 50 for that Dimension and continue processing
3. IF an unexpected error occurs during comparison processing, THEN THE Comparison_Engine SHALL return a descriptive error without crashing
