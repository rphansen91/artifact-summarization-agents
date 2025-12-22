# Setup Section - Test Instructions

## Overview

These test instructions guide TDD implementation of the Setup section. Write tests first, then implement to make them pass.

## Unit Tests

### SetupWizard Component

```
describe SetupWizard
  - renders step indicator with correct number of steps
  - shows Step1Folder when currentStepIndex is 0
  - shows Step2ApiKey when currentStepIndex is 1
  - shows Step3Automation when currentStepIndex is 2
  - shows Step4Repos when currentStepIndex is 3
  - calls onStepChange when navigating between steps
  - calls onComplete when finishing the wizard
  - disables "Next" button when current step is not complete
```

### StepIndicator Component

```
describe StepIndicator
  - renders all step labels
  - highlights the current step
  - shows completed steps with check icon
  - shows pending steps as inactive
  - allows clicking completed steps to navigate back
```

### Step1Folder Component

```
describe Step1Folder
  - renders folder selection UI
  - shows current folder path when selected
  - calls onFolderSelect when folder is chosen
  - shows validation error if folder is invalid
  - enables "Next" only when valid folder is selected
```

### Step2ApiKey Component

```
describe Step2ApiKey
  - renders API key input field
  - masks input by default (password type)
  - shows toggle to reveal/hide key
  - validates key format on blur
  - calls onApiKeyChange with new value
  - shows error state for invalid key format
```

### Step3Automation Component

```
describe Step3Automation
  - renders install button when not installed
  - shows "Installed" badge when automation is active
  - calls onInstall when install button clicked
  - shows loading state during installation
  - displays error message if installation fails
```

### Step4Repos Component

```
describe Step4Repos
  - renders list of available repositories
  - shows checkbox for each repository
  - displays selected count
  - calls onRepoToggle when checkbox clicked
  - allows selecting multiple repositories
  - shows empty state when no repos found
```

## Integration Tests

### Complete Wizard Flow

```
describe Setup Wizard Flow
  - user can complete all four steps in sequence
  - user can navigate back to previous steps
  - configuration persists when navigating between steps
  - wizard state resets when starting fresh
  - navigates to Browse & Review on completion
```

### Configuration Persistence

```
describe Configuration Persistence
  - saves artifacts folder path to config
  - saves API key to config (securely)
  - saves automation installation status
  - saves selected repository list
  - loads existing config when revisiting settings
```

## User Flow Tests

### First Run Experience

```
describe First Run
  - shows setup wizard on first app launch
  - requires all steps to be completed
  - redirects to main app after completion
  - does not show shell navigation during setup
```

### Settings Access

```
describe Settings Access
  - accessible from shell navigation after first run
  - shows current configuration values
  - allows modifying individual settings
  - validates changes before saving
```

## Edge Cases

```
describe Edge Cases
  - handles missing/invalid artifacts folder gracefully
  - recovers from API key validation failure
  - handles automation install failure on unsupported OS
  - manages empty repository list
  - handles very long folder paths
  - manages repositories with special characters in names
```

## Accessibility

```
describe Accessibility
  - all form inputs have associated labels
  - step indicator is keyboard navigable
  - error messages are announced to screen readers
  - focus moves appropriately between steps
  - buttons have descriptive accessible names
```
