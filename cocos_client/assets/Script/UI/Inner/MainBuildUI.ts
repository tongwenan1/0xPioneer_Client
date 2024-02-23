import { _decorator, ToggleContainer, ScrollView, instantiate, Label, Node, log, Button, EventTouch, Size, UITransform, Toggle, Color, Event } from 'cc';
import { GameMain } from '../../GameMain';
import EventMgr from '../../Manger/EventMgr';
import { EventName } from '../../Basic/ConstDefine';
import UserInfo from '../../Manger/UserInfoMgr';
import { PopUpUI } from '../../BasicView/PopUpUI';

const { ccclass, property } = _decorator;

@ccclass('MainBuildUI')
export class MainBuildUI extends PopUpUI {
    public override get typeName() {
        return "MainBuildUI";
    }

    @property(ToggleContainer)
    public menuToggleCon: ToggleContainer = null;

    @property(ScrollView)
    public dataNode: ScrollView = null;

    @property(ScrollView)
    public buildNode: ScrollView = null;

    @property(Node)
    public dataItemIns: Node;

    @property(Node)
    public buildItemIns: Node;

    onMenuToggleChange(toggle: Toggle) {
        let toggleName = toggle.node.name;
        this.dataNode.node.active = toggleName == "data";
        this.buildNode.node.active = toggleName == "build";

        for(let toggle of this.menuToggleCon.toggleItems){
            let title = toggle.node.getChildByName('title').getComponent(Label);
            // title.color = color;
            // Set hexadecimal color according to selected status
            let color = toggle.isChecked ? '#EAD18E' : '#ffffff';
            title.color = new Color().fromHEX(color);

        }
    }

    start() {
        // this.initDataView();
        // this.initBuildView();
    }

    protected onEnable(): void {
        this.initDataView();
        this.initBuildView();
        // this.menuToggleCon.toggleItems[0].isChecked = true;
        // this.onMenuToggleChange(this.menuToggleCon.toggleItems[1]);
    }

    async initDataView(){
        let content = this.dataNode.content;

        // convert map to array
        const innerBuildData = await UserInfo.Instance.innerBuilds;
        let build_data = Array.from(innerBuildData.values())
        content.getComponent(UITransform).contentSize = new Size(940,5+build_data.length*130);
        this.dataItemIns.active = false;
        content.removeAllChildren();
        for(let i = 0; i < build_data.length;i++){
            let item = content.children[i];
            if(!item){
                item = instantiate(this.dataItemIns);
                item.setParent(content);
            }
            item.active = true;
            // let data = this.getBuildDataInfo(build_data[i].buildID,build_data[i].buildLevel)
            // if(data ){
            //     let title = item.getChildByName('title').getComponent(Label);
            //     title.string = data.buildName;

            //     let desc = item.getChildByName('desc').getComponent(Label);
            //     let desc_str = '';
            //     for (let j = 0; j < data.upgradeEffectArr.length; j++) {
            //         const element = data.upgradeEffectArr[j];
            //         desc_str += element;
            //         if(j != data.upgradeEffectArr.length-1){
            //             desc_str += '\n';
            //         }
            //     }
            //     desc.string = desc_str;
            // }
        }

    }

    async initBuildView(){
        let content = this.buildNode.content;
        // convert map to array

        let innerBuildData = await UserInfo.Instance.innerBuilds;
        let build_data = Array.from(innerBuildData.values());
        // content.getComponent(UITransform).contentSize = 
        this.buildItemIns.active = false;
        content.removeAllChildren();

        // set content size
        content.getComponent(UITransform).contentSize = new Size(940,5+build_data.length*130);

        for(let i = 0; i < build_data.length;i++){
            let item = content.children[i];
            if(!item){
                item = instantiate(this.buildItemIns);
                item.setParent(content);
            }

            item.active = true;
        //     let data = this.getBuildDataInfo(build_data[i].buildID,build_data[i].buildLevel)
        //     if(data){
        //         let title = item.getChildByName('title').getComponent(Label);
        //         title.string = `${data.buildName} LV${build_data[i].buildLevel} —> LV${build_data[i].buildLevel+1}`;

        //         let desc = item.getChildByName('desc').getComponent(Label);
        //         let desc_str = '';
        //         for (let j = 0; j < data.upgradeEffectArr.length; j++) {
        //             const element = data.upgradeEffectArr[j];
        //             desc_str += element;
        //             if(j != data.upgradeEffectArr.length-1){
        //                 desc_str += '\n';
        //             }
        //         }
        //         desc.string = desc_str;

        //         let layout = item.getChildByName('resLayout');
        //         for(let j = 0; j < data.upgradeCostArr.length/2;j++){
        //             let res_item = layout.children[j];
        //             if(!res_item){
        //                 res_item = instantiate(layout.children[0]);
        //                 res_item.setParent(layout);
        //             }

        //             let count = res_item.getChildByName('count').getComponent(Label);
        //             count.string = "x"+data.upgradeCostArr[2*j+1];

        //             let name = res_item.getChildByName('name').getComponent(Label);
        //             name.string = '';
        //         }

        //         for(let j = data.upgradeCostArr.length/2;j < layout.children.length;j++){
        //             layout.children[j].active = false;
        //         }

        //         let btn_up = item.getChildByName('btn_upgrade').getComponent(Button);
        //         btn_up.node.attr({buildId: build_data[i].buildID,buildLevel: build_data[i].buildLevel});
        //     }
        }
    }

    // for Debug ...
    onUpgradeBtnClick(){
        this.show(false);
        EventMgr.emit(EventName.MAIN_BUILD_LEVEL_UP);
    }

    onUpgradeClick(event: EventTouch){
        let build_id = event.target.buildId;
        let build_lv = event.target.buildLevel;
        log('event ',build_id);

        if(build_id == '0'){// main build
            this.show(false);
            EventMgr.emit(EventName.MAIN_BUILD_LEVEL_UP);
            return ;
        }

        // let data = GameMain.localDatas.InnerBuildData.innerBuildUp[build_id];
        // let lv_data = null
        // if(data){
        //     lv_data = data[build_lv - 1];
        // }

        // if(!data || !lv_data){
        //     return;
        // }
        // else {
        //     GameMain.inst.UI.mainBuildUI.show(false);
        //     GameMain.inst.UI.factoryInfoUI.refreshUI(lv_data);
        //     GameMain.inst.UI.factoryInfoUI.show(true);
        // }
    }

    closeClick(){
        GameMain.inst.UI.mainBuildUI.show(false);
    }

    update(deltaTime: number) {

    }
}


