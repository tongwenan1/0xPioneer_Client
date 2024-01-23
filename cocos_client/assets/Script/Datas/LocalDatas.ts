import { sys } from "cc";
import { InnerData, OutMapData } from "./DataDefine";

export class LocalDatas {
    public outMapData:OutMapData;
    public InnerBuildData:InnerData;

    public InitData() {
        this.outMapData = new OutMapData();
        this.InnerBuildData = new InnerData();

        const omd = sys.localStorage.getItem("outMapData");
        if(omd){
            this.outMapData.fromJson(omd);
        }
        else {
            this.outMapData.fromJson(testMapDataJsonStr);
        }

        const ibd = sys.localStorage.getItem("InnerBuildData");
        if(ibd){
            this.InnerBuildData.fromJson(ibd);
        }
        else {
            this.InnerBuildData.fromJson(testInnerBuildDataJsonStr);
        }
    }
}


const testMapDataJsonStr = `
    {
        "towns":{
            "1":{
                "playerID":"1",
                "playerName":"Player1",
                "level":1,
                "money":9999,
                "diamond":1000,
                "desc":"<color=#ffffff>pointer total:3 avalibale:1/3&<color=#ffffff>resources energy: 2500/10000&</color><color=#00ff90>(gold+1/h collect+200/h factory-100/h)</color>",
                "water":8888
            },
            "2":{
                "playerID":"2",
                "playerName":"Player2",
                "level":1,
                "money":9999,
                "diamond":1000,
                "desc":"<color=#ffffff>pointer total:3 avalibale:1/3&<color=#ffffff>resources energy: 2500/10000&</color><color=#00ff90>(gold+1/h collect+200/h factory-100/h)</color>",
                "water":8888
            },
            "3":{
                "playerID":"3",
                "playerName":"Player3",
                "level":1,
                "money":9999,
                "diamond":1000,
                "desc":"<color=#ffffff>pointer total:3 avalibale:1/3&<color=#ffffff>resources energy: 2500/10000&</color><color=#00ff90>(gold+1/h collect+200/h factory-100/h)</color>",
                "water":8888
            }
        },
        "resPoint":{
            "1":{
                "playerID":"0",
                "playerName":"Village ruins",
                "resType":"RES_MINE",
                "level":1,
                "money":9999,
                "desc":"mine",
                "time":30,
                "diamond":1000
            },
            "2":{
                "playerID":"0",
                "playerName":"Abandoned farm",
                "resType":"RES_TREASURE",
                "level":1,
                "money":9999,
                "desc":"explore",
                "time":30,
                "diamond":1000
            },
            "3":{
                "playerID":"0",
                "playerName":"Scattered vegetation",
                "resType":"RES_MINE",
                "level":2,
                "money":9999,
                "desc":"mine",
                "time":30,
                "diamond":1000
            },
            "4":{
                "playerID":"0",
                "playerName":"Motor camp",
                "resType":"RES_CAMP",
                "level":3,
                "money":9999,
                "desc":"garrison",
                "time":30,
                "diamond":1000
            }
        },
        "monsters":{
            "1":{
                "playerID":"1",
                "playerName":"Monster",
                "level":1,
                "money":9999,
                "desc":"one monster",
                "time":5,
                "diamond":1000
            },
            "2":{
                "playerID":"2",
                "playerName":"Puny herd",
                "level":2,
                "money":9999,
                "desc":"several monsters",
                "time":8,
                "diamond":1000
            },
            "3":{
                "playerID":"3",
                "playerName":"Mutant herd",
                "level":3,
                "money":9999,
                "desc":"a bunch of monsters",
                "time":6,
                "diamond":1000
            }
        },
        "pioneers":{
            "1":{
                "playerID":3,
                "id":"1",
                "name":"P1",
                "level":1,
                "status":"IN_TOWN",
                "targetX":0,
                "targetY":0,
                "targetObj":"",
                "targetObjID":0
            },
            "2":{
                "playerID":3,
                "id":"2",
                "name":"P2",
                "level":1,
                "status":"IN_TOWN",
                "targetX":0,
                "targetY":0,
                "targetObj":"",
                "targetObjID":0
            },
            "3":{
                "playerID":3,
                "id":"3",
                "name":"P3",
                "level":1,
                "status":"IN_TOWN",
                "targetX":0,
                "targetY":0,
                "targetObj":"",
                "targetObjID":0
            },
            "4":{
                "playerID":2,
                "id":"4",
                "name":"P4",
                "level":1,
                "status":"IN_TOWN",
                "targetX":0,
                "targetY":0,
                "targetObj":"",
                "targetObjID":0
            },
            "5":{
                "playerID":2,
                "id":"5",
                "name":"P5",
                "level":1,
                "status":"IN_TOWN",
                "targetX":0,
                "targetY":0,
                "targetObj":"",
                "targetObjID":0
            },
            "6":{
                "playerID":2,
                "id":"6",
                "name":"P6",
                "level":1,
                "status":"IN_TOWN",
                "targetX":0,
                "targetY":0,
                "targetObj":"",
                "targetObjID":0
            }
        }
    }
`;

const testInnerBuildDataJsonStr = `
    {
        "innerBuildUp":{
            "0":
            [
                {
                    "buildName":"City Hall",
                    "buildID":0,
                    "buildLevel":1,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Main building upgrade",
                        "Increase the upper limit of other building levels"
                    ],
                    "upgradeConditionArr":[
                        "Warehouse level reaches level 2"
                    ],
                    "outTime":10,
                    "useItem":[
                        0,3
                    ],
                    "outItem":[
                        1,8
                    ],
                    "upgradeCostArr":[
                        1,100
                    ]
                },
                {
                    "buildName":"City Hall",
                    "buildID":0,
                    "buildLevel":2,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Main building upgrade",
                        "Increase the upper limit of other building levels"
                    ],
                    "upgradeConditionArr":[
                        "Warehouse level reaches level 3"
                    ],
                    "outTime":8,
                    "useItem":[
                        0,5
                    ],
                    "outItem":[
                        1,9
                    ],
                    "upgradeCostArr":[
                        1,100
                    ]
                },
                {
                    "buildName":"City Hall",
                    "buildID":0,
                    "buildLevel":3,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Main building upgrade",
                        "Increase the upper limit of other building levels"
                    ],
                    "upgradeConditionArr":[
                        "Warehouse level reaches level 4"
                    ],
                    "outTime":6,
                    "useItem":[
                        0,9
                    ],
                    "outItem":[
                        1,16
                    ],
                    "upgradeCostArr":[
                        1,100
                    ]
                }
            ],
            "1":
            [
                {
                    "buildName":"Factory1",
                    "buildID":1,
                    "buildLevel":1,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase warehouse capacity"
                    ],
                    "upgradeConditionArr":[
                        "Warehouse level reaches level 2"
                    ],
                    "outTime":12,
                    "useItem":[
                        0,7
                    ],
                    "outItem":[
                        1,6
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                },
                {
                    "buildName":"Factory1",
                    "buildID":1,
                    "buildLevel":2,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase warehouse capacity"
                    ],
                    "upgradeConditionArr":[
                        "Warehouse level reaches level 3"
                    ],
                    "outTime":3,
                    "useItem":[
                        0,5
                    ],
                    "outItem":[
                        1,12
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                },
                {
                    "buildName":"Factory1",
                    "buildID":1,
                    "buildLevel":3,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase warehouse capacity"
                    ],
                    "upgradeConditionArr":[
                        "Warehouse level reaches level 4"
                    ],
                    "outTime":12,
                    "useItem":[
                        0,9
                    ],
                    "outItem":[
                        1,15
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                }
            ],
            "2":[
                {
                    "buildName":"Factory2",
                    "buildID":2,
                    "buildLevel":1,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase factory output"
                    ],
                    "upgradeConditionArr":[
                        "Factory level reaches level 2"
                    ],
                    "outTime":8,
                    "useItem":[
                        0,3
                    ],
                    "outItem":[
                        1,6
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                },
                {
                    "buildName":"Factory2",
                    "buildID":2,
                    "buildLevel":2,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase factory output"
                    ],
                    "upgradeConditionArr":[
                        "Factory level reaches level 3"
                    ],
                    "outTime":5,
                    "useItem":[
                        0,3
                    ],
                    "outItem":[
                        1,8
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                },
                {
                    "buildName":"Factory2",
                    "buildID":2,
                    "buildLevel":3,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase factory output"
                    ],
                    "upgradeConditionArr":[
                        "Factory level reaches level 4"
                    ],
                    "outTime":10,
                    "useItem":[
                        0,6
                    ],
                    "outItem":[
                        1,12
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                }
            ],
            "3":[
                {
                    "buildName":"Factory3",
                    "buildID":3,
                    "buildLevel":1,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase barracks production"
                    ],
                    "upgradeConditionArr":[
                        "The barracks level reaches level 2"
                    ],
                    "outTime":10,
                    "useItem":[
                        0,2
                    ],
                    "outItem":[
                        1,6
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                },
                {
                    "buildName":"Factory3",
                    "buildID":3,
                    "buildLevel":2,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase barracks production"
                    ],
                    "upgradeConditionArr":[
                        "The barracks level reaches level 3"
                    ],
                    "outTime":7,
                    "useItem":[
                        0,2
                    ],
                    "outItem":[
                        1,8
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                },
                {
                    "buildName":"Factory3",
                    "buildID":3,
                    "buildLevel":3,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase barracks production"
                    ],
                    "upgradeConditionArr":[
                        "The barracks level reaches level 4"
                    ],
                    "outTime":6,
                    "useItem":[
                        0,6
                    ],
                    "outItem":[
                        1,10
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                }
            ],
            "4":[
                {
                    "buildName":"Store House",
                    "buildID":4,
                    "buildLevel":1,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase mine production"
                    ],
                    "upgradeConditionArr":[
                        "The mine level reaches level 2"
                    ],
                    "outTime":13,
                    "useItem":[
                        0,2
                    ],
                    "outItem":[
                        1,3
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                },
                {
                    "buildName":"Store House",
                    "buildID":4,
                    "buildLevel":2,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase mine production"
                    ],
                    "upgradeConditionArr":[
                        "The mine level reaches level 3"
                    ],
                    "outTime":7,
                    "useItem":[
                        0,3
                    ],
                    "outItem":[
                        1,5
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                },
                {
                    "buildName":"Store House",
                    "buildID":4,
                    "buildLevel":3,
                    "upgradeTime":1000,
                    "upgradeEffectArr":[
                        "Increase mine production"
                    ],
                    "outTime":7,
                    "useItem":[
                        0,5
                    ],
                    "outItem":[
                        1,10
                    ],
                    "upgradeConditionArr":[
                        "The mine level reaches level 4"
                    ],
                    "upgradeCostArr":[
                        1,1000
                    ]
                }
            ]
        }
    }
`;