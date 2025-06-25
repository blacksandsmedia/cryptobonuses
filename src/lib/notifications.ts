// Store active SSE connections
export const connections = new Set<ReadableStreamDefaultController>();

// Broadcast notification to all connected clients
export function broadcastNotification(notification: {
  id: string;
  casinoName: string;
  casinoLogo: string;
  casinoSlug: string;
  bonusTitle: string;
  bonusCode?: string;
  createdAt: string;
}) {
  const data = JSON.stringify(notification);
  
  connections.forEach(controller => {
    try {
      controller.enqueue(`data: ${data}\n\n`);
    } catch (error) {
      // Remove dead connections
      connections.delete(controller);
    }
  });
  
  console.log(`[SSE] Broadcasted notification to ${connections.size} clients:`, notification.casinoName);
} 