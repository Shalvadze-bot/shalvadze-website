import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const siteOrigin = "https://shalvadze.com";

const commonTranslations = new Map([
    ["SHALVADZE home", "SHALVADZE 首页"],
    ["Primary navigation", "主导航"],
    ["Open navigation menu", "打开导航菜单"],
    ["Language options", "语言选项"],
    [">Home<", ">首页<"],
    [">About S.<", ">关于我们<"],
    [">Get a Quote<", ">申请报价<"],
    ["SOURCING · QUALITY CONTROL · LOGISTICS", "采购 · 质量控制 · 物流"],
    [">Services<", ">服务<"],
    [">Products<", ">产品<"],
    [">Contact<", ">联系我们<"],
    ["Reliable sourcing. Clear communication.<br>\n                    Business support across China.", "可靠的采购服务，清晰的沟通。<br>\n                    为您在中国开展业务提供支持。"],
    [">Legal<", ">法律信息<"],
    [">Privacy Policy<", ">隐私政策<"],
    [">Terms &amp; Conditions<", ">条款与条件<"],
    [">For Business Inquiries<", ">商务咨询<"],
    ["© 2026 SHALVADZE. All rights reserved.", "© 2026 SHALVADZE。保留所有权利。"],
    ["SHALVADZE footer", "SHALVADZE 页脚"],
    ["Legal information", "法律信息"],
    ["Back to top", "返回顶部"]
]);

const pageTranslations = {
    "index.html": new Map([
        ["REAL PEOPLE. REAL PRODUCTS. REAL RESULTS.", "真实团队。真实产品。切实成果。"],
        ["Your Business in China.<br>On the Ground.", "您的中国业务，<br>我们扎根当地。"],
        ["From sourcing and supplier research to quality control and logistics, we help you manage business in China with confidence.", "从采购、供应商调研到质量控制与物流，我们帮助您满怀信心地管理在中国的业务。"],
        ["Product samples and stationery being inspected at a factory worktable", "在工厂工作台上检查产品样品与文具"],
        [">SOURCING<", ">采购<"],
        [">QUALITY CONTROL<", ">质量控制<"],
        [">LOGISTICS<", ">物流<"],
        ["Find the right suppliers", "寻找合适的供应商"],
        ["Ensure consistent quality", "确保品质稳定"],
        ["From China to your market", "从中国送达您的市场"],
        ["SHALVADZE | Trading & Sourcing", "SHALVADZE | 贸易与采购服务"],
        ["SHALVADZE is a Hong Kong-based sourcing and business support company helping businesses find reliable suppliers, manage sourcing, quality control and international trade from China.", "SHALVADZE 是一家总部位于香港的采购与商务支持公司，帮助企业在中国寻找可靠供应商，并提供采购管理、质量控制及国际贸易支持。"],
        ["China sourcing, sourcing company Hong Kong, supplier research, factory sourcing, quality control China, international trading, PP plastic stationery, office products", "中国采购，香港采购公司，供应商调研，工厂采购，中国质量控制，国际贸易，PP塑料文具，办公用品"],
        ["SHALVADZE | China Sourcing & Business Support", "SHALVADZE | 中国采购与商务支持"],
        ["Connecting businesses with reliable suppliers and practical sourcing solutions from China.", "帮助企业对接可靠供应商，提供务实的中国采购解决方案。"],
        ["Connecting markets.", "连接不同市场。"],
        ["Building Trust.<br>\n                    Creating Value.", "建立信任。<br>\n                    创造价值。"],
        ["SHALVADZE is your trusted partner for sourcing,\n                    quality control, and logistics. We connect businesses\n                    with reliable suppliers and deliver results.", "SHALVADZE 是您值得信赖的采购、\n                    质量控制与物流合作伙伴。我们帮助企业\n                    对接可靠供应商，推动项目顺利落地。"],
        ["About Us", "了解我们"],
        ['Get a Quote <span aria-hidden="true">→</span>', '申请报价 <span aria-hidden="true">→</span>'],
        ["ABOUT SHALVADZE", "关于 SHALVADZE"],
        ["Building connections across markets.", "连接市场，建立合作。"],
        ["SHALVADZE is a Hong Kong-based trading and sourcing company connecting businesses with trusted manufacturing partners across international markets.", "SHALVADZE 是一家总部位于香港的贸易与采购公司，帮助企业与不同市场中值得信赖的制造伙伴建立联系。"],
        ["We help businesses identify suitable suppliers, explore competitive sourcing opportunities and develop reliable international supply relationships.", "我们协助企业寻找合适的供应商、评估具竞争力的采购机会，并建立稳定可靠的国际供应关系。"],
        ["HOW WE CAN WORK WITH YOU", "我们的合作方式"],
        ["Choose the Support<br>That Fits Your Business", "选择适合您业务的<br>采购支持方式"],
        ["Whether you want us to manage the entire process or just find the right factory,<br>\n                        we have flexible models to support your sourcing from China.", "无论您希望我们管理整个流程，还是只协助寻找合适的工厂，<br>\n                        我们都能以灵活的合作方式支持您在中国采购。"],
        ["Full Sourcing Support", "全流程采购支持"],
        ["We manage the entire process in China,<br>\n                            from supplier search to delivery.<br>\n                            You focus on your business, we handle the rest.", "从寻找供应商到交付，<br>\n                            我们为您管理在中国的整个流程。<br>\n                            您专注业务，其余交给我们。"],
        ["Wholesale Supply", "批发供货"],
        ["Tell us what you're looking for,<br>\n                            your quantity and target price.<br>\n                            We search China for suitable supply options.", "告诉我们您需要的产品、<br>\n                            数量和目标价格。<br>\n                            我们将从中国寻找合适的供货方案。"],
        ["Project-Based Sourcing", "项目制采购"],
        ["We research, compare and negotiate factory<br>\n                            options. You choose the offer and purchase<br>\n                            directly from the factory.", "我们调研、比较并协商不同工厂方案。<br>\n                            您选择合适的报价，<br>\n                            并直接向工厂采购。"],
        ["Learn more", "了解更多"],
        ["PRODUCTS WE SOURCE", "我们采购的产品"],
        ["What We Source<br>for Your Business", "我们为您的业务<br>采购哪些产品"],
        ["We specialize in PP plastic stationery and source a wide range of quality products from trusted manufacturers in China.", "我们专注于 PP 塑料文具，也从中国可靠的制造商采购多种优质产品。"],
        ["Product categories", "产品类别"],
        ["Our Expertise", "我们的专长"],
        ["PP Plastic Stationery", "PP 塑料文具"],
        ["Explore Products", "查看产品"],
        ["Other Categories", "其他类别"],
        ["More Products We Source", "更多可采购产品"],
        ["Browse Categories", "浏览类别"],
        ["Product sourcing assistance", "产品采购协助"],
        ["Can’t find what you’re looking for?", "没有找到您需要的产品？"],
        ["Contact us and we’ll help you source it.", "联系我们，我们会协助您采购。"],
        ["Say Hi to Our Team", "联系我们的团队"],
        ["OUR EXPERTISE", "我们的专长"],
        ["School Products", "学校用品"],
        ["PP plastic folders, document files, notebooks, pencil cases, rulers and other school essentials.", "PP 塑料文件夹、资料袋、笔记本、笔袋、直尺及其他常用学校用品。"],
        ["Office Products", "办公用品"],
        ["PP file folders, document holders, organizers, clipboards and other office accessories.", "PP 文件夹、资料收纳袋、整理用品、写字板及其他办公配件。"],
        ["EXPLORE SUBCATEGORIES", "浏览子类别"],
        ["PP Folders", "PP 文件夹"],
        ["Document Files", "资料袋"],
        ["Notebooks", "笔记本"],
        ["Pencil Cases", "笔袋"],
        ["Rulers", "直尺"],
        ["School Sets", "学习套装"],
        ["Practical PP school supplies in a range of formats for organized, everyday use.", "多种款式的实用 PP 学校用品，方便日常分类与整理。"],
        ["View all school products", "查看全部学校用品"],
        ["File Folders", "文件夹"],
        ["Document Holders", "资料收纳袋"],
        ["Organizers", "整理用品"],
        ["Clipboards", "写字板"],
        ["Desk Accessories", "桌面配件"],
        ["Storage Boxes", "收纳盒"],
        ["Functional office products that support clear filing, storage and workspace organization.", "实用的办公用品，帮助您更清晰地归档、收纳和整理工作空间。"],
        ["View all office products", "查看全部办公用品"],
        ["OTHER CATEGORIES", "其他类别"],
        [">Textile<", ">纺织品<"],
        ["Quality fabrics and textile products for various business needs.", "满足不同业务需求的优质面料与纺织产品。"],
        ["Pet Supplies", "宠物用品"],
        ["Practical and reliable supplies for pets and pet businesses.", "适合宠物及宠物相关企业的实用可靠用品。"],
        ["Accessories", "配饰"],
        ["Fashion and lifestyle accessories in a variety of designs.", "多种设计风格的时尚与生活配饰。"],
        [">Toys<", ">玩具<"],
        ["Safe and fun toys for children in different categories.", "多种类别、安全有趣的儿童玩具。"],
        ["CONTACT", "联系我们"],
        ["SAY HI", "欢迎联系"],
        ["Let’s get to know each other. Tell us what you’re looking for and we’ll figure out the best way to help.", "期待认识您。告诉我们您在寻找什么，我们会一起梳理最合适的支持方式。"],
        ["CHAT WITH US", "在线沟通"],
        ["Quick questions? Want to sound out an idea? Drop us a message and we’ll reply within a few hours.", "有简单问题，或想先聊聊想法？给我们留言，我们通常会在几小时内回复。"],
        ["START CHAT", "开始沟通"],
        ["Typically replies in 2–4 hours", "通常在 2–4 小时内回复"],
        ["SEND AN EMAIL", "发送邮件"],
        ["Detailed inquiry? Share your requirements and we’ll get back with a tailored quote within 24 hours.", "如需详细咨询，请发送您的需求，我们会在 24 小时内回复并提供针对性报价。"],
        ["WRITE EMAIL", "写邮件"],
        ["Reply within 24 hours", "24 小时内回复"],
        ["PRODUCT REQUEST", "产品需求"],
        ["Looking for a product from China?", "正在寻找中国供应的产品？"],
        ["Tell us what you need, your quantity, target price and destination. We’ll review your request and get back to you.", "告诉我们所需产品、数量、目标价格和目的地。我们会审核您的需求并与您联系。"],
        ["SUBMIT REQUEST", "提交需求"],
        ["Tell us what you need. We’ll take it from there.", "告诉我们您的需求，后续交给我们。"],
        ["Prefer to reach out directly?", "希望直接联系我们？"],
        ["Say Hi", "欢迎联系"],
        ["Choose how you’d like to reach us.", "请选择您方便的联系方式。"],
        ["Chat with us", "在线沟通"],
        ["Send an email", "发送邮件"],
        ["Product request", "产品需求"],
        ["Request a Quote", "申请报价"],
        ["Tell us about your sourcing requirements and we'll get back to you as soon as possible.", "请告诉我们您的采购需求，我们会尽快与您联系。"],
        ["Full Name *", "姓名 *"],
        ["Company *", "公司 *"],
        ["Email *", "邮箱 *"],
        [">Country<", ">国家/地区<"],
        ["Product Category *", "产品类别 *"],
        ["Select a category", "选择类别"],
        [">Textiles<", ">纺织品<"],
        [">Jewellery<", ">珠宝首饰<"],
        [">Stationery<", ">文具<"],
        [">Other<", ">其他<"],
        [">Message<", ">留言<"],
        ["Tell us what products you are looking for...", "请告诉我们您正在寻找哪些产品……"],
        ["Request a Quote →", "申请报价 →"]
    ]),
    "about.html": new Map([
        ["About SHALVADZE | On-the-Ground Sourcing Support", "关于 SHALVADZE | 中国本地采购支持"],
        ["Meet SHALVADZE, a founder-led Hong Kong sourcing partner providing practical, on-the-ground supplier, quality control and logistics support across China.", "了解 SHALVADZE：由创始人亲自参与、总部位于香港的采购合作伙伴，为企业提供覆盖中国的供应商、质量控制与物流支持。"],
        ["Practical sourcing and business support from China, for businesses worldwide.", "面向全球企业，提供务实的中国采购与商务支持。"],
        ["Two friends walking through an active commercial market street in China", "两位朋友走在中国繁忙的商业街区"],
        ["ABOUT SHALVADZE", "关于 SHALVADZE"],
        ["We’re on the ground<br>so you don’t have to be.", "我们扎根本地，<br>让您无需亲自奔波。"],
        ["Practical sourcing and business support <br>from China, for businesses worldwide.", "为全球企业提供务实的<br>中国采购与商务支持。"],
        ["Our Story", "我们的故事"],
        ["SHALVADZE started from something simple: <strong>knowing how business in China actually works on the ground.</strong>", "SHALVADZE 的起点很简单：<strong>真正了解在中国本地开展业务的方式。</strong>"],
        ["We want sourcing from China to feel approachable, whether you're an established company, a small business, or simply taking your first steps into sourcing. You don't need to be a big buyer to start a conversation with us.", "我们希望从中国采购是一件容易开始的事。无论您是成熟企业、小型公司，还是刚开始接触采购，都可以和我们聊聊；您不必是大买家。"],
        ["Finding a product is easy. Finding the right supplier, asking the right questions and making sure everything goes as expected is where the real work begins.", "找到产品并不难。真正的工作，是找到合适的供应商、问对问题，并确保每个环节按预期推进。"],
        ["That’s why I started SHALVADZE — to give businesses a reliable point of contact closer to the suppliers, factories and markets they work with.", "这正是我创立 SHALVADZE 的原因——为企业提供一个更靠近供应商、工厂与市场的可靠对接窗口。"],
        ["No complicated promises. Just practical support, clear communication and a genuine effort to get things right.", "没有复杂的承诺，只有务实的支持、清晰的沟通，以及把事情做好的真诚投入。"],
        ["Thanks for stopping by.<br>If there's something you're looking for, let's talk.", "感谢您的到访。<br>如果您正在寻找某种产品，欢迎与我们聊聊。"],
        ["Two founders sitting together informally with a laptop, documents and product samples", "两位创始人与笔记本电脑、文件和产品样品围坐交流"],
        ["Hong Kong harbour and skyline in warm golden light", "暖金色光线中的香港海港与天际线"],
        ["A lively Chinese commercial street and night market", "热闹的中国商业街与夜市"],
        ["Hong Kong is our base.<br>China is our playground.", "香港是我们的基地，<br>中国是我们的工作现场。"],
        ["Where We Operate", "我们的业务范围"],
        [">Hong Kong<", ">香港<"],
        ["Our home base.<br>Close to you,<br>close to the market.", "我们的基地。<br>离您更近，<br>也更贴近市场。"],
        [">China<", ">中国<"],
        ["Supplier research, factory visits,<br>quality checks and logistics.", "供应商调研、工厂走访、<br>质量检查与物流协调。"],
        [">Worldwide<", ">全球<"],
        ["Supporting businesses<br>across the globe.", "为全球各地的企业<br>提供支持。"],
        ["How We Work", "我们的工作方式"],
        ["Two people planning together over documents and sketches", "两人围绕文件与草图共同规划"],
        [">Understand<", ">了解需求<"],
        ["We listen. We understand<br>what you need.", "我们认真倾听，<br>了解您的实际需求。"],
        ["A sourcing professional researching products with a Chinese market supplier", "采购人员与中国市场供应商共同调研产品"],
        [">Find<", ">寻找方案<"],
        ["We find the right suppliers<br>and solutions.", "我们寻找合适的供应商<br>与解决方案。"],
        ["A supplier and sourcing team inspecting product samples together", "供应商与采购团队共同检查产品样品"],
        [">Verify<", ">核实评估<"],
        ["We verify quality, capability<br>and reliability.", "我们核实质量、能力<br>与可靠性。"],
        ["A delivery truck and container at a China logistics yard", "中国物流场站内的货车与集装箱"],
        [">Coordinate<", ">协调执行<"],
        ["We handle communication,<br>production and logistics.", "我们协调沟通、<br>生产与物流。"],
        ["A personal handover of a sealed package", "当面交付已密封的包裹"],
        [">Deliver<", ">按时交付<"],
        ["You receive what you need,<br>on time.", "您按时收到<br>所需产品。"],
        ["What We Work With", "我们涉及的产品"],
        ["Warm stationery, notebooks, pencils and pens", "暖色调的文具、笔记本、铅笔和钢笔"],
        ["Teddy bears and approachable children’s toys", "泰迪熊及亲切可爱的儿童玩具"],
        ["Neutral clothing and textiles on wooden hangers", "木衣架上的中性色服装与纺织品"],
        ["Gold jewellery and accessories arranged on light ceramic plates", "摆放在浅色陶瓷盘中的金色珠宝与配饰"],
        ["Notebooks, pencils and office desk accessories", "笔记本、铅笔与办公桌面配件"],
        ["Looking for something<br>in China?", "正在寻找<br>中国供应的产品？"],
        ["Tell us what you need.<br>We’ll take it from there.", "告诉我们您的需求，<br>后续交给我们。"],
        ["Submit a Product Request", "提交产品需求"]
    ]),
    "product-request.html": new Map([
        ["Product Request | SHALVADZE", "产品需求 | SHALVADZE"],
        ["Tell SHALVADZE what product you need from China, including quantity, target price and destination, and our team will review your request.", "告诉 SHALVADZE 您需要从中国采购的产品、数量、目标价格和目的地，我们的团队会审核您的需求。"],
        ["Tell us what you need. We’ll take it from there.", "告诉我们您的需求，后续交给我们。"],
        ["SOURCING SUPPORT", "采购支持"],
        [">Product Request<", ">产品需求<"],
        ["Product request details and form", "产品需求说明与表单"],
        ["HOW WE CAN HELP", "我们如何协助"],
        ["Looking for a product from China?", "正在寻找中国供应的产品？"],
        ["Share your requirement and we’ll review the most practical sourcing or supply route for your business.", "请告诉我们您的需求，我们会为您的业务评估最务实的采购或供货方案。"],
        ["Product Sourcing", "产品采购"],
        ["We identify suitable products and suppliers based on your requirement.", "我们会根据您的需求寻找合适的产品与供应商。"],
        ["Quality Focus", "重视质量"],
        ["We help coordinate samples, quality checks and approval before production.", "我们协助协调样品、质量检查及量产前确认。"],
        ["Commercial Approach", "务实的商业方案"],
        ["We consider quantity, target price and realistic supply options.", "我们综合考虑数量、目标价格与切实可行的供货选择。"],
        ["Logistics Support", "物流支持"],
        ["We can help coordinate shipping and delivery requirements.", "我们可以协助协调运输与交付要求。"],
        ["Need help before submitting?", "提交前需要帮助？"],
        ["Email us at", "请发送邮件至"],
        ["YOUR REQUIREMENT", "您的需求"],
        ["Submit Your Product Request", "提交您的产品需求"],
        ["Fields marked <span aria-hidden=\"true\">*</span><span class=\"sr-only\">with an asterisk</span> are required.", "标有 <span aria-hidden=\"true\">*</span><span class=\"sr-only\">星号</span> 的字段为必填项。"],
        ["Product Name / Description", "产品名称 / 描述"],
        ["What product are you looking for? Include specifications, materials or intended use.", "您在寻找什么产品？请提供规格、材料或用途等信息。"],
        ["Product URL", "产品链接"],
        ["Optional", "选填"],
        ["Leave empty or enter a complete product link, for example amazon.com/product", "可留空，或输入完整的产品链接，例如 amazon.com/product"],
        [">Quantity <", ">数量 <"],
        ["e.g. 500 pieces or 1,000 sets", "例如 500 件或 1,000 套"],
        ["Target Price", "目标价格"],
        ["e.g. USD 2.50 per unit", "例如每件 2.50 美元"],
        ["Destination Country / City", "目的国家 / 城市"],
        ["e.g. United Kingdom / London", "例如 英国 / 伦敦"],
        ["Your Name", "您的姓名"],
        ["Full name", "姓名"],
        ["Business Email", "商务邮箱"],
        ["Company Name", "公司名称"],
        ["Your company name", "您的公司名称"],
        ["Upload Product Photo / Reference", "上传产品图片 / 参考资料"],
        ["Choose a file or drag it here", "选择文件或拖到此处"],
        ["JPG, PNG or WEBP · maximum 5 MB", "JPG、PNG 或 WEBP · 最大 5 MB"],
        ["Additional Requirements / Message", "其他要求 / 留言"],
        ["Share packaging, certification, timing, delivery or other requirements.", "请说明包装、认证、时间、交付或其他要求。"],
        ["SUBMIT PRODUCT REQUEST", "提交产品需求"],
        ["Your information will only be used to review and respond to your request.", "您的信息仅用于审核并回复本次需求。"]
    ])
};

const pageSettings = {
    "index.html": {
        canonicalPath: "/zh/",
        englishPath: "/",
        englishLocalPath: "../index.html",
        chineseLocalPath: "index.html"
    },
    "about.html": {
        canonicalPath: "/zh/about.html",
        englishPath: "/about.html",
        englishLocalPath: "../about.html",
        chineseLocalPath: "about.html"
    },
    "product-request.html": {
        canonicalPath: "/zh/product-request.html",
        englishPath: "/product-request.html",
        englishLocalPath: "../product-request.html",
        chineseLocalPath: "product-request.html"
    }
};

const replaceAll = (source, replacements) => {
    let output = source;

    replacements.forEach((translation, english) => {
        output = output.split(english).join(translation);
    });

    return output;
};

const buildChinesePage = (fileName) => {
    const settings = pageSettings[fileName];
    let html = readFileSync(fileName, "utf8");

    html = replaceAll(html, commonTranslations);
    html = replaceAll(html, pageTranslations[fileName]);
    html = html.replace('<html lang="en">', '<html lang="zh-Hans">');

    const englishAbsoluteUrl = `${siteOrigin}${settings.englishPath}`;
    const chineseAbsoluteUrl = `${siteOrigin}${settings.canonicalPath}`;

    html = html.replace(
        /<link rel="canonical" href="[^"]+">/,
        `<link rel="canonical" href="${chineseAbsoluteUrl}">`
    );
    html = html.replace(
        /<link rel="alternate" hreflang="en" href="[^"]+">/,
        `<link rel="alternate" hreflang="en" href="${englishAbsoluteUrl}">`
    );
    html = html.replace(
        /<link rel="alternate" hreflang="zh-Hans" href="[^"]+">/,
        `<link rel="alternate" hreflang="zh-Hans" href="${chineseAbsoluteUrl}">`
    );
    html = html.replace(
        /<link rel="alternate" hreflang="x-default" href="[^"]+">/,
        `<link rel="alternate" hreflang="x-default" href="${englishAbsoluteUrl}">`
    );
    html = html.replace(
        /<meta property="og:url" content="[^"]+">/,
        `<meta property="og:url" content="${chineseAbsoluteUrl}">`
    );

    html = html.replace(
        /<div class="language-selector" aria-label="语言选项">[\s\S]*?<\/div>/,
        `<div class="language-selector" aria-label="语言选项">\n            <a class="language-option" href="${settings.englishLocalPath}" lang="en" hreflang="en" data-language="en"><span aria-hidden="true">🇬🇧</span> EN</a>\n            <a class="language-current" href="${settings.chineseLocalPath}" lang="zh-Hans" hreflang="zh-Hans" aria-current="page" data-language="zh"><span aria-hidden="true">🇨🇳</span> 中文</a>\n        </div>`
    );

    html = html
        .replaceAll('href="favicon', 'href="../favicon')
        .replaceAll('href="apple-touch-icon.png', 'href="../apple-touch-icon.png')
        .replaceAll('href="css/', 'href="../css/')
        .replaceAll('src="images/', 'src="../images/')
        .replaceAll('src="js/', 'src="../js/');

    return html;
};

mkdirSync("zh", { recursive: true });

Object.keys(pageSettings).forEach((fileName) => {
    writeFileSync(`zh/${fileName}`, buildChinesePage(fileName));
});
