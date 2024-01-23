export default class GameMgr {
    private static _inst: GameMgr = null;
    public static get inst() {
        if (!this._inst) {
            this._inst = new GameMgr();
        }
        return this._inst;
    }

    public init() {
        
    }

    

}