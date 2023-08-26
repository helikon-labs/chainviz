import { InactiveNominationsSummary } from '../substrate/nomination';
import { StakeSummary } from '../substrate/stake';
import { ValidatorPreferences } from '../substrate/validator-preferences';
import { ValidatorStakeSummary } from '../substrate/validator-stake';

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

function applyValidatorSummaryDiff(validator: ValidatorSummary, diff: ValidatorSummaryDiff) {
    if (diff.controllerAccountId != validator.controllerAccountId) {
        validator.controllerAccountId = diff.controllerAccountId;
    }
    if (diff.isParaValidator != validator.isParaValidator) {
        validator.isParaValidator = diff.isParaValidator ?? false;
    }
    if (diff.paraId != validator.paraId) {
        validator.paraId = diff.paraId;
    }
}

export { ValidatorSummary, ValidatorSummaryDiff, ValidatorListUpdate, applyValidatorSummaryDiff };
