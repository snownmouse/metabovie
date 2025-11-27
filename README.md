# MetaboViz 使用与开发指南 (中国优化版)

👋 你好！欢迎使用 **MetaboViz 代谢视界**。
这是一个基于 React 和 D3.js 的交互式系统生物学平台。为了确保在中国网络环境下流畅使用，我们已经做好了相关配置。

---

## 🚀 极速安装指南 (China Friendly)

由于国内网络环境原因，直接安装依赖可能会失败。请务必按照以下步骤操作：

### 1. 安装 Node.js
如果你的电脑还没有 Node.js，请去官网下载并安装（推荐下载 LTS 版本）：
[https://nodejs.org/](https://nodejs.org/)

### 2. 初始化项目
在你的电脑上新建一个文件夹（例如 `metaboviz`），进入该文件夹，打开终端（CMD 或 PowerShell）。

**关键步骤：设置淘宝镜像源 (加速下载)**
在终端输入以下命令：
```bash
npm config set registry https://registry.npmmirror.com
```

然后执行以下命令创建项目：
```bash
# 使用 Vite 快速创建 React + TypeScript 项目
npm create vite@latest . -- --template react-ts

# 安装 D3.js 依赖
npm install d3 @types/d3
```

### 3. 放入代码
将你收到的代码文件按照以下结构放入文件夹中：

*   **`index.html`** -> 替换根目录下的 `index.html`
*   **`vite.config.ts`** -> 放入根目录 (用于配置打包路径)
*   **`src/` 文件夹内** -> 删除原有的文件，放入以下文件：
    *   `App.tsx`, `index.tsx`, `types.ts`, `constants.ts`
    *   以及 `components/`, `data/`, `context/`, `services/` 文件夹

### 4. 启动开发服务器
在终端输入：
```bash
npm run dev
```
按住 `Ctrl` 点击显示的链接（例如 `http://localhost:5173`），即可看到完美的代谢图谱！

---

## 📦 如何打包成“离线版”发送给朋友

如果你想把做好的网页发给朋友，让他们**不用安装环境、断网也能直接打开**，请执行“打包”操作：

1. 在终端输入：
   ```bash
   npm run build
   ```
2. 等待几秒钟，项目文件夹下会多出一个 **`dist`** 文件夹。
3. 把这个 **`dist`** 文件夹压缩，发给你的朋友。
4. **注意**：由于浏览器的安全策略，直接双击 `dist/index.html` 可能会有图片或脚本加载限制。推荐你的朋友安装一个极小的工具 `Live Server` 或者使用 `http-server` 来打开它。
   * *最简单的发给朋友的方法是使用 GitHub Pages (见下文)*

---

## 🌍 最推荐：一键发布到 GitHub Pages

这是最稳妥的分享方式，朋友手机电脑都能看，不用传文件。

1. **准备 GitHub 仓库**
   登录 [GitHub](https://github.com) 创建新仓库。

2. **安装部署工具** (终端运行):
   ```bash
   npm install gh-pages --save-dev
   ```

3. **修改 package.json**
   打开 `package.json`，添加/修改以下两处：
   
   *添加 homepage:*
   ```json
   "homepage": "https://你的GitHub用户名.github.io/仓库名",
   ```
   
   *修改 scripts:*
   ```json
   "scripts": {
     "dev": "vite",
     "build": "tsc && vite build",
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   },
   ```

4. **发布**
   ```bash
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   
   # 最后执行发布命令
   npm run deploy
   ```
   等待片刻，把 `homepage` 里的链接发给朋友即可！

---

## ✏️ 如何修改数据

所有代谢通路的数据都存储在 **`src/data/mockData.ts`** 文件中。

### 1. 修改名字或描述
找到你想要修改的节点（Nodes）或连线（Links）。

### 2. 调整位置 (教科书级布局)
我们使用 `fx` (横坐标) 和 `fy` (纵坐标) 来精确控制节点位置。
```typescript
{ ..., fx: 250, fy: 100, ... } 
```

### 3. 设置细胞部位
```typescript
compartment: 'mitochondria' // 线粒体 (橙色背景)
compartment: 'cytosol'      // 细胞质 (灰色背景)
```

### 4. 标记考点 (重点!)
*   `isRateLimiting: true` -> 会显示红色五角星 ★ (限速酶)。
*   `examPoint: { en: '...', zh: '...' }` -> 会显示灯泡图标 💡 (考点提示)。

---

## 🔧 网络优化说明
本项目已进行以下优化以适应中国网络环境：
1. **FontAwesome 图标**：已替换为 `cdn.staticfile.org` (七牛云)，国内秒开。
2. **NPM 依赖**：推荐使用 `npmmirror` 淘宝镜像源。
3. **移除 Google Fonts**：使用系统默认字体，防止加载阻塞。

祝科研与学习顺利！
