const path = require('path');
const fs = require('fs');
const order = process.argv[2];


const dirname = './拷贝测试/day01';
const copyToDir = './拷贝测试/day02';
const deleteDir = './拷贝测试/day02';

/**
 * @description: 批量创建文件夹
 * @param {*} rootDir 根目录
 * @param {*} num 创建多少个目录
 * @param {*} dirName 目录名称
 * @param {*} createFile 是否在创建目录的同时创建文件
 * @param {*} fileTypes 创建目录时想要创建的文件类型
 */
const createDir = (rootDir, num, dirName = 'File', createFile = false, fileTypes = []) => {
  if (typeof num !== 'number' || typeof dirName !== 'string' || typeof createFile !== 'boolean') {
    return;
  }
  for (let index = 0; index < num; index++) {
    const i = index + 1;
    const filepath = path.resolve(rootDir, `${dirName}${i < 10 ? '0' + i : i}`);
    // 创建文件夹
    fs.mkdir(filepath, (err) => {
      if (err) {
        console.log(`${dirName}${i < 10 ? '0' + i : i}创建失败`);
        return;
      }
      // 判断是否需要在创建目录时同时创建文件
      if (createFile) {
        const pathTemp1 = path.resolve(filepath, 'test.txt');
        const pathTemp2 = path.resolve(filepath, 'test.js');
        fs.writeFile(pathTemp1, 'Hello Node', (writeFileErr) => {
          if (writeFileErr) {
            console.log('创建文件失败！');
          }
        });
        fs.writeFile(pathTemp2, 'const message = "Hello Node";', (writeFileErr) => {
          if (writeFileErr) {
            console.log('创建文件失败！');
          }
        });
      }
    });
  }
};

/**
 * @description: 删除rootDir下的目录以及文件
 * @param {*} dir 根目录
 */
const emptyDir = (dir) => {
  // 1、读取循环当前目录
  fs.promises
    .readdir(dir, { withFileTypes: true })
    .then((files) => {
      // 判断当前传入的是否是一个空文件夹，并且当前目录不是最初传入的根目录
      // 条件符合的话直接删除当前目录，并且将父目录传入当前函数进行递归
      if (files.length < 1 && dir !== path.resolve(__dirname, deleteDir)) {
        fs.promises
          .rmdir(dir)
          .then((res) => {
            emptyDir(path.resolve(dir, '../'));
            console.log('删除父文件夹成功 => ', dir);
          })['catch']((err) => {
            console.log('删除父文件夹出错 => ', err);
          });
      }
      // 2、循环目录中的文件
      files.forEach((file) => {
        // 判断当前循环项是目录还是文件
        if (file.isDirectory()) {
          const dirTemp = path.resolve(dir, file.name);
          emptyDir(dirTemp);
        } else {
          const pathlink = path.resolve(dir, file.name);
          fs.promises.unlink(pathlink).then((res) => {
            console.log('删除文件成功 => ', pathlink);
            emptyDir(dir);
          });
        }
      });
    })['catch']((err) => {
      console.log('读取目录出错 ==> ', err);
    });
};

const emptyDir2 = (rootDir) => {
  // 读取目录
  fs.readdir(rootDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      return;
    }
    // 如果传进来的是一个空目录，不用循环，直接删掉
    if (files.length < 1) {
      fs.rmdir(rootDir, (rmDirErr) => {
        if (rmDirErr) {
          console.log('读取目录出现问题了：', rmDirErr);
        }
      });
      return;
    }
    // 循环目录列表
    files.forEach((file) => {
      // console.log(file);
      // 判断是否是一个目录
      if (file.isDirectory()) {
        const filepathTemp = path.resolve(rootDir, file.name);
        emptyDir(filepathTemp);
      } else {
        // 删除文件
        const filepathTemp = path.resolve(rootDir, file.name);
        fs.unlink(filepathTemp, (error) => {
          if (error) {
            console.log('删除文件失败：', filepathTemp);
          } else {
            console.log(rootDir, 'rootDir');
            // emptyDir(rootDir);
            // console.log('删除文件成功：', file.name);
          }
        });
      }
    });
  });
  // console.log('如果文件夹下有文件，请再执行一次');
};

/**
 * @description: 拷贝文件
 * @param {*} fromDir 从哪个目录拷贝
 * @param {*} toDir 拷贝后的目标目录
 */
const copyMyFile = (fromDir, toDir) => {
  // 读取将要被拷贝的文件夹
  fs.promises
    .readdir(fromDir, { withFileTypes: true })
    .then((files) => {
      if (files.length < 1) {
        return;
      }
      files.forEach((file) => {
        // 拷贝初始路径
        const fromDirpathTemp = path.resolve(fromDir, file.name);
        // 拷贝目标路径
        const toDirpathTemp = path.resolve(toDir, file.name);
        // 判断当前要拷贝的是一个目录or文件
        if (file.isDirectory()) {
          // 拷贝目标目录中创建一个目录
          fs.promises
            .mkdir(toDirpathTemp)
            .then((res) => {
              console.log('创建目录成功', toDirpathTemp);
            })['catch']((err) => {
              console.log('创建目录失败 ==> ', err);
            });
          // 执行递归
          copyMyFile(fromDirpathTemp, toDirpathTemp);
          // console.log(fromDirpathTemp, toDirpathTemp);
        } else {
          // console.log(fromDirpathTemp, toDirpathTemp);
          // 过滤想要拷贝的文件
          if (file.name.split('.')[1] === 'js') {
            fs.promises
              .copyFile(fromDirpathTemp, toDirpathTemp)
              .then((res) => {
                console.log('拷贝文件成功', toDirpathTemp);
              })['catch']((err) => {
                console.log('拷贝文件出错 ==> ', err);
              });
          }
        }
      });
    })['catch']((err) => {
      console.log('读取目录出错了 ==>', err);
    });
};


switch (order) {
  case 'delete':
    emptyDir(deleteDir);
    break;
  case 'create':
    createDir(dirname, 5, 'dir', true);
    break;
  case 'copy':
    copyMyFile(dirname, copyToDir);
    break;
  default:
    break;
}
