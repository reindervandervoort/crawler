import * as Cheerio from "cheerio";
import IParseQueueItem from "../models/parse-queue-item.interface";
import { Input } from "../utils/comman-line-doc";
import BaseService from "./base.service";
import DownloadService from "./download.service";
import url from "url";

type FindResult = {
    url: string,
    results: string[]
}
export default class ParseService extends BaseService<IParseQueueItem> {
    downloadService: DownloadService | null = null;

    input: Input;

    results: FindResult[] = [];

    constructor(input: Input) {
        super();
        this.input = input;
    }

    loopCycle(item: IParseQueueItem) {
        if(this.downloadService === null) throw new Error("Please assign downloadService");

        this.parseItem(item);

        if (this.queue.isEmpty() && this.downloadService.queue.isEmpty()) {
            this.downloadService.stop();
            this.stop();
        }

        return Promise.resolve();
    }

    onEmptyQueue(): Promise<void>{
        // check if queue's are empty
        if (this.downloadService && this.downloadService.running && this.downloadService?.queue.size() === 0) {
            this.downloadService.stop();
        }
        return new Promise(r => setTimeout(r, 100));
    }


    onStop(): void {
        this.printResults();
    }

    printResults(){
        console.log(`Found ${this.results.filter((item: FindResult) => item.results.length > 0).length} pages with the term '${this.input.find}'`);
        this.results.forEach((item: FindResult) => {
            console.log(`${item.url} =>`);
            item.results.forEach((result: string) => console.log(result));
        });
    }

    parseItem(item: IParseQueueItem): void {

        const parsedHtml = Cheerio.load(item.data);

        if ((item.history.length + 1) < this.input.depth){
            this.findNestedUrls(item, parsedHtml);
        }

        const results = this.findSearchStringInElement(this.input.find, parsedHtml('body')[0]);
        if (results.length > 0) this.results.push({
            url: item.currentUrl,
            results: results
        });
    }

    findNestedUrls(item: IParseQueueItem, parsedHtml: cheerio.Root){
        const newHistory = [...item.history];

        newHistory.push(item.currentUrl);

        const linkObjects = parsedHtml('a');

        linkObjects.each((_index, element) => {
            const link = parsedHtml(element).attr('href');
            this.parseUrl(link, newHistory);
        });

    }

    parseUrl(link: string | undefined, history: string[]): void {
        if (link){
            // const parsedLink = url.parse(link);
            const oldUrl = url.parse(history[history.length - 1]);
            const fullPath = url.resolve(`${oldUrl.protocol}//${oldUrl.host}`, link);

            this.downloadService!.queue.enqueue({
                currentUrl: fullPath.split("#")[0].replace(/\/$/, ""),
                history: history
            });
        }
    }

    findSearchStringInElement(find: string, element: cheerio.Element): string[] {
        const results: string[] = [];

        if (element.type === 'text' && element.data){
            results.concat(this.findMatches(find, element.data));
        } else if (element.type === 'tag'){
            if (element.data) results.concat(this.findMatches(find, element.data));
            results.concat(this.findSearchStringInTag(find, element));
        }  
        
        return results;
    }

    
    findSearchStringInTag(find: string, element: cheerio.TagElement): string[] {
        const results: string[] = [];

        element.children.forEach((child: cheerio.Element) => {
            if (child.type === 'text' && child.data){
                results.concat(this.findMatches(find, child.data));
            } else if (child.type === 'tag'){
                if (element.data) results.concat(this.findMatches(find, element.data));
                results.concat(this.findSearchStringInTag(find, child));
            }
        });

        return results;
    }

    findMatches(find: string, text: string): string[] {
        const results: string[] = [];

        let findMatchIndex = text.indexOf(find);
        while (findMatchIndex > 0) {
            results.push(
                text.slice(
                    Math.max(0, findMatchIndex - 15), 
                    Math.min(text.length, findMatchIndex + find.length + 15)
                )
            )
            findMatchIndex = text.indexOf(find, findMatchIndex + find.length);
        }

        return results;
    }

}