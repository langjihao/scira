/* eslint-disable @next/next/no-img-element */
"use client";

import { GithubLogo, XLogo } from '@phosphor-icons/react';
import { Bot, Brain, Command, GraduationCap, Image, Search, Share2, Sparkles, Star, Trophy, Users, AlertTriangle, Github, Twitter } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TextLoop } from '@/components/core/text-loop';
import { TextShimmer } from '@/components/core/text-shimmer';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VercelLogo } from '@/components/logos/vercel-logo';
import { TavilyLogo } from '@/components/logos/tavily-logo';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function AboutPage() {
    const router = useRouter();
    const [showWarning, setShowWarning] = useState(false);
    
    useEffect(() => {
        // Check if user has seen the warning
        const hasSeenWarning = localStorage.getItem('hasSeenWarning');
        if (!hasSeenWarning) {
            setShowWarning(true);
        }
    }, []);

    const handleDismissWarning = () => {
        setShowWarning(false);
        localStorage.setItem('hasSeenWarning', 'true');
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('query')?.toString();
        if (query) {
            router.push(`/?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <div className="min-h-screen bg-background overflow-hidden">
            {/* <Dialog open={showWarning} onOpenChange={setShowWarning}>
                <DialogContent className="sm:max-w-[425px] p-0 bg-neutral-50 dark:bg-neutral-900">
                    <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
                                <AlertTriangle className="h-5 w-5" />
                                Warning
                            </DialogTitle>
                            <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                                Scira is an AI search engine and is not associated with any cryptocurrency, memecoin, or token activities. Beware of impersonators.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <DialogFooter className="p-6 pt-4">
                        <Button 
                            variant="default" 
                            onClick={handleDismissWarning}
                            className="w-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
                        >
                            Got it, thanks
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}

            {/* Hero Section */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-neutral-100/40 dark:from-neutral-900/40" />
                <div className="absolute inset-0 bg-grid-neutral-700/[0.05] dark:bg-grid-neutral-300/[0.05]" />
                <div className="relative pt-20 pb-20 px-4">
                    <motion.div 
                        className="container max-w-5xl mx-auto space-y-12"
                        variants={container}
                        initial="hidden"
                        animate="show"
                    >
                        {/* Brand */}
                        <motion.div variants={item} className="text-center">
                            <Link href="/" className="inline-flex items-center gap-3 text-4xl font-bold">
                                <img src="/linkwow.png" alt="LinkWow AI Logo" className="h-12 w-12" />
                                <span>LinkWow AI</span>
                            </Link>
                        </motion.div>

                        <motion.form 
                            variants={item} 
                            className="max-w-2xl mx-auto w-full"
                            onSubmit={handleSearch}
                        >
                            <div className="relative group">
                                <input
                                    type="text"
                                    name="query"
                                    placeholder="Ask anything..."
                                    className="w-full h-14 px-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-neutral-300 dark:focus:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700 transition-all duration-300"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const query = e.currentTarget.value;
                                            if (query) {
                                                router.push(`/?q=${encodeURIComponent(query)}`);
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-2 h-10 px-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium hover:opacity-90 transition-opacity"
                                >
                                    Ask Scira
                                </button>
                            </div>
                        </motion.form>

                        <motion.div variants={item} className="text-center space-y-6">
                            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                                专为科研人员打造的智能学术助理,提供专业的文献检索、分析和写作辅助。基于 RAG 和搜索增强的开源项目。
                            </p>
                        </motion.div>

                        <motion.div variants={item} className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="https://github.com/yourusername/linkwow"
                                className="group relative inline-flex h-12 items-center gap-2 px-6 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-all duration-300"
                            >
                                <GithubLogo weight="fill" className="h-5 w-5" />
                                <span className="font-medium">查看源码</span>
                            </Link>
                            <Link
                                href="/"
                                className="group relative inline-flex h-12 items-center gap-2 px-6 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-300"
                            >
                                <span className="font-medium">立即使用</span>
                                <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 16 16" fill="none">
                                    <path d="M6.66667 12.6667L11.3333 8.00004L6.66667 3.33337" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* 核心功能展示 */}
            <div className="py-24 px-4 bg-white dark:bg-black border-y border-neutral-200 dark:border-neutral-800">
                <motion.div className="container max-w-5xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold">专业的学术辅助功能</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            为科研人员提供全方位的学术支持
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <h3 className="text-lg font-semibold mb-2">文献检索</h3>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                                <li>智能文献推荐</li>
                                <li>跨库搜索整合</li>
                                <li>相关性排序</li>
                            </ul>
                        </div>
                        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <h3 className="text-lg font-semibold mb-2">内容分析</h3>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                                <li>文献综述生成</li>
                                <li>研究趋势分析</li>
                                <li>引文网络分析</li>
                            </ul>
                        </div>
                        <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <h3 className="text-lg font-semibold mb-2">写作辅助</h3>
                            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                                <li>智能写作建议</li>
                                <li>参考文献格式化</li>
                                <li>学术翻译支持</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 技术支持部分 */}
            <div className="py-24 px-4 bg-white dark:bg-black border-y border-neutral-200 dark:border-neutral-800">
                <motion.div className="container max-w-5xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold">技术支持</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                            基于先进技术构建,感谢以下开源项目的支持
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-4 mb-4">
                                <GithubLogo className="h-8 w-8" />
                                <div>
                                    <h3 className="font-semibold">Scira</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">开源搜索引擎框架</p>
                                </div>
                            </div>
                            <Link
                                href="https://github.com/zaidmukaddam/scira"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                访问项目
                            </Link>
                        </div>
                        
                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-4">
                                <VercelLogo />
                                <div>
                                    <h3 className="font-semibold">Vercel AI SDK</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">AI 应用开发框架</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex items-center gap-4">
                                <TavilyLogo />
                                <div>
                                    <h3 className="font-semibold">Tavily AI</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">搜索增强技术支持</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* 开发者信息 */}
            <div className="py-24 px-4 bg-white dark:bg-neutral-900/50">
                <motion.div className="container max-w-5xl mx-auto">
                    <div className="text-center space-y-6">
                        <h2 className="text-3xl font-bold">开发者</h2>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400">
                            由郎吉豪开发的开源学术搜索引擎
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link
                                href="https://github.com/yourusername"
                                className="inline-flex items-center gap-2 text-neutral-900 dark:text-white hover:opacity-80"
                            >
                                <GithubLogo weight="fill" className="h-5 w-5" />
                                <span>GitHub</span>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Footer 部分保持不变 */}
            <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black">
                <div className="mx-auto max-w-5xl px-4 py-12">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                        <div className="flex items-center gap-3">
                            <img src="/scira.png" alt="Scira Logo" className="h-8 w-8 invert" />
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                © {new Date().getFullYear()} All rights reserved.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Link
                                href="https://x.com/sciraai"
                                className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <XLogo className="h-5 w-5" />
                            </Link>
                            <Link
                                href="https://git.new/scira"
                                className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}