const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

const renameImage = (file) => `${Date.now()}-${file.name}`;

async function authorize(callback, file, path) {
  const client_secret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const client_id = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const redirect_uris = process.env.GOOGLE_DRIVE_REDIRECT_URI;

  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback, file, path);
    oAuth2Client.setCredentials(JSON.parse(token));
    return callback(oAuth2Client, file, path);
  });
}

function getAccessToken(oAuth2Client, callback, file, path) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Authorize this app by visiting this url:', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err);
        return {
          success: false,
          message: 'Error retrieving access token',
        };
      }
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) {
          console.error(err);
          return {
            success: false,
            message: 'Error saving access token',
          };
        }
        console.log('Token stored to', TOKEN_PATH);
        return callback(oAuth2Client, file, path);
      });
    });
  });
}

function uploadFile(auth, file, path) {
  const drive = google.drive({ version: 'v3', auth });
  let fileName = renameImage(file);

  const fileMetadata = {
    name: fileName,
    mimeType: file.type,
  };
  const media = {
    mimeType: file.type,
    // body: fs.createReadStream(
    //   'public/files/1659027890312-1658958233505-16th July HeatMap (1) (1).xlsx'
    // ),
    body: file.data,
  };
  drive.files.create(
    {
      requestBody: fileMetadata,
      media: media,
      //fields: 'id',
    },
    (err, file) => {
      if (err) {
        // Handle error
        console.error(err);
        return {
          success: false,
          message: 'Fail to Save file',
        };
      } else {
        console.log('File Id: ', file.data);
        return generatePublicURL(auth, file.data.id);
      }
    }
  );
}

// authorize(
//   {
//     client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
//     client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
//     redirect_uris: process.env.GOOGLE_DRIVE_REDIRECT_URI,
//   },
//   uploadFile
// );
async function generatePublicURL(auth, fileId) {
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
        //webContentLink: result.data.webContentLink,
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
    console.log(response);
    if (response.status) {
      req[key] = response.data;
      return next();
    }
    next(new AppError('Error in Updloading Image.', 500));
  };
};
