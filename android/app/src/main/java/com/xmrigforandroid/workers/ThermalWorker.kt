package com.xmrigforandroid.workers

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.xmrigforandroid.events.ThermalEvent
import com.xmrigforandroid.utils.CPUTemperatureHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.withContext
import org.greenrobot.eventbus.EventBus

class ThermalWorker(appContext: Context, workerParams: WorkerParameters):
        CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return withContext(Dispatchers.IO) {
            Log.d("ThermalWorker", "override suspend fun doWork()")
            val cpuTemp = CPUTemperatureHelper.getCpuTemperature()
            EventBus.getDefault().post(ThermalEvent(cpuTemp))
            Result.success()
        }
    }

}
