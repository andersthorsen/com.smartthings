'use strict';

const ZigBeeDeviceDebug = require('../../lib/ZigBeeDeviceDebug');

class MotionSensor2016Device extends ZigBeeDeviceDebug {

	convertVoltageToPct(voltage) {
		var batteryMap = {
			'28': 100, '27': 100, '26': 100, '25': 90, '24': 90, '23': 70,
			'22': 70, '21': 50, '20': 50, '19': 30, '18': 30, '17': 15, '16': 1, '15': 0
		};

		var minVolts = 15;
		var maxVolts = 28;

		var volt = Math.round(voltage);
		this.log('read voltage: ', voltage);

		if (volt > maxVolts) {
			volt = maxVolts;
			this.log('voltage is above maxium');
		}

		if (volt < minVolts) {
			volt = minVolts;
			this.log('voltage is below minimum');
		}

		var pct = batteryMap[volt.toString()];

		if (pct == null || pct == undefined || typeof (psct) == 'undefined') {
			this.log('cannot detect voltage.')
			return null;
		}

		return pct / 100;
	}

	onMeshInit() {

		this.enableDebug();

		this.printNode();

		this.log('MotionSensor2016Device (motionv5) has been inited');

		this.attachDebugListeners(['msTemperatureMeasurement/measuredValue', 'genPowerCfg/batteryVoltage', 'ssIasZone/zoneStatus', 'genPollCtrl/*']);

		this.batteryThreshold = 17;

		this.registerCapability('measure_temperature', 'msTemperatureMeasurement', {
			get: 'measuredValue',
			getOpts: {
				getOnStart: true,
				getOnOnline: true
			}
		});

		this.registerCapability('measure_battery', 'genPowerCfg', {
			get: 'batteryVoltage',
			getOpts: {
				getOnStart: true,
				getOnOnline: true
			},
			getParser: this.convertVoltageToPct.bind(this)
		});

		this.registerCapability('alarm_motion', 'ssIasZone', {
			get: 'zoneStatus',
			getOpts: {
				getOnOnline: true,
				getOnStart: true
			},
			getParser: value => {

				this.log('reading zoneStatus');

				if (value == null || value == undefined || typeof (value) == 'undefined') {
					return undefined;
				}

				return (value & 0x1) == (0x1);
			}
		});

		//this.registerCapability('alarm_motion', '64514', '');

		this.registerAttrReportListener('ssIasZone', 'zoneStatus', 1, 3600, null, value => {

			this.log('zoneStatus changed');

			if (value == null || value == undefined || typeof (value) == 'undefined') {
				return undefined;
			}

			this.setCapabilityValue('alarm_motion', (value & 0x1) == (0x1));
		}).catch(
			e => {
				this.log('failed to registerAtrReportListener for zone status change' + e);
				this.log(e);
			});

		this.registerAttrReportListener('genPowerCfg', 'batteryVoltage', 1, 3600, null, data1 => {
			this.log('batteryVoltage', data1);
			if (data1 <= this.batteryThreshold) {
				this.setCapabilityValue('alarm_battery', true);
			} else {
				this.setCapabilityValue('alarm_battery', false);
			}

			var pct = this.convertVoltageToPct(data1);

			if (pct != null && typeof (pct) != 'undefined') {
				this.setCapabilityValue('batteryPercentageRemaining', pct);
			}

		}, 0).catch(
			e => {
				this.log('failed to registerAtrReportListener for battery voltage' + e);
				this.log(e);
			});

		this.minReportTemp = /*this.getSetting('minReportTemp') ||*/ 1800;
		this.maxReportTemp = /*this.getSetting('maxReportTemp') ||*/ 3600;
	}
}

module.exports = MotionSensor2016Device;
