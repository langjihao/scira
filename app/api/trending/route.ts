import { xai } from '@ai-sdk/xai';
import { generateObject } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export interface TrendingQuery {
    icon: string;
    text: string;
    category: string;
}

interface RedditPost {
    data: {
        title: string;
    };
}

async function fetchGoogleTrends(): Promise<TrendingQuery[]> {
    const fetchTrends = async (geo: string): Promise<TrendingQuery[]> => {
        try {
            const response = await fetch(`https://trends.google.com/trends/trendingsearches/daily/rss?geo=${geo}`, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch from Google Trends RSS for geo: ${geo}`);
            }

            const xmlText = await response.text();
            const items = xmlText.match(/<title>(?!Daily Search Trends)(.*?)<\/title>/g) || [];

            const categories = [
                'research',    // 研究热点
                'tech',        // 技术热点
                'science',     // 科学发现
                'ai',          // AI 发展
                'academic',    // 学术动态
            ] as const;

            const schema = z.object({
                category: z.enum(categories),
            });

            const itemsWithCategoryAndIcon = await Promise.all(
                items.map(async (item) => {
                    const { object } = await generateObject({
                        model: xai("grok-beta"),
                        prompt: `Give the category for the topic from the existing values only in lowercase only: ${item.replace(
                            /<\/?title>/g,
                            '',
                        )}

          - if the topic category isn't present in the list, please select 'trending' only!`,
                        schema,
                        temperature: 0,
                    });

                    return {
                        icon: object.category,
                        text: item.replace(/<\/?title>/g, ''),
                        category: object.category,
                    };
                }),
            );

            return itemsWithCategoryAndIcon;
        } catch (error) {
            console.error(`Failed to fetch Google Trends for geo: ${geo}`, error);
            return [];
        }
    };

    const trends = await fetchTrends('US');

    return [...trends];
}

// 添加学术趋势获取函数
async function fetchArxivTrends(): Promise<TrendingQuery[]> {
    try {
        const response = await fetch('http://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.ML&sortBy=submittedDate&sortOrder=descending&max_results=10');
        const xmlText = await response.text();
        
        const titles = xmlText.match(/<title>(.*?)<\/title>/g) || [];
        const entries = titles.slice(1).map(title => ({
            icon: 'research',
            text: title.replace(/<\/?title>/g, ''),
            category: 'research'
        }));
        
        return entries;
    } catch (error) {
        console.error('Failed to fetch arXiv trends:', error);
        return [];
    }
}

// 添加技术趋势获取函数
async function fetchGithubTrends(): Promise<TrendingQuery[]> {
    try {
        const response = await fetch('https://api.github.com/search/repositories?q=created:>2024-01-01&sort=stars&order=desc&per_page=10', {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${process.env.GITHUB_TOKEN}`
            }
        });
        
        const data = await response.json();
        return data.items.map((repo: any) => ({
            icon: 'tech',
            text: `${repo.name}: ${repo.description}`,
            category: 'tech'
        }));
    } catch (error) {
        console.error('Failed to fetch GitHub trends:', error);
        return [];
    }
}

async function fetchFromMultipleSources() {
    const [
        googleTrends,
        // redditQuestions
    ] = await Promise.all([
        fetchGoogleTrends(),
        // fetchRedditQuestions(),
    ]);

    const allQueries = [
        ...googleTrends,
        // ...redditQuestions
    ];
    return allQueries.sort(() => Math.random() - 0.5);
}

export async function GET(req: Request) {
    try {
        // const trends = await fetchFromMultipleSources();

        // if (trends.length === 0) {
        //     // Fallback queries if both sources fail
        //     console.error('Both sources failed to fetch trends, returning fallback queries');
            return NextResponse.json([
                {
                    icon: 'research',
                    text: '大模型多模态训练研究进展',
                    category: 'research'
                },
                {
                    icon: 'ai',
                    text: '医学影像报告智能生成技术突破',
                    category: 'ai'
                },
                {
                    icon: 'science',
                    text: '基于深度学习的医学图像分割新方法',
                    category: 'science'
                },
                {
                    icon: 'research',
                    text: '医学图像超分辨率重建最新进展',
                    category: 'research'
                },
                {
                    icon: 'ai',
                    text: '多模态语音情感识别研究进展',
                    category: 'ai'
                },
                {
                    icon: 'ai',
                    text: 'AGI 发展最新突破',
                    category: 'ai'
                },
                {
                    icon: 'research',
                    text: '大模型幻觉问题研究与解决方案',
                    category: 'research'
                },
                {
                    icon: 'science',
                    text: '医学影像多任务学习框架',
                    category: 'science'
                },
                {
                    icon: 'research',
                    text: '跨模态大模型对齐技术研究',
                    category: 'research'
                }
            ]);
        // }

        // return NextResponse.json(trends);
    } catch (error) {
        console.error('Failed to fetch trends:', error);
        return NextResponse.error();
    }
}
