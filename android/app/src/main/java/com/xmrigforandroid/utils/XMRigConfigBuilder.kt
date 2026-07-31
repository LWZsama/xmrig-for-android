package com.xmrigforandroid.utils

import android.content.Context
import android.util.Base64
import android.util.Log
import com.xmrigforandroid.data.serialization.Configuration
import com.xmrigforandroid.data.serialization.ConfigurationMode
import com.xmrigforandroid.data.serialization.SimpleConfigurationPropertiesCPU
import com.xmrigforandroid.data.serialization.SimpleConfigurationPropertiesPool
import java.io.*
import java.lang.RuntimeException
import java.lang.StringBuilder
import java.io.File
import java.nio.charset.Charset


class XMRigConfigBuilder(val context: Context) {

    var config: String
    var mContext: Context

    init {
        this.mContext = context
        config = loadConfigTemplate()
    }

    fun reset() {
        config = loadConfigTemplate()
    }

    fun getConfigPath(): String = "${context.filesDir.absolutePath}/config.json"

    fun loadConfigTemplate(): String {
        return try {
            val buf = StringBuilder()
            val json = this.context.assets?.open("config.json")
            val inStream = BufferedReader(InputStreamReader(json, "UTF-8"))
            var str: String?
            while (inStream.readLine().also { str = it } != null) {
                buf.append(str)
            }
            inStream.close()
            buf.toString()
        } catch (e: IOException) {
            throw RuntimeException(e)
        }
        finally {
        }
    }

    fun readConfigFromDisk(): String {
        return try {
            val buf = StringBuilder()
            val file = File(getConfigPath())
            val inStream = file.bufferedReader()
            var str: String?
            while (inStream.readLine().also { str = it } != null) {
                buf.append(str)
            }
            inStream.close()
            buf.toString()
        } catch (e: IOException) {
            throw RuntimeException(e)
        }
        finally {
        }
    }

    fun setConfiguration(data: Configuration) {
        val configByte = Base64.decode(data.config, Base64.DEFAULT)
        config = String(configByte, Charset.defaultCharset())
    }

    fun getConfigString(): String {
        return config
    }

    fun writeConfig(configContent: String? = null, customPath: String? = null): String {
        val privatePath = customPath ?: context.filesDir.absolutePath

        val f = File("$privatePath/config.json")
        Log.d(this.javaClass.name, "Write to $f")
        Log.d(this.javaClass.name, config)
        var writer: PrintWriter? = null

        try {
            writer = PrintWriter(FileOutputStream(f))
            if (configContent != null) {
                writer.write(configContent)
            } else {
                writer.write(config)
            }
        } catch (e: IOException) {
            throw RuntimeException(e)
        } finally {
            writer?.close()
        }
        return f.absoluteFile.toString()
    }

}