import { Dispatch } from 'react';
import { SettingsActionType } from './settings.actions';

export enum ConfigurationMode {
    SIMPLE = 'simple',
    ADVANCE = 'advanced'
}
export interface IConfiguratioPropertiesPool {
    hostname?: string;
    port?: number;
    username?: string;
    password?: string;
    sslEnabled?: boolean;
}

export enum RandomXMode {
    AUTO = 'auto',
    FAST = 'fast',
    LIGHT = 'light'
}

export enum XMRigFork {
    ORIGINAL = 'original',
    MONEROOCEAN = 'moneroocean'
}

export enum Algorithm {
    CN = 'cn',
    CN_1 = 'cn/1',
    CN_2 = 'cn/2',
    CN_R = 'cn/r',
    CN_FAST = 'cn/fast',
    CN_HALF ='cn/half',
    CN_XAO = 'cn/xao',
    CN_RTO = 'cn/rto',
    CN_RWZ = 'cn/rwz',
    CN_ZLS = 'cn/zls',
    CN_DOUBLE = 'cn/double',
    CN_LITE = 'cn-lite',
    CN_LITE_0 = 'cn-lite/0',
    CN_LITE_1 = 'cn-lite/1',
    CN_PICO = 'cn-pico',
    CN_PICO_TLO = 'cn-pico/tlo',
    CN_UPX2 = 'cn/upx2',
    CN_CXX = 'cn/cxx',
    CN_GPU = 'cn/gpu',
    CN_HEAVY = 'cn-heavy',
    CN_HEAVY_0 = 'cn-heavy/0',
    CN_HEAVY_TUBE = 'cn-heavy/tube',
    CN_HEAVY_XHV = 'cn-heavy/xhv',
    RX = 'rx',
    RX_0 = 'rx/0',
    RX_WOW = 'rx/wow',
    RX_ARQ = 'rx/arq',
    RX_GRAFT = 'rx/graft',
    RX_SFX = 'rx/sfx',
    RX_KEVA = 'rx/keva',
    ARGON2 = 'argon2',
    ARGON2_CHUKWA = 'argon2/chukwa',
    ARGON2_CHUKWA_V2 = 'argon2/chukwav2',
    ARGON2_WRKZ = 'argon2/ninja',
    PANTHERA = 'panthera',
    ASTROBWT = 'astrobwt',
    GHOSTRIDER = 'ghostrider'
}

export const Algorithems = [
  Algorithm.CN, Algorithm.CN_1, Algorithm.CN_2, Algorithm.CN_R,
  Algorithm.CN_FAST, Algorithm.CN_HALF, Algorithm.CN_XAO, Algorithm.CN_RTO,
  Algorithm.CN_RWZ, Algorithm.CN_ZLS, Algorithm.CN_DOUBLE, Algorithm.CN_LITE,
  Algorithm.CN_LITE_0, Algorithm.CN_LITE_1, Algorithm.CN_PICO, Algorithm.CN_PICO_TLO,
  Algorithm.CN_UPX2, Algorithm.CN_CXX, Algorithm.CN_GPU, Algorithm.CN_HEAVY,
  Algorithm.CN_HEAVY_0, Algorithm.CN_HEAVY_TUBE, Algorithm.CN_HEAVY_XHV, Algorithm.RX,
  Algorithm.RX_0, Algorithm.RX_WOW, Algorithm.RX_ARQ, Algorithm.RX_GRAFT,
  Algorithm.RX_SFX, Algorithm.RX_KEVA, Algorithm.ARGON2, Algorithm.ARGON2_CHUKWA,
  Algorithm.ARGON2_CHUKWA_V2, Algorithm.ARGON2_WRKZ, Algorithm.PANTHERA, Algorithm.ASTROBWT,
  Algorithm.GHOSTRIDER,
];

export interface IConfiguratioPropertiesCPU {
    yield?: boolean;
    priority?: number;
    // eslint-disable-next-line camelcase
    max_threads_hint?: number;
    // eslint-disable-next-line camelcase
    random_x_mode?: RandomXMode;
}
export interface IConfiguratioProperties {
    wallet?: string;
    pool?: IConfiguratioPropertiesPool;
    cpu?: IConfiguratioPropertiesCPU;
    algos?: Partial<Record<Algorithm, boolean>>;
    // eslint-disable-next-line camelcase
    algo_perf?: Record<string, number>;
}
export interface IConfiguration {
    id?: string;
    name: string;
    mode: ConfigurationMode;
    // eslint-disable-next-line camelcase
    xmrig_fork: XMRigFork;
    config?: string;
}
export interface ISimpleConfiguration extends IConfiguration {
    properties?: IConfiguratioProperties;
}
export interface IAdvanceConfiguration extends IConfiguration {

}

export type Configuration = ISimpleConfiguration | IAdvanceConfiguration;

export interface IPowerSettings {
    pauseOnChargerDisconnected: boolean;
    pauseOnLowBattery: boolean;
    resumeOnBatteryOk: boolean;
    resumeOnChargerConnected: boolean;
}

export interface IThermalSettings {
    pauseOnCPUTemperatureOverHeat: boolean;
    pauseOnCPUTemperatureOverHeatValue: number;
    resumeCPUTemperatureNormal: boolean;
    resumeCPUTemperatureNormalValue: number;
}
export interface ISettings {
    ready: boolean;
    uuid: string;
    configurations: Array<Configuration>;
    selectedConfiguration?: string;
    power: IPowerSettings;
    thermal: IThermalSettings;
    donation: number;
    printTime: number;
}
export interface ISettingsReducerAction {
    type: SettingsActionType;
    value?: Partial<ISettings> | string | number | Partial<Configuration> | string[];
}

export interface ISettingsContext {
    state: ISettings;
    dispatch: Dispatch<ISettingsReducerAction>
}
