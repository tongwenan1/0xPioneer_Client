import { Camera } from "cc";

export default class GameMainMgr {
    public static instance() {
        if (this._instance == null) {
            this._instance = new GameMainMgr();
        }
        return this._instance;
    }

    public setGameCamera(camera: Camera) {
        this._gameCamera = camera;
        this._gameCameraOriginalOrthoHeight = this._gameCamera.orthoHeight;
        this._gameCameraZoom = 1;
    }
    public get gameCameraOrthoHeight() {
        return this._gameCamera.orthoHeight;
    }


    private static _instance: GameMainMgr;

    private _gameCamera: Camera;
    private _gameCameraOriginalOrthoHeight: number;
    private _gameCameraZoom: number;
    public constructor() {
        
    }
}