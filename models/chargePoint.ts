import {Address} from "./address";
import {Accessibility} from "./accessibility";
import {Evses} from "./evses";

export class ChargePoint {
    public uid: number = 0;
    public operatorName: string = '';
    public operatorId: string = '';
    public address: Address = new Address();
    public accessibilityV2: Accessibility = new Accessibility();
    public evses: Evses[] = [];
}
