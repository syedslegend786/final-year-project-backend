import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2022-11-15",
    typescript: true
})

export const calculatePlaterformFee = (price: number): number => {
    return ((price * 30) / 100)
}

export const usdToCents = (price: number) => Math.round(Number(price.toFixed(2)) * 100)
export const centsToUsd = (price: number) => Math.round(Number(price.toFixed(2)) / 100)