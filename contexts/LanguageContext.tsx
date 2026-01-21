import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.closet': '衣橱',
    'nav.lab': '实验室',
    'nav.profile': '我的',

    // Home
    'home.greeting': '早安，',
    'home.subtitle': '准备好今天的穿搭了吗？',
    'home.ai_pick': 'AI 搭配师推荐',
    'home.trending': '衣橱常穿',
    'home.consulting': '正在咨询 AI 搭配师...',
    'home.no_clothes': '衣橱空空如也，快去添加衣物吧！',
    'home.weather.sunny': '晴朗',
    'home.weather.cloudy': '多云',
    'home.weather.rain': '雨',
    'home.weather.snow': '雪',
    'home.weather.partly_cloudy': '局部多云',
    'home.stats.height': '身高',
    'home.stats.weight': '体重',
    'home.stats.size': '尺码',
    'home.read_more': '展开全文',
    'home.read_less': '收起',

    // Closet Main
    'closet.title': '数字衣橱',
    'closet.tab.items': '单品',
    'closet.tab.outfits': '套装',
    'closet.add_item': '添加新衣物',
    'closet.create_outfit': '创建套装',
    'closet.upload_photo': '上传照片',
    'closet.or_import': '或导入',
    'closet.paste_link': '粘贴商品链接',
    'closet.enter_url': '请输入图片链接',
    'closet.add_url': '添加链接',
    'closet.analyzing': 'AI 正在分析...',
    'closet.analyzing_sub': '智能去底 & 打标中',
    'closet.confirm': '确认并保存',
    'closet.save_outfit': '保存套装',
    'closet.outfit_name_placeholder': '给套装起个名字 (如: 周末野餐)',
    'closet.select_items': '选择单品',
    'closet.selected': '已选',
    'closet.no_items': '该分类下暂无衣物',
    'closet.no_outfits': '暂无套装，快去搭配吧！',
    'closet.new_item_manual': '新衣物 (AI未识别)',
    'closet.cors_hint': '提示: 部分图片可能因安全限制无法进行AI分析，将直接保存。',
    
    // Categories
    'closet.cat.all': '全部',
    'closet.cat.top': '上装',
    'closet.cat.bottom': '下装',
    'closet.cat.shoes': '鞋履',
    'closet.cat.outerwear': '外套',
    'closet.cat.accessory': '配饰',
    'closet.cat.dress': '连衣裙',

    // Detail Pages
    'detail.cpw': '单次穿着成本 (CPW)',
    'detail.price': '购入价格',
    'detail.wear_count': '穿着次数',
    'detail.brand': '品牌',
    'detail.rating': '喜爱程度',
    'detail.care': '洗护建议',
    'detail.edit': '编辑',
    'detail.save': '保存',
    'detail.cancel': '取消',
    'detail.delete': '删除',
    'detail.share': '分享',
    'detail.share_success': '链接已复制！',
    'detail.delete_confirm': '确定要删除吗？',
    'detail.archive': '归档',
    'detail.outfit_items': '包含单品',
    'detail.wear_history': '穿着记录',
    'detail.total_value': '套装总价',
    'detail.no_history': '暂无穿着记录',
    'detail.description': '描述',
    'detail.name': '名称',

    // Lab
    'lab.title': '风格实验室',
    'lab.intro': '你好！我是你的专属 AI 搭配师。明天有约会？还是面试？告诉我，我来帮你搭配！',
    'lab.placeholder': '例如：明天参加婚礼穿什么好...',
    'lab.thinking': 'AI 正在思考...',

    // Profile & Auth
    'profile.title': '我的数据',
    'profile.items': '单品',
    'profile.outfits': '搭配',
    'profile.utilized': '利用率',
    'profile.breakdown': '衣橱分布',
    'profile.favorites': '我的最爱',
    'profile.least_worn': '压箱底',
    'profile.settings': '设置',
    'profile.language': '语言',
    'profile.role': '时尚达人',
    'profile.edit_profile': '编辑资料',
    'profile.edit_title': '修改个人信息',
    
    'auth.welcome': '欢迎来到 SmartCloset',
    'auth.subtitle': '您的个人智能衣橱管家',
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.name_placeholder': '昵称',
    'auth.email_placeholder': '邮箱或手机号',
    'auth.password_placeholder': '密码',
    'auth.submit_login': '立即登录',
    'auth.submit_register': '立即注册',
    'auth.switch_to_register': '没有账号？去注册',
    'auth.switch_to_login': '已有账号？去登录',
    'auth.logout': '退出登录',
    'settings.title': '设置',

    // General
    'error.api_missing': '未配置 API Key',
    'error.analysis_failed': '图片分析失败',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.closet': 'Closet',
    'nav.lab': 'Lab',
    'nav.profile': 'Me',

    // Home
    'home.greeting': 'Good Morning,',
    'home.subtitle': 'Ready to dress up?',
    'home.ai_pick': 'AI Stylist Pick',
    'home.trending': 'Trending in Closet',
    'home.consulting': 'Consulting AI Stylist...',
    'home.no_clothes': 'Add clothes to your closet to get recommendations!',
    'home.weather.sunny': 'Sunny',
    'home.weather.cloudy': 'Cloudy',
    'home.weather.rain': 'Rain',
    'home.weather.snow': 'Snow',
    'home.weather.partly_cloudy': 'Partly Cloudy',
    'home.stats.height': 'Height',
    'home.stats.weight': 'Weight',
    'home.stats.size': 'Size',
    'home.read_more': 'Read More',
    'home.read_less': 'Show Less',

    // Closet Main
    'closet.title': 'Digital Closet',
    'closet.tab.items': 'Items',
    'closet.tab.outfits': 'Outfits',
    'closet.add_item': 'Add New Item',
    'closet.create_outfit': 'Create Outfit',
    'closet.upload_photo': 'Upload Photo',
    'closet.or_import': 'Or import',
    'closet.paste_link': 'Paste Store Link',
    'closet.enter_url': 'Enter Image URL',
    'closet.add_url': 'Add URL',
    'closet.analyzing': 'AI is analyzing...',
    'closet.analyzing_sub': 'Removing background & tagging',
    'closet.confirm': 'Confirm & Save',
    'closet.save_outfit': 'Save Outfit',
    'closet.outfit_name_placeholder': 'Outfit Name (e.g. Weekend Picnic)',
    'closet.select_items': 'Select Items',
    'closet.selected': 'Selected',
    'closet.no_items': 'No items found in this category.',
    'closet.no_outfits': 'No outfits yet. Create one!',
    'closet.new_item_manual': 'New Item (Unanalyzed)',
    'closet.cors_hint': 'Note: Some images cannot be AI-analyzed due to security restrictions and will be saved directly.',
    
    // Categories
    'closet.cat.all': 'All',
    'closet.cat.top': 'Top',
    'closet.cat.bottom': 'Bottom',
    'closet.cat.shoes': 'Shoes',
    'closet.cat.outerwear': 'Outerwear',
    'closet.cat.accessory': 'Accessory',
    'closet.cat.dress': 'Dress',

    // Detail Pages
    'detail.cpw': 'Cost Per Wear (CPW)',
    'detail.price': 'Price',
    'detail.wear_count': 'Wear Count',
    'detail.brand': 'Brand',
    'detail.rating': 'Rating',
    'detail.care': 'Care Instructions',
    'detail.edit': 'Edit',
    'detail.save': 'Save',
    'detail.cancel': 'Cancel',
    'detail.delete': 'Delete',
    'detail.share': 'Share',
    'detail.share_success': 'Link copied!',
    'detail.delete_confirm': 'Are you sure?',
    'detail.archive': 'Archive',
    'detail.outfit_items': 'Items in Outfit',
    'detail.wear_history': 'Wear History',
    'detail.total_value': 'Total Value',
    'detail.no_history': 'No wear history yet',
    'detail.description': 'Description',
    'detail.name': 'Name',

    // Lab
    'lab.title': 'Style Lab',
    'lab.intro': "Hi! I'm your AI stylist. Need help with an outfit for a specific event? Ask away!",
    'lab.placeholder': 'E.g., I have a wedding tomorrow...',
    'lab.thinking': 'AI is thinking...',

    // Profile & Auth
    'profile.title': 'My Data',
    'profile.items': 'Items',
    'profile.outfits': 'Outfits',
    'profile.utilized': 'Utilized',
    'profile.breakdown': 'Wardrobe Breakdown',
    'profile.favorites': 'Favorites',
    'profile.least_worn': 'Least Worn',
    'profile.settings': 'Settings',
    'profile.language': 'Language',
    'profile.role': 'Fashion Enthusiast',
    'profile.edit_profile': 'Edit Profile',
    'profile.edit_title': 'Edit Personal Info',

    'auth.welcome': 'Welcome to SmartCloset',
    'auth.subtitle': 'Your personal intelligent wardrobe',
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.name_placeholder': 'Name',
    'auth.email_placeholder': 'Email or Phone',
    'auth.password_placeholder': 'Password',
    'auth.submit_login': 'Login Now',
    'auth.submit_register': 'Create Account',
    'auth.switch_to_register': "Don't have an account? Register",
    'auth.switch_to_login': 'Already have an account? Login',
    'auth.logout': 'Log Out',
    'settings.title': 'Settings',

    // General
    'error.api_missing': 'API Key missing',
    'error.analysis_failed': 'Failed to analyze image',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  const t = (key: string): string => {
    // @ts-ignore
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};