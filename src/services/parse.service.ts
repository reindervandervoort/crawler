import IParseQueueItem from "../models/parse-queue-item.interface";
import baseService from "./base.service";

export default class ParseService extends baseService<IParseQueueItem> {

    results = [];

    loopCycle() {

    }
}