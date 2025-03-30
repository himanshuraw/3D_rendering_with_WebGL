import { Model } from "./Model.js";

export class Axes {
    constructor(gl) {
        this.xAxis = this.createAxis(gl, 'x');
        this.yAxis = this.createAxis(gl, 'y');
        this.zAxis = this.createAxis(gl, 'z');
    }

    async load() {
        await Promise.all([
            this.xAxis.load(),
            this.yAxis.load(),
            this.zAxis.load(),
        ]);
    }

    createAxis(gl, axis) {
        const model = new Model(gl, 'assets/Axis.obj');
        model.isSelectable = false;

        const rotation = quat.create();
        switch (axis) {
            case 'x':
                model.fixColor([1, 0, 0]);
                quat.setAxisAngle(rotation, [0, 0, 1], -Math.PI / 2);
                model.transform.rotation = rotation;
                break;
            case 'y':
                model.fixColor([0, 1, 0]);
                break;
            case 'z':
                model.fixColor([0, 0, 1]);
                quat.setAxisAngle(rotation, [1, 0, 0], Math.PI / 2);
                model.transform.rotation = rotation;
                break;
        }
        return model;
    }

    addToScene(scene) {
        scene.add(this.xAxis);
        scene.add(this.yAxis);
        scene.add(this.zAxis);
    }
}