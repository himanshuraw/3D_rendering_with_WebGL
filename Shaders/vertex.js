export const vsSource = `
    attribute vec3 a_position;
    attribute vec3 a_normal;

    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying vec3 vNormal;

    void main() {
        vNormal = a_normal;
        gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(a_position, 1.0);
    }
`;