# Chem3D Learn Backend

最小只读后端，用于在前端稳定后承接 Chem3D Learn 的结构化学教学数据。当前产品仍以前端实现为准，后端只作为后续配套层，不是主产品入口。

## Scope

当前或计划中的后端只做：

- 健康检查
- 结构 / 模块摘要列表
- 单个结构 / 模块详情
- 与当前前端数据结构保持一致的数据映射

当前后端不做：

- 登录 / 用户系统
- 数据库或持久化用户状态
- 教师后台
- 大型题库
- 付费
- SMILES 动态解析
- RDKit runtime API
- Gemini API
- AI chat

## Frontend Relationship

- 前端页面和手写数据是当前产品基准。
- 后端接口应跟随前端页面和数据需求设计。
- 不要为了后端方便而改变前端教学数据语义。
- 如果后续需要数据库、权限、用户进度或题库，需要先单独规划。

## Commands

```bash
npm start
npm run dev
npm test
```

默认端口为 `4000`，可通过 `PORT` 环境变量覆盖。跨域来源默认 `*`，可通过 `CORS_ORIGIN` 环境变量覆盖 API 响应的 `Access-Control-Allow-Origin`。

## Error Handling

- 畸形请求地址（如 `/%`、`/%zz` 会让 `decodeURIComponent` 抛错，`//`、`///` 会让 `new URL` 抛错）统一返回 `400 MALFORMED_REQUEST_URL`，不会终止进程。
- 非 `GET`/`OPTIONS` 方法返回 `405 METHOD_NOT_ALLOWED`。
- 监听失败（如端口被占用）会打印明确信息并以非零退出码结束，而不是抛未捕获异常。

## API

### `GET /health`

返回服务状态。

### `GET /api/molecules`

返回结构摘要列表。

### `GET /api/molecules/:id`

返回单个结构详情。核心结构 ID 包括：

- `ch4`
- `nh3`
- `h2o`
- `co2`
- `bf3`
- `nacl`

### `GET /api/structures`

`/api/molecules` 的别名。

### `GET /api/structures/:id`

`/api/molecules/:id` 的别名。
