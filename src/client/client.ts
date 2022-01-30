import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import * as CANNON from 'cannon-es'
import CannonDebugRenderer from './utils/cannonDebugRenderer'
import CannonUtils from './utils/cannonUtils'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'

// scene
const scene = new THREE.Scene()

// axes helper :: x is red, y is green, z is blue
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)

// light
const light1 = new THREE.SpotLight()
light1.intensity = 0.5
light1.position.set(5, 5, 5)
light1.angle = Math.PI / 4
light1.penumbra = 0.5
light1.castShadow = true
light1.shadow.mapSize.width = 600
light1.shadow.mapSize.height = 1024
light1.shadow.camera.near = 0.5
light1.shadow.camera.far = 20
scene.add(light1)

const ambientLight = new THREE.AmbientLight(0x404040)
ambientLight.intensity = 2
scene.add(ambientLight)

// camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
//camera.position.y = 4
camera.position.z = 5

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild(renderer.domElement)

// controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.screenSpacePanning = true
// controls.target.y = 2

// cannon world
const world = new CANNON.World()
// world.gravity.set(0, -9.82, 0)

const normalMaterial = new THREE.MeshNormalMaterial()
const phongMaterial = new THREE.MeshPhongMaterial({
    color: 0xE6007A,
    shininess: 6,
    specular: 0xffffff,
})

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

const stats = Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
const physicsFolder = gui.addFolder('Physics')
physicsFolder.add(world.gravity, 'x', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'y', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'z', -10.0, 10.0, 0.1)
physicsFolder.open()

const clock = new THREE.Clock()

const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32)
const cylinder = new THREE.Mesh(cylinderGeometry, phongMaterial)
scene.add(cylinder);
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const topSphere = new THREE.Mesh(sphereGeometry, phongMaterial)
topSphere.position.y = 1
scene.add(topSphere);
const bottomSphere = new THREE.Mesh(sphereGeometry, phongMaterial)
bottomSphere.position.y = -1
scene.add(bottomSphere);

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    let delta = clock.getDelta()
    if (delta > 0.1) delta = 0.1
    world.step(delta)
    cannonDebugRenderer.update()
    render()

    stats.update()
}

function render() {
    renderer.render(scene, camera)
}

animate()
