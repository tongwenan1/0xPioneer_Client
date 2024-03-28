import { _decorator, Prefab, instantiate, Node } from "cc";
import ResourcesManager from "./ResourcesMgr";


export default class UIPanelManger {

    public setUIRootView(rootView: Node) {
        this._uiRootView = rootView;
    }
    public setHUDRootView(rootView: Node) {
        this._hudRootView = rootView;
    }

    public getPanelIsShow(name: string): boolean {
        const nd = this._uiMap.get(name);
        if (nd != null && nd.isValid && nd.active) {
            return true;
        }
    }

    public getPanel(name: string) {
        const nd = this._uiMap.get(name);
        return nd && nd.isValid ? nd : null;
    }
    public getHUDPanel(name: string) {
        const nd = this._hudQueue.find(nd => nd.name == name);
        return nd && nd.isValid ? nd : null;
    }

    public removePanelByNode(node: Node) {
        for (const [key, value] of this._uiMap) {
            if (node == value) {
                this.removePanel(key);
                break;
            }
        }
    }
    public removePanel(name: string) {
        const nd = this._uiMap.get(name);
        nd && nd.isValid && nd.destroy();
        this._uiMap.delete(name);
    }

    public async openPanel(name: string): Promise<Node> {
        if (this._uiRootView == null ||
            !this._uiRootView.isValid) {
            return;
        }
        let nd = this._uiMap.get(name);
        if (nd != null && nd.isValid) {

        } else {
            nd = await this._open(name, this._uiRootView);
        }
        return nd;
    }

    public async openHUDPanel(name: string): Promise<Node> {
        if (this._hudRootView == null ||
            !this._hudRootView.isValid) {
            return;
        }
        const nd = await this._open(name, this._hudRootView);
        return nd;
    }
    public closeHUDPanel(node: Node) {
        for (let i = 0; i < this._hudQueue.length; i++) {
            if (node == this._hudQueue[i]) {
                const deleteNode = this._hudQueue.splice(i, 1);
                deleteNode[0].destroy();
                break;
            }
        }
    }
    private _resourceMgr: ResourcesManager = null;

    private _uiMap: Map<string, Node> = new Map();
    private _uiRootView: Node = null;

    private _hudRootView: Node = null;
    private _hudQueue: Node[] = [];
    public constructor(resourceMgr) {
        this._resourceMgr = resourceMgr;
    }

    private async _open(name: string, rootView: Node, path: string = "prefab/"): Promise<Node | null> {
        const prefab = await this._resourceMgr.LoadABResource(path + name, Prefab);
        if (prefab != null) {
            const nd = instantiate(prefab);
            nd.setParent(rootView);
            if (rootView == this._uiRootView) {
                this._uiMap.set(name, nd);

            } else if (rootView == this._hudRootView) {
                nd.name = name;
                this._hudQueue.push(nd);
            }
            return nd;
        }
        return null;
    }
}
