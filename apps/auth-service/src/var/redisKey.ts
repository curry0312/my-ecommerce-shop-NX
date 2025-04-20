export const redisKey = {
    otp: (email:string) => "otp:" + email,
    otp_cooldown: (email:string) => "otp_cooldown:" + email,
    otp_attempts: (email:string) => "otp_attempts:" + email,
    otp_fail_lock: (email:string) => "otp_fail_lock:" + email,
    otp_request_count: (email:string) => "otp_request_count:" + email,
    otp_spam_lock: (email:string) => "otp_spam_lock:" + email,
};