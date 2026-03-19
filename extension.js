const vscode = require('vscode');

// 推荐设置项：让 VS Code 对小白更友好
const RECOMMENDED_SETTINGS = [
  {
    section: 'editor',
    key: 'fontSize',
    value: 15,
    label: '字号调大 (15px)',
    description: '比默认的 14px 更易读'
  },
  {
    section: 'editor',
    key: 'fontFamily',
    value: "'Maple Mono NF CN', 'Maple Mono NF', 'Maple Mono', Consolas, 'Courier New', monospace",
    label: '使用 Maple Mono 字体',
    description: '圆润温暖的编程字体'
  },
  {
    section: 'editor',
    key: 'lineHeight',
    value: 1.8,
    label: '加大行距 (1.8)',
    description: '代码不那么密集，阅读更舒服'
  },
  {
    section: 'editor',
    key: 'fontLigatures',
    value: true,
    label: '开启字体连字',
    description: '=> != 等符号更美观'
  },
  {
    section: 'terminal.integrated',
    key: 'fontFamily',
    value: "'Maple Mono NF CN', 'Maple Mono NF', 'Maple Mono', monospace",
    label: '终端使用 Maple Mono 字体',
    description: '终端也用同款字体，风格统一'
  },
  {
    section: 'editor',
    key: 'minimap.enabled',
    value: false,
    label: '隐藏右侧小地图',
    description: '去掉右边那个密密麻麻的代码缩略图'
  },
  {
    section: 'editor',
    key: 'cursorBlinking',
    value: 'smooth',
    label: '光标平滑闪烁',
    description: '光标动画更柔和'
  },
  {
    section: 'editor',
    key: 'cursorSmoothCaretAnimation',
    value: 'on',
    label: '光标平滑移动',
    description: '光标移动时有过渡动画'
  },
  {
    section: 'editor',
    key: 'smoothScrolling',
    value: true,
    label: '平滑滚动',
    description: '滚动时更丝滑'
  },
  {
    section: 'editor',
    key: 'padding.top',
    value: 16,
    label: '编辑器顶部留白',
    description: '代码不贴着顶部，更透气'
  },
  {
    section: 'editor',
    key: 'renderWhitespace',
    value: 'none',
    label: '隐藏空白字符',
    description: '不显示那些小灰点'
  },
  {
    section: 'editor',
    key: 'bracketPairColorization.enabled',
    value: true,
    label: '括号配对彩色高亮',
    description: '一眼看清括号层级'
  },
  {
    section: 'editor',
    key: 'guides.bracketPairs',
    value: 'active',
    label: '括号配对引导线',
    description: '当前括号层级用线连起来'
  },
  {
    section: 'breadcrumbs',
    key: 'enabled',
    value: false,
    label: '隐藏面包屑导航',
    description: '编辑器顶部那行路径导航，新手用不到'
  },
  {
    section: 'workbench',
    key: 'tips.enabled',
    value: false,
    label: '关闭启动提示',
    description: '不再弹出使用技巧'
  },
  {
    section: 'workbench',
    key: 'startupEditor',
    value: 'welcomePage',
    label: '启动时显示欢迎页',
    description: '方便快速打开项目和文件'
  },
  {
    section: 'workbench',
    key: 'layoutControl.enabled',
    value: false,
    label: '隐藏布局控制按钮',
    description: '右上角那个布局按钮，减少干扰'
  },
  {
    section: 'window',
    key: 'commandCenter',
    value: true,
    label: '显示顶部命令栏',
    description: '标题栏中间的搜索框，方便找功能'
  },
  {
    section: 'workbench',
    key: 'activityBar.location',
    value: 'top',
    label: '活动栏移到顶部',
    description: '左侧图标栏移到顶部，界面更宽敞'
  }
];

function activate(context) {
  // 注册一键应用推荐设置命令
  const applyCmd = vscode.commands.registerCommand('milkTea.applySettings', async () => {
    const config = vscode.workspace.getConfiguration();

    // 找出哪些设置和当前不同
    const pending = RECOMMENDED_SETTINGS.filter(s => {
      const current = config.get(`${s.section}.${s.key}`);
      return current !== s.value;
    });

    if (pending.length === 0) {
      vscode.window.showInformationMessage('所有推荐设置已经应用了！');
      return;
    }

    // 让用户选择要应用哪些
    const picks = await vscode.window.showQuickPick(
      pending.map(s => ({
        label: s.label,
        description: s.description,
        detail: `${s.section}.${s.key} → ${JSON.stringify(s.value)}`,
        picked: true,
        setting: s
      })),
      {
        canPickMany: true,
        placeHolder: `有 ${pending.length} 项推荐设置可以应用，取消勾选你不想改的`,
        title: 'Milk Tea 推荐设置'
      }
    );

    if (!picks || picks.length === 0) return;

    // 应用选中的设置
    for (const pick of picks) {
      const s = pick.setting;
      await config.update(`${s.section}.${s.key}`, s.value, vscode.ConfigurationTarget.Global);
    }

    vscode.window.showInformationMessage(`已应用 ${picks.length} 项推荐设置！`);
  });

  // 注册恢复默认设置命令
  const resetCmd = vscode.commands.registerCommand('milkTea.resetSettings', async () => {
    const confirm = await vscode.window.showWarningMessage(
      '确定要恢复这些设置为 VS Code 默认值吗？',
      { modal: true },
      '确定恢复'
    );

    if (confirm !== '确定恢复') return;

    const config = vscode.workspace.getConfiguration();
    for (const s of RECOMMENDED_SETTINGS) {
      await config.update(`${s.section}.${s.key}`, undefined, vscode.ConfigurationTarget.Global);
    }

    vscode.window.showInformationMessage('已恢复为 VS Code 默认设置');
  });

  context.subscriptions.push(applyCmd, resetCmd);

  // 字体安装提醒（只提示一次）
  const hasPrompted = context.globalState.get('milkTea.fontPrompted', false);
  if (!hasPrompted) {
    const fontFamily = vscode.workspace.getConfiguration('editor').get('fontFamily', '');
    if (!fontFamily.toLowerCase().includes('maple mono')) {
      vscode.window
        .showInformationMessage(
          'Milk Tea 主题推荐安装 Maple Mono 字体以获得最佳体验',
          '去下载',
          '已安装',
          '不再提醒'
        )
        .then((choice) => {
          if (choice === '去下载') {
            vscode.env.openExternal(
              vscode.Uri.parse('https://github.com/subframe7536/maple-font/releases')
            );
          }
          if (choice === '已安装' || choice === '不再提醒') {
            context.globalState.update('milkTea.fontPrompted', true);
          }
        });
    }
  }

  // 首次安装提醒应用推荐设置
  const hasShownSetup = context.globalState.get('milkTea.setupShown', false);
  if (!hasShownSetup) {
    vscode.window
      .showInformationMessage(
        '欢迎使用 Milk Tea 主题！要一键应用推荐设置让 VS Code 更舒服吗？',
        '好的，去看看',
        '不了'
      )
      .then((choice) => {
        if (choice === '好的，去看看') {
          vscode.commands.executeCommand('milkTea.applySettings');
        }
        context.globalState.update('milkTea.setupShown', true);
      });
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
