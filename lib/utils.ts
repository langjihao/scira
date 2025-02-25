// /lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Globe, Book, Mountain,Brain } from 'lucide-react'

import { ChatsCircle,  GithubLogo } from '@phosphor-icons/react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SearchGroupId = 'web' | 'academic'  | 'chat' | 'extreme' | 'github' ;

export const searchGroups = [
  {
    id: 'web' as const,
    name: 'Web',
    description: '全网搜索',
    icon: Globe,
    show: true,
  },
  {
    id: 'chat' as const,
    name: 'Chat',
    description: '直接对话',
    icon: ChatsCircle,
    show: true,
  },
  {
    id: 'academic' as const,
    name: 'Academic',
    description: 'EXA提供的学术搜索',
    icon: Book,
    show: true,
  },
  {
    id: 'extreme' as const,
    name: 'Extreme',
    description: '使用DeepSeek R1 进行深度搜索',
    icon: Brain,
    show: false,
  },
  {
    id: 'github' as const,
    name: 'GitHub',
    description: '代码仓库搜索',
    icon: GithubLogo,
    show: true,
  },
] as const;

export type SearchGroup = typeof searchGroups[number];
