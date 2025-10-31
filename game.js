// 🎯 Treasure Hunt — Short + Full Comments

// 🔹 Images — Game me use hone wali images
const img = { 
  closed: "images/close-box.jpg", // Band treasure chest ki image
  empty: "images/empty-box.jpg",  // Khaali chest ki image
  treasure: "images/win.jpg"      // Treasure chest ki image
};

// 🔹 Levels — Game ke different levels ka configuration
const levels = {
  1: { boxes: 12, cols: 4, moves: 4, hints: 2, time: 60, name: "Easy", emoji: "🧭", hintArea: 6 }, // Easy level
  2: { boxes: 24, cols: 6, moves: 6, hints: 2, time: 60, name: "Medium", emoji: "🌊", hintArea: 8 }, // Medium level
  3: { boxes: 36, cols: 6, moves: 8, hints: 2, time: 60, name: "Hard", emoji: "🔥", hintArea: 10 } // Hard level
};

// 🔹 State variables — Game ki current state track karne ke liye
let currentLevel = 1,              // Abhi ka current level
    treasureIndex = null,          // Treasure ka random index
    moves = 0,                     // Kitni moves already ho chuki
    moveLimit = 0,                 // Maximum allowed moves
    timeLeft = 60,                 // Bacha hua time (seconds me)
    hintsLeft = 2,                 // Bachi hui hints
    started = false,               // Level start hua ya nahi
    timerId = null;                // Timer ka interval ID

// 🔹 jQuery elements — DOM elements ko shortcuts me store karna
const $grid = $("#grid"),                // Grid container jahan chests dikhaye jayenge
      $levelTitle = $("#levelTitle"),    // Level title element
      $levelEmoji = $("#levelEmoji"),    // Level emoji element
      $levelShort = $("#levelShort"),    // Short level number
      $progressFill = $("#progressFill"),// Progress bar fill element
      $timeStat = $("#timeStat"),        // Timer display
      $hintBox = $("#hintBox"),          // Hint text box
      $log = $("#log"),                  // Game log display
      $movesCard = $("#movesCard"),      // Moves counter
      $hintsCard = $("#hintsCard"),      // Hints counter
      $hintBtn = $("#hintBtn"),          // Hint button
      $countdown = $("#countdown"),      // Countdown display
      $overlay = $("#overlay"),          // Overlay (win/lose)
      $overlayTitle = $("#overlayTitle"),// Overlay title text
      $overlayMsg = $("#overlayMsg"),    // Overlay message text
      $overlayPrimaryBtn = $("#overlayPrimaryBtn"); // Overlay main button

// 🔹 Log function — Game log me text update karna
const log = txt => $log.html(txt); // txt ko $log me show kar do

// 🔹 Update UI — Moves, time aur hints update karna
const updateUI = () => { 
  $movesCard.text(`${moves}/${moveLimit}`); // Moves counter update
  $timeStat.text(`${timeLeft}s`);           // Timer display update
  $hintsCard.text(hintsLeft);              // Hints counter update
};

// 🔹 Render level badge — Level info dikhana
const renderLevelBadge = lv => {
  const c = levels[lv];                     // Current level config
  $levelEmoji.text(c.emoji);               // Level emoji update
  $levelTitle.text(`Level ${lv}/3 — ${c.name}`); // Full level title update
  $levelShort.text(`${lv}/3`);             // Short level number update
  $progressFill.css("width", `${(lv / 3) * 100}%`); // Progress bar fill percentage
};

// 🔹 Create grid — Grid cells create karna
const createGrid = (cols, total) => {
  $grid.empty().css("grid-template-columns", `repeat(${cols},80px)`); // Purani grid clear aur columns set
  for (let i = 0; i < total; i++)                                   // Har cell ke liye loop
    $("<div>", { class: "cell", "data-i": i })                      // Cell div create
      .append($("<img>", { src: img.closed, alt: "chest" }))       // Closed chest image add
      .on("click", onCellClick)                                     // Click handler attach
      .appendTo($grid);                                             // Grid me add
};

// 🔹 Countdown — Level start hone se pehle 3...2...1
const showCountdown = cb => {
  let n = 3;                          // Countdown start number
  $countdown.text(n).show();          // Initial number show
  const cd = setInterval(() => 
    n > 1 ? $countdown.text(--n)      // Decrement number
          : ($countdown.text("GO"),   // 0 pe GO show
             setTimeout(() => { $countdown.hide(); clearInterval(cd); cb(); }, 700)
            ), 1000);
};

// 🔹 Prepare level — Level start se pehle setup
const prepareLevel = lv => {
  const c = levels[lv];               // Level config
  createGrid(c.cols, c.boxes);        // Grid create
  moves = 0; moveLimit = c.moves; timeLeft = c.time; // Moves & time reset
  treasureIndex = Math.floor(Math.random() * c.boxes); // Random treasure
  started = false;                     // Level not started
  $hintBtn.prop("disabled", hintsLeft <= 0)            // Hint button enable/disable
          .css({ background: hintsLeft > 0 ? "transparent" : "#888", color: hintsLeft > 0 ? "var(--muted)" : "#222" });
  $hintBox.text("Hint: —");           // Hint text reset
  $(".cell").removeClass("hint-glow").css("opacity", "1"); // Purani glow remove
  updateUI();                          // UI update
  log(`Ready — Level ${lv}/3. Press Start Level to begin.`); // Log ready message
};

// 🔹 Start level — Level start karna
const startLevel = lv => {
  if (started) return;                 // Agar already started to return
  moves = 0; moveLimit = levels[lv].moves; timeLeft = levels[lv].time; // Reset moves/time
  treasureIndex = Math.floor(Math.random() * levels[lv].boxes);       // Random treasure
  log("Get ready...");                 // Log message
  showCountdown(() => {                // Countdown ke baad
    started = true; clearInterval(timerId); // Start level & clear previous timer
    timerId = setInterval(() => { 
      if (!started) return;           // Agar stop ho gya to return
      if (--timeLeft <= 0) endRound("⏰ Time's up!", "Time Over", false, true); // Time over check
      $timeStat.text(`${timeLeft}s`); // Timer update
    }, 1000);
    updateUI();                        // UI update
    log(`🎯 Level ${lv} started! Good luck.`); // Log start
  });
};

// 🔹 Cell click handler — User ne cell click kiya
function onCellClick() {
  if (!started) return log("⚠️ Press Start Level first!"); // Agar level start nahi hua
  const idx = parseInt($(this).data("i"), 10); // Cell index
  moves++;                                      // Moves increment
  const $img = $(this).find("img");           // Image element
  if (idx === treasureIndex) {                 // Treasure mile
    $img.attr("src", img.treasure);           // Treasure image show
    setTimeout(() => endRound(`🏆 You found the treasure in ${moves} moves!`, "Congratulations", true), 700);
  } else {                                    // Empty chest
    $img.attr("src", img.empty);              // Empty image show
    log("❌ Empty chest.");                    // Log
    if (moves >= moveLimit) endRound("❌ No moves left!", "Game Over", false, true); // Moves over
  }
  updateUI();                                 // UI update
}

// 🔹 Use hint — Hint ka use karna
const useHint = () => {
  if (!started) return log("⚠️ Start the level first!"); // Level start check
  if (hintsLeft <= 0) return log("🚫 No hints left!");     // Hints left check
  hintsLeft--;                                           // Hint decrement
  const c = levels[currentLevel], total = c.boxes, cols = c.cols, hintCount = c.hintArea,
        tr = Math.floor(treasureIndex / cols), tc = treasureIndex % cols, indices = []; // Treasure pos
  for (let d = 0; indices.length < hintCount && d <= Math.max(cols, Math.ceil(total / cols)); d++)
    for (let r = 0; r < Math.ceil(total / cols); r++)
      for (let cc = 0; cc < cols; cc++) {
        const i = r * cols + cc; if (i >= total) continue; // Bounds check
        if (Math.abs(r - tr) + Math.abs(cc - tc) === d) indices.push(i); // Nearby cells
        if (indices.length >= hintCount) break;
      }
  $(".cell").removeClass("hint-glow").css("opacity", "0.4"); // Purani glow remove
  indices.slice(0, hintCount).forEach(i => $grid.find(`[data-i='${i}']`).addClass("hint-glow").css("opacity", "1")); // Glow add
  $hintBox.text("💡 Hint: Treasure is near glowing chests."); // Hint message
  log("💡 Hint used!");                                  // Log
  if (hintsLeft <= 0) $hintBtn.prop("disabled", true);  // Disable button if none
  updateUI();                                            // UI update
};

// 🔹 End round — Round win/lose
const endRound = (msg, title, isWin = false, fail = false) => {
  clearInterval(timerId); started = false;            // Stop timer & mark not started
  if (isWin && currentLevel === 3) { showFinalWin(); return; } // Final win check
  $overlayTitle.text(title || "Game Over");          // Overlay title
  $overlayMsg.text(msg || "");                       // Overlay message
  $overlayPrimaryBtn.text(isWin ? (currentLevel < 3 ? "Next Level" : "Play Again") : fail ? "Restart Game" : "Restart Game"); // Button text
  $overlay.show();                                    // Show overlay
};

// 🔹 Final win — Game complete
const showFinalWin = () => {
  $("#finalWin").show();                              // Show final screen
  for (let i = 0; i < 80; i++)
    $("<div>").addClass("confetti").css({ left: `${Math.random() * 100}%`, background: `hsl(${Math.random() * 360},100%,60%)`, animationDelay: `${Math.random() * 2}s` }).appendTo("body"); // Confetti add
  setTimeout(() => $(".confetti").remove(), 4000);   // Remove confetti
  window.location.href = "winner.html";              // Redirect
};

// 🔹 Next level or restart — Overlay button
const goToNextLevelOrRestart = () => {
  $overlay.hide(); const t = $overlayPrimaryBtn.text(); // Button text check
  if (t === "Next Level") { 
    currentLevel++; renderLevelBadge(currentLevel); prepareLevel(currentLevel); // Next level
  } else { 
    currentLevel = 1; hintsLeft = 2; renderLevelBadge(currentLevel); prepareLevel(currentLevel); // Restart
  }
};

// 🔹 Reset level
const resetGame = () => prepareLevel(currentLevel); // Reset current level

// 🔹 Button events
$("#enterBtn").click(() => { $("#welcome-screen").hide(); $("#game-container").show(); renderLevelBadge(currentLevel); prepareLevel(currentLevel); }); // Enter
$("#startBtn").click(() => startLevel(currentLevel)); // Start level
$hintBtn.click(useHint);                              // Hint
$("#revealBtn").click(() => { $(".cell").eq(treasureIndex).find("img").attr("src", img.treasure); setTimeout(() => endRound("💥 You revealed the treasure! Game Over", "Game Over", false, true), 500); }); // Reveal
$("#resetBtn").click(resetGame);                      // Reset button
$overlayPrimaryBtn.click(goToNextLevelOrRestart);     // Overlay primary
$("#playAgainBtn").click(() => { $("#finalWin").hide(); currentLevel = 1; hintsLeft = 2; renderLevelBadge(currentLevel); prepareLevel(currentLevel); }); // Play again
