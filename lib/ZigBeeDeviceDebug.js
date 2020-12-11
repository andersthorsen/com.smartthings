'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');

class ZigBeeDeviceDebug extends ZigBeeDevice {
    attachDebugListeners(excluded) {

        
        console.log(this.node.endpoints);

        return;

        Object.keys(this.node.endpoints).forEach(endpointsId => {
            Object.keys(this.node.endpoints[endpointsId].clusters).forEach(key => {
                if (typeof this.node.endpoints[endpointsId].clusters[key].attrs !== 'undefined') {
                    Object.keys(this.node.endpoints[endpointsId].clusters[key].attrs).forEach(attrKey => {

                        var k = key;
                        var a = attrKey;

                        this.log('----', attrKey, ':', this.node.endpoints[endpointsId].clusters[key].attrs[attrKey]);

                        if (a == 'sid' || a == 'cid') {

                        } else {

                            if (excluded == null || (!excluded.includes(key + '/' + attrKey) && !excluded.includes(key + '/*'))) {
                                this.registerAttrReportListener(k, a, 1, 3600, null, value => {
                                    this.log('attribute ', a, ' of cluster ', k, ' changed value to ', value);
                                }, 0).catch(
                                    e => {
                                        this.log('failed to registerAtrReportListener for attribute ', a, ' on cluster ', k, e);
                                        //this.log(e);
                                    });
                            } else {
                                this.log('not logging ', key, '/', attrKey);
                            }
                        }
                    });
                }
            });
        });
    }
}

module.exports = ZigBeeDeviceDebug;
