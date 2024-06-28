const fs = require("fs");
const path = require("path");
const readline = require("readline");

// 创建 readline 接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let endTime = "2024-05-01";
let targetDir = "D:\\doumu\\trunk\\dm-conpoment-build\\src2";
let originalDir = "D:\\doumu\\trunk\\dm-conpoment-build\\src";
const timeReg = /^(?:\d{4})-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2]\d|3[0-1])$/;
const questions = [
  // {
  //   id: "startTime",
  //   question: "请输入开始时间："
  // },
  {
    id: "endTime",
    question: "请输入截至时间：",
    output: "",
  },
  {
    id: "originalDir",
    question: "请输入需要检索复制的目录：",
    output: "",
  },
  {
    id: "targetDir",
    question: "请输入目标目录：",
    output: "",
  },
];

/**
 * @description: 格式化时间戳
 * @param {*} date 时间戳
 * @return {*} 2024-01-01 格式字符串
 */
const foramtDate = (date) => {
  const Y = new Date(date).getFullYear();
  const M =
    new Date(date).getMonth() + 1 > 10
      ? new Date(date).getMonth() + 1
      : "0" + (new Date(date).getMonth() + 1);
  const D =
    new Date(date).getDate() > 10
      ? new Date(date).getDate()
      : "0" + new Date(date).getDate();
  return `${Y}:${M}:${D}`;
};


/**
 * @description: 判断当前字符串是否为一个合法的目录
 * @param {*} dirPath 目录字符串
 * @return {*} false/true
 */
const isValidDirectoryPath2 = (dirPath) => {
    // 使用 path.isAbsolute() 检查是否为绝对路径
    if (!path.isAbsolute(dirPath)) {
        return false;
    }

    // 使用 path.normalize() 规范化路径
    const normalizedPath = path.normalize(dirPath);

    // 检查规范化后的路径是否和原始路径一致，避免路径被规范化后变为相对路径的情况
    if (normalizedPath !== dirPath) {
        return false;
    }

    // 使用 path.parse() 解析路径成对象
    const pathObj = path.parse(dirPath);

    // 检查 pathObj.dir 是否为空，以及其他条件
    if (pathObj.dir === '' || pathObj.dir === '.' || pathObj.ext !== '') {
        return false;
    }

    // 最后可以根据需要进行其他的校验，比如检查路径是否合法等

    // 如果通过了以上所有的校验，则认为是合法的目录路径
    return true;
}


/**
 * @description: 判断当前字符串是否为一个合法并存在的目录
 * @param {*} directoryPath 目录字符串
 * @return {*} false/true
 */
const isValidDirectoryPath = (directoryPath) => {
  // 利用 path.normalize 规范化路径
  const normalizedPath = path.normalize(directoryPath);

  // 使用 path.isAbsolute 判断是否为绝对路径
  if (!path.isAbsolute(normalizedPath)) {
    return false;
  }

  // 使用 fs.statSync 检查路径是否存在且为目录
  try {
    const stat = fs.statSync(normalizedPath);
    return stat.isDirectory();
  } catch (err) {
    return false;
  }
};

/**
 * @description: 根据 id 查找output
 * @param {*} id questionsId
 * @return {*} output
 */
const findOutput = (id) => questions.filter((item) => item.id === id)[0].output;

/**
 * @description: 使用 Promise 返回输入数据
 * @param {*} question 输出内容
 * @return {*} Promise
 */
const questionFun = (question) => {
  return new Promise((resolve, reject) => {
    rl.question(question, (answer) => {
      if (!answer) {
        reject("输入为空");
      }
      resolve(answer);
    });
  });
};

/**
 * @description: 查找修改日期大于当前日期的所有文件
 * @param {*} dir 被复制的目录
 * @param {*} date 日期
 */
const findFile = async (dir) => {
  try {
    const files = await fs.readdirSync(dir, { withFileTypes: true });
    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      // 当前文件名称
      const filePath = path.resolve(dir, file.name);
      // 最后修改时间(文件使用 mtime，目录使用 atime)
      const mtime = +new Date(fs.statSync(filePath).mtime);
      const atime = +new Date(fs.statSync(filePath).atime);
      if (file.isDirectory()) {
        findFile(filePath);
        // console.log("目录：", fileName);
      } else {
        // console.log("文件：", fileName);
      }
      if (mtime > +new Date(endTime)) {
        // 将原始目录替换为目标目录
        const targetPath = dir.replace(originalDir, targetDir);
        const targetFileName = path.resolve(targetPath, file.name);
        if (file.isDirectory()) {
          copyFile(filePath, targetFileName, true);
        } else {
          copyFile(filePath, targetFileName);
        }
        // console.log(filePath, "最后修改时间：", foramtDate(mtime));
        // console.log("目标目录：", targetPath);
      }
    }
  } catch (err) {
    console.log("读取目录出错：", err);
  }
};
/**
 * @description: 拷贝文件与创建目录
 * @param {*} originalFile 原始文件
 * @param {*} targetFileName 目标目录
 * @param {*} isDirectory 是否为目录
 */
const copyFile = (originalFile, targetFileName, isDirectory = false) => {
  // console.log("原始目录：", originalFile);
  // console.log("目标目录：", targetFileName);
  try {
    fs.accessSync(targetFileName);
    console.log("目录或文件已存在", targetFileName);
  } catch (err) {
    if (isDirectory) {
      // 创建目录
      try {
        fs.mkdirSync(targetFileName);
      } catch (err) {
        console.log("创建目录失败：", err);
      }
    } else {
      // 拷贝文件
      try {
        fs.copyFileSync(originalFile, targetFileName);
      } catch (err) {
        console.log("拷贝文件失败：", err);
      }
    }
  }
};

/**
 * @description: 按顺序循环输出内容
 * @param {*} i 指定输出内容下标，在中途终止输出后可以继续输出终止内容
 */
const start = async (i) => {
  for (let index = i; index < questions.length; index++) {
    const question = questions[index].question;
    const id = questions[index].id;

    try {
      let answer = await questionFun(question);
      answer = answer.trim();
      // 校验是否为合法路径及目录
      if (
        (id === "targetDir" && !isValidDirectoryPath2(answer)) ||
        (id === "originalDir" && !isValidDirectoryPath(answer))
      ) {
        console.log("请输入合法的文件路径");
        start(index);
        return;
      }
      if (id === "endTime" && !timeReg.test(answer)) {
        console.log("请输入 YYYY-MM-DD 格式的日期格式");
        start(index);
        return;
      }
      if (id === "targetDir" && findOutput("originalDir") === answer) {
        console.log("目标目录不能与被复制目录一致");
        start(index);
        return;
      }
      questions[index].output = answer;

      // 全部问完之后关闭进程
      if (index === questions.length - 1) {
        rl.close();
      }
    } catch (err) {
      console.log(err, "errrrr");
      if (err === "输入为空") {
        console.log("请不要输入空值");
        start(index);
      }
      break;
    }
  }
  endTime = findOutput("endTime");
  originalDir = findOutput("originalDir");
  targetDir = findOutput("targetDir");
  copyFile("", targetDir, true);
  findFile(originalDir);
};

// start(0);

const fileInfo = fs.statSync("D:\\doumu\\trunk\\dm-conpoment-build\\src\\index");
console.log(fileInfo, fileInfo);

