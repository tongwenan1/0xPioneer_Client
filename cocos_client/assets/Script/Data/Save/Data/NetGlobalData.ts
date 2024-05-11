import { share } from "../../../Net/msg/WebsocketMsg";

export default class NetGlobalData {
    public static userInfo: share.Iplayer_sinfo = null;
    public static innerBuildings: share.Ibuilding_data[] = null;
    public static storehouse: share.Istorehouse_data = null;
    public static usermap: share.Iusermap_data = null;
}