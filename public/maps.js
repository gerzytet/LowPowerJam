/*
@file maps.js
@author entire team
@date 10/7/2022
@brief 3D map system
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
    })
}

var maps = []