import redis from "../lib/redis.js";

const DELAY_MS = Number(
    process.env.EMAIL_SEND_DELAY_MS
);

const THROTTLE_KEY = "email:next-send-at";

export async function waitForEmailSendSlot() {
    while (true) {
        const now = Date.now();

        const result = await redis.eval(
            `
            local current = redis.call("GET", KEYS[1])

            if not current or tonumber(current) <= tonumber(ARGV[1]) then
                local nextAllowed = tonumber(ARGV[1]) + tonumber(ARGV[2])
                redis.call("SET", KEYS[1], nextAllowed)
                return 0
            end

            return tonumber(current) - tonumber(ARGV[1])
            `,
            1,
            THROTTLE_KEY,
            now,
            DELAY_MS
        );

        const waitTime = Number(result);

        if (waitTime <= 0) {
            return;
        }

        await new Promise((resolve) =>
            setTimeout(resolve, waitTime)
        );
    }
}