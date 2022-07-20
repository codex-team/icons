const { optimize } = require('svgo');
const path = require('path');
const fs = require('fs');

/**
 * Module for generating icon pack file from svg icons
 */
class IconsGenerator {
  constructor() {
    /**
     * Path to package's root
     */
    this.ROOT_DIR = path.resolve(__dirname, '..');

    /**
     * Input files and dirs
     */
    this.README_FILE = path.join(this.ROOT_DIR, 'README.md');
    this.INPUT_ICONS_DIR = path.join(this.ROOT_DIR, 'src', 'icons');

    /**
     * Output files and dirs
     */
    this.OUTPUT_DIR = path.join(this.ROOT_DIR, 'dist');
    this.OUTPUT_ICONS_DIR = path.join(this.OUTPUT_DIR, 'icons');
    this.OUTPUT_BUNDLE_FILE = path.join(this.OUTPUT_DIR, 'main.js');

    /**
     * Preparing lines for the table of icons which will be inserted to README file
     */
    this.TABLE_OF_ICONS = [
      '| Icon | Name |',
      '| --- | --- |'
    ];

    /**
     * List of input svg files
     */
    this.files = [];

    this.INPUT_ICONS_DIR = path.join(this.ROOT_DIR, 'src', 'icons');
  }

  run() {
    this.recreateOutputDirectory();
    this.createOutputScript();

    this.getSvgFiles();
    this.processSvgFiles();

    this.updateReadme();

    this.showReport();
  }

  /**
   * Recreating output directory
   */
  recreateOutputDirectory() {
    console.log('🗄 Recreating output directory');

    fs.rmSync(this.OUTPUT_DIR, { recursive: true, force: true });
    fs.mkdirSync(this.OUTPUT_ICONS_DIR, { recursive: true });
  }

  /**
   * Create an output script
   */
  createOutputScript() {
    fs.writeFileSync(this.OUTPUT_BUNDLE_FILE, '');
  }

  /**
   * Get all SVG files from icons directory
   */
  getSvgFiles() {
    console.log('🔎 Getting SVG files');

    this.files = fs.readdirSync(this.INPUT_ICONS_DIR)
      .filter(file => file.endsWith('.svg'));
  }

  /**
   * Going through all found SVG files and process them
   */
  processSvgFiles() {
    console.log('🛠 Processing SVG files');

    /**
     * Going through all SVG files
     */
    this.files.forEach(filename => {
      process.stdout.write(`💎 ${filename} -> `);

      /**
       * Generate icon's export name
       */
      const exportName = this.generateIconExportName(filename);

      console.log(`${exportName}`);

      /**
       * Read icon's code
       */
      const iconCode = fs.readFileSync(path.join(this.INPUT_ICONS_DIR, filename), 'utf8');

      /**
       * Optimize icon
       */
      const optimizedSvgString = this.optimizeSvg(iconCode);

      /**
       * Creating icon's object to simplify processing calls
       * @type {{svg: string, name: string}}
       */
      const icon = {
        name: exportName,
        svg: optimizedSvgString
      };

      /**
       * Add icon to the icons bundle
       */
      this.appendIconToBundle(icon)

      /**
       * Save optimized file to output directory
       */
      this.saveOptimizedSvg(icon);

      /**
       * Push new icon to the table of icons
       */
      this.pushIconToTable(icon);
    });
  }

  /**
   * Generate icon's export name
   *
   * @param filename
   *
   * @return {string}
   */
  generateIconExportName(filename) {
    /** Get the filename */
    const name = filename

      /** Get text name without extension */
      .split('.')[0]

      /** Replace all non-alphanumeric characters with space */
      .replace(/[^a-zA-Z0-9]/g, ' ')

      /** Uppercase each word and join chunks to the single word */
      .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');

    /**
     * Add "Icon" prefix and return the new name
     */
    return `Icon${name}`;
  }

  /**
   * Optimize SVG code
   *
   * @param {string} svg - SVG code
   *
   * @returns {string}
   */
  optimizeSvg(svg) {
    /**
     * Optimizing SVG with SVGO package
     * Read more: https://github.com/svg/svgo#api-usage
     */
    const result = optimize(svg, {
      plugins: [
        'sortAttrs',
        {
          name: 'addAttributesToSVGElement',
          params: {
            attributes: [
              {'fill': 'currentColor'}
            ]
          }
        }
      ]
    });
    return result.data;
  }

  /**
   * Append icon to the icons bundle
   *
   * @param {string} name - name of the icon
   * @param {string} svg - optimized svg code
   */
  appendIconToBundle({name, svg}) {
    fs.appendFileSync(this.OUTPUT_BUNDLE_FILE, `export const ${name} = '${svg}';\n`);
  }

  /**
   * Save optimized file to output directory
   *
   * @param {string} name - name of the icon
   * @param {string} svg - optimized svg code
   */
  saveOptimizedSvg({ name , svg}) {
    fs.writeFileSync(path.join(this.OUTPUT_ICONS_DIR, `${name}.svg`), svg);
  }

  /**
   * Push new icon to the table of icons for README
   *
   * @param {string} name - name of the icon
   */
  pushIconToTable({ name }) {
    const pathToIcon = path.relative(path.dirname(this.README_FILE), path.join(this.OUTPUT_ICONS_DIR, `${name}.svg`));

    this.TABLE_OF_ICONS.push(`| ![${name}](${pathToIcon}) | \`${name}\` |`);
  }

  /**
   * Function for updating the icons table in README.md file
   */
  updateReadme() {
    console.log('📝 Updating the README.md file');

    /**
     * Get and read README.md file
     */
    const readme = fs.readFileSync('./README.md', 'utf8');
    const readmeLines = readme.split('\n');

    /**
     * Find start and end lines with the table of icons
     */
    const sectionStart = readmeLines.indexOf('<!-- BEGIN TABLE_OF_ICONS -->');
    const sectionEnd = readmeLines.indexOf('<!-- END TABLE_OF_ICONS -->');

    /**
     * Insert new table of icons
     */
    readmeLines.splice(sectionStart + 1, sectionEnd - sectionStart - 1, ...this.TABLE_OF_ICONS);

    /**
     * Write new README.md file
     */
    fs.writeFileSync(this.README_FILE, readmeLines.join('\n'));
  }

  /**
   * Just a check for number of input and output files
   */
  showReport() {
    /**
     * Count input files
     */
    const inputFilesLength = fs.readdirSync(this.INPUT_ICONS_DIR)
      .filter(file => file.endsWith('.svg'))
      .length;

    /**
     * Count output files
     */
    const outputFilesLength = fs.readdirSync(this.OUTPUT_ICONS_DIR)
      .filter(file => file.endsWith('.svg'))
      .length;

    console.log(`📊 ${outputFilesLength} of ${inputFilesLength} icons were generated`);
  }
}

/**
 * Run generator
 */
(new IconsGenerator()).run();




