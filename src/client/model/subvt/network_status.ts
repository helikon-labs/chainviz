import { Epoch } from "../substrate/epoch";
import { Era } from "../substrate/era";

interface NetworkStatus {
    finalizedBlockNumber: number,
    finalizedBlockHash: string,
    bestBlockNumber: number,
    bestBlockHash: string,
    activeEra: Era,
    currentEpoch: Epoch,
    activeValidatorCount: number,
    inactiveValidatorCount: number,
    lastEraTotalReward: bigint,
    totalStake: bigint,
    returnRatePerMillion: number,
    minStake: bigint,
    maxStake: bigint,
    averageStake: bigint,
    medianStake: bigint,
    eraRewardPoints: number,
}

interface NetworkStatusDiff {
    finalizedBlockNumber?: number,
    finalizedBlockHash?: string,
    bestBlockNumber?: number,
    bestBlockHash?: string,
    activeEra?: Era,
    currentEpoch?: Epoch,
    activeValidatorCount?: number,
    inactiveValidatorCount?: number,
    lastEraTotalReward?: bigint,
    totalStake?: bigint,
    returnRatePerMillion?: number,
    minStake?: bigint,
    maxStake?: bigint,
    averageStake?: bigint,
    medianStake?: bigint,
    eraRewardPoints?: number,
}

interface NetworkStatusUpdate {
    network: string,
    status?: NetworkStatus,
    diff?: NetworkStatusDiff,
}

export { NetworkStatus, NetworkStatusDiff, NetworkStatusUpdate };