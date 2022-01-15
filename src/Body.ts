import * as THREE from "three"
import { C } from './C'

export class Body {
    id: Array<number>;
    mother: Body;
    m: number; r: number; a: number; e: number; orbitTheta: number; orbitPhi: number;
    k: number; b: number; c: number; t: number;
    alphaT: Array<number>;
    moons: Array<Body>;
    body: THREE.Object3D;
    orbit: THREE.Object3D;
    orbitMtr: THREE.Matrix4;
    constructor(m: number, r: number, a: number, e: number, orbitTheta: number, orbitPhi: number) {
        this.id = [];
        this.mother = null;
        this.alphaT = null;
        this.m = m; //质量
        this.r = r; //半径
        this.a = a; //轨道长半轴
        this.e = e; //离心率
        this.b = Math.sqrt(1 - e * e) * a; //轨道短半轴
        this.c = e * this.a;
        this.k = 4 * Math.PI * Math.PI / (C.G * m);
        this.t = 0;
        this.orbitTheta = orbitTheta; // 轨道与黄道面夹角
        this.orbitPhi = orbitPhi;
        this.moons = []; //卫星
        this.body = new THREE.Group();
        this.orbit = null;
        this.orbitMtr = null;
    }
    /**
     * 开普勒第2定理 面积定律行星和太阳的连线在相等的时间间隔内扫过相等的面积
     * @param a 椭圆长半轴
     * @param b 椭圆短半轴
     * @param alpah 中心角度
     * @returns 面积
     */
    private static area(a: number, b: number, alpah: number) {
        let c = Math.sqrt(a * a - b * b);
        return a * b * alpah - b * c * Math.sin(alpah)
    }

    /**
     * 
     * @param area 行星从近日点运行扫过的面积
     * @param a 椭圆长半轴
     * @param b 椭圆短半轴
     * @returns 夹角
     */
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
        let n = 36000;
        let s = 2 * Math.PI * a * b / n;
        this.alphaT = [];

        for (let i = 0; i < n; i++) {
            var alpha = Body.getAlpahByArea(i * s, a, b);
            this.alphaT.push(alpha);
        }
        var loader = new THREE.TextureLoader();
        if (this.id.length == 0) {
            loader.load('rs/body-0.png', (texture: THREE.Texture) => {
                this.body.add(this.createSphere(this.r, texture));
            }, () => { }, () => {
                this.body.add(this.createSphere(this.r, null));
            });
        } else {
            loader.load('rs/body-' + this.id.join('-') + '.png', (texture: THREE.Texture) => {
                this.body.add(this.createSphere(this.r, texture));
            }, () => { }, () => {
                this.body.add(this.createSphere(this.r, null));
            });
        }
    }

    private getAlpha(time: number) {
        if (this.t == 0) {
            return 0;
        }
        let i = (time * C.TIME_UNIT) % this.t;
        let index = Math.round(i * this.alphaT.length / this.t);
        return this.alphaT[index];
    }


    private createSphere(r: number, texture: THREE.Texture) {
        var i = 0;
        var p: Body = this;
        while (p.mother != null) { i++; p = p.mother };
        let f = (C.fRadius[i] | 1);
        var sphereGgeometry = new THREE.SphereGeometry(r * f, 32, 32);
        var sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture });
        var sphere = new THREE.Mesh(sphereGgeometry, sphereMaterial);
        return sphere;
    }

    private createOrbit() {
        if (this.mother) {
            const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
            var points = [];
            let a = this.a;
            let b = this.b;
            let c = this.c;
            for (var i = 0; i < 360; i++) {
                var alpha = i * Math.PI * 2 / 360;
                let cosA = Math.cos(alpha);
                let sinA = Math.sin(alpha);
                points.push(new THREE.Vector3(cosA * a, sinA * b, 0));
            }
            points.push(points[0]);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            let cosT = Math.cos(this.orbitTheta);
            let sinT = Math.sin(this.orbitTheta);
            let cosP = Math.cos(this.orbitPhi);
            let sinP = Math.sin(this.orbitPhi);
            this.orbitMtr = new THREE.Matrix4();
            this.orbitMtr.set(
                cosT * cosP, sinP, -sinT, 0,
                -sinP, cosP, 0, 0,
                sinT, 0, cosT, 0,
                0, 0, 0, 1);
            let p = new THREE.Vector3(-c, 0, 0);
            p.applyMatrix4(this.orbitMtr);
            this.orbitMtr.set(
                cosT * cosP, sinP, -sinT, p.x,
                -sinP, cosP, 0, p.y,
                sinT, 0, cosT, p.z,
                0, 0, 0, 1);
            geometry.applyMatrix4(this.orbitMtr);


            return new THREE.LineSegments(geometry, material);
        }
    }

    addMoon(body: Body) {
        let id = this.moons.length + 1;
        body.id = this.id.concat(id);
        this.moons.push(body);
        body.mother = this;
        body.t = Math.sqrt(this.k * body.a * body.a * body.a)
    }

    paint(scene: THREE.Scene, time: number) {
        this.init();
        scene.add(this.body);
        if (this.mother) {
            this.orbit = this.createOrbit();
            this.mother.body.add(this.orbit);
            let alpha = this.getAlpha(time);
            let a = this.a;
            let b = this.b;
            const mbp = this.mother.body.position;
            let cosA = Math.cos(alpha);
            let sinA = Math.sin(alpha);

            this.body.position.x = cosA * a;
            this.body.position.y = sinA * b;
            this.body.position.z = 0;
            this.body.position.applyMatrix4(this.orbitMtr);
            this.body.position.x += mbp.x;
            this.body.position.y += mbp.y;
            this.body.position.z += mbp.z;
        }
        this.moons.forEach((item: Body) => {
            item.paint(scene, time);
        });
    }

    repaint(scene: THREE.Scene, time: number) {
        let alpha = this.getAlpha(time);
        let a = this.a;
        let b = this.b;
        let c = this.c;
        let mbp = new THREE.Vector3(0, 0, 0);
        if (this.mother) {
            mbp = this.mother.body.position;
            let cosA = Math.cos(alpha);
            let sinA = Math.sin(alpha);
            this.body.position.x = cosA * a;
            this.body.position.y = sinA * b;
            this.body.position.z = 0;
            this.body.position.applyMatrix4(this.orbitMtr);
            this.body.position.x += mbp.x;
            this.body.position.y += mbp.y;
            this.body.position.z += mbp.z;
        }


        this.moons.forEach((moon: Body) => {
            moon.repaint(scene, time);
        });
    }

}