import * as THREE from "three"
import { Vector3 } from "three"
import { Body } from "./Body"
import { C } from './C'
import { FlyControls } from "./FlyControls"
export default class SpaceScene {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls:FlyControls;
    leftPressed: boolean;
    body: Body | undefined;
    time: number;
    constructor() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1.0e0, 1.0e100)
        this.renderer = new THREE.WebGLRenderer()
        this.leftPressed = false;
        this.time = 0;
        let scene:any = document.getElementById('scene');
        scene.appendChild(this.renderer.domElement);
        this.controls = new FlyControls(this.camera, scene)
        this.controls.update(this.time);
        this.init()
    }
    private init() {
        //this.camera.position.set(0, 0, 4.60e11);
        this.renderer.setClearColor(0x222222)
        this.renderer.setSize(window.innerWidth, window.innerHeight)


        window.addEventListener('resize', this.onWindowResize, false)


        let sun = new Body(1.9891e30, 6.96e8, 0, 0, 0, 0);

        sun.addMoon(new Body(3.3022e23, 2.44e6, 5.79e10, 0, 7.005 * C.A2PI, 0));
        
        sun.addMoon(new Body(4.869e24, 6.053e6, 1.08e11, 0, 3.395 * C.A2PI, 0));
        sun.addMoon(new Body(5.965e24, 6.378e6, 1.49e11, 0.0034, 0, 0));
        sun.addMoon(new Body(6.6219e23, 3.397e6, 2.28e11, 0.052, 1.85 * C.A2PI, 0));
        sun.addMoon(new Body(1.90e27, 7.1492e7, 7.78e11, 0.0648, 1.303 * C.A2PI, 0));
        sun.addMoon(new Body(5.6834e26, 6.0268e7, 1.43e12, 0.1076, 2.489 * C.A2PI, 0));
        sun.addMoon(new Body(8.6810e25, 2.5559e7, 2.87e12, 0.023, 0.773 * C.A2PI, 0));
        sun.addMoon(new Body(1.0247e26, 2.4764e7, 4.50e12, 0.017, 1.770 * C.A2PI, 0));
        let earth = sun.moons[2];
        let moon = new Body(7.342e22, 1.738e6, 3.8443e8, 0.0549, 0, 0);
        earth.addMoon(moon);
        sun.addMoon(new Body(1.0e15, 1.1e7, 2.68529e12, 0.967, 162.3 * C.A2PI, 0));
        earth.body.add(this.camera);
        this.camera.position.set(0, 0, 6.371e6);
        this.camera.lookAt(0,0,0);
        this.body = sun;
        this.body.paint(this.scene, this.time);
        this.animate()
    }

    private onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    private render() {
        if(this.body) {
            this.body.repaint(this.scene, this.time);
            this.time++;
            if (window.document.baseURI.toString().endsWith("?a=1")) {
                let mp = this.body.moons[0].body.position;
                let ep = this.body.moons[2].body.position;
                let lp = new Vector3(mp.x - ep.x, mp.y - ep.y, mp.z - mp.z);
                this.camera.lookAt(lp);
                this.camera.rotateZ(Math.PI / 2);
            }
        }
        this.renderer.render(this.scene, this.camera)
    }
    private animate = () => {
        requestAnimationFrame(this.animate)
        this.controls.update(1);
        this.render()
    }
}
