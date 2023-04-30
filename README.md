# State to griff

Export Ample Sound's .griff files from .*state files to use them in the Riffer tool.

Allows having the whole guitar riff collection in a single folder without the need of exporting them one by one for each instrument.

## How to use

Be sure to have [Node.js](https://nodejs.org/en/download/) installed, then:

- [Download](https://github.com/joanroig/state-to-griff/archive/refs/heads/main.zip) or clone the repo.
- Run `npm install` in the root folder to install dependencies.
- Change value `YOUR_USER` of the paths in [config.json](config.json) to specify the input and output folders.
- Run `npm run convert` to run the conversion.
- The converted files should be ready to use in the Riffer tool.
