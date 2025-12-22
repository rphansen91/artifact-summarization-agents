# Setup Section

## Overview

Setup is a guided wizard shown on first run (and accessible later as settings) that walks users through configuring their Artifact Engine. It includes selecting an artifacts folder, entering an API key, installing screenshot automation, and adding git hooks to repos.

## User Flows

- User sees stepper wizard with step indicators at top, one step active at a time
- Step 1: Select artifacts folder via native OS file picker
- Step 2: Enter Mastra API key via simple text input
- Step 3: One-click install screenshot automation (Mac Automator/Windows equivalent)
- Step 4: Browse and select git repos to add post-commit hooks
- On completion, user is navigated to Browse & Review section
- After first run, Setup remains accessible as a settings page for editing configuration

## Components

| Component | Description |
|-----------|-------------|
| `SetupWizard` | Main wizard container managing step state and navigation |
| `StepIndicator` | Progress indicator showing current step in the wizard |
| `Step1Folder` | Folder selection step with native file picker |
| `Step2ApiKey` | API key input step |
| `Step3Automation` | Screenshot automation installation step |
| `Step4Repos` | Git repository selection step |

## Props Pattern

All components accept data and callbacks via props. The main entry point is `SetupWizard`:

```tsx
interface SetupWizardProps {
  steps: Step[]
  currentStepIndex: number
  config: SetupConfig
  onStepChange?: (index: number) => void
  onConfigChange?: (config: SetupConfig) => void
  onComplete?: () => void
}
```

## Sample Data

See `sample-data.json` for example data that matches the `types.ts` interfaces.

## Design Notes

- Uses the product design tokens (emerald/amber/zinc palette)
- Supports light and dark mode via Tailwind `dark:` variants
- Does not include shell/navigation chrome (rendered standalone for first-run)
