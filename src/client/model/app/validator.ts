import * as THREE from 'three';
import { getOnScreenPosition, rotateAboutPoint } from '../../util/geom_util';
import { ValidatorSummary } from "../subvt/validator_summary";
import { createTween } from '../../util/tween_util';
import { Constants } from '../../util/constants';
import { formatNumber, getCondensedAddress } from '../../util/format_util';
import { Keyring } from '@polkadot/keyring';
import { network } from '../../chainviz';
import { generateIdenticonSVGHTML } from '../../util/identicon_util';

class Validator {
    private readonly mesh: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshPhongMaterial>;
    private readonly summary: ValidatorSummary;
    readonly index: [number, number];
    readonly ringSize: number;
    private readonly color: THREE.Color;

    private readonly radius = 0.6;
    private readonly segments = 16;
    private readonly height = 2.8;

    private static readonly keyring = new Keyring();

    private _isAuthoring = false;

    constructor(
        summary: ValidatorSummary,
        index: [number, number],
        ringSize: number,
    ) {
        this.summary = summary;
        this.color = summary.isParaValidator
            ? Constants.PARA_VALIDATOR_COLOR
            : Constants.VALIDATOR_COLOR;
        this.index = index;
        this.ringSize = ringSize;
        this.mesh = this.createMesh();
    }

    private createMesh(): THREE.Mesh<THREE.CylinderGeometry, THREE.MeshPhongMaterial> {
        // cylinder
        const cylinderGeometry = new THREE.CylinderGeometry(
            this.radius,
            this.radius,
            this.height,
            this.segments
        );
        const material = new THREE.MeshPhongMaterial({
            color: this.color,
            shininess: 6,
            specular: Constants.VALIDATOR_SPECULAR_COLOR,
        });
        const cylinder = new THREE.Mesh(
            cylinderGeometry,
            material,
        );
        cylinder.receiveShadow = true;
        return cylinder;
    }

    addTo(scene: THREE.Scene) {
        const [ring, i] = this.index;
        this.mesh.position.x = -22 - (ring * 5);
        this.mesh.rotation.z = Math.PI / 2;
        rotateAboutPoint(
            this.mesh,
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 1),
            -(Math.PI / 10.5) - i * ((11 * Math.PI / 6) / this.ringSize),
            false,
        );
        scene.add(this.mesh);
    }

    getAccountIdHex(): string {
        return this.summary.accountId;
    }

    getUUID(): string {
        return this.mesh.uuid;
    }

    onHover() {
        this.mesh.material.color.setHex(0xFFFF00);
    }

    clearHover() {
        this.mesh.material.color.set(this.color);
    }

    getMeshOnScreenPosition(
        renderer: THREE.WebGLRenderer,
        camera: THREE.Camera,
    ): THREE.Vec2 {
        return getOnScreenPosition(this.mesh, renderer, camera);
    }

    getSS58Address(): string {
        return Validator.keyring.encodeAddress(
            this.summary.accountId,
            network.ss58Prefix
        );
    }

    getHoverInfoHTML(): string {
        const sections = []
        // general
        {
            const components = [];
            const address = this.getSS58Address();
            // identicon
            components.push(
                generateIdenticonSVGHTML(
                    address,
                    Constants.IDENTICON_SIZE
                )
            );
            // identity
            let identity = "";
            if (this.summary.confirmed) {
                identity += "✅ ";
            }
            if (this.summary.display) {
                identity += this.summary.display;
            } else if (this.summary.parentDisplay) {
                identity += this.summary.parentDisplay;
                if (this.summary.childDisplay) {
                    identity += ' / ' + this.summary.childDisplay;
                }
            }
            if (identity.length > 0) {
                components.push(identity);
            } else {
                components.push(getCondensedAddress(address));
            }
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

    beginAuthorship(onComplete: () => void) {
        this._isAuthoring = true;
        const scaleTween = createTween(
            this.mesh.scale,
            {
                x: Constants.VALIDATOR_AUTHORSHIP_SCALE,
                y: Constants.VALIDATOR_AUTHORSHIP_SCALE,
                z: Constants.VALIDATOR_AUTHORSHIP_SCALE,
            },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
        );
        const translateTween = createTween(
            this.mesh.position,
            { z: Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_Z },
            Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            () => {
                scaleTween.start();
            },
            () => {
                onComplete();
            },
        );
        createTween(
            this.mesh.material.color,
            {
                r: 0.0,
                g: 1.0,
                b: 0.0,
            },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                translateTween.start();
            }
        ).start();
    }

    endAuthorship(onComplete?: () => void) {
        const colorTween = createTween(
            this.mesh.material.color,
            this.color,
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            undefined,
            () => {
                this._isAuthoring = false;
                if (onComplete) {
                    onComplete();
                }
            }
        );
        const scaleTween = createTween(
            this.mesh.scale,
            {
                x: 1,
                y: 1,
                z: 1,
            },
            Constants.VALIDATOR_AUTHORSHIP_SCALE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
        );
        createTween(
            this.mesh.position,
            { z: 0 },
            Constants.VALIDATOR_AUTHORSHIP_TRANSLATE_CURVE,
            Constants.VALIDATOR_AUTHORSHIP_MOVE_TIME_MS,
            () => {
                scaleTween.start();
            },
            () => {
                colorTween.start();
            }
        ).start();
    }

    isAuthoring(): boolean {
        return this._isAuthoring;
    }
}

export { Validator };