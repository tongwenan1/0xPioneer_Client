import { _decorator, Asset, AssetManager, Component, Node } from 'cc';
import ViewController from './BasicView/ViewController';
import { AudioMgr, LocalDataLoader, ResourcesMgr, UIPanelMgr } from './Utils/Global';
import ConfigMgr from './Manger/ConfigMgr';
import NotificationMgr from './Basic/NotificationMgr';
import { NotificationName } from './Const/Notification';
import { UIName } from './Const/ConstUIDefine';
import { LoadingUI } from './UI/Loading/LoadingUI';
import { GAME_ENV_IS_DEBUG, PioneerGameTest } from './Const/ConstDefine';
import { UIMainRootController } from './UI/UIMainRootController';
const { ccclass, property } = _decorator;

@ccclass('Main')
export class Main extends ViewController {

    //--------------------------------------- lifeCyc
    private _loginView: Node = null;
    protected async viewDidLoad(): Promise<void> {
        super.viewDidLoad();

        this._loginView = this.node.getChildByPath("UI_Canvas/UI_ROOT/LoginUI");

        // debug mode
        if (GAME_ENV_IS_DEBUG) {
            this._loginView.active = false;
        } else {
            this._loginView.active = true;
        }

        NotificationMgr.addListener(NotificationName.USER_LOGIN_SUCCEED, this._onUserLoginSucceed, this);

        // audio prepare
        AudioMgr.prepareAudioSource();
        // config init
        await ConfigMgr.init();
        NotificationMgr.triggerEvent(NotificationName.CONFIG_LOADED);
    }

    protected async viewDidStart(): Promise<void> {
        super.viewDidStart();

        if (GAME_ENV_IS_DEBUG) {
            this._loginView.destroy();
            const loadingView = await UIPanelMgr.openPanel(UIName.LoadingUI);
            console.log("exce step1");
            await LocalDataLoader.loadLocalDatas();
            console.log("exce step2");
            await this.node.getChildByPath("UI_Canvas/UI_ROOT").getComponent(UIMainRootController).showMain();
            console.log("exce step3");
            await UIPanelMgr.openPanelToNode("prefab/game/Game", this.node.getChildByPath("Canvas/GameContent"));
            console.log("exce step4");
            loadingView.destroy();
            console.log("exce step5");
        }
    }

    protected viewDidDestroy(): void {
        super.viewDidDestroy();

        NotificationMgr.removeListener(NotificationName.USER_LOGIN_SUCCEED, this._onUserLoginSucceed, this);
    }



    //--------------------------------------- notification
    private async _onUserLoginSucceed() {
        // need show loading
        let loadRate: number = 0;
        const preloadRate: number = 0.4;
        ResourcesMgr.Init(async (err: Error, bundle: AssetManager.Bundle) => {
            if (err != null) {
                return;
            }
            // show loading
            let loadingView: LoadingUI = null;
            const view = await UIPanelMgr.openPanel(UIName.LoadingUI);
            this._loginView.destroy();
            if (view != null) {
                loadingView = view.getComponent(LoadingUI);
            }
            bundle.preloadDir(
                "",
                (finished: number, total: number, item: AssetManager.RequestItem) => {
                    const currentRate = finished / total;
                    if (currentRate > loadRate) {
                        loadRate = currentRate;
                        loadingView?.showLoadingProgress(loadRate);
                    }
                },
                (err: Error, data: AssetManager.RequestItem[]) => {
                    if (err != null) {
                        return;
                    }
                    bundle.loadDir(
                        "",
                        (finished: number, total: number, item: AssetManager.RequestItem) => {
                            const currentRate = preloadRate + (finished / total) * (1 - preloadRate);
                            if (currentRate > loadRate) {
                                loadRate = currentRate;
                                loadingView?.showLoadingProgress(loadRate);
                            }
                        },
                        async (err: Error, data: Asset[]) => {
                            if (err != null) {
                                return;
                            }
                            // load
                            await LocalDataLoader.loadLocalDatas();
                            await this.node.getChildByPath("UI_Canvas/UI_ROOT").getComponent(UIMainRootController).showMain();
                            await UIPanelMgr.openPanelToNode("prefab/game/Game", this.node.getChildByPath("Canvas/GameContent"));
                            loadingView.node.destroy();
                        }
                    );
                }
            );
        });
    }
}


