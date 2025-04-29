const axios = require('axios');
const { API_SITES, API_CONFIG, PROXY_URL } = require('../js/config');

// 搜索视频
async function searchVideos(keyword, page = 1, limit = 20, source) {
    if (!keyword) {
        throw new Error('Keyword is required');
    }

    let apiUrl;
    if (source && API_SITES[source]) {
        apiUrl = `${API_SITES[source].api}${API_CONFIG.search.path}${encodeURIComponent(keyword)}`;
    } else {
        // 如果没有指定源，使用所有源进行搜索
        const searchPromises = Object.entries(API_SITES)
            .filter(([_, value]) => !value.adult) // 过滤掉成人内容
            .map(([key, value]) => {
                const url = `${value.api}${API_CONFIG.search.path}${encodeURIComponent(keyword)}`;
                return fetchWithSource(url, key);
            });

        const results = await Promise.allSettled(searchPromises);
        const validResults = results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value)
            .flat();

        // 分页处理
        const start = (page - 1) * limit;
        const end = start + limit;
        return validResults.slice(start, end);
    }

    const response = await axios.get(`${PROXY_URL}${encodeURIComponent(apiUrl)}`, {
        headers: API_CONFIG.search.headers
    });

    return processSearchResults(response.data, source);
}

// 获取视频详情
async function getVideoDetails(id, source) {
    if (!id) {
        throw new Error('Video ID is required');
    }

    let apiUrl;
    if (source && API_SITES[source]) {
        apiUrl = `${API_SITES[source].api}${API_CONFIG.detail.path}${id}`;
    } else {
        throw new Error('Source is required for getting video details');
    }

    const response = await axios.get(`${PROXY_URL}${encodeURIComponent(apiUrl)}`, {
        headers: API_CONFIG.detail.headers
    });

    return processDetailResults(response.data, source);
}

// 获取视频播放地址
async function getVideoPlayUrl(id, episode = 1, source) {
    if (!id) {
        throw new Error('Video ID is required');
    }

    const details = await getVideoDetails(id, source);
    if (!details || !details.play_urls || !details.play_urls[episode]) {
        throw new Error('Play URL not found');
    }

    return {
        url: details.play_urls[episode],
        type: details.play_urls[episode].includes('.m3u8') ? 'hls' : 'mp4',
        episode: episode,
        total_episodes: Object.keys(details.play_urls).length
    };
}

// 辅助函数：处理搜索结果
function processSearchResults(data, source) {
    if (!data || !data.list) {
        return [];
    }

    return data.list.map(item => ({
        id: item.vod_id,
        name: item.vod_name,
        pic: item.vod_pic,
        year: item.vod_year,
        area: item.vod_area,
        director: item.vod_director,
        actor: item.vod_actor,
        content: item.vod_content,
        source: source || 'unknown'
    }));
}

// 辅助函数：处理详情结果
function processDetailResults(data, source) {
    if (!data || !data.list || !data.list[0]) {
        throw new Error('Video details not found');
    }

    const item = data.list[0];
    const playUrls = {};
    
    // 解析播放地址
    if (item.vod_play_url) {
        const urlGroups = item.vod_play_url.split('#');
        urlGroups.forEach(group => {
            const [episode, url] = group.split('$');
            if (episode && url) {
                playUrls[episode] = url;
            }
        });
    }

    return {
        id: item.vod_id,
        name: item.vod_name,
        pic: item.vod_pic,
        year: item.vod_year,
        area: item.vod_area,
        director: item.vod_director,
        actor: item.vod_actor,
        content: item.vod_content,
        play_urls: playUrls,
        source: source
    };
}

// 辅助函数：带源的请求
async function fetchWithSource(url, source) {
    try {
        const response = await axios.get(`${PROXY_URL}${encodeURIComponent(url)}`, {
            headers: API_CONFIG.search.headers
        });
        return processSearchResults(response.data, source);
    } catch (error) {
        console.error(`Error fetching from ${source}:`, error.message);
        return [];
    }
}

module.exports = {
    searchVideos,
    getVideoDetails,
    getVideoPlayUrl
}; 