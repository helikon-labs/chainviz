import * as THREE from 'three';

export abstract class Constants {
    // RPC
    //static readonly KUSAMA_RPC_URL = 'wss://rpc.ibp.network/kusama';
    static readonly KUSAMA_RPC_URL = 'wss://kusama-rpc.polkadot.io';
    //static readonly POLKADOT_RPC_URL = 'wss://rpc.ibp.network/polkadot';
    static readonly POLKADOT_RPC_URL = 'wss://rpc.polkadot.io';
    // connection
    static readonly CONNECTION_TIMEOUT_MS = 30000;
    static readonly CONNECTION_RETRY_MS = 5000;
    static readonly XCM_TRANSFER_FETCH_LIMIT = 10;
    static readonly XCM_DISPLAY_LIMIT = 5;
    static readonly XCM_TRANSFER_FETCH_PERIOD_MS = 12000;
    // UI
    static readonly HASH_TRIM_SIZE = 7;
    static readonly VALIDATOR_INSERT_DELAY_MS = 1000;
    static readonly CONTENT_FADE_ANIM_DURATION_MS = 500;
    static readonly UI_STATE_CHANGE_DELAY_MS = 300;
    static readonly INITIAL_BLOCK_COUNT = 3;
    static readonly MAX_BLOCK_COUNT = 15;
    static readonly MAX_VALIDATORS_PER_ARC = 30;
    static readonly MIN_ARC_COUNT = 10;
    static readonly VALIDATOR_SPHERE_MIN_RADIUS = 0.3;
    static readonly VALIDATOR_SPHERE_MAX_RADIUS = 0.5;
    static readonly VALIDATOR_SPHERE_WIDTH_SEGMENTS = 32;
    static readonly VALIDATOR_SPHERE_HEIGHT_SEGMENTS = 16;
    static readonly VALIDATOR_ARC_RADIUS = 48;
    static readonly VALIDATOR_SPHERE_COLOR = 0xffffff;
    static readonly VALIDATOR_SELECTOR_SPHERE_RADIUS = 1.2;
    static readonly VALIDATOR_SELECTOR_SPHERE_COLOR = 0xffff00;
    static readonly VALIDATOR_SELECTOR_SPHERE_OPACITY = 0.005;
    static readonly VALIDATOR_ARC_COLOR = 0xffffff;
    static readonly VALIDATOR_ARC_NORMAL_OPACITY = 0.6;
    static readonly VALIDATOR_ARC_LOW_OPACITY = 0.15;
    static readonly PARAS_CROSSHAIR_COLOR = 0xffffff;
    static readonly PARAS_CROSSHAIR_OPACITY = 0.2;
    static readonly PARAS_CROSSHAIR_HORIZONTAL_RADIUS = 65;
    static readonly PARAS_CROSSHAIR_VERTICAL_RADIUS = 65;
    static readonly PARAS_CIRCLE_RADIUS = 54;
    static readonly PARA_BG_RADIUS = 1.75;
    static readonly PARA_BG_COLOR = 0xffffff;
    static readonly PARA_BG_OPACITY = 0.2;
    static readonly PARA_LOGO_RADIUS = 1.6;
    static readonly VALIDATOR_MESH_ROTATE_X = Math.PI / 4;
    static readonly VALIDATOR_MESH_ROTATE_Y_DELTA = Math.PI / 2800;
    static readonly SCENE_STATE_TRANSITION_ANIM_DURATION_MS = 2000;
    static readonly SCENE_PARA_OPACITY = 0.5;
    static readonly SCENE_VALIDATOR_OPACITY = 1.0;
    static readonly VALIDATOR_PARA_LINE_COLOR = 0xffffff;
    static readonly BLOCK_LINE_COLOR = 0xffffff;
    static readonly HIGHLIGHTED_PARA_SCALE = 1.5;
    static readonly NEW_BLOCK_APPEAR_ANIM_DURATION_MS = 125;
    static readonly NEW_BLOCK_BEAM_ANIM_DURATION_MS = 1500;
    static readonly VALIDATOR_DETAILS_BOARD_IDENTICON_SIZE = 24;
    // validator summary board
    static readonly VALIDATOR_SUMMARY_BOARD_X_OFFSET = 20;
    static readonly VALIDATOR_SUMMARY_INFO_BOARD_Y_OFFSET = -20;
    // para summary board
    static readonly PARA_SUMMARY_BOARD_X_OFFSET = 24;
    static readonly PARA_SUMMARY_INFO_BOARD_Y_OFFSET = -20;
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
