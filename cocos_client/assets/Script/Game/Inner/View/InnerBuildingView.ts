import { _decorator, Component, Node } from 'cc';
import { InnerBuildingType, UserInnerBuildInfo } from '../../../Const/Manager/UserInfoMgrDefine';
import ViewController from '../../../BasicView/ViewController';
import { InnerBuildUI } from '../../../UI/Inner/InnerBuildUI';
import { GameMain } from '../../../GameMain';
import { UIHUDController } from '../../../UI/UIHUDController';
import { LanMgr } from '../../../Utils/Global';
const { ccclass, property } = _decorator;

@ccclass('InnerBuildingView')
export class InnerBuildingView extends ViewController {

    public refreshUI(building: UserInnerBuildInfo) {
        this._building = building;
        console.log("exce bu: ", building)
        this._infoView.refreshUI(this._building);
        this._infoView.node.setSiblingIndex(999);
        // if (this.buildData.buildLevel < this.buildPfbList.length) {
        //     if (this._showBuilding != null) {
        //         this._showBuilding.destroy();
        //     }
        //     const buildView = instantiate(this.buildPfbList[this.buildData.buildLevel]);
        //     this.node.addChild(buildView);
        //     this._showBuilding = buildView;
        // }
    }

    protected innerBuildingLoad() {
    }
    protected innerBuildingTaped() {
    }

    private _infoView: InnerBuildUI = null;

    protected _building: UserInnerBuildInfo = null;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        this._infoView = this.node.getChildByName("InnrBuildUI").getComponent(InnerBuildUI);

        this.innerBuildingLoad();
    }
    //---------------------------- action
    private onTapBuilding() {
        if (this._building == null) {
            return;
        }
        // if (GameMain.inst.innerSceneMap.isUpgrading(this._building.buildID)) {
            // useLanMgr
            // UIHUDController.showCenterTip(LanMgr.getLanById("201001"));
            // return;
        // }
        this.innerBuildingTaped();
    }
}


