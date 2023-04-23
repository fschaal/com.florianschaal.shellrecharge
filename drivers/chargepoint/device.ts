import Homey from 'homey';
import {RechargeClient} from "../../services/cm";
import {GroupedConnector} from "../../models/groupedConnector";
import {EvsesHelper} from "../../helpers/evsesHelper";

class ChargePoint extends Homey.Device {

    private _timer: NodeJS.Timeout | undefined;
    private rechargeClient: RechargeClient | undefined;

    /**
     * onInit is called when the device is initialized.
     */
    async onInit() {
        this.log('ChargePoint has been initialized');
        this.rechargeClient = new RechargeClient();

        try {
            await this.updateDevice(true);
        } catch (e) {
            this.log(e);
        }
        this.start_update_loop();
    }

    onDeleted() {
        if (this._timer) {
            clearInterval(this._timer);
        }
    }

    start_update_loop() {
        this._timer = setInterval(async () => {
            await this.updateDevice();
        }, 300000); //5 min
    }

    async updateDevice(registerCapabilities: boolean = false) {
        this.log('Updating device');
        const chargePoint = await this.rechargeClient?.getChargePoints(this.getData().id);
        if (chargePoint == null) return;

        const groupedConnectors = EvsesHelper.toGroupedConnectors(chargePoint.evses);

        const oldData = JSON.parse(await this.getStoreValue('cache')) as Array<GroupedConnector>;
        await this.setStoreValue('cache', JSON.stringify(groupedConnectors));

        if (registerCapabilities) {
            for (const groupedConnector of groupedConnectors) {
                const hasCapability = this.hasCapability(`available_${groupedConnector.connectorType}_${groupedConnector.maxPower}`);
                if (!hasCapability) {
                    await this.addCapability(`available_${groupedConnector.connectorType}_${groupedConnector.maxPower}`);
                }
            }
            await this.addCapability('price_per_kwh');
        }

        await this.setCapabilityValue('price_per_kwh', `${chargePoint?.evses[0].connectors[0].tariff.perKWh} ${chargePoint?.evses[0].connectors[0].tariff.currency}`);
        for (const groupedConnector of groupedConnectors) {
            if (this.hasCapability(`available_${groupedConnector.connectorType}_${groupedConnector.maxPower}`)) {
                await this.setCapabilityValue(`available_${groupedConnector.connectorType}_${groupedConnector.maxPower}`, `${groupedConnector.maxPower}kW - ${groupedConnector.available}/${groupedConnector.total}`);
            }
        }

        if (oldData) {
            const connectorAvailabilityTrigger = this.homey.flow.getDeviceTriggerCard("connector_availability_changed");
            const priceChanged = this.homey.flow.getDeviceTriggerCard("price_changed");

            for (const groupedConnector of groupedConnectors) {
                const oldConnector = oldData.find((old) => old.connectorType === groupedConnector.connectorType && old.maxPower === groupedConnector.maxPower);
                if (oldConnector) {
                    if (oldConnector.available !== groupedConnector.available) {
                        await connectorAvailabilityTrigger.trigger(this, {
                            free_connectors: groupedConnector.available,
                            connector_type: `${groupedConnector.connectorType} - ${groupedConnector.maxPower}kW`,
                        }, {});
                    }

                    if (oldConnector.pricePerKwh !== groupedConnector.pricePerKwh) {
                        await priceChanged.trigger(this, {
                            price_per_kwh: groupedConnector.pricePerKwh,
                        }, {});
                    }
                }
            }
        }
    }
}

module.exports = ChargePoint;
