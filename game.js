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
let currentLevel = 1,          // let ka matlab hai ye variable hai jo future me change ho sakta hai,currentLevel = 1 → Game abhi level 1 pe start ho raha hai.
    treasureIndex = null,      // treasureIndex variable treasure ki position ko store karega, null ka matlab abhi koi treasure set nahi hua.
    moves = 0,                 // moves variable track karega ke player ab tak kitni moves kar chuka hai , Start me ye 0 hai.
    moveLimit = 0,             // moveLimit me store hoga maximum moves allowed for current level, Abhi 0, game start hone ke baad update hoga.
    timeLeft = 60,             // timeLeft variable me level complete karne ka remaining time store hota hai , Start me 60 seconds.
    hintsLeft = 2,             // hintsLeft variable me player ke paas remaining hints store honge , Start me 2 hints.
    started = false,           // started boolean variable hai , Ye check karega ke game shuru hua ya nahi , Start me false, jab player start karega to true hoga.
    timerId = null;            // timerId me setInterval ya setTimeout ka ID store hota hai , Ye timer ko later stop ya clear karne ke kaam aayega.

// 🔹 jQuery shortcuts → frequently use hone wale elements
const $grid = $("#grid"),                  // $grid variable me HTML element jiska id="grid" hai, wo store ho gaya , Ye container hai jahan sab treasure boxes (chests) dikhaye jayenge.
      $levelTitle = $("#levelTitle"),      // Ye element game ke level ka title (Easy, Medium, Hard) show karega.
      $levelEmoji = $("#levelEmoji"),      // Ye level ke title ke sath ek emoji dikhata hai — jaise 😎, 😰, 💀 etc.
      $levelShort = $("#levelShort"),      // Short text → 1/3 etc
      $progressFill = $("#progressFill"),  // Ye progress bar ka fill part hai — ye batata hai kitni progress hui hai.
      $timeStat = $("#timeStat"),          // Ye element game ka timer dikhata hai — time remaining ya time passed.
      $hintBox = $("#hintBox"),            // Ye box me hint text show hota hai — jaise “Treasure near left side”.
      $log = $("#log"),                    // Ye area me game log messages show hote hain — jaise “You found empty box”.
      $movesCard = $("#movesCard"),        // Ye card game me moves (kitne attempts bache hain) dikhata hai.
      $hintsCard = $("#hintsCard"),        // Ye card hints ke count (kitne hints bache hain) show karta hai.
      $hintBtn = $("#hintBtn"),            // Ye button hai jisse player hint mang sakta hai.
      $countdown = $("#countdown"),        // Countdown display
      $overlay = $("#overlay"),            // Ye overlay screen hai jo win ya lose hone ke baad appear hoti hai.
      $overlayTitle = $("#overlayTitle"),  // Ye overlay ke upar likha title show karta hai — jaise “You Win!” ya “Game Over!”
      $overlayMsg = $("#overlayMsg"),      // Ye overlay me extra message show karta hai — jaise “Better luck next time!”
      $overlayPrimaryBtn = $("#overlayPrimaryBtn"); // Ye overlay me main button hai — jaise “Play Again” ya “Next Level”.

// 🔹 Log update → bottom log me message update karne ke liye
const log = txt => $log.html(txt); // Ye ek arrow function hai jiska naam log hai , txt ek parameter hai — matlab jab bhi ye function call hoga, hum ek text (message) pass karenge , $log.html(txt) ka matlab hai: $log (jo upar wale code me $("#log") se link hai) uske andar ka HTML change karke wo message text show kar do.

// 🔹 UI update → moves, hints aur time ko UI me update karna
const updateUI = () => {        // Ye ek function hai jiska naam updateUI hai.
    $movesCard.text(`${moves}/${moveLimit}`); // Ye line moves counter ko update karti hai.
    $timeStat.text(`${timeLeft}s`);           // Ye line timer display ko update karti hai.
    $hintsCard.text(hintsLeft);               // Ye line hints counter update karti hai.
};

// 🔹 Level Badge → top me level ka badge update karna
function renderLevelBadge(lv){           // Ye ek arrow function hai jiska naam renderLevelBadge hai.
    const c = levels[lv];    // Ye line current level ka data levels object se nikalti hai , Matlab — levels ek object hai jisme har level ka setup (jaise moves, hints, emoji, name, etc.) store hai , Ab c me wo specific level ka config aa gaya jise ab hum screen pe dikhayenge.
    $levelEmoji.text(c.emoji);   // Ye line screen pe emoji update karti hai , Jo emoji levels object me defined hai (jaise 😃, 😰, 💀), wo display ho jata hai current level ke sath.
    $levelTitle.text(`Level ${lv}/3 — ${c.name}`); // Ye line screen pe full level title likh deti hai , 
    $levelShort.text(`${lv}/3`);             // Ye short version dikhata hai — sirf numbers me , 2/3 (matlab level 2 of 3).
    $progressFill.css("width",`${(lv/3)*100}%`); // Ye line progress bar ki width set karti hai taake ye visually bataye player kis level tak pahunch gaya hai.
}

// 🔹 Grid → level ke liye cells create karna
function createGrid(cols, total){      // Ye ek arrow function hai jiska naam createGrid hai , Ye do parameters leta hai: cols → grid me kitne columns hone chahiye (jaise 4 columns) , total → total kitne boxes (cells) banane hain (jaise 12 chests)
    $grid.empty().css("grid-template-columns", `repeat(${cols},80px)`); // Ye line do kaam karti hai: .empty() → purani grid ko clear karta hai (agar pehle se boxes hain to hata deta hai) , .css("grid-template-columns", ... ) → naya layout set karta hai, jisme columns ki ginti cols ke barabar hoti hai.
    for(let i=0;i<total;i++){      // Ye loop har ek box (cell) ke liye chal raha hai , Matlab agar total = 12, to ye loop 12 baar chalega — aur har baar ek naya cell (box) banayega.
        const $cell = $("<div>",{class:"cell","data-i":i}); // Ye line ek naya <div> element banata hai jiska: class = "cell" → CSS styling ke liye , "data-i": i → har cell ko ek unique number deta hai (index)
        const $img = $("<img>",{src:img.closed, alt:"chest"}); // Is line me cell ke andar ek image lagayi jati hai , src: img.closed → matlab closed chest wali image (band box) , alt: "chest" → alternative text accessibility ke liye.
        $cell.append($img);// Ye line bana hua <div> (cell) ko grid container ($grid) ke andar add kar deti hai., Matlab screen pe wo cell appear ho jata hai .
        $cell.on("click", onCellClick);     // Ye har cell par click event listener lagata hai , Matlab jab user kisi box pe click karega, to function onCellClick chalega ,Ye function decide karega ke box khali hai ya treasure mila hai
        $grid.append($cell);                 // Cell ko grid me add karo
    }
}

// 🔹 Countdown → start hone se pehle 3-2-1 GO
function showCountdown(cb){     // Ye ek arrow function hai jiska naam showCountdown hai , cb ka matlab callback function hai — jab countdown khatam ho jaye to ye function automatically chale ga
    let n=3;                   // Yahan variable n ko 3 se start kiya gaya hai, matlab countdown 3 se shuru hoga:
    $countdown.text(n).show();  // Ye line screen par countdown number 3 dikhata hai.
    const cd = setInterval(()=>{  // setInterval() ek timer banata hai jo har 1 second (1000ms) me repeat hota hai , Iska kaam hai countdown ko har second update karna.
        n--;                      // Decrement countdown
        if(n>0) $countdown.text(n); // Agar n abhi bhi 0 se bada hai, toh screen par updated number dikhaya jata hai.
        else{
            $countdown.text("GO");   // Jab n 0 ho jaye, tab screen par "GO" dikhaya jata hai.
            setTimeout(()=>{        // setTimeout() ka matlab hai ke is block ka code thodi der baad chale.
                clearInterval(cd);  // clearInterval(cd) → Ye countdown ka timer stop kar deta hai, taki number aur na gire.
                $countdown.hide();  // Countdown ko screen se hide kar diya jata hai.
                cb();         // Ye line callback function ko call karti hai, matlab game ya next action start ho jata hai.
            },700);   //700 ms ka timeout, matlab "GO" 0.7 second dikhaye jaata hai fir hide hota hai.
        }
    },1000);   // 1000 ms ka interval, matlab har 1 second ye function repeat hota hai.
}

// 🔹 Prepare Level → level ready karna
function prepareLevel(lv){   // Ye ek function hai jiska naam prepareLevel hai , lv matlab level number, yani kaunsa level start karna hai.
    const c = levels[lv];    // levels ek object hai jisme har level ki settings (configuration) store hoti hain , c me current level ki config store kar di gayi hai.
    createGrid(c.cols,c.boxes);    // createGrid() function game grid banata hai , c.cols → grid me columns ki number , c.boxes → total boxes ki number
    moves=0; moveLimit=c.moves; timeLeft=c.time; // moves=0 → player ke moves reset kar diye gaye , moveLimit=c.moves → is level me maximum allowed moves set kiye gaye , timeLeft=c.time → is level me time limit set ki gayi.
    treasureIndex=Math.floor(Math.random()*c.boxes); // Math.random()*c.boxes → 0 se boxes-1 tak random number generate karta hai , Math.floor() → decimal ko round down karta hai , Matlab treasure ka random box select kiya gaya hai.
    started = false;                   // Game abhi start nahi hua, isliye started ko false set kiya.

    // Hint button enable/disable
    $hintBtn.prop("disabled",hintsLeft<=0)  // $hintBtn.prop("disabled",hintsLeft<=0) → Agar hintsLeft 0 ya usse kam hai, Hint button disable ho jaata hai , .css({...}) → Button ka style change hota hai: Agar hints bachi hain → background transparent, color muted , Agar hints khatam → background gray (#888), color dark (#222).
        .css({background:hintsLeft>0?"transparent":"#888", color:hintsLeft>0?"var(--muted)":"#222"});

    $hintBox.text("Hint: —");    // Hint box ko reset kiya ja raha hai, abhi koi hint show nahi ho rahi.
    $(".cell").removeClass("hint-glow").css("opacity","1"); // .cell ka previous hint glow remove kar diya , Saare cells ka opacity 1 set kar diya (normal brightness).
    updateUI();         // updateUI() → Game ki screen/UI update karta hai, jaise moves, time, hints etc.
    log(`Ready — Level ${lv}/3. Press Start Level to begin.`); // Console ya game log me message display hota hai: “Level ready hai, Start Level button press karo.”
}

// 🔹 Start Level
function startLevel(){  // startLevel:function ka name hai .Is function ko Start Level button ya similar action pe call karenge.
    if(!started){ // Agar started false hai (game abhi start nahi hua) → tabhi code execute hoga. Matlab multiple clicks se game dobara start nahi hoga.
        const c=levels[currentLevel]; // c → current level ka configuration fetch kiya levels object se.Example: Level 1 → { boxes: 12, cols: 4, moves: 4, ... }.
        moves=0; moveLimit=c.moves; timeLeft=c.time; // Moves reset → 0 , Maximum moves → level ke moves , Time left → level ka time
        treasureIndex=Math.floor(Math.random()*c.boxes); // Treasure ka random box choose kiya.
        log("Get ready..."); // Bottom log me "Get ready..." message show hoga.
        showCountdown(()=>{ // showCountdown() function call kiya → 3-2-1 countdown dikhega. ()=>{ ... } → ye callback function hai, jo countdown ke baad execute hoga.
            started=true;                       // Countdown ke baad game start ho jata hai.
            clearInterval(timerId);             // Agar pehle ka timer chal raha tha, to usse stop kar diya.
            timerId = setInterval(()=>{         // setInterval() → timer start hota hai jo har 1 second me repeat hota hai , timerId me store kiya, taki baad me stop kar sake.
                if(!started) return;           // Safety check → Agar started false ho gaya (game stop hua), timer return kar dega.
                timeLeft--;                    // Decrement time
                $timeStat.text(`${timeLeft}s`); // Screen/UI par time update ho raha hai.
                if(timeLeft<=0) endRound("⏰ Time's up!","Time Over",false,true); // Time over ,Agar time khatam ho gaya, to round end kar diya.
            },1000);      //Timer har 1000ms (1 second) me repeat hota hai.
            updateUI();   // Screen/UI ka status update hota hai (moves, hints, timer etc.)
            log(`🎯 Level ${currentLevel} started! Good luck.`); // Log me message show hota hai → Level start ho gaya.
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
