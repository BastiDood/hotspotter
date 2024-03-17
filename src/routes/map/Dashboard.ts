import { Control } from 'ol/control';
import type { Coordinate } from 'ol/coordinate';
import Dashboard from './Dashboard.svelte';

export class DashboardControl extends Control {
    #component: Dashboard;

    constructor(center: Coordinate) {
        const target = document.createElement('div');
        target.style.display = 'contents';
        super({ element: target });
        this.#component = new Dashboard({ target, props: { center } });
    }

    protected disposeInternal() {
        this.#component.$destroy();
        super.disposeInternal();
    }

    get view() {
        return this.#component.view;
    }

    get gps() {
        return this.#component.gps;
    }

    get hex() {
        return this.#component.hex;
    }

    get source() {
        return this.#component.source;
    }
}
