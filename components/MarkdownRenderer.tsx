/* eslint-disable @next/next/no-img-element */
"use client";
import 'katex/dist/katex.min.css';

import { InstallPrompt } from '@/components/InstallPrompt';
import InteractiveChart from '@/components/interactive-charts';
import MultiSearch from '@/components/multi-search';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { cn, SearchGroupId } from '@/lib/utils';
import { Wave } from "@foobar404/wave";
import { CheckCircle,Info,  } from '@phosphor-icons/react';
import { TextIcon } from '@radix-ui/react-icons';
import { ToolInvocation } from 'ai';
import { useChat, UseChatOptions } from '@ai-sdk/react';
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
import Marked, { ReactRenderer } from 'marked-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { parseAsString, useQueryState } from 'nuqs';
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
import Latex from 'react-latex-next';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import {
    fetchMetadata,
    generateSpeech,
    suggestQuestions
} from '@/app/actions';
import { ReasoningUIPart, ToolInvocationUIPart, TextUIPart, SourceUIPart } from '@ai-sdk/ui-utils';

import FormComponent from '@/components/ui/form-component';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Separator } from '@/components/ui/separator';
import ReasonSearch from '@/components/reason-search';
import type { StreamUpdate } from '@/components/reason-search';
import {LoadingFallback,SearchLoadingState } from '@/components/Loading';
import  CollapsibleSection  from '@/components/CollapsibleSection';
export const maxDuration = 120;
interface MarkdownRendererProps {
    content: string;
}

interface CitationLink {
    text: string;
    link: string;
}

interface LinkMetadata {
    title: string;
    description: string;
}
const isValidUrl = (str: string) => {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
};
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const [metadataCache, setMetadataCache] = useState<Record<string, LinkMetadata>>({});

    const citationLinks = useMemo<CitationLink[]>(() => {
        return Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map(([_, text, link]) => ({ text, link }));
    }, [content]);

    const fetchMetadataWithCache = useCallback(async (url: string) => {
        if (metadataCache[url]) {
            return metadataCache[url];
        }
        const metadata = await fetchMetadata(url);
        if (metadata) {
            setMetadataCache(prev => ({ ...prev, [url]: metadata }));
        }
        return metadata;
    }, [metadataCache]);

    interface CodeBlockProps {
        language: string | undefined;
        children: string;
    }

    const CodeBlock = React.memo(({ language, children }: CodeBlockProps) => {
        const [isCopied, setIsCopied] = useState(false);
        const { theme } = useTheme();

        const handleCopy = useCallback(async () => {
            await navigator.clipboard.writeText(children);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }, [children]);

        return (
            <div className="group my-3">
                <div className="grid grid-rows-[auto,1fr] rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800">
                        <div className="px-2 py-0.5 text-xs font-medium bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-500 dark:text-neutral-400 rounded-md border border-neutral-200 dark:border-neutral-700">
                            {language || 'text'}
                        </div>
                        <button
                            onClick={handleCopy}
                            className={`
                  px-2 py-1.5
                  rounded-md text-xs
                  transition-colors duration-200
                  ${isCopied ? 'bg-green-500/10 text-green-500' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'}
                  opacity-0 group-hover:opacity-100
                  hover:bg-neutral-200 dark:hover:bg-neutral-700
                  flex items-center gap-1.5
                `}
                            aria-label={isCopied ? 'Copied!' : 'Copy code'}
                        >
                            {isCopied ? (
                                <>
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className={`overflow-x-auto ${GeistMono.className}`}>
                        <SyntaxHighlighter
                            language={language || 'text'}
                            style={theme === 'dark' ? atomDark : vs}
                            showLineNumbers
                            wrapLines
                            customStyle={{
                                margin: 0,
                                padding: '1.5rem',
                                fontSize: '0.875rem',
                                background: theme === 'dark' ? '#171717' : '#ffffff',
                                lineHeight: 1.6,
                                borderBottomLeftRadius: '0.5rem',
                                borderBottomRightRadius: '0.5rem',
                            }}
                            lineNumberStyle={{
                                minWidth: '2.5em',
                                paddingRight: '1em',
                                color: theme === 'dark' ? '#404040' : '#94a3b8',
                                userSelect: 'none',
                            }}
                            codeTagProps={{
                                style: {
                                    color: theme === 'dark' ? '#e5e5e5' : '#1e293b',
                                    fontFamily: 'var(--font-mono)',
                                }
                            }}
                        >
                            {children}
                        </SyntaxHighlighter>
                    </div>
                </div>
            </div>
        );
    }, (prevProps, nextProps) =>
        prevProps.children === nextProps.children &&
        prevProps.language === nextProps.language
    );

    CodeBlock.displayName = 'CodeBlock';

    const LinkPreview = ({ href }: { href: string }) => {
        const [metadata, setMetadata] = useState<LinkMetadata | null>(null);
        const [isLoading, setIsLoading] = useState(false);

        React.useEffect(() => {
            setIsLoading(true);
            fetchMetadataWithCache(href).then((data) => {
                setMetadata(data);
                setIsLoading(false);
            });
        }, [href]);

        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-neutral-500 dark:text-neutral-400" />
                </div>
            );
        }

        const domain = new URL(href).hostname;

        return (
            <div className="flex flex-col space-y-2 bg-white dark:bg-neutral-800 rounded-md shadow-md overflow-hidden">
                <div className="flex items-center space-x-2 p-3 bg-neutral-100 dark:bg-neutral-700">
                    <Image
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=256`}
                        alt="Favicon"
                        width={20}
                        height={20}
                        className="rounded-sm"
                    />
                    <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 truncate">{domain}</span>
                </div>
                <div className="px-3 pb-3">
                    <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 line-clamp-2">
                        {metadata?.title || "Untitled"}
                    </h3>
                    {metadata?.description && (
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                            {metadata.description}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    const renderHoverCard = (href: string, text: React.ReactNode, isCitation: boolean = false) => {
        return (
            <HoverCard>
                <HoverCardTrigger asChild>
                    <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={isCitation ? "cursor-pointer text-sm text-primary py-0.5 px-1.5 m-0 bg-neutral-200 dark:bg-neutral-700 rounded-full no-underline" : "text-teal-600 dark:text-teal-400 no-underline hover:underline"}
                    >
                        {text}
                    </Link>
                </HoverCardTrigger>
                <HoverCardContent
                    side="top"
                    align="start"
                    className="w-80 p-0 shadow-lg"
                >
                    <LinkPreview href={href} />
                </HoverCardContent>
            </HoverCard>
        );
    };

    const renderer: Partial<ReactRenderer> = {
        text(text: string) {
            if (!text.includes('$')) return text;
            return (
                <Latex
                    delimiters={[
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ]}
                >
                    {text}
                </Latex>
            );
        },
        paragraph(children) {
            if (typeof children === 'string' && children.includes('$')) {
                return (
                    <p className="my-4">
                        <Latex
                            delimiters={[
                                { left: '$$', right: '$$', display: true },
                                { left: '$', right: '$', display: false }
                            ]}
                        >
                            {children}
                        </Latex>
                    </p>
                );
            }
            return <p className="my-4">{children}</p>;
        },
        code(children, language) {
            return <CodeBlock language={language}>{String(children)}</CodeBlock>;
        },
        link(href, text) {
            const citationIndex = citationLinks.findIndex(link => link.link === href);
            if (citationIndex !== -1) {
                return (
                    <sup>
                        {renderHoverCard(href, citationIndex + 1, true)}
                    </sup>
                );
            }
            return isValidUrl(href)
                ? renderHoverCard(href, text)
                : <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline">{text}</a>;
        },
        heading(children, level) {
            const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
            const className = `text-${4 - level}xl font-bold my-4 text-neutral-800 dark:text-neutral-100`;
            return <HeadingTag className={className}>{children}</HeadingTag>;
        },
        list(children, ordered) {
            const ListTag = ordered ? 'ol' : 'ul';
            return <ListTag className="list-inside list-disc my-4 pl-4 text-neutral-800 dark:text-neutral-200">{children}</ListTag>;
        },
        listItem(children) {
            return <li className="my-2 text-neutral-800 dark:text-neutral-200">{children}</li>;
        },
        blockquote(children) {
            return <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 italic my-4 text-neutral-700 dark:text-neutral-300">{children}</blockquote>;
        },
    };

    return (
        <div className="markdown-body dark:text-neutral-200 font-sans">
            <Marked renderer={renderer}>{content}</Marked>
        </div>
    );
};
export default MarkdownRenderer;