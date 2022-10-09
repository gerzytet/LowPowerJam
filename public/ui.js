/*
@file ui.js
@author Christian + Pat
@date 10/7/2022
@brief UI stuff
*/

var tab_bool = false;

function updateUI(id){
    let player = findPlayer(id);
    
    let uiDiv = document.getElementById("canvasUI");
    let canvas = document.getElementById("defaultCanvas0");
    if(cnv != undefined){
        uiDiv.style.width = canvas.style.width;
        uiDiv.style.height = canvas.style.height;
    }
    
    let tomato_timer = document.getElementById("tomato_wait");
    tomato_timer.max = TOMATO_SHOOT_TIMER;
    
    let Health_Bar = document.getElementById("Health_Bar");
    Health_Bar.max = PLAYER_MAX_HEALTH;
    let Death_Counter = document.getElementById("Death_Counter");



    let Tomato_Block= document.getElementById("Tomato_Block");
    let Plate_Block= document.getElementById("Plate_Block");
    let Spoon_Block= document.getElementById("Spoon_Block");
    
    
    if(player != undefined){
        Tomato_Block.innerHTML = '<p id="W1">1</p><img id="tImg" src="images/Tomato.png"></img><p id="ammoCounter">'+player.ammo+'</p>';
        if(player.weapon == TOMATO){
            Tomato_Block.opasity = 1;
            Plate_Block.opasity = .5;
        }else if(player.weapon == PLATE){
    
        }else {
    
        }
        
        if(player.shootTimer <= 0){
            tomato_timer.value = 0;
        }
        else{
            tomato_timer.value = player.shootTimer;
        }

        if(Health_Bar.value != player.health && player.health >= 0){
            Health_Bar.value += (player.health> Health_Bar.value) ? 1 : -1;
        }
        
        if(player.isDead()){
            Death_Counter.style.visibility = "visible";
            Death_Counter.innerHTML = "<p>You are dead!</p> <p>Respawning in " + floor(player.deathTimer/30) + "</p>";
        }
        else{
            Death_Counter.style.visibility = "hidden";
        }
    }

    let playerList = document.getElementById("Player_list");
    if(tab_bool){
        playerList.style.visibility = "visible";
        let tempStr;
        if(gameMode === MODE_CTF){
            tempStr = "<table style='width:100%;'>"
            tempStr += "<tr><th style='width:50%'>Timer</th><th style='width:50%'>" + ctfTimer + "</th></tr>";
            tempStr += "<tr><td style='width:50%'>Red Team Points</td><td style='width:50%'>" + teamPoints[0] + "/" + CTF_WIN_POINTS + "</td></tr>";
            tempStr += "<tr><td style='width:50%'>Blue Team Points</td><td style='width:50%'>" + teamPoints[1] + "/" + CTF_WIN_POINTS + "</td></tr>";
        }
        else if (gameMode === MODE_FFA){
            tempStr = "<table style='width:100%;'><tr><th style='width:33%'>Player</th><th style='width:33%'>Kills</th><th style='width:33%'>Deaths</th></tr>";
            if(players.length > 0 && tab_bool){
                for(let i = 0; i < players.length; i++){
                    tempStr += "<tr><td>" + players[i].name + "</td><td>" + players[i].kills + "</td><td>" + players[i].deaths + "</td></tr>";
                }
            }
        }
        tempStr += "</table>";
        playerList.innerHTML = tempStr;
    }
    else{
        playerList.style.visibility = "hidden";
    }
    
}

function playButtonFunc() {
    let name = document.getElementById("name_input").value;
    if(name != ""){
        menuState = LOBBY_SELECT;
        setupLobbySelect();
    }
}