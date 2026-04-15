let client = null;
const ytsr = require("ytsr");
const axios = require("axios");
const ytdata = require("../data/yt");

function setClient(newClient) {
  client = newClient;
}

async function infoGet(id) {
  try {
    const info = await client.getInfo(id);
    const basic = info?.basic_info;
    const secondaryInfo = info?.secondary_info;
    const relatedVideos = (info?.watch_next_feed ?? [])
      .map(item => {
        const overlays = item.content_image?.overlays || [];
        const metadataRows = item.metadata?.metadata?.metadata_rows || [];
        const videoId = item.renderer_context?.command_context?.on_tap?.payload?.videoId || "";
        const playlistId = item.renderer_context?.command_context?.on_tap?.payload?.playlistId || "";

        if (!videoId) return null;

        return {
          videoId: videoId,
          playlistId: playlistId,
          title: item.metadata?.title?.text || "",
          channelName: metadataRows[0]?.metadata_parts?.[0]?.text?.text || "",
          thumbnail: `/wkt/back/vi/${videoId}/mqdefault.jpg`,
          badgeText: overlays[0]?.badges?.[0]?.text || "",
          viewCountText: metadataRows[1]?.metadata_parts?.[0]?.text?.text || "",
          publishedText: metadataRows[1]?.metadata_parts?.[1]?.text?.text || ""
        };
      })
      .filter(v => v !== null);

    ytdata.add(id, basic?.title ?? null, basic?.channel_id ?? null, basic?.author ?? null, secondaryInfo?.owner?.author?.thumbnails?.[0]?.url ?? null, basic?.view_count ?? null, info?.primary_info?.published?.text ?? null, basic?.duration ?? null);

    return {
      title: info.primary_info?.title?.text || info.basic_info?.title || "",
      channelId: info.secondary_info?.owner?.author?.id || info.basic_info?.channel_id || "",
      channelIcon: info.secondary_info?.owner?.author?.thumbnails?.[0]?.url || "",
      channelName: info.secondary_info?.owner?.author?.name || info.basic_info?.author || "",
      channelSubsc: info.secondary_info?.owner?.subscriber_count?.text || "",
      viewCount: info.primary_info?.view_count?.short_view_count?.text || info.basic_info?.view_count || "",
      likeCount: info.primary_info?.menu?.top_level_buttons?.short_like_count || info.basic_info?.like_count || "",
      uploadDate: info.primary_info?.published?.text || "",
      description: info.secondary_info?.description?.text || info.basic_info?.short_description || "",
      duration: info.basic_info?.duration || "",
      relatedVideos: relatedVideos
    };
  } catch (error) {
    console.error("infoGet Error:", error);
    return null;
  }
}

async function nextfeed(videoId) {
  try {
    const info = await client.getInfo(videoId);
    const watchNextFeed = info?.watch_next_feed ?? [];

    return watchNextFeed.map(item => {
      const metadata = item.metadata;
      const contentImage = item.content_image;
      if (!metadata || !contentImage) return null;

      const vId = item.content_id;
      if (!vId || item.content_type !== "VIDEO") return null;
      const durationBadge = contentImage.overlays?.find(o => o.type === "ThumbnailBottomOverlayView")
        ?.badges?.find(b => b.type === "ThumbnailBadgeView");
      const duration = durationBadge?.text || "0:00";

      const rows = metadata.metadata?.metadata_rows || [];

      const channelName = rows[0]?.metadata_parts?.[0]?.text?.text || "不明なユーザー";
      const statsRow = rows[1]?.metadata_parts || [];
      const viewCountText = statsRow[0]?.text?.text || "0回視聴";
      const publishedText = statsRow[1]?.text?.text || "";

      const channelId = metadata.image?.renderer_context?.command_context?.on_tap?.payload?.browseId || "";
      return {
        id: vId,
        title: metadata.title?.text || "タイトルなし",
        author: {
          name: channelName,
          id: channelId,
          thumbnail: metadata.image?.avatar?.image?.[0]?.url || ""
        },
        thumbnail: `/wkt/back/vi/${vId}/mqdefault.jpg`,
        duration: duration,
        published: publishedText,
        view_count: viewCountText
      };
    })
    .filter(v => v !== null);

  } catch (error) {
    console.error(`[Related Error] videoId: ${videoId}`, error);
    return [];
  }
}

async function search(q, page) {
  if (!q) return;
  try {
    return(await client.search(q, {type: "all"}));
  } catch (error) {
    return null;
  }
}

async function search2(q, page) {
  if (!q) return null;
  try {
    return await ytsr(q, {
      pages: page,
      requestOptions: {
        headers: {
          'Accept-Language': 'ja-JP,ja;q=0.9',
        }
      }
    });
  } catch (error) {
    console.error("ytsr Error:", error);
    return null;
  }
}

async function searchjson(q, page) {
  if (!q) return null;
  try {
    const searchResults = await client.search(q, { type: "video" });
    const filteredVideos = searchResults.results
      .filter(item => item.type === 'Video')
      .map(item => {
        return {
          id: item.id,
          title: item.title?.text || "タイトル",
          author: {
            name: item.author?.name || "不明なユーザー",
            id: item.author?.id,
            thumbnail: item.author?.thumbnails?.[0]?.url || ""
          },
          thumbnail: item.thumbnails?.[0]?.url || "",
          duration: item.duration?.text || "0:00",
          published: item.published?.text || "",
          view_count: item.short_view_count?.text || "0回視聴"
        };
      });

    return { results: filteredVideos };
  } catch (error) {
    console.error("Search Error:", error);
    return { results: [] };
  }
}

async function getComments(id) {
  if (!id) return null;
  try {
    const cm = await client.getComments(id);
    return (cm?.contents ?? [])
      .filter(c => c.comment)
      .map(c => ({
        authorIcon: c.comment?.author?.thumbnails?.[0]?.url ?? null,
        authorId: c.comment?.author?.id ?? null,
        authorName: c.comment?.author?.name ?? null,
        text: c.comment?.content?.text ?? null,
      }));
  } catch (error) {
    return null;
  }
}

async function getChannel(id) {
  try {
    const channel = await client.getChannel(id);
    let recentVideos = null;
    try {
      recentVideos = await channelfeed(id);
    } catch (err) {
      console.error(err);
    }

    return({channel, recentVideos});
  } catch (error) {
    return null;
  }
}

async function channelfeed(channelId) {
  try {
    const channel = await client.getChannel(channelId);
    const videosFeed = await channel.getVideos();
    const videos = videosFeed.videos || [];

    return videos.map((video) => {
      const vId = video.video_id;

      return {
        id: vId,
        title: video.title?.text || "タイトルなし",
        author: {
          name: channel.name,
          id: channelId,
          thumbnail: channel.thumbnails?.[0]?.url || ""
        },
        thumbnail: `/wkt/back/vi/${vId}/mqdefault.jpg`,
        duration: video.length_text?.text || "",
        published: video.published?.text || "",
        view_count: video.view_count?.text || ""
      };
    });
  } catch (error) {
    console.error("エラーが発生しました:", error);
    return [];
  }
}

async function RSSchannel(channelId) {
  const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  try {
    const { data: xml } = await axios.get(RSS_URL, { timeout: 5000 });
    const entries = xml.split('<entry>').slice(1);
    return entries.map(entry => {
      const extract = (regex) => {
        const match = entry.match(regex);
        return match ? match[1] : "";
      };

      const videoId = extract(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const title = extract(/<title>(.*?)<\/title>/);
      const authorName = extract(/<name>(.*?)<\/name>/);
      const published = extract(/<published>(.*?)<\/published>/);
      const viewsMatch = entry.match(/views="(\d+)"/);
      const views = viewsMatch ? parseInt(viewsMatch[1]) : 0;
      const shortViewCount = views >= 10000 
        ? `${(views / 10000).toFixed(1)}万回視聴` 
        : `${views.toLocaleString()}回視聴`;

      return {
        id: videoId,
        title: title,
        author: {
          name: authorName,
          id: channelId,
          thumbnail: ""
        },
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, 
        duration: "0:00",
        published: published,
        view_count: shortViewCount
      };
    });
  } catch (error) {
    console.error(`[RSS Error] ${channelId}:`, error.message);
    return [];
  }
}

async function GASchannel(id) {
  const apis = ['https://script.google.com/macros/s/AKfycbwwNSpZpX-uknJSyqAUp8RUM2dyEiG60kJcgyjCQmNFM8Hcx2Z5ZvhFD5ySO76YGIuksg/exec',
                'https://script.google.com/macros/s/AKfycbxWCk8SkgN9rAYB_lY_0qflsob_gYIa_pKQ_xGL02zROyVX8ZPrMbD6b3BRoEhtWW5Mng/exec',
                'https://script.google.com/macros/s/AKfycbyd7O2axD0W7Efm-oaUN3kBv93iMEqJ-24yrIIZkv2DcV3WvMe_KueGbo516qy1i2Cd/exec'
  ];
  for (const instance of apis) {
    try {
      const response = await axios.get(`${instance}?channelId=${id}`, { timeout: 10000 });

      if (response.status === 200 && response.data) {
        return response.data.results; 
      } else {
        console.error(`GASからの読み込みエラー: ${instance}`);
      }
    } catch (error) {
      console.error(`エラーだよ: ${instance} - ${error.message}`);
      instanceErrors.add(instance);
    }

    if (Date.now() - startTime >= MAX_TIME) {
      throw new Error("接続がタイムアウトしました");
    }
  }
  return null;
}

async function hashtag(tag) {
  if (!tag) return [];
  try {
    const cleanTag = tag.replace(/^#/, '');

    const raw = await client.getHashtag(cleanTag);

    return (raw.contents?.contents || [])
      .filter(item => item.type === 'RichItem' && item.content?.type === 'Video')
      .map(item => {
        const v = item.content;
        return {
          id: v.video_id,
          title: v.title.text,
          author: {
            name: v.author.name,
            id: v.author.id,
            thumbnail: v.author.thumbnails[0]?.url
          },
          thumbnail: v.thumbnails[0]?.url,
          duration: v.length_text?.text,
          published: v.published?.text,
          view_count: v.view_count?.text
        };
      });

  } catch (error) {
    console.error("Hashtag Fetch Error:", error);
    return null;
  }
}

module.exports = {
  infoGet, 
  nextfeed,
  setClient,
  search,
  search2,
  searchjson,
  getComments,
  getChannel,
  channelfeed,
  hashtag
};