/**
 * SubVT validator stake summary.
 */
interface ValidatorStakeSummary {
    selfStake: bigint;
    totalStake: bigint;
    nominatorCount: number;
}

export { ValidatorStakeSummary };
