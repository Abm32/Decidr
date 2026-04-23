# Requirements Document

## Introduction

The Agent System is the conversational AI module of the Decision Intelligence Engine (Multi-Future Simulator). It creates and manages AI-driven conversational agents that embody "Future You" personas within generated scenario timelines. Each agent speaks as if living inside a specific future, maintaining personality consistency and scenario-scoped knowledge. The system supports real-time voice conversations via ElevenLabs Conversational AI, manages concurrent sessions (one per scenario), and maintains conversation history per session.

## Glossary

- **Agent**: A conversational AI character configured to speak as "Future You" within a specific scenario timeline
- **Persona**: A structured identity definition for an Agent, including identity label, target year, personality traits, and knowledge scope
- **Persona_Schema**: The JSON schema defining the structure of a Persona object
- **Scenario_Context**: The full context from a generated scenario (timeline, events, emotional tone, outcome summary) injected into an Agent's system prompt
- **System_Prompt**: The dynamically constructed prompt that configures an Agent's behavior, personality, and knowledge boundaries
- **Session**: A stateful connection between a user and a specific Agent, supporting real-time voice conversation
- **Session_Manager**: The component responsible for creating, maintaining, and terminating Agent sessions
- **Conversation_History**: An ordered log of all messages exchanged within a single Session
- **Agent_Factory**: The component that initializes Agent instances from scenario data and persona configuration
- **Voice_Client**: The interface for communicating with ElevenLabs Conversational AI API for real-time voice interaction
- **Scenario**: A generated future path from the Simulation Engine containing a title, timeline, key events, emotional tone progression, and outcome summary

## Requirements

### Requirement 1: Initialize Agents from Scenario Data

**User Story:** As a user, I want a conversational AI agent created for each generated scenario, so that I can talk to my "future self" living in that specific timeline.

#### Acceptance Criteria

1. WHEN a valid Scenario and Persona are provided, THE Agent_Factory SHALL create an Agent instance configured with the scenario's context and persona identity
2. WHEN a Scenario is missing required fields (scenario_id, title, timeline, summary), THE Agent_Factory SHALL reject the input and return a descriptive validation error
3. WHEN a Persona is missing required fields (identity, year, personality, knowledge_scope), THE Agent_Factory SHALL reject the input and return a descriptive validation error
4. THE Agent_Factory SHALL generate a unique agent_id for each created Agent
5. WHEN an Agent is created, THE Agent_Factory SHALL set the Agent's initial status to "idle"

### Requirement 2: Construct Dynamic System Prompts

**User Story:** As a developer, I want scenario context and persona data injected into each agent's system prompt, so that the agent speaks authentically as "Future You" from a specific timeline.

#### Acceptance Criteria

1. THE System_Prompt SHALL incorporate the Persona's identity, year, personality, and knowledge_scope fields
2. THE System_Prompt SHALL incorporate the Scenario_Context's title, path_type, timeline events, emotional tone progression, and summary
3. THE System_Prompt SHALL instruct the Agent to respond only with knowledge from the assigned scenario timeline
4. THE System_Prompt SHALL instruct the Agent to maintain consistent personality throughout the conversation
5. WHEN the same Persona and Scenario_Context are provided, THE Agent_Factory SHALL produce a deterministic System_Prompt string

### Requirement 3: Enforce Scenario Knowledge Boundaries

**User Story:** As a user, I want each agent to only know about its own timeline, so that conversations feel authentic and scenario-specific.

#### Acceptance Criteria

1. THE System_Prompt SHALL contain an explicit instruction prohibiting the Agent from referencing events or knowledge outside its assigned scenario timeline
2. THE System_Prompt SHALL contain an explicit instruction prohibiting the Agent from acknowledging the existence of other generated scenarios
3. WHEN the System_Prompt is constructed, THE Agent_Factory SHALL include only the timeline entries, summary, and emotional tones from the assigned Scenario

### Requirement 4: Manage Agent Sessions

**User Story:** As a user, I want to start, maintain, and end voice conversations with my future-self agents, so that I can explore each scenario interactively.

#### Acceptance Criteria

1. WHEN a user requests a conversation with a specific Agent, THE Session_Manager SHALL create a new Session with a unique session_id and associate it with the Agent
2. WHEN a Session is created, THE Session_Manager SHALL set the Session status to "active"
3. WHEN a user ends a conversation, THE Session_Manager SHALL set the Session status to "closed" and release associated resources
4. WHEN a Session has been inactive for longer than the configured timeout period, THE Session_Manager SHALL set the Session status to "expired" and release associated resources
5. THE Session_Manager SHALL support multiple concurrent Sessions, one per Agent in a Scenario_Set

### Requirement 5: Handle Session Reconnections

**User Story:** As a user, I want to reconnect to an interrupted conversation, so that I do not lose my conversation progress.

#### Acceptance Criteria

1. WHEN a user attempts to reconnect to a Session with status "active", THE Session_Manager SHALL restore the Session and provide the existing Conversation_History
2. WHEN a user attempts to reconnect to a Session with status "expired" or "closed", THE Session_Manager SHALL reject the reconnection and return a descriptive error
3. WHEN a reconnection is successful, THE Session_Manager SHALL reset the inactivity timer for that Session

### Requirement 6: Integrate with ElevenLabs Conversational AI

**User Story:** As a user, I want to have real-time voice conversations with my future-self agents, so that the experience feels immersive and natural.

#### Acceptance Criteria

1. WHEN a Session is active, THE Voice_Client SHALL establish a real-time voice connection with ElevenLabs Conversational AI API
2. WHEN the user speaks, THE Voice_Client SHALL transmit the audio to ElevenLabs and return the Agent's spoken response audio
3. THE Voice_Client SHALL pass the Agent's System_Prompt to ElevenLabs to configure the conversational AI behavior
4. IF the Voice_Client encounters a connection error or timeout, THEN THE Voice_Client SHALL return a descriptive error without crashing the Session

### Requirement 7: Maintain Conversation History

**User Story:** As a user, I want my conversation history preserved, so that the agent remembers what we discussed and I can review past conversations.

#### Acceptance Criteria

1. WHEN a message is exchanged in a Session, THE Session_Manager SHALL append the message to the Session's Conversation_History with a timestamp, role (user or agent), and content
2. THE Conversation_History SHALL preserve messages in chronological order
3. WHEN a Session is retrieved, THE Session_Manager SHALL return the complete Conversation_History for that Session
4. THE Session_Manager SHALL persist Conversation_History so that it survives Session reconnections

### Requirement 8: Serialize and Deserialize Persona Objects

**User Story:** As a developer, I want persona objects reliably serialized to JSON and deserialized back, so that data integrity is maintained across system boundaries.

#### Acceptance Criteria

1. THE Agent_Factory SHALL serialize Persona objects to JSON strings conforming to the Persona_Schema
2. THE Agent_Factory SHALL deserialize valid JSON strings into Persona objects
3. FOR ALL valid Persona objects, serializing then deserializing SHALL produce an equivalent Persona object (round-trip property)
4. IF a JSON string does not conform to the Persona_Schema, THEN THE Agent_Factory SHALL return a descriptive parsing error

### Requirement 9: Validate Agent Configuration

**User Story:** As a developer, I want all agent configurations validated before use, so that misconfigured agents do not enter the system.

#### Acceptance Criteria

1. THE Agent_Factory SHALL validate that the Persona year field is a valid year string (four-digit number)
2. THE Agent_Factory SHALL validate that the Persona personality field is a non-empty string
3. THE Agent_Factory SHALL validate that the Persona knowledge_scope field is a non-empty string
4. THE Agent_Factory SHALL validate that the Scenario_Context contains at least 3 timeline entries
5. WHEN validation fails, THE Agent_Factory SHALL return all validation errors in a single response rather than failing on the first error
