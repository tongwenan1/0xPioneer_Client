import NotificationMgr from "../Basic/NotificationMgr";
import { NotificationName } from "../Const/Notification";
import MapPioneerModel from "../Game/Outer/Model/MapPioneerModel";
import { PioneerDevelopMgr, PioneerMgr } from "../Utils/Global";

export default class DataTransferMgr {
    public constructor() {
        NotificationMgr.addListener(NotificationName.MAP_PIONEER_GET_NEW_PIONEER, this._onGetNewPioneer, this);
    }



    private _onGetNewPioneer(pioneer: MapPioneerModel) {
        const nftData = PioneerDevelopMgr.generateNewNFT(pioneer.NFTLinkdId);
        PioneerMgr.linkNFTToPioneer(pioneer.id, nftData.uniqueId);
    }
}