import type { CollectionEntry } from 'astro:content';
import curiosity from '../assets/learning-in-the-ai-era/04-curiosity.png';

export const basePath = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const topics = [
  { category: 'AI Agent', label: 'AI Agent', subtitle: '模型、工具与智能体', index: '01', icon: 'agent' },
  { category: '机器人', label: '机器人', subtitle: '从运动学到真实运动', index: '02', icon: 'robot' },
  { category: '嵌入式', label: '嵌入式', subtitle: '控制、传感与硬件', index: '03', icon: 'chip' },
  { category: 'AI 与学习', label: '学习与思考', subtitle: '理解技术，也理解自己', index: '04', icon: 'book' },
] as const;

export function readingMinutes(body = '') {
  const clean = body.replace(/^import .*$/gm, '').replace(/```[\s\S]*?```/g, '').replace(/<[^>]+>/g, '');
  const chinese = (clean.match(/[\u3400-\u9fff]/g) ?? []).length;
  const words = (clean.replace(/[\u3400-\u9fff]/g, ' ').match(/[a-zA-Z0-9]+/g) ?? []).length;
  return Math.max(1, Math.ceil(chinese / 350 + words / 220));
}

export function byDate(a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf() || a.id.localeCompare(b.id);
}

export function topicHref(category: string) {
  return `${basePath}blog/?category=${encodeURIComponent(category)}`;
}

export function articleCover(post: CollectionEntry<'blog'>) {
  // Use the article's illustration for previews; the source screenshot remains in its body.
  return post.id === 'learning-in-the-ai-era' ? curiosity : post.data.heroImage;
}
