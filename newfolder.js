require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const readline = require('readline');

const API_URL = process.env.API_URL;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN; // 从 .env 文件加载
const newfolderPath = 'list_folder.json';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter the name of the folder to create: ', function (folderName) {
  createFolder(folderName);
  rl.close();
});

// 读取现有的 list_folder.json，如果不存在则初始化为空数组
const newfolders = fs.existsSync(newfolderPath) ? JSON.parse(fs.readFileSync(newfolderPath, 'utf8')) : [];

async function createFolder(folderName) {
  try {
    const response = await axios({
      method: 'post',
      url: `${API_URL}/drive/folders/create`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      data: {
        name: folderName
      }
    });

    if (response.status === 200) {
      const folderData = {
        name: response.data.name,
        id: response.data.id
      };
      newfolders.push(folderData);
      fs.writeFileSync(newfolderPath, JSON.stringify(newfolders, null, 2));
      console.log(`Folder created: ${folderData.name} (ID: ${folderData.id})`);
    } else {
      console.error('Error creating folder:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}