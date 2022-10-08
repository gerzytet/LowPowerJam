function updateUI(id){
    let player = findPlayer(id);
    console.log(player);
    let tomato_timer = document.getElementById("tomato_wait");
    tomato_timer.max = SHOOT_TIMER_MAX;
    
    let Health_Bar = document.getElementById("Health_Bar");
    Health_Bar.max = PLAYER_MAX_HEALTH;

    tomato_timer.value = player.shootTimer;
    
    if(Health_Bar.value != player.health){
      Health_Bar.value += (player.health> Health_Bar.value) ? 1 : -1;
    }
}