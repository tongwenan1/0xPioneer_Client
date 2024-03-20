import { _decorator, Component, Label, Node, ProgressBar, Tween,v3 } from 'cc';
import { UserInnerBuildInfo } from '../../Const/Manager/UserInfoMgrDefine';
const { ccclass, property } = _decorator;

@ccclass('InnerBuildUI')
export class InnerBuildUI extends Component {

    @property(Label)
    private txtBuildName: Label = null;


    @property(ProgressBar)
    private progresssBar: ProgressBar = null;
    
    @property(Node)
    private unlockStatusIconNode: Node = null;
    
    @property(Node)
    private lockStatusIconNode: Node = null;

    start() {
        if(this.node.parent.scale.x == -1){
            this.node.scale = v3(-1,1);
        }

        this.progresssBar.node.active = false;
    }

    refreshUI(buildData: UserInnerBuildInfo) {
        this.txtBuildName.string = `${buildData.buildName} LV.${buildData.buildLevel}`;
        
        if(!buildData || buildData.buildLevel <= 0){// unlock
            this.unlockStatusIconNode.active = false;
            this.lockStatusIconNode.active = true;
         }
         else{
            this.unlockStatusIconNode.active = true;
            this.lockStatusIconNode.active = false;
         }
    }

    update(deltaTime: number) {
        
    }

    public setProgressTime(time:number = 1){
        this.progresssBar.node.active = true;
        // Start a timer and make the progress bar go from 0 to 100 within time
        this.progresssBar.progress = 0;
    
        let t1 = new Tween(this.progresssBar);
        t1.to(time,{progress:1});
        t1.call(()=> this.progresssBar.node.active = false);
        t1.start();
    }
}


