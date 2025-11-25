# Task: Implement Voice Interaction Flow in Marathi for Eligibility Check

## Steps to Implement

1. Create a new React component `VoiceInteraction.tsx` in `src/components`:

   - Start the voice interaction on user call.
   - AI speaks Marathi greeting and ask to select language (preset Marathi).
   - Use speech synthesis to ask sequential questions: Age, Gender, Income.
   - Use speech recognition to capture user answers.
   - Store user answers in local state.

2. Use existing `checkEligibility` function from `src/utils/eligibilityChecker.ts`:
   - Pass collected user data to calculate eligibility.
3. Use Marathi text prompts and messages from `src/utils/translations.ts`:

   - For asking questions and speaking results.

4. Implement or use custom hooks/utilities for:

   - Speech Synthesis (text-to-speech) in Marathi.
   - Speech Recognition for user responses.

5. Update or add integration inside `VoiceCallButton.tsx` or replace it to initiate this voice interaction component on call.

6. Provide voice output of eligibility result in Marathi after rule engine computation.

7. Test full flow:
   - User calls → AI speaks Marathi → select language (Marathi) → Ask Age → Ask Gender → Ask Income → Calculate eligibility → Voice output Marathi result.

## Followup

- Verify Marathi voice recognizer and synthesizer are working correctly.
- Confirm eligibility results match user input.
- Add error handling for unclear voice input.
- Add UI enhancements if needed (visual feedback).

---

This TODO serves as the implementation roadmap. After your approval, I will proceed stepwise.
