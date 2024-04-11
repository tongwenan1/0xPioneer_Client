// natrium
// license : MIT
// author : Sean Chen

import { httpconnecter } from "../interface/network/httpconnecter";
import { Log } from "../util/Log";

export class natrium_http {
    protected _connecter: httpconnecter | null = null;

    constructor() {}

    public get connecter() {
        return this._connecter;
    }

    public init(): void {
        this._connecter = new Http();
    }
}

export class Http implements httpconnecter {
    public async post(url: string, data: any): Promise<any> {
        Log.debug("[natrium] natrium_http/Http: url-> " + url + ", data->" + JSON.stringify(data));
        return new Promise<any>((resolve, reject) => {
            var xmlhttp = new XMLHttpRequest(); // new HttpRequest instance
            xmlhttp.open("POST", `${url}`);
            xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xmlhttp.send(JSON.stringify(data));
            xmlhttp.onerror = (ev) => {
                reject();
            };
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status >= 200 && xmlhttp.status < 400) {
                    resolve(JSON.parse(xmlhttp.responseText));
                }
            };
        });
    }
}
