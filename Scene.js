export class Scene {
    constructor() {
        this.models = [];
    }

    add(model) {
        if (model) {
            this.models.push(model);
        }
    }

    remove(model) {
        const index = this.models.indexOf(model);
        if (index >= 0) {
            this.models.splice(index, 1);
        }
    }

    getModels() {
        return this.models;
    }

    render(renderer, shader) {
        renderer.gl.enable(renderer.gl.DEPTH_TEST);
        this.models.forEach(model => model.draw(shader));
    }
}