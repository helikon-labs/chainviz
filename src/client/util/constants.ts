import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';

export abstract class Constants {
    // orbit control
    static readonly ORBIT_MIN_POLAR_ANGLE = Math.PI / 12;
    static readonly ORBIT_MAX_POLAR_ANGLE = Math.PI * 11 / 12;
    static readonly ORBIT_MIN_AZIMUTH_ANGLE = -5 * Math.PI / 12;
    static readonly ORBIT_MAX_AZIMUTH_ANGLE = 5 * Math.PI / 12;
    static readonly ORBIT_DEFAULT_DISTANCE = 340;
    static readonly ORBIT_MIN_DISTANCE = 50;
    static readonly ORBIT_MAX_DISTANCE = 600;
    static readonly ORBIT_MAX_PAN_X = 50;
    static readonly ORBIT_MAX_PAN_Y= 50;
    // block animations
    static readonly BLOCK_SHIFT_CURVE = TWEEN.Easing.Cubic.Out;
    static readonly BLOCK_SHIFT_TIME_MS = 500;
    static readonly BLOCK_SPAWN_DELAY = 250;
    static readonly BLOCK_SPAWN_SCALE_CURVE = TWEEN.Easing.Back.InOut;
    static readonly BLOCK_SPAWN_SCALE_TIME_MS = 250;
    static readonly BLOCK_TO_ORIGIN_CURVE = TWEEN.Easing.Cubic.Out;
    static readonly BLOCK_TO_ORIGIN_TIME_MS = 1000;
    // identicon
    static readonly IDENTICON_SIZE = 30;
    
    // validator colors
    static readonly VALIDATOR_COLOR = new THREE.Color(0.901, 0.0, 0.478);
    static readonly PARA_VALIDATOR_COLOR = new THREE.Color(0.556, 0.874, 1.0);
    static readonly AUTHOR_VALIDATOR_COLOR = 0xFFFF00;
    static readonly VALIDATOR_SPECULAR_COLOR = 0xFFFFFF;
    // validator animations
    static readonly VALIDATOR_AUTHORSHIP_SCALE = 2.5;
    static readonly VALIDATOR_AUTHORSHIP_TRANSLATE_Z = 10;
    static readonly VALIDATOR_AUTHORSHIP_SCALE_CURVE = TWEEN.Easing.Linear.None;
    static readonly VALIDATOR_AUTHORSHIP_TRANSLATE_CURVE = TWEEN.Easing.Exponential.Out;
    static readonly VALIDATOR_AUTHORSHIP_MOVE_TIME_MS = 500;
    static readonly VALIDATOR_AUTHORSHIP_END_DELAY = 500;
    // hover info board
    static readonly HOVER_INFO_BOARD_X_OFFSET = 16;
    static readonly HOVER_INFO_BOARD_Y_OFFSET = -30;
    // format
    static readonly BALANCE_FORMAT_DECIMALS = 4;
    static readonly DECIMAL_SEPARATOR = ".";
    static readonly THOUSANDS_SEPARATOR = ",";
}