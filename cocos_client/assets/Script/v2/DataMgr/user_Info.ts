import { Asset, resources, sys } from "cc";

export interface UserInnerBuildInfo {
    buildID: string,
    buildLevel: number,
    buildUpTime: number,
    buildName: string,

}

export default class UserInfo {

    public static get Instance() {
        if (!this._instance) {
            this._instance = new UserInfo();
        }
        return this._instance;
    }

    public upgradeBuild(buildID: string) {
        const buildInfo = this._innerBuilds.get(buildID);
        if (buildInfo != null) {
            buildInfo.buildLevel += 1;
            this._innerBuilds.set(buildID, buildInfo);
            this._localJsonData.innerBuildData[buildID].buildLevel = buildInfo.buildLevel;
            this._localDataChanged(this._localJsonData);
        }
    }

    public get playerID(): string {
        return this._playerID;
    }
    public get playerName(): string {
        return this._playerName;
    }
    public get level(): number {
        return this._level;
    }
    public get money(): number {
        return this._money;
    }
    public get energy(): number {
        return this._energy;
    }
    public get exp(): number {
        return this._exp;
    }
    public get innerBuilds(): Map<string, UserInnerBuildInfo> {
        return this._innerBuilds;
    }

    public set playerName(value: string) {
        this._playerName = value;
        this._localJsonData.playerData.playerName = value;
        this._localDataChanged(this._localJsonData);
    }
    public set energy(value: number) {
        this._energy = value;
        this._localJsonData.playerData.energy = value;
        this._localDataChanged(this._localJsonData);
    }
    public set money(value: number) {
        this._money = value;
        this._localJsonData.playerData.money = value;
        this._localDataChanged(this._localJsonData);
    }

    public constructor() {
        this._initData();
    }

    private static _instance: UserInfo = null;
    private _loadPromise: Promise<any> = null;
    private _localJsonData: any = null;

    private _playerID: string = null;
    private _playerName: string = null;
    private _level: number = null;
    private _money: number = null;
    private _energy: number = null;
    private _exp: number = null;
    private _innerBuilds: Map<string, UserInnerBuildInfo> = null;

    private async _initData() {
        let jsonObject: any = null;

        const localData = sys.localStorage.getItem("user_Info");
        if (localData != null) {
            jsonObject = JSON.parse(localData);

        } else {
            this._loadPromise = new Promise((resolve, reject) => {
                resources.load("data_local/user_Info", (err: Error, data: any) => {
                    if (err) {
                        resolve(null);
                        return; 
                    }
                    resolve(data.json);
                });
            });
            jsonObject = await this._loadPromise;
            // 本地存储 
            this._localDataChanged(jsonObject);
        }
        this._localJsonData = jsonObject;  
        if (jsonObject == null) {
            console.log("exce locajsonnull"); 
            return;
        }
        console.log("exce begindata: ", jsonObject); 
        this._playerID = jsonObject.playerData.playerID;
        this._playerName = jsonObject.playerData.playerName; 
        this._level = jsonObject.playerData.level;
        this._money = jsonObject.playerData.money;
        this._energy = jsonObject.playerData.energy;
        this._exp = jsonObject.playerData.exp;

        this._innerBuilds = new Map();
        for (let id in jsonObject.innerBuildData) {
            const innerBuildInfo: UserInnerBuildInfo = { 
                buildID: jsonObject.innerBuildData[id].buildID,
                buildLevel: jsonObject.innerBuildData[id].buildLevel,
                buildUpTime: jsonObject.innerBuildData[id].buildUpTime,
                buildName: jsonObject.innerBuildData[id].buildName,
            };
            this._innerBuilds.set(id, innerBuildInfo);
        }
    }

    private _localDataChanged(jsonObject: any) {
        console.log("exce localjson: ", jsonObject)
        if (jsonObject != null) {
            sys.localStorage.setItem("user_Info", JSON.stringify(jsonObject));
        }
    }
}