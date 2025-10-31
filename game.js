// 🎯 Treasure Hunt — Easy Version

// 🔹 Images
const img = { closed: "images/close-box.jpg", empty: "images/empty-box.jpg", treasure: "images/win.jpg" };

// 🔹 Levels
const levels = {
  1: { boxes: 12, cols: 4, moves: 4, hints: 2, time: 60, name: "Easy", emoji: "🧭", hintArea: 6 },
  2: { boxes: 24, cols: 6, moves: 6, hints: 2, time: 60, name: "Medium", emoji: "🌊", hintArea: 8 },
  3: { boxes: 36, cols: 6, moves: 8, hints: 2, time: 60, name: "Hard", emoji: "🔥", hintArea: 10 }
};

// 🔹 State
let currentLevel = 1, treasureIndex, moves, moveLimit, timeLeft, hintsLeft = 2, started = false, timerId;

// 🔹 DOM
const $grid = $("#grid"), $levelTitle = $("#levelTitle"), $levelEmoji = $("#levelEmoji"),
      $levelShort = $("#levelShort"), $progressFill = $("#progressFill"), $timeStat = $("#timeStat"),
      $hintBox = $("#hintBox"), $log = $("#log"), $movesCard = $("#movesCard"), $hintsCard = $("#hintsCard"),
      $hintBtn = $("#hintBtn"), $countdown = $("#countdown"), $overlay = $("#overlay"),
      $overlayTitle = $("#overlayTitle"), $overlayMsg = $("#overlayMsg"), $overlayPrimaryBtn = $("#overlayPrimaryBtn");

// 🔹 Helpers
const log = txt => $log.html(txt);
const updateUI = () => { $movesCard.text(`${moves}/${moveLimit}`); $timeStat.text(`${timeLeft}s`); $hintsCard.text(hintsLeft); };
const renderLevelBadge = lv => {
  const c = levels[lv];
  $levelEmoji.text(c.emoji); $levelTitle.text(`Level ${lv}/3 — ${c.name}`);
  $levelShort.text(`${lv}/3`); $progressFill.css("width", `${(lv/3)*100}%`);
};

// 🔹 Grid
function createGrid(cols, total){
  $grid.empty().css("grid-template-columns", `repeat(${cols},80px)`);
  for(let i=0;i<total;i++)
    $grid.append($("<div>", {class:"cell","data-i":i}).append($("<img>",{src:img.closed,alt:"chest"})).on("click",onCellClick));
}

// 🔹 Countdown
function showCountdown(cb){
  let n=3; $countdown.text(n).show();
  const cd = setInterval(()=>{
    if(--n>0) $countdown.text(n);
    else{ $countdown.text("GO"); setTimeout(()=>{clearInterval(cd);$countdown.hide();cb();},700);}
  },1000);
}

// 🔹 Prepare Level
function prepareLevel(lv){
  const c=levels[lv];
  createGrid(c.cols,c.boxes);
  moves=0; moveLimit=c.moves; timeLeft=c.time;
  treasureIndex=Math.floor(Math.random()*c.boxes);
  started=false;
  $hintBtn.prop("disabled",hintsLeft<=0).css({background:hintsLeft>0?"transparent":"#888",color:hintsLeft>0?"var(--muted)":"#222"});
  $hintBox.text("Hint: —"); $(".cell").removeClass("hint-glow").css("opacity","1");
  updateUI(); log(`Ready — Level ${lv}/3. Press Start Level to begin.`);
}

// 🔹 Start Level
function startLevel(lv){
  if(started) return;
  moves=0; moveLimit=levels[lv].moves; timeLeft=levels[lv].time;
  treasureIndex=Math.floor(Math.random()*levels[lv].boxes); log("Get ready…");
  showCountdown(()=>{
    started=true; clearInterval(timerId);
    timerId=setInterval(()=>{
      if(!started) return;
      timeLeft--; $timeStat.text(`${timeLeft}s`);
      if(timeLeft<=0) endRound("⏰ Time's up!","Time Over",false,true);
    },1000);
    updateUI(); log(`🎯 Level ${lv} started! Good luck.`);
  });
}

// 🔹 Cell Click
function onCellClick(){
  if(!started) return log("⚠ Press Start Level first!");
  const idx=parseInt($(this).data("i"),10), $img=$(this).find("img");
  moves++;
  if(idx===treasureIndex) $img.attr("src",img.treasure), setTimeout(()=>endRound(`🏆 You found the treasure in ${moves} moves!`,"Congratulations",true),700);
  else $img.attr("src",img.empty), log("❌ Empty chest."), moves>=moveLimit&&endRound("❌ No moves left!","Game Over",false,true);
  updateUI();
}

// 🔹 Use Hint
function useHint(){
  if(!started) return log("⚠ Start the level first!");
  if(hintsLeft<=0) return log("🚫 No hints left!"); hintsLeft--;
  const c=levels[currentLevel], total=c.boxes, cols=c.cols, hintCount=c.hintArea;
  const tr=Math.floor(treasureIndex/cols), tc=treasureIndex%cols, indices=[];
  for(let d=0;indices.length<hintCount&&d<=Math.max(cols,Math.ceil(total/cols));d++)
    for(let r=0;r<Math.ceil(total/cols);r++)
      for(let cc=0;cc<cols;cc++){
        const i=r*cols+cc; if(i>=total) continue;
        if(Math.abs(r-tr)+Math.abs(cc-tc)===d) indices.push(i);
        if(indices.length>=hintCount) break;
      }
  $(".cell").removeClass("hint-glow").css("opacity","0.4");
  indices.slice(0,hintCount).forEach(i=>$grid.find(`[data-i='${i}']`).addClass("hint-glow").css("opacity","1"));
  $hintBox.text("💡 Hint: Treasure is near glowing chests."); log("💡 Hint used!");
  if(hintsLeft<=0) $hintBtn.prop("disabled",true); updateUI();
}

// 🔹 End Round
function endRound(msg,title,isWin=false,fail=false){
  clearInterval(timerId); started=false;
  if(isWin&&currentLevel===3) return showFinalWin();
  $overlayTitle.text(title||"Game Over"); $overlayMsg.text(msg||"");
  $overlayPrimaryBtn.text(isWin?(currentLevel<3?"Next Level":"Play Again"):fail?"Restart Game":"Restart Game");
  $overlay.show();
}

// 🔹 Final Win
function showFinalWin(){
  $("#finalWin").show();
  for(let i=0;i<80;i++)
    $("<div>").addClass("confetti").css({left:`${Math.random()*100}%`,background:`hsl(${Math.random()*360},100%,60%)`,animationDelay:`${Math.random()*2}s`})
      .appendTo("body").delay(4000).queue(next=>{$(this).remove();next();});
  window.location.href="winner.html";
}

// 🔹 Next Level / Restart
function goToNextLevelOrRestart(){
  $overlay.hide();
  const t=$overlayPrimaryBtn.text();
  if(t==="Next Level"){ currentLevel++; renderLevelBadge(currentLevel); prepareLevel(currentLevel);}
  else{ currentLevel=1; hintsLeft=2; renderLevelBadge(currentLevel); prepareLevel(currentLevel);}
}
function resetGame(){ prepareLevel(currentLevel); }

// 🔹 Buttons
$("#enterBtn").on("click",()=>{ $("#welcome-screen").hide(); $("#game-container").show(); renderLevelBadge(currentLevel); prepareLevel(currentLevel);});
$("#startBtn").on("click",()=>startLevel(currentLevel));
$hintBtn.on("click",useHint);
$("#revealBtn").on("click",()=>{$(".cell").eq(treasureIndex).find("img").attr("src",img.treasure); setTimeout(()=>endRound("💥 You revealed the treasure! Game Over","Game Over",false,true),500);});
$("#resetBtn").on("click",resetGame);
$overlayPrimaryBtn.on("click",goToNextLevelOrRestart);
$("#playAgainBtn").on("click",()=>{ $("#finalWin").hide(); currentLevel=1; hintsLeft=2; renderLevelBadge(currentLevel); prepareLevel(currentLevel); });
