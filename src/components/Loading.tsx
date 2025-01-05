const Loading: React.FC = (props: LoadingProps) => {
  return (
    <div>
      <div className="fixed left-0 right-0 top-0 bottom-0 z-[999] bg-[#00000040]"></div>
      <div className="fixed left-0 right-0 top-0 bottom-0 flex items-center justify-center z-[1000] text-[#888]">
        <LoadingElement {...props} />
      </div>
    </div>
  )
}

interface LoadingProps {
  fill?: string
  size?: number
}

export const LoadingElement = ({ fill, size }: LoadingProps) => (
  <svg viewBox="0 0 32 32" width={size || 100} height={size || 100} fill={fill || 'currentColor'}>
    <path transform="translate(2)" d="M0 12 V20 H4 V12z">
      <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0" keyTimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline" />
    </path>
    <path transform="translate(8)" d="M0 12 V20 H4 V12z">
      <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0.2" keyTimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline" />
    </path>
    <path transform="translate(14)" d="M0 12 V20 H4 V12z">
      <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0.4" keyTimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline" />
    </path>
    <path transform="translate(20)" d="M0 12 V20 H4 V12z">
      <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0.6" keyTimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline" />
    </path>
    <path transform="translate(26)" d="M0 12 V20 H4 V12z">
      <animate attributeName="d" values="M0 12 V20 H4 V12z; M0 4 V28 H4 V4z; M0 12 V20 H4 V12z; M0 12 V20 H4 V12z" dur="1.2s" repeatCount="indefinite" begin="0.8" keyTimes="0;.2;.5;1" keySplines="0.2 0.2 0.4 0.8;0.2 0.6 0.4 0.8;0.2 0.8 0.4 0.8" calcMode="spline" />
    </path>
  </svg>
)

export default Loading; 