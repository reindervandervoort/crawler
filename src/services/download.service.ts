import { throws } from "assert";
import axios from "axios";
import Queue from "queue-fifo";
import IDownloadQueueItem from "../models/download-queue-item.interface";
import IParseQueueItem from "../models/parse-queue-item.interface";
import baseService from "./base.service";
import parseService from "./parse.service";

export default class DownloadService extends baseService<IDownloadQueueItem>{  
    parseService: parseService;

    constructor(parseService: parseService){
        super();
        this.parseService = parseService;
    }

    loopCycle(item: IDownloadQueueItem): Promise<void> {      
        return this.downloadItem(item)
                    .then((download: IParseQueueItem) => {
                        this.parseService.queue.enqueue(download);
                    });
    }

    downloadItem(item: IDownloadQueueItem): Promise<IParseQueueItem> {
        return axios.get(item.currentUrl).then()
    }
}