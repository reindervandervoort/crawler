import axios, { AxiosResponse } from "axios";
import IDownloadQueueItem from "../models/download-queue-item.interface";
import IParseQueueItem from "../models/parse-queue-item.interface";
import { Input } from "../utils/comman-line-doc";
import BaseService from "./base.service";
import ParseService from "./parse.service";


export default class DownloadService extends BaseService<IDownloadQueueItem>{  
    parseService: ParseService | null = null;

    parsedURLs: string[] = [];

    input: Input;

    constructor(input: Input, parseService?: ParseService){
        super();
        
        this.input = input;

        if (parseService) this.parseService = parseService;

        this.queue.enqueue({currentUrl: input.url, history: []});
    }

    loopCycle(item: IDownloadQueueItem): Promise<void> {  
        if(this.parseService === null) throw new Error("Please assign parseService");
        
        if (!this.parsedURLs.includes(item.currentUrl) && item.currentUrl.startsWith(this.input.url)) {
            // console.log(`depth: ${item.history.length + 1}: ${item.currentUrl}`);

            this.parsedURLs.push(item.currentUrl);
            return this.downloadItem(item)
            .then((download: IParseQueueItem) => {
                this.parseService!.queue.enqueue(download);
            });
        }

        
        if (this.queue.isEmpty() && this.parseService.queue.isEmpty()) {
            this.parseService.stop();
            this.stop();
        }

        return Promise.resolve();
    }

    onEmptyQueue(): Promise<void>{
        return new Promise(r => setTimeout(r, 100));
    }

    onStop(): void {
        if(this.parseService === null) throw new Error("Please assign parseService");

        this.parseService.stop();

        console.log(`parsed ${this.parsedURLs.length} pages.`)
    }

    downloadItem(item: IDownloadQueueItem): Promise<IParseQueueItem> {
        return axios.get(item.currentUrl).then((res: AxiosResponse) => {
            const parseItem: IParseQueueItem = {...item} as IParseQueueItem;
            parseItem.data = res.data;
            return parseItem;
        })
    }
}