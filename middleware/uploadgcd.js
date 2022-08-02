const fs = require('fs').promises;
const { Readable } = require('stream');
const readline = require('readline');
const { google } = require('googleapis');
const AppError = require('../utils/appError');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';
const f = require('fs');
const renameImage = (file) => `${Date.now()}-${file.name}`;

async function authorize(callback, file, path) {
  const client_secret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const client_id = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const redirect_uris = process.env.GOOGLE_DRIVE_REDIRECT_URI;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

  try {
    // Check if we have previously stored a token.
    let token = await fs.readFile(TOKEN_PATH);

    oAuth2Client.setCredentials(JSON.parse(token));
    return await callback(oAuth2Client, file, path);
  } catch (err) {
    console.log('token file not exist', err);
    return await getAccessToken(oAuth2Client, callback, file, path);
  }
}

async function getAccessToken(oAuth2Client, callback, file, path) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  await rl.question('Authorize this app by visiting this url:', async (code) => {
    rl.close();
    try {
      let token = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          console.error(err);
        }
        console.log('Token stored to', TOKEN_PATH);
      });
      return await callback(oAuth2Client, file, path);
    } catch (err) {
      console.error('Error from getAccessToken', err);
      return {
        success: false,
        message: 'Error! ' + err.message,
      };
    }
  });
}

async function uploadFile(auth, fileObj, path) {
  const drive = google.drive({ version: 'v3', auth });
  let fileName = renameImage(fileObj);

  //console.log(fileObj);
  const fileMetadata = {
    name: fileName,
    mimeType: fileObj.mimetype,
    parents: [process.env.GOOGLE_DRIVE_FolderID],
  };
  const media = {
    mimeType: fileObj.mimetype,
    // body: fs.createReadStream(
    //   'public/files/1659027890312-1658958233505-16th July HeatMap (1) (1).xlsx'
    // ),
    //body:  fs.createReadStream(fileObj),
    body: Readable.from(fileObj.data),
  };
  try {
    let file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      //fields: 'id',
    });
    console.log('File Id: ', file.data);
    return await generatePublicURL(auth, file.data.id, fileName);
  } catch (err) {
    console.error(err, 'Error in Saving file');
    return {
      success: false,
      message: 'Fail to Save file',
    };
  }
}

// authorize(
//   {
//     client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
//     client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
//     redirect_uris: process.env.GOOGLE_DRIVE_REDIRECT_URI,
//   },
//   uploadFile
// );
async function generatePublicURL(auth, fileId, fileName) {
  try {
    const drive = google.drive({ version: 'v3', auth });
    let res = await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    console.log(res.data);
    const result = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink, webContentLink',
    });
    return {
      success: true,
      data: {
        fileId: fileId,
        file: result.data.webViewLink,
        webContentLink: result.data.webContentLink,
        fileName,
      },
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: 'Error making file public',
    };
  }
}

module.exports = (key, path) => {
  return async (req, res, next) => {
    if (!req.files || !req.files[key]) {
      return next();
    }
    let response = await authorize(uploadFile, req.files[key], path);
    console.log('response', response);
    if (response && response.success) {
      req[key] = response.data;
      return next();
    }
    next(new AppError('Error in Uploading Image.', 500));
  };
};
