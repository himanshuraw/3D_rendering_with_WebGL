import { Axes } from "./Axes.js";
import { Camera } from "./Camera.js";
import { InputHandler } from "./InputHandler.js";
import { Model } from "./Model.js";
import { Scene } from "./Scene.js";
import { Shader } from "./Shader.js";
import { fsSource } from "./Shaders/fragment.js";
import { vsSource } from "./Shaders/vertex.js";
import { WebGLRenderer } from "./WebGLRenderer.js";

async function main() {
    const renderer = new WebGLRenderer();
    document.body.appendChild(renderer.getCanvas());
    const gl = renderer.glContext();
    const canvas = renderer.getCanvas();

    const scene = new Scene();
    const camera = new Camera();

    const axes = new Axes(gl);
    await axes.load();
    axes.addToScene(scene)

    const model = new Model(gl, 'assets/Cage.obj');
    await model.load();
    scene.add(model);

    // const model1 = new Model(gl, 'assets/Cube.obj');
    // await model1.load();
    // scene.add(model1);

    const blenderSphere = new Model(gl, 'assets/BlenderSphere.obj');
    await blenderSphere.load();
    scene.add(blenderSphere);

    console.log(scene.models)

    const shader = new Shader(gl, vsSource, fsSource);
    shader.use();

    new InputHandler(canvas, scene, camera)

    function animate() {
        camera.updateViewMatrix();
        shader.setUniformMatrix('uProjectionMatrix', camera.projectionMatrix);
        shader.setUniformMatrix('uViewMatrix', camera.viewMatrix);

        scene.getModels().forEach(model => {
            if (model.isMoving) {
                model.updatePosition();
                if (!model.isMoving) {
                    model.deselect();
                    scene.selectedModel = null;
                }
            }
        });

        renderer.render(scene, shader);
        requestAnimationFrame(animate);
    }

    animate();
}

main();