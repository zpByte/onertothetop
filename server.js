const http = require("http");
const fs = require("fs");
const path = require("path");

loadEnv();

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
const API_URL = "https://api.deepseek.com/chat/completions";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/generate-scene") {
      return handleGenerateScene(req, res);
    }

    if (req.method !== "GET") {
      return sendJson(res, 405, { error: "method_not_allowed" });
    }

    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    return sendJson(res, 500, { error: "server_error", message: "本地服务出错了。" });
  }
});

server.listen(PORT, () => {
  console.log(`ONER simulator running at http://localhost:${PORT}`);
});

async function handleGenerateScene(req, res) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, {
      error: "missing_api_key",
      message: "缺少 DEEPSEEK_API_KEY，请在 .env 里配置。"
    });
  }

  const input = await readJsonBody(req);
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: buildMessages(input),
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0.95,
      max_tokens: 1200,
      stream: false
    })
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error?.message || `DeepSeek API 请求失败：${response.status}`;
    return sendJson(res, 502, { error: "deepseek_error", message });
  }

  const content = data?.choices?.[0]?.message?.content;
  const rawScene = parseModelJson(content);
  const scene = normalizeScene(rawScene, input);
  return sendJson(res, 200, { scene, usage: data.usage || null, model: data.model || MODEL });
}

function buildMessages(input) {
  const identity = sanitizeText(input.identity?.name || "未选择");
  const trait = sanitizeText(input.identity?.trait || "");
  const role = sanitizeText(input.role || identity);
  const stats = input.stats || {};
  const previousScenes = Array.isArray(input.previousScenes) ? input.previousScenes.slice(-30) : [];
  const previousText = previousScenes.length
    ? previousScenes.map(item => `- ${sanitizeText(item.title || item.id || "")}`).join("\n")
    : "- 无";

  const system = `你是一个中文互动叙事游戏 DM。请只输出 json，不要输出 markdown。

游戏名：ONER宇宙生存模拟器。
体验目标：生成一个“像真实内娱生态压力测试”的每日场景，有工作、粉圈、舞台、行程、舆情、现实生活和关系边界的张力。
安全边界：不要写真实成员私生活、恋爱实锤、隐私推断、真实负面爆料。可以写公开舞台、公开行程、团队工作场景、粉圈互动和玩家自己的选择压力。
禁止内容：不要写购买航班/酒店/住址等隐私信息，不要写私生行为，不要写混入 VIP 通道、尾随、偷拍、肢体接触、递信塞口袋、越过安保、骚扰艺人。站姐场景只能发生在公开可拍区域，重点写边界、舆论和自我克制。
风格：好笑、具体、有截图感，但不要像产品说明。不要出现“行动反馈”“项目组介绍”“每一天都会更新一个具体场景”等给开发者看的话。
重复限制：不要重复下面这些已经出现过的场景标题或同类问题：
${previousText}

你必须返回这个 JSON 结构：
{
  "id": "短横线英文id",
  "location": "地点，8字以内更好",
  "title": "场景标题，2到10个中文字符",
  "tags": ["标签1", "标签2"],
  "text": "60到130字的具体场景正文，第二人称",
  "choices": [
    {
      "label": "选项文案，短",
      "result": "选择后的结果，40到100字",
      "effects": { "心态": 0, "钱包": 0, "事业": 0, "隐蔽": 0, "舆情": 0, "关系": 0 },
      "role": null
    }
  ]
}

规则：
- choices 必须正好 3 个。
- effects 只允许使用：心态、钱包、事业、隐蔽、舆情、关系。
- 每个 effects 的数值必须是 -12 到 12 的整数，不能全是 0。
- 舆情越高越危险；其他数值越低越危险。
- role 可以是 null 或一个很短的新身份称号。
- 输出必须是可 JSON.parse 的 json。`;

  const user = `请为第 ${Number(input.day || 1)} 天生成一个全新的每日场景。

玩家入口身份：${identity}
身份特性：${trait}
当前身份称号：${role}
当前数值：${JSON.stringify(stats)}
最近记录：${JSON.stringify((input.recentHistory || []).slice(-8))}

请让场景符合当前身份和数值，并避免和历史标题重复。`;

  return [
    { role: "system", content: system },
    { role: "user", content: user }
  ];
}

function normalizeScene(raw, input) {
  if (!raw || typeof raw !== "object") throw new Error("模型没有返回有效 JSON。");
  const choices = Array.isArray(raw.choices) ? raw.choices.slice(0, 3) : [];
  if (choices.length !== 3) throw new Error("模型返回的选项数量不是 3 个。");

  return {
    id: `model_day_${Number(input.day || 1)}_${slug(raw.id || raw.title || Date.now())}`,
    location: clean(raw.location, "未命名地点", 16),
    title: clean(raw.title, "新的场景", 18),
    tags: normalizeTags(raw.tags),
    text: clean(raw.text, "今天出现了一个新的状况，你需要立刻做判断。", 220),
    choices: choices.map(choice => ({
      label: clean(choice.label, "先稳住", 32),
      result: clean(choice.result, "事情暂时告一段落，但影响已经留下。", 180),
      effects: normalizeEffects(choice.effects),
      phone: null,
      role: choice.role ? clean(choice.role, null, 18) : null
    }))
  };
}

function normalizeEffects(effects = {}) {
  const allowed = ["心态", "钱包", "事业", "隐蔽", "舆情", "关系"];
  const normalized = {};
  for (const key of allowed) {
    const value = Number(effects[key] || 0);
    if (Number.isFinite(value) && value !== 0) {
      normalized[key] = Math.max(-12, Math.min(12, Math.round(value)));
    }
  }
  if (!Object.keys(normalized).length) normalized.心态 = -2;
  return normalized;
}

function normalizeTags(tags) {
  const fallback = ["模型生成", "每日"];
  if (!Array.isArray(tags)) return fallback;
  const cleaned = tags.map(tag => clean(tag, "", 8)).filter(Boolean).slice(0, 4);
  return cleaned.length ? cleaned : fallback;
}

function parseModelJson(content) {
  if (!content) throw new Error("模型返回为空。");
  return JSON.parse(content);
}

function clean(value, fallback, maxLength) {
  if (typeof value !== "string") return fallback;
  const text = value.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, maxLength) : fallback;
}

function sanitizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 240);
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || Date.now().toString(36);
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(ROOT, pathname));

  if (!filePath.startsWith(ROOT)) {
    return sendText(res, 403, "Forbidden");
  }

  fs.readFile(filePath, (error, data) => {
    if (error) return sendText(res, 404, "Not found");
    const type = MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("请求体过大。"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function sendText(res, status, body) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(body);
}

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}
