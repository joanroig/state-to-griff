import * as fs from "fs";
import * as path from "path";
import xml2js from "xml2js";

export class GriffConverter {
  inFolderPath: string;
  outFolderPath: string;
  threshold: number;

  constructor() {
    const config = JSON.parse(fs.readFileSync("./config.json").toString());
    this.inFolderPath = config.inFolderPath;
    this.outFolderPath = config.outFolderPath;
  }

  public async start(): Promise<void> {
    const stateFiles = this.findStateFilesInPresetsDir(this.inFolderPath);
    console.info(`Found ${stateFiles.length} files, starting conversion...`);
    for (const stateFile of stateFiles) {
      const riffXml = await this.extractRiffTag(stateFile);
      if (riffXml) {
        const filename = path.parse(stateFile).name;
        const outputFile = `${this.outFolderPath}/${filename}.griff`;
        this.saveRiffXml(riffXml, outputFile);
      }
    }
    console.info(`Finished!`);
  }

  private findStateFilesInPresetsDir(basePath: string) {
    const stateFiles: string[] = [];

    // Recursively search for folders named "presets"
    function searchForPresetsDirs(dirPath: string) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          if (file === "Presets") {
            // Found a "Presets" folder, so search for state files in it
            searchForStateFiles(filePath);
          } else {
            // Recursively search for "Presets" folders
            searchForPresetsDirs(filePath);
          }
        }
      }
    }

    // Search for state files with the extension `.*state`
    function searchForStateFiles(dirPath: string) {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // Recursively search for state files in subdirectories
          searchForStateFiles(filePath);
        } else if (file.match(/\..*state$/i)) {
          // Found a state file, so add it to the list
          stateFiles.push(filePath);
        }
      }
    }

    // Start searching for "presets" folders from the base path
    searchForPresetsDirs(basePath);

    return stateFiles;
  }

  private extractRiffTag(inputFile: string): Promise<string> {
    const builder = new xml2js.Builder({ rootName: "Riff" });
    // Read the contents of the file
    const fileBuffer = fs.readFileSync(inputFile);
    // Parse the XML data into a JavaScript object
    return xml2js.parseStringPromise(fileBuffer).then(
      (rawXml) => {
        // Find the <Riff> tag in the object and convert it back to XML
        const xmlRoot = Object.keys(rawXml)[0];
        const xmlBody = rawXml[xmlRoot];
        if (xmlBody && xmlBody["Riff"] && xmlBody["Riff"][0]) {
          const xmlRiff = xmlBody["Riff"][0];
          // Remove unnecessary attributes
          xmlRiff.$.Path = undefined;
          xmlRiff.$.Name = undefined;
          return builder.buildObject(xmlRiff);
        }
      },
      (err) => {
        console.error(`Error parsing XML file: ${inputFile}, ${err}`);
        return undefined;
      }
    );
  }

  private saveRiffXml(xml: string, outFilePath: string): void {
    // create the directory if it doesn't exist
    const directoryPath = path.dirname(outFilePath);
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // write the file
    console.info(`Saving riff: "${outFilePath}"`);
    fs.writeFileSync(outFilePath, xml);
  }
}
