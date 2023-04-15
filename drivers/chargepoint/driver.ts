import Homey from 'homey';
import {RechargeClient} from "../../services/cm";

class ChargePointDriver extends Homey.Driver {

    private rechargeClient: RechargeClient | undefined;


    /**
     * onInit is called when the driver is initialized.
     */
    async onInit() {
        this.log('ChargePointDriver has been initialized');

        this.rechargeClient = new RechargeClient();
        const locationManager = this.homey.geolocation;

        const latSettings = this.homey.settings.get('latitude');
        if(!latSettings)
        {
            console.log("latSettings is null setting default");
            const lat = locationManager.getLatitude();
            this.homey.settings.set('latitude', lat);
        }

        const longSettings = this.homey.settings.get('longitude');
        if(!longSettings)
        {
            console.log("longSettings is null setting default");
            const long = locationManager.getLongitude();
            this.homey.settings.set('longitude', long);
        }

        const radiusSettings = this.homey.settings.get('radius');
        if(!radiusSettings)
        {
            console.log("radiusSettings is null setting default");
            this.homey.settings.set('radius', 1);
        }
    }

    /**
     * onPairListDevices is called when a user is adding a device and the 'list_devices' view is called.
     * This should return an array with the data of devices that are available for pairing.
     */
    async onPairListDevices() {
        let devices = Array<any>();


        const lat = this.homey.settings.get('latitude');
        const long = this.homey.settings.get('longitude');
        const radius = this.homey.settings.get('radius');

        const locations = await this.rechargeClient?.getLocations(lat, long, radius);
        if (locations != null && locations.length > 0) {
            if ((await locations).length > 25) {
                throw new Error("Too many charge points found, please decrease the radius");
            }

            const chargePoints = await Promise.all(locations?.map(async (location) => {
                const chargePoint = await this.rechargeClient?.getChargePoints(location.locationUid);
                if (chargePoint == null) return null;
                return chargePoint;
            }));

            if (chargePoints != null && chargePoints.length > 0) {
                chargePoints.forEach((chargePoint) => {
                    if (chargePoint == null) return;
                    devices.push({
                        name: `${chargePoint.address.streetAndNumber}, ${chargePoint.address.city}`,
                        data: {
                            id: chargePoint.uid,
                        },
                        icon: "/icon.svg"
                    })
                });
            }
        }

        return devices
    }

}

module.exports = ChargePointDriver;
