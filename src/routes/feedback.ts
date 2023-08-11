import express from 'express'
import FeedBack, { IFeedback } from '../modals/Feedback.modal';

const router = express.Router();

router.post('/feedback/create', async (req, res) => {
    try {
        const { email, firstName, lastName, message, mobileNumber } = req.body as Partial<IFeedback>
        await FeedBack.create({
            email, firstName, lastName, message, mobileNumber
        })
        return res.status(200).json({ msg: "success." })
    } catch (error: any) {
        return res.status(500).json({ msg: error.message })
    }
})
router.get("/feedback/get", async (req, res) => {
    try {
        const feedBacks = await FeedBack.find({})
        return res.status(200).json(feedBacks)
    } catch (error: any) {
        return res.status(500).json({ msg: error.message })
    }
})

export default router;