/*
@file lobby.js
@author entire team
@date 10/7/2022
@brief wall behavior
*/

class Wall {
    //p1 and p2 are 2 2d points that define the wall orientation
    constructor(p1, p2, height = 50) {
        this.p1 = p1
        this.p2 = p2
        //this.y = y
        this.height = height
    }

    render() {
        let height = this.height
        let width = this.p1.dist(this.p2)

        let mid = p5.Vector.lerp(this.p1, this.p2, 0.5)
        push()
            translate(mid.x, -height / 2, mid.y)

            let p1 = createVector(1, 0)
            let p2 = this.p1.copy().sub(this.p2)
            let angle = p1.angleBetween(p2) 
            rotateY(-angle)
            fill(100, 255)
            stroke(0);
            texture(WALL_PNG);
            box(width, height, 10)
        pop()
    }

    getCollider() {
        return new WallCollider(this.p1, this.p2, this.height)
    }
}