export interface AbiConfigData {
    contracts: {
        [index: string]: AbiContractConfigData;
    };
}

export interface AbiContractConfigData {
    deployer: string;
    addr: string;
    abi: string[];
}
