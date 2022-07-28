const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question(
    '4/0AdQt8qjqc5cDOqZ3K19P-NITbYkJdbf23HJK8100Plqp-rIqV1S3rNAk2K5JyxOkFvMlhQ',
    (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    }
  );
}

function uploadFile(auth) {
  const drive = google.drive({ version: 'v3', auth });
  const fileMetadata = {
    name: 'test.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.shee',
  };
  const media = {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.shee',
    body: fs.createReadStream(
      'public/files/1659027890312-1658958233505-16th July HeatMap (1) (1).xlsx'
    ),
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
      } else {
        console.log('File Id: ', file.data);
        generatePublicURL(auth, file.data.id);
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
    console.log(result.data);
  } catch (err) {}
}
