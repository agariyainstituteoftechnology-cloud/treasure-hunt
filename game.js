// 🎯 Treasure Hunt — Easy 70 Lines

const pic = { close:"images/close-box.jpg", empty:"images/empty-box.jpg", win:"images/win.jpg" };
const lvl = {
    1:{box:12,col:4,moves:4,time:60,name:"Easy"},
    2:{box:24,col:6,moves:6,time:60,name:"Medium"},
    3:{box:36,col:6,moves:8,time:60,name:"Hard"}
};

let lv=1, move=0, limit=0, time=0, started=false, treasure, timer;

const $g=$("#grid"), $t=$("#time"), $m=$("#moves"), $log=$("#log"),
      $cd=$("#countdown"), $overlay=$("#overlay"), $btn=$("#overlayBtn");

const showMsg=t=>$log.text(t);
const updateStats=()=>{$m.text(`${move}/${limit}`); $t.text(`${time}s`);};

function makeGrid(cols,total){
    $g.empty().css("grid-template-columns",`repeat(${cols},80px)`);
    for(let i=0;i<total;i++)
        $("<div>").addClass("box").data("id",i)
            .append($("<img>",{src:pic.close})).click(onBoxClick).appendTo($g);
}

function countdown(cb){
    let n=3;$cd.text(n).show();
    const id=setInterval(()=>{
        if(--n>0)$cd.text(n);
        else{$cd.text("GO"); setTimeout(()=>{$cd.hide(); clearInterval(id); cb();},600);}
    },1000);
}

function prepareLevel(i){
    const d=lvl[i];
    makeGrid(d.col,d.box);
    treasure=Math.floor(Math.random()*d.box);
    move=0; limit=d.moves; time=d.time; started=false;
    updateStats(); showMsg(`🎯 Ready Level ${i} - ${d.name}`);
}

function startGame(){
    if(started) return;
    showMsg("⏳ Starting...");
    countdown(()=>{
        started=true;
        timer=setInterval(()=>{
            if(--time<=0) endGame("⏰ Time Over!", false);
            $t.text(`${time}s`);
        },1000);
        showMsg(`🕹️ Level ${lv} Started!`);
    });
}

function onBoxClick(){
    if(!started) return showMsg("⚠️ Press Start!");
    const id=$(this).data("id"), $img=$(this).find("img");
    move++;
    if(id===treasure){$img.attr("src",pic.win); setTimeout(()=>endGame(`🏆 Found in ${move} moves!`,true),400);}
    else{$img.attr("src",pic.empty); if(move>=limit) endGame("❌ No moves left!", false);}
    updateStats();
}

function endGame(msg,win){
    clearInterval(timer); started=false;
    $("#overlayTitle").text(win?"You Win!":"Game Over");
    $("#overlayMsg").text(msg);
    $btn.text(win && lv<3?"Next Level":"Restart");
    $overlay.show();
}

$("#enterBtn").click(()=>{$("#welcome").hide(); $("#game").show(); prepareLevel(lv);});
$("#startBtn").click(()=>startGame());
$("#resetBtn").click(()=>prepareLevel(lv));
$btn.click(()=>{
    $overlay.hide();
    if($btn.text()==="Next Level") lv++; else lv=1;
    prepareLevel(lv);
});
