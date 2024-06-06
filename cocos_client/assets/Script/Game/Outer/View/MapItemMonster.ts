import { _decorator, Component, Node, Vec2, Vec3, CCString, UITransform, Label, UIOpacity } from "cc";
import { LanMgr } from "../../../Utils/Global";
import { MapPioneerLogicType, MapPioneerActionType, MapPioneerMoveDirection, MapPioneerObject, MapPioneerType } from "../../../Const/PioneerDefine";
import { DataMgr } from "../../../Data/DataMgr";
import NotificationMgr from "../../../Basic/NotificationMgr";
import { NotificationName } from "../../../Const/Notification";

const { ccclass, property } = _decorator;

@ccclass("MapItemMonster")
export class MapItemMonster extends Component {
    private _model: MapPioneerObject = null;

    public refreshUI(model: MapPioneerObject) {
        this._model = model;

        this._nameLabel.string = LanMgr.getLanById(model.name);
        this.node.getChildByPath("Icon/Level").getComponent(Label).string = "Lv." + model.level;

        let moveCounting: boolean = false;
        if (model.logics.length > 0) {
            const logic = model.logics[0];
            if (logic.type == MapPioneerLogicType.stepmove && logic.currentCd > 0) {
                moveCounting = true;
                this._moveCountLabel.string = "movecount:" + logic.currentCd + "s";
            }
        }
        this._moveCountLabel.node.active = moveCounting;
        this._moveCountLabel.node.active = false;

        for (const type of this._monsterTypeNames) {
            const view = this.node.getChildByPath("role/" + type);
            view.active = type == model.animType;
            if (view.active) {
                this._currentShowMonster = view;
                view.getChildByPath("idle").active = model.actionType == MapPioneerActionType.idle;
                view.getChildByPath("walk_left").active =
                    model.actionType == MapPioneerActionType.moving && model.moveDirection == MapPioneerMoveDirection.left;
                view.getChildByPath("walk_right").active =
                    model.actionType == MapPioneerActionType.moving && model.moveDirection == MapPioneerMoveDirection.right;
                view.getChildByPath("walk_top").active = model.actionType == MapPioneerActionType.moving && model.moveDirection == MapPioneerMoveDirection.top;
                view.getChildByPath("walk_bottom").active =
                    model.actionType == MapPioneerActionType.moving && model.moveDirection == MapPioneerMoveDirection.bottom;
            }
        }

        this.node.active = model.actionType != MapPioneerActionType.fighting;

        this.node.getChildByPath("Icon/Difficult").active = model.type == MapPioneerType.hred && model.level > DataMgr.s.artifact.getArtifactLevel();
    }

    public shadowMode() {
        this.node.getComponent(UIOpacity).opacity = 100;
        for (const type of this._monsterTypeNames) {
            const view = this.node.getChildByPath("role/" + type);
            if (view.active) {
                this._currentShowMonster = view;
                view.getChildByPath("idle").active = true;
                view.getChildByPath("idle/Monster_Shadow").active = false;
                view.getChildByPath("walk_left").active = false;
                view.getChildByPath("walk_right").active = false;
                view.getChildByPath("walk_top").active = false;
                view.getChildByPath("walk_bottom").active = false;
            }
        }
        this._nameLabel.node.active = false;
        this._moveCountLabel.node.active = false;
    }

    private _nameLabel: Label = null;
    private _moveCountLabel: Label = null;
    private _currentShowMonster: Node = null;
    private _monsterTypeNames: string[] = [
        "monster_a_1",
        "monster_a_2",
        "monster_a_3",

        "monster_b_1",
        "monster_b_2",
        "monster_b_3",

        "monster_c_1",
        "monster_c_2",
        "monster_c_3",
    ];
    onLoad() {
        this._nameLabel = this.node.getChildByPath("name").getComponent(Label);
        this._moveCountLabel = this.node.getChildByPath("MoveCountLabel").getComponent(Label);

        NotificationMgr.addListener(NotificationName.ARTIFACT_EQUIP_DID_CHANGE, this._onArtifactEquipChange, this);
    }

    update(deltaTime: number) {}

    protected onDestroy(): void {
        NotificationMgr.removeListener(NotificationName.ARTIFACT_EQUIP_DID_CHANGE, this._onArtifactEquipChange, this);
    }

    //------------------------------------ notification
    private _onArtifactEquipChange() {
        if (this._model == null) {
            return;
        }
        this.refreshUI(this._model);
    }
}
