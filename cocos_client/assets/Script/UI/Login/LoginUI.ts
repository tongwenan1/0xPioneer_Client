import { _decorator, Component, Node, ProgressBar, Label, SceneAsset, director, Button, EventHandler, EditBox, AssetManager, Asset } from "cc";
import { md5 } from "../../Utils/Md5";
import ConfigConfig from "../../Config/ConfigConfig";
import ViewController from "../../BasicView/ViewController";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
const { ccclass, property } = _decorator;

@ccclass("CompLogin")
export class LoginUI extends ViewController {

    //--------------------------------------- lifeCyc
    private _configLoaded: boolean = false;
    protected viewDidLoad(): void {
        super.viewDidLoad();

        NotificationMgr.addListener(NotificationName.CONFIG_LOADED, this._onConfigLoaded, this);
    }
    protected viewDidStart(): void {
        super.viewDidStart();
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();
        NotificationMgr.removeListener(NotificationName.CONFIG_LOADED, this._onConfigLoaded, this);
    }

    //--------------------------------------- notification
    private _onConfigLoaded() {
        this._configLoaded = true;
    }
    //--------------------------------------- action
    private onTapStart() {
        this.node.getChildByName("StartView").active = false;
        this.node.getChildByName("LoginView").active = true;
    }
    private async onTapLogin() {
        console.log("exce confi: " + this._configLoaded);
        if (!this._configLoaded) {
            return;
        }
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
        if (canEnter || true) {
            console.log("exce enter");
            NotificationMgr.triggerEvent(NotificationName.USER_LOGIN_SUCCEED);
        }
    }
}
