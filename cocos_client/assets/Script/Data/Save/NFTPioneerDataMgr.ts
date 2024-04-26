import NotificationMgr from "../../Basic/NotificationMgr";
import ConfigConfig from "../../Config/ConfigConfig";
import NFTPioneerConfig from "../../Config/NFTPioneerConfig";
import NFTPioneerNameConfig from "../../Config/NFTPioneerNameConfig";
import NFTSkillConfig from "../../Config/NFTSkillConfig";
import NFTSkillEffectConfig from "../../Config/NFTSkillEffectConfig";
import { InnerBuildingType } from "../../Const/BuildingDefine";
import { ConfigType, NFTLevelInitLimitNumParam, NFTLevelLimitPerRankAddNumParam, NFTRankLimitNumParam, NFTRaritySkillInitNumParam } from "../../Const/Config";
import { BackpackArrangeType, GameExtraEffectType } from "../../Const/ConstDefine";
import { NFTPioneerConfigData, NFTPioneerObject } from "../../Const/NFTPioneerDefine";
import { NotificationName } from "../../Const/Notification";
import CommonTools from "../../Tool/CommonTools";

export default class NFTPioneerDataMgr {
    private _baseKey: string = "local_nft_pioneer";
    private _key: string = "";

    private _data: NFTPioneerObject[] = [];
    public constructor() {}
    //--------------------------------
    public loadObj(walletAddr: string) {
        this._key = walletAddr + "|" + this._baseKey;
        this._initData();
    }
    public saveObj() {
        localStorage.setItem(this._key, JSON.stringify(this._data));
    }
    //--------------------------------
    public getAll(): NFTPioneerObject[] {
        return this._data;
    }
    public getNFTById(NFTId: string): NFTPioneerObject {
        return this._data.find((v) => v.uniqueId == NFTId);
    }
    public getNFTByWorkingBuildingId(buildingId: InnerBuildingType): NFTPioneerObject {
        return this._data.find((v) => v.workingBuildingId == buildingId);
    }
    public getNFTEffectById(NFTId: string, type: GameExtraEffectType): number {
        let effectNum: number = 0;
        const NFT = this.getNFTById(NFTId);
        if (NFT == undefined) {
            return effectNum;
        }
        for (const skill of NFT.skills) {
            const config = NFTSkillConfig.getById(skill.id);
            if (config == null) {
                continue;
            }
            for (const templeEffect of config.effect) {
                const effectConfig = NFTSkillEffectConfig.getById(templeEffect.toString());
                if (effectConfig == null) {
                    continue;
                }
                let effectType = effectConfig.type;
                if (effectType == GameExtraEffectType.VISION_RANGE) {
                    effectType = GameExtraEffectType.PIONEER_ONLY_VISION_RANGE;
                }
                if (effectType != type) {
                    continue;
                }
                effectNum += effectConfig.para[0];
            }
        }
        return effectNum;
    }
    //-------------------------------- data action
    public generateNewNFT(NFTId: string = null): NFTPioneerObject {
        let useId: string = NFTId;
        if (useId == null) {
            useId = NFTPioneerConfig.getRandomNFTId();
        }
        const object = this._convertConfigToObject(new Date().getTime() + CommonTools.generateUUID(), NFTPioneerConfig.getById(useId));
        this._data.push(object);
        this.saveObj();

        return object;
    }

    public NFTLevelUp(NFTId: string, levelUpNum: number) {
        const object = this.getNFTById(NFTId);
        if (object == undefined) {
            return;
        }
        const resultLevelUpNum: number = Math.min(levelUpNum, object.levelLimit - object.level);
        object.level += resultLevelUpNum;
        object.attack = CommonTools.getOneDecimalNum(object.attack + object.attackGrowValue * resultLevelUpNum);
        object.defense = CommonTools.getOneDecimalNum(object.defense + object.defenseGrowValue * resultLevelUpNum);
        object.hp = CommonTools.getOneDecimalNum(object.hp + object.hpGrowValue * resultLevelUpNum);
        object.speed = CommonTools.getOneDecimalNum(object.speed + object.speedGrowValue * resultLevelUpNum);
        object.iq = CommonTools.getOneDecimalNum(object.iq + object.iqGrowValue * resultLevelUpNum);
        this.saveObj();
        NotificationMgr.triggerEvent(NotificationName.NFTDIDLEVELUP, { nft: object });
    }
    public NFTRankUp(NFTId: string, rankUpNum: number) {
        const object = this.getNFTById(NFTId);
        if (object == undefined) {
            return;
        }
        const resultRankUpNum: number = Math.min(rankUpNum, object.rankLimit - object.rank);
        object.rank += resultRankUpNum;
        object.levelLimit += resultRankUpNum * (ConfigConfig.getConfig(ConfigType.NFTLevelLimitPerRankAddNum) as NFTLevelLimitPerRankAddNumParam).value;
        this.saveObj();
        NotificationMgr.triggerEvent(NotificationName.NFTDIDRANKUP);
    }

    public NFTLearnSkill(NFTId: string, skillId: string) {
        const object = this.getNFTById(NFTId);
        if (object == undefined) {
            return;
        }
        object.skills.push({
            id: skillId,
            isOriginal: false,
        });
        this.saveObj();
        NotificationMgr.triggerEvent(NotificationName.NFTDIDLEARNSKILL);
    }
    public NFTForgetSkill(NFTId: string, skillIndex: number) {
        const object = this.getNFTById(NFTId);
        if (object == undefined) {
            return;
        }
        if (skillIndex < 0 || skillIndex >= object.skills.length) {
            return;
        }
        object.skills.splice(skillIndex, 1);
        this.saveObj();
        NotificationMgr.triggerEvent(NotificationName.NFTDIDFORGETSKILL);
    }

    public NFTChangeWork(NFTId: string, workingBuildingId: InnerBuildingType) {
        const lastBuildingBindObject = this.getNFTByWorkingBuildingId(workingBuildingId);
        if (lastBuildingBindObject != undefined) {
            lastBuildingBindObject.workingBuildingId = null;
            this.saveObj();
        }
        const object = this.getNFTById(NFTId);
        if (object == undefined) {
            return;
        }
        object.workingBuildingId = workingBuildingId;
        this.saveObj();
        NotificationMgr.triggerEvent(NotificationName.NFTDIDCHANGEWORKBUILDING);
    }

    public NFTSort(sortType: BackpackArrangeType) {
        // sort
        if (sortType == BackpackArrangeType.Recently) {
            this._data.sort((a, b) => {
                return b.addTimeStamp - a.addTimeStamp;
            });
        } else if (sortType == BackpackArrangeType.Rarity) {
            //bigger in front
            this._data.sort((a, b) => {
                return b.rank - a.rank;
            });
        }
    }
    //--------------------------------
    private _initData() {
        const localDataString = localStorage.getItem(this._key);
        if (localDataString == null) {
        } else {
            this._data = JSON.parse(localDataString);
        }
    }
    private _convertConfigToObject(uniqueId: string, config: NFTPioneerConfigData): NFTPioneerObject {
        // name
        let name: string = "";
        for (const fragment of config.name) {
            name += NFTPioneerNameConfig.getById(CommonTools.getRandomItem(fragment)).name;
        }
        // property
        let attack: number = 0;
        let defense: number = 0;
        let hp: number = 0;
        let speed: number = 0;
        let iq: number = 0;
        if (config.property.length == 5) {
            attack = CommonTools.getRandomNumberWithOneDecimal(config.property[0][0], config.property[0][1]);
            defense = CommonTools.getRandomNumberWithOneDecimal(config.property[1][0], config.property[1][1]);
            hp = CommonTools.getRandomNumberWithOneDecimal(config.property[2][0], config.property[2][1]);
            speed = CommonTools.getRandomNumberWithOneDecimal(config.property[3][0], config.property[3][1]);
            iq = CommonTools.getRandomNumberWithOneDecimal(config.property[4][0], config.property[4][1]);
        }
        // property grow
        let attackGrowValue = 0;
        let defenseGrowValue = 0;
        let hpGrowValue = 0;
        let speedGrowValue = 0;
        let iqGrowValue = 0;
        if (config.growth.length == 5) {
            attackGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[0][0], config.growth[0][1]);
            defenseGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[1][0], config.growth[1][1]);
            hpGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[2][0], config.growth[2][1]);
            speedGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[3][0], config.growth[3][1]);
            iqGrowValue = CommonTools.getRandomNumberWithOneDecimal(config.growth[4][0], config.growth[4][1]);
        }
        // skills
        const skills = [];
        if (config.skill != null) {
            const skillLength: number = Math.min(
                config.skill.length,
                (ConfigConfig.getConfig(ConfigType.NFTRaritySkillInitNum) as NFTRaritySkillInitNumParam).initNumMap.get(config.quality)
            );
            for (let i = 0; i < skillLength; i++) {
                skills.push({
                    id: config.skill[i],
                    isOriginal: true,
                });
            }
        }
        return {
            uniqueId: uniqueId,
            rarity: config.quality,
            name: name,
            attack: attack,
            defense: defense,
            hp: hp,
            speed: speed,
            iq: iq,
            attackGrowValue: attackGrowValue,
            defenseGrowValue: defenseGrowValue,
            hpGrowValue: hpGrowValue,
            speedGrowValue: speedGrowValue,
            iqGrowValue: iqGrowValue,
            level: 1,
            levelLimit: (ConfigConfig.getConfig(ConfigType.NFTLevelInitLimitNum) as NFTLevelInitLimitNumParam).limit,
            rank: 1,
            rankLimit: (ConfigConfig.getConfig(ConfigType.NFTRankLimitNum) as NFTRankLimitNumParam).limit,
            skills: skills,
            workingBuildingId: null,
            addTimeStamp: new Date().getTime(),
        };
    }
}
