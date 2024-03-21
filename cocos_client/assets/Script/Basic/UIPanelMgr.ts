import { _decorator, Prefab, instantiate, Node } from "cc";
import ResourcesManager from "./ResourcesMgr";


export default class UIPanelManger {

    public setRootView(rootView: Node) {
        this._rootView = rootView;
    }

    public getPanelIsShow(name :string): boolean {
        const nd = this._uiMap.get(name);
        if (nd != null && nd.isValid && nd.active) {
            return true;
        }
    }

    public getPanel(name: string) {
        const nd = this._uiMap.get(name);
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
        if (this._rootView == null ||
            !this._rootView.isValid) {
            return;
        }
        let nd = this._uiMap.get(name);
        if (nd != null && nd.isValid) {
            
        } else {
            const prefab = await this._resourceMgr.LoadABResource("prefab/" + name, Prefab);
            if (prefab != null) {
                nd = instantiate(prefab);
                nd.setParent(this._rootView);
                this._uiMap.set(name, nd);
            }
        }
        return nd;
    }

    private _uiMap: Map<string, Node> = new Map();
    private _resourceMgr: ResourcesManager = null;
    private _rootView: Node = null;
    public constructor(resourceMgr) {
        this._resourceMgr = resourceMgr;
    }
}
