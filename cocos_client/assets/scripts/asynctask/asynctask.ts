
export type _types_globals__Constructor<T = unknown> = new (...args: any[]) => T;
import * as cc from 'cc';
export class AsyncTask
{ 
   
    public static loading:cc.Prefab;
    
    public static  LoadResAsync<T extends cc.Asset>(url:string,type: _types_globals__Constructor<T> ):Promise<T>
    {
      
        var promiss=new Promise<T>((resolve,reject)=>
        {    
            cc.resources.load<T>("prefab/prefab_loading",type,(err,prefab)=>
            { 
         
                resolve(prefab);
            });        
        });
        return promiss;
    }
    public static  LoadSceneAsync(name:string):Promise<void>
    {
        var promiss=new Promise<void>((resolve,reject)=>
        {    
            cc.director.loadScene(name,(l)=>    
            {
                resolve()
            });
        });
        return promiss;
    }
    public static  Delay( time_millisecond:number):Promise<void>
    {
        var promiss=new Promise<void>((resolve,reject)=>
        {    
            setTimeout(() => {
                resolve();
            }, time_millisecond);
        });
        return promiss;
       
    }
}