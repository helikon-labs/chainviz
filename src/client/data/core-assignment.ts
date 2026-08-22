type CoreClaim = number | string | { bulk?: unknown; task?: unknown };

type ClaimQueue = Record<string, CoreClaim[]>;

interface GroupRotationInfo {
    sessionStartBlock: number;
    groupRotationFrequency: number;
    now: number;
}

interface CoreAssignmentState {
    cores: (number | undefined)[];
    validatorsByCore: string[][];
    assignments: Map<number, string[]>;
}

function toNumber(value: unknown): number | undefined {
    const number = typeof value == 'number' ? value : Number(value);
    return Number.isSafeInteger(number) && number >= 0 ? number : undefined;
}

function getParaId(claim: CoreClaim | undefined): number | undefined {
    if (typeof claim == 'number' || typeof claim == 'string') {
        return toNumber(claim);
    }
    if (claim && typeof claim == 'object') {
        return toNumber(claim.bulk ?? claim.task);
    }
    return undefined;
}

/**
 * Mirrors `GroupRotationInfo::group_for_core` from polkadot-primitives.
 */
function getGroupIndexForCore(
    coreIndex: number,
    coreCount: number,
    rotationInfo?: GroupRotationInfo,
): number {
    if (!rotationInfo || rotationInfo.groupRotationFrequency == 0 || coreCount == 0) {
        return coreIndex;
    }
    const blocksSinceStart = Math.max(0, rotationInfo.now - rotationInfo.sessionStartBlock);
    const rotations = Math.floor(blocksSinceStart / rotationInfo.groupRotationFrequency);
    return (coreIndex + rotations) % coreCount;
}

function buildCoreAssignmentState(
    claimQueue: ClaimQueue,
    validatorGroups: string[][],
    rotationInfo?: GroupRotationInfo,
): CoreAssignmentState {
    const coreIndices = Object.keys(claimQueue)
        .map((key) => toNumber(key))
        .filter((value): value is number => value != undefined);
    const highestClaimedCore = coreIndices.length == 0 ? -1 : Math.max(...coreIndices);
    const coreCount = Math.max(validatorGroups.length, highestClaimedCore + 1);
    const cores = new Array<number | undefined>(coreCount).fill(undefined);
    const validatorsByCore = new Array<string[]>(coreCount);

    for (let coreIndex = 0; coreIndex < coreCount; coreIndex++) {
        const groupIndex = getGroupIndexForCore(coreIndex, validatorGroups.length, rotationInfo);
        validatorsByCore[coreIndex] = validatorGroups[groupIndex] ?? [];
    }

    const assignmentSets = new Map<number, Set<string>>();
    for (const [key, claims] of Object.entries(claimQueue)) {
        const coreIndex = toNumber(key);
        if (coreIndex == undefined || coreIndex >= coreCount || !Array.isArray(claims)) {
            continue;
        }
        const paraId = getParaId(claims[0]);
        if (paraId == undefined) {
            continue;
        }
        cores[coreIndex] = paraId;
        const validators = assignmentSets.get(paraId) ?? new Set<string>();
        validatorsByCore[coreIndex].forEach((validator) => validators.add(validator));
        assignmentSets.set(paraId, validators);
    }

    const assignments = new Map<number, string[]>();
    assignmentSets.forEach((validators, paraId) => {
        assignments.set(paraId, Array.from(validators));
    });
    return { cores, validatorsByCore, assignments };
}

export {
    ClaimQueue,
    CoreAssignmentState,
    GroupRotationInfo,
    buildCoreAssignmentState,
    getGroupIndexForCore,
    getParaId,
};
