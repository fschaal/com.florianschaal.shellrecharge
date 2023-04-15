import {Connector} from "./connector";

export class Evses{
    public uid: number = 0;
    public evseId: string = '';
    public status: string = '';
    public connectors: Array<Connector> = [];
}
