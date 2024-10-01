## cron 时区转换

例如，将 UTC 时间转换成美国亚利桑那时间：

```js
convert("0 0 8-10 * * *", "UTC", "US/Arizona");
// "0 0 1-3 * * *"
```
