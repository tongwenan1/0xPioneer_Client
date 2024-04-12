import ConfigConfig from "../Config/ConfigConfig";
import NFTPioneerNameConfig from "../Config/NFTPioneerNameConfig";
import CommonTools from "../Tool/CommonTools";
import { ConfigType, NFTLevelInitLimitNumParam, NFTLevelLimitPerRankAddNumParam, NFTRankLimitNumParam } from "./Config";

export interface NFTPioneerConfigData {
    id: string;
    name: string[][];
    quality: number;
    property: number[][];
    growth: number[][];
    skill: string[];
}

export interface NFTPioneerNameConfigData {
    id: string;
    name: string;
}

export class NFTPioneerModel {
    public levelUp(levelUpNum: number) {
        const resultLevelUpNum: number = Math.min(levelUpNum, this._levelLimit - this._level);
        this._level += resultLevelUpNum;
        this._attack = CommonTools.getOneDecimalNum(this._attack + this._attackGrowValue * resultLevelUpNum);
        this._defense = CommonTools.getOneDecimalNum(this._defense + this._defenseGrowValue * resultLevelUpNum);
        this._hp = CommonTools.getOneDecimalNum(this._hp + this._hpGrowValue * resultLevelUpNum);
        this._speed = CommonTools.getOneDecimalNum(this._speed + this._speedGrowValue * resultLevelUpNum);
        this._iq = CommonTools.getOneDecimalNum(this._iq + this._iqGrowValue * resultLevelUpNum);
    }
    public rankUp(rankUpNum: number) {
        const resultRankUpNum: number = Math.min(rankUpNum, this._rankLimit - this._rank);
        this._rank += resultRankUpNum;
        this._levelLimit += (resultRankUpNum * (ConfigConfig.getConfig(ConfigType.NFTLevelLimitPerRankAddNum) as NFTLevelLimitPerRankAddNumParam).value);
    }

    public get uniqueId(): string {
        return this._uniqueId;
    }
    public get rarity(): number {
        return this._rarity;
    }
    public get name(): string {
        return this._name;
    }
    public get attack(): number {
        return this._attack;
    }
    public get defense(): number {
        return this._defense;
    }
    public get hp(): number {
        return this._hp;
    }
    public get speed(): number {
        return this._speed;
    }
    public get iq(): number {
        return this._iq;
    }
    public get level(): number {
        return this._level;
    }
    public get levelLimit(): number {
        return this._levelLimit;
    }
    public get rank(): number {
        return this._rank;
    }
    public get rankLimit(): number {
        return this._rankLimit;
    }
    public get attackGrowValue(): number {
        return this._attackGrowValue;
    }
    public get defenseGrowValue(): number {
        return this._defenseGrowValue;
    }
    public get hpGrowValue(): number {
        return this._hpGrowValue;
    }
    public get speedGrowValue(): number {
        return this._speedGrowValue;
    }
    public get iqGrowValue(): number {
        return this._iqGrowValue;
    }
    public convertConfigToModel(uniqueId: string, config: NFTPioneerConfigData) {
        this._uniqueId = uniqueId;
        this._rarity = config.quality;
        this._name = "";
        for (const fragment of config.name) {
            this._name += NFTPioneerNameConfig.getById(CommonTools.getRandomItem(fragment)).name;
        }
        this._attack = 0;
        this._defense = 0;
        this._hp = 0;
        this._speed = 0;
        this._iq = 0;
        if (config.property.length == 5) {
            this._attack = CommonTools.getRandomNumberWithOneDecimal(config.property[0][0], config.property[0][1]);
            this._defense = CommonTools.getRandomNumberWithOneDecimal(config.property[1][0], config.property[1][1]);
            this._hp = CommonTools.getRandomNumberWithOneDecimal(config.property[2][0], config.property[2][1]);
            this._speed = CommonTools.getRandomNumberWithOneDecimal(config.property[3][0], config.property[3][1]);
            this._iq = CommonTools.getRandomNumberWithOneDecimal(config.property[4][0], config.property[4][1]);
        }
        this._attackGrowValue = 0;
        this._defenseGrowValue = 0;
        this._hpGrowValue = 0;
        this._speedGrowValue = 0;
        this._iqGrowValue = 0;
        if (config.growth.length == 5) {
            this._attackGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[0][0], config.growth[0][1]);
            this._defenseGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[1][0], config.growth[1][1]);
            this._hpGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[2][0], config.growth[2][1]);
            this._speedGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[3][0], config.growth[3][1]);
            this._iqGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[4][0], config.growth[4][1]);
        }

        this._levelLimit = (ConfigConfig.getConfig(ConfigType.NFTLevelInitLimitNum) as NFTLevelInitLimitNumParam).limit;
        this._rankLimit = (ConfigConfig.getConfig(ConfigType.NFTRankLimitNum) as NFTRankLimitNumParam).limit;
    }
    public convertLocalDataToModel(localData: any) {
        this._uniqueId = localData._uniqueId;
        this._rarity = localData._rarity;
        this._name = localData._name;
        this._attack = localData._attack;
        this._defense = localData._defense;
        this._hp = localData._hp;
        this._speed = localData._speed;
        this._iq = localData._iq;
        this._level = localData._level;
        this._levelLimit = localData._levelLimit;
        this._rank = localData._rank;
        this._rankLimit = localData._rankLimit;
        this._attackGrowValue = localData._attackGrowValue;
        this._defenseGrowValue = localData._defenseGrowValue;
        this._hpGrowValue = localData._hpGrowValue;
        this._speedGrowValue = localData._speedGrowValue;
        this._iqGrowValue = localData._iqGrowValue;
    }
    public constructor() {
        this._level = 1;
        this._rank = 1;
    }
    private _uniqueId: string;
    private _rarity: number;
    private _name: string;
    private _attack: number;
    private _defense: number;
    private _hp: number;
    private _speed: number;
    private _iq: number;
    private _level: number;
    private _levelLimit: number;
    private _rank: number;
    private _rankLimit: number;

    private _attackGrowValue: number;
    private _defenseGrowValue: number;
    private _hpGrowValue: number;
    private _speedGrowValue: number;
    private _iqGrowValue: number;
}
