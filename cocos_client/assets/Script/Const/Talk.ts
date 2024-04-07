import { NPCNameLangType } from "./ConstDefine";

export interface TalkConfigData {
    id: string;
    messsages: TalkConfigData_Message[];
}

export interface TalkConfigData_Message {
    type: string;
    name: NPCNameLangType;
    text: string;
    select: string[] | null;
}
