const express = require("express");
const CryptoJS = require("crypto-js");
const app = express();
const port = 3001;
const axios = require('axios');
function getValidKey(key) {
    let sTemp;
    if (key.length > 24) {
        sTemp = key.substring(0, 24);
    } else {
        sTemp = key;
        while (sTemp.length !== 24) {
            sTemp += " ";
        }
    }
    return CryptoJS.enc.Utf8.parse(sTemp);
}

function getValidIV(InitVector, ValidLength) {
    let sTemp;
    if (InitVector.length > ValidLength) {
        sTemp = InitVector.substring(0, ValidLength);
    } else {
        sTemp = InitVector;
        while (sTemp.length !== ValidLength) {
            sTemp += " ";
        }
    }
    return CryptoJS.enc.Utf8.parse(sTemp);
}

const encryptTripleDES = (softpin, softpinKey) => {
    const key = getValidKey(softpinKey);
    const iv = getValidIV(softpinKey, 8);
    const encrypted = CryptoJS.TripleDES.encrypt(softpin, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
};

const decryptTripleDES = (encryptedSoftpin, softpinKey) => {
    const key = getValidKey(softpinKey);
    const iv = getValidIV(softpinKey, 8);
    // Sử dụng trực tiếp chuỗi Base64 của dữ liệu được mã hóa
    const decrypted = CryptoJS.TripleDES.decrypt(encryptedSoftpin, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8); // Chuyển đổi kết quả giải mã về dạng chuỗi Utf8
};

const data = {
    score: 500,
    highScore: 500,
    id: 625,
    token: "9a052ef4cdc1fbcd35fbda61cd269f92",
    logGameID: 4204,
};
// //encode
console.log(
    "============ encode =========\n",
    encryptTripleDES(JSON.stringify(data), "70cf4fe7a75b72ddd78cbdb6"),
    "\n================================="
);

// const dataDoiQua = {
//     id: 361,
//     token: "2cfbe107d420c5c73ea02b4a431f52a1",
//     logGameID: 3356,
//     itemID: 4
// };
// console.log(
//     "============ encode =========\n",
//     encryptTripleDES(JSON.stringify(dataDoiQua), "70cf4fe7a75b72ddd78cbdb6"),
//     "\n================================="
// );

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});