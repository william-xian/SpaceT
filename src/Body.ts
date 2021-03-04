import * as THREE from "three"
import { C } from './C'

export class Body {
    static color = 0;
    mother: Body
    lastMP: THREE.Vector3;
    m: number; r: number; a: number; e: number; orbitTheta: number; orbitPhi: number;
    k: number; b: number; t: number;
    alphaT: Array<number>;
    moons: Array<Body>;
    body: THREE.Object3D
    orbit: THREE.Object3D
    constructor(m: number, r: number, a: number, e: number, orbitTheta: number) {
        this.mother = null;
        this.alphaT = null;
        this.m = m; //质量
        this.r = r; //半径
        this.a = a; //轨道长半轴
        this.e = e; //离心率
        this.b = Math.sqrt(1 - e * e) * a; //轨道短半轴
        this.k = 4 * Math.PI * Math.PI / C.G * m;
        this.t = 0;
        this.orbitTheta = orbitTheta; // 轨道与黄道面夹角
        this.orbitPhi = 0;
        this.moons = []; //卫星
        this.body = null;
        this.orbit = null;
    }
    /**
     * 开普勒第2定理 面积定律行星和太阳的连线在相等的时间间隔内扫过相等的面积
     * @param alpah 中心角度
     * @returns 面积
     */
    private static area(a: number, b: number, alpah: number) {
        let c = Math.sqrt(a * a - b * b);
        return a * b * alpah - b * c * Math.sin(alpah)
    }

    private static getAlpahByArea(area: number, a: number, b: number) {
        var h = Math.PI * 2;
        var l = 0;
        var cnt = 1000;
        var x = (h + l) / 2
        do {
            var s = Body.area(a, b, x);
            if (Math.abs(s - area) < 1.0e-5) {
                return x;
            } else if (s > area) {
                h = x;
            } else {
                l = x;
            }
            x = (h + l) / 2;
        } while (--cnt > 0);
        return x;
    }
    private init() {
        let a = this.a;
        let b = this.b;
        let n = 3600;
        let s = 2 * Math.PI * a * b / n;
        this.alphaT = [];

        for (let i = 0; i < n; i++) {
            var alpha = Body.getAlpahByArea(i * s, a, b);
            this.alphaT.push(alpha);
        }
        //let color = ((Body.color & 0x3) << 21) | (((Body.color >> 2) & 0x3) << 13) | (((Body.color >> 4) & 0x3) << 5);
        let colors = [0xFFD700, 0xFF1493, 0xF0E68C, 0x8470FF, 0x00FF7F, 0x008000, 0x00FA9A];
        let color = colors[Body.color % colors.length]
        Body.color += 1;
        this.body = this.createSphere(this.r, color);
    }

    private getAlpha(time: number) {
        if (this.t == 0) {
            return 0;
        }
        let i = (time * C.TIME_UNIT) % this.t;
        let index = Math.round(i * this.alphaT.length / this.t);
        return this.alphaT[index];
    }


    private createSphere(r: number, color: number) {
        var i = 0;
        var p: Body = this;
        while (p.mother != null) { i++; p = p.mother };
        let f = (C.fRadius[i] | 1) * C.LENGTH_UNIT;
        var sphereGgeometry = new THREE.SphereGeometry(r * f, 32, 32);
        var sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
        var sphere = new THREE.Mesh(sphereGgeometry, sphereMaterial);
        return sphere;
    }

    private createOrbit() {
        if (this.mother) {
            const mbp = this.mother.body.position;
            const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
            var points = [];
            let a = this.a * C.LENGTH_UNIT;
            let b = this.b * C.LENGTH_UNIT;
            for (var i = 0; i < 360; i++) {
                var alpha = i * Math.PI * 2 / 360;
                points.push(new THREE.Vector3(Math.cos(this.orbitTheta) * Math.cos(alpha) * a + mbp.x, Math.cos(this.orbitTheta) * Math.sin(alpha) * b + mbp.y, Math.sin(this.orbitTheta) * a + mbp.z));
            }
            points.push(points[0]);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            return new THREE.LineSegments(geometry, material);
        }
    }

    addMoon(body: Body) {
        this.moons.push(body);
        body.mother = this;
        body.t = Math.sqrt(this.k * body.a * body.a * body.a)
    }

    paint(scene: THREE.Scene, time: number) {
        this.init();
        scene.add(this.body);
        if (this.mother) {
            this.orbit = this.createOrbit();
            this.lastMP = this.mother.body.position;
            scene.add(this.orbit);
        }
        this.moons.forEach((item: Body) => {
            item.paint(scene, time);
        });
    }

    repaint(scene: THREE.Scene, time: number) {
        let alpha = this.getAlpha(time);
        if (alpha == Number.NaN) return;
        let a = this.a * C.LENGTH_UNIT;
        let b = this.b * C.LENGTH_UNIT;
        if (this.mother) {
            scene.remove(this.orbit);
            this.orbit = this.createOrbit();
            scene.add(this.orbit);

            const mbp = this.mother.body.position;
            this.body.position.x = Math.cos(this.orbitTheta) * Math.cos(alpha) * a + mbp.x;
            this.body.position.y = Math.cos(this.orbitTheta) * Math.sin(alpha) * b + mbp.y;
            this.body.position.z = Math.sin(this.orbitTheta) * a + mbp.z;
        } else {
            this.body.position.x = Math.cos(this.orbitTheta) * Math.cos(alpha) * a;
            this.body.position.y = Math.cos(this.orbitTheta) * Math.sin(alpha) * b;
            this.body.position.z = Math.sin(this.orbitTheta) * a;
        }
        this.moons.forEach((moon: Body) => {
            moon.repaint(scene, time);
        });
    }

}