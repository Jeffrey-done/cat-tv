import express from 'express';
import { searchVideos, getVideoDetails, getVideoPlayUrl } from '../functions/video.js';
import { validateApiKey } from '../middleware/auth.js';

const router = express.Router();

// API 路由配置
router.use(express.json());

// 搜索视频
router.get('/search', validateApiKey, async (req, res) => {
    try {
        const { keyword, page = 1, limit = 20, source } = req.query;
        const results = await searchVideos(keyword, page, limit, source);
        res.json({
            code: 0,
            msg: 'success',
            data: results
        });
    } catch (error) {
        res.status(500).json({
            code: 1,
            msg: error.message,
            data: null
        });
    }
});

// 获取视频详情
router.get('/detail/:id', validateApiKey, async (req, res) => {
    try {
        const { id } = req.params;
        const { source } = req.query;
        const details = await getVideoDetails(id, source);
        res.json({
            code: 0,
            msg: 'success',
            data: details
        });
    } catch (error) {
        res.status(500).json({
            code: 1,
            msg: error.message,
            data: null
        });
    }
});

// 获取视频播放地址
router.get('/play/:id', validateApiKey, async (req, res) => {
    try {
        const { id } = req.params;
        const { source, episode = 1 } = req.query;
        const playUrl = await getVideoPlayUrl(id, episode, source);
        res.json({
            code: 0,
            msg: 'success',
            data: playUrl
        });
    } catch (error) {
        res.status(500).json({
            code: 1,
            msg: error.message,
            data: null
        });
    }
});

// 获取所有可用的视频源
router.get('/sources', validateApiKey, (req, res) => {
    try {
        const sources = Object.entries(API_SITES).map(([key, value]) => ({
            id: key,
            name: value.name,
            api: value.api,
            isAdult: value.adult || false
        }));
        res.json({
            code: 0,
            msg: 'success',
            data: sources
        });
    } catch (error) {
        res.status(500).json({
            code: 1,
            msg: error.message,
            data: null
        });
    }
});

export default router; 