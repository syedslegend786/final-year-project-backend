import dotev from 'dotenv'
dotev.config()
import Stripe from 'stripe'

export const stripe = new Stripe('sk_test_51MUo50EhwvoKb8N0BQGlnofyht55sT6HNfjoZf2ZTcRt0K7PPoJNGMdmALVD8zIzaOzbT7pbVpw5SLk7bGXfkyWg00WDeAeJPe', {
    apiVersion: "2022-11-15",
    typescript: true
})

export const calculatePlaterformFee = (price: number): number => {
    return ((price * 30) / 100)
}

export const usdToCents = (price: number) => Math.round(Number(price.toFixed(2)) * 100)
export const centsToUsd = (price: number) => Math.round(Number(price.toFixed(2)) / 100)