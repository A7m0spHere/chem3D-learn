import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

type ViewerErrorBoundaryProps = {
  children: ReactNode;
  /** id 变化时自动重置错误态，让学生切换到别的模块能正常渲染 */
  resetKey?: string;
};

type ViewerErrorBoundaryState = {
  hasError: boolean;
};

export class ViewerErrorBoundary extends Component<
  ViewerErrorBoundaryProps,
  ViewerErrorBoundaryState
> {
  state: ViewerErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ViewerErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: ViewerErrorBoundaryProps) {
    // 切换模块（resetKey 变化）时清掉当前边界的错误态，让目标模块重新渲染。
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 课堂环境保留控制台线索，便于事后排查；不上报外部服务。
    console.error("[ViewerErrorBoundary] 3D 渲染失败:", error, info.componentStack);
  }

  private handleRetry = () => {
    // React.lazy 会缓存已拒绝的加载 Promise；只清除边界 state 会立刻再次抛错。
    // 刷新页面会创建新的模块加载上下文，才能真实重试被中断的分包请求。
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-surface px-6 text-center"
        role="alert"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-white text-primary shadow-panel">
          <TriangleAlert aria-hidden="true" className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-semibold text-text-primary">3D 模型暂时无法显示</p>
          <p className="max-w-sm text-sm leading-relaxed text-text-secondary">
            可能是模型资源加载被中断，或浏览器暂时无法建立 3D 渲染环境。
            可以重新加载当前页面；若仍然失败，请尝试更换较新的浏览器。
          </p>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-text-primary shadow-sm transition-colors hover:border-primary hover:text-primary"
          onClick={this.handleRetry}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          重新加载页面
        </button>
      </div>
    );
  }
}
