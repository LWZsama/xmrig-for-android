package com.xmrigforandroid.workers

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.xmrigforandroid.events.MinerSummaryEvent
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.greenrobot.eventbus.EventBus

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

            try {
                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        Log.e(XMRigSummaryUpdateWorker.LOG_TAG, "Unexpected HTTP status: ${response.code}")
                        return@withContext Result.failure()
                    }
                    val body = response.body?.string()
                    if (body.isNullOrBlank()) {
                        Log.e(XMRigSummaryUpdateWorker.LOG_TAG, "XMRig returned an empty summary")
                        return@withContext Result.failure()
                    }
                    EventBus.getDefault().post(MinerSummaryEvent(body))
                    return@withContext Result.success()
                }
            } catch (exception: Exception) {
                Log.e(XMRigSummaryUpdateWorker.LOG_TAG, "Could not update miner summary", exception)
                return@withContext Result.failure()
            }
        }
    }

    companion object {
        val LOG_TAG = "XMRigSummaryUpdateWorker"
    }
}
