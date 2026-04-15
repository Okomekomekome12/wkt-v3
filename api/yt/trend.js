const trend = require('../../data/yt');

module.exports = async function handler(req, res) {
  try {
    const rawResults = trend.get();
    const formattedResults = rawResults.map(item => {
      return {
        id: item.videoId || null,
        title: item.title || "タイトル",
        author: {
          name: item.channelName || "不明なユーザー",
          id: item.channelId || null,
          thumbnail: item.channelIcon || ""
        },
        thumbnail: `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`,
        duration: item.duration,
        published: item.uploadDate || "",
        view_count: item.viewCount || "0回視聴"
      };
    });

    res.status(200).json({
      status: 'success',
      data: formattedResults
    });
  } catch (error) {
    console.error("Trend API Error:", error);
    res.status(500).json({
      status: 'error',
      data: []
    });
  }
};