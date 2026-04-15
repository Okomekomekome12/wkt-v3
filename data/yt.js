let trendList = [];
const MAX_TRENDS = 25;

function updateTrendList(newItem) {
  const existingIndex = trendList.findIndex(item => 
    item.videoId === newItem.videoId
  );
  if (existingIndex !== -1) {
    trendList.splice(existingIndex, 1);
  }
  trendList.unshift(newItem);
  if (trendList.length > MAX_TRENDS) {
    trendList.pop();
  }
}

function add(videoId, title, channelId, channelName, channelIcon, viewCount, uploadDate, durationraw) {
  const duration = (typeof durationraw === 'string' && durationraw.includes(":"))
  ? durationraw
  : Math.floor(durationraw / 60) + ":" + ("0" + (durationraw % 60)).slice(-2);
  updateTrendList({ videoId, title, channelId, channelName, channelIcon, viewCount, uploadDate, duration });
}

function get() {
  return trendList;
}

module.exports = {
  add,
  get
}