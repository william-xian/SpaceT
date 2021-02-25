import * as THREE from "three"
import { Body } from "./Body"
export default class SpaceScene {
    scene: THREE.Scene
    view: THREE.Vector3
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer
    leftPressed: boolean
    body: Body
    time: number
    constructor() {
        this.scene = new THREE.Scene()
        this.view = new THREE.Vector3(0, 0, 0);
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 20000)
        this.renderer = new THREE.WebGLRenderer()
        this.leftPressed = false;
        this.time = 0;
        this.init()
    }
    private init() {
        this.camera.position.set(0, 0, 300)
        this.camera.lookAt(this.view);
        this.renderer.setClearColor(0x222222)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        window.addEventListener('resize', this.onWindowResize, false)
        window.addEventListener('mousewheel', this.onMousewheel, false);
        window.addEventListener('mousemove', this.onMousemove, false);
        window.addEventListener('mousedown', this.onMousedown, false);
        window.addEventListener('mouseup', this.onMouseup, false);
        window.addEventListener('keydown', this.onKeydown, false);
        document.body.appendChild(this.renderer.domElement);

        let sun = new Body(20, 6, 0, 0, 0, 0);

        var e = [
        { r: 5.79, t: 7.60 },
        { r: 10.8, t: 19.4 },
        { r: 14.9, t: 31.6 },
        { r: 22.8, t: 59.4 },
        { r: 77.8, t: 374 },
        { r: 143, t: 930 },
        { r: 287, t: 2660 },
        { r: 450, t: 5200 },
        { r: 590, t: 7820 }];
        let fR = 5;
        let fW = Math.PI/10;
        
        for(var i = 0; i < e.length; i++) {
            let b = new Body(20, 2, e[i].r*fR, 0.05, 0, fW/e[i].t);
            sun.addMoon(b);
        }
        let earth = sun.moons[2];
        let moon = new Body(5, 1, 10, 0, 0, Math.PI / 15);
        earth.addMoon(moon);

        this.body = sun;
        this.body.paint(this.scene, this.time);
        this.animate()
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

    private onMousemove = (e: MouseEvent) => {
        if (this.leftPressed) {
            this.scene.rotateOnAxis(new THREE.Vector3(0, 1, 0), e.movementX / window.innerWidth * 2);
            this.scene.rotateOnAxis(new THREE.Vector3(1, 0, 0), e.movementY / window.innerHeight * 2);
        }
    }

    private onKeydown = (e: KeyboardEvent) => {
        console.log("onKeydown", e);
        const alpha = Math.PI / 360;
        switch (e.key) {
            case 'a':
                this.camera.position.x -= 10;
                break;
            case 'd':
                this.camera.position.x += 10;
                break;
            case 'w':
                this.camera.position.y -= 10;
                break;
            case 's':
                this.camera.position.y += 10;
                break;
            case 'f':
                this.camera.position.z += 10;
                break;
            case 'v':
                this.camera.position.z -= 10;
                break;
            case 'j':
                this.scene.rotateX(alpha);
                break;
            case 'l':
                this.scene.rotateX(-alpha);
                break;
            case 'i':
                this.scene.rotateY(alpha);
                break;
            case 'k':
                this.scene.rotateY(-alpha);
                break;
            case 'h':
                this.scene.rotateZ(alpha);
                break;
            case 'n':
                this.scene.rotateZ(-alpha);
                break;
            default:
        }

        this.camera.updateProjectionMatrix();
        this.renderer.render(this.scene, this.camera);
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
