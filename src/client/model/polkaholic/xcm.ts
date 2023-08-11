export interface XCMInfoWrapper {
    xcmInfo: XCMInfo;
}
export interface XCMInfo {
    relayChain: XCMRelayChain;
    origination: XCMOrigination;
    destination: XCMDestination;
}

// prettier-ignore
export function isXCMInfo(object: any): object is XCMInfo { // eslint-disable-line @typescript-eslint/no-explicit-any
    return 'relayChain' in object && 'origination' in object && 'destination' in object;
}

export interface XCMRelayChain {
    relayChain: string;
    relayAt: number;
}

export interface XCMOrigination {
    chainName: string;
    id: string;
    chainID: number;
    paraID: number;
    sender: string;
    amountSent: number;
    amountSentUSD: number;
    xcmtransferHash: string;
    initiateTS: number;
    txFee: number;
    txFeeUSD: number;
    txFeeSymbol: string;
    blockNumber: number;
    section: string;
    method: string;
    extrinsicID: string;
    extrinsicHash: string;
    msgHash: string;
    sentAt: number;
    ts: number;
    decimals: number;
    isMsgSent: boolean;
    finalized: boolean;
    isFeeItem: number;
    xcmIndex: number;
    transferIndex: number;
}

export interface XCMDestination {
    chainName: string;
    id: string;
    chainID: number;
    paraID: number;
    beneficiary: string;
    amountReceived: number;
    amountReceivedUSD: number;
    teleportFee: number;
    teleportFeeUSD: number;
    teleportFeeChainSymbol: string;
    blockNumber: number;
    eventID: string;
    ts: number;
    finalized: boolean;
    executionStatus: string;
    extrinsicID: string;
}
