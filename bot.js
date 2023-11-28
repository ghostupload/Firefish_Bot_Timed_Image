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

const logStream = fs.createWriteStream('bot.log', { flags: 'a' });

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
      data: {
        visibility: "home",
        fileIds: fileIds
      }
    });
  
  // API 请求成功
  if (response.status === 200) {
    const noteId = response.data.createdNote.id;
    const noteUrl = `${INSTANCE_URL}/notes/${noteId}`;
	const createdAt = response.data.createdNote.createdAt;
	const imageName = image.name;
	
    logStream.write(`${createdAt}\nFile:${imageName}\nURL:${noteUrl}\n`);
	
	// 更新 list_image.json
    fs.writeFileSync(imagelistPath, JSON.stringify(imagelist, null, 2));
    
	// Note详情记录到 list_bot_notes.json
	// 可自行修改所需内容
    const botNotes = fs.existsSync(botNotesPath) ? JSON.parse(fs.readFileSync(botNotesPath, 'utf8')) : [];
    botNotes.push({
      id: noteId,
      createdAt: createdAt,
      url: noteUrl,
      imageName: imageName,
      imageId: image.id,
      imageComment: image.comment,
      imageUrl: image.url
    });
    fs.writeFileSync(botNotesPath, JSON.stringify(botNotes, null, 2));
	} else {
      logStream.write(`Error creating note: Status - ${response.status}, Response - ${JSON.stringify(response.data)}\n`);
    }
  } catch (error) {
    logStream.write(`Error making API request: ${error}\n`);
  }
}