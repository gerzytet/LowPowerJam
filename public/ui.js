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
    tomato_timer.max = SHOOT_TIMER_MAX;
    
    let Health_Bar = document.getElementById("Health_Bar");
    Health_Bar.max = PLAYER_MAX_HEALTH;
    let Death_Counter = document.getElementById("Death_Counter");
    
    if(player != undefined){
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
        let tempStr = "<table style='width:100%;'><tr><th style='width:33%'>Player</th><th style='width:33%'>Kills</th><th style='width:33%'>Deaths</th></tr>";
        if(players.length > 0 && tab_bool){
            for(let i = 0; i < players.length; i++){
                tempStr += "<tr><td>" + players[i].name + "</td><td>" + players[i].kills + "</td><td>" + players[i].deaths + "</td></tr>";
            }
        }
        tempStr += "</table>";
        playerList.innerHTML = tempStr;
    }
    else{
        playerList.style.visibility = "hidden";
    }
    
}