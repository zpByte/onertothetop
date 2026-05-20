const SAVE_VERSION = 2;
const STAT_NAMES = ["心态", "钱包", "事业", "隐蔽", "舆情", "关系"];

const identities = [
  {
    id: "fansite",
    name: "站姐",
    intro: "你本来只是想拍几张好图，结果发现自己比部分工作人员还懂行程。",
    trait: "行程线更灵，图站声量更高，但每一次出现都可能被截图。",
    stats: { 心态: 70, 钱包: 40, 事业: 20, 隐蔽: 45, 舆情: 15, 关系: 20 }
  },
  {
    id: "brand-pr",
    name: "品牌 PR",
    intro: "你只是来对接商务的，结果甲方、乙方、粉丝和艺人团队都开始找你。",
    trait: "商务和工作线更顺，但任何失误都会变成项目事故。",
    stats: { 心态: 65, 钱包: 65, 事业: 60, 隐蔽: 55, 舆情: 10, 关系: 15 }
  },
  {
    id: "assistant",
    name: "后台助理",
    intro: "你负责的工作很小，但你出现的位置都很危险。",
    trait: "后台近距离事件更多，隐蔽高，但心态掉得快。",
    stats: { 心态: 60, 钱包: 50, 事业: 35, 隐蔽: 70, 舆情: 5, 关系: 25 }
  },
  {
    id: "trainee",
    name: "同公司练习生",
    intro: "你以为自己在准备舞台，实际上你在准备接受内娱综合素质考试。",
    trait: "事业成长更快，练习室和彩排事件更多，也更容易被粉圈审视。",
    stats: { 心态: 75, 钱包: 35, 事业: 45, 隐蔽: 50, 舆情: 20, 关系: 20 }
  },
  {
    id: "classmate",
    name: "普通老同学",
    intro: "你只是很久没联系的老同学，直到某天一张旧照片开始在网上流传。",
    trait: "关系基础高，但隐蔽低。旧照片和朋友圈都是定时炸弹。",
    stats: { 心态: 80, 钱包: 55, 事业: 25, 隐蔽: 35, 舆情: 25, 关系: 35 }
  }
];

const sceneDeck = [
  {
    id: "cold_open_kbs",
    dayRange: [1, 4],
    location: "电视台侧门通道",
    title: "冷风里的台本",
    tags: ["开局", "工作"],
    text: "凌晨的风把侧门外的隔离带吹得哗啦响。你手里抱着一叠临时台本，刚从便利店出来，就看见保姆车停在不远处。车门一开，闪光灯亮了一瞬。你本能地往后退，台本却被风掀出去几页。",
    choices: [
      c("先捡台本，不抬头", "你把台本按在怀里，硬是没有往车门方向看。经纪人经过时多看了你一眼，但没有停下。你保住了边界，也错过了一个自然对话的机会。", { 隐蔽: 6, 关系: -1, 心态: -2 }),
      c("低声道谢后马上离开", "有人先你一步按住了快掉进水洼的纸。你接回台本，只说了一句谢谢就转身进门。这个反应足够稳，也足够让对方记住你不是会借机攀谈的人。", { 关系: 4, 隐蔽: 3, 心态: 1 }),
      c("提醒他们侧门有镜头", "你压低声音提醒侧门右上方有镜头。经纪人立刻改变动线，团队进场顺利。你没有多说一句，但工作人员群里第一次出现了你的名字。", { 事业: 7, 关系: 2, 隐蔽: -2 }, null, "临时靠谱的人")
    ]
  },
  {
    id: "fan_preview_crop",
    dayRange: [2, 8],
    location: "机场到达层",
    title: "预览图边角",
    tags: ["行程", "粉圈"],
    text: "一张站姐预览图在首页刷屏。主体很完美，灯光也很绝，问题是边角里露出了你的半个肩膀。评论区还没发现，但你认识自己的外套。",
    choices: [
      c("私信站姐请她裁掉", "对方没有立刻回你。十分钟后，她重新发了一版图，边角干净了。你松了一口气，也意识到自己开始欠下粉圈人情。", { 隐蔽: 8, 钱包: -4, 心态: -2 }, null, "粉圈人情债务人"),
      c("假装没看见", "你盯着那半个肩膀看了很久。到了晚上，评论区终于有人问“旁边那是谁”。事情没有炸，但你的心态先被炸了一轮。", { 心态: -7, 舆情: 8 }),
      c("切小号说是工作人员", "你的小号评论很快被点赞。这个解释暂时压住了猜测，但你的小号主页也开始变得不那么安全。", { 舆情: -4, 隐蔽: -5, 心态: 3 })
    ]
  },
  {
    id: "brand_draft_leak",
    dayRange: [3, 10],
    identities: ["brand-pr", "assistant"],
    location: "品牌项目群",
    title: "撤回的 KV 图",
    tags: ["商务", "工作"],
    text: "品牌方在群里误发了一张还没公开的 KV 图。十秒后，图片被撤回。群里没人说话，只有你知道那张图如果流出去，会把整个宣发节奏提前三天。",
    choices: [
      c("立刻提醒负责人", "负责人只回了一个“收到”。半小时后，群里重新发出保密提醒。你没有得到夸奖，但流程因为你少炸了一次。", { 事业: 8, 关系: 2, 心态: -3 }, null, "流程救火员"),
      c("保存截图以备复盘", "你保存了截图。这个动作很专业，也很危险。后来真有人问起来源时，你发现自己手里那张图重得像证物。", { 事业: 4, 隐蔽: -7, 舆情: 5 }),
      c("装作没看见", "你选择不介入。项目没有立刻出事，但之后的临时会议里，你也没有被叫去核心讨论。", { 隐蔽: 4, 事业: -4, 心态: 2 })
    ]
  },
  {
    id: "work_group_truth",
    dayRange: [4, 12],
    location: "47人工作群",
    title: "很难评的妆造",
    tags: ["工作", "事故"],
    text: "你把一句“这版妆造真的很难评”发进了工作群。群里沉默了三秒，像整个项目组同时断网。更糟的是，项目负责人正在输入中。",
    choices: [
      c("立刻撤回并道歉", "你撤回得很快，但大家都看见了。负责人没有追究，只让你把具体问题单独整理给他。尴尬没有消失，变成了工作。", { 心态: -7, 事业: 3, 隐蔽: 2 }),
      c("顺势改成专业反馈", "你把问题拆成灯光、服装比例和镜头适配三类。群里开始有人接话，事故被你硬拧成了小型复盘。", { 事业: 10, 心态: -5, 关系: 2 }, "phone_group_misfire", "项目复盘临时工"),
      c("说朋友拿你手机乱发", "这个解释烂到没人愿意拆穿。你保住了当场气氛，但失去了一部分可信度。", { 隐蔽: 3, 事业: -6, 心态: -2 })
    ]
  },
  {
    id: "midnight_message",
    dayRange: [5, 16],
    minStats: { 关系: 28 },
    location: "凌晨的聊天框",
    title: "1:17 的消息",
    tags: ["关系", "私聊"],
    text: "凌晨 1:17，手机亮了一下。对方只发来一句：“今天辛苦了，早点睡。”这句话没有暧昧词，但你很清楚，在这个时间点，它已经不完全是工作消息。",
    choices: [
      c("五分钟后自然回复", "你等到呼吸平稳一点才回复。聊天没有继续很久，却刚好停在不会越界的位置。你们都像在试探一条线。", { 关系: 5, 隐蔽: 2, 心态: 2 }, "phone_midnight"),
      c("秒回并多问一句", "对话延长了十分钟。你们聊到了今天的舞台，也聊到他明天很早还要起。甜是真的，风险也是真的。", { 关系: 8, 隐蔽: -5, 心态: 4 }, "phone_midnight"),
      c("第二天早上再回", "你把手机扣在桌上。第二天早上，你回得像一个标准成年人。关系没有升温，但你保住了自己的节奏。", { 隐蔽: 5, 关系: -1, 心态: 3 })
    ]
  },
  {
    id: "practice_room_side",
    dayRange: [6, 14],
    identities: ["trainee", "assistant"],
    location: "练习室门口",
    title: "隔壁练习室",
    tags: ["事业", "练习室"],
    text: "你被临时叫去隔壁练习室帮忙看走位。回到自己的位置时，队友已经开始用那种“你最好解释一下”的眼神看你。论坛也刚好出现了一个含糊的新帖。",
    choices: [
      c("继续练自己的", "你没有解释。一天结束后，老师单独夸了你一句稳定。队友的猜测还在，但你先拿到了事业线的分。", { 事业: 7, 隐蔽: 3, 心态: -2 }, "phone_practice_room"),
      c("主动解释清楚", "你解释得很完整，完整到听的人都开始替你尴尬。好处是误会暂时没发酵，坏处是你看起来太在意了。", { 隐蔽: 6, 心态: -5, 关系: -1 }),
      c("去论坛看帖", "你点开帖子，发现大家能从一双鞋猜到三种剧情。你没有暴露，但你的心态被网友的想象力教育了。", { 心态: -8, 舆情: 5 })
    ]
  },
  {
    id: "old_photo_group",
    dayRange: [7, 18],
    identities: ["classmate"],
    location: "高中同学群",
    title: "旧照片复活",
    tags: ["旧照", "舆情"],
    text: "一张模糊到像用计算器拍的旧合照突然被人转进群里。有人圈出了第三排的你，又圈出了旁边的人。你第一次发现青春回忆也能变成网络证据。",
    choices: [
      c("坚持只是同学", "你说得很平静。群里短暂安静后，有人开始转移话题。事情没有结束，但至少没有从你这里继续长出新证据。", { 隐蔽: 7, 关系: -2, 心态: -2 }, "phone_old_photo"),
      c("让群友别外传", "你态度很硬，群里有人开玩笑说你急了。照片没有继续扩散，但你知道他们开始更好奇了。", { 隐蔽: 5, 舆情: 5, 心态: -4 }, "phone_old_photo"),
      c("发一张更早的合照打岔", "你成功把话题带偏到大家的发型黑历史。短期有效，长期等于往互联网递了更多素材。", { 心态: 5, 舆情: 10, 隐蔽: -4 })
    ]
  },
  {
    id: "weekly_fansign",
    dayRange: [8, 20],
    location: "线上签售抽选页",
    title: "抽选名单",
    tags: ["粉圈", "关系"],
    text: "签售抽选名单公布。你本来只是顺手点开，却看见一个熟悉朋友中了。她兴奋地问你要不要帮忙想问题。你知道有些问题一旦问出口，就会变成另一种试探。",
    choices: [
      c("只帮她想普通问题", "你把问题控制在舞台和作品范围内。朋友嫌你太正经，但你知道这才是能活到下一轮的问法。", { 隐蔽: 5, 心态: 2, 关系: 1 }),
      c("暗塞一个只有你们懂的问题", "问题问出口时，对方停顿了一下。屏幕前的朋友尖叫，屏幕外的你心跳快得离谱。", { 关系: 8, 隐蔽: -7, 舆情: 4 }),
      c("拒绝参与", "你没有帮忙。那晚你反而睡得很好，只是错过了一次关系推进的暗门。", { 心态: 7, 关系: -2, 隐蔽: 3 })
    ]
  },
  {
    id: "manager_two_minutes",
    dayRange: [9, 22],
    maxStats: { 隐蔽: 55 },
    location: "后台走廊尽头",
    title: "经纪人的两分钟",
    tags: ["公司", "危机"],
    text: "经纪人把你叫到走廊尽头。他没有提高音量，只问了一句：“你知道这个名字和这个团队绑着多少人的工作吗？”这句话不是威胁，是边界线。",
    choices: [
      c("承认自己会注意", "你没有辩解。对方看了你几秒，点头让你回去。关系没有更近，但你从风险名单上往下挪了一格。", { 隐蔽: 9, 舆情: -4, 关系: -2 }, null, "被公司观察但未拉黑"),
      c("解释前因后果", "你解释得很完整。经纪人听完，只说“我理解，但风险不会因为理解消失”。你赢了一点信任，也输了一点轻松。", { 事业: 4, 关系: 2, 心态: -6 }),
      c("反问自己哪里越界", "走廊空气变冷。你不是没有道理，但在公司视角里，风险不需要等到越界才处理。", { 舆情: 8, 隐蔽: -5, 心态: -4 })
    ]
  },
  {
    id: "rain_exit",
    dayRange: [10, 24],
    location: "雨夜散场口",
    title: "没有伞的人",
    tags: ["行程", "关系"],
    text: "散场后突然下雨。你站在门口等车，头发被风吹乱。工作人员通道里有人出来，看见你没伞，脚步停了一下。远处还有粉丝没有散完。",
    choices: [
      c("装作没看见", "你低头看手机，像完全没有注意到。对方停顿了一秒后继续往前走。你们都安全，也都冷了一点。", { 隐蔽: 7, 关系: -3, 心态: -2 }),
      c("接过伞后立刻离开", "你接过伞，说了谢谢，然后马上走进雨里。这个距离刚好够温柔，也刚好够克制。", { 关系: 5, 隐蔽: -2, 心态: 3 }),
      c("问能不能蹭到路口", "车门关上的声音很轻，但你的心跳很重。十分钟路程没有被拍到，可你知道这类好运不能常用。", { 关系: 9, 舆情: 10, 隐蔽: -6 })
    ]
  },
  {
    id: "data_sheet",
    dayRange: [11, 25],
    location: "粉丝群共享文档",
    title: "发光的数据表",
    tags: ["粉圈", "事业"],
    text: "你熬夜整理的回归数据表被转进多个群。有人说太专业了，也有人问这种排版是不是内部人员做的。你第一次发现能力本身也会暴露身份。",
    choices: [
      c("删掉署名继续维护", "你把署名删得干干净净。表格还在传播，但大家开始把它叫做“那个无名表”。你失去了一点存在感，换来更多安全。", { 隐蔽: 8, 事业: -2, 舆情: -3 }, null, "无名表格维护者"),
      c("公开认领", "你认领了表格。关注涨得很快，私信也涨得很快。有人夸你，也有人开始翻你的主页。", { 事业: 9, 舆情: 12, 隐蔽: -7 }, null, "粉圈数据节点"),
      c("宣布休息一天", "你关掉电脑，睡了八小时。第二天表格被别人接手，你没有失去全部，但你终于像个人。", { 心态: 10, 事业: -4 })
    ]
  },
  {
    id: "live_eye_contact",
    dayRange: [12, 26],
    minStats: { 关系: 35 },
    location: "直播屏幕前",
    title: "不该看的方向",
    tags: ["直播", "关系", "舆情"],
    text: "直播进行到一半，他突然看向镜头外某个方向，笑了一下。评论区开始刷“刚才在看谁”。你知道那个方向并没有什么特别，除了你刚刚发过一条消息。",
    choices: [
      c("立刻停止发消息", "你把手机放远。直播继续，评论很快被新话题盖过。你没有得到回应，但保住了场面。", { 隐蔽: 7, 舆情: -5, 关系: -1 }),
      c("发一句别看手机", "几秒后，他低头笑得更明显。你知道这很危险，但危险有时候也很会让人上头。", { 关系: 8, 舆情: 9, 隐蔽: -6 }),
      c("截图留念", "你没有继续互动，只截了图。半小时后你又删掉，像销毁一枚小型证据。", { 心态: 4, 隐蔽: 2 })
    ]
  },
  {
    id: "budget_meeting",
    dayRange: [13, 27],
    minStats: { 事业: 55 },
    location: "复盘会议室",
    title: "让她讲吧",
    tags: ["事业", "工作"],
    text: "复盘会上，负责人突然说：“这个部分让她讲吧，她最清楚。”你手里的笔差点被你捏断。所有人的视线都从投影转到你身上。",
    choices: [
      c("按表格讲完", "你没有发挥，只把事实讲清楚。会议推进得很顺，负责人最后让你下次直接进前置讨论。", { 事业: 9, 心态: -3 }, null, "合作名单边缘人"),
      c("顺便提出新方案", "你讲完问题，又补了一个方案。会议室安静了两秒，然后开始有人问细节。你知道自己往核心圈走了一步。", { 事业: 12, 关系: 2, 心态: -6 }, null, "项目核心候补"),
      c("把话题交回负责人", "你把边界守得很好，也把机会让了出去。没有人怪你，但下一次点名可能不会来。", { 隐蔽: 5, 事业: -3, 心态: 2 })
    ]
  },
  {
    id: "same_item",
    dayRange: [14, 28],
    location: "超话首页",
    title: "同款杯子",
    tags: ["粉圈", "舆情"],
    text: "有人发现你和某位成员用了同款杯子。帖子标题写得像刑侦纪实，评论区已经把购买链接、出现日期和直播截图排成了时间线。",
    choices: [
      c("说便利店随便买的", "这个解释朴素到很难反驳。评论区有人不信，但更多人开始觉得这事有点无聊。", { 舆情: -6, 隐蔽: 4, 心态: 1 }),
      c("立刻换杯子", "你换了杯子，也换掉了所有照片里的背景物。你的生活开始像一场低配版反侦察训练。", { 隐蔽: 8, 钱包: -3, 心态: -4 }),
      c("反问不能喝水吗", "你这句话被截图转发。很多人笑了，也有很多人记住了你的语气。", { 心态: 5, 舆情: 12, 隐蔽: -5 })
    ]
  },
  {
    id: "friend_warning",
    dayRange: [15, 29],
    location: "朋友的语音通话",
    title: "你最近不太像你",
    tags: ["现实", "心态"],
    text: "朋友突然给你打电话。她没有问八卦，只说：“你最近不太像你。”这句话比任何审判都让你沉默，因为她说得太准。",
    choices: [
      c("承认自己有点失控", "你终于把这段时间的压力说出口。朋友没有给你建议，只说今晚先睡觉。你的世界短暂地从热搜回到现实。", { 心态: 12, 关系: -1, 舆情: -2 }),
      c("说自己很好", "你笑着说没事。电话挂断后，房间安静得过分。你保住了体面，也把压力继续留在自己身上。", { 隐蔽: 3, 心态: -7 }),
      c("转移话题聊工作", "朋友没有拆穿你。你们聊了十分钟无关紧要的东西，那些普通生活反而让你缓过来一点。", { 心态: 6, 事业: 2 })
    ]
  },
  {
    id: "fan_video_cut",
    dayRange: [16, 30],
    location: "饭制视频评论区",
    title: "0.7 秒背景板",
    tags: ["粉圈", "舆情"],
    text: "一个饭制视频里，你在背景出现了 0.7 秒。弹幕没有认出你，但评论区有人说这个背影很眼熟。你开始怀疑互联网拥有逐帧记忆。",
    choices: [
      c("找作者删片段", "作者很爽快地换了版本。你感谢她，对方回了个“懂”。你不知道她到底懂了多少。", { 隐蔽: 8, 钱包: -6, 心态: -2 }),
      c("装路人夸剪辑", "你的小号评论被作者置顶了。事情突然从危险变成荒诞，你盯着置顶评论，笑不出来。", { 心态: 3, 隐蔽: -5, 舆情: 6 }),
      c("彻底断网一天", "你没有处理，也没有围观。一天后视频热度自然过去，你第一次意识到不是每件事都需要你亲手解决。", { 心态: 9, 舆情: -3, 事业: -2 })
    ]
  },
  {
    id: "final_choice_pressure",
    dayRange: [26, 30],
    location: "收官日前夜",
    title: "最后一次装不熟",
    tags: ["结局", "关系", "事业"],
    text: "三十天快结束了。你站在后台出口，远处是还没散尽的人群，身后是催流程的工作人员。你突然意识到，这个故事不是看你能不能靠近谁，而是看你能不能在靠近之后还保住自己。",
    choices: [
      c("选择事业，把关系放回边界内", "你把未说出口的话压回去，转身去处理最后一份流程表。后来项目名单上稳定出现了你的名字。", { 事业: 12, 关系: -5, 隐蔽: 6 }, null, "项目负责人苗子"),
      c("选择坦诚，但不要求答案", "你只说了自己真实的感受，没有要承诺。对方沉默很久，最后说：“我知道。”这不是结局，但足够改变你们的关系。", { 关系: 12, 心态: -3, 隐蔽: -4 }),
      c("选择离开高压中心", "你没有等任何人，也没有看手机。走出场馆时，夜风很冷，但你突然觉得自己终于从故事里拿回了一点主动权。", { 心态: 15, 舆情: -8, 关系: -6 }, null, "主动退场的人")
    ]
  }
];

const phoneStories = {
  phone_midnight: {
    type: "私聊",
    title: "凌晨1:17",
    prompt: "屏幕亮了以后，你突然发现回复比不回复更像一种表态。",
    messages: [
      ["对方", "今天辛苦了，早点睡。"],
      ["玩家", "输入中..."]
    ],
    choices: [
      c("你也是，今天舞台很好。", "你把话题停在舞台上。对方回了一个很轻的表情，像把暧昧藏进了工作词汇。", { 关系: 4, 隐蔽: 2 }),
      c("你怎么还没睡？", "对方过了一会儿才回：“睡不着。”聊天框安静下来，但这一句已经足够让你失眠。", { 关系: 7, 心态: 2, 隐蔽: -3 }),
      c("收到，老板。", "你用玩笑把距离拉开。对方回了一个句号，又补了一个“早点睡”。你看着那四个字，突然有点后悔。", { 隐蔽: 4, 关系: -2 })
    ]
  },
  phone_group_misfire: {
    type: "工作群",
    title: "47人工作群",
    prompt: "你已经无法撤回人生，但也许可以把事故包装成专业能力。",
    messages: [
      ["项目负责人", "你刚刚说的第三点，展开讲讲。"],
      ["同事A", "我也觉得有道理。"],
      ["同事B", "她不会真是来上班的吧？"]
    ],
    choices: [
      c("继续专业分析", "你补了一份三页方案。第二天，它出现在正式复盘文档里。", { 事业: 8, 心态: -4 }),
      c("私聊负责人", "负责人回你：下次别在大群说真话。你第一次觉得这可能算夸奖。", { 事业: 6, 关系: 2 }),
      c("说自己只是随口一提", "群里气氛恢复了，但你也从“有想法的人”退回了“手滑的人”。", { 隐蔽: 5, 事业: -3 })
    ]
  },
  phone_old_photo: {
    type: "同学群",
    title: "旧照片被翻出",
    prompt: "同学群从来没有安静过，只是之前没有轮到你。",
    messages: [
      ["老同学A", "这是不是你？"],
      ["老同学B", "我靠这张照片怎么被翻出来了？"],
      ["玩家", "？"],
      ["老同学A", "你现在说你俩不熟还来得及吗？"]
    ],
    choices: [
      c("不熟，真的只是同学。", "这句话太标准，标准到大家更想笑。好在没人继续往外发。", { 隐蔽: 6, 关系: -2 }),
      c("十年前的照片也能开庭？", "群里笑成一片。你把事情变成玩笑，但玩笑也会被截图。", { 心态: 4, 舆情: 5 }),
      c("谁外传我请你吃律师函。", "群里安静了。这个方法有效，也会让人记很久。", { 隐蔽: 8, 心态: -3 })
    ]
  },
  phone_practice_room: {
    type: "私聊",
    title: "练习室门口",
    prompt: "你只是去帮忙站了一下位，但论坛已经准备把你站成一个专题。",
    messages: [
      ["队友", "你刚才是不是被叫去隔壁练习室了？"],
      ["玩家", "嗯，帮忙看了下走位。"],
      ["队友", "你小心点，论坛已经有人在猜了。"]
    ],
    choices: [
      c("不管了，先练完今天这段。", "队友没再追问。你们重新放音乐，镜子里的你看起来比刚才稳了一点。", { 事业: 5, 隐蔽: 2 }),
      c("给我链接。", "你点进去三分钟，心态掉了八格。网友对鞋底的观察力不应该被浪费在这里。", { 心态: -8, 舆情: 4 }),
      c("我去问一下后续安排。", "工作人员确认你只是临时补位。你拿到了一个说得出口的解释。", { 事业: 4, 隐蔽: 3 })
    ]
  }
};

const endings = [
  { id: "breakdown", title: "团没塌，你先塌了", test: s => s.stats.心态 <= 0, text: "你看完最后一条评论，突然觉得整个内娱都不值得。第二天，你把所有 App 移到文件夹最后一页，命名为“少管我”。" },
  { id: "exposed", title: "被扒得很完整，但嘴硬得很成功", test: s => s.stats.隐蔽 <= 10 && s.stats.舆情 >= 70, text: "你的旧账号、旧头像、旧朋友圈和小学作文都被翻了出来。你唯一的胜利是：没有一句承认。" },
  { id: "career_clear", title: "事业线通关：合作名单常驻", test: s => s.stats.事业 >= 80 && s.stats.舆情 < 55, text: "一开始没人知道你是谁。三十天后，所有项目表格里都多了一行你的名字。" },
  { id: "relationship_clear", title: "关系线通关：没有公开，但所有人都懂了", test: s => s.stats.关系 >= 75 && s.stats.隐蔽 >= 45 && s.stats.舆情 < 65, text: "你们没有多说什么。只是后来每一次混乱现场，总有人下意识先看向你。" },
  { id: "topic_blacklist", title: "超话黑名单永久居民", test: s => s.stats.舆情 >= 85 && s.stats.隐蔽 < 40, text: "你的名字成了超话违禁词。某种意义上，你也算拥有了专属词条。" },
  { id: "hidden_boss", title: "低调路人，实则隐藏大佬", test: s => s.stats.隐蔽 >= 80 && s.stats.事业 >= 55, text: "没人拍到你，没人扒到你，但每次关键节点都有你的痕迹。粉圈称之为玄学，项目组称之为靠谱。" },
  { id: "project_owner", title: "你没有成为嫂子，你成为了项目负责人", test: s => s.stats.事业 >= 70 && s.stats.关系 < 60, text: "故事没有走向暧昧。故事走向了排期、预算、复盘会和所有人都找你要最终版。" },
  { id: "survived", title: "试运行存活", test: () => true, text: "三十天过去，你没有大红，也没有大翻车。你只是更清楚地知道，内娱真正的怪不是别人，是每周一的待办。" }
];

const initialState = {
  version: SAVE_VERSION,
  screen: "intro",
  day: 1,
  identityId: null,
  role: "入口身份未定",
  stats: Object.fromEntries(STAT_NAMES.map(name => [name, 0])),
  usedScenes: [],
  history: [],
  currentScene: null,
  pendingResult: null,
  pendingPhone: null,
  weekReport: null,
  ending: null
};

let state = loadState() || structuredClone(initialState);

const stage = document.querySelector("#mainStage");
const dayValue = document.querySelector("#dayValue");
const weekValue = document.querySelector("#weekValue");
const identityName = document.querySelector("#identityName");
const identityTrait = document.querySelector("#identityTrait");
const statsList = document.querySelector("#statsList");
const historyList = document.querySelector("#historyList");

document.querySelector("#saveButton").addEventListener("click", saveState);
document.querySelector("#resetButton").addEventListener("click", resetGame);

render();

function c(label, result, effects, phone = null, role = null) {
  return { label, result, effects, phone, role };
}

function render() {
  renderSidebar();
  if (state.ending) return renderEnding();
  if (state.pendingPhone) return renderPhone(phoneStories[state.pendingPhone]);
  if (state.pendingResult) return renderResult();
  if (state.weekReport) return renderWeekReport();
  if (state.screen === "intro" || !state.identityId) return renderIntro();
  ensureScene();
  renderDayScene();
}

function renderSidebar() {
  const identity = getIdentity();
  dayValue.textContent = state.day;
  weekValue.textContent = `第${Math.ceil(state.day / 7)}周`;
  identityName.textContent = identity ? `${identity.name} / ${state.role}` : "未选择";
  identityTrait.textContent = identity ? identity.trait : "先选择一个入口。";

  statsList.innerHTML = STAT_NAMES.map(name => {
    const value = clamp(state.stats[name]);
    const danger = name === "舆情" ? value >= 70 : value <= 25;
    const warn = name === "舆情" ? value >= 50 && value < 70 : value <= 45 && value > 25;
    return `
      <div class="stat-row">
        <div class="stat-top"><span>${name}</span><span>${value}</span></div>
        <div class="stat-track"><div class="stat-fill ${danger ? "danger" : warn ? "warn" : ""}" style="width:${value}%"></div></div>
      </div>
    `;
  }).join("");

  const today = state.history.filter(item => item.day === state.day).slice(-6).reverse();
  historyList.innerHTML = today.length
    ? today.map(item => `<div class="history-item">${item.text}</div>`).join("")
    : `<div class="history-item">今日更新还没开始。</div>`;
}

function renderIntro() {
  stage.innerHTML = `
    <div class="screen intro-screen">
      <div class="intro-copy">
        <p class="eyebrow">ONER宇宙入口测试</p>
        <h2>你有30天。每天只有一个关键选择。</h2>
        <p>每一天都会更新一个具体场景。你不再刷行动点，而是在工作、粉圈、舆情、关系和自我生活之间做一次反应。选择会立刻给出后果，并慢慢改变你的身份位置。</p>
      </div>
      <div class="identity-grid">
        ${identities.map(identity => `
          <button class="identity-option" type="button" data-identity="${identity.id}">
            <strong>${identity.name}</strong>
            <span>${identity.intro}</span>
          </button>
        `).join("")}
      </div>
    </div>
  `;

  stage.querySelectorAll("[data-identity]").forEach(button => {
    button.addEventListener("click", () => chooseIdentity(button.dataset.identity));
  });
}

function renderDayScene() {
  const scene = state.currentScene;
  stage.innerHTML = `
    <div class="screen event-screen">
      <div>
        <div class="event-tags">
          <span>Day ${state.day}</span>
          <span>${scene.location}</span>
          ${scene.tags.map(tag => `<span>${tag}</span>`).join("")}
        </div>
        <h2 class="event-title">${scene.title}</h2>
        <p class="event-text">${scene.text}</p>
      </div>
      <div class="choice-grid">
        ${scene.choices.map((choice, index) => `
          <button class="choice-button" type="button" data-choice="${index}">
            ${choice.label}
          </button>
        `).join("")}
      </div>
    </div>
  `;

  stage.querySelectorAll("[data-choice]").forEach(button => {
    button.addEventListener("click", () => chooseSceneOption(Number(button.dataset.choice)));
  });
}

function renderResult() {
  const result = state.pendingResult;
  stage.innerHTML = `
    <div class="screen result-screen">
      <div>
        <p class="eyebrow">行动反馈</p>
        <h2 class="event-title">${result.title}</h2>
        <p class="event-text">${result.text}</p>
      </div>
      <div class="delta-list">
        ${Object.entries(result.effects).map(([name, value]) => `
          <span class="delta-chip ${value >= 0 ? "plus" : "minus"}">${name} ${value >= 0 ? "+" : ""}${value}</span>
        `).join("")}
        ${result.role ? `<span class="delta-chip role">身份流转：${result.role}</span>` : ""}
      </div>
      <button class="primary-button" type="button" id="continueResult">${result.phone ? "查看手机" : "进入下一天"}</button>
    </div>
  `;

  document.querySelector("#continueResult").addEventListener("click", () => {
    const phone = state.pendingResult.phone;
    state.pendingResult = null;
    if (phone) {
      state.pendingPhone = phone;
    } else {
      advanceDay();
    }
    persistAndRender();
  });
}

function renderPhone(story) {
  stage.innerHTML = `
    <div class="screen phone-screen">
      <div class="phone-frame">
        <div class="phone-top"><span>${story.title}</span><span>${story.type}</span></div>
        <div class="phone-messages">
          ${story.messages.map(([sender, text]) => {
            const cls = sender === "玩家" ? "message player" : "message";
            return `<div class="${cls}"><strong>${sender}</strong><br>${text}</div>`;
          }).join("")}
        </div>
        <div class="phone-input">选择一条回复...</div>
      </div>
      <div class="phone-side">
        <p class="eyebrow">捡手机剧情</p>
        <h2>${story.title}</h2>
        <p>${story.prompt}</p>
        <div class="choice-grid">
          ${story.choices.map((choice, index) => `
            <button class="choice-button" type="button" data-phone-choice="${index}">
              ${choice.label}
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  stage.querySelectorAll("[data-phone-choice]").forEach(button => {
    button.addEventListener("click", () => choosePhoneOption(Number(button.dataset.phoneChoice)));
  });
}

function renderWeekReport() {
  stage.innerHTML = `
    <div class="screen week-screen">
      <div>
        <p class="eyebrow">周结算</p>
        <h2 class="event-title">第${Math.ceil((state.day - 1) / 7)}周复盘</h2>
      </div>
      <div class="week-report">
        ${state.weekReport.map(line => `<div class="report-line">${line}</div>`).join("")}
      </div>
      <button class="primary-button" type="button" id="continueWeek">继续试运行</button>
    </div>
  `;
  document.querySelector("#continueWeek").addEventListener("click", () => {
    state.weekReport = null;
    persistAndRender();
  });
}

function renderEnding() {
  stage.innerHTML = `
    <div class="screen ending-screen">
      <div>
        <p class="eyebrow">最终判定</p>
        <h2 class="ending-title">${state.ending.title}</h2>
        <p class="ending-text">${state.ending.text}</p>
      </div>
      <div class="ending-stats">
        ${STAT_NAMES.map(name => `<div class="ending-stat">${name}：${state.stats[name]}</div>`).join("")}
        <div class="ending-stat">最终身份：${state.role}</div>
      </div>
      <button class="primary-button" type="button" id="restartEnding">重新试运行</button>
    </div>
  `;
  document.querySelector("#restartEnding").addEventListener("click", resetGame);
}

function chooseIdentity(id) {
  const identity = identities.find(item => item.id === id);
  state = {
    ...structuredClone(initialState),
    screen: "day",
    identityId: id,
    role: identity.name,
    stats: { ...identity.stats },
    history: [{ day: 1, text: `入口身份：${identity.name}。` }]
  };
  ensureScene();
  persistAndRender();
}

function chooseSceneOption(index) {
  const scene = state.currentScene;
  const choice = scene.choices[index];
  applyEffects(choice.effects);
  if (choice.role) state.role = choice.role;
  state.usedScenes.push(scene.id);
  addHistory(`选择：${choice.label}`);
  addHistory(`结果：${summarizeEffects(choice.effects)}`);
  state.pendingResult = {
    title: scene.title,
    text: choice.result,
    effects: choice.effects,
    role: choice.role,
    phone: choice.phone
  };
  state.currentScene = null;
  setAutoRole();
  checkImmediateEnding();
  persistAndRender();
}

function choosePhoneOption(index) {
  const story = phoneStories[state.pendingPhone];
  const choice = story.choices[index];
  applyEffects(choice.effects);
  if (choice.role) state.role = choice.role;
  addHistory(`手机回复：${choice.label}`);
  addHistory(`手机结果：${summarizeEffects(choice.effects)}`);
  state.pendingPhone = null;
  state.pendingResult = {
    title: story.title,
    text: choice.result,
    effects: choice.effects,
    role: choice.role,
    phone: null
  };
  checkImmediateEnding();
  persistAndRender();
}

function advanceDay() {
  if (state.day >= 30) {
    setFinalEnding();
    return;
  }

  state.day += 1;
  addHistory("新的一天开始。");

  if ((state.day - 1) % 7 === 0) {
    state.weekReport = buildWeekReport();
  } else {
    ensureScene();
  }
}

function ensureScene() {
  if (state.currentScene || !state.identityId) return;
  state.currentScene = selectScene();
}

function selectScene() {
  const candidates = sceneDeck.filter(scene => {
    const [minDay, maxDay] = scene.dayRange || [1, 30];
    if (state.day < minDay || state.day > maxDay) return false;
    if (scene.identities && !scene.identities.includes(state.identityId)) return false;
    if (scene.minStats && !Object.entries(scene.minStats).every(([key, value]) => state.stats[key] >= value)) return false;
    if (scene.maxStats && !Object.entries(scene.maxStats).every(([key, value]) => state.stats[key] <= value)) return false;
    return !state.usedScenes.includes(scene.id);
  });

  const fallback = sceneDeck.filter(scene => !state.usedScenes.includes(scene.id));
  const pool = candidates.length ? candidates : fallback.length ? fallback : sceneDeck;
  return pool[Math.floor(Math.random() * pool.length)];
}

function buildWeekReport() {
  const report = [];
  if (state.stats.心态 < 25) report.push("心态低位。你已经开始把每一次通知声听成警报。");
  if (state.stats.隐蔽 < 25) report.push("隐蔽低位。下周任何公开动作都可能变成新截图。");
  if (state.stats.舆情 > 70) report.push("舆情高位。不是每个热度都能被你解释成误会。");
  if (state.stats.事业 > 65) report.push("事业走高。项目组开始默认你能解决问题，这也是一种身份流转。");
  if (state.stats.关系 > 60) report.push("关系走近。更多私聊、试探和边界问题会自然出现。");
  if (!report.length) report.push("本周没有大爆炸。你暂时保住了现实生活和内娱生活之间那条细线。");
  return report;
}

function applyEffects(effects) {
  Object.entries(effects).forEach(([key, value]) => {
    state.stats[key] = clamp((state.stats[key] || 0) + value);
  });
}

function setAutoRole() {
  if (state.stats.舆情 >= 80 && state.stats.隐蔽 < 45) state.role = "粉圈重点观察对象";
  else if (state.stats.事业 >= 82 && state.stats.舆情 < 60) state.role = "合作名单常驻候补";
  else if (state.stats.隐蔽 >= 78 && state.stats.事业 >= 50) state.role = "隐形操盘手";
  else if (state.stats.关系 >= 70 && state.stats.隐蔽 >= 45) state.role = "关系线高风险知情人";
}

function checkImmediateEnding() {
  if (state.stats.心态 <= 0) setFinalEnding();
}

function setFinalEnding() {
  state.ending = endings.find(ending => ending.test(state));
  state.currentScene = null;
  state.pendingResult = null;
  state.pendingPhone = null;
  state.weekReport = null;
}

function summarizeEffects(effects) {
  return Object.entries(effects)
    .map(([name, value]) => `${name}${value >= 0 ? "+" : ""}${value}`)
    .join("，");
}

function addHistory(text) {
  state.history.push({ day: state.day, text });
  state.history = state.history.slice(-100);
}

function getIdentity() {
  return identities.find(identity => identity.id === state.identityId);
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function persistAndRender() {
  localStorage.setItem("oner-sim-save", JSON.stringify(state));
  render();
}

function saveState() {
  addHistory("手动存档完成。");
  localStorage.setItem("oner-sim-save", JSON.stringify(state));
  render();
}

function loadState() {
  try {
    const raw = localStorage.getItem("oner-sim-save");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && parsed.version === SAVE_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function resetGame() {
  localStorage.removeItem("oner-sim-save");
  state = structuredClone(initialState);
  render();
}
