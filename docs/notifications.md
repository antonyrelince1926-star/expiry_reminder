# 5-Day Reminder Engine & Notification Architecture

## 1. The Central 5-Day Reminder Rule
For any tracked active product:
If:
```
(expiryDate - currentDate) <= 5 days AND (expiryDate >= currentDate)
```
a scheduled daily reminder is generated for the user:
- **5 Days Left**: `[Product Name] expires in 5 days.`
- **4 Days Left**: `[Product Name] expires in 4 days.`
- **3 Days Left**: `[Product Name] expires in 3 days.`
- **2 Days Left**: `[Product Name] expires in 2 days.`
- **Tomorrow**: `[Product Name] expires tomorrow.`
- **Today**: `🔴 [Product Name] expires today!`
- **Expired**: `[Product Name] expired yesterday.` (if post-expiry enabled)

## 2. Server-Side Execution (Tomcat Scheduler)
A `ServletContextListener` registers a `ScheduledExecutorService` running periodically:
```java
public class NotificationScheduler implements ServletContextListener {
    private ScheduledExecutorService scheduler;

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.scheduleAtFixedRate(new ReminderJob(), 0, 1, TimeUnit.HOURS);
    }
}
```
*Note on Tomcat Operation:* Scheduled background processing executes while Tomcat is active. For environments requiring zero-downtime execution when Tomcat is restarted, an external system cron job or task runner calling `/api/cron/reminders` can be configured.

## 3. Deduplication Guarantee
Notifications have a compound unique constraint in MySQL:
`UNIQUE (user_id, product_id, notification_date, notification_type)`
Ensuring users receive exactly one alert per day per milestone, never duplicate notifications.
