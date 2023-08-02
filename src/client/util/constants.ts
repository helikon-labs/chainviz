import * as THREE from 'three';

export abstract class Constants {
    // connection
    static readonly CONNECTION_TIMEOUT_MS = 30000;
    static readonly CONNECTION_RETRY_MS = 5000;
    static readonly POLKAHOLIC_ABLY_API_KEY =
        'DTaENA.C13wMg:WBLRXZd-9u73gBtrFc19WPFrkeX0ACnW0dhRrYPaRuU';
    // UI
    static readonly VALIDATOR_INSERT_DELAY_MS = 1000;
    static readonly CONTENT_FADE_ANIM_DURATION_MS = 500;
    static readonly UI_STATE_CHANGE_DELAY_MS = 300;
    static readonly INITIAL_SLOT_COUNT = 3;
    static readonly MAX_SLOT_COUNT = 50;
    static readonly MAX_VALIDATORS_PER_ARC = 30;
    static readonly MIN_ARC_COUNT = 10;
    static readonly VALIDATOR_SPHERE_MIN_RADIUS = 0.3;
    static readonly VALIDATOR_SPHERE_MAX_RADIUS = 0.5;
    static readonly VALIDATOR_SPHERE_WIDTH_SEGMENTS = 32;
    static readonly VALIDATOR_SPHERE_HEIGHT_SEGMENTS = 16;
    static readonly VALIDATOR_ARC_RADIUS = 38;
    static readonly VALIDATOR_SPHERE_COLOR = 0xffffff;
    static readonly VALIDATOR_ARC_COLOR = 0xffffff;
    static readonly VALIDATOR_ARC_POINTS = 50;
    static readonly PARAS_CROSSHAIR_COLOR = 0xffffff;
    static readonly PARAS_CROSSHAIR_OPACITY = 0.2;
    static readonly PARAS_CROSSHAIR_HORIZONTAL_RADIUS = 75;
    static readonly PARAS_CROSSHAIR_VERTICAL_RADIUS = 53;
    static readonly PARAS_CIRCLE_RADIUS = 48;
    static readonly PARA_BG_RADIUS = 1.75;
    static readonly PARA_BG_COLOR = 0xffffff;
    static readonly PARA_BG_OPACITY = 0.25;
    static readonly PARA_LOGO_RADIUS = 1.6;
    static readonly VALIDATOR_MESH_ROTATE_X = Math.PI / 6;
    static readonly VALIDATOR_MESH_ROTATE_Y_DELTA = Math.PI / 2800;
    // orbit control
    static readonly ORBIT_DEFAULT_DISTANCE = 380;
    // format
    static readonly BALANCE_FORMAT_DECIMALS = 4;
    static readonly DECIMAL_SEPARATOR = '.';
    static readonly THOUSANDS_SEPARATOR = ',';
    // camera
    static readonly CAMERA_START_POSITION = new THREE.Vector3(
        0,
        0,
        Constants.ORBIT_DEFAULT_DISTANCE,
    );
}
