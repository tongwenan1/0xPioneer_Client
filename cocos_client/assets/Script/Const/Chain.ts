export interface ChainConfigData {
    currentChainId: string;
    configs: {
        [index: string]: ChainConfigsConfigData;
    };
}

export interface ChainConfigsConfigData {
    chainId: string;
    chainName: string;
    nativeCurrency: {
        name: string;
        symbol: string;
        decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
    abi: string;
}
