/*
@file maps.js
@author entire team
@date 10/7/2022
@brief 3D map system, contains functions for converting 2D canvas to 3D worldspace
*/

const GROUND = -50;
const WALL_HEIGHT = 100;

var maps = [];

//create 3d vector
function cv(x, z) {
  return createVector(x, GROUND, z);
}

function cv2(x, y) {
  return createVector(x, y);
}

function initMaps() {
  const GROUND = -50;

  maps.push({
    playerSpawn: [
      createVector(100, GROUND, 100),
      createVector(1000, GROUND, 1000),
    ],
    name: "Free-for-all map",
    objects: [
      //walls use cv2, kitchen uses cv. Both take in 2 (x,y) coordinates, slope should be -1
      new Wall(cv2(-200, -200), cv2(1200, -200), WALL_HEIGHT),
      new Wall(cv2(-200, -200), cv2(-200, 1200), WALL_HEIGHT),
      new Wall(cv2(1200, -200), cv2(1200, 1200), WALL_HEIGHT),
      new Wall(cv2(-200, 1200), cv2(1200, 1200), WALL_HEIGHT),

      new TomatoKitchen(cv(1000, 0), new BatterySlot(cv(800, 200), true), 0),
      new TomatoKitchen(cv(0, 1000), new BatterySlot(cv(200, 800), true), 1),

      //diagonals
      new Wall(cv2(800, 0), cv2(1200, 400), WALL_HEIGHT),
      new Wall(cv2(0, 800), cv2(400, 1200), WALL_HEIGHT),

      new Tree(cv(500, 500))
    ],
  });

  maps.push({
    playerSpawn: [
      createVector(100, GROUND, 100),
      createVector(400, GROUND, 400),
    ],
    name: "TINY Map",
    objects: [
      new Wall(cv2(-100, -100), cv2(600, -100), WALL_HEIGHT),
      new Wall(cv2(-100, -100), cv2(-100, 600), WALL_HEIGHT),
      new Wall(cv2(600, -100), cv2(600, 600), WALL_HEIGHT),
      new Wall(cv2(-100, 600), cv2(600, 600), WALL_HEIGHT),

      new HealthKitchen(cv(0, 0), new BatterySlot(cv(100, 100), false)),
      new HealthKitchen(cv(500, 500), new BatterySlot(cv(400, 400), false)),
      new TomatoKitchen(cv(500, 0), new BatterySlot(cv(400, 100), true)),
      new TomatoKitchen(cv(0, 500), new BatterySlot(cv(100, 400), true)),

      new Wall(cv2(250, 50), cv2(250, 450), WALL_HEIGHT),
      new Wall(cv2(50, 250), cv2(450, 250), WALL_HEIGHT),
    ],
  });

  //David's Map
  maps.push({
    playerSpawn: [
      createVector(280, GROUND, 1300),
      createVector(344, GROUND, -1200),
    ],
    name: "Feeding Forrest",
    objects: [
      new Wall(cv2(50, 250), cv2(450, 250)),

      new Wall(cv2(50, 250), cv2(450, 250)),

      new Wall(cv2(50, 250), cv2(450, 250)),

      new Wall(cv2(50, 250), cv2(450, 250)),

      new HealthKitchen(
        cv(-1300, -1300),
        new BatterySlot(cv(-1300, -1100), false)
      ),

      new HealthKitchen(
        cv(-1300, -1300),
        new BatterySlot(cv(1300, 1100), false)
      ),

      new TomatoKitchen(
        cv(-1000, 1300),
        new BatterySlot(cv(-1000, 1100), true)
      ),

      new TomatoKitchen(cv(1300, 1300), new BatterySlot(cv(1300, 1100), true)),
    ],
  });
}
