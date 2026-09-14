# 安装Milvus
- 由多个image组成的
docker-compose 文件，编排多个image工作流

## 安装milvus

https://github.com/milvus-io/milvus/releases

点击 下载 
milvus-standalone-docker-compose.yml

如果把一个个 Docker 容器比作“乐高积木”，那 Docker Compose 就是那张“乐高模型图纸”。
以前你想搭个复杂的应用，得自己一个个找积木、手动拼，还容易拼错；现在你只需要照着这张“图纸”（配置文件），喊一声“一键启动”，它就能自动帮你把所有积木完美拼成一个完整的模型，省心又省力。

实现整个应用栈的一键自动化编排、部署

新建milvus 目录
将yaml文件放入

```
docker compose -f ./milvus-standalone-docker-compose.yml up -d
```
compose 合成  多容器应用进行操作
-f --file 指定文件
up 启动命令
-d 后台运行

milvus 跑在19530 端口

node 链接milvus

pnpm i @zilliz/milvus2-sdk-node
pnpm i @langchain/openai dotenv

.env

安装 GUI 工具

Attu 是Milvus 生态最好的GUI工具

https://github.com/zilliztech/attu/releases/tag/v3.0.0-beta.6