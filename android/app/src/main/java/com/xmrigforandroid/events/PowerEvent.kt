package com.xmrigforandroid.events

enum class PowerEventAction(val value: String) {
    BATTERY_CHANGED("batteryChanged"),
    BATTERY_LOW("batteryLow"),
    BATTERY_OKAY("batteryOkay"),
    POWER_CONNECTED("powerConnected"),
    POWER_DISCONNECTED("powerDisconnected")
}

class PowerEvent internal constructor(var action: PowerEventAction, var value: Number?=null){
}