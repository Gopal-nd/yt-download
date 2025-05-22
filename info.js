import { Innertube } from 'youtubei.js';
// export interface FormatOptions {
//     /**
//      * Video or audio itag
//      */
//     itag?: number;
//     /**
//      * Video quality; 360p, 720p, 1080p, etc... also accepts 'best' and 'bestefficiency'.
//      */
//     quality?: string;
//     /**
//      * Download type, can be: video, audio or video+audio
//      */
//     type?: 'video' | 'audio' | 'video+audio';
//     /**
//      * Language code, defaults to 'original'.
//      */
//     language?: string;
//     /**
//      * File format, use 'any' to download any format
//      */
//     format?: string;
//     /**
//      * Video or audio codec, e.g. 'avc', 'vp9', 'av01' for video, 'opus', 'mp4a' for audio
//      */
//     codec?: string;
//     /**
//      * InnerTube client.
//      */
//     client?: InnerTubeClient;
// }
const config = {video_id: "w9RI-aVf2UQ"}
const innertube = await Innertube.create(config);
const video = await innertube.getInfo(config.video_id);
console.log(video)