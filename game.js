// 🎯 Treasure Hunt — Short & Easy Version

// 🔹 Images & Levels
const img = { closed:"images/close-box.jpg", empty:"images/empty-box.jpg", treasure:"images/win.jpg" };
const levels = {
  1:{boxes:12,cols:4,moves:4,hints:2,time:60,name:"Easy",emoji:"🧭",hintArea:6},
  2:{boxes:24,cols:6,moves:6,hints:2,time:60,name:"Medium",emoji:"🌊",hintArea:8},
  3:{boxes:36,cols:6,moves:8,hints:2,time:60,name:"Hard",emoji:"🔥",hintArea:10}
};

// 🔹 State & DOM
let level=1, treasure, moves, moveLimit, timeLeft, hints=2, started=false, timer;
const $grid=$("#grid"), $levelTitle=$("#levelTitle"), $levelEmoji=$("#levelEmoji"),
      $levelShort=$("#levelShort"), $progress=$("#progressFill"), $time=$("#timeStat"),
      $moves=$("#movesCard"), $hints=$("#hintsCard"), $hintBtn=$("#hintBtn"), 
      $hintBox=$("#hintBox"), $log=$("#log"), $count=$("#countdown"),
      $overlay=$("#overlay"), $oTitle=$("#overlayTitle"), $oMsg=$("#overlayMsg"), 
      $oBtn=$("#overlayPrimaryBtn");

// 🔹 Helpers
const log = txt => $log.html(txt);
const updateUI = () => { $moves.text(`${moves}/${moveLimit}`); $time.text(`${timeLeft}s`); $hints.text(hints); };
const renderBadge = lv => {
  const l=levels[lv];
  $levelEmoji.text(l.emoji); $levelTitle.text(`Level ${lv}/3 — ${l.name}`);
  $levelShort.text(`${lv}/3`); $progress.css("width",`${(lv/3)*100}%`);
};

// 🔹 Grid
function createGrid(cols,total){
  $grid.empty().css("grid-template-columns",`repeat(${cols},80px)`);
  for(let i=0;i<total;i++){
    $("<div>",{class:"cell","data-i":i}).append($("<img>",{src:img.closed,alt:"chest"}))
    .on("click",cellClick).appendTo($grid);
  }
}

// 🔹 Countdown
function startCountdown(cb){
  let n=3; $count.text(n).show();
  const c=setInterval(()=>{
    if(--n>0) $count.text(n);
    else { $count.text("GO"); setTimeout(()=>{clearInterval(c); $count.hide(); cb();},700);}
  },1000);
}

// 🔹 Prepare Level
function prepareLevel(lv){
  const l=levels[lv];
  createGrid(l.cols,l.boxes);
  moves=0; moveLimit=l.moves; timeLeft=l.time;
  treasure=Math.floor(Math.random()*l.boxes); started=false;
  $hintBtn.prop("disabled",hints<=0).css({background:hints>0?"transparent":"#888",color:hints>0?"var(--muted)":"#222"});
  $hintBox.text("Hint: —"); $(".cell").removeClass("hint-glow").css("opacity","1");
  updateUI(); log(`Ready — Level ${lv}/3. Press Start Level to begin.`);
}

// 🔹 Start Level
function startLevel(){
  if(started) return;
  const l=levels[level]; moves=0; moveLimit=l.moves; timeLeft=l.time;
  treasure=Math.floor(Math.random()*l.boxes); log("Get ready…");
  startCountdown(()=>{
    started=true; clearInterval(timer);
    timer=setInterval(()=>{
      if(!started) return; timeLeft--; $time.text(`${timeLeft}s`);
      if(timeLeft<=0) endRound("⏰ Time's up!","Time Over",false,true);
    },1000);
    updateUI(); log(`🎯 Level ${level} started! Good luck.`);
  });
}

// 🔹 Cell Click
function cellClick(){
  if(!started) return log("⚠ Press Start Level first!");
  const idx=parseInt($(this).data("i"));
  moves++; const $img=$(this).find("img");
  if(idx===treasure) $img.attr("src",img.treasure), setTimeout(()=>endRound(`🏆 You found the treasure in ${moves} moves!`,"Congratulations",true),700);
  else $img.attr("src",img.empty), log("❌ Empty chest."), moves>=moveLimit&&endRound("❌ No moves left!","Game Over",false,true);
  updateUI();
}

// 🔹 Use Hint
function useHint(){
  if(!started) return log("⚠ Start level first!"); if(hints<=0) return log("🚫 No hints left!");
  hints--; const l=levels[level], cols=l.cols, hintCount=l.hintArea;
  const tr=Math.floor(treasure/cols), tc=treasure%cols, indices=[];
  for(let d=0;indices.length<hintCount&&d<=Math.max(cols,Math.ceil(l.boxes/cols));d++)
    for(let r=0;r<Math.ceil(l.boxes/cols);r++)
      for(let c=0;c<cols;c++){
        const i=r*cols+c; if(i>=l.boxes) continue;
        if(Math.abs(r-tr)+Math.abs(c-tc)===d) indices.push(i); if(indices.length>=hintCount) break;
      }
  $(".cell").removeClass("hint-glow").css("opacity","0.4");
  indices.slice(0,hintCount).forEach(i=>$grid.find(`[data-i='${i}']`).addClass("hint-glow").css("opacity","1"));
  $hintBox.text("💡 Treasure near glowing chests"); log("💡 Hint used!"); if(hints<=0) $hintBtn.prop("disabled",true);
  updateUI();
}

// 🔹 End Round
function endRound(msg,title,win=false,fail=false){
  clearInterval(timer); started=false;
  if(win&&level===3) return showWin();
  $oTitle.text(title||"Game Over"); $oMsg.text(msg||"");
  $oBtn.text(win?(level<3?"Next Level":"Play Again"):fail?"Restart Game":"Restart Game");
  $overlay.show();
}

// 🔹 Final Win
function showWin(){
  $("#finalWin").show();
  for(let i=0;i<80;i++) $("<div>").addClass("confetti").css({left:`${Math.random()*100}%`,background:`hsl(${Math.random()*360},100%,60%)`,animationDelay:`${Math.random()*2}s`}).appendTo("body").delay(4000).queue(next=>{$(this).remove();next();});
  window.location.href="winner.html";
}

// 🔹 Next / Restart
function nextOrRestart(){
  $overlay.hide();
  if($oBtn.text()==="Next Level") level++; else level=1,hints=2;
  renderBadge(level); prepareLevel(level);
}

// 🔹 Buttons
$("#enterBtn").on("click",()=>{$("#welcome-screen").hide(); $("#game-container").show(); renderBadge(level); prepareLevel(level);});
$("#startBtn").on("click",startLevel);
$hintBtn.on("click",useHint);
$("#revealBtn").on("click",()=>{$(".cell").eq(treasure).find("img").attr("src",img.treasure); setTimeout(()=>endRound("💥 You revealed the treasure!","Game Over",false,true),500);});
$("#resetBtn").on("click",()=>prepareLevel(level));
$oBtn.on("click",nextOrRestart);
$("#playAgainBtn").on("click",()=>{ $("#finalWin").hide(); level=1; hints=2; renderBadge(level); prepareLevel(level); });
