import * as THREE from 'three';
import { getOnScreenPosition, rotateAboutPoint } from '../../util/geometry';
//import { getValidatorSummaryIdentityHTML } from "../../util/ui";
import { createTween } from '../../util/tween';
import { Constants } from '../../util/constants';
import { formatNumber, getCondensedAddress } from '../../util/format';
import { network } from '../../chainviz';
import { generateIdenticonSVGHTML } from '../../util/identicon';
import { getSS58Address } from '../../util/ss58';
import { ValidatorSummary } from '../subvt/validator_summary';
import { getValidatorIdentityIconHTML, getValidatorSummaryDisplay } from '../../util/ui';

class Validator {
    private readonly object = new THREE.Object3D();
    private readonly summary: ValidatorSummary;
    readonly index: [number, number];
    readonly ringSize: number;
    private readonly color: THREE.Color;

    private _isAuthoring = false;

    constructor(
        summary: ValidatorSummary,
        index: [number, number],
        ringSize: number,
    ) {
        this.summary = summary;
        if (summary.isParaValidator) {
            console.log('PARA');
        }
        this.color = summary.isParaValidator
            ? Constants.PARA_VALIDATOR_COLOR
            : Constants.VALIDATOR_COLOR;
        this.index = index;
        this.ringSize = ringSize;
        this.updateMatrix();
    }

    private updateMatrix() {
        const [ring, i] = this.index;
        this.object.position.x = -22 - (ring * 5);
        this.object.rotation.z = Math.PI / 2;
        rotateAboutPoint(
            this.object,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1),
            -(Math.PI / 10.5) - i * ((11 * Math.PI / 6) / this.ringSize),
            false,
        );
        this.object.updateMatrix();
    }

    getMatrix(): THREE.Matrix4 {
        return this.object.matrix;
    }

    getColor(): THREE.Color {
        return this.color;
    }

    getAccountIdHex(): string {
        return this.summary.accountId;
    }

    getHoverInfoHTML(): string {
        const sections = []
        // general
        {
            const components = [];
            const address = getSS58Address(this.summary.accountId);
            // identicon
            components.push(
                generateIdenticonSVGHTML(
                    address,
                    Constants.IDENTICON_SIZE
                )
            );
            // display
            components.push(
                getValidatorIdentityIconHTML(this.summary)
                    + getValidatorSummaryDisplay(this.summary)
            );
            // components.push(getValidatorSummaryIdentityHTML(this.summary));
            // para validator
            if (this.summary.isParaValidator) {
                const parachain = network.parachainMap.get(this.summary.paraId ?? 0);
                if (parachain) {
                    components.push(`Validating for ${parachain.name}`);
                } else {
                    components.push("Parachain Validator");
                }
            }
            sections.push("<center>" + components.join("<br>\n") + "</center>");
        }
        // performance
        {
            const components = [];
            // blocks produced
            let blockCount = this.summary.blocksAuthored ?? 0;
            components.push(blockCount + " era blocks");
            if (this.summary.isActive) {

            } else {
                console.log('inactive');
            }
            // points
            let points = this.summary.rewardPoints ?? 0;
            components.push(points + " era points");
            // return rate
            if (this.summary.returnRatePerBillion) {
                let returnRate = formatNumber(
                    BigInt(this.summary.returnRatePerBillion!),
                    7,
                    2
                )
                components.push(returnRate + "% return");
            }
            sections.push(components.join("<br>\n"));
        }
        // active stake
        {
            const components = [];
            components.push("<span class=\"active-title\">ACTIVE</span>");
            // self stake
            components.push(
                `<div><div class="amount-title">Self</div><div class="amount">` +
                formatNumber(
                    this.summary.selfStake.activeAmount,
                    network.tokenDecimals,
                    Constants.BALANCE_FORMAT_DECIMALS,
                    network.tokenTicker,
                ) + `</div></div>`
            );
            // other stake
            if (this.summary.validatorStake) {
                const stake = this.summary.validatorStake!;
                components.push(
                    `<div><div class="amount-title">${stake.nominatorCount} nom.s</div><div class="amount">` +
                    formatNumber(
                        stake.totalStake - stake.selfStake,
                        network.tokenDecimals,
                        Constants.BALANCE_FORMAT_DECIMALS,
                        network.tokenTicker,
                    ) + `</div></div>`
                );
            }
            sections.push(components.join(`\n`));
        }
        // inactive stake
        {
            const components = [];
            components.push("<span class=\"inactive-title\">INACTIVE</span>");
            if (this.summary.inactiveNominations.nominationCount > 0) {
                const noms = this.summary.inactiveNominations;
                components.push(
                    `<div><div class="amount-title">${noms.nominationCount} nom.s</div><div class="amount">` +
                    formatNumber(
                        noms.totalAmount,
                        network.tokenDecimals,
                        Constants.BALANCE_FORMAT_DECIMALS,
                        network.tokenTicker,
                    ) + `</div></div>`
                );
            } else {
                components.push("None");
            }
            sections.push(components.join("\n"));
        }
        // icons
        {
            const components = [];
            if (this.summary.isEnrolledIn1kv) {
                components.push(`<img src="./img/status/status_icon_1kv.svg">`);
            }
            if (this.summary.heartbeatReceived ?? false) {
                components.push(`<img src="./img/status/status_icon_heartbeat_received.svg">`);
            }
            if (this.summary.activeNextSession) {
                components.push(`<img src="./img/status/status_icon_active_next_session.svg">`);
            }
            if (this.summary.slashCount > 0) {
                components.push(`<img src="./img/status/status_icon_slashed.svg">`);
            }
            if (this.summary.preferences.blocksNominations) {
                components.push(`<img src="./img/status/status_icon_blocks_nominations.svg">`);
            }
            if (this.summary.oversubscribed) {
                components.push(`<img src="./img/status/status_icon_oversubscribed.svg">`);
            }
            if (components.length > 0) {
                sections.push(`<div class="status-icon-container">${components.join("&nbsp;")}</div>`);
            }
        }
        return sections.join("\n<hr>\n");
    }

    beginAuthorship(
        onColorUpdate: (color: THREE.Color) => void,
        onMatrixUpdate: (matrix: THREE.Matrix4) => void,
        onComplete: () => void,
    ) {
        this._isAuthoring = true;
        const scaleTween = createTween(
            this.object.scale,
            {
                x: Constants.VALIDATOR_AUTHORSHIP_SCALE,
                y: Constants.VALIDATOR_AUTHORSHIP_SCALE,
                z: Constants.VALIDATOR_AUTHORSHIP_SCALE,
            },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                this.object.updateMatrix();
                onMatrixUpdate(this.getMatrix());
            }
        );
        const translateTween = createTween(
            this.object.position,
            { z: Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_Z },
            Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            () => { scaleTween.start(); },
            () => {
                this.object.updateMatrix();
                onMatrixUpdate(this.getMatrix());
            },
            () => { onComplete(); },
        );
        const color = this.color.clone();
        createTween(
            color,
            {
                r: 0.0,
                g: 1.0,
                b: 0.0,
            },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                onColorUpdate(color);
            },
            () => {
                setTimeout(() => {
                    translateTween.start();
                }, 100);
            }
        ).start();
    }

    endAuthorship(
        onColorUpdate: (color: THREE.Color) => void,
        onMatrixUpdate: (matrix: THREE.Matrix4) => void,
        onComplete: () => void,
    ) {
        const color = new THREE.Color().setHex(0x00FF00);
        const colorTween = createTween(
            color,
            this.color,
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => { onColorUpdate(color); },
            () => {
                this._isAuthoring = false;
                if (onComplete) onComplete();
            }
        );
        const scaleTween = createTween(
            this.object.scale,
            { x: 1, y: 1, z: 1 },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                this.object.updateMatrix();
                onMatrixUpdate(this.getMatrix());
            }
        );
        createTween(
            this.object.position,
            { z: 0 },
            Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            () => { scaleTween.start(); },
            () => {
                this.object.updateMatrix();
                onMatrixUpdate(this.getMatrix());
            },
            () => { colorTween.start(); }
        ).start();
    }

    isAuthoring(): boolean {
        return this._isAuthoring;
    }
}

export { Validator };