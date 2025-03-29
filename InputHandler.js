export class InputHandler {
    constructor(canvas, scene) {
        this.canvas = canvas;
        this.scene = scene;
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
            case 0: this.mouse.button.left = true; break;
            case 1: this.mouse.button.middle = true; break;
            case 2: this.mouse.button.right = true; break;
        }
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    onMouseUp(e) {
        this.mouse.dx = 0;
        this.mouse.dy = 0;
    }

    onMouseMove(e) {
        this.mouse.dx = e.clientX - this.mouse.x;
        this.mouse.dy = e.clientY - this.mouse.y;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    onKeyDown(e) {
        this.keys[e.key.toLowerCase()] = !this.keys[e.key.toLowerCase()];
    }
}