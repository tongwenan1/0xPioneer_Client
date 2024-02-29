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
            this._audioSource.stop();
            this._audioSource.clip = clip;
            this._audioSource.loop = loop;
            this._audioSource.play();
        });
    }
    public changeMusicVolume(volume: number) {
        this._musicVolume = volume;
        this._audioSource.volume = volume;
        this._effectVolumeBase = 1 / this._musicVolume;
        localStorage.setItem("localMusicVolume", volume.toString());
    }

    public playEffect(path: string, uniqueId: string = null) {
        if (path == null || path.length <= 0) {
            return;
        }
        if (uniqueId == null) {
            uniqueId = path + new Date().getTime();
        }
        resources.load(path, (err, clip: AudioClip) => {
            if (err) {
                return;
            }
            this._audioSource.playOneShot(clip, this._effectVolume * this._effectVolumeBase);
        });
    }
    public changeEffectVolume(volume: number) {
        this._effectVolume = volume;
        localStorage.setItem("localEffectVolume", volume.toString());
    }

    private static _instance: AudioMgr = null;

    private _currentScene: Scene = null;
    private _audioSource: AudioSource = null;
    private _musicVolume: number = 1.0;
    private _effectVolumeBase: number = 1.0;
    private _effectVolume: number = 1.0;
    constructor() {
        this._currentScene = director.getScene();
        const node = new Node();
        node.name = "__audioMgr";
        this._audioSource = node.addComponent(AudioSource);
        this._audioSource.volume = this._musicVolume;
        this._currentScene.addChild(node);

        const localMusicVolume = localStorage.getItem("localMusicVolume");
        if (localMusicVolume != null) {
            this._musicVolume = parseFloat(localMusicVolume);
            this._effectVolumeBase = 1 / this._musicVolume;
        }

        const localEffectVolume = localStorage.getItem("localEffectVolume");
        if (localEffectVolume != null) {
            this._effectVolume = parseFloat(localEffectVolume);
        }
    }
}


