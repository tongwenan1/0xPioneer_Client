import { _decorator, Component, Label, Node, ProgressBar, Tween, v3 } from 'cc';
import { LanMgr } from '../../Utils/Global';
import { InnerBuildingType, UserInnerBuildInfo } from '../../Const/BuildingDefine';
import InnerBuildingConfig from '../../Config/InnerBuildingConfig';
const { ccclass, property } = _decorator;

@ccclass('InnerBuildUI')
export class InnerBuildUI extends Component {

    public refreshUI(buildData: UserInnerBuildInfo) {
        let buildingName: string = "";
        const innerBuildingConfig = InnerBuildingConfig.getByBuildingType(buildData.buildType);
        if (innerBuildingConfig != null) {
            buildingName = LanMgr.getLanById(innerBuildingConfig.name);
        } else {
            if (buildData.buildType == InnerBuildingType.EnergyStation) {
                // useLanMgr
                // buildingName = LanMgr.getLanById("201004");
                buildingName = "Energy Station";
            }
        }
        this.txtBuildName.string = `${buildingName} LV.${buildData.buildLevel}`;

        if (!buildData || buildData.buildLevel <= 0) {// lock
            this.unlockStatusIconNode.active = false;
            this.lockStatusIconNode.active = true;

        } else {
            this.unlockStatusIconNode.active = false;
            this.lockStatusIconNode.active = false;
        }
    }

    public setProgressTime(beginTimeStamp: number, endTimeStamp: number) {
        const currentTimestamp: number = new Date().getTime();
        if (currentTimestamp >= endTimeStamp) {
            this.progresssBar.node.active = false;
            return;
        }
        this.progresssBar.node.active = true;
        this.progresssBar.progress = (currentTimestamp - beginTimeStamp) / (endTimeStamp - beginTimeStamp);
    }

    @property(Label)
    private txtBuildName: Label = null;

    @property(ProgressBar)
    private progresssBar: ProgressBar = null;

    @property(Node)
    private unlockStatusIconNode: Node = null;

    @property(Node)
    private lockStatusIconNode: Node = null;

    start() {
        if (this.node.parent.scale.x == -1) {
            this.node.scale = v3(-1, 1);
        }
        this.progresssBar.node.active = false;
    }

    update(deltaTime: number) {

    }
}


