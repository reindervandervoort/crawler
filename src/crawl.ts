import Queue from "queue-fifo";
import IQueueItem from "./models/download-queue-item.interface";
import CommandLineDoc from "./utils/comman-line-doc";

const cld = new CommandLineDoc();
const input = cld.getInput();

if (input.help){
  cld.writeHelp();
} else if (!input.find || !input.url) {
  throw new Error("find and url fields are required");
} else {
  const crawlQueue = new Queue<IQueueItem>();
  while (!crawlQueue.isEmpty()) {
    crawlQueue.dequeue();
  }
}