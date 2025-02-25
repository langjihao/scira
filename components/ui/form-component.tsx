/* eslint-disable @next/next/no-img-element */
// /components/ui/form-component.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card"
import useWindowSize from '@/hooks/use-window-size';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, SearchGroup, SearchGroupId, searchGroups } from '@/lib/utils';
import { TextMorph } from '@/components/core/text-morph';
import { Brain } from "lucide-react"
import { UIMessage } from '@ai-sdk/ui-utils';
import { set } from 'zod';

interface ModelSwitcherProps {
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    className?: string;
    showExperimentalModels: boolean;
    messages: Array<Message>;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
}

const XAIIcon = ({ className }: { className?: string }) => (
    <svg 
        width="440" 
        height="483" 
        viewBox="0 0 440 483" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path d="M356.09 155.99L364.4 482.36H430.96L439.28 37.18L356.09 155.99Z" fill="currentColor"/>
        <path d="M439.28 0.910004H337.72L178.35 228.53L229.13 301.05L439.28 0.910004Z" fill="currentColor"/>
        <path d="M0.609985 482.36H102.17L152.96 409.84L102.17 337.31L0.609985 482.36Z" fill="currentColor"/>
        <path d="M0.609985 155.99L229.13 482.36H330.69L102.17 155.99H0.609985Z" fill="currentColor"/>
    </svg>
);

const AnthropicIcon = ({ className }: { className?: string }) => (
    <svg 
        role="img" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <title>Anthropic</title>
        <path fill="currentColor" d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/>
    </svg>
);

const models = [
    { value: "scira-default", label: "Grok 2.0", icon: XAIIcon, iconClass: "!text-neutral-300", description: "xAI's Grok 2.0 model", color: "glossyblack", vision: false, experimental: false, category: "Stable" },
    { value: "scira-grok-vision", label: "Grok 2.0 Vision", icon: XAIIcon, iconClass: "!text-neutral-300", description: "xAI's Grok 2.0 Vision model", color: "steel", vision: true, experimental: false, category: "Stable" },
    { value: "scira-sonnet", label: "Claude 3.5 Sonnet", icon: AnthropicIcon, iconClass: "!text-neutral-900 dark:!text-white", description: "Anthropic's G.O.A.T. model", color: "purple", vision: true, experimental: false, category: "Stable" },
    { value: "scira-llama", label: "Llama 3.3 70B", icon: "/cerebras.png", iconClass: "!text-neutral-900 dark:!text-white", description: "Meta's Llama model by Cerebras", color: "offgray", vision: false, experimental: true, category: "Experimental" },
    { value: "scira-r1", label: "DeepSeek R1 Distilled", icon: "/groq.svg", iconClass: "!text-neutral-900 dark:!text-white", description: "DeepSeek R1 model by Groq", color: "sapphire", vision: false, experimental: true, category: "Experimental" },
];

const getColorClasses = (color: string, isSelected: boolean = false) => {
    const baseClasses = "transition-colors duration-200";
    const selectedClasses = isSelected ? "!bg-opacity-100 dark:!bg-opacity-100" : "";

    switch (color) {
        case 'glossyblack':
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-[#4D4D4D] dark:!bg-[#3A3A3A] !text-white hover:!bg-[#3D3D3D] dark:hover:!bg-[#434343] !border-[#4D4D4D] dark:!border-[#3A3A3A] !ring-[#4D4D4D] dark:!ring-[#3A3A3A] focus:!ring-[#4D4D4D] dark:focus:!ring-[#3A3A3A]`
                : `${baseClasses} !text-[#4D4D4D] dark:!text-[#E5E5E5] hover:!bg-[#4D4D4D] hover:!text-white dark:hover:!bg-[#3A3A3A] dark:hover:!text-white`;
        case 'steel':
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-[#4B82B8] dark:!bg-[#4A7CAD] !text-white hover:!bg-[#3B6C9D] dark:hover:!bg-[#3A6C9D] !border-[#4B82B8] dark:!border-[#4A7CAD] !ring-[#4B82B8] dark:!ring-[#4A7CAD] focus:!ring-[#4B82B8] dark:focus:!ring-[#4A7CAD]`
                : `${baseClasses} !text-[#4B82B8] dark:!text-[#A7C5E2] hover:!bg-[#4B82B8] hover:!text-white dark:hover:!bg-[#4A7CAD] dark:hover:!text-white`;
        case 'offgray':
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-[#505050] dark:!bg-[#505050] !text-white hover:!bg-[#404040] dark:hover:!bg-[#404040] !border-[#505050] dark:!border-[#505050] !ring-[#505050] dark:!ring-[#505050] focus:!ring-[#505050] dark:focus:!ring-[#505050]`
                : `${baseClasses} !text-[#505050] dark:!text-[#D0D0D0] hover:!bg-[#505050] hover:!text-white dark:hover:!bg-[#505050] dark:hover:!text-white`;
        case 'purple':
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-[#6366F1] dark:!bg-[#5B54E5] !text-white hover:!bg-[#4F46E5] dark:hover:!bg-[#4B44D5] !border-[#6366F1] dark:!border-[#5B54E5] !ring-[#6366F1] dark:!ring-[#5B54E5] focus:!ring-[#6366F1] dark:focus:!ring-[#5B54E5]`
                : `${baseClasses} !text-[#6366F1] dark:!text-[#A5A0FF] hover:!bg-[#6366F1] hover:!text-white dark:hover:!bg-[#5B54E5] dark:hover:!text-white`;
        case 'sapphire':
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-[#2E4A5C] dark:!bg-[#2E4A5C] !text-white hover:!bg-[#1E3A4C] dark:hover:!bg-[#1E3A4C] !border-[#2E4A5C] dark:!border-[#2E4A5C] !ring-[#2E4A5C] dark:!ring-[#2E4A5C] focus:!ring-[#2E4A5C] dark:focus:!ring-[#2E4A5C]`
                : `${baseClasses} !text-[#2E4A5C] dark:!text-[#89B4D4] hover:!bg-[#2E4A5C] hover:!text-white dark:hover:!bg-[#2E4A5C] dark:hover:!text-white`;
        case 'bronze':
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-[#9B6E4C] dark:!bg-[#9B6E4C] !text-white hover:!bg-[#8B5E3C] dark:hover:!bg-[#8B5E3C] !border-[#9B6E4C] dark:!border-[#9B6E4C] !ring-[#9B6E4C] dark:!ring-[#9B6E4C] focus:!ring-[#9B6E4C] dark:focus:!ring-[#9B6E4C]`
                : `${baseClasses} !text-[#9B6E4C] dark:!text-[#D4B594] hover:!bg-[#9B6E4C] hover:!text-white dark:hover:!bg-[#9B6E4C] dark:hover:!text-white`;
        default:
            return isSelected
                ? `${baseClasses} ${selectedClasses} !bg-neutral-500 dark:!bg-neutral-700 !text-white hover:!bg-neutral-600 dark:hover:!bg-neutral-800 !border-neutral-500 dark:!border-neutral-700`
                : `${baseClasses} !text-neutral-600 dark:!text-neutral-300 hover:!bg-neutral-500 hover:!text-white dark:hover:!bg-neutral-700 dark:hover:!text-white`;
    }
}

const ModelSwitcher: React.FC<ModelSwitcherProps> = ({ selectedModel, setSelectedModel, className, showExperimentalModels, messages, status }) => {
    const selectedModelData = models.find(model => model.value === selectedModel);
    const [isOpen, setIsOpen] = useState(false);
    const isProcessing = status === 'submitted' || status === 'streaming';


    // Filter models based on attachments first, then experimental status
    const filteredModels = models.filter(model => showExperimentalModels ? true : !model.experimental);

    // Group filtered models by category
    const groupedModels = filteredModels.reduce((acc, model) => {
        const category = model.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(model);
        return acc;
    }, {} as Record<string, typeof models>);

    // Only show divider if we have multiple categories and no attachments
    const showDivider = (category: string) => {
        return  showExperimentalModels && category === "Stable";
    };

    return (
        <DropdownMenu 
            onOpenChange={setIsOpen} 
            modal={false}
            open={isOpen && !isProcessing}
        >
            <DropdownMenuTrigger
                className={cn(
                    "flex items-center gap-2 p-2 sm:px-3 h-8",
                    "rounded-full transition-all duration-300",
                    "border border-neutral-200 dark:border-neutral-800",
                    "hover:shadow-md",
                    getColorClasses(selectedModelData?.color || "neutral", true),
                    isProcessing && "opacity-50 pointer-events-none",
                    className
                )}
                disabled={isProcessing}
            >
                {selectedModelData && (
                    typeof selectedModelData.icon === 'string' ? (
                        <img 
                            src={selectedModelData.icon} 
                            alt={selectedModelData.label}
                            className={cn(
                                "w-3.5 h-3.5 object-contain",
                                selectedModelData.iconClass
                            )}
                        />
                    ) : (
                        <selectedModelData.icon 
                            className={cn(
                                "w-3.5 h-3.5",
                                selectedModelData.iconClass
                            )}
                        />
                    )
                )}
                <span className="hidden sm:block text-xs font-medium overflow-hidden">
                    <TextMorph
                        variants={{
                            initial: { opacity: 0, y: 10 },
                            animate: { opacity: 1, y: 0 },
                            exit: { opacity: 0, y: -10 }
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            mass: 0.5
                        }}
                    >
                        {selectedModelData?.label || ""}
                    </TextMorph>
                </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[220px] p-1 !font-sans rounded-lg bg-white dark:bg-neutral-900 sm:ml-4 !mt-1.5 sm:m-auto !z-[52] shadow-lg border border-neutral-200 dark:border-neutral-800"
                align="start"
                sideOffset={8}
            >
                {Object.entries(groupedModels).map(([category, categoryModels], categoryIndex) => (
                    <div key={category} className={cn(
                        categoryIndex > 0 && "mt-1"
                    )}>
                        <div className="px-2 py-1.5 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 select-none">
                            {category}
                        </div>
                        <div className="space-y-0.5">
                            {categoryModels.map((model) => (
                                <DropdownMenuItem
                                    key={model.value}
                                    onSelect={() => {
                                        console.log("Selected model:", model.value);
                                        setSelectedModel(model.value.trim());
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs",
                                        "transition-all duration-200",
                                        "hover:shadow-sm",
                                        getColorClasses(model.color, selectedModel === model.value)
                                    )}
                                >
                                    <div className={cn(
                                        "p-1.5 rounded-md",
                                        selectedModel === model.value
                                            ? "bg-black/10 dark:bg-white/10"
                                            : "bg-black/5 dark:bg-white/5",
                                        "group-hover:bg-black/10 dark:group-hover:bg-white/10"
                                    )}>
                                        {typeof model.icon === 'string' ? (
                                            <img 
                                                src={model.icon}
                                                alt={model.label}
                                                className={cn(
                                                    "w-3 h-3 object-contain",
                                                    model.iconClass
                                                )}
                                            />
                                        ) : (
                                            <model.icon 
                                                className={cn(
                                                    "w-3 h-3",
                                                    model.iconClass
                                                )}
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-px min-w-0">
                                        <div className="font-medium truncate">{model.label}</div>
                                        <div className="text-[10px] opacity-80 truncate leading-tight">{model.description}</div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </div>
                        {showDivider(category) && (
                            <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
                        )}
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};



const ArrowUpIcon = ({ size = 16 }: { size?: number }) => {
    return (
        <svg
            height={size}
            strokeLinejoin="round"
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
                fill="currentColor"
            ></path>
        </svg>
    );
};

const StopIcon = ({ size = 16 }: { size?: number }) => {
    return (
        <svg
            height={size}
            viewBox="0 0 16 16"
            width={size}
            style={{ color: "currentcolor" }}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 3H13V13H3V3Z"
                fill="currentColor"
            ></path>
        </svg>
    );
};



const MAX_IMAGES = 4;


interface FormComponentProps {
    input: string;
    setInput: (input: string) => void;
    handleSubmit: (
        event?: {
            preventDefault?: () => void;
        },
        chatRequestOptions?: ChatRequestOptions,
    ) => void;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    stop: () => void;
    messages: Array<UIMessage>;
    append: (
        message: Message | CreateMessage,
        chatRequestOptions?: ChatRequestOptions,
    ) => Promise<string | null | undefined>;
    selectedModel: string;
    setSelectedModel: (value: string) => void;
    resetSuggestedQuestions: () => void;
    lastSubmittedQueryRef: React.MutableRefObject<string>;
    selectedGroup: SearchGroupId;
    setSelectedGroup: React.Dispatch<React.SetStateAction<SearchGroupId>>;
    showExperimentalModels: boolean;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
    setHasSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
}

interface GroupSelectorProps {
    selectedGroup: SearchGroupId;
    onGroupSelect: (group: SearchGroup) => void;
    status: 'submitted' | 'streaming' | 'ready' | 'error';
}

interface ToolbarButtonProps {
    group: SearchGroup;
    isSelected: boolean;
    onClick: () => void;
}

const ToolbarButton = ({ group, isSelected, onClick }: ToolbarButtonProps) => {
    const Icon = group.icon;
    const { width } = useWindowSize();
    const isMobile = width ? width < 768 : false;

    const commonClassNames = cn(
        "relative flex items-center justify-center",
        "size-8",
        "rounded-full",
        "transition-colors duration-300",
        isSelected
            ? "bg-neutral-500 dark:bg-neutral-600 text-white dark:text-neutral-300"
            : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80"
    );

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
    };

    // Use regular button for mobile
    if (isMobile) {
        return (
            <button
                onClick={handleClick}
                className={commonClassNames}
                style={{ WebkitTapHighlightColor: 'transparent' }}
            >
                <Icon className="size-4" />
            </button>
        );
    }

    // Use motion.button for desktop
    const button = (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className={commonClassNames}
        >
            <Icon className="size-4" />
        </motion.button>
    );

    return (
        <HoverCard openDelay={100} closeDelay={50}>
            <HoverCardTrigger asChild>
                {button}
            </HoverCardTrigger>
            <HoverCardContent
                side="bottom"
                align="center"
                sideOffset={6}
                className={cn(
                    "z-[100]",
                    "w-44 p-2 rounded-lg",
                    "border border-neutral-200 dark:border-neutral-700",
                    "bg-white dark:bg-neutral-800 shadow-md",
                    "transition-opacity duration-300"
                )}
            >
                <div className="space-y-0.5">
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {group.name}
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-normal">
                        {group.description}
                    </p>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

const SelectionContent = ({ ...props }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isProcessing = props.status === 'submitted' || props.status === 'streaming';

    return (
        <motion.div
            layout={false}
            initial={false}
            animate={{
                width: isExpanded && !isProcessing ? "auto" : "30px",
                gap: isExpanded && !isProcessing ? "0.5rem" : 0,
                paddingRight: isExpanded && !isProcessing ? "0.5rem" : 0,
            }}
            transition={{
                duration: 0.2,
                ease: "easeInOut",
            }}
            className={cn(
                "inline-flex items-center min-w-[38px] p-0.5",
                "rounded-full border border-neutral-200 dark:border-neutral-800",
                "bg-white dark:bg-neutral-900 shadow-sm overflow-visible",
                "relative z-10",
                isProcessing && "opacity-50 pointer-events-none"
            )}
            onMouseEnter={() => !isProcessing && setIsExpanded(true)}
            onMouseLeave={() => !isProcessing && setIsExpanded(false)}
        >
            <AnimatePresence initial={false}>
                {searchGroups.filter(group => group.show).map((group) => {
                    const showItem = (isExpanded && !isProcessing) || props.selectedGroup === group.id;
                    return (
                        <motion.div
                            key={group.id}
                            layout={false}
                            animate={{
                                width: showItem ? "28px" : 0,
                                opacity: showItem ? 1 : 0
                            }}
                            transition={{
                                duration: 0.15,
                                ease: "easeInOut"
                            }}
                            style={{ margin: 0 }}
                        >
                            <ToolbarButton
                                group={group}
                                isSelected={props.selectedGroup === group.id}
                                onClick={() => !isProcessing && props.onGroupSelect(group)}
                            />
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </motion.div>
    );
};

const GroupSelector = ({ selectedGroup, onGroupSelect, status }: GroupSelectorProps) => {
    return (
        <SelectionContent
            selectedGroup={selectedGroup}
            onGroupSelect={onGroupSelect}
            status={status}
        />
    );
};

const FormComponent: React.FC<FormComponentProps> = ({
    input,
    setInput,
    handleSubmit,
    inputRef,
    stop,
    selectedModel,
    setSelectedModel,
    resetSuggestedQuestions,
    lastSubmittedQueryRef,
    selectedGroup,
    setSelectedGroup,
    showExperimentalModels,
    messages,
    status,
    setHasSubmitted,
}) => {
    
    const isMounted = useRef(true);
    const { width } = useWindowSize();
    const [isFocused, setIsFocused] = useState(false);

    // Add a ref to track the initial group selection
    const initialGroupRef = useRef(selectedGroup);

    const MIN_HEIGHT = 72;
    const MAX_HEIGHT = 400;

    const autoResizeInput = (target: HTMLTextAreaElement) => {
        if (!target) return;
        requestAnimationFrame(() => {
            target.style.height = 'auto';
            const newHeight = Math.min(Math.max(target.scrollHeight, MIN_HEIGHT), MAX_HEIGHT);
            target.style.height = `${newHeight}px`;
        });
    };

    const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        setInput(event.target.value);
        autoResizeInput(event.target);
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleGroupSelect = useCallback((group: SearchGroup) => {
        setSelectedGroup(group.id);
        inputRef.current?.focus();
    }, [setSelectedGroup, inputRef]);

    useEffect(() => {
        if (status !== 'ready' && inputRef.current) {
            const focusTimeout = setTimeout(() => {
                if (isMounted.current && inputRef.current) {
                    inputRef.current.focus({
                        preventScroll: true
                    });
                }
            }, 300);

            return () => clearTimeout(focusTimeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (status !== 'ready') {
            toast.error("Please wait for the current response to complete!");
            return;
        }

        if (input.trim()) {
            setHasSubmitted(true);
            lastSubmittedQueryRef.current = input.trim();

            handleSubmit(event);


        } else {
            toast.error("Please enter a search query or attach an image.");
        }
    }, [input,  handleSubmit, lastSubmittedQueryRef, status,setHasSubmitted]);

    const submitForm = useCallback(() => {
        onSubmit({ preventDefault: () => { }, stopPropagation: () => { } } as React.FormEvent<HTMLFormElement>);
        resetSuggestedQuestions();

        if (width && width > 768) {
            inputRef.current?.focus();
        }
    }, [onSubmit, resetSuggestedQuestions, width, inputRef]);


    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (status === 'submitted' || status === 'streaming') {
                toast.error("Please wait for the response to complete!");
            } else {
                submitForm();
                if (width && width > 768) {
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 100);
                }
            }
        }
    };

    const isProcessing = status === 'submitted' || status === 'streaming';
    const hasInteracted = messages.length > 0;

    return (
        <div 
        >


            <div className="relative rounded-lg bg-neutral-100 dark:bg-neutral-900">
                <Textarea
                    ref={inputRef}
                    placeholder={hasInteracted ? "Ask a new question..." : "Ask a question..."}
                    value={input}
                    onChange={handleInput}
                    disabled={isProcessing}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={cn(
                        "min-h-[72px] w-full resize-none rounded-lg",
                        "text-base leading-relaxed",
                        "bg-neutral-100 dark:bg-neutral-900",
                        "border !border-neutral-200 dark:!border-neutral-700",
                        "focus:!border-neutral-300 dark:focus:!border-neutral-600",
                        isFocused ? "!border-neutral-300 dark:!border-neutral-600" : "",
                        "text-neutral-900 dark:text-neutral-100",
                        "focus:!ring-1 focus:!ring-neutral-300 dark:focus:!ring-neutral-600",
                        "px-4 pt-4 pb-16",
                        "overflow-y-auto",
                        "touch-manipulation",
                    )}
                    style={{
                        maxHeight: `${MAX_HEIGHT}px`,
                        WebkitUserSelect: 'text',
                        WebkitTouchCallout: 'none',
                    }}
                    rows={1}
                    autoFocus={width ? width > 768 : true}
                    onKeyDown={handleKeyDown}
                    // onPaste={handlePaste}
                />

                <div className={cn(
                    "absolute bottom-0 inset-x-0 flex justify-between items-center p-2 rounded-b-lg",
                    "bg-neutral-100 dark:bg-neutral-900",
                    "!border !border-t-0 !border-neutral-200 dark:!border-neutral-700",
                    isFocused ? "!border-neutral-300 dark:!border-neutral-600" : "",
                    isProcessing ? "!opacity-20 !cursor-not-allowed" : ""
                )}>
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "transition-all duration-100",
                            (selectedGroup !== 'extreme')
                                ? "opacity-100 visible w-auto"
                                : "opacity-0 invisible w-0"
                        )}>
                            <GroupSelector
                                selectedGroup={selectedGroup}
                                onGroupSelect={handleGroupSelect}
                                status={status}
                            />
                        </div>
                        
                        <ModelSwitcher
                            selectedModel={selectedModel}
                            setSelectedModel={setSelectedModel}
                            showExperimentalModels={showExperimentalModels}
                            messages={messages}
                            status={status}
                        />
                        
                        <div className={cn(
                            "transition-all duration-300",
                            (!hasInteracted || initialGroupRef.current === 'extreme')
                                ? "opacity-100 visible w-auto"
                                : "opacity-0 invisible w-0"
                        )}>
                            <button
                                onClick={() => {
                                    if (!hasInteracted || selectedGroup !== 'extreme') {
                                        setSelectedGroup(selectedGroup === 'extreme' ? 'web' : 'extreme');
                                        resetSuggestedQuestions();
                                    }
                                }}
                                disabled={hasInteracted && selectedGroup === 'extreme'}
                                className={cn(
                                    "flex items-center gap-2 p-2 sm:px-3 h-8",
                                    "rounded-full transition-all duration-300",
                                    "border border-neutral-200 dark:border-neutral-800",
                                    "hover:shadow-md",
                                    selectedGroup === 'extreme' 
                                        ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900" 
                                        : "bg-white dark:bg-neutral-900 text-neutral-500",
                                    (hasInteracted && selectedGroup === 'extreme') && "opacity-50 cursor-not-allowed hover:shadow-none"
                                )}
                            >
                                <Brain className="h-3.5 w-3.5" />
                                <span className="hidden sm:block text-xs font-medium">深度思考</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">

                        {isProcessing ? (
                            <Button
                                className="rounded-full p-1.5 h-8 w-8"
                                onClick={(event) => {
                                    event.preventDefault();
                                    stop();
                                }}
                                variant="destructive"
                            >
                                <StopIcon size={14} />
                            </Button>
                        ) : (
                            <Button
                                className="rounded-full p-1.5 h-8 w-8"
                                onClick={(event) => {
                                    event.preventDefault();
                                    submitForm();
                                }}
                                disabled={input.length === 0 &&  status !== 'ready'}
                            >
                                <ArrowUpIcon size={14} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FormComponent;
