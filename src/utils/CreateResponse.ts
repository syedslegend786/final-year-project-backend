import { Response } from "express"

interface CreateResponseProps {
    data: any,
    res: Response,
    status: 200 | 400 | 500
}
export const CreateResponse = ({ data, res, status }: CreateResponseProps) => {
    return res.status(status).json(data)
}