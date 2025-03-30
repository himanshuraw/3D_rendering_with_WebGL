import { Transform } from './Transform.js';

export class Model {
    constructor(gl, path) {
        this.gl = gl;
        this.path = path;
        this.vertices = null;
        this.indices = null;
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.transform = new Transform();
        this.selected = false;
        this.isSelectable = true;
        this.transformationAxis = 'x';

        this.triangles = [];

        this.baseColor = [
            Math.random(),
            Math.random(),
            Math.random(),
        ];

        this.color = [...this.baseColor];

        this.boundingSphere = {
            center: vec3.create(),
            radius: 0,
        }
    }


    select() {
        this.selected = !this.selected;
        this.selected ? this.updateColor([1, 0.5, 0]) : this.updateColor(this.baseColor)
    }

    deselect() {
        this.selected = false;
        this.updateColor(this.baseColor)
    }

    updateColor(color) {
        this.color = color;
    }

    fixColor(color) {
        this.color = color;
        this.baseColor = color
    }

    setTransformationAxis(axis) {
        this.transformationAxis = axis;
    }

    handleRotation(delta) {
        switch (this.transformationAxis) {
            case 'x':
                this.transform.rotateBy(delta, 0, 0);
                break;
            case 'y':
                this.transform.rotateBy(0, delta, 0);
                break;
            case 'z':
                this.transform.rotateBy(0, 0, delta);
                break;
        }
    }

    handleScaling(scalingFactor) {
        this.transform.scaleBy(scalingFactor, scalingFactor, scalingFactor)
    }

    async load() {
        const response = await fetch(this.path);
        const text = await response.text();
        this.parseOBJ(text);
        this.setupBuffers();
    }

    parseOBJ(text) {
        const lines = text.split('\n');
        const positions = [];
        const normals = [];
        const vertices = [];
        const indices = [];
        const vertexMap = new Map();

        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts[0] === 'v') {
                positions.push(parts.slice(1, 4).map(Number));
            } else if (parts[0] === 'vn') {
                normals.push(parts.slice(1, 4).map(Number));
            } else if (parts[0] === 'f') {
                const faceData = parts.slice(1).map(p => {
                    const indices = p.split('/').map(Number);
                    return {
                        v: indices[0] - 1,
                        vn: indices[2] - 1
                    };
                });

                const triData = [];
                if (faceData.length === 4) {
                    triData.push(faceData[0], faceData[1], faceData[2]);
                    triData.push(faceData[0], faceData[2], faceData[3]);
                } else {
                    triData.push(...faceData);
                }

                for (const { v, vn } of triData) {
                    const key = `${v}/${vn}`;
                    if (!vertexMap.has(key)) {
                        vertexMap.set(key, vertices.length / 6);
                        vertices.push(...positions[v], ...normals[vn]);
                    }
                    indices.push(vertexMap.get(key));
                }
            }
        }

        this.vertices = new Float32Array(vertices);
        this.indices = new Uint16Array(indices);

        this.triangles = [];
        for (let i = 0; i < this.indices.length; i += 3) {
            const v0Index = this.indices[i];
            const v1Index = this.indices[i + 1];
            const v2Index = this.indices[i + 2];

            const v0 = vec3.fromValues(
                this.vertices[v0Index * 6],
                this.vertices[v0Index * 6 + 1],
                this.vertices[v0Index * 6 + 2]
            );

            const v1 = vec3.fromValues(
                this.vertices[v1Index * 6],
                this.vertices[v1Index * 6 + 1],
                this.vertices[v1Index * 6 + 2]
            );

            const v2 = vec3.fromValues(
                this.vertices[v2Index * 6],
                this.vertices[v2Index * 6 + 1],
                this.vertices[v2Index * 6 + 2]
            );

            this.triangles.push({ v0, v1, v2 });
        }


        this.calculateBoundingSphere();
    }

    calculateBoundingSphere() {
        const positions = this.vertices.filter((_, i) => i % 6 < 3);
        const center = vec3.create();

        let maxDistance = 0;

        positions.forEach((_, i) => {
            if (i % 3 === 0) {
                vec3.add(center, center, positions.subarray(i, i + 3));
            }
        });

        vec3.scale(center, center, 1 / (positions.length / 3));

        positions.forEach((_, i) => {
            if (i % 3 === 0) {
                const distance = vec3.distance(center, positions.subarray(i, i + 3));
                maxDistance = Math.max(maxDistance, distance);
            }
        });

        this.boundingSphere.center = center;
        this.boundingSphere.radius = maxDistance;
    }

    setupBuffers() {
        const gl = this.gl;

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    }

    draw(shader) {
        const gl = this.gl;
        this.transform.updateModelMatrix();

        shader.setUniformMatrix('uModelMatrix', this.transform.modelMatrix);

        const colorLoc = shader.getUniform('u_color');
        gl.uniform3fv(colorLoc, this.color);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        const positionLoc = shader.getAttribute('a_position');
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 24, 0);

        const normalLoc = shader.getAttribute('a_normal');
        gl.enableVertexAttribArray(normalLoc);
        gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 24, 12);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}