import { _decorator, Button, Component, debug, director, instantiate, Node, Prefab, resources } from 'cc';
const { ccclass, property } = _decorator;
import * as cc from 'cc';
import { AsyncTask } from '../asynctask/asynctask';
import { GameStateMgr } from '../statemgr/gamestatemgr';
import { GameState_Logo } from '../gamestates/gamestate_logo';
import { comp_loading } from '../model_loading/comp_loading';
@ccclass('comp_main')
export class comp_main extends Component {
    async start() {
        //make com_main's node is persist.
        director.addPersistRootNode(this.node);

        cc.view.resizeWithBrowserSize(true);
        console.log("loadingPrefab");

        comp_main.loading =this.getComponentInChildren(comp_loading);
        console.log("[LoadRes]succ=" + AsyncTask.loading != undefined);


        GameStateMgr.instance.OnShowLoading =this.ShowLoading.bind(this);
        GameStateMgr.instance.OnHideLoading = this.HideLoading.bind(this);

        console.log("begin");
        GameStateMgr.instance.ChangeState(new GameState_Logo());
      
    }
  
    static loading:comp_loading;

    //a loading func between stateswtich 
    ShowLoading( ){       
        comp_main.loading.node.active = true;
    }
    HideLoading() {
        comp_main.loading.node.active = false;
    }
    eventHandler(event: Event, data: string) {
        console.log("[Event]", data);

    }
    update(deltaTime: number) {
        GameStateMgr.instance.curState?.OnUpdateFrame(deltaTime);
    }


}


