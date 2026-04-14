'use client';

import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';

interface NotificationButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  showLabel?: boolean;
}

export function NotificationButton({
  variant = 'outline',
  showLabel = true,
}: NotificationButtonProps) {
  const { status, subscribe, unsubscribe } = usePushNotifications();

  if (status === 'unsupported') return null;

  const handleClick = async () => {
    if (status === 'subscribed') {
      const ok = await unsubscribe();
      if (ok) toast.success('Push notifications disabled');
    } else {
      const ok = await subscribe();
      if (ok) toast.success('Push notifications enabled! You\'ll get daily habit reminders.');
      else if (status === 'default') toast.error('Could not enable notifications');
    }
  };

  const icons = {
    loading:    <Loader2 className="h-4 w-4 animate-spin" />,
    subscribed: <BellRing className="h-4 w-4 text-orange-500" />,
    denied:     <BellOff  className="h-4 w-4 text-muted-foreground" />,
    default:    <Bell     className="h-4 w-4" />,
    unsupported:<Bell     className="h-4 w-4" />,
  };

  const labels = {
    loading:    'Loading…',
    subscribed: 'Notifications On',
    denied:     'Notifications Blocked',
    default:    'Enable Notifications',
    unsupported:'Not Supported',
  };

  return (
    <Button
      variant={variant}
      size={showLabel ? 'default' : 'icon'}
      onClick={handleClick}
      disabled={status === 'loading' || status === 'denied'}
      title={labels[status]}
    >
      {icons[status]}
      {showLabel && <span className="ml-2">{labels[status]}</span>}
    </Button>
  );
}
