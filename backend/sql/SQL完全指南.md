# 🗄️ SQL 完全指南：从入门到精通

> 📚 本文基于博客系统数据库设计，全面覆盖 SQL 核心知识点

---

## 📑 目录

1. [数据库基础概念](#1-数据库基础概念)
2. [数据库设计三大范式](#2-数据库设计三大范式)
3. [数据类型详解](#3-数据类型详解)
4. [表的创建与管理](#4-表的创建与管理)
5. [约束 Constraints](#5-约束-constraints)
6. [索引 Index](#6-索引-index)
7. [CRUD 操作](#7-crud-操作)
8. [多表查询 JOIN](#8-多表查询-join)
9. [子查询](#9-子查询)
10. [事务 Transaction](#10-事务-transaction)
11. [存储过程与函数](#11-存储过程与函数)
12. [视图 View](#12-视图-view)
13. [触发器 Trigger](#13-触发器-trigger)
14. [性能优化](#14-性能优化)
15. [实战：博客系统数据库设计](#15-实战博客系统数据库设计)

---

## 1. 数据库基础概念

### 🏗️ 什么是数据库？

数据库（Database）是按照数据结构来组织、存储和管理数据的仓库。

### 📊 数据库分类

| 类型 | 代表产品 | 特点 |
|------|----------|------|
| 关系型数据库 (RDBMS) | MySQL, PostgreSQL, Oracle | 表结构，SQL 语言，ACID 事务 |
| 非关系型数据库 (NoSQL) | MongoDB, Redis, Elasticsearch | 灵活 schema，高扩展性 |

### 🔑 核心术语

- **数据库 (Database)**: 数据的集合
- **表 (Table)**: 特定类型数据的结构化列表
- **行 (Row)**: 表中的一条记录
- **列 (Column)**: 表中的一个字段
- **主键 (Primary Key)**: 唯一标识一行的列
- **外键 (Foreign Key)**: 关联两个表的列

---

## 2. 数据库设计三大范式

### 📐 第一范式 (1NF)

> 每一列都是不可分割的原子数据项

```sql
-- ❌ 错误示例：地址可以再拆分
CREATE TABLE user (
    address VARCHAR(255)  -- "北京市海淀区中关村大街1号"
);

-- ✅ 正确示例：拆分为最小单元
CREATE TABLE user (
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    detail VARCHAR(100)
);
```

### 📐 第二范式 (2NF)

> 在 1NF 基础上，非主属性完全依赖于主键（消除部分依赖）

```sql
-- ❌ 错误示例：courseName 只依赖 courseId，不依赖完整主键
CREATE TABLE student_course (
    studentId INT,
    courseId INT,
    courseName VARCHAR(50),  -- 部分依赖
    score INT,
    PRIMARY KEY (studentId, courseId)
);

-- ✅ 正确示例：拆分成两个表
CREATE TABLE course (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE student_course (
    studentId INT,
    courseId INT,
    score INT,
    PRIMARY KEY (studentId, courseId)
);
```

### 📐 第三范式 (3NF)

> 在 2NF 基础上，非主属性不传递依赖于主键（消除传递依赖）

```sql
-- ❌ 错误示例：deptName 依赖 deptId，deptId 依赖 id
CREATE TABLE employee (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    deptId INT,
    deptName VARCHAR(50)  -- 传递依赖
);

-- ✅ 正确示例：部门信息单独建表
CREATE TABLE department (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);

CREATE TABLE employee (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    deptId INT
);
```

---

## 3. 数据类型详解

### 🔢 整数类型

| 类型 | 字节 | 范围（有符号） | 用途 |
|------|------|----------------|------|
| TINYINT | 1 | -128 ~ 127 | 状态值、布尔值 |
| SMALLINT | 2 | -32768 ~ 32767 | 小范围数值 |
| MEDIUMINT | 3 | -8388608 ~ 8388607 | 中等范围 |
| INT | 4 | -2147483648 ~ 2147483647 | 常用主键 |
| BIGINT | 8 | 极大范围 | 大数据量 ID |

### 📝 字符串类型

| 类型 | 最大长度 | 特点 |
|------|----------|------|
| CHAR(n) | 255 字节 | 定长，查询快 |
| VARCHAR(n) | 65535 字节 | 变长，节省空间 |
| TEXT | 65535 字节 | 长文本 |
| MEDIUMTEXT | 16MB | 中等文本 |
| LONGTEXT | 4GB | 超长文本 |

```sql
-- 建议：能用 VARCHAR 就不用 TEXT
username VARCHAR(255) NOT NULL  -- 用户名
content LONGTEXT                -- 文章内容（需要全文搜索时）
```

### 📅 日期时间类型

| 类型 | 格式 | 用途 |
|------|------|------|
| DATE | YYYY-MM-DD | 日期 |
| TIME | HH:MM:SS | 时间 |
| DATETIME | YYYY-MM-DD HH:MM:SS | 日期时间 |
| TIMESTAMP | 自动初始化 | 记录创建/更新时间 |
| YEAR | YYYY | 年份 |

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

### 🔢 其他常用类型

```sql
-- DECIMAL 精确小数（适合金额）
price DECIMAL(10, 2)  -- 最多10位，2位小数

-- JSON 类型（MySQL 5.7+）
metadata JSON DEFAULT NULL

-- ENUM 枚举类型
status ENUM('draft', 'published', 'deleted')
```

---

## 4. 表的创建与管理

### ✨ 创建表 CREATE TABLE

```sql
CREATE TABLE `user` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `password` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4_unicode_ci;
```

### 📝 修改表 ALTER TABLE

```sql
-- 添加列
ALTER TABLE `user` ADD COLUMN `avatar` VARCHAR(255) AFTER `email`;

-- 修改列类型
ALTER TABLE `user` MODIFY COLUMN `username` VARCHAR(100) NOT NULL;

-- 删除列
ALTER TABLE `user` DROP COLUMN `avatar`;

-- 重命名表
ALTER TABLE `user` RENAME TO `users`;

-- 添加索引
ALTER TABLE `user` ADD INDEX `idx_email` (`email`);

-- 删除索引
ALTER TABLE `user` DROP INDEX `idx_email`;
```

### 🗑️ 删除表 DROP TABLE

```sql
-- 删除表（危险操作！）
DROP TABLE IF EXISTS `user`;

-- 清空表数据（保留结构）
TRUNCATE TABLE `user`;
```

---

## 5. 约束 Constraints

### 🔒 约束类型总览

| 约束 | 说明 | 关键字 |
|------|------|--------|
| 主键约束 | 唯一且非空 | PRIMARY KEY |
| 唯一约束 | 唯一，允许 NULL | UNIQUE |
| 非空约束 | 不允许 NULL | NOT NULL |
| 默认约束 | 设置默认值 | DEFAULT |
| 外键约束 | 表关联 | FOREIGN KEY |
| 检查约束 | 条件检查 (MySQL 8.0+) | CHECK |
| 自动递增 | 数值自动增加 | AUTO_INCREMENT |

### 🔑 主键约束 PRIMARY KEY

```sql
-- 单列主键
CREATE TABLE `user` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL
);

-- 联合主键（多对多关系表常用）
CREATE TABLE `user_like_post` (
    `userId` INT NOT NULL,
    `postId` INT NOT NULL,
    PRIMARY KEY (`userId`, `postId`)
);
```

### 🔗 外键约束 FOREIGN KEY

```sql
CREATE TABLE `post` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT,
    `userId` INT DEFAULT NULL,
    -- 外键约束
    CONSTRAINT `post_ibfk_1` 
        FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE SET NULL    -- 删除用户时，文章的 userId 设为 NULL
        ON UPDATE CASCADE     -- 更新用户 id 时，同步更新
);

-- 删除时的行为选项
-- CASCADE: 级联删除/更新
-- SET NULL: 设为 NULL
-- RESTRICT: 拒绝操作（默认）
-- NO ACTION: 同 RESTRICT
```

### ✅ 检查约束 CHECK

```sql
CREATE TABLE `product` (
    `id` INT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `price` DECIMAL(10, 2) CHECK (price >= 0),
    `status` ENUM('active', 'inactive') DEFAULT 'active'
);
```

---

## 6. 索引 Index

### 📚 什么是索引？

> 索引就像书的目录，可以快速定位数据，大大提高查询效率

### 🎯 索引类型

| 类型 | 说明 | 关键字 |
|------|------|--------|
| 主键索引 | 唯一且非空 | PRIMARY KEY |
| 唯一索引 | 唯一，允许 NULL | UNIQUE KEY |
| 普通索引 | 最基本的索引 | INDEX / KEY |
| 全文索引 | 全文搜索 | FULLTEXT INDEX |
| 联合索引 | 多列组合索引 | INDEX (col1, col2) |
| 空间索引 | 地理数据 | SPATIAL INDEX |

### 💡 索引创建示例

```sql
-- 1. 主键索引（自动创建）
CREATE TABLE `user` (
    `id` INT PRIMARY KEY AUTO_INCREMENT  -- 主键索引
);

-- 2. 唯一索引
CREATE TABLE `user` (
    `id` INT PRIMARY KEY,
    `username` VARCHAR(255),
    UNIQUE KEY `username` (`username`)   -- 唯一索引
);

-- 3. 普通索引
CREATE TABLE `avatar` (
    `id` INT PRIMARY KEY,
    `userId` INT,
    KEY `userId` (`userId`)              -- 普通索引
);

-- 4. 联合索引
CREATE TABLE `post` (
    `id` INT PRIMARY KEY,
    `categoryId` INT,
    `status` VARCHAR(20),
    INDEX `idx_category_status` (`categoryId`, `status`)  -- 联合索引
);

-- 5. 前缀索引（长字符串优化）
CREATE INDEX `idx_username` ON `user` (`username`(10));  -- 只索引前10个字符
```

### 🎨 索引设计原则

```sql
-- ✅ 适合建立索引的场景
-- 1. 频繁作为查询条件的字段
WHERE userId = 1
WHERE username = 'admin'

-- 2. 外键字段
FOREIGN KEY (`userId`) -- 自动建立索引

-- 3. 排序字段
ORDER BY created_at

-- 4. 分组字段
GROUP BY categoryId

-- ❌ 不适合建立索引的场景
-- 1. 数据量小的表
-- 2. 频繁更新的字段
-- 3. 区分度低的字段（如：性别 status）
```

### ⚡ 最左前缀原则

```sql
-- 联合索引 (a, b, c)
-- 等价于创建了：
-- (a)
-- (a, b)
-- (a, b, c)

-- ✅ 能命中索引
SELECT * FROM t WHERE a = 1;
SELECT * FROM t WHERE a = 1 AND b = 2;
SELECT * FROM t WHERE a = 1 AND b = 2 AND c = 3;

-- ❌ 无法命中索引
SELECT * FROM t WHERE b = 2;
SELECT * FROM t WHERE c = 3;
SELECT * FROM t WHERE b = 2 AND c = 3;
```

### 🔍 EXPLAIN 执行计划

```sql
EXPLAIN SELECT * FROM `user` WHERE username = 'admin';

-- 关键字段说明
-- type: 访问类型（system > const > eq_ref > ref > range > index > ALL）
-- key: 实际使用的索引
-- rows: 预估扫描行数
-- Extra: 额外信息（Using index, Using filesort, Using temporary）
```

---

## 7. CRUD 操作

### ➕ INSERT 插入

```sql
-- 单条插入
INSERT INTO `user` (`username`, `password`) 
VALUES ('admin', 'hashed_password');

-- 批量插入
INSERT INTO `user` (`username`, `password`) VALUES 
('user1', 'pass1'),
('user2', 'pass2'),
('user3', 'pass3');

-- 从查询结果插入
INSERT INTO `user_backup` (`username`, `password`)
SELECT `username`, `password` FROM `user` WHERE `id` > 100;

-- INSERT ... ON DUPLICATE KEY UPDATE（存在则更新）
INSERT INTO `user` (`id`, `username`, `login_count`) 
VALUES (1, 'admin', 1)
ON DUPLICATE KEY UPDATE `login_count` = `login_count` + 1;
```

### 🔍 SELECT 查询

```sql
-- 基础查询
SELECT * FROM `user`;
SELECT `id`, `username` FROM `user`;

-- 条件查询
SELECT * FROM `user` WHERE `id` = 1;
SELECT * FROM `user` WHERE `username` LIKE '%admin%';
SELECT * FROM `user` WHERE `id` IN (1, 2, 3);
SELECT * FROM `user` WHERE `created_at` BETWEEN '2024-01-01' AND '2024-12-31';
SELECT * FROM `user` WHERE `email` IS NOT NULL;

-- 排序
SELECT * FROM `user` ORDER BY `created_at` DESC;
SELECT * FROM `user` ORDER BY `id` ASC, `username` DESC;

-- 分页
SELECT * FROM `user` LIMIT 10;           -- 前10条
SELECT * FROM `user` LIMIT 10 OFFSET 20; -- 跳过20条，取10条
SELECT * FROM `user` LIMIT 20, 10;       -- 同上（简写）

-- 去重
SELECT DISTINCT `categoryId` FROM `post`;

-- 别名
SELECT 
    `id` AS 文章ID,
    `title` AS 标题,
    `created_at` AS 创建时间
FROM `post`;
```

### 📊 聚合函数

```sql
-- 常用聚合函数
SELECT COUNT(*) FROM `user`;                    -- 总数
SELECT COUNT(DISTINCT `categoryId`) FROM `post`; -- 去重计数
SELECT SUM(`price`) FROM `product`;             -- 求和
SELECT AVG(`score`) FROM `review`;              -- 平均值
SELECT MAX(`price`) FROM `product`;             -- 最大值
SELECT MIN(`price`) FROM `product`;             -- 最小值

-- GROUP BY 分组
SELECT 
    `categoryId`,
    COUNT(*) AS 文章数,
    AVG(`view_count`) AS 平均浏览量
FROM `post`
GROUP BY `categoryId`;

-- HAVING 过滤分组
SELECT 
    `categoryId`,
    COUNT(*) AS 文章数
FROM `post`
GROUP BY `categoryId`
HAVING 文章数 > 5;

-- WHERE vs HAVING
-- WHERE: 分组前过滤，不能用聚合函数
-- HAVING: 分组后过滤，可以用聚合函数
```

### ✏️ UPDATE 更新

```sql
-- 更新单条
UPDATE `user` SET `username` = 'newname' WHERE `id` = 1;

-- 更新多条
UPDATE `post` SET `status` = 'archived' WHERE `created_at` < '2023-01-01';

-- 使用表达式
UPDATE `product` SET `price` = `price` * 0.9 WHERE `stock` > 100;

-- 多表更新
UPDATE `post` p
JOIN `user` u ON p.`userId` = u.`id`
SET p.`author_name` = u.`username`;
```

### 🗑️ DELETE 删除

```sql
-- 删除指定数据
DELETE FROM `user` WHERE `id` = 1;

-- 删除所有数据（保留结构）
DELETE FROM `user`;
TRUNCATE TABLE `user`;  -- 更快，重置 AUTO_INCREMENT

-- 多表删除
DELETE p FROM `post` p
JOIN `user` u ON p.`userId` = u.`id`
WHERE u.`status` = 'banned';
```

---

## 8. 多表查询 JOIN

### 🔗 JOIN 类型图解

```
表A          表B
+---+       +---+
| 1 |       | 1 |     INNER JOIN: 交集
| 2 |       | 2 |     LEFT JOIN:  A 全部 + B 匹配部分
| 3 |       | 4 |     RIGHT JOIN: B 全部 + A 匹配部分
+---+       +---+     FULL JOIN:  并集（MySQL 不支持）
```

### 📊 JOIN 示例

```sql
-- INNER JOIN（内连接）：只返回匹配的行
SELECT 
    p.`title`,
    u.`username`
FROM `post` p
INNER JOIN `user` u ON p.`userId` = u.`id`;

-- LEFT JOIN（左连接）：返回左表全部 + 右表匹配
SELECT 
    p.`title`,
    u.`username`
FROM `post` p
LEFT JOIN `user` u ON p.`userId` = u.`id`;

-- RIGHT JOIN（右连接）：返回右表全部 + 左表匹配
SELECT 
    p.`title`,
    u.`username`
FROM `post` p
RIGHT JOIN `user` u ON p.`userId` = u.`id`;

-- 多表连接
SELECT 
    p.`title`,
    u.`username`,
    t.`name` AS tag_name
FROM `post` p
JOIN `user` u ON p.`userId` = u.`id`
JOIN `post_tag` pt ON p.`id` = pt.`postId`
JOIN `tag` t ON pt.`tagId` = t.`id`;

-- 自连接（查询评论层级）
SELECT 
    c.`content` AS 评论,
    p.`content` AS 父评论
FROM `comment` c
LEFT JOIN `comment` p ON c.`parentId` = p.`id`;
```

### 🎯 连接查询优化

```sql
-- ✅ 小表驱动大表
-- 小的结果集驱动大的结果集

-- ✅ 被驱动表建立索引
SELECT * FROM `post` p
JOIN `user` u ON p.`userId` = u.`id`;  -- user.id 有主键索引

-- ❌ 避免笛卡尔积（缺少连接条件）
SELECT * FROM `post`, `user`;  -- m × n 行
```

---

## 9. 子查询

### 📦 子查询类型

```sql
-- 1. WHERE 子查询
SELECT * FROM `post` 
WHERE `userId` IN (
    SELECT `id` FROM `user` WHERE `status` = 'active'
);

-- 2. FROM 子查询（派生表）
SELECT avg_score.categoryId, avg_score.avg_score
FROM (
    SELECT `categoryId`, AVG(`score`) AS avg_score
    FROM `post`
    GROUP BY `categoryId`
) AS avg_score
WHERE avg_score.avg_score > 80;

-- 3. SELECT 子查询（标量子查询）
SELECT 
    `title`,
    (SELECT `username` FROM `user` WHERE `id` = p.`userId`) AS author
FROM `post` p;

-- 4. EXISTS 子查询
SELECT * FROM `user` u
WHERE EXISTS (
    SELECT 1 FROM `post` p WHERE p.`userId` = u.`id`
);

-- 5. ANY / ALL 子查询
SELECT * FROM `product`
WHERE `price` > ANY (SELECT `price` FROM `product` WHERE `categoryId` = 1);

SELECT * FROM `product`
WHERE `price` > ALL (SELECT `price` FROM `product` WHERE `categoryId` = 1);
```

### 🔄 子查询 vs JOIN

```sql
-- 子查询写法
SELECT * FROM `post`
WHERE `userId` IN (SELECT `id` FROM `user` WHERE `status` = 'active');

-- JOIN 写法（通常更高效）
SELECT p.* FROM `post` p
JOIN `user` u ON p.`userId` = u.`id`
WHERE u.`status` = 'active';
```

---

## 10. 事务 Transaction

### 🔒 什么是事务？

> 事务是一组操作，要么全部成功，要么全部失败

### 💡 ACID 特性

| 特性 | 说明 |
|------|------|
| **A**tomicity 原子性 | 事务是不可分割的工作单位 |
| **C**onsistency 一致性 | 事务前后数据完整性不被破坏 |
| **I**solation 隔离性 | 多个并发事务之间互不干扰 |
| **D**urability 持久性 | 一旦提交，对数据的改变是永久的 |

### 📝 事务操作

```sql
-- 开启事务
START TRANSACTION;
-- 或
BEGIN;

-- 执行操作
INSERT INTO `account` (`user_id`, `balance`) VALUES (1, 1000);
UPDATE `account` SET `balance` = `balance` - 100 WHERE `user_id` = 1;
UPDATE `account` SET `balance` = `balance` + 100 WHERE `user_id` = 2;

-- 提交事务
COMMIT;

-- 回滚事务
ROLLBACK;

-- 保存点
SAVEPOINT sp1;
ROLLBACK TO sp1;
```

### 🔐 隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|----------|------|------------|------|
| READ UNCOMMITTED | ✅ | ✅ | ✅ |
| READ COMMITTED | ❌ | ✅ | ✅ |
| REPEATABLE READ (默认) | ❌ | ❌ | ✅ |
| SERIALIZABLE | ❌ | ❌ | ❌ |

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

---

## 11. 存储过程与函数

### 📦 存储过程 Stored Procedure

```sql
-- 创建存储过程
DELIMITER //

CREATE PROCEDURE `GetUserPosts`(IN userId INT)
BEGIN
    SELECT * FROM `post` WHERE `userId` = userId;
END //

DELIMITER ;

-- 调用存储过程
CALL GetUserPosts(1);

-- 带输出参数
DELIMITER //

CREATE PROCEDURE `GetPostCount`(IN userId INT, OUT postCount INT)
BEGIN
    SELECT COUNT(*) INTO postCount FROM `post` WHERE `userId` = userId;
END //

DELIMITER ;

-- 调用
CALL GetPostCount(1, @count);
SELECT @count;
```

### 🔢 函数 Function

```sql
-- 创建函数
DELIMITER //

CREATE FUNCTION `GetUserPostCount`(userId INT) 
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE postCount INT;
    SELECT COUNT(*) INTO postCount FROM `post` WHERE `userId` = userId;
    RETURN postCount;
END //

DELIMITER ;

-- 使用函数
SELECT `username`, GetUserPostCount(`id`) AS post_count FROM `user`;
```

### 🔄 游标 Cursor

```sql
DELIMITER //

CREATE PROCEDURE `ProcessUsers`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE userId INT;
    DECLARE userCursor CURSOR FOR SELECT `id` FROM `user`;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN userCursor;
    
    read_loop: LOOP
        FETCH userCursor INTO userId;
        IF done THEN
            LEAVE read_loop;
        END IF;
        -- 处理逻辑
        INSERT INTO `user_stats` (`user_id`, `post_count`)
        VALUES (userId, (SELECT COUNT(*) FROM `post` WHERE `userId` = userId));
    END LOOP;
    
    CLOSE userCursor;
END //

DELIMITER ;
```

---

## 12. 视图 View

### 👁️ 什么是视图？

> 视图是虚拟表，基于 SQL 查询结果集

### 📝 视图操作

```sql
-- 创建视图
CREATE VIEW `user_post_view` AS
SELECT 
    u.`id` AS user_id,
    u.`username`,
    p.`id` AS post_id,
    p.`title`,
    p.`created_at`
FROM `user` u
LEFT JOIN `post` p ON u.`id` = p.`userId`;

-- 使用视图
SELECT * FROM `user_post_view` WHERE `user_id` = 1;

-- 修改视图
CREATE OR REPLACE VIEW `user_post_view` AS
SELECT ...;

-- 删除视图
DROP VIEW IF EXISTS `user_post_view`;

-- 查看视图
SHOW CREATE VIEW `user_post_view`;
```

### 💡 视图优点

- ✅ 简化复杂查询
- ✅ 提供安全访问控制
- ✅ 数据独立性
- ✅ 同一份数据，多种展示方式

---

## 13. 触发器 Trigger

### ⚡ 什么是触发器？

> 触发器是在 INSERT/UPDATE/DELETE 操作前后自动执行的程序

### 📝 触发器示例

```sql
-- INSERT 触发器：自动记录日志
DELIMITER //

CREATE TRIGGER `after_user_insert`
AFTER INSERT ON `user`
FOR EACH ROW
BEGIN
    INSERT INTO `user_log` (`user_id`, `action`, `created_at`)
    VALUES (NEW.`id`, 'INSERT', NOW());
END //

DELIMITER ;

-- UPDATE 触发器：记录变更历史
DELIMITER //

CREATE TRIGGER `after_user_update`
AFTER UPDATE ON `user`
FOR EACH ROW
BEGIN
    INSERT INTO `user_log` (`user_id`, `action`, `old_value`, `new_value`, `created_at`)
    VALUES (NEW.`id`, 'UPDATE', OLD.`username`, NEW.`username`, NOW());
END //

DELIMITER ;

-- DELETE 触发器：级联清理
DELIMITER //

CREATE TRIGGER `before_user_delete`
BEFORE DELETE ON `user`
FOR EACH ROW
BEGIN
    DELETE FROM `post` WHERE `userId` = OLD.`id`;
    DELETE FROM `comment` WHERE `userId` = OLD.`id`;
END //

DELIMITER ;

-- 删除触发器
DROP TRIGGER IF EXISTS `after_user_insert`;

-- 查看触发器
SHOW TRIGGERS;
```

---

## 14. 性能优化

### 🚀 查询优化技巧

#### 1. 避免 SELECT *

```sql
-- ❌ 不推荐
SELECT * FROM `user`;

-- ✅ 推荐
SELECT `id`, `username`, `email` FROM `user`;
```

#### 2. 避免索引失效

```sql
-- ❌ 索引失效情况
SELECT * FROM `user` WHERE YEAR(`created_at`) = 2024;  -- 函数操作
SELECT * FROM `user` WHERE `username` LIKE '%admin';    -- 左模糊
SELECT * FROM `user` WHERE `age` != 18;                 -- 不等于
SELECT * FROM `user` WHERE `age` + 1 = 18;              -- 表达式

-- ✅ 优化写法
SELECT * FROM `user` 
WHERE `created_at` >= '2024-01-01' AND `created_at` < '2025-01-01';

SELECT * FROM `user` WHERE `username` LIKE 'admin%';   -- 右模糊可用索引
```

#### 3. 小表驱动大表

```sql
-- ❌ 大表驱动小表
SELECT * FROM `post` p
WHERE p.`userId` IN (SELECT `id` FROM `user` WHERE `status` = 'active');

-- ✅ 小表驱动大表（EXISTS 适合外表小的情况）
SELECT * FROM `user` u
WHERE EXISTS (SELECT 1 FROM `post` p WHERE p.`userId` = u.`id`);
```

#### 4. 批量操作

```sql
-- ❌ 逐条插入
INSERT INTO `user` (`username`) VALUES ('user1');
INSERT INTO `user` (`username`) VALUES ('user2');
INSERT INTO `user` (`username`) VALUES ('user3');

-- ✅ 批量插入
INSERT INTO `user` (`username`) VALUES ('user1'), ('user2'), ('user3');
```

#### 5. LIMIT 优化

```sql
-- ❌ 深分页性能差
SELECT * FROM `post` ORDER BY `id` LIMIT 1000000, 10;

-- ✅ 使用覆盖索引 + 子查询
SELECT * FROM `post` 
WHERE `id` >= (SELECT `id` FROM `post` ORDER BY `id` LIMIT 1000000, 1)
ORDER BY `id` 
LIMIT 10;
```

### 📊 慢查询分析

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 2;  -- 超过2秒记录

-- 查看慢查询状态
SHOW VARIABLES LIKE 'slow_query%';

-- 分析慢查询日志
-- 使用 mysqldumpslow 工具
```

### 🧰 EXPLAIN 分析

```sql
EXPLAIN SELECT * FROM `user` WHERE `username` = 'admin';

-- type 字段说明（性能从好到差）
-- system: 表只有一行
-- const: 主键或唯一索引等值查询
-- eq_ref: 主键或唯一索引关联查询
-- ref: 普通索引等值查询
-- range: 索引范围查询
-- index: 全索引扫描
-- ALL: 全表扫描（需要优化！）
```

---

## 15. 实战：博客系统数据库设计

### 📋 需求分析

一个博客系统需要以下功能：
- 用户注册登录
- 发布文章
- 文章标签
- 点赞收藏
- 评论系统
- 文件上传

### 🗄️ 完整建表语句

```sql
-- ============================================
-- 用户表
-- ============================================
CREATE TABLE `user` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `password` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `status` ENUM('active', 'banned', 'deleted') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    UNIQUE KEY `username` (`username`),
    INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;

-- ============================================
-- 头像表
-- ============================================
CREATE TABLE `avatar` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `mimetype` VARCHAR(255) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `size` INT(11) NOT NULL,
    `userId` INT(11) NOT NULL,
    PRIMARY KEY (`id`),
    INDEX `idx_userId` (`userId`),
    CONSTRAINT `avatar_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;

-- ============================================
-- 文章表
-- ============================================
CREATE TABLE `post` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `content` LONGTEXT,
    `userId` INT(11) DEFAULT NULL,
    `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    `view_count` INT DEFAULT 0,
    `like_count` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_userId` (`userId`),
    INDEX `idx_status_created` (`status`, `created_at`),
    CONSTRAINT `post_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;

-- ============================================
-- 标签表
-- ============================================
CREATE TABLE `tag` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;

-- ============================================
-- 文章标签关联表（多对多）
-- ============================================
CREATE TABLE `post_tag` (
    `postId` INT(11) NOT NULL,
    `tagId` INT(11) NOT NULL,
    PRIMARY KEY (`postId`, `tagId`),
    INDEX `idx_tagId` (`tagId`),
    CONSTRAINT `post_tag_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `post` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `post_tag_ibfk_2` FOREIGN KEY (`tagId`) REFERENCES `tag` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;

-- ============================================
-- 点赞表（多对多）
-- ============================================
CREATE TABLE `user_like_post` (
    `userId` INT(11) NOT NULL,
    `postId` INT(11) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`userId`, `postId`),
    INDEX `idx_postId` (`postId`),
    CONSTRAINT `user_like_post_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `user_like_post_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `post` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;

-- ============================================
-- 收藏表（多对多）
-- ============================================
CREATE TABLE `user_favorite_post` (
    `userId` INT(11) NOT NULL,
    `postId` INT(11) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`userId`, `postId`),
    INDEX `idx_postId` (`postId`),
    CONSTRAINT `user_favorite_post_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `user_favorite_post_ibfk_2` FOREIGN KEY (`postId`) REFERENCES `post` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;

-- ============================================
-- 评论表（自关联，支持嵌套评论）
-- ============================================
CREATE TABLE `comment` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `content` LONGTEXT NOT NULL,
    `postId` INT(11) NOT NULL,
    `userId` INT(11) NOT NULL,
    `parentId` INT(11) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_postId` (`postId`),
    INDEX `idx_userId` (`userId`),
    INDEX `idx_parentId` (`parentId`),
    CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`parentId`) REFERENCES `comment` (`id`)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `comment_ibfk_3` FOREIGN KEY (`postId`) REFERENCES `post` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;

-- ============================================
-- 文件表
-- ============================================
CREATE TABLE `file` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `mimetype` VARCHAR(255) NOT NULL,
    `filename` VARCHAR(255) NOT NULL,
    `size` INT(11) NOT NULL,
    `postId` INT(11) NOT NULL,
    `userId` INT(11) NOT NULL,
    `width` SMALLINT DEFAULT NULL,
    `height` SMALLINT DEFAULT NULL,
    `metadata` JSON DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    INDEX `idx_postId` (`postId`),
    INDEX `idx_userId` (`userId`),
    CONSTRAINT `file_ibfk_1` FOREIGN KEY (`postId`) REFERENCES `post` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `file_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `user` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4_unicode_ci;
```

### 📊 常用查询示例

```sql
-- 1. 查询用户及其文章数
SELECT 
    u.`id`,
    u.`username`,
    COUNT(p.`id`) AS post_count
FROM `user` u
LEFT JOIN `post` p ON u.`id` = p.`userId`
GROUP BY u.`id`;

-- 2. 查询文章详情（含作者、标签）
SELECT 
    p.`id`,
    p.`title`,
    p.`content`,
    u.`username` AS author,
    GROUP_CONCAT(t.`name`) AS tags,
    p.`like_count`,
    p.`view_count`
FROM `post` p
JOIN `user` u ON p.`userId` = u.`id`
LEFT JOIN `post_tag` pt ON p.`id` = pt.`postId`
LEFT JOIN `tag` t ON pt.`tagId` = t.`id`
WHERE p.`id` = 1
GROUP BY p.`id`;

-- 3. 热门文章排行
SELECT 
    p.`id`,
    p.`title`,
    p.`like_count`,
    p.`view_count`,
    u.`username` AS author
FROM `post` p
JOIN `user` u ON p.`userId` = u.`id`
WHERE p.`status` = 'published'
ORDER BY p.`like_count` DESC, p.`view_count` DESC
LIMIT 10;

-- 4. 查询文章的评论树
SELECT 
    c1.`id`,
    c1.`content`,
    u.`username` AS commenter,
    c2.`content` AS reply_to
FROM `comment` c1
JOIN `user` u ON c1.`userId` = u.`id`
LEFT JOIN `comment` c2 ON c1.`parentId` = c2.`id`
WHERE c1.`postId` = 1
ORDER BY c1.`created_at`;

-- 5. 统计每月发文量
SELECT 
    DATE_FORMAT(`created_at`, '%Y-%m') AS month,
    COUNT(*) AS post_count
FROM `post`
WHERE `status` = 'published'
GROUP BY month
ORDER BY month DESC;
```

---

## 📚 附录：SQL 速查表

### 🔤 SQL 语句分类

| 类型 | 关键字 | 说明 |
|------|--------|------|
| DDL | CREATE, ALTER, DROP, TRUNCATE | 数据定义 |
| DML | INSERT, UPDATE, DELETE, SELECT | 数据操作 |
| DCL | GRANT, REVOKE | 权限控制 |
| TCL | COMMIT, ROLLBACK, SAVEPOINT | 事务控制 |

### ⚡ 常用函数

```sql
-- 字符串函数
CONCAT(str1, str2)           -- 连接字符串
SUBSTRING(str, pos, len)     -- 截取字符串
LENGTH(str)                  -- 字符串长度
UPPER(str) / LOWER(str)      -- 大小写转换
TRIM(str)                    -- 去除空格
REPLACE(str, from, to)       -- 替换

-- 数学函数
ABS(x)                       -- 绝对值
ROUND(x, d)                  -- 四舍五入
CEIL(x) / FLOOR(x)          -- 向上/向下取整
MOD(x, y)                    -- 取模

-- 日期函数
NOW()                        -- 当前日期时间
CURDATE()                    -- 当前日期
CURTIME()                    -- 当前时间
DATE_FORMAT(date, format)    -- 格式化日期
DATEDIFF(date1, date2)       -- 日期差
DATE_ADD(date, INTERVAL n unit) -- 日期加减

-- 条件函数
IF(expr, true_val, false_val)
IFNULL(expr, null_val)
COALESCE(val1, val2, ...)
CASE WHEN condition THEN result ... END
```

---

## 🎯 总结

| 主题 | 核心要点 |
|------|----------|
| 数据库设计 | 三大范式，合理拆分表 |
| 数据类型 | 选择合适类型，节省空间 |
| 约束 | PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL |
| 索引 | 加速查询，遵循最左前缀原则 |
| 查询 | JOIN 多表查询，子查询，聚合函数 |
| 事务 | ACID 特性，隔离级别 |
| 优化 | EXPLAIN 分析，避免索引失效 |

---

> 📖 **学习建议**
> 1. 多动手写 SQL，实践出真知
> 2. 理解原理比记忆语法更重要
> 3. 学会使用 EXPLAIN 分析查询性能
> 4. 设计表结构时考虑扩展性和性能
> 5. 生产环境谨慎操作，备份先行！

---

*最后更新：2026年9月5日*
