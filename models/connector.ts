import {ElectricalProperties} from "./electricalProperties";
import {Tariff} from "./tariff";

export class Connector {
    public uid: number = 0;
    public connectorType: string = '';
    public status: string = '';
    public electricalProperties: ElectricalProperties = new ElectricalProperties();
    public tariff: Tariff = new Tariff();
}
