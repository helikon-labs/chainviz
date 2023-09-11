import { InactiveNominationsSummary } from '../subvt/nomination';
import { StakeSummary } from '../subvt/stake';
import { ValidatorPreferences } from '../substrate/validator-preferences';
import { ValidatorStakeSummary } from '../subvt/validator-stake';

/**
 * SubVT validator summary type.
 */
interface ValidatorSummary {
    accountId: string;
    address: string;
    controllerAccountId?: string;
    display?: string;
    parentDisplay?: string;
    childDisplay?: string;
    confirmed: boolean;
    preferences: ValidatorPreferences;
    selfStake: StakeSummary;
    isActive: boolean;
    isActiveNextSession: boolean;
    inactiveNominations: InactiveNominationsSummary;
    oversubscribed: boolean;
    slashCount: number;
    isEnrolledIn1kv: boolean;
    isParaValidator: boolean;
    paraId?: number;
    returnRatePerBillion: number;
    blocksAuthored: number;
    rewardPoints: number;
    heartbeatReceived?: boolean;
    validatorStake?: ValidatorStakeSummary;
}

/**
 *
 */
interface ValidatorSummaryDiff {
    accountId: string;
    controllerAccountId?: string;
    display?: string;
    parentDisplay?: string;
    childDisplay?: string;
    confirmed?: boolean;
    preferences?: ValidatorPreferences;
    selfStake?: StakeSummary;
    isActive?: boolean;
    isActiveNextSession?: boolean;
    inactiveNominations?: InactiveNominationsSummary;
    oversubscribed?: boolean;
    slashCount?: number;
    isEnrolledIn1kv?: boolean;
    isParaValidator?: boolean;
    paraId?: number;
    returnRatePerBillion?: number;
    blocksAuthored?: number;
    rewardPoints?: number;
    heartbeatReceived?: boolean;
    validatorStake?: ValidatorStakeSummary;
}

interface ValidatorListUpdate {
    finalizedBlockNumber?: number;
    insert: Array<ValidatorSummary>;
    update: Array<ValidatorSummaryDiff>;
    removeIds: Array<string>;
}

export { ValidatorSummary, ValidatorSummaryDiff, ValidatorListUpdate };
