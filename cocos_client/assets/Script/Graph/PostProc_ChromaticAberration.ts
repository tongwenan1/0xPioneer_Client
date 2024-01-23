import { _decorator, Component, Node, rendering,  Material, renderer, Vec4, gfx, input, postProcess, EffectAsset, Vec3 } from 'cc';
const { ccclass, property, menu } = _decorator;

const { SettingPass, PostProcessSetting, BlitScreenPass,ForwardPass, }=postProcess

@ccclass('ChromaticAberration')
@menu('PostProcess/ChromaticAberration')
export class ChromaticAberration extends postProcess.PostProcessSetting {
    @property
    get ChromaticAberration(){
        return this._params.y;
    }
    set ChromaticAberration(v){
        this._params.y = v;
        this.updateMaterial();
    }

    @property
    get Center(){
        return this._params.x;
    }
    set Center(v){
        this._params.x = v;
        this.updateMaterial();
    }

    @property
    get Color(){
        return this._color;
    }
    set Color(v){
        this._color = v;
        this.updateMaterial();
    }

    @property(EffectAsset)
    _effectAsset: EffectAsset | undefined

    @property(EffectAsset)
    get effect () {
        return this._effectAsset;
    }
    set effect (v) {
        this._effectAsset = v;
        if(this._effectAsset == null){
            this._material = null;
        }
        else{
            if(this._material == null){
                this._material = new Material();
            }
            this._material.reset({effectAsset:this._effectAsset});
        }
        this.updateMaterial();
    }

    private _material:Material;
    public get material():Material{
        return this._material;
    }
    
    @property
    private _params:Vec3 = new Vec3(0.0,0.001,0.0);
    public get params():Vec3{
        return this._params;
    }
    
    @property
    private _color:Vec3 = new Vec3(1.0,1.0,1.0);
    public get color():Vec3{
        return this._color;
    }
    
    updateMaterial(){
        if(!this._material){
            return;
        }
        this._material.setProperty('params', this.params);
        this._material.setProperty('color', this.color);
    }

    protected start(): void {
        if(this._effectAsset){
            this._material = new Material();
            this._material.initialize({effectAsset:this._effectAsset});
            this._material.setProperty('params', this.params);
            this._material.setProperty('color', this.color);
        }
    }
}


export class ChromaticAberrationPass extends SettingPass {
    name = 'ChromaticAberrationPass'
    outputNames: string[] = ['ChromaticAberrationColor']

    get setting () { return this.getSetting(ChromaticAberration); }

    checkEnable (camera: renderer.scene.Camera) {
        let enable = super.checkEnable(camera);
        if (postProcess.disablePostProcessForDebugView()) {
            enable = false;
        }
        return enable && this.setting.material != null;
    }

    render (camera: renderer.scene.Camera, ppl: rendering.Pipeline) {
        const setting = this.setting;
        if(!setting.material){
            return;
        }

        const cameraID = this.getCameraUniqueID(camera);

        let context = this.context;
        context.clearBlack()

        let input0 = this.lastPass.slotName(camera, 0);
        let output = this.slotName(camera);

        context.material = setting.material;
        context
            .updatePassViewPort()
            .addRenderPass('post-process', `${this.name}${cameraID}`)
            .setPassInput(input0, 'inputTexture')
            .addRasterView(output, gfx.Format.RGBA8)
            .blitScreen(0)
            .version();
    }
}

let builder = rendering.getCustomPipeline('Custom') as postProcess.PostProcessBuilder;
if (builder) {
    builder.insertPass(new ChromaticAberrationPass, BlitScreenPass);
}