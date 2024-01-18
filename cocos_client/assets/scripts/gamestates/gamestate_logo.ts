import { IGameState } from "../statemgr/gamestatemgr";
import * as cc from 'cc';
import { AsyncTask } from "../asynctask/asynctask";
import { comp_main } from "../main/comp_main";
export class GameState_Logo implements IGameState
{
   async OnInit(): Promise<void> {
        cc.director.loadScene("game");
        //cc.director.preloadScene("game");
        console.log("GameState_Logo OnInit");
        for(var i=0;i<100;i++)
        {
            comp_main.loading.SetLoadingText("loading ...");
            comp_main.loading.SetLoadingProgress(i/100);
            await AsyncTask.Delay(20);
        }
     
        console.log("GameState_Logo OnInit done.");
        //cc.director.loadScene("game");
    }
    
    OnUpdateFrame(deltaTime: number) {
      
    }
    async  OnExit(): Promise<void> {
       
    }

}