/* eslint-disable @next/next/no-img-element */
"use client";
import 'katex/dist/katex.min.css';

import InteractiveChart from '@/components/interactive-charts';
import MultiSearch from '@/components/multi-search';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";


import { Wave } from "@foobar404/wave";
import { TextIcon } from '@radix-ui/react-icons';
import { ToolInvocation } from 'ai';
import { useChat, UseChatOptions } from '@ai-sdk/react';

interface AcademicResult {
    url: string;
    title: string;
    author?: string;
    publishedDate?: string;
    summary: string;
}
import { AnimatePresence, motion } from 'framer-motion';
import { GeistMono } from 'geist/font/mono';
import {
    AlignLeft,
    ArrowRight,
    Book,
    Brain,
    Calculator,
    Calendar,
    Check,
    ChevronDown,
    Cloud,
    Code,
    Copy,
    Download,
    Edit2,
    ExternalLink,
    FileText,
    Globe,
    GraduationCap,
    Heart,
    Loader2,
    LucideIcon,
    MapPin,
    Moon,
    Pause,
    Plane,
    Play,
    Plus,
    Search,
    Share2,
    Sparkles,
    Sun,
    TrendingUp,
    TrendingUpIcon,
    Tv,
    User2,
    Users,
    X,
    Zap,
    RotateCw,
    RefreshCw
} from 'lucide-react';

import React, {
    memo,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    useContext
} from 'react';
import ReactMarkdown from 'react-markdown';
import {
    generateSpeech,
} from '@/app/actions';
import ReasonSearch from '@/components/reason-search';
import {LoadingFallback,SearchLoadingState } from '@/components/Loading';
import  CollapsibleSection  from '@/components/CollapsibleSection';
import { GithubRepository } from './repo';
export const maxDuration = 120;

const ToolInvocationListView = memo(
    ({ toolInvocations, message }: {
        toolInvocations: ToolInvocation[],
        message: any,
    }) => {

        const renderToolInvocation = useCallback(
            (toolInvocation: ToolInvocation, index: number) => {
                const args = JSON.parse(JSON.stringify(toolInvocation.args));
                const result = 'result' in toolInvocation ? JSON.parse(JSON.stringify(toolInvocation.result)) : null;

                if (toolInvocation.toolName === 'academic_search') {
                    if (!result) {
                        return <SearchLoadingState
                            icon={Book}
                            text="Searching academic papers..."
                            color="violet"
                        />;
                    }

                    return (
                        <Card className="w-full my-4 overflow-hidden">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 flex items-center justify-center backdrop-blur-sm">
                                        <Book className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <CardTitle>Academic Papers</CardTitle>
                                        <p className="text-sm text-muted-foreground">Found {result.results.length} papers</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <div className="px-4 pb-2">
                                <div className="flex overflow-x-auto gap-4 no-scrollbar hover:overflow-x-scroll">
                                    {result.results.map((paper: AcademicResult, index: number) => (
                                        <motion.div
                                            key={paper.url || index}
                                            className="w-[400px] flex-none"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <div className="h-[300px] relative group overflow-y-auto">
                                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/20 via-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                <div className="h-full relative backdrop-blur-sm bg-background/95 dark:bg-neutral-900/95 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl p-4 flex flex-col transition-all duration-500 group-hover:border-violet-500/20">
                                                    <h3 className="font-semibold text-xl tracking-tight mb-3 line-clamp-2 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors duration-300">
                                                        {paper.title}
                                                    </h3>

                                                    {paper.author && (
                                                        <div className="mb-3">
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                                                <User2 className="h-3.5 w-3.5 text-violet-500" />
                                                                <span className="line-clamp-1">
                                                                    {paper.author.split(';')
                                                                        .slice(0, 2)
                                                                        .join(', ') +
                                                                        (paper.author.split(';').length > 2 ? ' et al.' : '')
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {paper.publishedDate && (
                                                        <div className="mb-4">
                                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 rounded-md">
                                                                <Calendar className="h-3.5 w-3.5 text-violet-500" />
                                                                {new Date(paper.publishedDate).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex-1 relative mb-4 pl-3">
                                                        <div className="absolute -left-0 top-1 bottom-1 w-[2px] rounded-full bg-gradient-to-b from-violet-500 via-violet-400 to-transparent opacity-50" />
                                                        <p className="text-sm text-muted-foreground line-clamp-4">
                                                            {paper.summary}
                                                        </p>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => window.open(paper.url, '_blank')}
                                                            className="flex-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 group/btn"
                                                        >
                                                            <FileText className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-300" />
                                                            View Paper
                                                            </Button>

                                                        {paper.url.includes('arxiv.org') && (
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => window.open(paper.url.replace('abs', 'pdf'), '_blank')}
                                                                className="bg-neutral-100 dark:bg-neutral-800 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 group/btn"
                                                            >
                                                                <Download className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    );
                }

                if (toolInvocation.toolName === 'text_search') {
                    if (!result) {
                        return (
                            <div className="flex items-center justify-between w-full">
                                <div className='flex items-center gap-2'>
                                    <MapPin className="h-5 w-5 text-neutral-700 dark:text-neutral-300 animate-pulse" />
                                    <span className="text-neutral-700 dark:text-neutral-300 text-lg">Searching places...</span>
                                </div>
                                <motion.div className="flex space-x-1">
                                    {[0, 1, 2].map((index) => (
                                        <motion.div
                                            key={index}
                                            className="w-2 h-2 bg-neutral-400 dark:bg-neutral-600 rounded-full"
                                            initial={{ opacity: 0.3 }}
                                            animate={{ opacity: 1 }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.8,
                                                delay: index * 0.2,
                                                repeatType: "reverse",
                                            }}
                                        />
                                    ))}
                                </motion.div>
                            </div>
                        );
                    }
                }

                if (toolInvocation.toolName === "code_interpreter") {
                    return (
                        <div className="space-y-6">
                            <CollapsibleSection
                                code={args.code}
                                output={result?.message}
                                language="python"
                                title={args.title}
                                icon={args.icon || 'default'}
                                status={result ? 'completed' : 'running'}
                            />

                            {result?.chart && (
                                <div className="pt-1">
                                    <InteractiveChart chart={result.chart} />
                                </div>
                            )}
                        </div>
                    );
                }

                if (toolInvocation.toolName === 'reason_search') {
                    const updates = message?.annotations?.filter((a: any) =>
                        a.type === 'research_update'
                    ).map((a: any) => a.data);
                    return <ReasonSearch updates={updates || []} />;
                }

                if (toolInvocation.toolName === 'web_search') {
                    return (
                        <div className="mt-4">
                            <MultiSearch
                                result={result}
                                args={args}
                                annotations={message?.annotations?.filter(
                                    (a: any) => a.type === 'query_completion'
                                ) || []}
                            />
                        </div>
                    );
                }

                if (toolInvocation.toolName === 'retrieve') {
                    if (!result) {
                        return (
                            <div className="border border-neutral-200 rounded-xl my-4 p-4 dark:border-neutral-800 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900/90">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-10 h-10">
                                        <div className="absolute inset-0 bg-primary/10 animate-pulse rounded-lg" />
                                        <Globe className="h-5 w-5 text-primary/70 absolute inset-0 m-auto" />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <div className="h-4 w-36 bg-neutral-200 dark:bg-neutral-800 animate-pulse rounded-md" />
                                        <div className="space-y-1.5">
                                            <div className="h-3 w-full bg-neutral-100 dark:bg-neutral-800/50 animate-pulse rounded-md" />
                                            <div className="h-3 w-2/3 bg-neutral-100 dark:bg-neutral-800/50 animate-pulse rounded-md" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div className="border border-neutral-200 rounded-xl my-4 overflow-hidden dark:border-neutral-800 bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-900/90">
                            <div className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="relative w-10 h-10 flex-shrink-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-lg" />
                                        <img
                                            className="h-5 w-5 absolute inset-0 m-auto"
                                            src={`https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(result.results[0].url)}`}
                                            alt=""
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <h2 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
                                            {result.results[0].title}
                                        </h2>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                                            {result.results[0].description}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                                                {result.results[0].language || 'Unknown'}
                                            </span>
                                            <a
                                                href={result.results[0].url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary transition-colors"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                View source
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-neutral-200 dark:border-neutral-800">
                                <details className="group">
                                    <summary className="w-full px-4 py-2 cursor-pointer text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <TextIcon className="h-4 w-4 text-neutral-400" />
                                            <span>View content</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" />
                                    </summary>
                                    <div className="max-h-[50vh] overflow-y-auto p-4 bg-neutral-50/50 dark:bg-neutral-800/30">
                                        <div className="prose prose-neutral dark:prose-invert prose-sm max-w-none">
                                            <ReactMarkdown>{result.results[0].content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        </div>
                    );
                }
                if (toolInvocation.toolName === 'text_translate') {
                    return <TranslationTool toolInvocation={toolInvocation} result={result} />;
                }
                if (toolInvocation.toolName === 'github_search') {
                    if (!result) {
                        return <SearchLoadingState
                            icon={Code}
                            text="Searching Github Repos..."
                            color="violet"
                        />;
                    }
                    console.log(result);
                    return <GithubRepository data={result} />;
                }
                return null;
            },
            [message]
        );

        const TranslationTool: React.FC<{ toolInvocation: ToolInvocation; result: any }> = ({ toolInvocation, result }) => {
            const [isPlaying, setIsPlaying] = useState(false);
            const [audioUrl, setAudioUrl] = useState<string | null>(null);
            const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
            const audioRef = useRef<HTMLAudioElement | null>(null);
            const canvasRef = useRef<HTMLCanvasElement | null>(null);
            const waveRef = useRef<Wave | null>(null);

            useEffect(() => {
                const _audioRef = audioRef.current
                return () => {
                    if (_audioRef) {
                        _audioRef.pause();
                        _audioRef.src = '';
                    }
                };
            }, []);

            useEffect(() => {
                if (audioUrl && audioRef.current && canvasRef.current) {
                    waveRef.current = new Wave(audioRef.current, canvasRef.current);
                    waveRef.current.addAnimation(new waveRef.current.animations.Lines({
                        lineWidth: 1.5,
                        lineColor: 'rgb(147, 51, 234)',
                        count: 80,
                        mirroredY: true,
                    }));
                }
            }, [audioUrl]);

            const handlePlayPause = async () => {
                if (!audioUrl && !isGeneratingAudio) {
                    setIsGeneratingAudio(true);
                    try {
                        const { audio } = await generateSpeech(result.translatedText);
                        setAudioUrl(audio);
                        setIsGeneratingAudio(false);
                        // Autoplay after a short delay to ensure audio is loaded
                        setTimeout(() => {
                            if (audioRef.current) {
                                audioRef.current.play();
                                setIsPlaying(true);
                            }
                        }, 100);
                    } catch (error) {
                        console.error("Error generating speech:", error);
                        setIsGeneratingAudio(false);
                    }
                } else if (audioRef.current) {
                    if (isPlaying) {
                        audioRef.current.pause();
                    } else {
                        audioRef.current.play();
                    }
                    setIsPlaying(!isPlaying);
                }
            };

            const handleReset = () => {
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                    setIsPlaying(false);
                }
            };

            if (!result) {
                return (
                    <Card className="w-full my-4 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                        <CardContent className="flex items-center justify-center h-24">
                            <div className="animate-pulse flex items-center">
                                <div className="h-4 w-4 bg-primary rounded-full mr-2"></div>
                                <div className="h-4 w-32 bg-primary rounded"></div>
                            </div>
                        </CardContent>
                    </Card>
                );
            }

            return (
                <Card className="w-full my-4 shadow-none bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                    <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4 sm:space-y-6">
                            <div>
                                <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                    The phrase <span className="font-medium text-neutral-900 dark:text-neutral-100">{toolInvocation.args.text}</span> translates from <span className="font-medium text-neutral-900 dark:text-neutral-100">{result.detectedLanguage}</span> to <span className="font-medium text-neutral-900 dark:text-neutral-100">{toolInvocation.args.to}</span> as <span className="font-medium text-primary">{result.translatedText}</span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <Button
                                    onClick={handlePlayPause}
                                    disabled={isGeneratingAudio}
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex-shrink-0"
                                >
                                    {isGeneratingAudio ? (
                                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                                    ) : isPlaying ? (
                                        <Pause className="h-4 w-4 sm:h-5 sm:w-5" />
                                    ) : (
                                        <Play className="h-4 w-4 sm:h-5 sm:w-5" />
                                    )}
                                </Button>

                                <div className="flex-1 h-8 sm:h-10 bg-neutral-100 dark:bg-neutral-900 rounded-md sm:rounded-lg overflow-hidden">
                                    <canvas 
                                        ref={canvasRef} 
                                        width="800" 
                                        height="200" 
                                        className="w-full h-full opacity-90 dark:opacity-70" 
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    {audioUrl && (
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => { setIsPlaying(false); handleReset(); }}
                        />
                    )}
                </Card>
            );
        };

        return (
            <>
                {toolInvocations.map(
                    (toolInvocation: ToolInvocation, toolIndex: number) => (
                        <div key={`tool-${toolIndex}`}>
                            {renderToolInvocation(toolInvocation, toolIndex)}
                        </div>
                    )
                )}
            </>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.toolInvocations === nextProps.toolInvocations &&
            prevProps.message === nextProps.message;
    }
);
ToolInvocationListView.displayName = 'ToolInvocationListView';
export default ToolInvocationListView;