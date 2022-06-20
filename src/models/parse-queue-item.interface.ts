import IDownloadQueueItem from "./download-queue-item.interface";

export default interface IParseQueueItem extends IDownloadQueueItem {
    data: string;
}