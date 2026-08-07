package com.xmrigforandroid.utils

import java.io.RandomAccessFile
import java.io.File

class CPUTemperatureHelper {
    companion object {
        var tempPath: String = ""
        fun searchCpuTemperature(): Float {
            val dirs = File("/sys/devices/virtual/thermal/").listFiles()
            dirs?.forEach {
                try {
                    val typeReaderVal = RandomAccessFile(it.resolve("type"), "r").use { reader ->
                        reader.readLine().orEmpty()
                    }
                    if (typeReaderVal.lowercase().contains("cpu")) {
                        val temp = RandomAccessFile(it.resolve("temp"), "r").use { reader ->
                            reader.readLine().toFloat()
                        }
                        tempPath = it.resolve("temp").toString()
                        return temp / 1000.0f
                    }
                } catch (e: Exception) {

                }
            }
            tempPath = "not_found"
            return 0.0f
        }
        fun getCpuTemperature(): Float {
            if (tempPath == "not_found") {
                return 0.0f
            }
            if (tempPath == "") {
                return searchCpuTemperature()
            }
            try {
                val temp = RandomAccessFile(tempPath, "r").use { reader ->
                    reader.readLine().toFloat()
                }
                return temp / 1000.0f
            } catch (e: Exception) {

            }
            return 0.0f
        }
    }
}
