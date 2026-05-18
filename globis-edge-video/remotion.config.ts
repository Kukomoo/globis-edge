import { Config } from "remotion";

Config.setCodec("h264");
Config.setFrameRate(24);
Config.setDimensions(1920, 1080);
Config.setCrf(18);
Config.setAudioCodec("aac");
Config.setAudioBitrate("128k");
