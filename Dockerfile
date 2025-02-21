# 第一阶段：构建前端
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
# 复制前端项目文件
COPY frontend/package*.json ./
# 安装依赖
RUN npm install
# 复制源代码
COPY frontend/ ./
# 构建前端项目
RUN npm run build

# 第二阶段：构建后端
FROM golang:1.21-alpine as backend-builder
WORKDIR /app
# 复制 go.mod 和 go.sum
COPY go.mod go.sum ./
# 下载依赖
RUN go mod download
# 复制源代码
COPY . .
# 复制前端构建产物
COPY --from=frontend-builder /app/frontend/dist ./dist
# 构建后端
RUN CGO_ENABLED=0 GOOS=linux go build -o gogo-scheduler ./cmd/main.go

# 第三阶段：最终运行镜像
FROM alpine:latest
WORKDIR /app
# 安装 ca-certificates，用于 HTTPS 请求
RUN apk --no-cache add ca-certificates

# 从构建阶段复制必要文件
COPY --from=backend-builder /app/gogo-scheduler .
COPY --from=backend-builder /app/dist ./dist

# 设置环境变量
ENV GIN_MODE=release

# 暴露端口
EXPOSE 8080

# 启动应用
CMD ["./gogo-scheduler"] 