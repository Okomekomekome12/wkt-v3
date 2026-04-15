const axios = require("axios");

async function get() {
    try {
      const response = await axios.get("https://raw.githubusercontent.com/siawaseok3/wakame/master/video_config.json");
      if (response.data) {
         return response.data.params;
      }
    } catch (error) {
      console.log(`ytedu: ${error.message}`);
    }
  throw new Error('必要なデータを取得できませんでした。');
}

module.exports = {
   get
};