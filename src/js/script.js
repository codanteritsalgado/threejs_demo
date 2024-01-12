import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'

import stars from '../img/stars.jpg'
import nebula from '../img/nebula.jpg'

const monkeyUrl = new URL('../assets/monkey.glb', import.meta.url);
const hondaUrl = new URL('../assets/honda_acty.glb', import.meta.url);

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

//? Control de camara con mouse sosteniendo el clic
const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

camera.position.set(-10, 30, 30);
orbit.update();//? siempre actualizar la orbita de la camara

//* Creation of an element, phase 1, skeleton
const boxGeometry = new THREE.BoxGeometry();
//* Creation of an element, phase 2, material
const boxMaterial = new THREE.MeshBasicMaterial({color:0x00FF00});
//* Creation of an element, phase 3, skeleton wearing the material
//* called 'Mesh' which is a 3D element cube, sphere, character
const box = new THREE.Mesh(boxGeometry, boxMaterial);
//* Add the "mesh" to te scene
scene.add(box);

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
// const gridHelper = new THREE.GridHelper(20, 50);
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

const sphereGeometry = new THREE.SphereGeometry(3, 10, 10);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color:0x0000FF,
    wireframe: false
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.position.set(-10, 10, 0);
sphere.castShadow = true;

scene.add(sphere)

// //? Light
// const ambientLight = new THREE.AmbientLight(0x333333);
// scene.add(ambientLight)
// //? Directional Light
// const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 8);
// scene.add(directionalLight)
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -12

// //* Directional Light helper
// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(dLightHelper);
// //* DLight shador helper
// const dLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(dLightShadowHelper);

//? SpotLight
const spotLight = new THREE.SpotLight(0xFFFFFF, 50000);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

//? FOG to blurr the image as you scroll out
// scene.fog = new THREE.Fog(0xFFFFFF, 0, 200);  
//? FOG that increases exponentially
scene.fog = new THREE.FogExp2(0xFFFFFF, 0.01);

//* background color
// renderer.setClearColor(0xFFEA00);
//* background image
const textureLoader = new THREE.TextureLoader();
//* as plain image
// scene.background = textureLoader.load(nebula);
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

//? Creating a new box with image textures
const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
//* Textures can be loaded on Mesh material creation or
//* can also be added on object.material.map
const box2Material = new THREE.MeshBasicMaterial({
    //color: 0x00FF00,
    //map: textureLoader.load(stars)
});
// const box2 = new THREE.Mesh(box2Geometry, box2Material);
//? Creating an array of images for every box head
const box2Multimaterial = [
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(nebula)}),
    new THREE.MeshBasicMaterial({map: textureLoader.load(stars)}),
]
const box2 = new THREE.Mesh(box2Geometry, box2Multimaterial);

scene.add(box2);
box2.position.set(0, 15, 10);
box2.material.map = textureLoader.load(stars)

const assetLoader = new GLTFLoader();
assetLoader.load(monkeyUrl.href, function(gltf){
    const model = gltf.scene;
    scene.add(model);
    model.position.set(-12, 4, 10);
});
assetLoader.load(hondaUrl.href, function(gltf){
    const model = gltf.scene;
    scene.add(model);
    model.position.set(8, 4, 10);
});

const gui = new dat.GUI();
const options = {
    sphereColor: '#ffea00',
    wireframe: false,
    speed: 0.03,
    angle: 0.08,
    penumbra: 0,
    intensity: 50000
};

//todo ****** GUI CONTROLS ******
gui.addColor(options, 'sphereColor').onChange(function(e){
    sphere.material.color.set(e)
})
gui.add(options, 'wireframe').onChange(function(e){
    sphere.material.wireframe = e
})
gui.add(options, 'speed', 0, 0.1);

gui.add(options, 'angle', 0, 1);
gui.add(options, 'penumbra', 0, 1);
gui.add(options, 'intensity', 0, 50000);
//todo ****** GUI CONTROLS ******

let step = 0;

const mousePosition = new THREE.Vector2();
window.addEventListener('mousemove', function(e){
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = (e.clientY / window.innerHeight) * 2 + 1;
});

const rayCaster = new THREE.Raycaster();

const sphereId = sphere.id
box2.name = 'TheBox';

function animate(time){
    box.rotation.x += time / 1000000;
    box.rotation.y += time / 1000000;

    step += options.speed;
    sphere.position.y = 10*Math.abs(Math.sin(step));

    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;
    sLightHelper.update();
    
    rayCaster.setFromCamera(mousePosition, camera);
    const intersects = rayCaster.intersectObjects(scene.children);
    console.log(intersects);

    for(let i = 0; i < intersects.length; i++){
        if(intersects[i].object.id === sphereId)
            intersects[i].object.material.color.set(0xFF0000);

            if(intersects[i].object.name === 'TheBox'){
                intersects[i].object.rotation.x = time / 1000;
                intersects[i].object.rotation.y = time / 1000;
            }
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

//? Resize the canvas and camera when window resizes
window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})