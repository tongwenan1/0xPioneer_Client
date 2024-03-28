export interface TalkConfigData {
    id: string;
    messsages: TalkConfigData_Message[];
}

export interface TalkConfigData_Message {
    type: string;
    name: string;
    text: string;
    select: string[] | null;
}
