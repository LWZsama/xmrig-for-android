// IMiningService.aidl
package com.xmrigforandroid;

interface IMiningService {
    /**
     * Demonstrates some basic types that you can use as parameters
     * and return values in AIDL.
     */
    void startMiner(String config, String xmrigFork);
    void stopMiner();
}