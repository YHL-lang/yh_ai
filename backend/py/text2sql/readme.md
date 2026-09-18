# text2sql

语言描述，将自然语言描述为SQL语句。

## Sqlite 数据库
作为系统内置的文件数据库，Sqlite 是一种轻量级的数据库，无需安装，无需配置，无需管理。

- insertmany
  INSERT INTO XXX VALUES(?, ?, ?, ?)
- 事物 transaction
  - 订单 order
  - 商品 product count - 1
  - 付款 pay
