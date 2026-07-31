// IXMRigAPIService.aidl
package com.xmrigforandroid.services;

interface IXMRigAPIService {
    void startSummaryUpdates();
    void stopSummaryUpdates();
    void pauseMiner();
    void resumeMiner();
}