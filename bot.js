require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const cronJob = require('cron').CronJob;

const API_URL = process.env.API_URL;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const imagelistPath = 'list_image.json';
const botNotesPath = 'list_bot_notes.json';

// 定时任务
new cronJob(
  "0 0 0,21 * * *",
  function dailynotes() {
    notescreate()
      .then(response => console.log(response))
      .catch(error => console.error(error));
  },
  null,
  true,
  "Asia/Tokyo"
);

// 测试时使用：直接调用 notescreate 函数进行测试
// notescreate()
  // .then(response => console.log(response))
  // .catch(error => console.error(error));

async function notescreate() {
  // 读取 list_image.json
  const imagelist = JSON.parse(fs.readFileSync(imagelistPath, 'utf8'));
  if (imagelist.length === 0) {
    throw new Error('No images available.');
  }

  // 获取第一张图片
  const image = imagelist.shift();
  const fileIds = [image.id];

  // 调用 notes/create API
  let response;
  try {
    response = await axios({
      method: 'post',
      url: `${API_URL}/notes/create`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
	  // 请按需修改data部分，默认可见性为首页可见。
      // 请参考官方API文档中notes/create部分。
      data: {
        visibility: "home",
        fileIds: fileIds
      }
    });
  } catch (error) {
    console.error('Error making API request:', error);
    return;
  }

  // 更新 list_image.json
  fs.writeFileSync(imagelistPath, JSON.stringify(imagelist, null, 2));

  // 记录发送结果到 list_bot_notes.json
  // 可自行修改所需内容
  const botNotes = fs.existsSync(botNotesPath) ? JSON.parse(fs.readFileSync(botNotesPath, 'utf8')) : [];
  botNotes.push({
    id: response.data.createdNote.id,
    createdAt: response.data.createdNote.createdAt,
    imageName: image.name,
    imageId: image.id,
    imageComment: image.comment,
    imageUrl: image.url
  });
  fs.writeFileSync(botNotesPath, JSON.stringify(botNotes, null, 2));

  return response.data;
}