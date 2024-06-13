import { Asset, assetManager, AssetManager } from "cc";

export const ABResBundleName = "abresources";
export enum BundleName {
    MainBundle = "abresources",
    InnerBundle = "abresources_2",
}

export interface ResourceInitResult {
    succeed: boolean;
    err: Error;
    bundle: AssetManager.Bundle;
}

export default class ResourcesManager {
    public initBundle(bundleName: BundleName): Promise<ResourceInitResult> {
        return new Promise<ResourceInitResult>((resolve, reject) => {
            assetManager.loadBundle(
                bundleName,
                {
                    onFileProgress: (loaded: number, total: number) => {},
                },
                (err: Error | null, bundle: AssetManager.Bundle) => {
                    if (err != null) {
                        resolve({
                            succeed: false,
                            err: err,
                            bundle: null,
                        });
                        return;
                    }
                    resolve({
                        succeed: true,
                        err: null,
                        bundle: bundle,
                    });
                }
            );
        });
    }

    public loadResource<T extends Asset>(bundleName: BundleName, path: string, type: new (...args: any[]) => T): Promise<T> {
        return new Promise(async (resolve, reject) => {
            if (path == "" || path == null) {
                resolve(null);
                return;
            }
            const result = await this.initBundle(bundleName);
            if (!result.succeed) {
                resolve(null);
                return;
            }
            const res = result.bundle.get(path, type) as T;
            if (res == null) {
                result.bundle.load(path, type, (err, asset: T) => {
                    if (err) {
                        resolve(null);
                        return;
                    }
                    resolve(asset);
                });
            } else {
                resolve(res);
            }
        });
    }

    public async releaseResource(bundleName: BundleName, path: string) {
        const result = await this.initBundle(bundleName);
        if (result.succeed) {
            result.bundle.release(path);
        }
    }

    public constructor() {}
}
