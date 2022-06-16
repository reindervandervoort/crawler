import commandLineArgs  from 'command-line-args';
import commandLineUsage from 'command-line-usage';

export type Input = {
    help: boolean,
    depth: number,
    url: string,
    find: string,
}

export default class CommandLineDoc {
    optionDefinitions = [
        { name: 'depth', alias: 'd', defaultValue: 2, type: Number },
        { name: 'help', alias: 'h', type: Boolean },
        { name: 'url', alias: 'u', type: String },
        { name: 'find', alias: 'f', type: String },
    ];
    
    sections = [
      {
        header: 'A crawler',
        content: 'Crawls provded url for the provided find string'
      },
      {
        header: 'Options',
        optionList: [
          {
            name: 'depth',
            description: 'How many pages deep to crawl'
          },
          {
            name: 'help',
            description: 'Print this usage guide.'
          }
        ]
      }
    ];
    
    getInput(): Input {
        return commandLineArgs(this.optionDefinitions) as Input;
    }
    
    writeHelp() {   
        const usage = commandLineUsage(this.sections)
        console.log(usage)
    }

}