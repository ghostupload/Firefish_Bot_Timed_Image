require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const API_URL = process.env.API_URL; // 从 .env 文件加载
const folderPath = './images'; // 请设置图片文件夹路径
const filelistPath = 'list_file.json'; // 上传结果记录在 list_file.json 里
const uploadedFolderPath = path.join(folderPath, 'uploaded'); // 上传过的图片存放于此

// 读取现有的 list_folder.json，如果不存在则初始化为空数组
const filelist = fs.existsSync(filelistPath) ? JSON.parse(fs.readFileSync(filelistPath, 'utf8')) : [];

// 确保 uploaded 文件夹存在，如果不存在则创建
if (!fs.existsSync(uploadedFolderPath)) {
  fs.mkdirSync(uploadedFolderPath);
}

// 记录 log
const logStream = fs.createWriteStream('upload.log', { flags: 'a' });

async function uploadFile(filePath) {
  const formData = new FormData();
  const fileName = path.basename(filePath);
  formData.append('file', fs.createReadStream(filePath));
  // formData.append('folderId', '123456');
  // formData.append('comment', fileName.substring(0, 8)); // 采用文件名前8位作为图片描述

  try {
    const response = await axios({
      method: 'post',
	  url: `${API_URL}/drive/files/create`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        ...formData.getHeaders(),
      },
      data: formData
    });

    if (response.status === 200) {
      const fileData = response.data;
      filelist.push({ name: fileData.name, id: fileData.id, comment: fileData.comment, url: fileData.url }); // list_file.json 中所记录内容
      logStream.write(`Uploaded: ${fileData.name} - ${fileData.id}\n`);
	  console.log("Uploaded successfully!"); 
	  const newFilePath = path.join(uploadedFolderPath, fileName);
      fs.renameSync(filePath, newFilePath);
      logStream.write(`Moved: ${fileName} to ${newFilePath}\n`);
    } else {
      logStream.write(`Error uploading ${fileName}: ${response.status}\n`);
	  console.log("Failed to upload ${fileName}."); 
    }
  } catch (error) {
    logStream.write(`Error uploading ${fileName}: ${error}\n`);
	console.log("Error!");
  }
}

async function uploadFiles() {
  // 先获取目录下的所有文件和文件夹
  const allEntries = fs.readdirSync(folderPath);

  // 然后过滤出文件
  const files = allEntries.filter(file => {
    const fullPath = path.join(folderPath, file);
    return fs.lstatSync(fullPath).isFile();
  });

  for (const file of files) {
    await uploadFile(path.join(folderPath, file));
  }

  fs.writeFileSync(filelistPath, JSON.stringify(filelist, null, 2));
  logStream.end();
}

uploadFiles();