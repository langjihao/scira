/* eslint-disable @next/next/no-img-element */
"use client";
import 'katex/dist/katex.min.css';

import { InstallPrompt } from '@/components/InstallPrompt';
import { Button } from '@/components/ui/button';

import { cn, SearchGroupId } from '@/lib/utils';
import { useChat, UseChatOptions } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
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

import { useTheme } from 'next-themes';
import { parseAsString, useQueryState } from 'nuqs';
import React, {
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { toast } from 'sonner';
import {
    suggestQuestions
} from './actions';
import { TrendingQuery } from './api/trending/route';
import { ReasoningUIPart, ToolInvocationUIPart, TextUIPart, SourceUIPart } from '@ai-sdk/ui-utils';

import FormComponent from '@/components/ui/form-component';
import { Separator } from '@/components/ui/separator';

import type { StreamUpdate } from '@/components/reason-search';
import {LoadingFallback,SearchLoadingState } from '@/components/Loading';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ToolInvocationListView from '@/components/ToolInvocationListView';
export const maxDuration = 120;
interface Attachment {
    name: string;
    contentType: string;
    url: string;
    size: number;
}



const HomeContent = () => {
    const [query] = useQueryState('query', parseAsString.withDefault(''))
    const [q] = useQueryState('q', parseAsString.withDefault(''))
    const [model] = useQueryState('model', parseAsString.withDefault('scira-default'))



    const initialState = useMemo(() => ({
        query: query || q,
        model: model
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []);

    const lastSubmittedQueryRef = useRef(initialState.query);
    const [selectedModel, setSelectedModel] = useState(initialState.model);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
    const [isEditingMessage, setIsEditingMessage] = useState(false);
    const [editingMessageIndex, setEditingMessageIndex] = useState(-1);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const initializedRef = useRef(false);
    const [selectedGroup, setSelectedGroup] = useState<SearchGroupId>('web');
    const [researchUpdates, setResearchUpdates] = useState<StreamUpdate[]>([]);
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const CACHE_KEY = 'trendingQueriesCache';
    const CACHE_DURATION = 5 * 60 * 60 * 1000; // 5 hours in milliseconds

    interface TrendingQueriesCache {
        data: TrendingQuery[];
        timestamp: number;
    }

    const getTrendingQueriesFromCache = (): TrendingQueriesCache | null => {
        if (typeof window === 'undefined') return null;

        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsedCache = JSON.parse(cached) as TrendingQueriesCache;
        const now = Date.now();

        if (now - parsedCache.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return parsedCache;
    };

    const [trendingQueries, setTrendingQueries] = useState<TrendingQuery[]>([]);

    const chatOptions: UseChatOptions = useMemo(() => ({
        maxSteps: 5,
        experimental_throttle: 500,
        body: {
            model: selectedModel,
            group: selectedGroup,
        },
        onFinish: async (message, { finishReason }) => {
            console.log("[finish reason]:", finishReason);
            if (message.content && (finishReason === 'stop' || finishReason === 'length')) {
                const newHistory = [
                    { role: "user", content: lastSubmittedQueryRef.current },
                    { role: "assistant", content: message.content },
                ];
                const { questions } = await suggestQuestions(newHistory);
                setSuggestedQuestions(questions);
            }
        },
        onError: (error) => {
            console.error("Chat error:", error.cause, error.message);
            toast.error("An error occurred.", {
                description: `Oops! An error occurred while processing your request. ${error.message}`,
            });
        },
    }), [selectedModel, selectedGroup]);

    const {
        input,
        messages,
        setInput,
        append,
        handleSubmit,
        setMessages,
        reload,
        stop,
        data,
        setData,
        status
    } = useChat(chatOptions);

    useEffect(() => {
        if (!initializedRef.current && initialState.query && !messages.length) {
            initializedRef.current = true;
            console.log("[initial query]:", initialState.query);
            append({
                content: initialState.query,
                role: 'user'
            });
        }
    }, [initialState.query, append, setInput, messages.length]);

    useEffect(() => {
        const fetchTrending = async () => {
            const cached = getTrendingQueriesFromCache();
            if (cached) {
                setTrendingQueries(cached.data);
                return;
            }

            try {
                const res = await fetch('/api/trending');
                if (!res.ok) throw new Error('Failed to fetch trending queries');
                const data = await res.json();

                const cacheData: TrendingQueriesCache = {
                    data,
                    timestamp: Date.now()
                };
                localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

                setTrendingQueries(data);
            } catch (error) {
                console.error('Error fetching trending queries:', error);
                setTrendingQueries([]);
            }
        };

        fetchTrending();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const CopyButton = ({ text }: { text: string }) => {
        const [isCopied, setIsCopied] = useState(false);

        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                    if (!navigator.clipboard) {
                        return;
                    }
                    await navigator.clipboard.writeText(text);
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                    toast.success("Copied to clipboard");
                }}
                className="h-8 px-2 text-xs rounded-full"
            >
                {isCopied ? (
                    <Check className="h-4 w-4" />
                ) : (
                    <Copy className="h-4 w-4" />
                )}
            </Button>
        );
    };


    const lastUserMessageIndex = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                return i;
            }
        }
        return -1;
    }, [messages]);

    useEffect(() => {
        const handleScroll = () => {
            const userScrolled = window.innerHeight + window.scrollY < document.body.offsetHeight;
            if (!userScrolled && bottomRef.current && (messages.length > 0 || suggestedQuestions.length > 0)) {
                bottomRef.current.scrollIntoView({ behavior: "smooth" });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [messages, suggestedQuestions]);

    const handleExampleClick = async (card: TrendingQuery) => {
        const exampleText = card.text;
        lastSubmittedQueryRef.current = exampleText;
        setSuggestedQuestions([]);
        await append({
            content: exampleText.trim(),
            role: 'user',
        });
    };

    const handleSuggestedQuestionClick = useCallback(async (question: string) => {
        setSuggestedQuestions([]);

        await append({
            content: question.trim(),
            role: 'user'
        });
    }, [append]);

    const handleMessageEdit = useCallback((index: number) => {
        setIsEditingMessage(true);
        setEditingMessageIndex(index);
        setInput(messages[index].content);
    }, [messages, setInput]);

    const handleMessageUpdate = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim()) {
            // Create new messages array up to the edited message
            const newMessages = messages.slice(0, editingMessageIndex + 1);
            // Update the edited message
            newMessages[editingMessageIndex] = { ...newMessages[editingMessageIndex], content: input.trim() };
            // Set the new messages array
            setMessages(newMessages);
            // Reset editing state
            setIsEditingMessage(false);
            setEditingMessageIndex(-1);
            // Store the edited message for reference
            lastSubmittedQueryRef.current = input.trim();
            // Clear input
            setInput('');
            // Reset suggested questions
            setSuggestedQuestions([]);
            // Trigger a new chat completion without appending
            reload();
        } else {
            toast.error("Please enter a valid message.");
        }
    }, [input, messages, editingMessageIndex, setMessages, reload,setInput]);


    const SuggestionCards: React.FC<{
        trendingQueries: TrendingQuery[];
        handleExampleClick: (query: TrendingQuery) => void;
    }> = ({ trendingQueries, handleExampleClick }) => {
        const [isLoading, setIsLoading] = useState(true);
        const scrollRef = useRef<HTMLDivElement>(null);
        const [isPaused, setIsPaused] = useState(false);
        const animationFrameRef = useRef<number>();
        const lastScrollTime = useRef<number>(0);

        useEffect(() => {
            if (trendingQueries.length > 0) {
                setIsLoading(false);
            }
        }, [trendingQueries]);

        useEffect(() => {
            const animate = (timestamp: number) => {
                if (!scrollRef.current || isPaused) {
                    animationFrameRef.current = requestAnimationFrame(animate);
                    return;
                }

                if (timestamp - lastScrollTime.current > 16) {
                    const newScrollLeft = scrollRef.current.scrollLeft + 1;

                    if (newScrollLeft >= scrollRef.current.scrollWidth - scrollRef.current.clientWidth) {
                        scrollRef.current.scrollLeft = 0;
                    } else {
                        scrollRef.current.scrollLeft = newScrollLeft;
                    }

                    lastScrollTime.current = timestamp;
                }

                animationFrameRef.current = requestAnimationFrame(animate);
            };

            animationFrameRef.current = requestAnimationFrame(animate);

            return () => {
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                }
            };
        }, [isPaused]);

        const getIconForCategory = (category: string) => {
            const iconMap = {
                trending: <TrendingUp className="w-3 h-3" />,
                community: <Users className="w-3 h-3" />,
                science: <Brain className="w-3 h-3" />,
                tech: <Code className="w-3 h-3" />,
            };
            return iconMap[category as keyof typeof iconMap] || <Sparkles className="w-3 h-3" />;
        };

        if (isLoading || trendingQueries.length === 0) {
            return (
                <div className="mt-4 relative">
                    <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10" />
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10" />

                        <div className="flex gap-2 overflow-x-auto pb-2 px-2 scroll-smooth no-scrollbar">
                            {[1, 2, 3, 4, 5, 6].map((_, index) => (
                                <div
                                    key={index}
                                    className="flex-shrink-0 h-12 w-[120px] rounded-lg bg-neutral-50/80 dark:bg-neutral-800/80 
                                                     border border-neutral-200/50 dark:border-neutral-700/50"
                                >
                                    <div className="flex items-start gap-1.5 h-full p-2">
                                        <div className="w-4 h-4 rounded-md bg-neutral-200/50 dark:bg-neutral-700/50 
                                                              animate-pulse mt-0.5" />
                                        <div className="space-y-1 flex-1">
                                            <div className="h-2.5 bg-neutral-200/50 dark:bg-neutral-700/50 rounded animate-pulse" />
                                            <div className="h-2 w-1/2 bg-neutral-200/50 dark:bg-neutral-700/50 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 relative"
            >
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-[8]" />
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-[8]" />

                    <div
                        ref={scrollRef}
                        className="flex gap-2 overflow-x-auto pb-2 px-2 scroll-smooth no-scrollbar"
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => {
                            // Add a small delay before resuming animation on mobile
                            setTimeout(() => setIsPaused(false), 1000);
                        }}
                        onMouseEnter={() => setIsPaused(true)}
                        onMouseLeave={() => setIsPaused(false)}
                    >
                        {Array(20).fill(trendingQueries).flat().map((query, index) => (
                            <motion.button
                                key={`${index}-${query.text}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{
                                    duration: 0.2,
                                    delay: Math.min(index * 0.02, 0.5), // Cap the maximum delay
                                    ease: "easeOut"
                                }}
                                onClick={() => handleExampleClick(query)}
                                className="group flex-shrink-0 w-[120px] h-12 bg-neutral-50/80 dark:bg-neutral-800/80
                                         backdrop-blur-sm rounded-lg
                                         hover:bg-white dark:hover:bg-neutral-700/70
                                         active:scale-95
                                         transition-all duration-200
                                         border border-neutral-200/50 dark:border-neutral-700/50"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                <div className="flex items-start gap-1.5 h-full p-2">
                                    <div className="w-5 h-5 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center mt-0.5">
                                        {getIconForCategory(query.category)}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-xs font-medium truncate leading-tight">{query.text}</p>
                                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 capitalize">
                                            {query.category}
                                        </p>
                                    </div>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </motion.div>
        );
    };

    const handleModelChange = useCallback((newModel: string) => {
        setSelectedModel(newModel);
        setSuggestedQuestions([]);
    }, []);

    const resetSuggestedQuestions = useCallback(() => {
        setSuggestedQuestions([]);
    }, []);


    const memoizedMessages = useMemo(() => {
        // Create a shallow copy
        const msgs = [...messages];

        return msgs.filter((message) => {
            // Keep all user messages
            if (message.role === 'user') return true;

            // For assistant messages
            if (message.role === 'assistant') {
                // Keep messages that have tool invocations
                if (message.parts?.some(part => part.type === 'tool-invocation')) {
                    return true;
                }
                // Keep messages that have text parts but no tool invocations
                if (message.parts?.some(part => part.type === 'text') ||
                    !message.parts?.some(part => part.type === 'tool-invocation')) {
                    return true;
                }
                return false;
            }
            return false;
        });
    }, [messages]);

    const memoizedSuggestionCards = useMemo(() => (
        <SuggestionCards
            trendingQueries={trendingQueries}
            handleExampleClick={handleExampleClick}
        />
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [trendingQueries]);

    // Track visibility state for each reasoning section using messageIndex-partIndex as key
    const [reasoningVisibilityMap, setReasoningVisibilityMap] = useState<Record<string, boolean>>({});

    const handleRegenerate = useCallback(async () => {
        if (status !== 'ready') {
            toast.error("Please wait for the current response to complete!");
            return;
        }

        const lastUserMessage = messages.findLast(m => m.role === 'user');
        if (!lastUserMessage) return;

        // Remove the last assistant message
        const newMessages = messages.slice(0, -1);
        setMessages(newMessages);
        setSuggestedQuestions([]);

        // Resubmit the last user message
        await reload();
    }, [messages, append, setMessages, status]);

    // Add this type at the top with other interfaces
    type MessagePart = TextUIPart | ReasoningUIPart | ToolInvocationUIPart | SourceUIPart;

    // Update the renderPart function signature
    const renderPart = (
        part: MessagePart,
        messageIndex: number,
        partIndex: number,
        parts: MessagePart[],
        message: any,
        data?: any[]
    ) => {
        if (part.type === "text" && partIndex === 0 &&
            parts.some((p, i) => i > partIndex && p.type === 'tool-invocation')) {
            return null;
        }

        switch (part.type) {
            case "text":
                return (
                    <div key={`${messageIndex}-${partIndex}-text`}>
                        <div className="flex items-center justify-between mt-5 mb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="size-5 text-primary" />
                                <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-200">
                                    Answer
                                </h2>
                            </div>
                            {status === 'ready' && messageIndex === messages.length - 1 && (
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRegenerate()}
                                        className="h-8 px-2 text-xs rounded-full"
                                    >
                                        <RefreshCw className="h-3.5 w-3.5" />
                                    </Button>
                                    <CopyButton text={part.text} />
                                </div>
                            )}
                        </div>
                        <MarkdownRenderer content={part.text} />
                    </div>
                );
            case "reasoning": {
                const sectionKey = `${messageIndex}-${partIndex}`;
                const isComplete = parts[partIndex + 1]?.type === "text";

                // Auto-expand completed reasoning sections if not manually toggled
                if (isComplete && reasoningVisibilityMap[sectionKey] === undefined) {
                    setReasoningVisibilityMap(prev => ({
                        ...prev,
                        [sectionKey]: true
                    }));
                }

                return (
                    <motion.div
                        key={`${messageIndex}-${partIndex}-reasoning`}
                        id={`reasoning-${messageIndex}`}
                        className="mb-4"
                    >
                        <button
                            onClick={() => setReasoningVisibilityMap(prev => ({
                                ...prev,
                                [sectionKey]: !prev[sectionKey]
                            }))}
                            className="flex items-center justify-between w-full group text-left px-4 py-2 
                                hover:bg-neutral-50 dark:hover:bg-neutral-800/50 
                                border border-neutral-200 dark:border-neutral-800 
                                rounded-lg transition-all duration-200
                                bg-neutral-50/50 dark:bg-neutral-900/50"
                        >
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                </div>
                                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {isComplete
                                        ? "Reasoned"
                                        : "Reasoning"}
                                </span>
                            </div>
                            <ChevronDown
                                className={cn(
                                    "h-4 w-4 text-neutral-500 transition-transform duration-200",
                                    reasoningVisibilityMap[sectionKey] ? "rotate-180" : ""
                                )}
                            />
                        </button>

                        <AnimatePresence>
                            {reasoningVisibilityMap[sectionKey] && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="relative pl-4 mt-2">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                                        <div className="text-sm italic text-neutral-600 dark:text-neutral-400">
                                            <MarkdownRenderer content={part.reasoning} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            }
            case "tool-invocation":
                return (
                    <ToolInvocationListView
                        key={`${messageIndex}-${partIndex}-tool`}
                        toolInvocations={[part.toolInvocation]}
                        message={message}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col !font-sans items-center min-h-screen bg-background text-foreground transition-all duration-500">

            <div className={`w-full p-2 sm:p-4 ${status === 'ready' && messages.length === 0
                    ? 'min-h-screen flex flex-col items-center justify-center' // Center everything when no messages
                    : 'mt-20 sm:mt-16' // Add top margin when showing messages
                }`}>
                <div className={`w-full max-w-[90%] !font-sans sm:max-w-2xl space-y-6 p-0 mx-auto transition-all duration-300`}>
                    {status === 'ready' && messages.length === 0 && (
                        <div className="text-center !font-sans">
                            <h1 className="text-2xl sm:text-4xl mb-6 text-neutral-800 dark:text-neutral-100 font-syne">
                                What do you want to explore?
                            </h1>
                        </div>
                    )}
                    <AnimatePresence>
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.5 }}
                                className='!mt-4'
                            >
                                <FormComponent
                                    input={input}
                                    setInput={setInput}
                                    handleSubmit={handleSubmit}
                                    inputRef={inputRef}
                                    stop={stop}
                                    messages={memoizedMessages}
                                    append={append}
                                    selectedModel={selectedModel}
                                    setSelectedModel={handleModelChange}
                                    resetSuggestedQuestions={resetSuggestedQuestions}
                                    lastSubmittedQueryRef={lastSubmittedQueryRef}
                                    selectedGroup={selectedGroup}
                                    setSelectedGroup={setSelectedGroup}
                                    showExperimentalModels={true}
                                    status={status}
                                    setHasSubmitted={setHasSubmitted}
                                />
                                {memoizedSuggestionCards}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-4 sm:space-y-6 mb-32">
                        {memoizedMessages.map((message, index) => (
                            <div key={index}>
                                {message.role === 'user' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="mb-4 px-2 sm:px-0"
                                    >
                                        <div className="flex-grow min-w-0">
                                            {isEditingMessage && editingMessageIndex === index ? (
                                                <form onSubmit={handleMessageUpdate} className="w-full">
                                                    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                                        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
                                                            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                                                                Edit Query
                                                            </span>
                                                            <div className="bg-neutral-100 dark:bg-neutral-800 rounded-[9px] border border-neutral-200 dark:border-neutral-700 flex items-center">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        setIsEditingMessage(false);
                                                                        setEditingMessageIndex(-1);
                                                                        setInput('');
                                                                    }}
                                                                    className="h-7 w-7 !rounded-l-lg !rounded-r-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                                                    disabled={status === 'submitted' || status === 'streaming'}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                                <Separator orientation="vertical" className="h-7 bg-neutral-200 dark:bg-neutral-700" />
                                                                <Button
                                                                    type="submit"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 !rounded-r-lg !rounded-l-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                                                    disabled={status === 'submitted' || status === 'streaming'}
                                                                >
                                                                    <ArrowRight className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="p-4">
                                                            <textarea
                                                                value={input}
                                                                onChange={(e) => setInput(e.target.value)}
                                                                rows={3}
                                                                className="w-full resize-none rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 text-base text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                                placeholder="Edit your message..."
                                                            />
                                                        </div>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="group relative">
                                                    <div className="relative">
                                                        <p className="text-xl font-medium font-sans break-words text-neutral-900 dark:text-neutral-100 pr-16">
                                                            {message.content}
                                                        </p>
                                                        {!isEditingMessage && index === lastUserMessageIndex && (
                                                            <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-transparent rounded-[9px] border border-neutral-200 dark:border-neutral-700 flex items-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleMessageEdit(index)}
                                                                    className="h-7 w-7 !rounded-l-lg !rounded-r-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                                                    disabled={status === 'submitted' || status === 'streaming'}
                                                                >
                                                                    <svg 
                                                                        width="15" 
                                                                        height="15" 
                                                                        viewBox="0 0 15 15" 
                                                                        fill="none" 
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        className="h-4 w-4"
                                                                    >
                                                                        <path 
                                                                            d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L9.94915 6.83442L13.5382 3.24535L12.5 2.20711ZM8.99997 1.49997C9.27611 1.49997 9.49997 1.72383 9.49997 1.99997C9.49997 2.27611 9.27611 2.49997 8.99997 2.49997H4.49997C3.67154 2.49997 2.99997 3.17154 2.99997 3.99997V11C2.99997 11.8284 3.67154 12.5 4.49997 12.5H11.5C12.3284 12.5 13 11.8284 13 11V6.49997C13 6.22383 13.2238 5.99997 13.5 5.99997C13.7761 5.99997 14 6.22383 14 6.49997V11C14 12.3807 12.8807 13.5 11.5 13.5H4.49997C3.11926 13.5 1.99997 12.3807 1.99997 11V3.99997C1.99997 2.61926 3.11926 1.49997 4.49997 1.49997H8.99997Z" 
                                                                            fill="currentColor" 
                                                                            fillRule="evenodd" 
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                </Button>
                                                                <Separator orientation="vertical" className="h-7" />
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(message.content);
                                                                        toast.success("Copied to clipboard");
                                                                    }}
                                                                    className="h-7 w-7 !rounded-r-lg !rounded-l-none text-neutral-500 dark:text-neutral-400 hover:text-primary"
                                                                >
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {message.experimental_attachments && (
                                                        <div className='flex flex-row gap-2 mt-3'>
                                                            {message.experimental_attachments.map((attachment, attachmentIndex) => (
                                                                <div key={attachmentIndex}>
                                                                    {attachment.contentType!.startsWith('image/') && (
                                                                        <img
                                                                            src={attachment.url}
                                                                            alt={attachment.name || `Attachment ${attachmentIndex + 1}`}
                                                                            className="max-w-full h-32 sm:h-48 object-cover rounded-lg border border-neutral-200 dark:border-neutral-800"
                                                                        />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {message.role === 'assistant' && message.parts?.map((part, partIndex) =>
                                    renderPart(
                                        part as MessagePart,
                                        index,
                                        partIndex,
                                        message.parts as MessagePart[],
                                        message,
                                        data
                                    )
                                )}
                            </div>
                        ))}
                        {suggestedQuestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.5 }}
                                className="w-full max-w-xl sm:max-w-2xl"
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <AlignLeft className="w-5 h-5 text-primary" />
                                    <h2 className="font-semibold text-base text-neutral-800 dark:text-neutral-200">Suggested questions</h2>
                                </div>
                                <div className="space-y-2 flex flex-col">
                                    {suggestedQuestions.map((question, index) => (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            className="w-fit font-medium rounded-2xl p-1 justify-start text-left h-auto py-2 px-4 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 whitespace-normal"
                                            onClick={() => handleSuggestedQuestionClick(question)}
                                        >
                                            {question}
                                        </Button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                    <div ref={bottomRef} />
                </div>

                <AnimatePresence>
                    {messages.length > 0 || hasSubmitted ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.5 }}
                            className="fixed bottom-4 left-0 right-0 w-full max-w-[90%] sm:max-w-2xl mx-auto"
                        >
                            <FormComponent
                                input={input}
                                setInput={setInput}
                                handleSubmit={handleSubmit}
                                inputRef={inputRef}
                                stop={stop}
                                messages={messages}
                                append={append}
                                selectedModel={selectedModel}
                                setSelectedModel={handleModelChange}
                                resetSuggestedQuestions={resetSuggestedQuestions}
                                lastSubmittedQueryRef={lastSubmittedQueryRef}
                                selectedGroup={selectedGroup}
                                setSelectedGroup={setSelectedGroup}
                                showExperimentalModels={false}
                                status={status}
                                setHasSubmitted={setHasSubmitted}
                            />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}

ToolInvocationListView.displayName = 'ToolInvocationListView';

const Home = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <HomeContent />
            <InstallPrompt />
        </Suspense>
    );
};

export default Home;