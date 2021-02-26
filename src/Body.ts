import * as THREE from "three"
import {C} from './C'

export class Body {

    mother: Body
    m: number; r: number; w: number; a: number; e: number; thetaZ: number;
    k: number; b: number; t:number;
    moons: Array<Body>;
    body: THREE.Object3D
    orbit: THREE.Object3D
    constructor(m: number, r: number, a: number, e: number, thetaZ: number, w: number) {
        this.mother = null;
        this.m = m; //质量
        this.r = r; //半径
        this.a = a; //轨道长半轴
        this.e = e; //离心率
        this.b = Math.sqrt(1 - e * e) * a; //轨道短半轴
        this.k = 4 * Math.PI * Math.PI / C.G * m;
        this.t = 0;
        this.w = w; //围绕母星角速度，TOOD 角速度是恒定吗？
        this.thetaZ = thetaZ; // 轨道与黄道面夹角
        this.moons = []; //卫星
        this.body = this.createSphere(this.r, 0xffff00);
        this.orbit = null;
    }

    repaint(scene: THREE.Scene, time: number) {
        if (this.mother) {
            scene.remove(this.orbit);
            this.orbit = this.createOrbit();
            scene.add(this.orbit);
            const mbp = this.mother.body.position;
            this.body.position.x = Math.cos(this.thetaZ)*Math.cos(this.w * time) * this.a + mbp.x;
            this.body.position.y = Math.cos(this.thetaZ)*Math.sin(this.w * time) * this.b + mbp.y;
            this.body.position.z = Math.sin(this.thetaZ)*this.a + mbp.z;
        } else {
            this.body.position.x = Math.cos(this.thetaZ)*Math.cos(this.w * time) * this.a;
            this.body.position.y = Math.cos(this.thetaZ)*Math.sin(this.w * time) * this.b;
            this.body.position.z = Math.sin(this.thetaZ)*this.a;
        }
        this.moons.forEach((moon: Body) => {
            moon.repaint(scene, time);
        });
    }

    private createSphere(r: number, color: number) {
        var sphereGgeometry = new THREE.SphereGeometry(r, 32, 32);
        var sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
        var sphere = new THREE.Mesh(sphereGgeometry, sphereMaterial);
        return sphere;
    }

    private createOrbit() {
        if (this.mother) {
            const mbp = this.mother.body.position;
            const material = new THREE.MeshBasicMaterial({ color: 0x808080 });
            var points = [];
            for (var i = 0; i < 360; i++) {
                var alpha = i * Math.PI * 2 / 360;
                points.push(new THREE.Vector3(Math.cos(this.thetaZ)*Math.cos(alpha) * this.a + mbp.x, Math.cos(this.thetaZ)*Math.sin(alpha) * this.b + mbp.y, Math.sin(this.thetaZ)*this.a + mbp.z));
            }
            points.push(points[0]);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            return new THREE.LineSegments(geometry, material);
        }
    }

    paint(scene: THREE.Scene, time: number) {
        scene.add(this.body);
        if (this.mother) {
            this.orbit = this.createOrbit();
            scene.add(this.orbit);
        }
        this.moons.forEach((item: Body) => {
            item.paint(scene, time);
        });
    }


    addMoon(body: Body) {
        this.moons.push(body);
        body.mother = this;
        body.t = Math.sqrt(this.k*body.a*body.a*body.a)
    }
}