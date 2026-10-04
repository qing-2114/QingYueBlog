import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { basePath, byDate } from '../utils/content';

export async function GET(context) {
	const posts = (await getCollection('blog')).sort(byDate);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: new URL(basePath, context.site),
		customData: '<language>zh-CN</language>',
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.pubDate,
			categories: [...new Set([post.data.category, ...post.data.tags])],
			link: `${basePath}blog/${post.id}/`,
		})),
	});
}
