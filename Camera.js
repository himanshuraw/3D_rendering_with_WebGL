export class Camera {
    constructor(fov = 45, aspect = 1, near = 0.1, far = 100) {
        this.aspect = 1;
        this.fov = 45;
        this.near = 0.1;
        this.far = 100;

        this.mode = 'orbit';
        this.position = vec3.fromValues(4, 5, 8);
        this.target = vec3.fromValues(0, 0, 0);
        this.up = vec3.fromValues(0, 1, 0);

        this.rotationSpeed = 0.01;
        this.rotationAxis = 'free';

        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();

        this.setPerspective(fov, aspect, near, far);
        this.updateViewMatrix();
    }

    toggleViewMode(aspect) {
        this.mode = this.mode === 'orbit' ? 'top' : 'orbit';
        if (this.mode === 'top') {
            vec3.set(this.position, 0, 0, 10);
            mat4.ortho(this.projectionMatrix, -5, 5, -5, 5, 0.1, 100);
        } else {
            mat4.perspective(this.projectionMatrix, this.fov, aspect, this.near, this.far);
        }
        this.updateViewMatrix();
    }

    rotate(dx, dy) {
        const deltaTheta = dx * this.rotationSpeed;
        const deltaPhi = dy * this.rotationSpeed;
        const radius = vec3.distance(this.position, this.target)

        const toPosition = vec3.sub(vec3.create(), this.position, this.target);
        const spherical = {
            radius: vec3.length(toPosition),
            theta: Math.atan2(toPosition[2], toPosition[0]),
            phi: Math.acos(toPosition[1] / radius),
        }

        switch (this.rotationAxis) {
            case 'x':
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaPhi));
                break;
            case 'y':
                spherical.theta += deltaTheta;
                break;
            case 'z':
                const viewDirection = vec3.normalize(vec3.create(),
                    vec3.sub(vec3.create(), this.target, this.position)
                );
                const rotation = mat4.fromRotation(mat4.create(), deltaTheta, viewDirection);
                const newUp = vec3.transformMat4(vec3.create(), this.up, rotation);
                vec3.normalize(newUp, newUp);
                vec3.copy(this.up, newUp);
                break;
            default:
                spherical.theta += deltaTheta;
                spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - deltaPhi));
                break;
        }

        if (this.rotationAxis !== 'z') {
            const newPosition = vec3.fromValues(
                spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta),
                spherical.radius * Math.cos(spherical.phi),
                spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta)
            )

            vec3.add(this.position, this.target, newPosition);
        }

        this.updateViewMatrix();
    }

    setRotationAxis(axis) {
        this.rotationAxis = axis;
    }

    setPerspective(fov, aspect, near, far) {
        mat4.perspective(this.projectionMatrix, fov, aspect, near, far);
    }

    updateViewMatrix() {
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    }
}