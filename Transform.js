import { vec3, mat4, quat } from 'https://cdn.skypack.dev/gl-matrix';
export class Transform {
    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.rotation = quat.create();
        this.scale = vec3.fromValues(1, 1, 1);
        this.modelMatrix = mat4.create();
    }

    setTranslate(x, y, z) {
        vec3.set(this.position, x, y, z);
    }

    setRotate(x, y, z) {
        quat.fromEuler(this.rotation, x, y, z);
    }

    setScale(x, y, z) {
        vec3.set(this.scale, x, y, z);
    }

    translateBy(dx, dy, dz) {
        vec3.add(this.position, this.position, vec3.fromValues(dx, dy, dz));
    }

    rotateBy(axis, angle) {
        const q = quat.create();
        quat.setAxisAngle(q, axis, angle);
        quat.multiply(this.rotation, this.rotation, q);
        quat.normalize(this.rotation, this.rotation);
    }

    rotateByQuaternion(q) {
        quat.multiply(this.rotation, this.rotation, q);
        quat.normalize(this.rotation, this.rotation);
    }

    setRotationFromQuaternion(q) {
        quat.copy(this.rotation, q);
    }

    scaleBy(sx, sy, sz) {
        vec3.multiply(this.scale, this.scale, vec3.fromValues(sx, sy, sz));
    }

    updateModelMatrix() {
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        const rotationMatrix = mat4.create();
        mat4.fromQuat(rotationMatrix, this.rotation);
        mat4.multiply(this.modelMatrix, this.modelMatrix, rotationMatrix);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
    }
}