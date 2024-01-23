import { StructedData } from "./StructedData";

export class InnerBuildUpData extends StructedData {
    public buildID:string;
    public buildName:string;
    public buildLevel:number;
    
    /**
     * upgradeEffect
     */
    public upgradeEffectArr:string[];

    /**
     * upgradeCondition
     */
    public upgradeConditionArr:string[];

    /**
     * upgradeCost
     */
    public upgradeCostArr:number[];

    /**
     * upgradeTime
     */
    public upgradeTime:number;

    /**
     * produceTime
     */
    public outTime:number;

    /**
     * produceNeedItem
     */
    public useItem:number[];

    /**
     * produceItem
     */
    public outItem: number[];
}

export class InnerMapData extends StructedData {

}

export class OutMapItemData extends StructedData {

    public x:number;
    public y:number;

}


export class OutMapItemTownData extends OutMapItemData {
    public playerID:string;
    public playerName:string;
    public level:number;
    public money:number;
    public diamond:number;
    public water:number;
    public desc:string;
    /**
     * collectTime
     */
    public time:number;
}

/**
 * resPoint
 */
export class ResPointData extends OutMapItemData{
    public playerID:string;
    public playerName:string;
    public resType:String;
    public desc:string;
    public level:number;
    public money:number;
    public diamond:number;
    public time:number;
}


export class OutMapItemMonsterData extends OutMapItemData {
    public playerID:string;
    public playerName:string;
    public level:number;
    public money:number;
    public diamond:number;
    public desc:string;

    /**
     * battleTime
     */
    public time:number;
}

export class PioneerData extends OutMapItemData {
    public playerID:string;
    public id:string;
    public name:string;
    public level:number;

    public status:string; // PioneerStatus
    public targetX:number;
    public targetY:number;
    public targetObj:string;
    public targetObjID:number;

    public lastUpdateTime:number; // unix time stamp
}

export class OutMapData extends StructedData {

    public towns:Map<string, OutMapItemTownData>; // player id => town data
    public monsters:Map<string, OutMapItemMonsterData>; // monster id => monster data
    public pioneers:Map<string, PioneerData>; // pioneer id => pioneer data
    public resPoint:Map<string, ResPointData>; // pioneer id => pioneer data

    protected override _specialAssignFromJson(key:string, jsonObj:any):boolean {
        if(key == "towns"){
            this.towns = new Map<string, OutMapItemTownData>();
            for(let playerid in jsonObj.towns){
                let omitd = new OutMapItemTownData();
                omitd.fromJsonObject(jsonObj.towns[playerid]);

                this.towns[playerid] = omitd;
            }
        }
        else if(key == "monsters"){
            this.monsters = new Map<string, OutMapItemMonsterData>();
            for(let monsterid in jsonObj.monsters){
                let omimd = new OutMapItemMonsterData();
                omimd.fromJsonObject(jsonObj.monsters[monsterid]);

                this.monsters[monsterid] = omimd;
            }
        }
        else if(key == "pioneers"){
            this.pioneers = new Map<string, PioneerData>();
            for(let pioneerid in jsonObj.pioneers){
                let ompd = new PioneerData();
                ompd.fromJsonObject(jsonObj.pioneers[pioneerid]);

                // this.pioneers[pioneerid] = ompd;
                this.pioneers.set(pioneerid,ompd);
            }
        }
        else if(key == "resPoint"){
            this.resPoint = new Map<string, ResPointData>();
            for(let id in jsonObj.resPoint){
                let ompd = new ResPointData();
                ompd.fromJsonObject(jsonObj.resPoint[id]);
                this.resPoint.set(id,ompd);

            }
        }
        return true;
    }

    protected override _specialAssignToJson(key:string, jsonObj:any):boolean {
        if(key == "towns"){
            this.towns.forEach((v,k)=>{
                let omitdObj = {};
                v.toJsonObj(omitdObj);

                jsonObj[k] = omitdObj;
            });
        }
        else if(key == "monsters"){
            this.monsters.forEach((v,k)=>{
                let omimdObj = {};
                v.toJsonObj(omimdObj);

                jsonObj[k] = omimdObj;
            });
        }
        else if(key == "pioneers"){
            this.pioneers.forEach((v,k)=>{
                let ompdObj = {};
                v.toJsonObj(ompdObj);

                jsonObj[k] = ompdObj;
            });
        }
        else if(key == "resPoint"){
            this.resPoint.forEach((v,k)=>{
                let ompdObj = {};
                v.toJsonObj(ompdObj);

                jsonObj[k] = ompdObj;
            });
        }
        
        
        return true;
    }
}

export class InnerData extends StructedData {
    public innerBuildUp:Map<string, InnerBuildUpData[]>; 
    protected override _specialAssignFromJson(key:string, jsonObj:any):boolean {
         if(key == "innerBuildUp"){
            this.innerBuildUp = new Map<string,  InnerBuildUpData[]>();
            for(let buildId in jsonObj.innerBuildUp){
                // let omimd = new InnerBuildingData();
                // omimd.fromJsonObject(jsonObj.innerBuildUp[buildId]);
                // this.innerBuildUp[buildId] = omimd;
                for(let i=0; i<jsonObj.innerBuildUp[buildId].length; ++i){
                    let ibd = new InnerBuildUpData();
                    ibd.fromJsonObject(jsonObj.innerBuildUp[buildId][i]);

                    if(!this.innerBuildUp[buildId]){
                        this.innerBuildUp[buildId] = [];
                    }

                    this.innerBuildUp[buildId].push(ibd);
                }
            }
        }
        return true;
    }

    protected override _specialAssignToJson(key:string, jsonObj:any):boolean {
        if(key == "innerBuildUp"){
            this.innerBuildUp.forEach((v,k)=>{
                // let omimdObj = {};
                // v.toJsonObj(omimdObj);
                // jsonObj[k] = omimdObj;

                v.forEach((ibd) => {
                    let ibdObj = {};
                    ibd.toJsonObj(ibdObj);
                    jsonObj[k] = ibdObj;
                });

            });
        }
        
        return true;
    }
}

export class InnerBuildInfo extends StructedData {
    buildID:string;
    buildName:string;
    buildLevel:number;
    buildUpTime:number;
}

export class PlayerData extends StructedData {
    playerID:string;
    playerName:string;
    level:number;
    money:number;
    energy:number;
    exp:number

}

// export class SelfData extends PlayerData {
//     playerData:PlayerData;
//     innerBuildData:Map<string, InnerBuildInfo>;

//     protected override _specialAssignFromJson(key:string, jsonObj:any):boolean {
//         if(key == "playerData"){
//             this.playerData = new PlayerData();
//             let omitd = new PlayerData();
//             omitd.fromJsonObject(jsonObj.playerData);
//             this.playerData = omitd;

//         }
//         else if(key == "innerBuildData"){
//             this.innerBuildData = new Map<string, InnerBuildInfo>();
//             for(let id in jsonObj.innerBuildData){
//                 let omimd = new InnerBuildInfo();
//                 omimd.fromJsonObject(jsonObj.innerBuildData[id]);
//                 this.innerBuildData.set(id,omimd);
//             }
//         }
//         return true;
//     }

//     protected override _specialAssignToJson(key:string, jsonObj:any):boolean {
//         if(key == "playerData"){
//             this.playerData.toJsonObj(jsonObj.playerData);
//         }
//         else if(key == "innerData"){
//             this.innerBuildData.forEach((v,k)=>{
//                 let omimdObj = {};
//                 v.toJsonObj(omimdObj);

//                 jsonObj[k] = omimdObj;
//             });
//         }
        
//         return true;
//     }
// }