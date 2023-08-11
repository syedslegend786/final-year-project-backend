import mongoose from "mongoose"

export interface IFeedback {
    firstName: string
    lastName: string
    email: string
    mobileNumber: string
    message: string
}

const feedBackSchema = new mongoose.Schema<IFeedback>({
    firstName: String,
    email: String,
    lastName: String,
    message: String,
    mobileNumber: String
})
const FeedBack = mongoose.model("FeedBack", feedBackSchema)
export default FeedBack;