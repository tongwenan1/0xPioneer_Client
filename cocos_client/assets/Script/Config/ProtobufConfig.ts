import { resources } from "cc";
import CLog from "../Utils/CLog";

export default class ProtobufConfig {
    private static _protobuf = {
        c2s_user: "",
        s2c_user: "",
        share_structure: "",
    };

    public static async init(): Promise<boolean> {
        const arr = ["c2s_user", "s2c_user", "share_structure"];

        for (let i = 0; i < arr.length; i++) {
            const name = arr[i];

            const obj: any = await new Promise((resolve) => {
                resources.load("protobuf/" + name, (err: Error, data: any) => {
                    if (err) {
                        resolve(null);
                        return;
                    }
                    resolve(data.text);
                });
            });
            if (!obj) {
                CLog.error(`ProtobufConfig[${name}] init error`);
                return false;
            }

            this._protobuf[name] = obj as string;
            CLog.debug(`ProtobufConfig[${name}] init success`);
        }

        return true;
    }

    public static getAll() {
        return this._protobuf;
    }
}
