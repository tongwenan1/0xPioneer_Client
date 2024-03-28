import { ActiveEventState } from "../Const/Event";

export default class GlobalData {
    public static latestActiveEventState: ActiveEventState = new ActiveEventState();
}