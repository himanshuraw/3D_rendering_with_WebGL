export class Shader {
    constructor(gl, vsSource, fsSource) {
        this.gl = gl;
        this.program = this.createProgram(vsSource, fsSource);
    }

    createProgram(vsSource, fsSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fsSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Error linking program', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Error compiling shader', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    getAttribute(name) {
        return this.gl.getAttribLocation(this.program, name);
    }

    getUniform(name) {
        return this.gl.getUniformLocation(this.program, name);
    }

    use() {
        this.gl.useProgram(this.program);
    }

    setUniform3fv(name, value) {
        const location = this.gl.getUniformLocation(this.program, name);
        this.gl.uniform3fv(location, value);
    }

    setUniformMatrix(name, matrix) {
        const location = this.gl.getUniformLocation(this.program, name);
        this.gl.uniformMatrix4fv(location, false, matrix);
    }
}