import {
    CCString,
    Color,
    Component,
    EventMouse,
    Layout,
    Node,
    Prefab,
    Rect,
    Sprite,
    SpriteFrame,
    UIOpacity,
    UITransform,
    Vec2,
    Vec3,
    _decorator,
    color,
    instantiate,
    rect,
    v2,
    v3,
} from "cc";
import ViewController from "../../BasicView/ViewController";
import { InnerBuildingLatticeShowType, InnerBuildingLatticeStruct, InnerBuildingType, UserInnerBuildInfo } from "../../Const/BuildingDefine";
import { InnerBuildingView } from "./View/InnerBuildingView";
import InnerBuildingConfig from "../../Config/InnerBuildingConfig";
import { ResourcesMgr } from "../../Utils/Global";
import { InnerMainCityBuildingView } from "./View/InnerMainCityBuildingView";
import { InnerBarracksBuildingView } from "./View/InnerBarracksBuildingView";
import { InnerEnergyStationBuildingView } from "./View/InnerEnergyStationBuildingView";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import GameMainHelper from "../Helper/GameMainHelper";
import { DataMgr } from "../../Data/DataMgr";

const { ccclass, property } = _decorator;

@ccclass("InnerBuildingControllerRe")
export class InnerBuildingControllerRe extends ViewController {
    private _buildingMap: Map<InnerBuildingType, InnerBuildingView> = new Map();

    private _latticeItem: Node = null;
    private _latticeContents: Node[] = [];
    private _allLatticeItems: InnerBuildingLatticeStruct[] = [];
    private _latticeNum: number = 3;

    private _latticeBuildingOriginalPos: Vec3 = null;
    private _latticeBuildingOriginalStayLaticeItems: InnerBuildingLatticeStruct[] = [];
    private _latticeEditBuildingView: Node = null;
    private _ghostBuildingView: Node = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._latticeItem = this.node.getChildByPath("BuildingLattice/Content/LatticeContent");
        this._latticeItem.active = false;
    }

    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        this._prepareLattice();
        this._refreshLattice();
        await this._initBuilding();
        await this._refreshBuilding();
    }

    protected async viewDidAppear(): Promise<void> {
        super.viewDidAppear();
        this._refreshLattice();

        NotificationMgr.addListener(NotificationName.GAME_INNER_BUILDING_LATTICE_EDIT_CHANGED, this._onInnerBuildingLatticeEditChanged, this);

        NotificationMgr.addListener(NotificationName.GAME_INNER_LATTICE_EDIT_ACTION_MOUSE_DOWN, this._onEditActionMouseDown, this);
        NotificationMgr.addListener(NotificationName.GAME_INNER_LATTICE_EDIT_ACTION_MOUSE_UP, this._onEditActionMouseUp, this);
        NotificationMgr.addListener(NotificationName.GAME_INNER_LATTICE_EDIT_ACTION_MOUSE_MOVE, this._onEditActionMouseMove, this);
    }

    protected viewDidDisAppear(): void {
        super.viewDidDisAppear();
        this._refreshBuilding();

        NotificationMgr.removeListener(NotificationName.GAME_INNER_BUILDING_LATTICE_EDIT_CHANGED, this._onInnerBuildingLatticeEditChanged, this);

        NotificationMgr.removeListener(NotificationName.GAME_INNER_LATTICE_EDIT_ACTION_MOUSE_DOWN, this._onEditActionMouseDown, this);
        NotificationMgr.removeListener(NotificationName.GAME_INNER_LATTICE_EDIT_ACTION_MOUSE_UP, this._onEditActionMouseUp, this);
        NotificationMgr.removeListener(NotificationName.GAME_INNER_LATTICE_EDIT_ACTION_MOUSE_MOVE, this._onEditActionMouseMove, this);
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();
    }

    //-------------------------------------- function
    private _prepareLattice() {
        for (let i = 0; i < this._latticeNum; i++) {
            const item = instantiate(this._latticeItem);
            item.active = true;
            this._latticeItem.parent.addChild(item);
            this._latticeContents.push(item);
            for (const lattice of item.children) {
                this._allLatticeItems.push({
                    routerIndex: i,
                    node: lattice,
                    isEmpty: true,
                    showType: InnerBuildingLatticeShowType.None,
                    stayBuilding: null,
                });
            }
        }
        console.log("exce prare");
    }

    private async _initBuilding() {
        const innerBuilding = DataMgr.s.innerBuilding.data;
        let index: number = 0;
        const promise = [];
        for (const [key, value] of innerBuilding.entries()) {
            const config = InnerBuildingConfig.getByBuildingType(key);
            if (config != null) {
                const buildingParent = this.node.getChildByPath("BuildingLattice");
                const scale = v3(1 / buildingParent.scale.x, 1 / buildingParent.scale.y, 1 / buildingParent.scale.z);
                const buildingPrb = await ResourcesMgr.LoadABResource("prefab/game/inner/" + config.anim, Prefab);
                promise.push(buildingPrb);
                if (buildingPrb != null) {
                    const view = instantiate(buildingPrb);
                    view.setScale(scale);
                    view.setParent(buildingParent);
                    if (key == InnerBuildingType.MainCity) {
                        this._buildingMap.set(key, view.getComponent(InnerMainCityBuildingView));
                    } else if (key == InnerBuildingType.Barrack) {
                        this._buildingMap.set(key, view.getComponent(InnerBarracksBuildingView));
                    } else if (key == InnerBuildingType.EnergyStation) {
                        this._buildingMap.set(key, view.getComponent(InnerEnergyStationBuildingView));
                    } else {
                        this._buildingMap.set(key, view.getComponent(InnerBuildingView));
                    }
                    const size: number = config.size;
                    if (this._allLatticeItems.length > 0) {
                        const useItems: Node[] = [];
                        for (let i = 0; i < size; i++) {
                            let beginIndex: number = value.buildBeginLatticeIndex;
                            if (beginIndex == null) {
                                let inSameRouter: boolean = true;
                                let beginRouter: number = this._allLatticeItems[index].routerIndex;
                                for (let j = 1; j < size; j++) {
                                    if (beginRouter != this._allLatticeItems[index + j].routerIndex) {
                                        inSameRouter = false;
                                        break;
                                    }
                                }
                                if (inSameRouter) {
                                    beginIndex = index;
                                } else {
                                    for (const templeItem of this._allLatticeItems) {
                                        if (templeItem.routerIndex == beginRouter + 1) {
                                            beginIndex = this._allLatticeItems.indexOf(templeItem);
                                            break;
                                        }
                                    }
                                }
                                DataMgr.s.innerBuilding.changeBuildingLatticeBeginIndex(key, beginIndex);
                            }
                            if (beginIndex + i < this._allLatticeItems.length) {
                                const templeItem = this._allLatticeItems[beginIndex + i];
                                templeItem.isEmpty = false;
                                templeItem.stayBuilding = view;
                                useItems.push(templeItem.node);

                                const copyLattice = instantiate(templeItem.node);
                                copyLattice.name = "buildingLattice_" + i;
                                const copyWidth = copyLattice.getComponent(UITransform).width;
                                copyLattice.position = v3(-(((size - 1) / 2) * copyWidth) + i * copyWidth, copyLattice.position.y, 0);
                                view.addChild(copyLattice);
                            }
                        }
                        this._setBuildingPosByLattles(view, useItems);
                    }
                    index += size;
                }
            }
        }
    }
    private _setBuildingPosByLattles(building: Node, lattices: Node[]) {
        if (lattices.length > 0) {
            const currentParentView: Node = lattices[0].parent;
            let centerX: number = 0;
            let centerY: number = 0;
            if (lattices.length == 1) {
                centerX = lattices[0].position.x;
                centerY = lattices[0].position.y;
            } else if (lattices.length > 1) {
                for (const item of lattices) {
                    centerX += item.position.x;
                    centerY += item.position.y;
                }
                centerX = centerX / lattices.length;
                centerY = centerY / lattices.length;
            }
            const pos = building.parent
                .getComponent(UITransform)
                .convertToNodeSpaceAR(currentParentView.getComponent(UITransform).convertToWorldSpaceAR(v3(centerX, centerY, 0)));
            building.position = pos;
        }
    }

    private _refreshBuilding() {
        const innerBuilds = DataMgr.s.innerBuilding.data;
        this._buildingMap.forEach(async (value: InnerBuildingView, key: InnerBuildingType) => {
            if (innerBuilds.has(key)) {
                value.node.active = true;
                await value.refreshUI(innerBuilds.get(key), !GameMainHelper.instance.isEditInnerBuildingLattice);
            } else {
                value.node.active = false;
            }
        });
    }
    private _refreshLattice() {
        for (const item of this._allLatticeItems) {
            item.node.active = GameMainHelper.instance.isEditInnerBuildingLattice;

            let useColor = null;
            if (item.showType == InnerBuildingLatticeShowType.None) {
                if (item.isEmpty) {
                    useColor = Color.WHITE;
                } else {
                    useColor = Color.YELLOW;
                }
            } else if (item.showType == InnerBuildingLatticeShowType.Clean) {
                useColor = Color.GREEN;
            } else if (item.showType == InnerBuildingLatticeShowType.Error) {
                useColor = Color.RED;
            }
            item.node.getChildByPath("Mask/SpriteSplash").getComponent(Sprite).color = useColor;
        }
    }

    private _checkEditBuildingCanSetLattice(): { canSet: boolean; useLattices: InnerBuildingLatticeStruct[] } {
        for (const item of this._allLatticeItems) {
            item.showType = InnerBuildingLatticeShowType.None;
        }
        if (this._latticeEditBuildingView == null) {
            return { canSet: false, useLattices: [] };
        }
        let buildingSize: number = 0;
        const editBuildingBoxes: Rect[] = [];
        for (const child of this._latticeEditBuildingView.children) {
            if (child.name.startsWith("buildingLattice_")) {
                editBuildingBoxes.push(child.getComponent(UITransform).getBoundingBoxToWorld());
                buildingSize += 1;
            }
        }
        let currentUseItems: InnerBuildingLatticeStruct[] = [];
        for (let i = 0; i < editBuildingBoxes.length; i++) {
            const standbyLattice: { intersection: Rect; item: InnerBuildingLatticeStruct }[] = [];
            for (const item of this._allLatticeItems) {
                const itemBox = item.node.getComponent(UITransform).getBoundingBoxToWorld();
                const intersection: Rect = rect(0, 0, 0, 0);
                Rect.intersection(intersection, itemBox, editBuildingBoxes[i]);
                if (intersection.width > 0 && intersection.height > 0) {
                    standbyLattice.push({
                        intersection: intersection,
                        item: item,
                    });
                }
            }
            // is intersect
            if (standbyLattice.length > 0) {
                standbyLattice.sort((a, b) => {
                    return b.intersection.width * b.intersection.height - a.intersection.width * a.intersection.height;
                });
                currentUseItems.push(standbyLattice[0].item);
                editBuildingBoxes.splice(i, 1);
                i--;
            }
        }
        // delete the same element
        currentUseItems = currentUseItems.reduce((accumulator: InnerBuildingLatticeStruct[], current: InnerBuildingLatticeStruct) => {
            if (!accumulator.some((temple) => temple == current)) {
                accumulator.push(current);
            }
            return accumulator;
        }, []);
        let isAllIntersectItemClean: boolean = true;
        for (const item of currentUseItems) {
            if (!item.isEmpty) {
                isAllIntersectItemClean = false;
                break;
            }
        }
        const canSet: boolean = isAllIntersectItemClean && editBuildingBoxes.length <= 0 && currentUseItems.length == buildingSize;
        for (const item of currentUseItems) {
            item.showType = canSet ? InnerBuildingLatticeShowType.Clean : InnerBuildingLatticeShowType.Error;
        }
        return { canSet: canSet, useLattices: currentUseItems };
    }
    //----------------------------------------- notificaiton
    private _onInnerBuildingLatticeEditChanged() {
        const edit: boolean = GameMainHelper.instance.isEditInnerBuildingLattice;
        if (edit) {
            GameMainHelper.instance.changeGameCameraPosition(Vec3.ZERO, true);
            GameMainHelper.instance.changeGameCameraZoom(1, true);
        }
        this._refreshBuilding();
        this._refreshLattice();
    }

    private _onEditActionMouseDown(data: { worldPos: Vec3 }) {
        // const localPos: Vec3 = this.node.getChildByPath("BuildingLattice").getComponent(UITransform).convertToNodeSpaceAR(data.worldPos);
        this._buildingMap.forEach((value: InnerBuildingView, key: InnerBuildingType) => {
            if (value.node.getComponent(UITransform).getBoundingBoxToWorld().contains(v2(data.worldPos.x, data.worldPos.y))) {
                // ghost show
                if (this._ghostBuildingView == null) {
                    this._ghostBuildingView = instantiate(value.node);
                    this._ghostBuildingView.parent = value.node.parent;
                    this._ghostBuildingView.addComponent(UIOpacity).opacity = 150;
                }
                // moveBuilding
                this._latticeBuildingOriginalPos = value.node.position.clone();
                this._latticeEditBuildingView = value.node;
                this._latticeEditBuildingView.setSiblingIndex(999);
                this._latticeBuildingOriginalStayLaticeItems = [];
                for (const item of this._allLatticeItems) {
                    if (!item.isEmpty && item.stayBuilding == this._latticeEditBuildingView) {
                        item.isEmpty = true;
                        item.stayBuilding = null;
                        this._latticeBuildingOriginalStayLaticeItems.push(item);
                    }
                }
                this._checkEditBuildingCanSetLattice();
                this._refreshLattice();
            }
        });
    }
    private _onEditActionMouseUp(data: { worldPos: Vec3 }) {
        if (this._latticeEditBuildingView != null) {
            const canSetData = this._checkEditBuildingCanSetLattice();
            if (canSetData.canSet) {
                const useItems = [];
                let minIndex: number = 9999999;
                for (const item of canSetData.useLattices) {
                    item.isEmpty = false;
                    item.stayBuilding = this._latticeEditBuildingView;
                    useItems.push(item.node);
                    const templeIndex: number = this._allLatticeItems.indexOf(item);
                    if (templeIndex >= 0 && templeIndex < this._allLatticeItems.length) {
                        minIndex = Math.min(minIndex, templeIndex);
                    }
                }
                this._buildingMap.forEach((value: InnerBuildingView, key: InnerBuildingType) => {
                    if (value.node == this._latticeEditBuildingView) {
                        DataMgr.s.innerBuilding.changeBuildingLatticeBeginIndex(key, minIndex);
                    }
                });
                this._setBuildingPosByLattles(this._latticeEditBuildingView, useItems);
            } else {
                this._latticeEditBuildingView.position = this._latticeBuildingOriginalPos;
                for (const item of this._latticeBuildingOriginalStayLaticeItems) {
                    item.isEmpty = false;
                    item.stayBuilding = this._latticeEditBuildingView;
                }
            }
            for (const item of this._allLatticeItems) {
                item.showType = InnerBuildingLatticeShowType.None;
            }
            // change index
            this._buildingMap.forEach((value: InnerBuildingView, key: InnerBuildingType) => {
                for (let i = 0; i < this._allLatticeItems.length; i++) {
                    if (value.node == this._allLatticeItems[i].stayBuilding) {
                        value.node.setSiblingIndex((i + 1) * 1000 + this._allLatticeItems[i].routerIndex);
                        break;
                    }
                }
            });
            this._refreshLattice();
        }
        if (this._ghostBuildingView != null) {
            this._ghostBuildingView.destroy();
        }
        this._latticeBuildingOriginalPos = null;
        this._latticeEditBuildingView = null;
        this._ghostBuildingView = null;
    }
    private _onEditActionMouseMove(data: { movement: Vec2 }) {
        if (this._latticeEditBuildingView != null) {
            // const currentPos = v3(
            //     this._latticeEditBuildingView.position.x + data.movement.x / this.node.scale.x,
            //     this._latticeEditBuildingView.position.y + data.movement.y / this.node.scale.y
            // );

            const currentPos = v3(
                this._latticeEditBuildingView.position.x + data.movement.x ,
                this._latticeEditBuildingView.position.y + data.movement.y
            );

            this._latticeEditBuildingView.position = currentPos;
            this._checkEditBuildingCanSetLattice();
            this._refreshLattice();
        }
    }
}
