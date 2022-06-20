import DownloadService from "./services/download.service";
import ParseService from "./services/parse.service";
import CommandLineDoc from "./utils/comman-line-doc";

const cld = new CommandLineDoc();
const input = cld.getInput();

if (input.help){
  cld.writeHelp();
} else if (!input.find || !input.url) {
  throw new Error("find and url fields are required");
} else {
  const parseService = new ParseService(input);
  const downloadService = new DownloadService(input);
  parseService.downloadService = downloadService;
  downloadService.parseService = parseService;

  Promise.all([
    parseService.start(),
    downloadService.start()
  ]);
}