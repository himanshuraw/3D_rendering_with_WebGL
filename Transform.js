import { vec3, mat4 } from 'https://cdn.skypack.dev/gl-matrix';
export class Transform {
    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.rotation = vec3.fromValues(0, 0, 0);
        this.scale = vec3.fromValues(1, 1, 1);
        this.modelMatrix = mat4.create();
    }

    setTranslate(x, y, z) {
        vec3.set(this.position, x, y, z);
    }

    setRotate(x, y, z) {
        vec3.set(this.rotation, x, y, z);
    }

    setScale(x, y, z) {
        vec3.set(this.scale, x, y, z);
    }

    translateBy(dx, dy, dz) {
        vec3.add(this.position, this.position, vec3.fromValues(dx, dy, dz));
    }

    rotateBy(dx, dy, dz) {
        vec3.add(this.rotation, this.rotation, vec3.fromValues(dx, dy, dz));
    }

    scaleBy(sx, sy, sz) {
        vec3.add(this.scale, this.scale, vec3.fromValues(sx, sy, sz));
    }

    updateModelMatrix() {
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
    }
}