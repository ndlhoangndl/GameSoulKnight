import * as THREE from 'three'

import {Scene} from '../core/Scene.js'
import {Renderer} from '../core/Renderer.js'
import {Camera} from '../core/camera.js'
import {GameLoop} from '../core/Gameloop.js'

import {Player} from '../Entities/Player/Player.js'
import {PlayerController} from '../Entities/Player/PlayerControl.js'
import {Bullet} from '../Entities/Bullet.js'
import {Enemy} from '../Entities/Enemy/Enemy.js'
import {EnemyManager} from '../Entities/Enemy/EnemyManager.js'

import {CollisionSystem} from '../Systems/Collision.js'
import {Input} from '../Systems/Input.js'
import {SpawnSystem} from '../Systems/SpawnSystem.js'

const scene = new Scene();
const camera = new Camera();
const renderer = new Renderer();
const input = new Input();
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const targetPoint = new THREE.Vector3();

const loader = new THREE.TextureLoader();

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

const playerTexture = loader.load('/Player.png');
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({
    map: playerTexture,
    transparent: true
});
const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(playerMesh);

const player = new Player(playerMesh);
const playerController = new PlayerController(player, input);

const mapTexture = loader.load('/map.jpg');
mapTexture.wrapS = THREE.RepeatWrapping;
mapTexture.wrapT = THREE.RepeatWrapping;
mapTexture.repeat.set(25, 25);

const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({map: mapTexture});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
scene.add(ground);

const enemyManager = new EnemyManager();

const bossTexture = loader.load('/boss.png');
const enemyGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const enemyMat = new THREE.MeshStandardMaterial({map: bossTexture, transparent: true});
const enemyMesh = new THREE.Mesh(enemyGeo, enemyMat);
enemyMesh.position.set(10, 0.25, -10);
scene.add(enemyMesh);

const enemy = new Enemy(enemyMesh);
enemy.setBillboardCamera(camera);
enemyManager.addEnemy(enemy);

const collisionSystem = new CollisionSystem(player, enemyManager);

const bullets = [];

const spawnSystem = new SpawnSystem(scene, enemyManager, camera, bossTexture, playerMesh)

window.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, targetPoint);

    const direction = new THREE.Vector3();
    direction.subVectors(targetPoint, playerMesh.position).normalize();
    direction.y = 0;

    const bulletGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const bulletMat = new THREE.MeshBasicMaterial({color: 0xffcc00});
    const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
    bulletMesh.position.copy(playerMesh.position);
    scene.add(bulletMesh);

    const bullet = new Bullet(bulletMesh, direction, 15);
    bullets.push(bullet);
});

const gameLoop = new GameLoop(
    (dt) => {
        spawnSystem.update(dt)

        playerController.update();
        player.update(dt);
        enemyManager.update(dt, player);
        collisionSystem.update();

        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.update(dt);

            for (let j = enemyManager.enemies.length - 1; j >= 0; j--) {
                const enemy = enemyManager.enemies[j];
                const dist = b.mesh.position.distanceTo(enemy.mesh.position);
                const hitThreshold = b.radius + enemy.radius;

                if (dist < hitThreshold) {
                    enemy.takeDamage(20);
                    b.isDead = true;

                    if (enemy.isDead) {
                        scene.remove(enemy.mesh);
                        enemyManager.enemies.splice(j, 1);
                        console.log("Kẻ địch đã bị tiêu diệt!");
                    }
                    break;
                }
            }

            if (b.isDead) {
                scene.remove(b.mesh);
                bullets.splice(i, 1);
            }
        }

        const offset = new THREE.Vector3(0, 15, 10);
        camera.position.copy(playerMesh.position).add(offset);
        camera.lookAt(playerMesh.position);
    },
    () => {
        renderer.render(scene, camera);
    }
);

gameLoop.start();