#!/usr/bin/env node
'use strict';

const fs = require('fs'),
      path = require('path');

const resolvePath = () => {
  return path.resolve(__dirname, ...arguments);
};
const folderBlacklist = ['css', 'sass', 'script', '.DS_Store'];
const keepingFolder = (folder) => {
  if (folder.startsWith('_'))
    return false;

  if (folder.startsWith('.'))
    return false;

  if (folderBlacklist.indexOf(folder) > -1)
    return false;

  if (!fs.statSync(path.resolve(__dirname, '../', folder)).isDirectory())
    return false;

  return true;
};

const getGifsFolders = () => fs.readdirSync(path.resolve(__dirname, '../')).filter(keepingFolder);

const liquidInfosForFile = (pathname) => {
  return {
    path: pathname.replace(`${path.resolve(__dirname, '../')}/`, ''),
    modified_time: new Date(fs.statSync(pathname).mtime).getTime(),
    extname: `.${pathname.split('.').pop()}`
  }
};

const getGifsInFolder = (path) => fs.readdirSync(path).sort();
const writeData = (filesArray) => {
  let yml = `---\n`;

  filesArray.forEach((file) => {
    yml += `- path: ${file.path}\n`
    yml += `  modified_time: ${file.modified_time}\n`
    yml += `  extname: ${file.extname}\n`
  });

  fs.writeFileSync(path.resolve(__dirname, '../', '_data/static_files.yml'), yml);
};

const gifsFolders = getGifsFolders();
const files = [];

let markup = ``;

getGifsFolders().forEach((folder) => {
  markup += `<ul><li>${folder}<ul>`;

  getGifsInFolder(path.resolve(__dirname, '../', folder)).forEach((gif) => {
    markup += `<li><a href="${folder}/${gif}" title="${gif}" class="gif">${gif}</a></li>`;

    files.push(liquidInfosForFile(path.resolve(__dirname, '../', folder, gif)));
  });

  markup += `</ul></li></ul>`;
});

fs.access(path.resolve(__dirname, '../', '_data/'), fs.F_OK, (err) => {
  if (err)
    fs.mkdirSync(path.resolve(__dirname, '../', '_data/'));

  writeData(files);
  fs.writeFileSync(path.resolve(__dirname, '../', '_includes/site-index.html'), markup);
})
