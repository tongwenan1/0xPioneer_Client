import {_decorator, instantiate, Node, Prefab} from 'cc';
import {BackpackItem} from './BackpackItem';
import {PopUpUI} from '../BasicView/PopUpUI';
import ItemData from "db://assets/Script/Model/ItemData";

const {ccclass, property} = _decorator;


@ccclass('LootsPopup')
export class LootsPopup extends PopUpUI {
    @property(Prefab)
    BackpackItemPfb: Prefab;

    @property(Node)
    itemsParentNode: Node;

    private _items: { id: string, num: number }[];

    override get typeName(): string {
        return "LootsPopup";
    }

    start() {
        this._refreshUI();
    }

    public showItems(items: { id: string, num: number }[]) {
        this._items = items;
        this._refreshUI();
        this.show(true);
    }

    private _refreshUI() {
        const items = this._items;

        for (const node of this.itemsParentNode.children) {
            node.destroy();
        }

        for (let i = 0; i < items.length; ++i) {
            // console.log(`show item: ${JSON.stringify(items[i])}`);
            const itemData = new ItemData(items[i].id, items[i].num);

            let itemTile = instantiate(this.BackpackItemPfb).getComponent(BackpackItem);
            itemTile.refreshUI(itemData);
            itemTile.node.parent = this.itemsParentNode;
        }
    }

    private onTapClose() {
        this.show(false);
    }
}