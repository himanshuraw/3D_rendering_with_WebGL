export class Camera {
    constructor(fov = 45, aspect = 1, near = 0.1, far = 100) {
        this.position = vec3.fromValues(4, 2, 5);
        this.target = vec3.fromValues(0, 0, 0);
        this.up = vec3.fromValues(0, 1, 0);

        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();

        this.setPerspective(fov, aspect, near, far);
        this.updateViewMatrix();
    }

    setPerspective(fov, aspect, near, far) {
        mat4.perspective(this.projectionMatrix, fov, aspect, near, far);
    }

    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }
}