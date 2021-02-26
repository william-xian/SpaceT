import * as THREE from "three"
import { Body } from "./Body"
import { C } from './C'
export default class SpaceScene {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    leftPressed: boolean
    body: Body
    time: number;
    alpha: number;
    beta: number;
    constructor() {
        this.scene = new THREE.Scene()
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1.0e0, 1.0e8)
        this.renderer = new THREE.WebGLRenderer()
        this.leftPressed = false;
        this.time = 0;
        this.alpha = 0;
        this.beta = 0;
        this.init()
    }
    private init() {
        let fR = 1.0e-6;
        let fV = 1.0e-6 * 100;
        let fW = Math.PI / 18;
        this.camera.position.set(1.49e11 * fR, 0, 0)
        this.updateLookAt();
        this.renderer.setClearColor(0x222222)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        window.addEventListener('resize', this.onWindowResize, false)
        window.addEventListener('mousewheel', this.onMousewheel, false);
        window.addEventListener('mousemove', this.onMousemove, false);
        window.addEventListener('mousedown', this.onMousedown, false);
        window.addEventListener('mouseup', this.onMouseup, false);
        window.addEventListener('keydown', this.onKeydown, false);
        document.body.appendChild(this.renderer.domElement);
        let viewer = document.getElementById('viewer');
        let mover = document.getElementById('mover');
        viewer.addEventListener('touchstart', this.onViewerTouchStart);
        viewer.addEventListener('touchend', this.onViewerTouchEnd);
        viewer.addEventListener('touchmove', this.onViewerTouchMove);
        mover.addEventListener('touchstart', this.onMoverTouchStart);
        mover.addEventListener('touchend', this.onMoverTouchEnd);
        mover.addEventListener('touchmove', this.onMoverTouchMove);

        let sun = new Body(33340, 6.96e8 * fV * 0.01, 0, 0, 0, 0);

        sun.addMoon(new Body(0.055, 2.44e6 * fV, 5.79e10 * fR, 0, 7.005 * C.A2PI, fW / 7.60));
        sun.addMoon(new Body(0.815, 6.053e6 * fV, 1.08e11 * fR, 0, 3.395 * C.A2PI, fW / 19.4));
        sun.addMoon(new Body(1, 6.378e6 * fV, 1.49e11 * fR, 0.0034, 0, fW / 31.6));
        sun.addMoon(new Body(0.107, 3.397e6 * fV, 2.28e11 * fR, 0.0052, 1.85 * C.A2PI, fW / 59.4));
        sun.addMoon(new Body(317.832, 7.1492e7 * fV, 7.78e11 * fR, 0.0648, 1.303 * C.A2PI, fW / 374));
        sun.addMoon(new Body(95.16, 6.0268e7 * fV, 1.43e12 * fR, 0.1076, 2.489 * C.A2PI, fW / 930));
        sun.addMoon(new Body(14.54, 2.5559e7 * fV, 2.87e12 * fR, 0.023, 0.773 * C.A2PI, fW / 2660));
        sun.addMoon(new Body(17.15, 2.4764e7 * fV, 4.50e12 * fR, 0.017, 1.770 * C.A2PI, fW / 5200));

        let earth = sun.moons[2];
        let moon = new Body(7.342e22, 1.738e6 * fV, 3.8443e8 * fR, 0.0549, 0, fW / 15);
        earth.addMoon(moon);

        this.body = sun;
        this.body.paint(this.scene, this.time);
        this.animate()
    }

    private updateLookAt() {
        let cp = this.camera.position;
        let unit = 1.0e3;
        let lookPoint = new THREE.Vector3(Math.cos(this.beta) * Math.cos(this.alpha) * unit + cp.x, Math.cos(this.beta) * Math.sin(this.alpha) * unit + cp.y, Math.sin(this.beta) * unit + cp.z);
        this.camera.lookAt(lookPoint);
    }

    private onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    private onMousewheel = (e: WheelEvent) => {
        if (e.deltaY > 0) {
            this.scene.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI / 180);
        } else {
            this.scene.rotateOnAxis(new THREE.Vector3(0, 0, 1), -Math.PI / 180);
        }
    }
    private onMouseup = (e: MouseEvent) => {
        console.log("onMouseup", e);
        this.leftPressed = false;
    }
    private onMousedown = (e: MouseEvent) => {
        console.log("onMousedown", e);
        this.leftPressed = true;
    }

    private onViewerTouchStart(e: TouchEvent) {
        console.log(e);
    }
    private onViewerTouchEnd(e: TouchEvent) {
        console.log(e);
    }
    private onViewerTouchMove(e: TouchEvent) {
        console.log(e);
    }

    private onMoverTouchStart(e: TouchEvent) {
        console.log(e);
    }
    private onMoverTouchEnd(e: TouchEvent) {
        console.log(e);
    }
    private onMoverTouchMove(e: TouchEvent) {
        console.log(e);
    }

    private onMousemove = (e: MouseEvent) => {
        if (this.leftPressed) {
            this.scene.rotateOnAxis(new THREE.Vector3(0, 1, 0), e.movementX / window.innerWidth * 2);
            this.scene.rotateOnAxis(new THREE.Vector3(1, 0, 0), e.movementY / window.innerHeight * 2);
        }
    }

    private onKeydown = (e: KeyboardEvent) => {
        console.log("onKeydown", e);
        const theta = Math.PI / 360;
        let backForthX = Math.cos(this.beta) * Math.cos(this.alpha) * C.E;
        let backForthY = Math.cos(this.beta) * Math.sin(this.alpha) * C.E;
        let backForthZ = Math.sin(this.beta) * C.E;

        let leftRighX = Math.sin(this.beta) * Math.sin(this.alpha) * C.E;
        let leftRighY = Math.sin(this.beta) * Math.cos(this.alpha) * C.E;
        let leftRighZ = Math.cos(this.beta) * C.E;
        switch (e.key) {
            case 'a':
                this.camera.position.x -= leftRighX;
                this.camera.position.y -= leftRighY;
                this.camera.position.z -= leftRighZ;
                break;
            case 'd':
                this.camera.position.x += leftRighX;
                this.camera.position.y += leftRighY;
                this.camera.position.z += leftRighZ;
                break;
            case 'w':
                this.camera.position.x += backForthX;
                this.camera.position.y += backForthY;
                this.camera.position.z += backForthZ;
                break;
            case 's':
                this.camera.position.x -= backForthX;
                this.camera.position.y -= backForthY;
                this.camera.position.z -= backForthZ;
                break;
            case 'i':
                this.alpha += theta;
                break;
            case 'k':
                this.alpha -= theta;
                break;
            case 'j':
                this.beta -= theta;
                break;
            case 'l':
                this.beta += theta;
                break;
            default:
        }
        this.updateLookAt();
        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
    }
    private render() {
        this.body.repaint(this.scene, this.time);
        //this.time++;
        this.renderer.render(this.scene, this.camera)
    }
    private animate = () => {
        requestAnimationFrame(this.animate)
        this.render()
    }
}
