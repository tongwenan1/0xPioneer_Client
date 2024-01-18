import { _decorator, Component, Label, Node, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('comp_loading')
export class comp_loading extends Component {
    start() {

    }

    update(deltaTime: number) {

    }
    @property({
        type: Node,
        visible: true,
    })
    labelForText: Label

    @property({
        type: Node,
        visible: true,
    })
    labelForProgress: Label

    SetLoadingText(text: string) {
        //this.labelForText = this.node.getChildByName("Label").getComponent(Label);
        this.labelForText.string = text; //set loading text
        console.log("SetLoadingText2=", this.labelForText.string);
    }
    SetLoadingProgress(progress: number) {
      
        //this.labelForProgress = this.node.getChildByName("Label-001").getComponent(Label);

        this.labelForProgress.string = ((progress * 100) | 0).toString() + "%";
    }
}


