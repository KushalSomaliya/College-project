export interface Activity {
  id: string
  type: 'application' | 'job_posted' | 'application_accepted' | 'application_rejected' | 'payment' | 'review'
  title: string
  description: string
  timestamp: Date
  icon?: React.ReactNode
}

interface RecentActivityProps {
  activities: Activity[]
}

import { formatRelativeTime } from '@/app/lib/utils'

export function RecentActivity({ activities }: RecentActivityProps) {

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'application_accepted':
      case 'payment':
        return 'text-green-600'
      case 'application_rejected':
        return 'text-red-600'
      default:
        return 'text-[var(--foreground)]'
    }
  }

  return (
    <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-[var(--foreground)]/60 text-sm">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)} bg-current`} />
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                  {activity.title}
                </h4>
                <p className="text-sm text-[var(--foreground)]/60 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-[var(--foreground)]/40 mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}