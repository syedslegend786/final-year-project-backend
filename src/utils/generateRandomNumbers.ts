import otpGenerator from 'otp-generator'
interface GenerateRandomeNumberProps {
    length?: number
}
export const generateRandomeNumber = ({ length = 6 }: GenerateRandomeNumberProps): string => {
    return otpGenerator.generate(length, { upperCaseAlphabets: false, specialChars: false });
}