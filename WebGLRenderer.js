export class WebGLRenderer {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }

        this.gl.enable(this.gl.DEPTH_TEST);
        this.setSize(900, 900);
        this.clear(0.5, 0.5, 0.5, 1);
    }

    setSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
    }

    clear(r, g, b, a) {
        this.gl.clearColor(r, g, b, a);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    render(scene, shader) {
        this.clear(0, 0, 0, 1);
        scene.render(this, shader);
    }

    glContext() {
        return this.gl;
    }

    getCanvas() {
        return this.canvas;
    }
}