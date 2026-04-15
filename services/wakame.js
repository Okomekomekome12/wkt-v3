const axios = require('axios');

let apis = null;
let isFetchingInv = false;

const MAX_API_WAIT_TIME = 3000;
const MAX_TIME = 10000;

async function getapisgit() {
  if (isFetchingInv || apis) return;
  isFetchingInv = true;
  try {
    const response = await axios.get('https://raw.githubusercontent.com/wakame02/wktopu/refs/heads/main/inv.json');
    apis = response.data;
  } catch (e) {} finally { isFetchingInv = false; }
}

async function ggvideo(videoId) {
  if (!apis) await getapisgit();
  if (!apis || !Array.isArray(apis)) throw new Error()
  for (const instance of apis.slice(0, 5)) {
    try {
      const response = await axios.get(`${instance}/api/v1/videos/${videoId}`, { timeout: MAX_API_WAIT_TIME });
      if (response.data && response.data.formatStreams) return response.data;
    } catch (e) { continue; }
  }
  throw new Error();
}

async function getYouTube(videoId) {
  const videoInfo = await ggvideo(videoId);
  const formatStreams = videoInfo.formatStreams || [];
  const streamUrl = formatStreams.reverse().map(stream => stream.url)[0];
  const audioStreams = videoInfo.adaptiveFormats || [];

  const highstreamUrl = audioStreams
    .find(s => s.container === 'webm' && s.resolution === '1080p')?.url || null;

  const audioUrl = audioStreams.find(s => s.container === 'm4a' && s.audioQuality === 'AUDIO_QUALITY_MEDIUM')?.url || '';

  const streamUrls = audioStreams
    .filter(s => s.container === 'webm' && s.resolution)
    .map(s => ({ url: s.url, resolution: s.resolution }));

  if (!streamUrl) throw new Error();
  return { stream_url: streamUrl, highstreamUrl, audioUrl, streamUrls };
}

async function getSiaTube(videoId) {
  const response = await axios.get(`https://siawaseok.f5.si/api/streams/${videoId}`, { timeout: MAX_TIME });
  const formats = response.data.formats || (Array.isArray(response.data) ? response.data : []);

  const streamUrl = formats.find(s => String(s.itag) === '18')?.url || 
                    formats.find(s => s.vcodec !== 'none' && s.acodec !== 'none')?.url;

  const audioUrl = formats.find(s => String(s.itag) === '251')?.url || 
                   formats.find(s => s.resolution === 'audio only' && s.ext === 'webm')?.url || '';

  const highstreamUrl = formats
    .filter(s => s.vcodec !== 'none' && s.ext === 'webm')
    .sort((a, b) => (parseInt(b.resolution) || 0) - (parseInt(a.resolution) || 0))[0]?.url || null;

  const streamUrls = formats
    .filter(s => s.vcodec !== 'none' && s.resolution && s.resolution !== 'audio only')
    .map(s => {
      let res = s.resolution;
      if (typeof res === 'string' && res.includes('x')) res = res.split('x')[1] + 'p';
      else if (typeof res === 'string' && !res.endsWith('p')) res = res + 'p';
      return { url: s.url, resolution: res };
    });

  if (!streamUrl) throw new Error();
  return { stream_url: streamUrl, highstreamUrl, audioUrl, streamUrls };
}

async function getYuZuTube(videoId) {
  const response = await axios.get(`https://yudlp.vercel.app/stream/${videoId}`, { timeout: MAX_TIME });
  const formats = response.data.formats || (Array.isArray(response.data) ? response.data : []);

  const streamUrl = formats.find(s => String(s.itag) === '18')?.url || 
                    formats.find(s => s.ext === 'mp4' && s.resolution !== 'audio only')?.url;

  const audioUrl = formats.find(s => String(s.itag) === '251')?.url || 
                   formats.find(s => s.resolution === 'audio only' && s.ext === 'webm')?.url || '';

  const highstreamUrl = formats
    .filter(s => s.ext === 'webm' && s.resolution !== 'audio only')
    .sort((a, b) => (parseInt(b.resolution?.split('x')[1]) || parseInt(b.resolution) || 0) - (parseInt(a.resolution?.split('x')[1]) || parseInt(a.resolution) || 0))[0]?.url || null;

  const streamUrls = formats
    .filter(s => s.resolution && s.resolution !== 'audio only')
    .map(s => {
      let res = s.resolution;
      if (typeof res === 'string' && res.includes('x')) res = res.split('x')[1] + 'p';
      else if (typeof res === 'string' && !res.endsWith('p')) res = res + 'p';
      return { url: s.url, resolution: res };
    });

  if (!streamUrl) throw new Error();
  return { stream_url: streamUrl, highstreamUrl, audioUrl, streamUrls };
}

async function getKatuoTube(videoId) {
  try {
    const response = await axios.get(`https://ytdlpinstance-vercel.vercel.app/stream/${videoId}`, { timeout: MAX_TIME });
    const formats = Array.isArray(response.data) ? response.data : (response.data.formats || []);

    const streamUrl = formats.find(s => String(s.itag) === '18')?.url || 
                      formats.find(s => s.vcodec !== 'none' && s.acodec !== 'none')?.url;

    const audioUrl = formats.find(s => String(s.itag) === '251')?.url || 
                     formats.find(s => s.resolution === 'audio only' && s.ext === 'webm')?.url || '';

    const highstreamUrl = formats
      .filter(s => s.vcodec !== 'none' && s.ext === 'webm')
      .sort((a, b) => (parseInt(b.resolution?.toString().split('x')[1]) || parseInt(b.resolution) || 0) - 
                      (parseInt(a.resolution?.toString().split('x')[1]) || parseInt(a.resolution) || 0))[0]?.url || null;

    const streamUrls = formats
      .filter(s => s.resolution && s.resolution !== 'audio only')
      .map(s => {
        let res = s.resolution;
        if (typeof res === 'string' && res.includes('x')) res = res.split('x')[1] + 'p';
        else if (typeof res === 'string' && !res.endsWith('p')) res = res + 'p';
        return { url: s.url, resolution: res };
      });

    if (!streamUrl) throw new Error();

    return { stream_url: streamUrl, highstreamUrl, audioUrl, streamUrls };
  } catch (e) {
    throw new Error();
  }
}

async function get(videoId) {
  try {
  return await Promise.any([
    getYouTube(videoId),
    getSiaTube(videoId),
    getYuZuTube(videoId),
    getKatuoTube(videoId)
  ]);
  } catch (error) {
    if (error instanceof AggregateError) {
      console.error("DEBUG: All promises rejected.");
      error.errors.forEach((e, i) => {
        console.error(`  Error ${i}:`, e.stack || e);
      });
    } else {
      console.error("DEBUG: Unexpected Error:", error);
    }
  }
}

module.exports = { 
  get,
  getYouTube,
  getSiaTube,
  getYuZuTube,
  getKatuoTube
};