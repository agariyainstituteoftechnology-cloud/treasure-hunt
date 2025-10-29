// 🎯 Treasure Hunt — Light Blue Edition
// Game ke liye constants aur variables define kar rahe hain

const imgClosed = "images/close-box.jpg";// Closed box ki image path
const imgEmpty = "images/empty-box.jpg";// Empty box ki image path
const imgTreasure = "images/win.jpg";// Treasure box ki image path

// Levels ka configuration object
const levels = {
  1: { boxes: 12, cols: 4, moves: 4, hints: 2, time: 60, name: "Easy", emoji: "🧭", hintArea: 6 }, // Level 1 easy
  2: { boxes: 24, cols: 6, moves: 6, hints: 2, time: 60, name: "Medium", emoji: "🌊", hintArea: 8 }, // Level 2 medium
  3: { boxes: 36, cols: 6, moves: 8, hints: 2, time: 60, name: "Hard", emoji: "🔥", hintArea: 10 } // Level 3 hard
};

// Game state variables
let currentLevel = 1; // Abhi ka current level
let treasureIndex = null; // Treasure ka index store karne ke liye
let moves = 0; // Player ne ab tak ki moves
let moveLimit = 0; // Max moves allowed
let timeLeft = 60; // Timer ke liye initial value
let hintsLeft = 2; // Available hints
let started = false; // Level started hai ya nahi
let timerId = null; // Interval timer ID store karne ke liye

// jQuery selectors for UI elements
const $grid = $("#grid"), // Grid container
  $levelTitle = $("#levelTitle"), // Level title element
  $levelEmoji = $("#levelEmoji"), // Level emoji element
  $levelShort = $("#levelShort"), // Short level text
  $progressFill = $("#progressFill"), // Progress bar fill element
  $timeStat = $("#timeStat"), // Timer display
  $hintBox = $("#hintBox"), // Hint display box
  $log = $("#log"), // Log messages box
  $movesCard = $("#movesCard"), // Moves card element
  $hintsCard = $("#hintsCard"), // Hints card element
  $hintBtn = $("#hintBtn"), // Hint button
  $countdown = $("#countdown"), // Countdown display
  $overlay = $("#overlay"), // Overlay element
  $overlayTitle = $("#overlayTitle"), // Overlay title element
  $overlayMsg = $("#overlayMsg"), // Overlay message element
  $overlayPrimaryBtn = $("#overlayPrimaryBtn"); // Overlay primary button

// Function: Render level badge on UI
function renderLevelBadge(lv) {
  const c = levels[lv]; // Get current level config
  $levelEmoji.text(c.emoji); // Show level emoji
  $levelTitle.text(`Level ${lv}/3 — ${c.name}`); // Update level title
  $levelShort.text(`${lv}/3`); // Update short level text
  $progressFill.css("width", `${(lv / 3) * 100}%`); // Set progress bar width
}

// Function: Create grid cells dynamically
function createGrid(cols, total) {
  $grid.empty(); // Clear existing grid
  $grid.css({ "grid-template-columns": `repeat(${cols},80px)` }); // Setup grid columns
  for (let i = 0; i < total; i++) {
    const $cell = $("<div>").addClass("cell").attr("data-i", i); // Create cell div
    const $img = $("<img>").attr("src", imgClosed).attr("alt", "chest"); // Add closed box image
    $cell.append($img); // Append image to cell
    $cell.on("click", onCellClick); // Add click listener
    $grid.append($cell); // Append cell to grid
  }
}

// Function: Show countdown before level starts
function showCountdown(cb) {
  let n = 3; // Countdown number start
  $countdown.text(n).fadeIn(120); // Show countdown
  const cd = setInterval(() => { // Start countdown interval
    n--; // Decrement number
    if (n > 0) $countdown.text(n); // Update countdown display
    else if (n === 0) {
      $countdown.text("GO"); // Show GO
      setTimeout(() => {
        clearInterval(cd); // Stop countdown interval
        $countdown.fadeOut(200); // Hide countdown
        cb(); // Call callback to start level
      }, 700);
    }
  }, 1000); // Interval 1 second
}

// Function: Prepare level before start
function prepareLevel(lv) {
  const c = levels[lv]; // Current level config
  createGrid(c.cols, c.boxes); // Create grid
  moves = 0; // Reset moves
  moveLimit = c.moves; // Set max moves
  timeLeft = c.time; // Set timer
  treasureIndex = Math.floor(Math.random() * c.boxes); // Random treasure
  started = false; // Level not started
  $hintBtn
    .prop("disabled", hintsLeft <= 0) // Disable hint if none left
    .css({
      background: hintsLeft > 0 ? "transparent" : "#888", // Button background
      color: hintsLeft > 0 ? "var(--muted)" : "#222" // Button color
    });
  $hintBox.text("Hint: —"); // Reset hint text
  $(".cell").removeClass("hint-glow").css("opacity", "1"); // Reset hint glow
  updateUI(); // Update stats
  log(`Ready — Level ${lv}/3. Press Start Level to begin.`); // Log ready message
}

// Function: Start level after countdown
function startLevel(lv) {
  const c = levels[lv]; // Get level config
  if ($grid.children().length === 0) { // If grid is empty
    createGrid(c.cols, c.boxes); // Create grid
    treasureIndex = Math.floor(Math.random() * c.boxes); // Set treasure
  }
  moves = 0; // Reset moves
  moveLimit = c.moves; // Set move limit
  timeLeft = c.time; // Reset timer
  log(`Get ready...`); // Log message
  showCountdown(() => { // Show countdown
    started = true; // Start level
    clearInterval(timerId); // Clear old timer
    timerId = setInterval(() => { // Start interval timer
      if (!started) return; // If level not started, exit
      timeLeft--; // Decrease time
      $timeStat.text(`${timeLeft}s`); // Update timer display
      if (timeLeft <= 0) { // Time over
        endRound("⏰ Time's up!", "Time Over", false, true); // End round
      }
    }, 1000); // Interval 1 sec
    updateUI(); // Update UI
    log(`🎯 Level ${lv} started! Good luck.`); // Log start
  });
}

// Function: Handle cell click
function onCellClick() {
  if (!started) return log("⚠️ Press Start Level first!"); // Level not started
  const idx = parseInt($(this).attr("data-i"), 10); // Get clicked cell index
  moves++; // Increment moves
  if (idx === treasureIndex) { // Treasure found
    $(this).find("img").attr("src", imgTreasure); // Show treasure image
    endRound(`🏆 You found the treasure in ${moves} moves!`, "Congratulations", true); // Win round
  } else {
    $(this).find("img").attr("src", imgEmpty); // Show empty image
    log(`❌ Empty chest.`); // Log empty
    if (moves >= moveLimit) endRound("❌ No moves left!", "Game Over", false, true); // No moves left
  }
  updateUI(); // Update stats
}

// Function: Use hint
function useHint() {
  if (!started) return log("⚠️ Start the level first!"); // Level not started
  if (hintsLeft <= 0) return log("🚫 No hints left!"); // No hints
  hintsLeft--; // Decrement hints
  const c = levels[currentLevel], total = c.boxes, cols = c.cols, hintCountDesired = c.hintArea; // Level config
  const tr = Math.floor(treasureIndex / cols), tc = treasureIndex % cols; // Treasure row & column
  const indices = []; // Array for hint cells
  for (let dist = 0; indices.length < hintCountDesired && dist <= Math.max(cols, Math.ceil(total / cols)); dist++) {
    for (let r = 0; r < Math.ceil(total / cols); r++) {
      for (let cc = 0; cc < cols; cc++) {
        const i = r * cols + cc; // Current cell index
        if (i >= total) continue; // Skip if out of bounds
        const man = Math.abs(r - tr) + Math.abs(cc - tc); // Manhattan distance
        if (man === dist) indices.push(i); // Add to hint indices
        if (indices.length >= hintCountDesired) break; // Stop if enough hints
      }
      if (indices.length >= hintCountDesired) break; // Stop if enough hints
    }
  }
  $(".cell").removeClass("hint-glow").css("opacity", "0.4"); // Reset all glow
  indices.slice(0, hintCountDesired).forEach(i => {
    $(`[data-i='${i}']`).addClass("hint-glow").css("opacity", "1"); // Glow hint cells
  });
  $hintBox.text("💡 Hint: Treasure is near glowing chests."); // Hint text
  log("💡 Hint used!"); // Log
  if (hintsLeft <= 0) $hintBtn.prop("disabled", true).css({ background: "#888", color: "#222" }); // Disable button
  updateUI(); // Update stats
}

// Function: End round and show overlay
function endRound(msg, title, isWin = false, fail = false) {
  clearInterval(timerId); // Stop timer
  started = false; // Stop level
  if (isWin && currentLevel === 3) { // Final win
    showFinalWin(); // Show final screen
    return;
  }
  $overlayTitle.text(title || "Game Over"); // Overlay title
  $overlayMsg.text(msg || ""); // Overlay message
  if (isWin) { // Win logic
    if (currentLevel < 3) $overlayPrimaryBtn.text("Next Level");
    else $overlayPrimaryBtn.text("Play Again");
  } else if (fail) { // Fail logic
    $overlayPrimaryBtn.text("Restart Game");
  } else {
    $overlayPrimaryBtn.text("Restart Game"); // Default
  }
  $overlay.fadeIn(240).css("display", "flex"); // Show overlay
}

// Function: Show final win screen
function showFinalWin() {
  $("#finalWin").fadeIn(400).css("display", "flex"); // Show final win
  for (let i = 0; i < 80; i++) { // Generate confetti
    const c = document.createElement("div");
    c.className = "confetti"; // Add confetti class
    c.style.left = Math.random() * 100 + "%"; // Random left
    c.style.background = `hsl(${Math.random() * 360},100%,60%)`; // Random color
    c.style.animationDelay = Math.random() * 2 + "s"; // Random delay
    document.body.appendChild(c); // Append to body
    setTimeout(() => c.remove(), 4000); // Remove after 4s
  }
  window.location.href = "winner.html"; // Redirect to winner page
}

// Function: Next level or restart
function goToNextLevelOrRestart() {
  $overlay.fadeOut(240); // Hide overlay
  if ($overlayPrimaryBtn.text() === "Next Level") { // If next level
    currentLevel++; // Increment level
    renderLevelBadge(currentLevel); // Render badge
    prepareLevel(currentLevel); // Prepare level
  } else if ($overlayPrimaryBtn.text() === "Play Again" || $overlayPrimaryBtn.text() === "Restart Game") { // Restart
    currentLevel = 1; // Reset level
    hintsLeft = 2; // Reset hints
    renderLevelBadge(currentLevel); // Render badge
    prepareLevel(currentLevel); // Prepare level
  }
}

// Function: Reset game
function resetGame() {
  prepareLevel(currentLevel); // Re-prepare current level
}

// Function: Update stats UI
function updateUI() {
  const c = levels[currentLevel]; // Current level
  $movesCard.text(`${moves}/${moveLimit}`); // Show moves
  $timeStat.text(`${timeLeft}s`); // Show timer
  $hintsCard.text(hintsLeft); // Show hints
}

// Function: Log messages
function log(txt) {
  $log.html(txt); // Show message
}

// --- BUTTON ACTIONS ---
$("#enterBtn").on("click", () => { // Enter button
  $("#welcome-screen").fadeOut(300, () => { // Fade out welcome
    $("#game-container").fadeIn(400); // Show game container
    renderLevelBadge(currentLevel); // Show badge
    prepareLevel(currentLevel); // Prepare level
  });
});
$("#startBtn").on("click", () => startLevel(currentLevel)); // Start level button
$("#hintBtn").on("click", useHint); // Hint button
$("#revealBtn").on("click", () => { // Reveal treasure button
  $(".cell").eq(treasureIndex).find("img").attr("src", imgTreasure); // Show treasure
  endRound("💥 You revealed the treasure! Game Over", "Game Over", false, true); // End game
});
$("#resetBtn").on("click", resetGame); // Reset button
$overlayPrimaryBtn.on("click", goToNextLevelOrRestart); // Overlay button
$("#playAgainBtn").on("click", () => { // Play again final
  $("#finalWin").fadeOut(400); // Hide final win
  currentLevel = 1; // Reset level
  hintsLeft = 2; // Reset hints
  renderLevelBadge(currentLevel); // Render badge
  prepareLevel(currentLevel); // Prepare first level
});