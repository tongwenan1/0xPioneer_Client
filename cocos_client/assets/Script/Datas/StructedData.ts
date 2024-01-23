
export class StructedData {

    private _assignObject(targetObj:any, fromObj:any) {
        for (var key in fromObj) {
            if (targetObj.hasOwnProperty(key)) {
                let obj = fromObj[key];
                if(Array.isArray(obj)){
                    targetObj[key] = [];
                    this._assignArray(targetObj[key], obj);
                }
                else if(typeof obj === "object"){
                    targetObj[key] = {};
                    this._assignObject(targetObj[key], obj);
                }
                else {
                    targetObj[key] = fromObj[key];
                }
            }
        }
    }
    private _assignArray(targetObj:any, fromObj:any) {
        for(let i=0; i<fromObj.length; ++i){
            let obj = fromObj[i];
            if(Array.isArray(obj)){
                let newAry = [];
                this._assignArray(newAry, obj);
                targetObj.push(newAry);
            }
            else if(typeof obj === "object"){
                let newObj = {};
                this._assignObject(newObj, obj);
                targetObj.push(newObj);
            }
            else {
                targetObj.push(fromObj[i]);
            }
        }
    }

    public fromJson(jsonStr:string) {
        let jsonObj = JSON.parse(jsonStr);
        this.fromJsonObject(jsonObj);
    }

    public toJson():string {
        let jsonObj = {};
        this.toJsonObj(jsonObj);
        return JSON.stringify(jsonObj);
    }

    public fromJsonObject(jsonObj:any) {

        //this._assignObject(this, jsonObj);
        
        // only need shallow copy
        for (var key in jsonObj) {
            if (!this.hasOwnProperty(key)) {
                continue;
            }

            if(this._specialAssignFromJson(key, jsonObj)){
                continue;
            }

            this[key] = jsonObj[key];
        }
    }

    public toJsonObj(jsonObj:any) {

        //this._assignObject(jsonObj, this);

        // only need shallow copy
        let pnames = Object.getOwnPropertyNames(this);
        for(let i=0; i<pnames.length; ++i) {
            if(this._specialAssignToJson(pnames[i], jsonObj)){
                continue;
            }

            jsonObj[pnames[i]] = this[pnames[i]];
        }
    }

    protected _specialAssignFromJson(key:string, jsonObj:any):boolean {
        return false;
    }

    protected _specialAssignToJson(key:string, jsonObj:any):boolean {
        return false;
    }
}