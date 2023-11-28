# Firefish Bot: Timed Image Noting

一个在Firefish上定时发送图片的bot。  
图片文件来自Firefish网盘，请将图片文件对应的id存在 list_image.json 中，Bot将依次发送，每次一张。

代码由GPT4帮助完善，参考[Firefish API 文档](https://firefish.social/api-doc)

## 必须步骤：

1. 填写 .env 文件。

ACCESS_TOKEN的获取方式：  
登录Bot账号，前往 https://你的实例域名/settings/api ，生成 Access Token 并复制内容。  
生成时需授予所需权限。

2. 规定运行时间。

修改 bot.js 的 `cronJob` 部分。

例：每天东京时间21:00:00和00:00:00发送一张图片。
```
"0 0 0,21 * * *",

"Asia/Tokyo"
```

3. 运行。

首先用 `npm install` 安装所需依赖。

默认使用pm2保护运行，请自行更改pm2.json中数值，之后切换到bot文件夹下执行：
```pm2 start pm2.json```

## 非必须步骤

### 向Firefish网盘上传文件

1. （可选）在Firefish网盘中创建文件夹。  
```nodejs newfolder.js```
获得的folderId会存在folderlist.json里，用于第三步上传时指定目标文件夹。

2. 向Firefish网盘上传文件。

请在 upload.js 中指定图片文件路径，默认为bot目录下的image文件夹。  
上传完毕的图片将被存入该路径下的uploaded子文件夹。上传结果将存入 list_file.json 。

如需指定文件夹，请修改upload.js中的 `folderId` 为步骤1得到的folderId，并取消注释。  
不指定文件夹的情况下，所有文件将默认上传至根目录。与账号设置的默认上传文件夹无关。

如需规定图片描述，请自定义修改upload.js中的 `comment` 部分并取消注释。

更多自定义内容请参考API文档中 drive/files/create 部分：https://firefish.social/api-doc#operation/drive/files/create

最后进行上传：  
```nodejs upload.js```

3. 创建 list_file.json 的副本 list_image.json ，用于 bot.js 读取。

### 自定义图片之外的贴文内容

修改 bot.js 的这个部分：
```
data: {
  visibility: "home",
  fileIds: fileIds
}
```

可自定义贴文可见性、文字内容等。  
具体请参考API文档中 notes/create 部分：https://firefish.social/api-doc#operation/notes/create
