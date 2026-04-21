importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// These values are injected or you can hardcode them if they don't change
// But usually for a service worker we use the values from the config
firebase.initializeApp({
  messagingSenderId: "1095320997914", // From firebase-applet-config.json
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // Fallback icon
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
