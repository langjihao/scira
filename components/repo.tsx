import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Star, Clock, Code, GitFork, Eye, FileCode2, GitBranch } from "lucide-react";


// interface GithubApiResponse {
//   data: Array<{
//     name: string;
//     description: string;
//     html_url: string;
//     stargazers_count: number;
//     language: string;
//     updated_at: string;
//   }>;
// }

// interface GithubRepositoryProps {
//   data: GithubApiResponse;
// }

export const GithubRepository = ({ data }: any) => {
    if (!data?.results?.length) {
      return null;
    }
    console.log(data);
    const formatDate = (timestamp: string) => {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
  
    const getLanguageColor = (language: string) => {
      const colors: { [key: string]: string } = {
        TypeScript: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        JavaScript: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        Python: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        default: "bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
      };
      return colors[language] || colors.default;
    };
  
    return (
      <Card className="w-full my-4 overflow-hidden">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center backdrop-blur-sm">
              <Code className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle>GitHub 仓库</CardTitle>
              <p className="text-sm text-muted-foreground">找到 {data.results.length} 个仓库</p>
            </div>
          </div>
        </CardHeader>
  
        <div className="px-4 pb-2">
          <div className="flex overflow-x-auto gap-4 no-scrollbar hover:overflow-x-scroll">
            {data.results.map((repo: any, index: number) => (
              <motion.div
                key={repo.url}
                className="w-[400px] flex-none"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="h-[300px] relative group">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/20 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div onClick={() => window.open(repo.url, '_blank')} className="h-full relative backdrop-blur-sm bg-background/95 dark:bg-neutral-900/95 border border-neutral-200/50 dark:border-neutral-800/50 rounded-xl p-4 flex flex-col transition-all duration-500 group-hover:border-blue-500/20">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-xl tracking-tight line-clamp-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {repo.name}
                      </h3>
                      <Badge className={getLanguageColor(repo.language)}>
                        {repo.language}
                      </Badge>
                    </div>
  
                    <div className="flex-1 relative mb-4 pl-3">
                      <div className="absolute -left-0 top-1 bottom-1 w-[2px] rounded-full bg-gradient-to-b from-blue-500 via-blue-400 to-transparent opacity-50" />
                      <p className="text-sm text-muted-foreground line-clamp-4">
                        {repo.description}
                      </p>
                    </div>
  
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-muted-foreground bg-neutral-100 dark:bg-neutral-800 rounded-md mb-4 w-fit">
                      <Star className="h-3.5 w-3.5 text-blue-500" />
                      <span>{repo.stars.toLocaleString()}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>更新于 {formatDate(repo.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>
    );
  };