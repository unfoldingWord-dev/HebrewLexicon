/* eslint-env jest */

import fs from 'fs-extra';
import path from 'path-extra';
import {generateStrongsFiles} from "../src/strongsHelpers";

describe('strongsParse', function() {

  beforeEach(() => {
  });

  afterEach(() => {
  });

  it('should output UGNT chapter files', async () => {
    await generateStrongsFiles('v0');
  }, 30000); // max timeout (should be long enough, but may need to be increased on a slow connection)

  // for debugging
  // it('should download and output UGNT chapter files', () => {
  //   return new Promise((resolve) => {
  //     ugntHelpers.generateUgntVersion(version, resolve);
  //   }).then(() => {
  //     console.log('UGNT processing completed!');
  //   });
  // }, 300000); // max timeout (should be long enough, but may need to be increased on a slow connection)
});

//
// helpers
//
function deletePath(filePath) {
  if (fs.existsSync(filePath)) {
    fs.removeSync(filePath);
  }
}
