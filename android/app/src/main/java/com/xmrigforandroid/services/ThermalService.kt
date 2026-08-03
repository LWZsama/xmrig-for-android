package com.xmrigforandroid.services

import android.app.Service
import android.content.Intent
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import androidx.work.*
import com.xmrigforandroid.workers.ThermalWorker

class ThermalService : Service() {

    private val thermalWorkRequest = OneTimeWorkRequestBuilder<ThermalWorker>()
            .addTag(THERMAL_WORK_TAG)

    val updateTimer = object: CountDownTimer(15000, 15000) {
        override fun onTick(millisUntilFinished: Long) {
        }

        override fun onFinish() {
            Log.d(ThermalService.LOG_TAG, "updateTimer")
            WorkManager.getInstance(applicationContext).enqueue(thermalWorkRequest.build())
            this.start()
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                IS_SERVICE_RUNNING = true
                updateTimer.cancel()
                updateTimer.start()
            }
            ACTION_STOP -> {
                stopUpdates()
                stopSelf()
            }
        }
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent): IBinder? {
        return null
    }

    override fun onDestroy() {
        stopUpdates()
        super.onDestroy()
    }

    private fun stopUpdates() {
        IS_SERVICE_RUNNING = false
        updateTimer.cancel()
        WorkManager.getInstance(applicationContext)
                .cancelAllWorkByTag(THERMAL_WORK_TAG)
    }

    companion object {
        const val ACTION_START = "com.xmrigforandroid.action.START_THERMAL_MONITORING"
        const val ACTION_STOP = "com.xmrigforandroid.action.STOP_THERMAL_MONITORING"
        private const val THERMAL_WORK_TAG = "xmrig-thermal-monitoring"
        private const val LOG_TAG = "ThermalService"
        var IS_SERVICE_RUNNING = false
    }
}
