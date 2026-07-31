export enum PowerEventAction {
    BATTERY_CHANGED = 'BATTERY_CHANGED',
    BATTERY_LOW = 'BATTERY_LOW',
    BATTERY_OKAY = 'BATTERY_OKAY',
    POWER_CONNECTED = 'POWER_CONNECTED',
    POWER_DISCONNECTED = 'POWER_DISCONNECTED'
}

export type PowerEvent = {
    action: PowerEventAction;
    value?: number;
}
