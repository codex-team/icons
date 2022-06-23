const { optimize } = require('svgo');
const fs = require('fs');

fs.mkdirSync('./dist/icons', { recursive: true });


const ICONS_BUNDLE_FILE = './dist/main.js';

// read all files from icons directory
const files = fs.readdirSync('./src/icons');

fs.writeFileSync(ICONS_BUNDLE_FILE, '');

const TABLE_OF_ICONS = [
    '| Icon | Name |',
    '| --- | --- |'
];

for (let filename of files) {
    const name = filename.split('.')[0];
    const exportName = `Icon${name}`;

    let iconCode = fs.readFileSync(`./src/icons/${filename}`, 'utf8');

    const result = optimize(iconCode, {
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
    const optimizedSvgString = result.data;

    fs.writeFileSync(`./dist/icons/${exportName}.svg`, optimizedSvgString);

    fs.appendFileSync(ICONS_BUNDLE_FILE, `export const ${exportName} = '${optimizedSvgString}';\n`);

    TABLE_OF_ICONS.push(`| ![${name}](./dist/icons/${exportName}.svg) | \`${exportName}\` |`);
}

(function updateReadme() {
    const readme = fs.readFileSync('./README.md', 'utf8');
    const readmeLines = readme.split('\n');

    const sectionStart = readmeLines.indexOf('<!-- BEGIN TABLE_OF_ICONS -->');
    const sectionEnd = readmeLines.indexOf('<!-- END TABLE_OF_ICONS -->');

    readmeLines.splice(sectionStart + 1, sectionEnd - sectionStart - 1, ...TABLE_OF_ICONS);

    fs.writeFileSync('./README.md', readmeLines.join('\n'));
})();

console.log('done');
