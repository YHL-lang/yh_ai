# ElasticSearch 全文检索

文章 AI ， RAG， 远程实习
MySQL 关系型数据库，字段查找，表关联 适合的，快
content 内容字段 全文检索，mysql 扛不住，性能很差
select like 建议不要用的，用 ElasticSearch 全文检索

把text 分词 tokenization
可以在浏览器中运行机器学习模型

可以  浏览器  机器学习 .... 索引

mysql database -> table -> row -> column -> 文本
like 性能不好
ES 分词 -> 文本 -> row -> table -> database 倒过来的
浏览器 索引 [1,2] 倒排索引
机器学习

## compose
docker 是个容器化技术
image 镜像（代码和环境依赖）运行起来
容器 container

将多个镜像编排到一起，docker-compose.yml就是这个多镜像编排配置文件

docker compose up -d
- docker compose 寻找目录下的 docker-compose.yml 文件
- up 启动起来
- -d 后台运行

使用docker 来启动 ElasticSearch