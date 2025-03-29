export class InputHandler {
    constructor(canvas, scene, camera) {
        this.canvas = canvas;
        this.scene = scene;
        this.camera = camera;
        this.speed = 0.1;

        this.keys = {};

        this.mouse = {
            x: 0,
            y: 0,
            dx: 0,
            dy: 0,
            button: {
                left: false,
                middle: false,
                right: false,
            }
        }

        this.canvas.onauxclick = (e) => { e.preventDefault() }
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));

        window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    onMouseDown(e) {
        switch (e.button) {
            case 0:
                this.mouse.button.left = true;
                this.selectModel(e);
                break;
            case 1:
                this.mouse.button.middle = true;
                break;
            case 2:
                this.mouse.button.right = true;
                break;
        }
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    onMouseUp(e) {
        switch (e.button) {
            case 0:
                this.mouse.button.left = false;
                break;
            case 1:
                this.mouse.button.middle = false;
                break;
            case 2:
                this.mouse.button.right = false;
                break;
        }
        this.mouse.dx = 0;
        this.mouse.dy = 0;
    }

    onMouseMove(e) {
        this.mouse.dx = e.clientX - this.mouse.x;
        this.mouse.dy = e.clientY - this.mouse.y;

        if (this.mouse.button.middle) {
            this.camera.rotate(this.mouse.dx, this.mouse.dy)
        }

        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    onKeyDown(e) {
        const key = e.key.toLowerCase()
        this.keys[key] = !this.keys[key];

        switch (key) {
            case 'tab':
                e.preventDefault();
                this.camera.toggleViewMode();
                break;
            case 'x':
                this.camera.setRotationAxis('x');
                break;
            case 'y':
                this.camera.setRotationAxis('y');
                break;
            case 'z':
                this.camera.setRotationAxis('z');
                break;
            case ' ':
                this.camera.setRotationAxis('free');
                vec3.set(this.camera.up, 0, 1, 0)
                break;
        }
    }

    selectModel(e) {
        if (this.camera.mode === 'orbit') return;

        const ray = this.getMouseRay(e.clientX, e.clientY);
        const selectModel = this.raycast(ray);

        this.scene.getModels().forEach(model => {
            model == selectModel ? model.select() : model.deselect();
        })
    }

    getMouseRay(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = x - rect.left;
        const mouseY = y - rect.top;

        const ndc = {
            x: (mouseX / this.canvas.width) * 2 - 1,
            y: -(mouseY / this.canvas.height) * 2 + 1,
        }

        const viewProjecttion = mat4.create();
        mat4.multiply(viewProjecttion, this.camera.projectionMatrix, this.camera.viewMatrix);
        const inverseViewProjection = mat4.create();
        mat4.invert(inverseViewProjection, viewProjecttion);

        const start = vec4.fromValues(ndc.x, ndc.y, -1, 1);
        vec4.transformMat4(start, start, inverseViewProjection);
        vec4.scale(start, start, 1 / start[3]);

        const end = vec4.fromValues(ndc.x, ndc.y, 1, 1);
        vec4.transformMat4(end, end, inverseViewProjection);
        vec4.scale(end, end, 1 / end[3]);

        return {
            origin: vec3.fromValues(start[0], start[1], start[2]),
            direction: vec3.normalize(vec3.create(), vec3.sub(vec3.create(), end, start))
        }
    }

    raycast(ray) {
        let closestModel = null;
        let closestDistance = Infinity;

        this.scene.getModels().forEach(model => {
            if (!this.intersectsBoundingSphere(ray, model)) return;

            const distance = this.getIntersectionDistance(ray, model);
            if (distance !== null && distance < closestDistance) {
                closestDistance = distance;
                closestModel = model;
            }
        })
        return closestModel;
    }

    intersectsBoundingSphere(ray, model) {
        const center = vec3.transformMat4(
            vec3.create(),
            model.boundingSphere.center,
            model.transform.modelMatrix,
        );

        const scale = Math.max(
            model.transform.scale[0],
            model.transform.scale[1],
            model.transform.scale[2]
        )

        const radius = model.boundingSphere.radius * scale;

        const toCenter = vec3.sub(vec3.create(), center, ray.origin);
        const t = vec3.dot(toCenter, ray.direction);
        const dSq = vec3.squaredLength(toCenter) - (t * t);

        return dSq <= radius * radius;
    }

    getIntersectionDistance(ray, model) {
        const inverseMatrix = mat4.create();
        mat4.invert(inverseMatrix, model.transform.modelMatrix);

        const localOrigin = vec3.transformMat4(vec3.create(), ray.origin, inverseMatrix);
        const localDirection = vec3.transformMat4(vec3.create(), ray.direction, inverseMatrix);
        vec3.normalize(localDirection, localDirection);

        let closestT = Infinity;
        for (const triangle of model.triangles) {
            // Möller–Trumbore implementation
            const edge1 = vec3.sub(vec3.create(), triangle.v1, triangle.v0);
            const edge2 = vec3.sub(vec3.create(), triangle.v2, triangle.v0);
            const h = vec3.cross(vec3.create(), localDirection, edge2);
            const a = vec3.dot(edge1, h);

            if (Math.abs(a) < 1e-6) continue;

            const f = 1.0 / a;
            const s = vec3.sub(vec3.create(), localOrigin, triangle.v0);
            const u = f * vec3.dot(s, h);
            if (u < 0 || u > 1) continue;

            const q = vec3.cross(vec3.create(), s, edge1);
            const v = f * vec3.dot(localDirection, q);
            if (v < 0 || u + v > 1) continue;

            const t = f * vec3.dot(edge2, q);
            if (t > 1e-4 && t < closestT) {
                closestT = t;
            }
        }

        return closestT === Infinity ? null : closestT;
    }
}