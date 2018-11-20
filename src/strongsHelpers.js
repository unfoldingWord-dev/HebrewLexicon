/**
 * ugntHelpers.js - this is the code called by ugntParse.js to download and convert greek resources (was BHP and now
 *                  UGNT.
 */

import path from 'path-extra';
import fs from 'fs-extra';

const outputPath = path.join(__dirname, '../resources/en/lexicons/uhl');


/**
 * @description - generates UGNT for each book from github and split into chapters and saves under version.
 * @param {function} resolve - callback when finished
 */
export async function generateStrongsFiles(version) {
  const versionPath = path.join(outputPath, version);
  fs.ensureDirSync(versionPath);
  const inputPath = path.join(__dirname, '../HebrewStrong.xml');
  const hebrewStrongs = fs.readFileSync(inputPath).toString();
  const words = hebrewStrongs.split('<entry id="');
  const index = [];
  for (let i = 1, len = words.length; i < len; i++) {
    const item = words[i];
    let parts = item.split('"');
    let strongsCode = parts[0];
    const strongsNum = strongsCode.substr(1);

    const word = getXmlTag(item, 'w');
    const source = getXmlTag(item, 'source');
    let meaning = getXmlTag(item, 'meaning');
    const usage = getXmlTag(item, 'usage');
    const def = getXmlTag(meaning.content, 'def');
    meaning.content = replaceTag(meaning.content, 'def', '"' + def.content + '"');

    let definition = "";
    definition = addContent(source, definition, 'source');
    definition = addContent(meaning, definition, 'meaning');
    definition = addContent(usage, definition, 'usage');
    console.log(strongsNum + " definition= " + definition);
    if (definition.indexOf("<") >= 0) {
      assert.fail("should not have xml: " + definition);
    }
    
    const entry = {
      brief: def.content,
      long: definition
    };
    
    const filePath = path.join(versionPath, 'content', strongsNum + ".json");
    fs.outputJsonSync(filePath, entry);
    
    const indexEntry = {
      id: strongsCode,
      name: word.content
    };
    index.push(indexEntry);
  }
  const filePath = path.join(versionPath, "index.json");
  fs.outputJsonSync(filePath, index);
  console.log(`Finished Parsing Strongs`);
}

function getXmlTag(text, tag) {
  let startTag = '<' + tag + ' ';
  let attr = "";
  let content = "";
  let startPos = text.indexOf(startTag);
  if (startPos < 0) {
    startTag = '<' + tag + '>';
    startPos = text.indexOf(startTag);
    if (startPos >= 0) {
      startPos += startTag.length;
    }
  } else {
    const endStart = text.indexOf('>', startPos);
    attr = text.substring(startPos + startTag.length, endStart);
    startPos = endStart + 1;
  }
  if (startPos >= 0) {
    const endTag = '</' + tag + '>';
    const endPos = text.indexOf(endTag, startPos);
    content = text.substring(startPos, endPos);
  }
  return { content, attr };
}

function getAttr(word, attr) {
  let src;
  const parts = word.attr.split(' ');
  for (let i = 0, len = parts.length; i < len; i++) {
    const part = parts[i];
    if (part.startsWith(attr + '="')) {
      src = part.substring(attr.length + 2, part.length - 1);
      break;
    }
  }
  return src;
}

function addContent(source, definition, label) {
  if (source.content) {
    let content = source.content;
    while(1) {
      const word = getXmlTag(content, 'w');
      if (!word.content) {
        break;
      }
      let src = getAttr(word, 'src');
      if (src) {
        content = replaceTag(content, 'w', '"' + src + '"');
      } else {
        content = replaceTag(content, 'w', '"' + word.content + '"');
      }
    }
    while(1) {
      const word = getXmlTag(content, 'def');
      if (!word.content) {
        break;
      }
      content = replaceTag(content, 'def', '"' + word.content + '"');
    }
    while(1) {
      const word = getXmlTag(content, 'note');
      if (!word.content) {
        break;
      }
      content = replaceTag(content, 'note', '');
    }
    definition += label + ': ' + content + '\n';
  }
  return definition;
}

function replaceTag(source, tag, replace) {
  const startPos = source.indexOf('<' + tag);
  if (startPos >= 0) {
    let endTag = '</' + tag + '>';
    const endPos = source.indexOf(endTag, startPos);
    source = source.substring(0, startPos) + replace + source.substring(endPos + endTag.length);
  }
  return source;
}
