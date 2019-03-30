'use strict';

const { ZigBeeDevice } = require('homey-meshdriver');

class MotionSensor2016Device extends ZigBeeDevice {

	onMeshInit() {

		this.enableDebug();

		this.log('MotionSensor2016Device has been inited');

		this.log(this.node.endpoints[0].clusters['msTemperatureMeasurement']);

		this.registerCapability('alarm_motion', 'genBinaryInput', {
			get: 'presentValue',
			getOpts: {
				getOnStart: true,
				getOnOnline: true
			}
		}
		);

		this.registerCapability('alarm_battery', 'genPowerCfg', {
			get: 'batteryVoltage',
			getOpts: {
				getOnStart: true,
				getOnOnline: true
			}
		});

		this.registerCapability('measure_temperature', 'msTemperatureMeasurement', {
			get: 'measuredValue',
			getOpts: {
				getOnStart: true,
				getOnOnline: true
			}
		});
		//this.registerCapability('measure_luminance', 'msIlluminanceMeasurement');
		this.registerCapability('measure_battery', 'genPowerCfg', {
			get: 'batteryVoltage',
			getOpts: {
				getOnStart: true,
				getOnOnline: true
			}
		});

		this.printNode();

		this.registerAttrReportListener('genPowerCfg', 'batteryVoltage', 1, 3600, null, data1 => {
			this.log('batteryVoltage', data1);
			if (data1 <= 10) {
				this.setCapabilityValue('alarm_battery', true);
			} else {
				this.setCapabilityValue('alarm_battery', false);
			}

			if (data1 >= 18) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.90);
			} else if (data1 >= 17) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.80);
			} else if (data1 >= 16) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.70);
			} else if (data1 >= 15) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.60);
			} else if (data1 >= 14) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.50);
			} else if (data1 >= 13) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.40);
			} else if (data1 >= 12) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.30);
			} else if (data1 >= 11) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.15);
			} else if (data1 >= 10) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.10);
			} else if (data1 >= 9) {
				this.setCapabilityValue('batteryPercentageRemaining', 0.05);
			}
		}, 0).catch(
			e => {
				this.log('failed to registerAtrReportListener for battery voltage' + e + " type: " + typeof (e));
				this.log(e);
			});

		this.registerAttrReportListener('genBinaryInput', 'presentValue', 1, 3600, null, data1 => {
			this.log('presentValue', data1);
			if (data1 == 1) {
				this.setCapabilityValue('alarm_motion', true);
			} else {
				this.setCapabilityValue('alarm_motion', false);
			}
		}, 0).catch(
			e => {
				this.log('failed to registerAtrReportListener for motion sensoe' + e + " type: " + typeof (e));
				this.log(e);
			});

		this.minReportTemp = /*this.getSetting('minReportTemp') ||*/ 1800;
		this.maxReportTemp = /*this.getSetting('maxReportTemp') ||*/ 3600;

		this.registerAttrReportListener('msTemperatureMeasurement', 'measuredValue', this.minReportTemp, this.maxReportTemp, 10, data2 => {
			this.log('measuredValue temperature', data2);
			const temperature = Math.round((data2 / 100) * 10) / 10;
			this.setCapabilityValue('measure_temperature', temperature);
		}, 0).catch(
			e => {
				this.log('failed to registerAtrReportListener for temperature sensor' + e + " type: " + typeof (e));
				this.log(e);
			});
	}
}

module.exports = MotionSensor2016Device;
