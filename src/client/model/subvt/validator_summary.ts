import { InactiveNominationsSummary } from "../substrate/nomination";
import { StakeSummary } from "../substrate/stake";
import { ValidatorPreferences } from "../substrate/validator_preferences";
import { ValidatorStakeSummary } from "../substrate/validator_stake";

interface ValidatorSummary {
    accountId: string;
    controllerAccountId?: string;
    display?: string;
    parentDisplay?: string;
    childDisplay?: string;
    confirmed: boolean;
    preferences: ValidatorPreferences;
    selfStake: StakeSummary;
    isActive: boolean;
    activeNextSession: boolean;
    inactiveNominations: InactiveNominationsSummary;
    oversubscribed: boolean;
    slashCount: number;
    isEnrolledIn1kv: boolean;
    isParaValidator: boolean;
    paraId?: number;
    returnRatePerBillion?: number;
    blocksAuthored?: number;
    rewardPoints?: number;
    heartbeatReceived?: boolean;
    validatorStake: ValidatorStakeSummary;
}

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
    activeNextSession?: boolean;
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
    insert: [ValidatorSummary];
    update: [ValidatorSummaryDiff];
    removeIds: [string];
}

export {
    ValidatorSummary,
    ValidatorSummaryDiff,
    ValidatorListUpdate,
};