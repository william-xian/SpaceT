import * as THREE from "three"
import { Vector3 } from "three"
import { Body } from "./Body"
import { C } from './C'
import { FlyControls } from "./FlyControls"


const innerWidth = window.innerWidth;
const innerHeight = window.innerHeight;

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
        this.camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1.0e0, 1.0e100)
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
        this.camera.position.set(0, 0, 4.60e11);
        this.renderer.setClearColor(0x222222)
        this.renderer.setSize(innerWidth, innerHeight)


        window.addEventListener('resize', this.onWindowResize, false)
        this.body = this.createBody();
        this.animate()
    }
    updateFRadius() {
        this.scene.clear();
        this.body = this.createBody();
    }

    updateCamera(bodyId:string) {
        const ids = bodyId.split('-');
        if(this.body && ids.length > 0) {
            let target:Body = this.body;
            for(let i = 1; i < ids.length; i++) {
                let id = Number.parseInt(ids[i]) -1;
                target = target.moons[id];
            }
            this.camera.parent?.remove(this.camera);
            this.camera.position.set(0,0,0);
            target.body.add(this.camera);
        }
    }

    createBody() {
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
        
        sun.paint(this.scene, this.time);
        return sun;
    }

    private onWindowResize = () => {
        this.camera.aspect = innerWidth / innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(innerWidth, innerHeight);
    }
    private render() {
        if(this.body) {
            this.body.repaint(this.scene, this.time);
            this.time++;
        }
        this.renderer.render(this.scene, this.camera)
    }
    private animate = () => {
        requestAnimationFrame(this.animate)
        this.controls.update(1);
        this.render()
    }
}
