import axios from 'axios';
import {GeoHelper} from "../helpers/geoHelper";
import {ChargePoint} from "../models/chargePoint";
import {Location} from "../models/location";

export class RechargeClient {

    private geoHelper: GeoHelper;

    constructor() {
        this.geoHelper = new GeoHelper();
    }

    public async getLocations(lat: string, long: string, distance: number): Promise<Location[]> {
        const boundingBox = this.geoHelper.getBoundingBox(parseFloat(lat), parseFloat(long), distance);

        const config = {
            method: 'get',
            url: `https://ui-map.shellrecharge.com/api/map/v2/markers/${boundingBox[1]}/${boundingBox[3]}/${boundingBox[0]}/${boundingBox[2]}/16`,
        };

        const response = await axios<Location[]>(config);

        return response.data;
    }

    public async getChargePoints(locationId: number): Promise<ChargePoint | null> {
        try {
            const config = {
                method: 'get',
                url: `https://ui-map.shellrecharge.com/api/map/v2/locations/${locationId}`,
            };
            const response = await axios<ChargePoint>(config);

            return response.data;
        }catch (e) {
            console.log(e);
            return null;
        }
    }
}
