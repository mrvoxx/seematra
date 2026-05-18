import webpush from 'web-push';
import User from '@/models/User';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:admin@seematra.com`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendAdminPushNotification(title: string, body: string, url: string = '/admin') {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
  
  try {
    const admins = await User.find({ role: 'admin' }).lean();
    
    for (const admin of admins) {
      if (admin.pushSubscriptions && admin.pushSubscriptions.length > 0) {
        for (const sub of admin.pushSubscriptions) {
          try {
            await webpush.sendNotification(
              sub,
              JSON.stringify({
                title,
                body,
                url,
                icon: '/favicon.ico'
              })
            );
          } catch (e: any) {
            console.error('Push failed to send to one sub, maybe expired:', e.statusCode);
            // In a robust system, we would remove the expired sub if e.statusCode === 410
          }
        }
      }
    }
  } catch (err) {
    console.error('Error fetching admins for push notification', err);
  }
}
