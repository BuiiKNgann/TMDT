import icons from "./icons"

const { MdOutlineStar, MdOutlineStarPurple500 } = icons



export const createSlug = string => string.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").split(' ').join('-')
export const formatMoney = number => Number(number.toFixed(1)).toLocaleString()

export const renderStartFromNumber = (number) => {
    if (!Number(number)) return
    // Truyen 4 => [1,1,1,0]
    // 2 => [1,1,0,0,0]

    const stars = []
    for (let i = 0; i < +number; i++) stars.push(<MdOutlineStarPurple500 color="orange" />)
    for (let i = 5; i > +number; i--) stars.push(<MdOutlineStar color="orange" />)
    return stars
}