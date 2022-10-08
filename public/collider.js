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
    constructor(p1, p2) {
        this.p1 = p1
        this.p2 = p2
        //this.y = y
        //this.height = height
    }

    isColliding(other) {
        if (other instanceof WallCollider) {
            throw new Error("Not implemented")
        } else if (other instanceof SphereCollider) {
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
            let dx = x1 - x2
            let dy = y1 - y2
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

            if (
                ((Px1 > max(x1, x2) && Py1 > max(y1, y2)) || (Px1 < min(x1, x2) && Py1 < min(y1, y2))) &&
                ((Px2 > max(x1, x2) && Py2 > max(y1, y2)) || (Px2 < min(x1, x2) && Py2 < min(y1, y2)))
            ) {
                return false
            }
            return true
        }
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