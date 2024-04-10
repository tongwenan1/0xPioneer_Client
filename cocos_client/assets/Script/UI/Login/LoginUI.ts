import { _decorator, Component, Node, ProgressBar, Label, SceneAsset, director, Button, EventHandler, EditBox, AssetManager, Asset } from "cc";
import { md5 } from "../../Utils/Md5";
import ConfigConfig from "../../Config/ConfigConfig";
import ViewController from "../../BasicView/ViewController";
import NotificationMgr from "../../Basic/NotificationMgr";
import { NotificationName } from "../../Const/Notification";
import ChainConfig from "../../Config/ChainConfig";
import CLog from "../../Utils/CLog";
import { DataMgr } from "../../Data/DataMgr";
const { ccclass, property } = _decorator;

@ccclass("CompLogin")
export class LoginUI extends ViewController {
    //--------------------------------------- lifeCyc
    private _gameInited: boolean = false;

    private _loginClicked: boolean = false;

    protected viewDidLoad(): void {
        super.viewDidLoad();

        NotificationMgr.addListener(NotificationName.GAME_INITED, this._onGameInited, this);
    }
    protected viewDidStart(): void {
        super.viewDidStart();
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();
        NotificationMgr.removeListener(NotificationName.GAME_INITED, this._onGameInited, this);
    }

    //--------------------------------------- notification
    private _onGameInited() {
        this._gameInited = true;
    }
    //--------------------------------------- action
    private onTapStart() {
        const chainConf = ChainConfig.getCurrentChainConfig();
        if (chainConf.api.init_ethereum) {
            this.onTapStart_chain();
            return;
        }

        this.node.getChildByName("StartView").active = false;
        this.node.getChildByName("LoginView").active = true;
    }
    private async onTapLogin() {
        if (!this._gameInited) {
            return;
        }

        const codeEditBox = this.node.getChildByPath("LoginView/CodeInput").getComponent(EditBox);
        if (codeEditBox.string.length <= 0) {
            return;
        }

        if (this._loginClicked) return;
        this._loginClicked = true;

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
            NotificationMgr.triggerEvent(NotificationName.USER_LOGIN_SUCCEED);
        }
    }

    private onTapStart_chain() {
        if (!this._gameInited) {
            CLog.warn("LoginUI: game init failed");
            return;
        }
        DataMgr.n.ethereum.init();
    }
}
