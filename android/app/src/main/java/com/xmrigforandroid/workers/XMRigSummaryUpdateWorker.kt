package com.xmrigforandroid.workers

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.xmrigforandroid.events.MinerSummaryEvent
import com.xmrigforandroid.events.ThermalEvent
import com.xmrigforandroid.services.XMRigAPIService
import com.xmrigforandroid.utils.CPUTemperatureHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.greenrobot.eventbus.EventBus
import java.io.IOException

class XMRigSummaryUpdateWorker(appContext: Context, workerParams: WorkerParameters):
        CoroutineWorker(appContext, workerParams) {

    private val client = OkHttpClient()

    override suspend fun doWork(): Result {
        return withContext(Dispatchers.IO) {
            Log.d(XMRigSummaryUpdateWorker.LOG_TAG, "doSummaryUpdate")
            val request = Request.Builder()
                    .url("http://127.0.0.1:50080/2/summary")
                    .addHeader("Content-Type", "application/json")
                    .addHeader("Authorization", "Bearer XMRigForAndroid")
                    .build()

            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    Result.failure()
                    throw IOException("Unexpected code $response")
                }
                EventBus.getDefault().post(MinerSummaryEvent(response.body!!.string()))
                Result.success()
            }
        }
    }

    companion object {
        val LOG_TAG = "XMRigSummaryUpdateWorker"
    }
}
