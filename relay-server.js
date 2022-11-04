const express = require('express');
const app = express();

const GUN = require('gun')

const cors = require('cors');

const secrets = require("secret-sharing.js");
const { json } = require('express');


const port = (process.env.PORT || 6100);

const gunInstance = GUN({radisk: true, localStorage: true});

app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST"]
}))

app.use(express.json())

app.use(GUN.serve);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/secret', async (req, res)=>{
  let jsonKey = req.body.JSONKey; // parsedExportedKey
  //Parse the shareHolders and teamRoomSEA property-object to their initial format (object)
  let parsedShareHoldersObject = JSON.parse(req.body.shareHolders); // share holders
  let parsedSEARoom = JSON.parse(req.body.teamRoomSEA); //SEA.pair() of the team room / group
  let filename = req.body.filename;
  let fileNameNoWhiteSpace = req.body.fileNameNoWhiteSpace;
  let teamRoomUUID = req.body.teamRoomUUIDActual;

  let hexedExportedKey = secrets.str2hex(jsonKey);

  let allShares = secrets.share(hexedExportedKey, 5, 3);

  //Get current date
  let dateJSON = new Date().toJSON();

  //HOLDER 1
  console.log("TESTING CONSOLE");
  console.log(allShares[0]);
  console.log(parsedShareHoldersObject.holder1.memberEpub);
  console.log(parsedSEARoom);
  let secretKey1 = await GUN.SEA.secret(parsedShareHoldersObject.holder1.memberEpub, parsedSEARoom);
  console.log(secretKey1);
  let encryptedShare1 = await GUN.SEA.encrypt(allShares[0], secretKey1);
  console.log(encryptedShare1);
  let parsedEncryptedShare1 = JSON.stringify(encryptedShare1);
  console.log(parsedEncryptedShare1);

  //Individual and unique node containing the encrypted share
  await gunInstance.get(`${parsedShareHoldersObject.holder1.memberAlias}_${fileNameNoWhiteSpace}_${dateJSON}_${teamRoomUUID}`).put({
    filename: filename,
    teamRoomUUID: teamRoomUUID,
    encryptedShare: parsedEncryptedShare1
  })
  let nodeRef1 = await gunInstance.get(`${parsedShareHoldersObject.holder1.memberAlias}_${fileNameNoWhiteSpace}_${dateJSON}_${teamRoomUUID}`)
  //Public node that holder1 reads
  await gunInstance.get(`${parsedShareHoldersObject.holder1.memberAlias}_shareListNodeSet`).set(nodeRef1);

  //HOLDER 2
  let secretKey2 = await GUN.SEA.secret(parsedShareHoldersObject.holder2.memberEpub, parsedSEARoom);
  let encryptedShare2 = await GUN.SEA.encrypt(allShares[1], secretKey2);
  let parsedEncryptedShare2 = JSON.stringify(encryptedShare2);

  //Individual and unique node containing the encrypted share
  await gunInstance.get(`${parsedShareHoldersObject.holder2.memberAlias}_${fileNameNoWhiteSpace}_${dateJSON}_${teamRoomUUID}`).put({
    filename: filename,
    teamRoomUUID: teamRoomUUID,
    encryptedShare: parsedEncryptedShare2
  })
  let nodeRef2 = await gunInstance.get(`${parsedShareHoldersObject.holder2.memberAlias}_${fileNameNoWhiteSpace}_${dateJSON}_${teamRoomUUID}`)
  //Public node that holder2 reads
  await gunInstance.get(`${parsedShareHoldersObject.holder2.memberAlias}_shareListNodeSet`).set(nodeRef2);
    

  //HOLDER 3
  let secretKey3 = await GUN.SEA.secret(parsedShareHoldersObject.holder3.memberEpub, parsedSEARoom);
  let encryptedShare3 = await GUN.SEA.encrypt(allShares[2], secretKey3);
  let parsedEncryptedShare3 = JSON.stringify(encryptedShare3);

  //Individual and unique node containing the encrypted share
  await gunInstance.get(`${parsedShareHoldersObject.holder3.memberAlias}_${fileNameNoWhiteSpace}_${dateJSON}_${teamRoomUUID}`).put({
    filename: filename,
    teamRoomUUID: teamRoomUUID,
    encryptedShare: parsedEncryptedShare3
  })

  let nodeRef3 = await gunInstance.get(`${parsedShareHoldersObject.holder3.memberAlias}_${fileNameNoWhiteSpace}_${dateJSON}_${teamRoomUUID}`)
  //Public node that holder3 reads
  await gunInstance.get(`${parsedShareHoldersObject.holder3.memberAlias}_shareListNodeSet`).set(nodeRef3);


  res.send({ResponseMessage: "Secret Sharing Procedure complete"});
})

const relayServer = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  
})

GUN({web: relayServer});
