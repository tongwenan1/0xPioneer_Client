import NotificationMgr from "../Basic/NotificationMgr";
import NFTPioneerConfig from "../Config/NFTPioneerConfig";
import { NotificationName } from "../Const/Notification";
import { NFTPioneerModel } from "../Const/PioneerDevelopDefine";
import CommonTools from "../Tool/CommonTools";

export default class PioneerDevelopMgr {
    public initData() {
        this._initData();
    }

    public getAllNFTs(): NFTPioneerModel[] {
        return this._develpDatas;
    }
    //-------------------------------- data action
    public generateNewNFT(NFTId: string = null): NFTPioneerModel {
        let useId: string = NFTId;
        if (useId == null) {
            useId = NFTPioneerConfig.getRandomNFTId();
        }
        const model = new NFTPioneerModel();
        model.convertConfigToModel(new Date().getTime() + CommonTools.generateUUID(), NFTPioneerConfig.getById(useId));
        this._develpDatas.push(model);
        this._saveLocalData();

        return model;
    }

    public NFTLevelUp(NFTId: string, levelUpNum: number) {
        const model = this._develpDatas.find((v) => v.uniqueId == NFTId);
        if (model != undefined) {
            model.levelUp(levelUpNum);
            this._saveLocalData();
            NotificationMgr.triggerEvent(NotificationName.NFTDidLevelUp);
        }
    }
    public NFTRankUp(NFTId: string, rankUpNum: number) {
        const model = this._develpDatas.find((v) => v.uniqueId == NFTId);
        if (model != undefined) {
            model.rankUp(rankUpNum);
            this._saveLocalData();
            NotificationMgr.triggerEvent(NotificationName.NFTDidRankUp);
        }
    }

    private _localStorageKey: string = "local_pioneer_develop";
    private _develpDatas: NFTPioneerModel[] = [];
    private _initData() {
        const localData = localStorage.getItem(this._localStorageKey);
        if (localData == null) {
        } else {
            this._develpDatas = [];
            const templeDatas = JSON.parse(localData);
            for (const temple of templeDatas) {
                const model = new NFTPioneerModel();
                model.convertLocalDataToModel(temple);
                this._develpDatas.push(model);
            }
        }
    }

    private _saveLocalData() {
        localStorage.setItem(this._localStorageKey, JSON.stringify(this._develpDatas));
    }

    //--------------------------------- notification
}
