export default function Loading({ label = 'Đang tải dữ liệu' }: { label?: string }) { return <div className="loading-state" role="status" aria-label={label}><span className="spinner" /></div>; }
