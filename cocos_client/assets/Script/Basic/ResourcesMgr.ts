import { Asset, resources, assetManager, isValid, AssetManager, sys } from "cc";

export const ABResBundleName = "abresources";

export default class ResourcesManager {
    public async Init(progressCB: (err: Error | null, bundle: AssetManager.Bundle) => void) {
        this.initABBundle(progressCB);
    }

    initABBundle(progressCB: (err: Error | null, bundle: AssetManager.Bundle) => void) {
        assetManager.loadBundle(
            ABResBundleName,
            {
                onFileProgress: (loaded: number, total: number) => {
                    console.log("exce ResourcesManager loadBundle " + ABResBundleName + ":" + loaded + "/" + total);
                },
            },
            (err: Error | null, bundle: AssetManager.Bundle) => {
                if (err) {
                    progressCB(err, null);
                    return;
                }
                progressCB(null, bundle);
            }
        );
    }

    public LoadResource<T extends Asset>(path: string, type: new (...args: any[]) => T): Promise<T> {
        return new Promise((resolve, reject) => {
            var res = resources.get(path, type);
            if (!res) {
                resources.load(path, type, (error, sf: T) => {
                    if (error) {
                        console.warn("ResourcesManager LoadResource error: ", error);
                        resolve(null);
                    }
                    resolve(sf);
                });
            } else {
                resolve(res);
            }
        });
    }

    public LoadABResource<T extends Asset>(path: string, type: new (...args: any[]) => T): Promise<T> {
        // console.log("ResourcesManager LoadABResource path:" + path);
        if (!path) {
            console.error("ResourcesManager LoadABResource path is null");
            return null;
        }
        return new Promise(async (resolve, reject) => {
            let bundle = await this.loadBundle(ABResBundleName);
            if (!bundle) return resolve(null);
            var res = bundle.get(path, type) as T;
            if (!res) {
                bundle.load(path, type, (err, asset: T) => {
                    if (err) {
                        console.warn("ResourcesManager LoadABResource error: ", err);
                        resolve(null);
                    }
                    resolve(asset);
                });
            } else {
                resolve(res);
            }
        });
    }

    public ReleaseABResource(path: string) {
        this.loadBundle(ABResBundleName).then((bundle: AssetManager.Bundle) => {
            bundle.release(path);
        });
    }

    private loadBundle(name: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            let bundle: AssetManager.Bundle | null = assetManager.getBundle(name);
            if (isValid(bundle)) {
                resolve(bundle!);
            } else {
                assetManager.loadBundle(
                    name,
                    {
                        onFileProgress: (loaded: number, total: number) => {
                            console.log("ResourcesManager loadBundle " + name + ":" + loaded + "/" + total);
                        },
                    },
                    (err: Error | null, bundle: AssetManager.Bundle) => {
                        if (err) {
                            return reject(err);
                        }
                        resolve(bundle);
                    }
                );
            }
        });
    }
}
