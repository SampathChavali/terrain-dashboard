import { Phone, X } from 'lucide-react'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="card w-full max-w-sm relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-elevated cursor-pointer"
        >
          <X className="w-4 h-4 text-muted" />
        </button>
        <h2 className="text-lg font-bold text-text mb-2">Help & Support</h2>
        <p className="text-sm text-muted mb-4">
          Need assistance with your tasks or daily updates? Reach out directly.
        </p>
        <div className="flex items-center gap-3 p-4 bg-green-bg rounded-xl">
          <div className="w-10 h-10 rounded-full bg-green-primary flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">2272599116</p>
            <p className="text-xs text-muted">USA</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-primary w-full justify-center mt-4">
          Got it
        </button>
      </div>
    </div>
  )
}
