/*
@file maps.js
@author entire team
@date 10/7/2022
@brief 3D map system, contains functions for converting 2D canvas to 3D worldspace
*/

const GROUND = -50

//create 3d vector
function cv(x, z) {
    return createVector(x, GROUND, z)
}

function cv2(x, y) {
    return createVector(x, y)
}

function initMaps() {
    const GROUND = -50

<<<<<<< HEAD
    maps.push({
        playerSpawn: createVector(100, GROUND, 100),
        name: "Basic map",
        objects: [
            new Wall(cv2(-100, -100), cv2(600, -100)),
            new Wall(cv2(-100, -100), cv2(-100, 600)),
            new Wall(cv2(600, -100), cv2(600, 600)),
            new Wall(cv2(-100, 600), cv2(600, 600)),

            new HealthKitchen(cv(0, 0), new BatterySlot(cv(100, 100), false), 0),
            new HealthKitchen(cv(500, 500), new BatterySlot(cv(400, 400), false), 0),
            new TomatoKitchen(cv(500, 0), new BatterySlot(cv(400, 100), true), 1),
            new TomatoKitchen(cv(0, 500), new BatterySlot(cv(100, 400), true), 1),

            new Wall(cv2(250, 50), cv2(250, 450)),
            new Wall(cv2(50, 250), cv2(450, 250))
        ]
=======
    maps.push(
        {
            playerSpawn: createVector(100, GROUND, 100),
            name: "Free-for-all map",
            objects: [
                //walls use cv2, kitchen uses cv. Both take in 2 (x,y) coordinates, slope should be -1
                new Wall(cv2(-200, -200), cv2(1200, -200)),
                new Wall(cv2(-200, -200), cv2(-200, 1200)),
                new Wall(cv2(1200, -200), cv2(1200, 1200)),
                new Wall(cv2(-200, 1200), cv2(1200, 1200)),
    
                new TomatoKitchen(cv(1000, 0), new BatterySlot(cv(800, 200), true)),
                new TomatoKitchen(cv(0, 1000), new BatterySlot(cv(200, 800), true)),
    
                //diagonals
                new Wall(cv2(800, 0), cv2(1200, 400)),
                new Wall(cv2(0, 800), cv2(400, 1200))
            ],
>>>>>>> 86156f0770742ae4b74b7baa4d2898cb07bde546
    })

    maps.push(
        {
            playerSpawn: createVector(100, GROUND, 100),
            name: "Test Map",
            objects: [
                new Wall(cv2(-100, -100), cv2(600, -100)),
                new Wall(cv2(-100, -100), cv2(-100, 600)),
                new Wall(cv2(600, -100), cv2(600, 600)),
                new Wall(cv2(-100, 600), cv2(600, 600)),
    
                new HealthKitchen(cv(0, 0), new BatterySlot(cv(100, 100), false)),
                new HealthKitchen(cv(500, 500), new BatterySlot(cv(400, 400), false)),
                new TomatoKitchen(cv(500, 0), new BatterySlot(cv(400, 100), true)),
                new TomatoKitchen(cv(0, 500), new BatterySlot(cv(100, 400), true)),
    
                new Wall(cv2(250, 50), cv2(250, 450)),
                new Wall(cv2(50, 250), cv2(450, 250))
            ],
    })

}   
var maps = []