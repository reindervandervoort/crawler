import { URL } from "url"

export default interface IDownloadQueueItem {
    currentUrl: string;
    history: string[]
}