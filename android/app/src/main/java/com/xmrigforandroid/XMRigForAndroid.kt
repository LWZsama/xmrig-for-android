package com.xmrigforandroid

import android.content.*
import android.os.FileObserver
import android.os.IBinder
import android.os.RemoteException
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.xmrigforandroid.data.serialization.Configuration
import com.xmrigforandroid.utils.XMRigConfigBuilder
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import org.greenrobot.eventbus.ThreadMode
import java.lang.Exception
import com.facebook.react.bridge.ReactMethod
import java.io.File
import java.util.*
import android.os.BatteryManager

import android.content.Context.BATTERY_SERVICE
import com.xmrigforandroid.events.*
import com.xmrigforandroid.services.IXMRigAPIService
import com.xmrigforandroid.services.ThermalService
import com.xmrigforandroid.services.XMRigAPIService


class XMRigForAndroid(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    var miningService:IMiningService? = null
    var xmrigAPIService: IXMRigAPIService? = null
    val configBuilder = XMRigConfigBuilder(this.reactApplicationContext.applicationContext)
    var isMining = false

    private val serverConnection = object: ServiceConnection {
        override fun onServiceConnected(className: ComponentName?, service: IBinder?) {
            if (className != null) {
                Log.d("className", className.className)
            };
            when(className?.className) {
                "com.xmrigforandroid.MiningService" -> {
                    miningService = IMiningService.Stub.asInterface(service)
                }
                "com.xmrigforandroid.services.XMRigAPIService" -> {
                    xmrigAPIService = IXMRigAPIService.Stub.asInterface(service)
                }
            }
        }
        override fun onServiceDisconnected(className: ComponentName?) {
            when(className?.className) {
                "com.xmrigforandroid.MiningService" -> {
                    miningService = null
                }
                "com.xmrigforandroid.services.XMRigAPIService" -> {
                    xmrigAPIService = null
                }
            }
        }
    };

    init {
        arrayOf(
                MiningService::class.java,
                XMRigAPIService::class.java
        ).forEach { serviceClass ->
            val intent = Intent(context, serviceClass)
            context.bindService(intent, serverConnection, Context.BIND_AUTO_CREATE)
            if (serviceClass == MiningService::class.java) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    private val fileObserver: FileObserver = object : FileObserver(File(configBuilder.getConfigPath()), MODIFY) {
        override fun onEvent(event: Int, path: String?) {
            Log.d("FileObserver", "fileObserver: ${event} ${path} | isMining: ${isMining}")
            if (!isMining)  {
                return
            }
            try {
                val payload = Arguments.createMap()
                payload.putString("config", configBuilder.readConfigFromDisk())
                emit("onConfigUpdate", payload)
            } catch (e: Exception) {
                // XMRig can rewrite config.json while it is being started.
                // A MODIFY event may arrive while the file is still being
                // written; never let that background callback kill the app.
                Log.w(this@XMRigForAndroid.name, "Unable to read updated config", e)
            }
        }
    }

    @Subscribe(threadMode = ThreadMode.ASYNC)
    fun onMessageEvent(event: StdoutEvent) {
        Log.d(this.name, "event name: " + event.javaClass.simpleName)
        val payload = Arguments.createMap()
        val strArr = arrayOf(event.value)
        payload.putArray("log", Arguments.fromArray(strArr))
        emit("onLog", payload)
    }

    @Subscribe(threadMode = ThreadMode.ASYNC)
    fun onMinerStartEvent(event: MinerStartEvent) {
        Log.d(this.name, "event name: " + event.javaClass.simpleName)
        this.isMining = true
        try {
            xmrigAPIService?.startSummaryUpdates()
        } catch (e: Exception) {
            Log.w(this.name, "Unable to start summary updates", e)
        }
        startThermalMonitoring()

        val payload = Arguments.createMap()
        payload.putBoolean("isWorking", true)
        emit("onStatusChange", payload)
    }

    @Subscribe(threadMode = ThreadMode.ASYNC)
    fun onMinerStopEvent(event: MinerStopEvent) {
        Log.d(this.name, "event name: " + event.javaClass.simpleName)
        this.isMining = false
        try {
            xmrigAPIService?.stopSummaryUpdates()
        } catch (e: Exception) {
            Log.w(this.name, "Unable to stop summary updates", e)
        }
        stopThermalMonitoring()

        val payload = Arguments.createMap()
        payload.putBoolean("isWorking", false)
        emit("onStatusChange", payload)
    }

    @Subscribe(threadMode = ThreadMode.ASYNC)
    fun onPowerEvent(event: PowerEvent) {
        val payload = Arguments.createMap()
        payload.putString("action", event.action.toString())
        if (event.value != null) {
            payload.putDouble("value", event.value!!.toDouble())
        }
        emit("onPower", payload)
    }

    @Subscribe(threadMode = ThreadMode.ASYNC)
    fun onMinerSummaryEvent(event: MinerSummaryEvent) {
        Log.d(this.name, "event name: " + event.javaClass.simpleName)
        if (event.value != null) {
            val payload = Arguments.createMap()
            payload.putString("data", event.value)

            emit("onSummary", payload)
        }
    }

    @Subscribe(threadMode = ThreadMode.ASYNC)
    fun onThermalEvent(event: ThermalEvent) {
        Log.d(this.name, "event name: " + event.javaClass.simpleName)
        val payload = Arguments.createMap()
        payload.putDouble("cpuTemperature", event.cpuTemperature.toDouble())

        emit("onThermal", payload)
    }

    @ReactMethod
    fun start(configurationJSON: String, promise: Promise) {
        try {
            val jsonFormat = Json {
                explicitNulls = false
                ignoreUnknownKeys = true
            }
            val data = jsonFormat.decodeFromString<Configuration>(configurationJSON)
            require(!data.config.isNullOrBlank()) { "The generated XMRig configuration is empty" }

            Log.d(
                this.name,
                "Start XMRig (${data.xmrig_fork.toString().lowercase(Locale.getDefault())}) " +
                        "configuration length=${configurationJSON.length}"
            )

            configBuilder.reset()
            configBuilder.setConfiguration(data)
            val configPath = configBuilder.writeConfig()
            check(File(configPath).isFile && File(configPath).length() > 0) {
                "Unable to write XMRig configuration"
            }
            Log.d(this.name, "XMRig config written to $configPath")

            // Watch the file only after it exists. Watching a path before the
            // first write is unreliable on Android and may produce callbacks
            // for a partially-created file.
            fileObserver.stopWatching()
            fileObserver.startWatching()

            val service = miningService
                    ?: throw IllegalStateException("Mining service is not connected yet")
            service.startMiner(configPath, data.xmrig_fork.toString())
            promise.resolve(null)
        } catch (e: Exception) {
            Log.e(this.name, "Unable to start XMRig", e)
            promise.reject("MINER_START_FAILED", e.message ?: "Unable to start XMRig", e)
        }
    }

    @ReactMethod
    fun stop() {
        Log.d(this.name, "Stop has benn called from RN")
        try {
            miningService?.stopMiner()
            xmrigAPIService?.stopSummaryUpdates()
        } catch (e: RemoteException) {
            Log.e(this.name, "Unable to stop XMRig", e)
        }
        EventBus.getDefault().post(MinerStopEvent())
    }

    @ReactMethod
    fun availableProcessors(promise: Promise) {
        Log.d(this.name, "availableProcessors=" + Runtime.getRuntime().availableProcessors().toString())
        try {
            val availableProcessors = Integer.valueOf(Runtime.getRuntime().availableProcessors())
            promise.resolve(availableProcessors)
        } catch (e: Exception) {
            promise.reject("Runtime.getRuntime().availableProcessors()", e)
        }
    }

    @ReactMethod
    fun pauseMiner() {
        try {
            xmrigAPIService?.pauseMiner()
        } catch (e: Exception) {
            Log.w(this.name, "Unable to pause XMRig", e)
        }
    }

    @ReactMethod
    fun resumeMiner() {
        try {
            xmrigAPIService?.resumeMiner()
        } catch (e: Exception) {
            Log.w(this.name, "Unable to resume XMRig", e)
        }
    }

    override fun getName(): String {
        return "XMRigForAndroid";
    }

    override fun initialize() {
        super.initialize()
        EventBus.getDefault().register(this)
    }

    override fun onCatalystInstanceDestroy() {
        fileObserver.stopWatching()
        super.onCatalystInstanceDestroy()
        EventBus.getDefault().unregister(this)
    }

    private fun startThermalMonitoring() {
        val intent = Intent(reactApplicationContext, ThermalService::class.java)
                .setAction(ThermalService.ACTION_START)
        try {
            reactApplicationContext.startService(intent)
        } catch (e: Exception) {
            Log.w(this.name, "Unable to start thermal monitoring", e)
        }
    }

    private fun stopThermalMonitoring() {
        val intent = Intent(reactApplicationContext, ThermalService::class.java)
                .setAction(ThermalService.ACTION_STOP)
        try {
            reactApplicationContext.startService(intent)
        } catch (e: Exception) {
            Log.w(this.name, "Unable to stop thermal monitoring", e)
        }
    }

    private fun emit(eventName: String, payload: WritableMap) {
        try {
            reactApplicationContext
                    .getJSModule(RCTDeviceEventEmitter::class.java)
                    .emit(eventName, payload)
        } catch (e: Exception) {
            // EventBus callbacks can outlive the React instance during an
            // Activity restart. Emitting an event must never crash the app.
            Log.w(this.name, "Unable to emit $eventName", e)
        }
    }

    @ReactMethod
    fun addListener(eventName: String?) {
        when(eventName) {
            "onPower" -> {
                val bm = reactApplicationContext.getSystemService(BATTERY_SERVICE) as BatteryManager
                val batteryLevel = bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)

                val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { ifilter ->
                    reactApplicationContext.applicationContext.registerReceiver(null, ifilter)
                }

                val chargePlug: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1) ?: -1

                EventBus.getDefault().post(PowerEvent(PowerEventAction.BATTERY_CHANGED, batteryLevel))
                if (chargePlug > 0)   {
                    EventBus.getDefault().post(PowerEvent(PowerEventAction.POWER_CONNECTED))
                } else {
                    EventBus.getDefault().post(PowerEvent(PowerEventAction.POWER_DISCONNECTED))
                }
            }
        }

    }

    @ReactMethod
    fun removeListeners(count: Int?) {
        // Keep: Required for RN built in Event Emitter Calls.
    }


}
