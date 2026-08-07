package com.xmrigforandroid.services

import android.app.Service
import android.content.Intent
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import androidx.work.*
import com.xmrigforandroid.workers.XMRigJsonRpcWorker
import com.xmrigforandroid.workers.XMRigSummaryUpdateWorker

private const val SUMMARY_UPDATE_INTERVAL_MS = 15_000L

class XMRigAPIService : Service() {
    private val summaryUpdateWorkerRequest = OneTimeWorkRequestBuilder<XMRigSummaryUpdateWorker>()
            .addTag(SUMMARY_WORK_TAG)

    var isSummaryUpdate = false

    val summaryUpdateTimer = object: CountDownTimer(
            SUMMARY_UPDATE_INTERVAL_MS,
            SUMMARY_UPDATE_INTERVAL_MS
    ) {
        override fun onTick(millisUntilFinished: Long) {
        }

        override fun onFinish() {
            Log.d(LOG_TAG, "summaryUpdateTimer::Finish")
            WorkManager.getInstance(applicationContext).enqueue(
                    summaryUpdateWorkerRequest.build()
            )
            if (isSummaryUpdate) {
                this.start()
            }
        }
    }

    fun sendJSONRpcCommand(method: String) {
        Log.d(LOG_TAG, "sendJSONRpcCommand: " + method)
        val jsonRpcWorkerRequest = OneTimeWorkRequestBuilder<XMRigJsonRpcWorker>()
                .setInputData(workDataOf(
                        "METHOD" to method
                ))
                .build()
        WorkManager
                .getInstance(applicationContext)
                .enqueue(jsonRpcWorkerRequest)
    }

    private val binder = object : IXMRigAPIService.Stub() {
        override fun pauseMiner() {
            Log.d(LOG_TAG, "pauseMiner")
            sendJSONRpcCommand("pause")
        }

        override fun resumeMiner() {
            Log.d(LOG_TAG, "resumeMiner")
            sendJSONRpcCommand("resume")
        }

        override fun startSummaryUpdates() {
            Log.d(LOG_TAG, "startSummaryUpdates")
            isSummaryUpdate = true
            summaryUpdateTimer.cancel()
            summaryUpdateTimer.start()
        }

        override fun stopSummaryUpdates() {
            Log.d(LOG_TAG, "stopSummaryUpdates")
            isSummaryUpdate = false
            summaryUpdateTimer.cancel()
        }
    }

    override fun onBind(intent: Intent): IBinder {
        return binder
    }

    override fun onDestroy() {
        isSummaryUpdate = false
        summaryUpdateTimer.cancel()
        WorkManager.getInstance(applicationContext)
                .cancelAllWorkByTag(SUMMARY_WORK_TAG)
        super.onDestroy()
    }

    companion object {
        private const val SUMMARY_WORK_TAG = "xmrig-summary-updates"
        private const val LOG_TAG = "XMRigAPIService"
        var IS_SERVICE_RUNNING = false
    }
}
