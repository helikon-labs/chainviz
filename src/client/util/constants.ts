import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';

export abstract class Constants {
    // connection
    static readonly CONNECTION_TIMEOUT_MS = 7500;
    static readonly CONNECTION_RETRY_MS = 5000;
    static readonly UI_STATE_CHANGE_DELAY_MS = 750;
    static readonly INITIAL_SLOT_COUNT = 30;
    static readonly MAX_SLOT_COUNT = 50;
    // UI
    static readonly VALIDATOR_INSERT_DELAY_MS = 1000;
    static readonly CONTENT_FADE_ANIM_DURATION_MS = 500;
    // orbit control
    static readonly ORBIT_MIN_POLAR_ANGLE = Math.PI / 12;
    static readonly ORBIT_MAX_POLAR_ANGLE = (Math.PI * 11) / 12;
    static readonly ORBIT_MIN_AZIMUTH_ANGLE = (-5 * Math.PI) / 12;
    static readonly ORBIT_MAX_AZIMUTH_ANGLE = (5 * Math.PI) / 12;
    static readonly ORBIT_DEFAULT_DISTANCE = 380;
    static readonly ORBIT_MIN_DISTANCE = 70;
    static readonly ORBIT_MAX_DISTANCE = 600;
    static readonly ORBIT_MAX_PAN_X = 50;
    static readonly ORBIT_MAX_PAN_Y = 50;
    // identicon
    static readonly SUMMARY_BOARD_IDENTICON_SIZE = 20;
    static readonly DETAILS_BOARD_IDENTICON_SIZE = 36;
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
    static readonly CAMERA_RESET_ANIM_LENGTH_MS = 1000;
    static readonly CAMERA_RESET_ANIM_CURVE = TWEEN.Easing.Cubic.Out;
}
