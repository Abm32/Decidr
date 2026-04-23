# Audio Style Guide

## Narration Voice
- Use ElevenLabs Text-to-Speech for scenario narration
- Voice should be warm, clear, and conversational
- Pacing: moderate speed, with pauses at emotional transitions
- Match voice tone to the scenario's dominant emotional arc

## Emotional Tone → Audio Mapping

| Emotion     | Ambient Sound          | Music Style              |
|-------------|------------------------|--------------------------|
| hopeful     | birdsong, gentle wind  | uplifting piano/strings  |
| anxious     | urban noise, ticking   | tense, minor key         |
| triumphant  | crowd cheering, bells  | orchestral crescendo     |
| melancholic | rain, distant traffic  | slow piano, cello        |
| neutral     | office ambiance        | minimal, ambient pad     |
| excited     | bustling city, laughter| upbeat, rhythmic         |
| fearful     | thunder, creaking      | dissonant, suspenseful   |
| content     | fireplace, nature      | warm acoustic guitar     |
| desperate   | sirens, wind           | dark, driving percussion |
| relieved    | ocean waves, exhale    | resolving chord, gentle  |

## Audio Pipeline Structure
1. Script generation from scenario timeline
2. Narration audio via ElevenLabs TTS
3. Ambient sound selection based on emotional tones
4. Background music selection based on emotional arc
5. Audio segment merging with crossfades
6. Final mix with balanced levels (narration prominent)

## Technical Requirements
- Output format: MP3 or AAC for streaming
- Sample rate: 44.1kHz
- Narration volume: -3dB (primary)
- Ambient volume: -12dB (background)
- Music volume: -9dB (supporting)
- Crossfade duration: 500ms between segments
- Total audio duration: 2–5 minutes per scenario
