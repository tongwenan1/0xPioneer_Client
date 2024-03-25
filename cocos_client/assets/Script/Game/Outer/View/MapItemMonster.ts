import { _decorator, Component, Node, Vec2, Vec3, CCString, UITransform, Label, UIOpacity } from 'cc';
import { FinishedEvent } from '../../../Const/Manager/UserInfoMgrDefine';
import { LanMgr } from '../../../Utils/Global';
import { MapPioneerLogicType, MapPioneerActionType, MapPioneerMoveDirection } from '../../../Const/Model/MapPioneerModelDefine';
import MapPioneerModel from '../Model/MapPioneerModel';

const { ccclass, property } = _decorator;

@ccclass('MapItemMonster')
export class MapItemMonster extends Component {

    public refreshUI(model: MapPioneerModel, finishEvent: FinishedEvent[]) {
        this._nameLabel.string = LanMgr.getLanById(model.name);

        let moveCounting: boolean = false;
        if (model.logics.length > 0) {
            const logic = model.logics[0];
            if (logic.type == MapPioneerLogicType.stepmove &&
                logic.currentCd > 0 &&
                (logic.condition == null || finishEvent.indexOf(logic.condition) != -1)) {
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
                view.getChildByPath("walk_left").active = model.actionType == MapPioneerActionType.moving && model.moveDirection == MapPioneerMoveDirection.left;
                view.getChildByPath("walk_right").active = model.actionType == MapPioneerActionType.moving && model.moveDirection == MapPioneerMoveDirection.right;
                view.getChildByPath("walk_top").active = model.actionType == MapPioneerActionType.moving && model.moveDirection == MapPioneerMoveDirection.top;
                view.getChildByPath("walk_bottom").active = model.actionType == MapPioneerActionType.moving && model.moveDirection == MapPioneerMoveDirection.bottom;
            }
        }
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
    }

    update(deltaTime: number) {

    }
}


