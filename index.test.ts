// convert.test.js
import moment from 'moment-timezone';
import cronParser from 'cron-parser';
import { convert, getDaysHoursMinutes, addHours, addMinutes, addDayOfMonth, addDayOfWeek, addMonth } from './path/to/your/convert.js';

describe('Cron Timezone Conversion Tests', () => {
    test('convert should correctly adjust timezone for simple cron expression', () => {
        const cronExpression = '0 12 * * *'; // 每天中午 12 点
        const originalTimeZone = 'America/New_York';
        const targetTimeZone = 'Europe/London';

        const result = convert(cronExpression, originalTimeZone, targetTimeZone);
        expect(result).toBeDefined();
        expect(result).not.toBe(cronExpression); // 结果不应与原始表达式相同
    });

    test('getDaysHoursMinutes should calculate correct time differences', () => {
        const result = getDaysHoursMinutes(10, 30, 90); // 时间偏移 90 分钟
        expect(result.hours).toBe(1); // 应该增加 1 小时
        expect(result.minutes).toBe(0); // 分钟不变
        expect(result.days).toBe(0); // 没有跨天
    });

    test('addHours should handle hour overflow correctly', () => {
        expect(addHours([22], 3)).toEqual([1]); // 22 点加 3 小时应为 1 点
        expect(addHours([1], -3)).toEqual([22]); // 1 点减 3 小时应为 22 点
    });

    test('addMinutes should handle minute overflow correctly', () => {
        expect(addMinutes([50], 20)).toEqual([10]); // 50 分钟加 20 应为 10 分钟
        expect(addMinutes([10], -20)).toEqual([50]); // 10 分钟减 20 应为 50 分钟
    });

    test('addDayOfMonth should handle day overflow correctly', () => {
        expect(addDayOfMonth([30], 2)).toEqual([1]); // 30 日加 2 天应为 1 日
        expect(addDayOfMonth([1], -2)).toEqual(['L']); // 1 日减 2 天应为 'L'（最后一天）
    });

    test('addDayOfWeek should handle week day overflow correctly', () => {
        expect(addDayOfWeek([5], 2)).toEqual([0]); // 周五加 2 天应为周日（0 表示周日）
        expect(addDayOfWeek([0], -1)).toEqual([6]); // 周日减 1 天应为周六（6 表示周六）
    });

    test('addMonth should handle month overflow correctly', () => {
        expect(addMonth([12], 1)).toEqual([1]); // 12 月加 1 应为 1 月
        expect(addMonth([1], -1)).toEqual([12]); // 1 月减 1 应为 12 月
    });
});
