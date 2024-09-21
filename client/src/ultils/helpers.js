import icons from "./icons"

const { MdOutlineStar, MdOutlineStarPurple500 } = icons
export const createSlug = string => string.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "").split(' ').join('-')
export const formatMoney = number => Number(number?.toFixed(1)).toLocaleString()

export const renderStartFromNumber = (number, size) => {
    if (!Number(number)) return
    // Truyen 4 => [1,1,1,0]
    // 2 => [1,1,0,0,0]

    const stars = []
    for (let i = 0; i < +number; i++) stars.push(<MdOutlineStarPurple500 color="orange" size={size || 16} />)
    for (let i = 5; i > +number; i--) stars.push(<MdOutlineStar color="orange" size={size || 16} />)
    return stars
}


// import icons from "./icons"

// const { MdOutlineStar, MdOutlineStarPurple500 } = icons

// // Hàm tạo slug từ chuỗi văn bản
// export const createSlug = string =>
//     string.toLowerCase()
//         .normalize('NFD')
//         .replace(/[\u0300-\u036f]/g, "")
//         .split(' ')
//         .join('-');

// // Hàm định dạng tiền tệ, kiểm tra giá trị 'number' trước khi gọi toFixed()
// export const formatMoney = number => {
//     // Kiểm tra nếu number không hợp lệ, trả về '0' hoặc giá trị mặc định
//     if (isNaN(number) || number === undefined || number === null) {
//         return "0";
//     }

//     return Number(number.toFixed(1)).toLocaleString();
// };

// // Hàm hiển thị các ngôi sao dựa trên số sao và kích thước (size)
// export const renderStartFromNumber = (number, size) => {
//     // Chuyển đổi number sang kiểu số và kiểm tra giá trị hợp lệ
//     const parsedNumber = Number(number);
//     if (!parsedNumber) return;

//     const stars = [];

//     // Hiển thị số sao đã được đánh giá (MdOutlineStarPurple500)
//     for (let i = 0; i < parsedNumber; i++) {
//         stars.push(<MdOutlineStarPurple500 color="orange" size={size || 16} />);
//     }

//     // Hiển thị các sao còn lại (MdOutlineStar)
//     for (let i = 5; i > parsedNumber; i--) {
//         stars.push(<MdOutlineStar color="orange" size={size || 16} />);
//     }

//     return stars;
// };
