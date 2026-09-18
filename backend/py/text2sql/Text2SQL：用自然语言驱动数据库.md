# Text2SQL：用自然语言驱动数据库，让每个人都能查数据

> 🗣️ 不会写 SQL？没关系。告诉大模型你想查什么，它帮你写。

---

## 📖 什么是 Text2SQL？

**Text2SQL**，顾名思义，就是把**自然语言文本**转换成 **SQL 查询语句**。

你只需要用人话描述你的需求：

```
"工程部门员工的姓名和工资是多少？"
```

大模型会自动帮你生成对应的 SQL：

```sql
SELECT name, salary FROM employees WHERE department = '工程';
```

💡 **核心价值**：数据库查询的门槛被大幅降低——不再需要记忆 SQL 语法，也不需要理解表结构。这对产品经理、运营、财务等非技术角色来说，是一次真正的**数据平权**。

---

## 🧱 第一步：准备数据库

我们使用 **SQLite** 作为演示数据库。它是 Python 内置的文件型数据库，**无需安装、无需配置、开箱即用**。

### 🔌 连接数据库 & 创建表

```python
import sqlite3

conn = sqlite3.connect("test.db")
cursor = conn.cursor()

# 创建员工表
cursor.execute("""
CREATE TABLE IF NOT EXISTS employees(
    id INTEGER PRIMARY KEY,
    name TEXT,
    department TEXT,
    salary INTEGER
)
""")
```

### 📥 批量插入示例数据

`executemany` 可以一次性插入多条记录，配合 `?` 占位符防止 SQL 注入：

```python
sample_data = [
    (6, "黄佳",   "销售", 50000),
    (7, "宁宁",   "工程", 75000),
    (8, "芊芊",   "销售", 60000),
    (9, "悦悦",   "工程", 80000),
    (10, "黄仁勋", "市场", 55000)
]

cursor.executemany("INSERT INTO employees VALUES(?,?,?,?)", sample_data)
conn.commit()
```

插入完成后，表中的数据如下：

| id | name   | department | salary |
|----|--------|------------|--------|
| 6  | 黄佳   | 销售       | 50000  |
| 7  | 宁宁   | 工程       | 75000  |
| 8  | 芊芊   | 销售       | 60000  |
| 9  | 悦悦   | 工程       | 80000  |
| 10 | 黄仁勋 | 市场       | 55000  |

---

## 🔍 第二步：获取数据库 Schema

要让大模型写出正确的 SQL，**必须先告诉它表的结构**（Schema）。

Schema 包含表名、字段名、字段类型等元信息。我们可以用 SQLite 的 `PRAGMA` 命令来获取：

```python
schema = cursor.execute("PRAGMA table_info(employees)").fetchall()
# 结果：[(0, 'id', 'INTEGER', ...), (1, 'name', 'TEXT', ...), ...]

# 拼接成可读的建表语句
schema_str = "CREATE TABLE employees (\n"
schema_str += "\n".join([f"{col[1]} {col[2]}" for col in schema])
schema_str += "\n)"
```

输出结果：

```sql
CREATE TABLE employees (
    id INTEGER
    name TEXT
    department TEXT
    salary INTEGER
)
```

> ⚠️ **为什么 Schema 如此重要？**
>
> 大模型并不知道你的数据库长什么样。Schema 就是给它的「地图」——字段名越清晰、类型越准确，生成的 SQL 就越精准。

---

## 🤖 第三步：接入大模型（DeepSeek）

我们使用 **DeepSeek** 作为 Text2SQL 的推理引擎。通过 OpenAI 兼容的 SDK 即可调用：

### 🔑 初始化客户端

```python
from openai import OpenAI

client = OpenAI(
    api_key="sk-你的密钥",
    base_url="https://api.deepseek.com/v1"
)
```

### 📝 构造 Prompt 模板

这是 Text2SQL 的**核心环节**——通过精心设计的 Prompt，引导大模型输出干净的 SQL：

```python
def ask_deepseek(query, schema):
    prompt = f"""
    这是一个数据库的 Schema：
    {schema}

    根据这个 Schema，请输出一个 SQL 查询来回答以下问题。
    只输出 SQL 查询语句本身，不要使用任何 markdown 格式，
    不要包含反引号、代码块标记或额外说明。

    问题：{query}
    """

    response = client.chat.completions.create(
        model="deepseek-v4-flash",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
```

🧠 **Prompt 设计要点**：

- ✅ 明确提供 Schema，让模型「看懂」表结构
- ✅ 要求「只输出 SQL」，避免多余解释
- ✅ 指定不要 markdown 格式，方便后续直接执行

---

## 🚀 第四步：用自然语言查询数据库

现在，一切就绪。让我们用**人话**来操作数据库！

### 📊 查询：部门员工信息

```python
question = "工程部门员工的姓名和工资是多少"
sql_query = ask_deepseek(question, schema_str)
print(sql_query)
```

**大模型输出：**

```sql
SELECT name, salary FROM employees WHERE department = 'Engineering';
```

**执行并获取结果：**

```python
result = cursor.execute(sql_query).fetchall()
for row in result:
    print(row)
# ('宁宁', 75000)
# ('悦悦', 80000)
```

---

### ➕ 插入：新增员工

```python
question = "在销售部门增加一个新员工，姓名为张三，工资为45000"
sql_query = ask_deepseek(question, schema_str)
cursor.execute(sql_query)
conn.commit()
```

大模型自动生成了 `INSERT INTO` 语句并执行 ✅

---

### ✏️ 更新：调整工资

```python
question = "将王二的工资调整为55000"
sql_query = ask_deepseek(question, schema_str)
print(sql_query)
# 输出：UPDATE EMPLOYEES SET salary = 55000 WHERE name = '王二';

cursor.execute(sql_query)
conn.commit()
```

---

### 🗑️ 删除：移除员工

```python
question = "删除市场部门的王二"
sql_query = ask_deepseek(question, schema_str)
print(sql_query)
# 输出：DELETE FROM EMPLOYEES WHERE name = '王二' AND department = '市场部';

cursor.execute(sql_query)
conn.commit()
```

---

### 📋 全量查询

```python
question = "查询所有员工的信息"
sql_query = ask_deepseek(question, schema_str)
# 输出：SELECT * FROM EMPLOYEES;

result = cursor.execute(sql_query).fetchall()
for row in result:
    print(row)
```

```
(6,  '黄佳',   '销售', 50000)
(7,  '宁宁',   '工程', 75000)
(8,  '芊芊',   '销售', 60000)
(9,  '悦悦',   '工程', 80000)
(10, '黄仁勋', '市场', 55000)
(11, '张三',   '销售', 45000)
```

---

## 🔗 第五步：多表关联查询

真实场景中，数据往往分布在多张表里。让我们再建一张**部门表**：

```python
cursor.execute("""
CREATE TABLE IF NOT EXISTS departments(
    id INTEGER PRIMARY KEY,
    name TEXT,
    manager TEXT
)
""")

sample_departments = [
    (1, "销售", "王经理"),
    (2, "工程", "李经理"),
    (3, "市场", "张经理")
]
cursor.executemany("INSERT INTO departments VALUES(?,?,?)", sample_departments)
conn.commit()
```

### 📐 更新 Schema（覆盖全部表）

多表查询时，需要把**所有相关表的 Schema** 都传给大模型：

```python
tables = ["employees", "departments"]
schema_str = ""

for table in tables:
    schema = cursor.execute(f"PRAGMA table_info({table})").fetchall()
    schema_str += f"CREATE TABLE {table} (\n"
    schema_str += "\n".join([f"  {col[1]} {col[2]}" for col in schema])
    schema_str += "\n);\n\n"
```

完整 Schema 输出：

```sql
CREATE TABLE employees (
  id INTEGER
  name TEXT
  department TEXT
  salary INTEGER
);

CREATE TABLE departments (
  id INTEGER
  name TEXT
  manager TEXT
);
```

### 📊 跨表聚合查询

```python
question = "根据两个表之间的关系，列出每个部门的员工人数和平均工资"
sql_query = ask_deepseek(question, schema_str)
print(sql_query)
```

**大模型输出：**

```sql
SELECT d.name AS department,
       COUNT(e.id) AS employee_count,
       AVG(e.salary) AS average_salary
FROM departments d
LEFT JOIN employees e ON e.department = d.name
GROUP BY d.id, d.name;
```

🎯 模型自动识别了两张表之间的关联关系，使用了 `LEFT JOIN`、`GROUP BY`、`COUNT`、`AVG`——这正是 SQL 的核心能力。

---

## 🧭 整体流程回顾

```
┌─────────────────────────────────────────────────────┐
│                   Text2SQL 完整流程                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ① 准备数据库         SQLite 建表 + 插入数据         │
│          ↓                                          │
│  ② 提取 Schema        PRAGMA 获取表结构             │
│          ↓                                          │
│  ③ 构造 Prompt        Schema + 自然语言问题          │
│          ↓                                          │
│  ④ 调用大模型         DeepSeek 生成 SQL             │
│          ↓                                          │
│  ⑤ 执行 & 返回        cursor.execute → 结果         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 💡 实践中的注意事项

| ⚠️ 问题 | 📌 建议 |
|---------|---------|
| 模型输出格式不统一 | 在 Prompt 中明确要求「只输出纯 SQL」 |
| Schema 不完整导致幻觉 | 传入所有相关表的结构，包含字段类型 |
| SQL 注入风险 | 生产环境务必对生成的 SQL 做**安全校验** |
| 复杂查询准确率下降 | 分步引导，或拆成多次简单查询 |
| 大模型不了解业务含义 | 在 Prompt 中补充字段的业务说明 |

---

## 🎯 总结

**Text2SQL 的本质是：用大模型作为「翻译官」，在人和数据库之间架起一座桥梁。**

- 🗣️ **对非技术人员**：不需要学 SQL，用自然语言就能查数据
- 👨‍💻 **对开发者**：快速搭建数据查询接口，极大提升开发效率
- 🏢 **对企业**：数据民主化，让更多人能自主获取数据洞察

随着大模型能力的持续提升，Text2SQL 的准确率和适用场景会越来越广。今天是简单的 CRUD，明天可能就是复杂的数据分析报表——**人人都是数据分析师**的时代，正在到来。

---

> 📚 **本文代码基于**：Python + SQLite + DeepSeek API，完整 Notebook 见 `text2sql.ipynb`
