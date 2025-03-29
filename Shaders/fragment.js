export const fsSource = `
    precision mediump float;

    varying vec3 vNormal;
    uniform vec3 u_color;

    void main() {
        vec3 front_light = normalize(vec3(0.5, 1.0, 0.7)); 
        vec3 back_light = normalize(vec3(-0.8, -0.6, -0.4)); 

        float diff1 = max(dot(vNormal, front_light), 0.0);
        float diff2 = max(dot(vNormal, back_light), 0.0);

        gl_FragColor = vec4(vec3(diff1 + diff2) * u_color, 1.0);
    }
`;
