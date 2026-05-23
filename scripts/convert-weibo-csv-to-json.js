#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DEFAULT_INPUT = "6524267181.csv";
const DEFAULT_OUTPUT_DIR = "data";

const ARRAY_FIELDS = new Set([
  "话题",
  "@用户",
  "源微博话题",
  "源微博@用户"
]);

const URL_ARRAY_FIELDS = new Set([
  "原始图片url",
  "视频url",
  "Live Photo视频url",
  "源微博原始图片url",
  "源微博视频url",
  "源微博Live Photo视频url"
]);

const NUMBER_FIELDS = new Set([
  "点赞数",
  "评论数",
  "转发数",
  "编辑次数",
  "源微博点赞数",
  "源微博评论数",
  "源微博转发数",
  "源微博编辑次数"
]);

const BOOLEAN_FIELDS = new Set([
  "是否编辑过",
  "是否原创",
  "源微博是否编辑过"
]);

const ID_FIELDS = new Set([
  "id",
  "源用户id",
  "源微博id"
]);

const DIRECT_FIELDS = {
  id: "id",
  bid: "bid",
  正文: "text",
  头条文章url: "article_url",
  原始图片url: "image_urls",
  视频url: "video_urls",
  "Live Photo视频url": "live_photo_video_urls",
  位置: "location",
  日期: "date",
  工具: "source_app",
  点赞数: "like_count",
  评论数: "comment_count",
  转发数: "repost_count",
  话题: "topics",
  "@用户": "mentions",
  完整日期: "full_date",
  是否编辑过: "edited",
  编辑次数: "edit_count",
  是否原创: "original"
};

const SOURCE_FIELDS = {
  源用户id: "user_id",
  源用户昵称: "nickname",
  源微博id: "id",
  源微博bid: "bid",
  源微博正文: "text",
  源微博头条文章url: "article_url",
  源微博原始图片url: "image_urls",
  源微博视频url: "video_urls",
  "源微博Live Photo视频url": "live_photo_video_urls",
  源微博位置: "location",
  源微博日期: "date",
  源微博工具: "source_app",
  源微博点赞数: "like_count",
  源微博评论数: "comment_count",
  源微博转发数: "repost_count",
  源微博话题: "topics",
  "源微博@用户": "mentions",
  源微博完整日期: "full_date",
  源微博是否编辑过: "edited",
  源微博编辑次数: "edit_count"
};

function main() {
  const inputPath = path.resolve(process.cwd(), process.argv[2] || DEFAULT_INPUT);
  const outputDir = path.resolve(process.cwd(), process.argv[3] || DEFAULT_OUTPUT_DIR);

  const csvText = fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    throw new Error("CSV does not contain a header and data rows.");
  }

  const [header, ...dataRows] = rows;
  const posts = dataRows
    .filter(row => row.some(cell => String(cell || "").trim() !== ""))
    .map(row => normalizePost(rowToObject(header, row)));
  const ragCards = posts.map(toRagCard);

  fs.mkdirSync(outputDir, { recursive: true });
  const postsPath = path.join(outputDir, "oner-weibo-posts.json");
  const cardsPath = path.join(outputDir, "oner-weibo-rag-cards.json");

  fs.writeFileSync(postsPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  fs.writeFileSync(cardsPath, `${JSON.stringify(ragCards, null, 2)}\n`, "utf8");

  printStats(posts, postsPath, cardsPath);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === "\"") {
        if (next === "\"") {
          field += "\"";
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === "\"") {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(stripTrailingCarriageReturn(field));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(stripTrailingCarriageReturn(field));
    rows.push(row);
  }

  if (inQuotes) {
    throw new Error("CSV ended while inside a quoted field.");
  }

  return rows;
}

function stripTrailingCarriageReturn(value) {
  return value.endsWith("\r") ? value.slice(0, -1) : value;
}

function rowToObject(header, row) {
  const object = {};
  header.forEach((key, index) => {
    object[key] = row[index] ?? "";
  });
  return object;
}

function normalizePost(raw) {
  const post = {};

  for (const [sourceKey, targetKey] of Object.entries(DIRECT_FIELDS)) {
    post[targetKey] = normalizeValue(sourceKey, raw[sourceKey]);
  }

  post.text_clean = cleanText(post.text);

  const sourcePost = {};
  for (const [sourceKey, targetKey] of Object.entries(SOURCE_FIELDS)) {
    sourcePost[targetKey] = normalizeValue(sourceKey, raw[sourceKey]);
  }
  sourcePost.text_clean = cleanText(sourcePost.text);

  post.source_post = hasSourcePost(sourcePost) ? sourcePost : null;
  post.raw = raw;

  return post;
}

function normalizeValue(key, value) {
  const cleaned = cleanScalar(value);

  if (ARRAY_FIELDS.has(key)) return splitList(cleaned);
  if (URL_ARRAY_FIELDS.has(key)) return splitUrls(cleaned);
  if (NUMBER_FIELDS.has(key)) return toNumberOrNull(cleaned);
  if (BOOLEAN_FIELDS.has(key)) return toBooleanOrNull(cleaned);
  if (ID_FIELDS.has(key)) return cleaned || null;

  return cleaned || null;
}

function cleanScalar(value) {
  if (value == null) return "";
  return String(value).replace(/^\uFEFF/, "").replace(/\t+$/g, "").trim();
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function splitList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function splitUrls(value) {
  if (!value) return [];
  return value
    .split(/,(?=https?:\/\/)/)
    .map(item => item.trim())
    .filter(Boolean);
}

function toNumberOrNull(value) {
  if (!value) return null;
  const number = Number(value.replace(/,/g, ""));
  return Number.isFinite(number) ? number : null;
}

function toBooleanOrNull(value) {
  if (!value) return null;
  if (value === "True" || value === "true" || value === "1" || value === "是") return true;
  if (value === "False" || value === "false" || value === "0" || value === "否") return false;
  return null;
}

function hasSourcePost(sourcePost) {
  return Boolean(sourcePost.id || sourcePost.bid || sourcePost.text || sourcePost.user_id);
}

function toRagCard(post) {
  const sourceText = post.source_post?.text_clean || "";
  const text = post.text_clean || "";
  const searchText = [
    text,
    sourceText,
    ...(post.topics || []),
    ...(post.mentions || []),
    ...(post.source_post?.topics || []),
    ...(post.source_post?.mentions || [])
  ].filter(Boolean).join(" ");

  return {
    id: post.id,
    date: post.date,
    year: post.date ? post.date.slice(0, 4) : null,
    text,
    topics: post.topics,
    mentions: post.mentions,
    media: {
      images: post.image_urls,
      videos: post.video_urls,
      live_photo_videos: post.live_photo_video_urls,
      source_images: post.source_post?.image_urls || [],
      source_videos: post.source_post?.video_urls || []
    },
    metrics: {
      likes: post.like_count,
      comments: post.comment_count,
      reposts: post.repost_count
    },
    source: post.source_post ? {
      id: post.source_post.id,
      bid: post.source_post.bid,
      nickname: post.source_post.nickname,
      text: post.source_post.text_clean,
      date: post.source_post.date
    } : null,
    type: classifyPost(post, searchText),
    search_text: searchText
  };
}

function classifyPost(post, searchText) {
  if (!post.original || post.source_post) return "repost";
  if (matches(searchText, ["生日", "生贺", "Birthday", "HBD"])) return "birthday";
  if (matches(searchText, ["盛典", "荣誉", "年度", "获奖", "颁奖"])) return "award";
  if (matches(searchText, ["签售", "见面会", "应援", "超话", "预售", "小卖部", "购票", "开票", "票务"])) return "fan_event";
  if (matches(searchText, ["专辑", "EP", "单曲", "MV", "上线", "发布", "新歌", "音源"])) return "release";
  if (matches(searchText, ["演唱会", "巡演", "舞台", "首唱", "打歌", "返场", "场馆", "彩排"])) return "stage";
  return "post";
}

function matches(text, keywords) {
  return keywords.some(keyword => text.includes(keyword));
}

function printStats(posts, postsPath, cardsPath) {
  const years = {};
  let minDate = null;
  let maxDate = null;
  let originalCount = 0;
  let repostCount = 0;
  let imageCount = 0;
  let videoCount = 0;

  for (const post of posts) {
    if (post.date) {
      minDate = !minDate || post.date < minDate ? post.date : minDate;
      maxDate = !maxDate || post.date > maxDate ? post.date : maxDate;
      const year = post.date.slice(0, 4);
      years[year] = (years[year] || 0) + 1;
    }
    if (post.original) originalCount += 1;
    if (!post.original || post.source_post) repostCount += 1;
    if ((post.image_urls || []).length) imageCount += 1;
    if ((post.video_urls || []).length) videoCount += 1;
  }

  console.log(`records: ${posts.length}`);
  console.log(`date range: ${formatDate(minDate)} to ${formatDate(maxDate)}`);
  console.log(`original: ${originalCount}`);
  console.log(`repost/source: ${repostCount}`);
  console.log(`with images: ${imageCount}`);
  console.log(`with videos: ${videoCount}`);
  console.log("years:");
  for (const year of Object.keys(years).sort()) {
    console.log(`  ${year}: ${years[year]}`);
  }
  console.log(`posts json: ${postsPath}`);
  console.log(`rag cards json: ${cardsPath}`);
}

function formatDate(date) {
  return date ? date.slice(0, 10) : "unknown";
}

main();
