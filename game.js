// 🎯 Treasure Hunt — Light Blue Edition (jQuery Version, Output Same)

// 🔹 Game me istemal hone wali images
const img = { 
    closed: "images/close-box.jpg",
    empty: "images/empty-box.jpg",
    treasure: "images/win.jpg"
};

// 🔹 Levels ka configuration
const levels = {
    1: { boxes: 12, cols: 4, moves: 4, hints: 2, time: 60, name: "Easy", emoji: "🧭", hintArea: 6 },
    2: { boxes: 24, cols: 6, moves: 6, hints: 2, time: 60, name: "Medium", emoji: "🌊", hintArea: 8 },
    3: { boxes: 36, cols: 6, moves: 8, hints: 2, time: 60, name: "Hard", emoji: "🔥", hintArea: 10 }
};

// 🔹 Game ki current state
let currentLevel = 1,
    treasureIndex = null,
    moves = 0,
    moveLimit = 0,
    timeLeft = 60,
    hintsLeft = 2,
    started = false,
    timerId = null;

// 🔹 jQuery shortcuts
const $grid = $("#grid"),
      $levelTitle = $("#levelTitle"),
      $levelEmoji = $("#levelEmoji"),
      $levelShort = $("#levelShort"),
      $progressFill = $("#progressFill"),
      $timeStat = $("#timeStat"),
      $hintBox = $("#hintBox"),
      $log = $("#log"),
      $movesCard = $("#movesCard"),
      $hintsCard = $("#hintsCard"),
      $hintBtn = $("#hintBtn"),
      $countdown = $("#countdown"),
      $overlay = $("#overlay"),
      $overlayTitle = $("#overlayTitle"),
      $overlayMsg = $("#overlayMsg"),
      $overlayPrimaryBtn = $("#overlayPrimaryBtn");

// 🔹 Log update
const log = txt => $log.html(txt);

// 🔹 UI update
const updateUI = () => {
    $movesCard.text(`${moves}/${moveLimit}`);
    $timeStat.text(`${timeLeft}s`);
    $hintsCard.text(hintsLeft);
};

// 🔹 Level Badge
function renderLevelBadge(lv){
    const c = levels[lv];
    $levelEmoji.text(c.emoji);
    $levelTitle.text(`Level ${lv}/3 — ${c.name}`);
    $levelShort.text(`${lv}/3`);
    $progressFill.css("width",`${(lv/3)*100}%`);
}

// 🔹 Grid
function createGrid(cols, total){
    $grid.empty();
    $grid.css("grid-template-columns",`repeat(${cols},80px)`);
    for(let i=0;i<total;i++){
        const $cell = $("<div>",{class:"cell","data-i":i});
        const $img = $("<img>",{src:img.closed, alt:"chest"});
        $cell.append($img);
        $cell.on("click", onCellClick);
        $grid.append($cell);
    }
}

// 🔹 Countdown
function showCountdown(cb){
    let n=3;
    $countdown.text(n).show();
    const cd = setInterval(()=>{
        n--;
        if(n>0) $countdown.text(n);
        else{
            $countdown.text("GO");
            setTimeout(()=>{
                clearInterval(cd);
                $countdown.hide();
                cb();
            },700);
        }
    },1000);
}

// 🔹 Prepare Level
function prepareLevel(lv){
    const c = levels[lv];
    createGrid(c.cols,c.boxes);
    moves=0; moveLimit=c.moves; timeLeft=c.time;
    treasureIndex=Math.floor(Math.random()*c.boxes);
    started = false;

    $hintBtn.prop("disabled",hintsLeft<=0)
        .css({background:hintsLeft>0?"transparent":"#888", color:hintsLeft>0?"var(--muted)":"#222"});

    $hintBox.text("Hint: —");
    $(".cell").removeClass("hint-glow").css("opacity","1");
    updateUI();
    log(`Ready — Level ${lv}/3. Press Start Level to begin.`);
}

// 🔹 Start Level
function startLevel(){
    if(!started){
        const c=levels[currentLevel];
        moves=0; moveLimit=c.moves; timeLeft=c.time;
        treasureIndex=Math.floor(Math.random()*c.boxes);
        log("Get ready...");
        showCountdown(()=>{
            started=true;
            clearInterval(timerId);
            timerId = setInterval(()=>{
                if(!started) return;
                timeLeft--;
                $timeStat.text(`${timeLeft}s`);
                if(timeLeft<=0) endRound("⏰ Time's up!","Time Over",false,true);
            },1000);
            updateUI();
            log(`🎯 Level ${currentLevel} started! Good luck.`);
        });
    }
}

// 🔹 Cell Click
function onCellClick(){
    if(!started) return log("⚠ Press Start Level first!");
    const idx = parseInt($(this).data("i"),10);
    moves++;
    const $img = $(this).find("img");

    if(idx===treasureIndex){
        $img.attr("src",img.treasure);
        setTimeout(()=>endRound(`🏆 You found the treasure in ${moves} moves!`,"Congratulations",true),700);
    } else {
        $img.attr("src",img.empty);
        log("❌ Empty chest.");
        if(moves>=moveLimit) endRound("❌ No moves left!","Game Over",false,true);
    }
    updateUI();
}

// 🔹 Hint
function useHint(){
    if(!started) return log("⚠ Start the level first!");
    if(hintsLeft<=0) return log("🚫 No hints left!");

    hintsLeft--;

    const c=levels[currentLevel], total=c.boxes, cols=c.cols, hintCount=c.hintArea;
    const tr=Math.floor(treasureIndex/cols), tc=treasureIndex%cols, indices=[];
    for(let d=0; indices.length<hintCount && d<=Math.max(cols,Math.ceil(total/cols)); d++)
        for(let r=0;r<Math.ceil(total/cols);r++)
            for(let cc=0;cc<cols;cc++){
                const i=r*cols+cc;
                if(i>=total) continue;
                if(Math.abs(r-tr)+Math.abs(cc-tc)===d) indices.push(i);
                if(indices.length>=hintCount) break;
            }

    $(".cell").removeClass("hint-glow").css("opacity","0.4");
    indices.slice(0,hintCount).forEach(i=>{
        $grid.find(`[data-i='${i}']`).addClass("hint-glow").css("opacity","1");
    });

    $hintBox.text("💡 Hint used!");
    log("💡 Treasure near glowing chests");
    if(hintsLeft<=0) $hintBtn.prop("disabled",true);
    updateUI();
}

// 🔹 End Round (✅ CENTER FIX ADDED)
function endRound(msg,title,isWin=false,fail=false){
    clearInterval(timerId);
    started=false;

    if(isWin && currentLevel===3){ showFinalWin(); return; }

    $overlayTitle.text(title||"Game Over");
    $overlayMsg.text(msg||"");

    $overlay.css({
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }).show();

    $overlayPrimaryBtn.text(isWin?(currentLevel<3?"Next Level":"Play Again"):fail?"Restart Game":"Restart Game");
}

// 🔹 Final Win
function showFinalWin(){
    $("#finalWin").show();
    for(let i=0;i<80;i++){
        const $c=$("<div>").addClass("confetti")
            .css({left: Math.random()*100+"%",
                background: `hsl(${Math.random()*360},100%,60%)`,
                animationDelay: Math.random()*2+"s"});
        $("body").append($c);
        setTimeout(()=> $c.remove(),4000);
    }
    window.location.href="winner.html";
}

// 🔹 Next level / restart
function goToNextLevelOrRestart(){
    $overlay.hide();
    const t=$overlayPrimaryBtn.text();
    if(t==="Next Level"){ 
        currentLevel++; 
        renderLevelBadge(currentLevel); 
        prepareLevel(currentLevel);
    }
    else {
        currentLevel=1; hintsLeft=2;
        renderLevelBadge(currentLevel);
        prepareLevel(currentLevel);
    }
}

// 🔹 Reset
function resetGame(){ prepareLevel(currentLevel); }

// 🔹 Events
$("#enterBtn").on("click",()=>{
    $("#welcome-screen").hide();
    $("#game-container").show();
    renderLevelBadge(currentLevel);
    prepareLevel(currentLevel);
});
$("#startBtn").on("click",()=>startLevel(currentLevel));
$hintBtn.on("click",useHint);
$("#revealBtn").on("click",()=>{
    $(".cell").eq(treasureIndex).find("img").attr("src",img.treasure);
    setTimeout(()=>endRound("💥 You revealed the treasure! Game Over","Game Over",false,true),500);
});
$("#resetBtn").on("click",resetGame);
$overlayPrimaryBtn.on("click",goToNextLevelOrRestart);
$("#playAgainBtn").on("click",()=>{
    $("#finalWin").hide();
    currentLevel=1;
    hintsLeft=2;
    renderLevelBadge(currentLevel);
    prepareLevel(currentLevel);
});
