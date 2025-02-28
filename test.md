```mermind
graph TD
    A[OCT图像组输入] --> B[中央控制LLM Agent]
    
    %% AI工具集
    B -->|调用| C1[图像预处理工具]
    B -->|调用| C2[图像分割工具]
    B -->|调用| C3[异常检测工具]
    B -->|调用| C4[测量分析工具]
    B -->|调用| C5[诊断分类模型]
    B -->|调用| C6[病变比对数据库]
    B -->|调用| C7[医学知识库]
    
    %% 工具回流
    C1 -->|返回处理后图像| B
    C2 -->|返回分割结果| B
    C3 -->|返回异常区域| B
    C4 -->|返回测量数据| B
    C5 -->|返回分类结果| B
    C6 -->|返回比对结果| B
    C7 -->|返回医学解释| B
    
    %% 生成报告
    B -->|整合分析结果| D[生成结构化数据]
    D --> E[生成自然语言报告]
    E --> F[最终OCT检查报告]
    
    %% 说明
    style B fill:#f9d5e5,stroke:#333,stroke-width:2px
    style F fill:#d5f9e6,stroke:#333,stroke-width:2px
    
    classDef tools fill:#e6f3ff,stroke:#333,stroke-width:1px
    class C1,C2,C3,C4,C5,C6,C7 tools

```