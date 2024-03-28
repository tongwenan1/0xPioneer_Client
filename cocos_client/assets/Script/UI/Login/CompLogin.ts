import { _decorator, Component, Node, ProgressBar, Label, SceneAsset, director, Button, EventHandler, EditBox, resources, AssetManager, Asset } from 'cc';
import { Web3Helper } from '../../Game/MetaMask/EthHelper';
import { md5 } from '../../Utils/Md5';
import { LocalDataLoader, ResourcesMgr, UserInfoMgr } from '../../Utils/Global';
import ConfigConfig from '../../Config/ConfigConfig';
import { ConfigType } from '../../Const/Config';
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
        const preloadRate: number = 0.4;
        ResourcesMgr.Init(async (err: Error, bundle: AssetManager.Bundle) => {
            if (err != null) {
                return;
            }
            if (LocalDataLoader.loadStatus == 0) {
                await LocalDataLoader.loadLocalDatas();
            }
            bundle.preloadDir("", (finished: number, total: number, item: AssetManager.RequestItem) => {
                const currentRate = finished / total;
                if (currentRate > loadRate) {
                    loadRate = currentRate;
                    this._loadingView.getChildByName("ProgressBar").getComponent(ProgressBar).progress = loadRate;
                }
            }, (err: Error, data: AssetManager.RequestItem[]) => {
                if (err != null) {
                    return;
                }
                bundle.loadDir("", (finished: number, total: number, item: AssetManager.RequestItem) => {
                    const currentRate = preloadRate + finished / total * (1 - preloadRate);
                    if (currentRate > loadRate) {
                        loadRate = currentRate;
                        this._loadingView.getChildByName("ProgressBar").getComponent(ProgressBar).progress = loadRate;
                    }
                }, (err: Error, data: Asset[]) => {
                    if (err != null) {
                        return;
                    }
                    this._loaded = true;
                    this._loadingView.active = false;
                });
            });
        });

        {
            //Find and Reg recall method.
            let b1 = this.node.getChildByPath("LoginView/btn-recall").getComponent(Button);
            let evthandler = new EventHandler();
            evthandler._componentName = "CompLogin";
            evthandler.target = this.node;
            evthandler.handler = "OnEventRecall";
            b1.clickEvents.push(evthandler);
        }
        // {
        //     //Find and Reg next method.
        //     let b1 = this.node.getChildByName("btn-next").getComponent(Button);
        //     let evthandler = new EventHandler();
        //     evthandler._componentName = "CompLogin";
        //     evthandler.target = this.node;
        //     evthandler.handler = "OnEventNext";
        //     b1.clickEvents.push(evthandler);
        // }
        {
            //Find and Reg next method.
            let b1 = this.node.getChildByPath("LoginView/GuestButton").getComponent(Button);
            let evthandler = new EventHandler();
            evthandler._componentName = "CompLogin";
            evthandler.target = this.node;
            evthandler.handler = "OnEventNext";
            evthandler.customEventData = "guest";
            b1.clickEvents.push(evthandler);
        }

        let l = this.node.getChildByName("Label").getComponent(Label);
        l.string = "prepare metamask ing";

        // let b = await Web3Helper.LinkWallet();
        // l.string = "prepare metamask = " + b;
        // if (b) {
        //     l.string = l.string + " addr=" + Web3Helper.getPubAddr();
        // }
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
            UserInfoMgr.playerName = "guest";
        }
        else {
            if (Web3Helper.getPubAddr() == undefined || Web3Helper.getPubAddr() == "") {
                return;
            }
            UserInfoMgr.playerName = Web3Helper.getPubAddr().substring(0, 10);
        }
        if (this._loaded == false) {
            return;
        }
        director.loadScene("main");
    }
    update(deltaTime: number) {

    }

    private async onTapLogin() {
        const codeEditBox = this.node.getChildByPath("LoginView/CodeInput").getComponent(EditBox);
        if (codeEditBox.string.length <= 0) {
            return;
        }
        let canEnter: boolean = false;
        let config = ConfigConfig.getWhiteListConfig();
        if (config == null || config.para == null || config.para.length <= 0) {
            canEnter = true;
        } else {
            for (const temple of config.para) {
                if (temple.toUpperCase() === md5(codeEditBox.string).toUpperCase()) {
                    canEnter = true;
                    break;
                }
            }
        }
        if (canEnter) {
            const mainScene = await ResourcesMgr.LoadABResource("scene/main", SceneAsset);
            if (mainScene != null) {
                director.runScene(mainScene);
            }
        }
    }

    private onTapStart() {
        this.node.getChildByName("StartView").active = false;
        this.node.getChildByName("LoginView").active = true;
    }
}


