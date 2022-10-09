/*
@file collider.js
@author Craig
@date 10/7/2022
@brief Collider math
*/

class SphereCollider {
    constructor(pos, size) {
        this.pos = pos
        this.size = size
    }

    isColliding(other) {
        if (other instanceof SphereCollider) {
            let dist = this.pos.dist(other.pos)
            return dist <= this.size + other.size
        } else if (other instanceof WallCollider) {
            return other.isColliding(this)
        } else if (other instanceof CompositieCollider) {
            return other.isColliding(this)
        }
        return false
    }

    render() {
        push()
            fill(191, 0, 230, 100)
            translate(this.pos)
            sphere(this.size)
        pop()
    }
}

class WallCollider {
    //p1 and p2 are 2 2d points that define the wall orientation
    constructor(p1, p2, height) {
        this.p1 = p1
        this.p2 = p2
        //this.y = y
        this.height = height

        //wall collision doesn't work properly with walls perfectly aligned with the x or z axis
        //workaround:
        if (p1.x === p2.x) {
            p2.x += 0.01
        }
        if (p1.y === p2.y) {
            p2.y += 0.01
        }
    }

    isColliding(other) {
        if (other instanceof WallCollider) {
            throw new Error("Not implemented")
        } else if (other instanceof CompositieCollider) {
            return other.isColliding(this)
        } else if (other instanceof SphereCollider) {
            if (other.pos.y < -this.height) {
                return false
            }

            let p1 = this.p1
            let p2 = this.p2
            let testPoint = other.pos
            let testPoint2d = createVector(testPoint.x, testPoint.z)

            let np1 = p1.copy()
            let np2 = p2.copy()
            np1.sub(testPoint2d)
            np2.sub(testPoint2d)
            let x1 = np1.x
            let x2 = np2.x

            let y1 = np1.y
            let y2 = np2.y
            
            let r = other.size
            let dx = x2 - x1
            let dy = y2 - y1
            let dr = sqrt(dx*dx + dy*dy)
            let D = x1*y2 - x2*y1
            let triangle = r*r*dr*dr - D*D

            if (triangle < 0) {
                return false
            }

            let Px1 = (D*dy + sign(dy)*dx*sqrt(triangle)) / (dr*dr)
            let Px2 = (D*dy - sign(dy)*dx*sqrt(triangle)) / (dr*dr)

            let Py1 = (-D*dx + abs(dy)*sqrt(triangle)) / (dr*dr)
            let Py2 = (-D*dx - abs(dy)*sqrt(triangle)) / (dr*dr)

            function sign(x) {
                if (x < 0) {
                    return -1
                }
                return 1
            }

            let mx = min(x1, x2)
            let Mx = max(x1, x2)
            let my = min(y1, y2)
            let My = max(y1, y2)
            if (
                (Px1 >= mx && Px1 <= Mx && Py1 >= my && Py1 <= My) ||
                (Px2 >= mx && Px2 <= Mx && Py2 >= my && Py2 <= My)
            ) {
                return true
            }

            return false
        }
    }

    //vec is a player movement that collides with this wall
    //this pushes the vec against the wall
    moveAgainst(vec) {
        let vec2d = vec.copy()
        vec2d.y = vec2d.z
        vec2d.z = 0

        let vecMag  = vec2d.mag()
        let vecAngle = vec2d.heading()

        let wallAngle = this.p1.copy().sub(this.p2).heading()
        let finalAngle = wallAngle - vecAngle
        let finalMag = vecMag * cos(finalAngle)

        let ans = createVector(0, 0, 0)
        ans.x = finalMag * cos(-wallAngle)
        ans.y = vec.y
        ans.z = finalMag * sin(wallAngle)
        return ans
    }

    render() {
        let height = 300
        let width = this.p1.dist(this.p2)

        let mid = p5.Vector.lerp(this.p1, this.p2, 0.5)
        push()
            translate(mid.x, -height / 2, mid.y)

            let p1 = createVector(1, 0)
            let p2 = this.p1.copy().sub(this.p2)
            let angle = p1.angleBetween(p2) 
            rotateY(-angle)
            fill(191, 0, 230, 100)
            plane(width, height)
        pop()
    }
}

class NullCollider {
    constructor() {

    }

    isColliding(other) {
        return false
    }

    render() {}
}

class CompositieCollider {
    constructor(colliders) {
        this.colliders = colliders
    }

    isColliding(other) {
        for (let i = 0; i < this.colliders.length; i++) {
            if (this.colliders[i].isColliding(other)) {
                return true
            }
        }
        return false
    }

    render() {
        for (let i = 0; i < this.colliders.length; i++) {
            this.colliders[i].render()
        }
    }
}