// natrium
// license : MIT
// author : Sean Chen

export interface httpconnecter {
    post(url: string, data: any): Promise<any>;
}
