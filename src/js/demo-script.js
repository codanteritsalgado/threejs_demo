import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

import stars from '../img/stars.jpg'

const car1URL = new URL('../assets/car1.glb', import.meta.url);
const car2URL = new URL('../assets/car2.glb', import.meta.url);
const car3URL = new URL('../assets/car3.glb', import.meta.url);

const models = [
    {url:car1URL, position: new THREE.Vector3(0, 0, 0)},
    {url:car2URL, position: new THREE.Vector3(-5, 0, 0)},
    {url:car3URL, position: new THREE.Vector3(5, 0, 0)},
]

const renderer = new THREE.WebGLRenderer();

//* Shados must be enabled
//* each object must set if is a shadow caster or reciever
renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

//? Camera control on clic hold
const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(-10, 30, 30);
orbit.update();

//? Adding a new "plane" for the main object
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

//? Adding a grid
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

//? SpotLight
const spotLight = new THREE.SpotLight(0xFFFFFF, 50000);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

// Light helper
// const sLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(sLightHelper);

//? FOG that increases exponentially
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

//* as cube
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    stars,
    stars,
    stars,
    stars,
    stars,
    stars
]);

const assetLoader = new GLTFLoader();

const gui = new dat.GUI();
const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    angle: 0.08,
    penumbra: 0,
    intensity: 50000,
    carCount: 0,
    currentIndex:0,
    createCar: function() {
        if (options.carCount < models.length) {
            options.carCount++;

            const model = models[options.currentIndex];

            assetLoader.load(model.url.pathname, function (gltf) {
                const carModel = gltf.scene;
                const scaleFactor = 0.5;
                const boundingBox = new THREE.Box3().setFromObject(carModel);
                const modelSize = boundingBox.getSize(new THREE.Vector3()).length();
                const scale = 30 / modelSize * scaleFactor;

                carModel.scale.set(scale, scale, scale);
                carModel.position.copy(model.position);
                carModel.castShadow = true;
                carModel.receiveShadow = true;

                scene.add(carModel);

                options.currentIndex = (options.currentIndex + 1) % models.length;
                buttonCreatecar.name(`Create Car (${models.length - options.carCount} left)`);
                if (options.carCount === models.length) {
                    buttonCreatecar.name("Maxed");
                    buttonCreatecar.domElement.disabled = true;
                }
            });
        }
    }
};

//todo ****** GUI CONTROLS ******
const buttonCreatecar = gui.add(options, 'createCar').name(`Create Car (${models.length} left)`);
gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 50000);
//todo ****** GUI CONTROLS ******

function animate(){

    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;
    // sLightHelper.update(); // Light helper

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

//? Resize the canvas and camera when window resizes
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})