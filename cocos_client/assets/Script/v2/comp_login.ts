import { _decorator, Component, Node } from 'cc';
import * as cc from "cc";
import { Web3Helper } from "./MetaMask/ethhelper"
import UserInfo from './DataMgr/user_Info';
const { ccclass, property } = _decorator;

@ccclass('comp_login')
export class comp_login extends Component {
    private _loaded: boolean = false;
    async start() {
        //prepare main scene.
        cc.director.preloadScene("main_v1"
            , () => {
                console.log("preload scene.");
                this._loaded = true;
                let labelload = this.node.getChildByName("label-info").getComponent(cc.Label);
                labelload.string = "资源已加载，可以下一步";
            });
        {
            //Find and Reg recall method.
            let b1 = this.node.getChildByName("btn-recall").getComponent(cc.Button);
            let evthandler = new cc.EventHandler();
            evthandler._componentName = "comp_login";
            evthandler.target = this.node;
            evthandler.handler = "OnEventRecall";
            b1.clickEvents.push(evthandler);
        }
        {
            //Find and Reg next method.
            let b1 = this.node.getChildByName("btn-next").getComponent(cc.Button);
            let evthandler = new cc.EventHandler();
            evthandler._componentName = "comp_login";
            evthandler.target = this.node;
            evthandler.handler = "OnEventNext";
            b1.clickEvents.push(evthandler);
        }


        let labelload = this.node.getChildByName("label-info").getComponent(cc.Label);
        labelload.string = "资源正在加载中，现在是假loading 比较缓慢";

        let l = this.node.getChildByName("Label").getComponent(cc.Label);
        l.string = "prepare metamask ing";

        let b = await Web3Helper.LinkWallet();
        l.string = "prepare metamask = " + b;
        if (b) {
            l.string = l.string + " addr=" + Web3Helper.getPubAddr();
        }
    }

    async OnEventRecall() {
        let l = this.node.getChildByName("Label").getComponent(cc.Label);
        l.string = "prepare metamask ing";
        let b = await Web3Helper.LinkWallet();
        l.string = "prepare metamask = " + b;
        if (b) {
            l.string = l.string + " addr=" + Web3Helper.getPubAddr();
        }
    }
    async OnEventNext() {
        if (Web3Helper.getPubAddr() == undefined || Web3Helper.getPubAddr() == "") {
            console.log("fail to next.");
            return;
        }
        if(this._loaded==false)
        {
            return;
        }
        await UserInfo.Instance.changePlayerName(Web3Helper.getPubAddr().substring(0, 10));
        cc.director.loadScene("main_v1");
    }
    update(deltaTime: number) {

    }
}


