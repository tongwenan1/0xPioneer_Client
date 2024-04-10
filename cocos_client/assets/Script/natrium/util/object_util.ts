// natrium
// license : MIT
// author : Sean Chen

// import * as lodash from "lodash";

export interface object_diff_path {
    diffpaths: Array<string>;
    newpaths: Array<string>;
    delpaths: Array<string>;
}

export class object_util {
    public static isObject(object: any): boolean {
        return object != null && typeof object === "object";
    }
    public static isArray(object: any): boolean {
        return object != null && Array.isArray(object);
    }

    public static shallowEqual(object1: any, object2: any): boolean {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (let key of keys1) {
            if (object1[key] !== object2[key]) {
                return false;
            }
        }
        return true;
    }

    public static deepEqual(object1: any, object2: any): boolean {
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);
        if (keys1.length !== keys2.length) {
            return false;
        }
        for (const key of keys1) {
            const val1 = object1[key];
            const val2 = object2[key];

            if (this.isArray(val1)) {
                if (!this.isArray(val2)) {
                    return false;
                }

                return this.deepEqual(val1, val2);
            } else if (this.isObject(val1)) {
                if (!this.isObject(val2)) {
                    return false;
                }

                return this.deepEqual(val1, val2);
            }

            if (val1 !== val2) {
                return false;
            }
        }
        return true;
    }

    public static deepDiffObject(newobj: any, oldobj: any, diffs: object_diff_path, currentPath: string = ""): void {
        const keysnew = Object.keys(newobj);
        for (const key of keysnew) {
            if (!(key in oldobj)) {
                diffs.newpaths.push(`${currentPath}.${key}`);

                continue;
            }

            const valnew = newobj[key];
            const valold = oldobj[key];

            if (this.isArray(valnew)) {
                if (!this.isArray(valold)) {
                    diffs.diffpaths.push(`${currentPath}.${key}`);
                } else {
                    this.deepDiffArray(valnew, valold, diffs, `${currentPath}.${key}`);
                }
            } else if (this.isObject(valnew)) {
                if (!this.isObject(valold)) {
                    diffs.diffpaths.push(`${currentPath}.${key}`);
                } else {
                    this.deepDiffObject(valnew, valold, diffs, `${currentPath}.${key}`);
                }
            }

            if (valnew !== valold) {
                diffs.diffpaths.push(`${currentPath}.${key}`);
            }
        }

        const keysold = Object.keys(oldobj);
        for (const key of keysold) {
            if (!(key in newobj)) {
                diffs.delpaths.push(`${currentPath}.${key}`);
            }
        }
    }

    public static deepDiffArray(newobj: any, oldobj: any, diffs: object_diff_path, currentPath: string = ""): void {
        const keysnew = Object.keys(newobj);
        for (const key of keysnew) {
            if (!(key in oldobj)) {
                diffs.newpaths.push(`${currentPath}[${key}]`);

                continue;
            }

            const valnew = newobj[key];
            const valold = oldobj[key];

            if (this.isArray(valnew)) {
                if (!this.isArray(valold)) {
                    diffs.diffpaths.push(`${currentPath}[${key}]`);
                } else {
                    this.deepDiffArray(valnew, valold, diffs, `${currentPath}[${key}]`);
                }
            } else if (this.isObject(valnew)) {
                if (!this.isObject(valold)) {
                    diffs.diffpaths.push(`${currentPath}[${key}]`);
                } else {
                    this.deepDiffObject(valnew, valold, diffs, `${currentPath}[${key}]`);
                }
            }

            if (valnew !== valold) {
                diffs.diffpaths.push(`${currentPath}[${key}]`);
            }
        }

        const keysold = Object.keys(oldobj);
        for (const key of keysold) {
            if (!(key in newobj)) {
                diffs.delpaths.push(`${currentPath}[${key}]`);
            }
        }
    }

    // public static deepClone(obj:any):any {
    //     return lodash.cloneDeep(obj);
    // }
}
