// 🎯 Treasure Hunt — Light Blue Edition (jQuery Version, Output Same)

// 🔹 Game me istemal hone wali images
const img = { 
    closed: "images/close-box.jpg", // Closed box image → ye image har new cell me default dikhegi
    empty: "images/empty-box.jpg",  // Empty box image → ye image dikhegi jab player galat cell click kare
    treasure: "images/win.jpg"      // Treasure box image → ye dikhegi jab player correct cell click kare
};

// 🔹 Levels ka configuration
const levels = {
    1: { boxes: 12, cols: 4, moves: 4, hints: 2, time: 60, name: "Easy", emoji: "🧭", hintArea: 6 },  // Level 1 settings → easy
    2: { boxes: 24, cols: 6, moves: 6, hints: 2, time: 60, name: "Medium", emoji: "🌊", hintArea: 8 }, // Level 2 settings → medium
    3: { boxes: 36, cols: 6, moves: 8, hints: 2, time: 60, name: "Hard", emoji: "🔥", hintArea: 10 }  // Level 3 settings → hard
};

// 🔹 Game ki current state
let currentLevel = 1,          // Current level → start me level 1
    treasureIndex = null,      // Treasure ka index → abhi null hai, level start hone pe set hoga
    moves = 0,                 // Player ke moves → start me 0
    moveLimit = 0,             // Max moves allowed for current level
    timeLeft = 60,             // Time left in seconds → default 60
    hintsLeft = 2,             // Player ke hints → start me 2
    started = false,           // Game start hua ya nahi → false
    timerId = null;            // Timer ID → setInterval ka reference store hoga

// 🔹 jQuery shortcuts → frequently use hone wale elements
const $grid = $("#grid"),                  // Grid container element
      $levelTitle = $("#levelTitle"),      // Level title display
      $levelEmoji = $("#levelEmoji"),      // Level emoji display
      $levelShort = $("#levelShort"),      // Short text → 1/3 etc
      $progressFill = $("#progressFill"),  // Progress bar fill element
      $timeStat = $("#timeStat"),          // Time left display
      $hintBox = $("#hintBox"),            // Hint message display
      $log = $("#log"),                    // Bottom log → messages show karne ke liye
      $movesCard = $("#movesCard"),        // Moves count display
      $hintsCard = $("#hintsCard"),        // Hints count display
      $hintBtn = $("#hintBtn"),            // Hint button
      $countdown = $("#countdown"),        // Countdown display
      $overlay = $("#overlay"),            // Overlay container → next level / restart
      $overlayTitle = $("#overlayTitle"),  // Overlay title text
      $overlayMsg = $("#overlayMsg"),      // Overlay message text
      $overlayPrimaryBtn = $("#overlayPrimaryBtn"); // Overlay main button

// 🔹 Log update → bottom log me message update karne ke liye
const log = txt => $log.html(txt); 

// 🔹 UI update → moves, hints aur time ko UI me update karna
const updateUI = () => {
    $movesCard.text(`${moves}/${moveLimit}`); // Moves card update
    $timeStat.text(`${timeLeft}s`);           // Time left update
    $hintsCard.text(hintsLeft);               // Hints left update
};

// 🔹 Level Badge → top me level ka badge update karna
function renderLevelBadge(lv){
    const c = levels[lv];                     // Current level config fetch
    $levelEmoji.text(c.emoji);               // Emoji update
    $levelTitle.text(`Level ${lv}/3 — ${c.name}`); // Level title update
    $levelShort.text(`${lv}/3`);             // Short text update
    $progressFill.css("width",`${(lv/3)*100}%`); // Progress bar update
}

// 🔹 Grid → level ke liye cells create karna
function createGrid(cols, total){
    $grid.empty();                            // Pehle ka grid clear karo
    $grid.css("grid-template-columns",`repeat(${cols},80px)`); // Column width set
    for(let i=0;i<total;i++){                 // Loop to create each cell
        const $cell = $("<div>",{class:"cell","data-i":i}); // Cell div with index
        const $img = $("<img>",{src:img.closed, alt:"chest"}); // Closed chest image
        $cell.append($img);                  // Image ko cell me add karo
        $cell.on("click", onCellClick);     // Click event attach karo
        $grid.append($cell);                 // Cell ko grid me add karo
    }
}

// 🔹 Countdown → start hone se pehle 3-2-1 GO
function showCountdown(cb){
    let n=3;                                  // Countdown start value
    $countdown.text(n).show();                // Show countdown
    const cd = setInterval(()=>{              
        n--;                                  // Decrement countdown
        if(n>0) $countdown.text(n);           // Show number
        else{
            $countdown.text("GO");            // Last me GO
            setTimeout(()=>{
                clearInterval(cd);            // Interval stop
                $countdown.hide();           // Countdown hide
                cb();                         // Callback → start game
            },700);
        }
    },1000);
}

// 🔹 Prepare Level → level ready karna
function prepareLevel(lv){
    const c = levels[lv];                     // Current level config
    createGrid(c.cols,c.boxes);               // Grid create karo
    moves=0; moveLimit=c.moves; timeLeft=c.time; // Moves aur time reset
    treasureIndex=Math.floor(Math.random()*c.boxes); // Random treasure select
    started = false;                           // Game not started

    // Hint button enable/disable
    $hintBtn.prop("disabled",hintsLeft<=0)
        .css({background:hintsLeft>0?"transparent":"#888", color:hintsLeft>0?"var(--muted)":"#222"});

    $hintBox.text("Hint: —");                 // Hint box reset
    $(".cell").removeClass("hint-glow").css("opacity","1"); // Previous hint glow remove
    updateUI();                               // UI update
    log(`Ready — Level ${lv}/3. Press Start Level to begin.`); // Log ready
}

// 🔹 Start Level
function startLevel(){  // startLevel:function ka name hai .Is function ko Start Level button ya similar action pe call karenge.
    if(!started){      // Agar started false hai (game abhi start nahi hua) → tabhi code execute hoga. Matlab multiple clicks se game dobara start nahi hoga.
        const c=levels[currentLevel]; // c → current level ka configuration fetch kiya levels object se.Example: Level 1 → { boxes: 12, cols: 4, moves: 4, ... }.
        moves=0; moveLimit=c.moves; timeLeft=c.time; // Moves reset → 0 , Maximum moves → level ke moves , Time left → level ka time
        treasureIndex=Math.floor(Math.random()*c.boxes); // Treasure ka random box choose kiya.
        log("Get ready..."); // Bottom log me "Get ready..." message show hoga.
        showCountdown(()=>{ // showCountdown() function call kiya → 3-2-1 countdown dikhega. ()=>{ ... } → ye callback function hai, jo countdown ke baad execute hoga.
            started=true;                       // Game started
            clearInterval(timerId);             // Clear previous timer
            timerId = setInterval(()=>{         // Timer start
                if(!started) return;           // Safety check
                timeLeft--;                    // Decrement time
                $timeStat.text(`${timeLeft}s`); // Update UI
                if(timeLeft<=0) endRound("⏰ Time's up!","Time Over",false,true); // Time over
            },1000);
            updateUI();                         // UI update
            log(`🎯 Level ${currentLevel} started! Good luck.`); // Log start
        });
    }
}
// 🔹 Cell Click
function onCellClick(){      // onCellClick → function ka naam. ye function har cell click hone par call hota hai.
    if(!started) return log("⚠ Press Start Level first!"); //Agar game start nahi hua (started=false) → Player ko warning message show karo log me. return → function yahi terminate ho jata hai.
    const idx = parseInt($(this).data("i"),10);  // $(this) → jo cell click hua, wo element. data("i") → us cell ka index fetch karo (pehle data-i me store kiya tha).parseInt(...,10) → string ko integer me convert kare.idx → clicked cell ka index.
    moves++; // Player ke moves count me 1 add karo.
    const $img = $(this).find("img"); // Clicked cell ke andar img element select kiya. $img → ab is image ka source update karenge (treasure ya empty).

    if(idx===treasureIndex){ // Check karo → clicked cell ka index treasure ka index hai ya nahi.
        $img.attr("src",img.treasure); // Agar treasure mila → image treasure image me change ho jaye.
        setTimeout(()=>endRound(`🏆 You found the treasure in ${moves} moves!`,"Congratulations",true),700); // 700ms baad endRound() call karo → level complete.
    } else { //Agar treasure nahi mila → else block.
        $img.attr("src",img.empty); // Image ko empty box set karo.
        log("❌ Empty chest."); // Log me Empty chest message show karo. 
        if(moves>=moveLimit) endRound("❌ No moves left!","Game Over",false,true); // Agar player ke moves khatam ho gaye → level fail → endRound() call. Arguments: message, title, win=false, timeOver=true
    }
    updateUI(); // Moves aur hints UI update karo.
}

// 🔹 Hint
function useHint(){            // useHint → function ka naam. Ye function hint button click hone par call hota hai.
    if(!started) return log("⚠ Start the level first!");    // Agar game start nahi hua → warning log karo aur function terminate.
    if(hintsLeft<=0) return log("🚫 No hints left!");     // Agar hints khatam ho gaye → message log karo aur function terminate.

    hintsLeft--; // Hint use hone ke baad hintsLeft 1 kam kar do.

    const c=levels[currentLevel], total=c.boxes, cols=c.cols, hintCount=c.hintArea; // c → current level ka config ,total → total boxes, cols → columns , hintCount → kitni boxes highlight karni hai (hint area)
    const tr=Math.floor(treasureIndex/cols), tc=treasureIndex%cols, indices=[];     // tr → treasure row index → treasureIndex ko cols se divide karke find kiya , tc → treasure column index → treasureIndex modulo cols , indices=[] → array jisme hint highlight ke indices store honge
    for(let d=0; indices.length<hintCount && d<=Math.max(cols,Math.ceil(total/cols)); d++) // Ye nested loops treasure ke aas paas ke cells select karte hain: d → distance from treasure , r, cc → row & column iterate karte hain , i=r*cols+cc → cell index calculate , if(i>=total) continue; → extra cells skip , if(Math.abs(r-tr)+Math.abs(cc-tc)===d) → Manhattan distance = d → indices me add karo , Stop loop jab indices.length >= hintCount
        for(let r=0;r<Math.ceil(total/cols);r++)
            for(let cc=0;cc<cols;cc++){
                const i=r*cols+cc;
                if(i>=total) continue;
                if(Math.abs(r-tr)+Math.abs(cc-tc)===d) indices.push(i);
                if(indices.length>=hintCount) break;
            }

    $(".cell").removeClass("hint-glow").css("opacity","0.4"); // Pehle saare cells ka hint glow remove karo , Aur opacity ko 0.4 (dim) kar do
    indices.slice(0,hintCount).forEach(i=>{         // indices array me se top hintCount cells select karo , Unko hint-glow class add karo aur opacity 1 (highlight)
        $grid.find(`[data-i='${i}']`).addClass("hint-glow").css("opacity","1");
    });

    $hintBox.text("💡 Hint used!"); // Hint box me message show karo → Hint used!
    log("💡 Treasure near glowing chests"); // Bottom log me hint message show karo
    if(hintsLeft<=0) $hintBtn.prop("disabled",true); // Agar hints khatam ho gaye → hint button disable karo
    updateUI(); // Moves, hints, aur time UI update karo
}

// 🔹 End Round (✅ CENTER FIX ADDED)
function endRound(msg,title,isWin=false,fail=false){  //endRound → function ka naam , msg → bottom log ya overlay me show hone wala message , title → overlay title , isWin=false → level win hua ya nahi , fail=false → level fail hua ya nahi
    clearInterval(timerId);       // Agar timer chal raha ho → stop kar do.
    started=false;               // Game stop kar diya, player ab click nahi kar sakta.

    if(isWin && currentLevel===3){ showFinalWin(); return; }    // Agar player jeet gaya aur last level (3) complete ho gaya → showFinalWin() call karo (final victory screen) , return → baki function skip ho jaye

    $overlayTitle.text(title||"Game Over"); // Overlay title set karo , Agar title pass nahi hua → default "Game Over"
    $overlayMsg.text(msg||""); // Overlay message set karo , Agar msg pass nahi hua → empty string

    $overlay.css({     // Overlay ko screen center me display karo , display: flex → flexbox layout , justifyContent: center → horizontally center ,  alignItems: center → vertically center , .show() → overlay visible
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    }).show();

    $overlayPrimaryBtn.text(isWin?(currentLevel<3?"Next Level":"Play Again"):fail?"Restart Game":"Restart Game");   // Overlay ka main button text set karo Logic: Agar win → aur level <3 → "Next Level" , Agar win → aur last level → "Play Again" , Agar fail → "Restart Game"
}

// 🔹 Final Win
function showFinalWin(){          //showFinalWin → function ka naam , Ye function last level jeetne par call hota hai.
    $("#finalWin").show();        // #finalWin → final win message ya screen ka element , .show() → screen pe visible karo
    for(let i=0;i<80;i++){         // For loop → 80 confetti particles create karne ke liye , i=0 → start , i<80 → loop 80 times chalega , i++ → 1 increment per iteration
        const $c=$("<div>").addClass("confetti")   // $c → ek div element create kiya jQuery se , .addClass("confetti") → confetti style apply , .css({...}) → confetti ka random style set kiya: left: Math.random()*100+"%" → screen pe horizontal position random , background: hsl(...) → confetti ka color random (HSL color) , animationDelay → confetti animation start random delay ke saath
            .css({left: Math.random()*100+"%",     
                background: `hsl(${Math.random()*360},100%,60%)`,
                animationDelay: Math.random()*2+"s"});
        $("body").append($c); // Confetti div ko body me add kar diya → screen pe dikhega
        setTimeout(()=> $c.remove(),4000); // (4 seconds) baad confetti div remove kar diya , 
    }
    window.location.href="winner.html"; // Page redirect kar diya → winner.html , Matlab final win page dikhega player ko
}

// 🔹 Next level / restart
function goToNextLevelOrRestart(){ // goToNextLevelOrRestart 0-> function ka name hai , Ye overlay primary button click hone par call hota hai.
    $overlay.hide();               // Overlay ko screen se hide kar do
    const t=$overlayPrimaryBtn.text(); //$overlayPrimaryBtn.text() → overlay button ka text fetch karo , Store kiya t me
    if(t==="Next Level"){          // Agar button text "Next Level" hai → player level complete kar chuka hai aur next level me jaayega
        currentLevel++;         // Current level ko 1 increment karo
        renderLevelBadge(currentLevel); // LevelBadge update karo → emoji, title, progress bar
        prepareLevel(currentLevel);     // Next level grid aur stats prepare karo
    }
    else {                        // Agar button text "Next Level" nahi hai → game restart karna hai
        currentLevel=1; hintsLeft=2; // Game ko level 1 pe reset karo , Hints ko 2 reset karo
        renderLevelBadge(currentLevel); // Level badge update karo → level 1 ke liye
        prepareLevel(currentLevel);   // Level 1 ke grid aur stats prepare karo
    }
}

// 🔹 Reset
function resetGame(){    //(resetGame -> function ka name hai ) Ye function reset button ya similar action pe call hota hai.
    prepareLevel(currentLevel); // prepareLevel(currentLevel) → current level ko reset karega -> Grid recreate hoga, Moves, time, treasureIndex reset honge,Hint button aur UI update honge,Log me ready message show hoga
} 

// 🔹 Events
$("#enterBtn").on("click",()=>{ // #enterBtn -> DOM element jiska id "enterBtn" hai (probably Start Game button). , click eent attach kiya hai , mtlb jab btn click hoga tu arrow function call hoga 
    $("#welcome-screen").hide(); // (#welcome-screen -> welcem srceen element) , (hide -> srceen ko invisible karo )
    $("#game-container").show(); // ( game-container -> main game container element) , (show -> srceen ko visible karo)
    renderLevelBadge(currentLevel); // level badge ko update karo us ka title , emoji , progress bar current level ka
    prepareLevel(currentLevel);    // us level ko prepare karo tresure hut set karo , ui updated karo current level ke
});
$("#startBtn").on("click",()=>startLevel(currentLevel));  // starleveltbtn , click event attach , arrow function -> startLevel(currentLevel) call kare ga  mtlb -> startlevel btn click current level reset 
$hintBtn.on("click",useHint);                // hintbtn ko phele jquery me select kiya, click hone par usehint function call hoga

$("#revealBtn").on("click",()=>{              // revealBtn (tresure hut revel kar ne ke liye)
    $(".cell").eq(treasureIndex).find("img").attr("src",img.treasure);// (cell -> grid ke sare cell slecet karne ke liye ),(eq -> specific treaure select kar ne ke liye ) , (find -> us cell ka img select ) , (attr -> treaure show karo )
    setTimeout(()=>endRound("💥 You revealed the treasure! Game Over","Game Over",false,true),500); // is me ham ne 0.5s ka time lagaya h jab endround aae mtlb-> jab ham tresure hut found kare len ge phir 0.5s ka stay aae ga phir srceen aae ge You revealed the treasure! Game Over phir game dubara se start hojae ge uper title aae ga gameover  or neehe btn hoga reset ka or agar ham reveal me kar den ge tu game first level se shoro hoge
});
$("#resetBtn").on("click",resetGame);    // resetbtn jo game crrent level me reset hoge , click hone par reset function call hoga mtlb->jab player reset ke btn pe click kare ga tu current level refresh hojae ga.
$overlayPrimaryBtn.on("click",goToNextLevelOrRestart);  // overlayPrimaryBtn ye sreecn ka main btn hoga (nextlevel/reset), call hone par goToNextLevelOrRestart function call hoga mtlb -> player jab btn pe click kare ga tu game nextlevel pe chale jae ge.

$("#playAgainBtn").on("click",()=>{     // playagainbtn element hai final win srceen me , is ke sath click event attach kiya arrow function run hoga btn click hone par
    $("#finalWin").hide();              // final win element srceen ko invisisblr karo       
    currentLevel=1;                     // is ke bad is ko bubara se reset karo 1 level se 
    hintsLeft=2;                        // or us ke hints ko be reset kar bubara se 2 hojae 
    renderLevelBadge(currentLevel);     // level badge ko update karo -> titlt , emoji , progress bar for first level
    prepareLevel(currentLevel);         // current level jo hamara 1 hoga us ko prepare karo treasure sat karo , ui uptadet karo 
});
