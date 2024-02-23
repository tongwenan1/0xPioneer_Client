import { _decorator, Component, Node, ProgressBar, Label, SceneAsset, director, Button, EventHandler } from 'cc';
import LocalDataLoader from '../../Manger/LocalDataLoader';
import UserInfoMgr from '../../Manger/UserInfoMgr';
import { Web3Helper } from '../../Game/MetaMask/EthHelper';
const { ccclass, property } = _decorator;

@ccclass('CompLogin')
export class CompLogin extends Component {
    private _loaded: boolean = false;
    
    private _loadingView: Node = null;
    protected onLoad(): void {
        this._loadingView = this.node.getChildByName("LoadingUI");
    }
    async start() {
        //prepare main scene.
        this._loadingView.active = true;
        this.node.getChildByName("label-info").getComponent(Label).string = "loading is done. can go next.";
        let loadRate: number = 0;
        director.preloadScene(
            "main",
            (completedCount: number, totalCount: number, item: any) => {
                const currentRate = completedCount / totalCount;
                if (currentRate > loadRate) {
                    loadRate = currentRate;
                    this._loadingView.getChildByName("ProgressBar").getComponent(ProgressBar).progress = loadRate;
                }
            },
            async (error: null | Error, sceneAsset?: SceneAsset) => {
                if (error == null) {
                    if (LocalDataLoader.instance.loadStatus == 0) {
                        await LocalDataLoader.instance.loadLocalDatas();
                    }
                    this._loaded = true;
                    this._loadingView.active = false;
                }
            }
        );

        {
            //Find and Reg recall method.
            let b1 = this.node.getChildByName("btn-recall").getComponent(Button);
            let evthandler = new EventHandler();
            evthandler._componentName = "CompLogin";
            evthandler.target = this.node;
            evthandler.handler = "OnEventRecall";
            b1.clickEvents.push(evthandler);
        }
        {
            //Find and Reg next method.
            let b1 = this.node.getChildByName("btn-next").getComponent(Button);
            let evthandler = new EventHandler();
            evthandler._componentName = "CompLogin";
            evthandler.target = this.node;
            evthandler.handler = "OnEventNext";
            b1.clickEvents.push(evthandler);
        }
        {
            //Find and Reg next method.
            let b1 = this.node.getChildByName("btn-next-guest").getComponent(Button);
            let evthandler = new EventHandler();
            evthandler._componentName = "CompLogin";
            evthandler.target = this.node;
            evthandler.handler = "OnEventNext";
            evthandler.customEventData = "guest";
            b1.clickEvents.push(evthandler);
        }

        let l = this.node.getChildByName("Label").getComponent(Label);
        l.string = "prepare metamask ing";

        let b = await Web3Helper.LinkWallet();
        l.string = "prepare metamask = " + b;
        if (b) {
            l.string = l.string + " addr=" + Web3Helper.getPubAddr();
        }
    }

    async OnEventRecall() {
        let l = this.node.getChildByName("Label").getComponent(Label);
        l.string = "prepare metamask ing";
        let b = await Web3Helper.LinkWallet();
        l.string = "prepare metamask = " + b;
        if (b) {
            l.string = l.string + " addr=" + Web3Helper.getPubAddr();
        }
    }
    OnEventNext(event: Event, customEventData: string) {
        if (customEventData == "guest") {
            UserInfoMgr.Instance.playerName = "guest";
        }
        else {
            if (Web3Helper.getPubAddr() == undefined || Web3Helper.getPubAddr() == "") {
                return;
            }
            UserInfoMgr.Instance.playerName = Web3Helper.getPubAddr().substring(0, 10);
        }
        if (this._loaded == false) {
            return;
        }
        director.loadScene("main");
    }
    update(deltaTime: number) {

    }
}


