import { _decorator, Component, Node, ProgressBar } from 'cc';
import ViewController from '../../BasicView/ViewController';
const { ccclass, property } = _decorator;

@ccclass('LoadingUI')
export class LoadingUI extends ViewController {
    public showLoadingProgress(progress: number) {
        this.node.getChildByPath("ProgressBar").getComponent(ProgressBar).progress = progress;
    }
}


