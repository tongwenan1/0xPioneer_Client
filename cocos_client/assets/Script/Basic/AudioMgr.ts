import { AudioClip, AudioSource, Node, Scene, director, resources } from "cc";

export class AudioMgr {

    public static get instance(): AudioMgr {
        if (this._instance == null) {
            this._instance = new AudioMgr();
        }
        return this._instance;
    }

    public playMusic(path: string, loop: boolean = false) {
        if (path == null || path.length <= 0) {
            return;
        }
        resources.load(path, (err, clip: AudioClip) => {
            if (err) {
                return;
            }
            this._musicSource.stop();
            this._musicSource.clip = clip;
            this._musicSource.loop = loop;
            this._musicSource.play();
        });
    }
    public changeMusicVolume(volume: number) {
        this._musicVolume = volume;
        this._musicSource.volume = volume;
        localStorage.setItem("localMusicVolume", volume.toString());
    }

    public playEffect(path: string) {
        if (path == null || path.length <= 0) {
            return;
        }
        resources.load(path, (err, clip: AudioClip) => {
            if (err) {
                return;
            }
            this._effectSource.playOneShot(clip);
        });
    }
    public changeEffectVolume(volume: number) {
        this._effectVolume = volume;
        this._effectSource.volume = volume;
        localStorage.setItem("localEffectVolume", volume.toString());
    }

    public get musicVolume(): number {    
        return this._musicVolume
    }
    public get effectVolume(): number {
        return this._effectVolume;
    }

    private static _instance: AudioMgr = null;

    private _currentScene: Scene = null;
    private _musicSource: AudioSource = null;
    private _effectSource: AudioSource = null;
    private _musicVolume: number = 1.0;
    private _effectVolume: number = 1.0;
    constructor() {
        this._currentScene = director.getScene();
        const musicNode = new Node();
        musicNode.name = "__audioMgr_music";
        this._musicSource = musicNode.addComponent(AudioSource);
        this._currentScene.addChild(musicNode);

        const effectNode = new Node();
        effectNode.name = "__audioMgr_effect";
        this._effectSource = effectNode.addComponent(AudioSource);
        this._currentScene.addChild(effectNode);

        const localMusicVolume = localStorage.getItem("localMusicVolume");
        if (localMusicVolume != null) {
            this._musicVolume = parseFloat(localMusicVolume);
        }
        this._musicSource.volume = this._musicVolume;

        const localEffectVolume = localStorage.getItem("localEffectVolume");
        if (localEffectVolume != null) {
            this._effectVolume = parseFloat(localEffectVolume);
        }
        this._effectSource.volume = this._effectVolume;
    }
}


