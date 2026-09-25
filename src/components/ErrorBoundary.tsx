import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KongKaaL Uncaught React Error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07080b] text-white flex items-center justify-center p-4 font-sans">
          <div className="max-w-xl w-full bg-[#101420] border-2 border-red-600/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-600/20 border border-red-600/40 rounded-xl text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-gaming text-white uppercase tracking-wide">
                  KongKaaL System Error Guard
                </h2>
                <p className="text-xs text-red-400 font-medium">
                  একটি অপ্রত্যাশিত জাভাস্ক্রিপ্ট এরর ধরা পড়েছে (Caught Runtime Exception)
                </p>
              </div>
            </div>

            <div className="bg-[#080a10] border border-red-900/30 rounded-xl p-4 font-mono text-xs text-red-300 overflow-x-auto">
              <p className="font-bold text-red-400 mb-1">
                {this.state.error?.name}: {this.state.error?.message || 'Unknown Runtime Error'}
              </p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[10px] text-gray-400 mt-2 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={this.handleReset}
                className="btn-kong-red px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>রিফ্রেশ ও পুনরায় চেষ্টা করুন</span>
              </button>
              <span className="text-[10px] text-gray-500">KongKaaL Gaming Platform</span>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
