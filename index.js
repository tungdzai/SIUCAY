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

// Login
async function login() {
    const apiUrl = "https://service.khuyenmaisiukay.vn/api/login";
    const data = {
        phone: "0562522127",
        password: "Hung2004@"
    };

    const headers = {
        'Authorization': 'Bearer 037ba9a37244375da8e4265ae8b7be3771085277a1325d79a40cd6c5b8b1d2e8bcf8564443e4e38557c42fcd0971f20b3356638febf9963ba81bf5159fcf625dc027d62472368c431d52ed8f2a8a2ca07ef5e119761deb923d377b7d8dac94a392d6facecc0d052e9fdf31f3a7822ce966bd092a4802d1e0b2b12952d0376da7'
    };

    try {
        const response = await axios.post(apiUrl, data, {headers});

        if (response.status === 200) {
            const id = response.data.data.id;
            const token = response.data.data.token;
            await checkGame({id: id, token: token});
        } else {
            console.log(`Mã lỗi: ${response.status}`);
        }
    } catch (error) {
        console.error(`Mã lỗi: ${error.message}`);
    }
}

// Check-game
async function checkGame({id, token}) {
    const apiUrl = "https://service.khuyenmaisiukay.vn/api/game/check-game";

    const headers = {
        'Authorization': 'Bearer 037ba9a37244375da8e4265ae8b7be3771085277a1325d79a40cd6c5b8b1d2e8bcf8564443e4e38557c42fcd0971f20b3356638febf9963ba81bf5159fcf625dc027d62472368c431d52ed8f2a8a2ca07ef5e119761deb923d377b7d8dac94a392d6facecc0d052e9fdf31f3a7822ce966bd092a4802d1e0b2b12952d0376da7'
    };
    const data = {
        id: id,
        token: token
    };

    try {
        const response = await axios.post(apiUrl, data, {headers});

        if (response.status === 200) {
            const logGameID = response.data.data.id;
            await postScoreGame({id, token, logGameID})
        } else {
            console.log(`Lỗi: ${response.status}`);
        }
    } catch (error) {
        console.error(`Lỗi: ${error.message}`);
    }
}
// post score game
async function postScoreGame({id, token, logGameID}) {
    const apiUrl = "https://service.khuyenmaisiukay.vn/api/game/post-score-game";

    const headers = {
        'Authorization': 'Bearer 037ba9a37244375da8e4265ae8b7be3771085277a1325d79a40cd6c5b8b1d2e8bcf8564443e4e38557c42fcd0971f20b3356638febf9963ba81bf5159fcf625dc027d62472368c431d52ed8f2a8a2ca07ef5e119761deb923d377b7d8dac94a392d6facecc0d052e9fdf31f3a7822ce966bd092a4802d1e0b2b12952d0376da7'
    };
    const score = 548;
    const data = {
        score: score,
        highScore: score,
        id: id,
        token: token,
        logGameID: logGameID,
    };
    const signature = encryptTripleDES(JSON.stringify(data), "70cf4fe7a75b72ddd78cbdb6");
    const dataEncode = {
        id: id,
        token: token,
        score: score,
        signature: signature
    };
    try {

        const response = await axios.post(apiUrl, dataEncode, {headers});

        if (response.status === 200) {
            // const listGift = response.data.data.gift;
            let itemID = 4;
            // for (const gift of listGift) {
            //     if (gift.is_can) {
            //         itemID = gift.id;
            //         break;
            //     }
            // }
            await postDoiQua({id, token, logGameID,itemID});
        } else {
            console.log(`Lỗi: ${response.status}`);
        }
    } catch (error) {
        console.error(`Lỗi: ${error.message}`);
    }
}
// post doi qua game
async function postDoiQua({ id, token, logGameID ,itemID}) {
    const apiUrl = "https://service.khuyenmaisiukay.vn/api/game/post-doi-qua-game";

    const headers = {
        'Authorization': 'Bearer 037ba9a37244375da8e4265ae8b7be3771085277a1325d79a40cd6c5b8b1d2e8bcf8564443e4e38557c42fcd0971f20b3356638febf9963ba81bf5159fcf625dc027d62472368c431d52ed8f2a8a2ca07ef5e119761deb923d377b7d8dac94a392d6facecc0d052e9fdf31f3a7822ce966bd092a4802d1e0b2b12952d0376da7'
    };

    const dataDoiQua = {
        id: id,
        token: token,
        logGameID: logGameID,
        itemID: itemID
    };
    const signatureGift= encryptTripleDES(JSON.stringify(dataDoiQua), "70cf4fe7a75b72ddd78cbdb6");
    const dataSignature={
        id:id,
        token:token,
        logGameID:logGameID,
        itemID:itemID,
        signature:signatureGift
    }
    try {
        const response = await axios.post(apiUrl, dataSignature, { headers });

        if (response.status === 200) {
            console.log(JSON.stringify(response.data));
        } else {
            console.log(`Mã lỗi: ${response.status}`);
        }
    } catch (error) {
        console.error(`Lỗi: ${error.message}`);
    }
}
login();
// let loginAttempts = 0;
// const maxLoginAttempts = 3;
// const loginInterval = setInterval(() => {
//     login();
//     loginAttempts++;
//     if (loginAttempts >= maxLoginAttempts) {
//         clearInterval(loginInterval);
//     }
// }, 5000);
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});



