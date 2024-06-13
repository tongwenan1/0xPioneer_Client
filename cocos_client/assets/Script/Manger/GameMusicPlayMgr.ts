import { AudioClip } from "cc";
import { AudioMgr, ResourcesMgr } from "../Utils/Global";
import { BundleName } from "../Basic/ResourcesMgr";

export default class GameMusicPlayMgr {
    //------------------------------------- music
    public static async playLoginMusic() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/BGM_login", AudioClip);
        AudioMgr.playMusic(clip, true);
    }

    public static async playGameMusic() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/BGM_main", AudioClip);
        AudioMgr.playMusic(clip, true);
    }

    public static stopMusic() {
        AudioMgr.stopMusic();
    }

    //------------------------------------- music
    public static async playTapButtonEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/button", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playWakeUpEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/wakeup", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playBeginBuildEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/build", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playBeginGenerateTroopEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/train", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playEquepArtifactEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/activation", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playCollectMineEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/mine", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playCollectWoodEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/logging", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playCollectFoodEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/cutmeat", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playExploreEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/explore", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playChangeInnerOuterEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/switch", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playWormholeSetAttackerEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/transfer", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playWormholeAttackEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/start-up", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playMoveEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/run", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playOpenBoxStep1Effect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/treasurebox1", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playOpenBoxStep2Effect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/treasurebox2", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playGetCommonItemEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/commonitem", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playGetRateItemEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/rareItem", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playBeginFightEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/fighting", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playFightWinEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/victory", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playFightFailEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/fail", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playCampEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/garrison", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playGetResourceEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/material", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playGetNewPioneerEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/getrole", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playMapRefreshEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/refresh", AudioClip);
        AudioMgr.playEffect(clip);
    }
    public static async playPioneerRebonEffect() {
        const clip = await ResourcesMgr.loadResource(BundleName.MainBundle, "music/resurrection", AudioClip);
        AudioMgr.playEffect(clip);
    }
}
