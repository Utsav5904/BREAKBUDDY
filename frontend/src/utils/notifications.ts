export type NotificationPermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export interface PermissionResult {
  success: boolean;
  permission: NotificationPermissionStatus;
  message?: string;
}

export function getNotificationPermissionStatus(): NotificationPermissionStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionStatus;
}

export async function requestNotificationPermission(): Promise<PermissionResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      success: false,
      permission: 'unsupported',
      message: 'Browser notifications are not supported on this device/browser. In-app alerts will be used instead.',
    };
  }

  try {
    if (Notification.permission === 'granted') {
      return {
        success: true,
        permission: 'granted',
        message: 'Notification permissions are active.',
      };
    }

    if (Notification.permission === 'denied') {
      return {
        success: false,
        permission: 'denied',
        message: 'Notifications are blocked in your browser settings. Please click the padlock icon in your URL bar to allow notifications.',
      };
    }

    // Attempt promise-based request with fallback for older browsers
    let permission: NotificationPermission;
    try {
      permission = await Notification.requestPermission();
    } catch {
      permission = await new Promise((resolve) => {
        Notification.requestPermission((p) => resolve(p));
      });
    }

    if (permission === 'granted') {
      return {
        success: true,
        permission: 'granted',
        message: 'Notifications enabled successfully!',
      };
    } else if (permission === 'denied') {
      return {
        success: false,
        permission: 'denied',
        message: 'Notification permission was denied. You can re-enable it in your browser address bar settings.',
      };
    } else {
      return {
        success: false,
        permission: 'default',
        message: 'Notification permission was dismissed.',
      };
    }
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return {
      success: false,
      permission: getNotificationPermissionStatus(),
      message: 'Could not prompt for notifications (may be restricted inside an embedded frame). In-app alerts remain active.',
    };
  }
}

export function sendBreakNotification(title: string, body: string) {
  // Always dispatch in-app event so BreakBuddy UI shows prominent alert
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('breakbuddy_notification', {
        detail: { title, body, timestamp: Date.now() },
      })
    );
  }

  // Try device haptic vibration
  triggerHaptic([200, 100, 200]);

  // System notification
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notification = new Notification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=128&auto=format&fit=crop&q=60',
        badge: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=96&auto=format&fit=crop&q=60',
        tag: 'break-buddy-reminder',
        silent: false,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.warn('Could not display system notification:', err);
    }
  }
}

export function triggerHaptic(duration: number | number[] = 50) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignore vibration error
    }
  }
}
