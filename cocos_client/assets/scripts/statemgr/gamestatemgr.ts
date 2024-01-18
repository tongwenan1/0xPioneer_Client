
export interface IGameState {
    OnInit(): Promise<void>;
    OnUpdateFrame(deltaTime: number);
    OnExit(): Promise<void>;
}
export class GameStateMgr {

    private static _instance: GameStateMgr;
    public static get instance(): GameStateMgr {
        if (this._instance == undefined) {
            this._instance = new GameStateMgr();
        }
        return this._instance;
    }

    curState: IGameState = null;

    OnShowLoading: () => void;
    OnHideLoading: () => void;
    public async ChangeState(state: IGameState): Promise<void> {
        if (this.curState == state)
            return;

        this.OnShowLoading();
        if (this.curState != null) {
            await this.curState.OnExit();
        }

        this.curState = state;
        console.log("ChangeState:"+state.constructor.name);
        if (this.curState != null) {
            await this.curState.OnInit();
        }
        this.OnHideLoading();
    }
}