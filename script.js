// DOM references for the dashboard controls and output areas.
const input = document.getElementById("typing-input");
const data = document.getElementById("keystroke-data");
const digraphData = document.getElementById("digraph-data");
const dwellData = document.getElementById("dwell-data");
const averageDwell = document.getElementById("average-dwell");
const generateProfileButton = document.getElementById("generate-profile");
const profile = document.getElementById("typing-profile");
const nameInput = document.getElementById("name");
const saveProfileButton = document.getElementById("save-profile");
const saveMessage = document.getElementById("save-message");
const savedProfilesSelect = document.getElementById("saved-profiles");
const savedProfileDetails = document.getElementById("saved-profile-details");
const compareProfileButton = document.getElementById("compare-profile");
const comparison = document.getElementById("profile-comparison");

// In-memory timing data for the current typing session.
let startTime = null;
let previousTime = null;
let previousKey = null;
const keyTimes = [];
const keyDownTimes = {};
const dwellTimes = [];

// Capture key presses, timestamps, gaps, and consecutive-key digraphs.
input.addEventListener("keydown", (event) => {
  const currentTime = performance.now();

  if (startTime === null) {
    startTime = currentTime;
  }

  const timestamp = ((currentTime - startTime) / 1000).toFixed(3);
  const gap = previousTime === null
    ? ""
    : ` (gap: ${((currentTime - previousTime) / 1000).toFixed(3)}s)`;
  const entry = document.createElement("p");
  entry.textContent = `${event.key} - ${timestamp} seconds${gap}`;
  data.appendChild(entry);

  if (previousKey !== null) {
    const digraph = document.createElement("p");
    const digraphGap = ((currentTime - previousTime) / 1000).toFixed(3);
    digraph.textContent = `${previousKey}${event.key} = ${digraphGap}s`;
    digraphData.appendChild(digraph);
  }

  previousTime = currentTime;
  previousKey = event.key;
  keyTimes.push(currentTime);

  if (!event.repeat) {
    keyDownTimes[event.code] = { key: event.key, time: currentTime };
  }
});

// Capture key releases to calculate individual and average dwell times.
input.addEventListener("keyup", (event) => {
  const keyDown = keyDownTimes[event.code];

  if (!keyDown) {
    return;
  }

  const dwellTime = (performance.now() - keyDown.time) / 1000;
  const entry = document.createElement("p");
  entry.textContent = `${keyDown.key} = ${dwellTime.toFixed(3)}s`;
  dwellData.appendChild(entry);
  dwellTimes.push(dwellTime);

  const average = dwellTimes.reduce((sum, time) => sum + time, 0) / dwellTimes.length;
  averageDwell.textContent = `Average dwell: ${average.toFixed(3)}s`;
  delete keyDownTimes[event.code];
});

// Build the current session's basic typing profile.
function getTypingProfile() {
  if (keyTimes.length === 0) {
    return null;
  }

  const totalDuration = (keyTimes[keyTimes.length - 1] - keyTimes[0]) / 1000;
  const gaps = keyTimes.slice(1).map((time, index) => time - keyTimes[index]);
  const averageGap = gaps.length === 0
    ? 0
    : gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length / 1000;
  const typingSpeed = totalDuration === 0 ? 0 : keyTimes.length / totalDuration;

  return { averageGap, totalDuration, typingSpeed };
}

// Read, normalize, and display the named training profiles in local storage.
function getSavedProfiles() {
  const savedProfiles = JSON.parse(localStorage.getItem("typingProfiles") || "{}");

  Object.keys(savedProfiles).forEach((name) => {
    if (!savedProfiles[name].samples) {
      savedProfiles[name] = { name, samples: [savedProfiles[name]] };
    }
  });

  return savedProfiles;
}

function updateSavedProfilesList() {
  const savedProfiles = getSavedProfiles();
  savedProfilesSelect.innerHTML = '<option value="">Select a profile</option>';

  Object.keys(savedProfiles).forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    savedProfilesSelect.appendChild(option);
  });
}

function getAverageProfile(samples) {
  const totals = samples.reduce((total, sample) => ({
    averageGap: total.averageGap + sample.averageGap,
    typingSpeed: total.typingSpeed + sample.typingSpeed,
    totalDuration: total.totalDuration + sample.totalDuration
  }), { averageGap: 0, typingSpeed: 0, totalDuration: 0 });

  return {
    averageGap: totals.averageGap / samples.length,
    typingSpeed: totals.typingSpeed / samples.length,
    totalDuration: totals.totalDuration / samples.length
  };
}

function displaySavedProfileDetails() {
  const selectedName = savedProfilesSelect.value;
  const savedProfiles = getSavedProfiles();

  if (selectedName === "" || !savedProfiles[selectedName]) {
    savedProfileDetails.textContent = "";
    return;
  }

  const savedProfile = savedProfiles[selectedName];
  const averageProfile = getAverageProfile(savedProfile.samples);
  savedProfileDetails.innerHTML = `
    <p>${savedProfile.name}</p>
    <p>Training Samples: ${savedProfile.samples.length}</p>
    <h3>Average Profile</h3>
    <p>Average gap: ${averageProfile.averageGap.toFixed(3)} seconds</p>
    <p>Average typing speed: ${averageProfile.typingSpeed.toFixed(3)} keys per second</p>
    <p>Average duration: ${averageProfile.totalDuration.toFixed(3)} seconds</p>
  `;
}

// Generate and show the current session's profile metrics.
generateProfileButton.addEventListener("click", () => {
  const typingProfile = getTypingProfile();

  if (typingProfile === null) {
    profile.textContent = "No keystrokes recorded yet.";
    return;
  }

  profile.innerHTML = `
    <p>Average gap: ${typingProfile.averageGap.toFixed(3)} seconds</p>
    <p>Total typing duration: ${typingProfile.totalDuration.toFixed(3)} seconds</p>
    <p>Typing speed: ${typingProfile.typingSpeed.toFixed(3)} keys per second</p>
  `;
});

// Add the current session as a new sample for the entered user name.
saveProfileButton.addEventListener("click", () => {
  const typingProfile = getTypingProfile();

  if (typingProfile === null) {
    saveMessage.textContent = "No keystrokes recorded yet.";
    return;
  }

  const name = nameInput.value.trim();
  const savedSample = {
    averageGap: typingProfile.averageGap,
    typingSpeed: typingProfile.typingSpeed,
    totalDuration: typingProfile.totalDuration,
    savedAt: new Date().toISOString()
  };

  if (name === "") {
    saveMessage.textContent = "Please enter a name before saving.";
    return;
  }

  const savedProfiles = getSavedProfiles();
  if (!savedProfiles[name]) {
    savedProfiles[name] = { name, samples: [] };
  }

  savedProfiles[name].samples.push(savedSample);
  localStorage.setItem("typingProfiles", JSON.stringify(savedProfiles));
  updateSavedProfilesList();
  savedProfilesSelect.value = name;
  displaySavedProfileDetails();
  saveMessage.textContent = "Typing profile saved successfully.";
});

// Compare the current session with a selected user's average training profile.
compareProfileButton.addEventListener("click", () => {
  const currentProfile = getTypingProfile();
  const savedProfiles = getSavedProfiles();
  const selectedName = savedProfilesSelect.value;

  if (selectedName === "" || !savedProfiles[selectedName]) {
    comparison.textContent = "Please select a saved typing profile.";
    return;
  }

  if (currentProfile === null) {
    comparison.textContent = "No current keystrokes recorded yet.";
    return;
  }

  const savedProfile = savedProfiles[selectedName];
  const averageProfile = getAverageProfile(savedProfile.samples);
  const metrics = ["averageGap", "typingSpeed", "totalDuration"];
  const differences = metrics.map((metric) => {
    const savedValue = averageProfile[metric];
    const currentValue = currentProfile[metric];

    if (savedValue === 0) {
      return currentValue === 0 ? 0 : 1;
    }

    return Math.abs(currentValue - savedValue) / Math.abs(savedValue);
  });
  const averageDifference = differences.reduce((sum, value) => sum + value, 0) / differences.length;
  const similarity = Math.max(0, 100 * (1 - averageDifference));
  const result = similarity >= 70 ? "Likely the same user" : "Likely a different user";

  comparison.innerHTML = `
    <div>
      <h3>Saved Average Profile</h3>
      <p>Training Samples: ${savedProfile.samples.length}</p>
      <p>Average gap: ${averageProfile.averageGap.toFixed(3)} seconds</p>
      <p>Average typing speed: ${averageProfile.typingSpeed.toFixed(3)} keys per second</p>
      <p>Average duration: ${averageProfile.totalDuration.toFixed(3)} seconds</p>
    </div>
    <div>
      <h3>Current Profile</h3>
      <p>Average gap: ${currentProfile.averageGap.toFixed(3)} seconds</p>
      <p>Typing speed: ${currentProfile.typingSpeed.toFixed(3)} keys per second</p>
      <p>Total duration: ${currentProfile.totalDuration.toFixed(3)} seconds</p>
    </div>
    <div class="similarity-score">
      <h3>Similarity</h3>
      <strong>${similarity.toFixed(1)}%</strong>
      <p>${result}</p>
    </div>
  `;
});

// Refresh saved-profile details whenever a different user is selected.
savedProfilesSelect.addEventListener("change", displaySavedProfileDetails);
updateSavedProfilesList();
