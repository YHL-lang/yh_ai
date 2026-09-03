## Docker
- 本地安装了mysql
- docker pull mysql
  版本不一样

  -e env

  docker run -d --name mysql-demo -p 3307:3306 -e MYSQL_ROOT_PASSWORD=123456 mysql:8.0

  docker exec -it mysql-demo /bin/bash
  进入容器 linux 终端

  mysql -uroot -p123456
  进入mysql 数据库

## TS 高级类型
- Pick<T, 选取的类型的联合字符串>
- Omit<T, 要去掉的类型的联合字符串>

拼多多笔试题
Omit<T,K> 等价于 Pick<T, Exclude<keyof T, K>> 怎么理解？
- keyof T 拿到 所有键的联合类型
- Exclude 把要剔除的K 键删除，剩下需要保留的键
- 再用Pick 把剩下的键从类型T 中挑选出来，就实现了Omit 的效果
- TS 内部Omit 的等价实现

## 工具类型
Pick 、Omit、Partial 、Exclude、keyof、ReturnType、Record