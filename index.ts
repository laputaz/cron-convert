import moment from 'moment-timezone';
import cronParser from 'cron-parser';

// 将 `cronExpression` 从 `originalTimeZone` 转换到 `targetTimeZone`
export const convert = (
    cronExpression: string,
    originalTimeZone: string,
    targetTimeZone: string
): string => {
    // 解析 `cron` 表达式，获取字段
    const interval = cronParser.parseExpression(cronExpression);

    // 获取当前时间在原始时区和目标时区的时间
    const nowInOriginalTimeZone = moment.tz(moment(), originalTimeZone);
    const nowInTargetTimeZone = nowInOriginalTimeZone.clone().tz(targetTimeZone);

    // 计算时区偏移差（分钟）
    const timeZoneOffset =
        nowInTargetTimeZone.utcOffset() - nowInOriginalTimeZone.utcOffset();

    // 获取小时、分钟和天数的差异
    const timeDiff = getDaysHoursMinutes(
        interval.fields.hour[0],
        interval.fields.minute[0],
        timeZoneOffset
    );

    // 解析 `cron` 表达式的各个字段
    const cronExpressionFields = getFieldsCron(cronExpression);

    // 调整分钟和小时字段
    cronExpressionFields.minute = addMinutes(cronExpressionFields.minute, timeDiff.minutes);
    cronExpressionFields.hour = addHours(cronExpressionFields.hour, timeDiff.hours);

    // 调整月字段
    if (
        (cronExpressionFields.dayOfMonth.indexOf(1) >= 0 && timeDiff.days === -1) ||
        (cronExpressionFields.dayOfMonth.indexOf(31) >= 0 && timeDiff.days === 1)
    ) {
        cronExpressionFields.month = addMonth(cronExpressionFields.month, timeDiff.days);
    }

    // 调整日期和星期字段
    cronExpressionFields.dayOfMonth = addDayOfMonth(cronExpressionFields.dayOfMonth, timeDiff.days);
    cronExpressionFields.dayOfWeek = addDayOfWeek(cronExpressionFields.dayOfWeek, timeDiff.days);

    // 尝试设置调整后的 `cron` 字段
    try {
        return setFieldsCron(cronExpressionFields);
    } catch (err: any) {
        // 处理无效的日期定义错误
        if (err.message.includes('Invalid explicit day of month definition')) {
            cronExpressionFields.dayOfMonth = [1];
            cronExpressionFields.month = addMonth(cronExpressionFields.month, 1);
            return setFieldsCron(cronExpressionFields);
        }
        return cronExpression;
    }
};

// 计算小时、分钟和天数的差异
const getDaysHoursMinutes = (hour, minute, timeZoneOffset) => {
    const minutes = hour * 60 + minute;
    const newMinutes = minutes + timeZoneOffset;
    const diffHour = (Math.floor(newMinutes / 60) % 24) - hour;
    const diffMinutes = (newMinutes % 60) - minute;
    const diffDays = Math.floor(newMinutes / (60 * 24));

    return { hours: diffHour, minutes: diffMinutes, days: diffDays };
};

// 解析 `cron` 表达式字段
const getFieldsCron = (expression: string): any => {
    const interval = cronParser.parseExpression(expression);
    return JSON.parse(JSON.stringify(interval.fields));
};

// 设置 `cron` 字段并返回表达式
const setFieldsCron = (fields: any): string => {
    const second = getSeconds({ ...fields });
    return `${second} ${cronParser.fieldsToExpression(fields).stringify()}`;
};

// 获取秒字段
const getSeconds = (fields: any) => {
    fields.minute = fields.second;
    return cronParser.fieldsToExpression(fields).stringify().split(' ')[0];
};

// 调整小时字段
const addHours = (hours: number[], hour: number) =>
    hours.map((n) => {
        const h = n + hour;
        if (h > 23) return h - 24;
        if (h < 0) return h + 24;
        return h;
    });

// 调整分钟字段
const addMinutes = (minutes: number[], minute: number) =>
    minutes.map((n) => {
        const m = n + minute;
        if (m > 59) return m - 60;
        if (m < 0) return m + 60;
        return m;
    });

// 调整日期字段
const addDayOfMonth = (dayOfMonth: any[], day: number) => {
    if (dayOfMonth.length > 30) return dayOfMonth;
    return dayOfMonth.map((n) => {
        const d = n + day;
        if (d > 31 || n === 'L') return 1;
        if (d < 1) return 'L';
        return d;
    });
};

// 调整星期字段
const addDayOfWeek = (dayOfWeek: any[], day: number) => {
    if (dayOfWeek.length > 6) return dayOfWeek;
    return dayOfWeek.map((n) => {
        const d = n + day;
        if (d > 6) return 0;
        if (d < 0) return 6;
        return d;
    });
};

// 调整月份字段
const addMonth = (month: any[], mon: number) => {
    if (month.length > 11) return month;
    return month.map((n) => {
        const m = n + mon;
        if (m > 12) return 1;
        if (m < 1) return 12;
        return m;
    });
};
