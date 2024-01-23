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

    public async upgradeBuild(buildID: string) {
        await this._waitForLoad();
        const buildInfo = this._innerBuilds.get(buildID);
        if (buildInfo != null) {
            buildInfo.buildLevel += 1;
            this._innerBuilds.set(buildID, buildInfo);
            this._localJsonData.innerBuildData[buildID].buildLevel = buildInfo.buildLevel;
            this._localDataChanged(this._localJsonData);
        }
    }
    public async getPlayerName() {
        await this._waitForLoad();
        return this._playerName;
    }
    public async getLevel() {
        await this._waitForLoad();
        return this._level;
    }
    public async getMoney() {
        await this._waitForLoad();
        return this._money;
    }
    public async getEnergy() {
        await this._waitForLoad();
        return this._energy;
    }
    public async getExp() {
        await this._waitForLoad();
        return this._exp;
    }
    public async getInnerBuilds(): Promise<Map<string, UserInnerBuildInfo>> {
        await this._waitForLoad();
        return this._innerBuilds;
    }

    public async changePlayerName(value: string) {
        await this._waitForLoad();
        this._playerName = value;
        this._localJsonData.playerData.playerName = value;
        this._localDataChanged(this._localJsonData);
    }
    public async changeEnergy(value: number) {
        await this._waitForLoad();
        this._energy = value;
        this._localJsonData.playerData.energy = value;
        this._localDataChanged(this._localJsonData);
    }
    public async changeMoney(value: number) {
        await this._waitForLoad();
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
    private _booltag: boolean;
    
    private async _initData() {
        let jsonObject: any = null;
        this._booltag = false;
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
            // localsave
            this._localDataChanged(jsonObject);
        }
        this._booltag = true;
        this._localJsonData = jsonObject;
        if (jsonObject == null) {
            return;
        }
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
        if (jsonObject != null) {
            sys.localStorage.setItem("user_Info", JSON.stringify(jsonObject));
        }
    }

    private async _waitForLoad() {
        while (true) {
            await this._delay(10);
            if (this._booltag)
                return;
        }
    }
    private _delay(ms: number): Promise<void> {
        var p = new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
        return p;
    }
}