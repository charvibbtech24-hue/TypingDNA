# TypingDNA

A behavioral biometric authentication system that identifies users based on **how they type**, rather than what they type.

## Overview

Traditional authentication methods rely on passwords, fingerprints, or facial recognition. TypingDNA explores an alternative approach: **keystroke dynamics**.

The application captures typing behavior and creates a unique behavioral profile for each user using typing patterns such as:

* Keystroke timing
* Flight time (time between keys)
* Dwell time (how long a key is held)
* Digraph patterns
* Typing speed
* Error and correction behavior

Users can enroll multiple typing samples, build a behavioral profile, and compare new typing sessions against previously stored profiles.

---

## Features

### Keystroke Capture

Records every key press and key release event.

### Flight Time Analysis

Measures the time gap between consecutive keystrokes.

### Dwell Time Analysis

Measures how long individual keys are held.

### Digraph Analysis

Captures timing patterns between specific key pairs.

### Behavioral Profiles

Stores multiple samples per user and creates an average typing profile.

### Authentication Engine

Compares a new typing session against enrolled profiles and calculates a similarity score.

### Multi-User Support

Supports multiple stored user profiles.

### Modern Dashboard UI

Cybersecurity-inspired interface for data visualization and authentication analysis.

---

## How It Works

1. User enters a typing sample.
2. The system captures keystroke events.
3. Behavioral features are extracted:

   * Flight time
   * Dwell time
   * Digraph timings
   * Typing speed
4. Multiple samples are stored for each user.
5. An average behavioral profile is generated.
6. New sessions are compared against enrolled profiles.
7. A similarity score is calculated.
8. The system determines whether the session is likely from the same user.

---

## Tech Stack

* HTML
* CSS
* JavaScript
* Browser Local Storage

---

## Project Structure

```text
TypingDNA/
├── index.html
├── styles.css
├── script.js
```

---

## Future Improvements

* Machine learning based classification
* Adaptive profile learning
* Trigraph and n-graph analysis
* Authentication confidence visualization
* Database integration
* User account management
* Real-time authentication monitoring

---

## Screenshots

(Add screenshots here)

---

## Author

Charvi B

Built as an exploration of behavioral biometrics and keystroke dynamics authentication.
