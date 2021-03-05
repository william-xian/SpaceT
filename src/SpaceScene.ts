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
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1.0e0, 1.0e100)
        this.renderer = new THREE.WebGLRenderer()
        this.leftPressed = false;
        this.time = 0;
        this.alpha = 0;
        this.beta = 0;
        this.init()
    }
    private init() {
        this.camera.position.set(0, 0, -4.60e11)
        this.alpha = Math.PI / 2;
        this.beta = Math.PI / 2;
        this.updateLookAt();
        this.renderer.setClearColor(0x222222)
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        window.addEventListener('resize', this.onWindowResize, false)
        window.addEventListener('mousewheel', this.onMousewheel, false);
        window.addEventListener('mousemove', this.onMousemove, false);
        window.addEventListener('mousedown', this.onMousedown, false);
        window.addEventListener('mouseup', this.onMouseup, false);
        window.addEventListener('keydown', this.onKeydown, false);

        let scene = document.getElementById('scene');
        scene.appendChild(this.renderer.domElement);
        let viewer = document.getElementById('viewer');
        let mover = document.getElementById('mover');
        viewer.addEventListener('touchstart', this.onViewerTouchStart);
        viewer.addEventListener('touchend', this.onViewerTouchEnd);
        viewer.addEventListener('touchmove', this.onViewerTouchMove);
        mover.addEventListener('touchstart', this.onMoverTouchStart);
        mover.addEventListener('touchend', this.onMoverTouchEnd);
        mover.addEventListener('touchmove', this.onMoverTouchMove);

        let sun = new Body(1.9891e30, 6.96e8, 0, 0, 0, 0);

        sun.addMoon(new Body(3.3022e23, 2.44e6, 5.79e10, 0, 7.005 * C.A2PI, 0));
        sun.addMoon(new Body(4.869e24, 6.053e6, 1.08e11, 0, 3.395 * C.A2PI, 0));
        sun.addMoon(new Body(5.965e24, 6.378e6, 1.49e11, 0.0034, 0, 0));
        sun.addMoon(new Body(6.6219e23, 3.397e6, 2.28e11, 0.052, 1.85 * C.A2PI, 0));
        sun.addMoon(new Body(1.90e27, 7.1492e7, 7.78e11, 0.0648, 1.303 * C.A2PI, 0));
        sun.addMoon(new Body(5.6834e26, 6.0268e7, 1.43e12, 0.1076, 2.489 * C.A2PI, 0));
        sun.addMoon(new Body(8.6810e25, 2.5559e7, 2.87e12, 0.023, 0.773 * C.A2PI, 0));
        sun.addMoon(new Body(1.0247e26, 2.4764e7, 4.50e12, 0.017, 1.770 * C.A2PI, 0));
        sun.addMoon(new Body(1.0e15, 1.1e7, 2.682e12, 0.967, 162.3 * C.A2PI, 0));
        let earth = sun.moons[2];
        let moon = new Body(7.342e22, 1.738e6, 3.8443e9, 0.0549, 0, 0);
        earth.addMoon(moon);

        this.body = sun;
        this.body.paint(this.scene, this.time);
        this.animate()
    }

    private updateLookAt() {
        let cp = this.camera.position;
        let unit = 1.0e4;
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
        console.log(this.camera.position);
    }
    private render() {
        this.body.repaint(this.scene, this.time);
        this.time++;
        this.renderer.render(this.scene, this.camera)
    }
    private animate = () => {
        requestAnimationFrame(this.animate)
        this.render()
    }
}
