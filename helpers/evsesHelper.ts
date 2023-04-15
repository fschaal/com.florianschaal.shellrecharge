import {Evses} from "../models/evses";
import {GroupedConnector} from "../models/groupedConnector";

export class EvsesHelper {
    public static toGroupedConnectors(evses: Evses[]): Array<GroupedConnector> {
        const groupedConnectors = Array<GroupedConnector>();

        evses.forEach((evse) => {
            evse.connectors.forEach((connector) => {
                let connectorGroup = {
                    connectorType: connector.connectorType,
                    maxPower: connector.electricalProperties.maxElectricPower,
                    available: evse.status.toLowerCase() === 'available' ? 1 : 0,
                    total: 1,
                    pricePerKwh: evse.connectors[0].tariff.perKWh,
                };

                const existingConnectorGroup = groupedConnectors.find((group) => group.connectorType === connectorGroup.connectorType && group.maxPower === connectorGroup.maxPower);
                if (existingConnectorGroup) {
                    existingConnectorGroup.available += connectorGroup.available;
                    existingConnectorGroup.total += connectorGroup.total;
                } else {
                    groupedConnectors.push(connectorGroup);
                }
            });
        });

        return groupedConnectors;
    }
}
